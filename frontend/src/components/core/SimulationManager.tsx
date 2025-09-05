"use client";

import { useEffect, useRef } from 'react';
import useCanvasStore, { Decision } from '@/store/canvasStore';
import { api, ExecutionTrace } from '@/services/api';
import { Transaction } from '@/lib/mockData';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const animateTrace = async (
  trace: ExecutionTrace,
  setActiveElements: (nodeId: string | null, edgeId: string | null) => void
) => {
  setActiveElements(null, null);
  await sleep(200);

  for (const step of trace.path) {
    setActiveElements(step.nodeId, null);
    await sleep(400);

    if (step.edgeId) {
      setActiveElements(step.nodeId, step.edgeId);
      await sleep(400);
    }
  }

  await sleep(400);
  setActiveElements(null, null);
};

const SimulationManager = () => {
  const { 
    simulationStatus,
    nodes,
    edges,
    processTransactionResult,
    setActiveElements,
    setCurrentTransaction 
  } = useCanvasStore();

  const isProcessingRef = useRef(false);

  useEffect(() => {
    let isCancelled = false;
    
    const runApiLoop = async () => {
      if (simulationStatus !== 'running' || isProcessingRef.current || isCancelled) return;
      
      isProcessingRef.current = true;
      
      try {
        const blueprint = { nodes, edges };
        const transaction: Transaction = await api.getNextTransaction();
        setCurrentTransaction(transaction);
        
        const trace: ExecutionTrace = await api.executeStrategy(blueprint, transaction);
        
        if (!isCancelled) {
          processTransactionResult(
              trace.decision as Decision, 
              transaction.isFraud, 
              trace.node_outputs,
              trace.precision,
              trace.recall
          );
          
          await animateTrace(trace, setActiveElements);
        }
      } catch (error) {
        console.error("Simulation loop error:", error);
      } finally {
        if (!isCancelled) {
          isProcessingRef.current = false;
        }
      }
    };

    let intervalId: NodeJS.Timeout | null = null;
    if (simulationStatus === 'running') {
      intervalId = setInterval(runApiLoop, 3000); 
    } else {
      setCurrentTransaction(null);
    }

    return () => {
      isCancelled = true;
      if (intervalId) clearInterval(intervalId);
      isProcessingRef.current = false;
    };
  }, [simulationStatus, nodes, edges, processTransactionResult, setActiveElements, setCurrentTransaction]);

  return null;
};

export default SimulationManager;