import logging
from collections import deque
from typing import Dict, List, Any, Tuple
from .schemas import StrategyBlueprint, Transaction, Node, ExecutionTrace, ExecutionStep
from .logic.registry import NODE_LOGIC_REGISTRY
from google.cloud import firestore
from google.cloud.firestore_v1.base_query import FieldFilter

logger = logging.getLogger(__name__)

# init firestore
db = firestore.Client()
METRICS_DOC_REF = db.collection('simulation_metrics').document('singleton')

class ExecutionEngine:

    def __init__(self):
        logger.info("ExecutionEngine initialized (using Firestore for state)")

    def _get_metrics(self) -> Dict[str, int]:
        """Loads metrics from Firestore. Returns defaults if document doesn't exist."""
        doc = METRICS_DOC_REF.get()
        if not doc.exists:
            return {"true_positives": 0, "false_positives": 0, "false_negatives": 0}
        return doc.to_dict()

    def reset(self):
        """Resets the metrics in Firestore to zero."""
        logger.info("Resetting persistent metrics in Firestore.")
        METRICS_DOC_REF.set({
            "true_positives": 0,
            "false_positives": 0,
            "false_negatives": 0
        })

    def _calculate_metrics(self, metrics: Dict[str, int]) -> Tuple[float, float]:
        """Calculates precision and recall from the current metrics."""
        tp = metrics.get("true_positives", 0)
        fp = metrics.get("false_positives", 0)
        fn = metrics.get("false_negatives", 0)
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0

        return precision, recall

    def execute(self, blueprint: StrategyBlueprint, transaction: Transaction) -> ExecutionTrace:
        """
        Traverses the strategy graph using a topological sort to handle complex,
        branching logic with nodes like AND/OR that have multiple inputs.
        """

        nodes_map: Dict[str, Node] = {node.id: node for node in blueprint.nodes}
        
        # 1. Build Graph Representation
        adj: Dict[str, List[Tuple[str, str | None]]] = {node_id: [] for node_id in nodes_map}
        rev_adj: Dict[str, List[str]] = {node_id: [] for node_id in nodes_map}
        in_degree: Dict[str, int] = {node_id: 0 for node_id in nodes_map}

        for edge in blueprint.edges:
            # Ensure keys exist before appending
            if edge.source in adj and edge.target in rev_adj:
                adj[edge.source].append((edge.target, edge.sourceHandle))
                rev_adj[edge.target].append(edge.source)
                in_degree[edge.target] += 1

        # 2. Topological Sort (Kahn's Algorithm)
        queue = deque([node_id for node_id, degree in in_degree.items() if degree == 0])
        exec_order: List[str] = []
        while queue:
            u = queue.popleft()
            exec_order.append(u)
            for v, _ in adj.get(u, []):
                in_degree[v] -= 1
                if in_degree[v] == 0:
                    queue.append(v)
        
        if len(exec_order) != len(nodes_map):
            logger.warning("Graph may contain cycles or disconnected subgraphs; not all nodes will be executed")

        # 3. State-driven Execution
        node_outputs: Dict[str, Any] = {}
        node_results: Dict[str, bool] = {}
        path_taken: Dict[str, str | None] = {}
        final_decision_node_id: str | None = None

        for node_id in exec_order:
            current_node = nodes_map[node_id]
            node_label = current_node.data.get('label')
            node_type = current_node.data.get('type')

            if node_type == 'Action':
                parent_ids = rev_adj.get(node_id, [])
                is_triggered = False
                # An Action node is triggered if ANY of its parent paths were validly taken
                for p_id in parent_ids:
                    if p_id in path_taken:
                        edge = next((e for e in blueprint.edges if e.source == p_id and e.target == node_id), None)
                        if edge and (path_taken.get(p_id) is None or path_taken.get(p_id) == edge.sourceHandle):
                            is_triggered = True
                            break # A valid path to this action has been found
                
                if is_triggered and not final_decision_node_id:
                    final_decision_node_id = node_id # Set the final decision
                
                continue # Always skip to the next node after processing an Action

            logic_function = NODE_LOGIC_REGISTRY.get(node_label)
            
            # Propagate path for sequential nodes without specific logic
            if not logic_function:
                 if node_type == 'Input':
                     node_outputs[node_id] = {"Transaction Amount": f"€{transaction.amount:.2f}"}
                 path_taken[node_id] = None
                 continue

            # Prepare inputs for the logic function
            kwargs = {}
            if node_type == 'Logic':
                parent_ids = rev_adj.get(node_id, [])
                kwargs['parent_results'] = {p_id: node_results.get(p_id, False) for p_id in parent_ids}

            # Execute logic function
            handle, output_data = logic_function(current_node, transaction, **kwargs)
            if output_data:
                node_outputs[node_id] = {**node_outputs.get(node_id, {}), **output_data}
            
            path_taken[node_id] = handle
            if node_type in ['Rule', 'Logic']:
                node_results[node_id] = True if handle == 'true' else False
        
        # 4. Backtrack to build the final path trace
        path: List[ExecutionStep] = []
        if final_decision_node_id:
            curr = final_decision_node_id
            # Use a queue for breadth-first-search-like parent traversal
            q = deque([curr])
            visited_for_path = {curr}

            while q:
                node = q.popleft()
                path.append(ExecutionStep(nodeId=node))
                parents = rev_adj.get(node, [])
                for p_id in parents:
                    if p_id in path_taken and p_id not in visited_for_path:
                        edge = next((e for e in blueprint.edges if e.source == p_id and e.target == node), None)
                        if edge and (path_taken.get(p_id) is None or path_taken.get(p_id) == edge.sourceHandle):
                             q.append(p_id)
                             visited_for_path.add(p_id)

        # Reconstruct edges in the final path
        path_nodes = {step.nodeId for step in path}
        for step in path:
            # Find an edge connecting this node to another node within the path
            parent_in_path = next((p for p in rev_adj.get(step.nodeId, []) if p in path_nodes), None)
            if parent_in_path:
                edge = next((e for e in blueprint.edges if e.source == parent_in_path and e.target == step.nodeId), None)
                if edge:
                    step.edgeId = edge.id

        path.reverse()
        decision = nodes_map[final_decision_node_id].data.get('label', 'REVIEW') if final_decision_node_id else 'REVIEW'

        # update counters in Firestore
        update_payload = {}
        if decision == 'BLOCK' and transaction.isFraud:
            update_payload = {"true_positives": firestore.Increment(1)}
        elif decision == 'BLOCK' and not transaction.isFraud:
            update_payload = {"false_positives": firestore.Increment(1)}
        elif decision == 'APPROVE' and transaction.isFraud:
            update_payload = {"false_negatives": firestore.Increment(1)}
        
        if update_payload:
            METRICS_DOC_REF.set(update_payload, merge=True)

        # get the latest metrics and calculate precision/recall
        current_metrics = self._get_metrics()
        precision, recall = self._calculate_metrics(current_metrics)


        return ExecutionTrace(decision=decision, path=path, node_outputs=node_outputs, precision=precision, recall=recall)