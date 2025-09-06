import { Node, Edge } from 'reactflow';
import { Transaction } from '@/lib/mockData';

const API_BASE_URL = 'https://taktile-engine-backend.onrender.com';

export interface StrategyBlueprint {
  nodes: Node[];
  edges: Edge[];
}

export interface ExecutionTrace {
  decision: 'APPROVE' | 'BLOCK' | 'REVIEW';
  path: { nodeId: string, edgeId?: string }[];
  node_outputs: Record<string, unknown>;
  precision: number;
  recall: number;
}

export interface ProfileData {
    name: string;
    customerId: string;
    avgTransaction: number;
    activityLevel: number;
    typicalCategories: string[];
}

export const api = {
  executeStrategy: async (blueprint: StrategyBlueprint, transaction: Transaction): Promise<ExecutionTrace> => {
    const response = await fetch(`${API_BASE_URL}/strategy/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blueprint, transaction }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend execution error:", errorText);
      throw new Error('Backend execution failed: The command was not acknowledged.');
    }
    
    return response.json();
  },

  getNextTransaction: async (): Promise<Transaction> => {
    const response = await fetch(`${API_BASE_URL}/transactions/next`);
    if (!response.ok) {
      throw new Error('Failed to fetch next transaction from backend.');
    }
    return response.json();
  },
  
  getCustomerProfile: async (customerId: number): Promise<ProfileData> => {
    const response = await fetch(`${API_BASE_URL}/profiles/${customerId}`);
    if (!response.ok) {
        if (response.status === 404) {
            console.warn(`Profile not found for customer ${customerId}. Returning default.`);
            return {
                name: `Unknown User #${customerId}`, customerId: String(customerId),
                avgTransaction: 0, activityLevel: 0, typicalCategories: ["N/A"]
            };
        }
        throw new Error(`Failed to fetch profile for customer ${customerId}`);
    }
    return response.json();
  },

  resetSimulation: async (): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE_URL}/simulation/reset`, { method: 'POST' });
        if (!response.ok) {
            console.error("Failed to reset simulation state on the backend.");
        }
    } catch (error) {
        console.error("Error sending reset command to backend:", error);
    }
  }
};