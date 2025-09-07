// src/lib/default-layout.ts

import { Node, Edge } from 'reactflow';
import {
  ArrowDownTrayIcon,
  RectangleStackIcon,
  CpuChipIcon,
  ScaleIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

export const defaultNodes: Node[] = [
  // Column 1: Input & Features
  {
    id: 'node-1',
    type: 'strategyNode',
    position: { x: 50, y: 150 },
    data: { label: 'Transaction Stream', type: 'Input', icon: ArrowDownTrayIcon },
  },
  {
    id: 'node-2',
    type: 'strategyNode',
    position: { x: 350, y: 0 },
    data: { label: 'Spending Deviation', type: 'Feature', icon: RectangleStackIcon },
  },
  {
    id: 'node-3',
    type: 'strategyNode',
    position: { x: 350, y: 100 },
    data: { label: 'Velocity Counter (24h)', type: 'Feature', icon: RectangleStackIcon },
  },
  {
    id: 'node-4',
    type: 'strategyNode',
    position: { x: 350, y: 200 },
    data: { label: 'Terminal Risk Score', type: 'Feature', icon: RectangleStackIcon },
  },
  {
    id: 'node-5',
    type: 'ruleNode',
    position: { x: 350, y: 350 },
    data: { 
      label: 'Amount Gate', 
      type: 'Rule', 
      icon: ScaleIcon, 
      value: 50, 
      outputs: [{ id: 'true', name: '>= Amount' }, { id: 'false', name: '< Amount' }] 
    },
  },

  // Column 2: Models & Logic
  {
    id: 'node-6',
    type: 'modelNode',
    position: { x: 650, y: 100 },
    data: { label: 'XGBoost Model', type: 'Model', icon: CpuChipIcon },
  },
  {
    id: 'node-7',
    type: 'ruleNode',
    position: { x: 950, y: 100 },
    data: { 
      label: 'Threshold Gate', 
      type: 'Rule', 
      icon: ScaleIcon, 
      value: 0.001, 
      outputs: [{ id: 'true', name: '>= Threshold' }, { id: 'false', name: '< Threshold' }] 
    },
  },
  {
    id: 'node-8',
    type: 'logicNode',
    position: { x: 1250, y: 350 },
    data: { label: 'AND Gate', type: 'Logic', icon: CodeBracketIcon },
  },

  // Column 3: Actions
  {
    id: 'node-9',
    type: 'strategyNode',
    position: { x: 1550, y: 100 },
    data: { label: 'APPROVE', type: 'Action', icon: CheckCircleIcon },
  },
  {
    id: 'node-10',
    type: 'strategyNode',
    position: { x: 1550, y: 300 },
    data: { label: 'BLOCK', type: 'Action', icon: XCircleIcon },
  },
  {
    id: 'node-11',
    type: 'strategyNode',
    position: { x: 1550, y: 400 },
    data: { label: 'REVIEW', type: 'Action', icon: QuestionMarkCircleIcon },
  },
];

export const defaultEdges: Edge[] = [
  // Transaction Stream to Features
  { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'smoothstep' },
  { id: 'edge-2', source: 'node-1', target: 'node-3', type: 'smoothstep' },
  { id: 'edge-3', source: 'node-1', target: 'node-4', type: 'smoothstep' },
  { id: 'edge-4', source: 'node-1', target: 'node-5', type: 'smoothstep' },
  
  // Features to XGBoost Model
  { id: 'edge-5', source: 'node-2', target: 'node-6', targetHandle: 'spending_deviation', type: 'smoothstep' },
  { id: 'edge-6', source: 'node-3', target: 'node-6', targetHandle: 'velocity_counter_24h', type: 'smoothstep' },
  { id: 'edge-7', source: 'node-4', target: 'node-6', targetHandle: 'terminal_risk_score', type: 'smoothstep' },

  // Model to Threshold Gate
  { id: 'edge-8', source: 'node-6', target: 'node-7', type: 'smoothstep' },

  // Threshold Gate to AND Gate & APPROVE
  { id: 'edge-9', source: 'node-7', sourceHandle: 'false', target: 'node-9', type: 'smoothstep' },
  { id: 'edge-10', source: 'node-7', sourceHandle: 'true', target: 'node-8', targetHandle: 'input_a', type: 'smoothstep' },
  
  // Amount Gate to AND Gate
  { id: 'edge-11', source: 'node-5', sourceHandle: 'true', target: 'node-8', targetHandle: 'input_b', type: 'smoothstep' },
  
  // AND Gate to Actions
  { id: 'edge-12', source: 'node-8', sourceHandle: 'true', target: 'node-10', type: 'smoothstep' },
  { id: 'edge-13', source: 'node-8', sourceHandle: 'false', target: 'node-11', type: 'smoothstep' },
];