"use client";

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import useCanvasStore from '@/store/canvasStore';
import { XMarkIcon, CpuChipIcon } from '@heroicons/react/24/solid';
import NodeOutputDisplay from './NodeOutputDisplay';

const modelInputs = [
    { id: 'spending_deviation', name: 'Spending Deviation' },
    { id: 'velocity_counter_24h', name: 'Velocity Counter (24h)' },
    { id: 'terminal_risk_score', name: 'Terminal Risk Score' }
];

const ModelNode = ({ id, data, selected }: NodeProps<{ label: string, type: string, icon: React.ElementType }>) => {
  const { 
    activeNodeId, 
    deleteNodeAndEdges, 
    nodeOutputs = {},
  } = useCanvasStore();

  const isActive = activeNodeId === id;
  const outputData = nodeOutputs[id];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNodeAndEdges(id);
  };

  const borderStyle = selected
    ? 'border-sky-500 ring-2 ring-sky-300'
    : isActive
    ? 'border-blue-500 shadow-lg shadow-blue-500/50'
    : 'border-gray-300';

  return (
    <div className={`group relative rounded-md border-2 bg-white shadow-md w-60 transition-all ${borderStyle}`}>
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 z-20 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
        title="Delete Node"
      >
        <XMarkIcon className="h-3 w-3" />
      </button>

      <div className="p-3 border-b border-gray-200 text-center">
        <div className="flex items-center justify-center space-x-2">
            <CpuChipIcon className="h-5 w-5 text-gray-500" />
            <p className="text-sm font-semibold text-gray-800">{data.label}</p>
        </div>
      </div>
      
      {/* 2. DEDICATED INPUTS SECTION  */}
      <div 
        className="relative border-b border-gray-200 bg-gray-50/50" 
        style={{ height: `${modelInputs.length * 28}px`, padding: '8px 0' }}
      >
        {modelInputs.map((input, index) => {
          const topPosition = `${(100 / modelInputs.length) * (index + 0.5)}%`;
          return (
              <React.Fragment key={input.id}>
                  <div 
                    className="absolute text-xs text-gray-600"
                    style={{ top: topPosition, left: '1rem', transform: 'translateY(-50%)' }}
                  >
                    {input.name}
                  </div>
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={input.id}
                    className="!bg-gray-400"
                    style={{ top: topPosition }}
                  />
              </React.Fragment>
          )
        })}
      </div>

      {/* 3. OUTPUTS DISPLAY SECTION */}
      <div className="p-3 bg-gray-50" style={{minHeight: '36px'}}>
        <NodeOutputDisplay data={outputData} placeholder={<p className="text-xs text-gray-500">Awaiting inputs...</p>} />
      </div>
      
      {/* 4. SINGLE SOURCE HANDLE */}
      <Handle type="source" position={Position.Right} className="!bg-gray-400" />
    </div>
  );
};

export default ModelNode;