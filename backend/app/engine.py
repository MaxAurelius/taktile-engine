import logging
from collections import deque
from typing import Dict, List, Any, Tuple
from .schemas import StrategyBlueprint, Transaction, Node, ExecutionTrace, ExecutionStep
from .logic.registry import NODE_LOGIC_REGISTRY

logger = logging.getLogger(__name__)

class ExecutionEngine:

    def __init__(self):
        self.true_positives = 0
        self.false_positives = 0
        self.false_negatives = 0
        logger.info("ExecutionEngine initialized with performance tracking.")

    def reset(self):
        """Resets the performance metrics to zero."""
        self.true_positives = 0
        self.false_positives = 0
        self.false_negatives = 0
        logger.info("ExecutionEngine state has been reset.")

    def _update_metrics(self, decision: str, is_fraud: bool):
        """Updates the confusion matrix based on the outcome."""
        if decision == 'BLOCK' and is_fraud:
            self.true_positives += 1
        elif decision == 'BLOCK' and not is_fraud:
            self.false_positives += 1
        elif decision == 'APPROVE' and is_fraud:
            self.false_negatives += 1

    def _calculate_metrics(self) -> Tuple[float, float]:
        """Calculates precision and recall from the current state."""
        precision = self.true_positives / (self.true_positives + self.false_positives) if (self.true_positives + self.false_positives) > 0 else 0.0
        recall = self.true_positives / (self.true_positives + self.false_negatives) if (self.true_positives + self.false_negatives) > 0 else 0.0
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

        self._update_metrics(decision, transaction.isFraud)
        precision, recall = self._calculate_metrics()

        return ExecutionTrace(decision=decision, path=path, node_outputs=node_outputs, precision=precision, recall=recall)