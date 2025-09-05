"use client";

import React, { useCallback, useMemo } from 'react';
import ReactFlow, { Controls, Background, Node, Edge, useReactFlow, Connection } from 'reactflow';
import 'reactflow/dist/style.css';

import useCanvasStore from '@/store/canvasStore';
import { componentLibrary } from '../layout/Sidebar';
import StrategyNode from '../nodes/StrategyNode';
import RuleNode from '../nodes/RuleNode';
import LogicNode from '../nodes/LogicNode';
import ModelNode from '../nodes/ModelNode';

const nodeTypes = { 
  strategyNode: StrategyNode,
  ruleNode: RuleNode,
  logicNode: LogicNode,
  modelNode: ModelNode,
};

let id = 0;
const getId = () => `dndnode_${id++}`;

const StrategyCanvas = () => {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    addNode, 
    activeEdgeId,
    isLiveMode,
  } = useCanvasStore();
  
  const { project } = useReactFlow();

  const animatedEdges = useMemo(() => {
    return edges.map(edge => ({
      ...edge,
      animated: edge.id === activeEdgeId,
      style: { 
        stroke: edge.id === activeEdgeId ? '#2563eb' : '#a1a1aa', 
        strokeWidth: edge.id === activeEdgeId ? 3 : 2 
      }
    }));
  }, [edges, activeEdgeId]);
  
  const isValidConnection = useCallback((connection: Connection) => {
    const sourceNode = nodes.find(node => node.id === connection.source);
    const targetNode = nodes.find(node => node.id === connection.target);

    // 1. Basic validation
    if (!sourceNode || !targetNode || sourceNode.id === targetNode.id) return false;

    // 2. Source-specific Rules
    if (sourceNode.data.type === 'Action') return false; // Action nodes cannot be a source

    // 3. Target-specific Rules
    if (targetNode.data.type === 'Input') return false; // Input nodes cannot be a target
    
    const handleIsTaken = edges.some(e => e.target === connection.target && e.targetHandle === connection.targetHandle);
    if (handleIsTaken) return false;

    const isMultiInputNode = targetNode.data.type === 'Logic' || targetNode.data.type === 'Model';
    if (!isMultiInputNode) {
        if (edges.some(edge => edge.target === connection.target)) {
            return false;
        }
    }
    
    // 4. Model-specific Rule
    if (targetNode.data.type === 'Model') {
        const sourceLabel = sourceNode.data.label;
        const handleId = connection.targetHandle;
        const mapping: Record<string, string> = {
            'spending_deviation': 'Spending Deviation',
            'velocity_counter_24h': 'Velocity Counter (24h)',
            'terminal_risk_score': 'Terminal Risk Score'
        };
        if (handleId && mapping[handleId] !== sourceLabel) return false;
    }

    return true;
  }, [nodes, edges]);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (isLiveMode) return;
      
      event.preventDefault();
      const nodeLabel = event.dataTransfer.getData('application/reactflow');
      if (!nodeLabel) return;

      const componentDetails = componentLibrary
        .flatMap(group => group.items)
        .find(item => item.label === nodeLabel);
      if (!componentDetails) return;
      
      const position = project({ x: event.clientX - 430, y: event.clientY - 80 });
      
      const nodeTypeMap: { [key: string]: string } = {
          'Rule': 'ruleNode',
          'Logic': 'logicNode',
          'Model': 'modelNode',
          'Input': 'strategyNode',
          'Feature': 'strategyNode',
          'Action': 'strategyNode',
      };

      const newNode: Node = {
        id: getId(),
        type: nodeTypeMap[componentDetails.type] || 'strategyNode',
        position,
        data: { 
          label: componentDetails.label,
          type: componentDetails.type,
          icon: componentDetails.icon,
          ...(componentDetails.type === 'Rule' && { value: 0, outputs: (componentDetails as any).outputs }),
        },
      };

      addNode(newNode);
    },
    [project, addNode, isLiveMode]
  );
  
  return (
    <div className="h-full w-full outline-none" tabIndex={0}>
      <ReactFlow
        nodes={nodes}
        edges={animatedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={(event) => event.preventDefault()}
        nodeTypes={nodeTypes}
        isValidConnection={isValidConnection}
        fitView
        nodesDraggable={!isLiveMode}
        nodesConnectable={!isLiveMode}
        elementsSelectable={!isLiveMode}
        panOnDrag={true}
        zoomOnScroll={true}
        className={isLiveMode ? 'cursor-not-allowed' : ''}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

import { ReactFlowProvider } from 'reactflow';

const CanvasWithProvider = () => (
  <ReactFlowProvider>
    <StrategyCanvas />
  </ReactFlowProvider>
);

export default CanvasWithProvider;
