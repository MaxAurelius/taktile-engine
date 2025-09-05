import { create } from 'zustand';
import { Connection, Edge, EdgeChange, Node, NodeChange, addEdge, OnNodesChange, OnEdgesChange, OnConnect, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { Transaction } from '@/lib/mockData';
import { StrategyBlueprint, api } from '@/services/api';

export type Decision = 'APPROVE' | 'BLOCK' | 'REVIEW';
type SimulationStatus = 'stopped' | 'running' | 'paused';

type RFState = {
  nodes: Node[];
  edges: Edge[];
  isLiveMode: boolean;
  simulationStatus: SimulationStatus;
  precision: number;
  recall: number;
  activeNodeId: string | null;
  activeEdgeId: string | null;
  currentTransaction: Transaction | null;
  lastDecision: Decision | null;
  nodeOutputs: Record<string, any>;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: Node) => void;
  deleteNodeAndEdges: (nodeId: string) => void;
  runSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  updateNodeData: (nodeId: string, data: any) => void;
  processTransactionResult: (decision: Decision, isFraud: boolean, outputs: Record<string, any>, precision: number, recall: number) => void;
  setActiveElements: (nodeId: string | null, edgeId: string | null) => void;
  setCurrentTransaction: (transaction: Transaction | null) => void;
  generateBlueprint: () => StrategyBlueprint;
};

const useCanvasStore = create<RFState>((set, get) => ({
  nodes: [],
  edges: [],
  isLiveMode: false,
  simulationStatus: 'stopped',
  precision: 0.0,
  recall: 0.0,
  activeNodeId: null,
  activeEdgeId: null,
  currentTransaction: null,
  lastDecision: null,
  nodeOutputs: {},

  onNodesChange: (changes: NodeChange[]) => {
    if (get().isLiveMode) return;
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    if (get().isLiveMode) return;
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection: Connection) => {
    if (get().isLiveMode) return;
    if (!connection.source || !connection.target) return;

    const sourceNode = get().nodes.find(node => node.id === connection.source);

    if (sourceNode?.data.type === 'Input') {
        const newEdge: Edge = {
            id: `e-${connection.source}-${connection.target}-${Math.random()}`,
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle,
        };
        set({ edges: [...get().edges, newEdge] });
        return;
    }
    set({ edges: addEdge(connection, get().edges) });
  },

  addNode: (node: Node) => {
    if (get().isLiveMode) return;
    set({ nodes: [...get().nodes, node] });
  },
  deleteNodeAndEdges: (nodeId: string) => {
    if (get().isLiveMode) return;
    set({
      nodes: get().nodes.filter(node => node.id !== nodeId),
      edges: get().edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId),
    });
  },
  runSimulation: () => set({ 
    simulationStatus: 'running',
    isLiveMode: true 
  }),
  pauseSimulation: () => set({ 
    simulationStatus: 'paused',
    isLiveMode: false 
  }),
  resetSimulation: () => {
    api.resetSimulation(); 
    set({ 
      simulationStatus: 'stopped', 
      isLiveMode: false,
      nodes: [], 
      edges: [],
      precision: 0.0,
      recall: 0.0,
      activeNodeId: null,
      activeEdgeId: null,
      currentTransaction: null,
      lastDecision: null,
      nodeOutputs: {},
    });
  },
  updateNodeData: (nodeId, data) => {
    if (get().isLiveMode) return;
    set({
      nodes: get().nodes.map(node => node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node),
    });
  },
  
  processTransactionResult: (decision, isFraud, outputs, precision, recall) => {
    set({ 
        lastDecision: decision,
        nodeOutputs: outputs,
        precision: precision,
        recall: recall
    });
  },

  setActiveElements: (nodeId, edgeId) => set({ activeNodeId: nodeId, activeEdgeId: edgeId }),
  setCurrentTransaction: (transaction) => set({ currentTransaction: transaction }),
  
  generateBlueprint: (): StrategyBlueprint => {
    const { nodes, edges } = get();
    return { nodes, edges };
  },
}));

export default useCanvasStore;