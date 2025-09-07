"use client";

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import useCanvasStore from '@/store/canvasStore';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { nodeInfo } from '@/lib/nodeInfo';
import NodeOutputDisplay from './NodeOutputDisplay';

const logicInputs = [
  { id: 'input_a', name: 'Input A' },
  { id: 'input_b', name: 'Input B' }
];

const LogicNode = ({ id, data, selected }: NodeProps<{ label: string, type: string, icon: React.ElementType }>) => {
  const Icon = data.icon;
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
    
  const outputs = [
    { id: 'true', name: 'TRUE' },
    { id: 'false', name: 'FALSE' }
  ];

  return (
    <div className={`group relative rounded-md border-2 bg-white shadow-md w-60 transition-all ${borderStyle}`}>
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 z-10 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
        title="Delete Node"
      >
        <XMarkIcon className="h-3 w-3" />
      </button>

      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="h-5 w-5 text-gray-500" />}
            <p className="text-sm font-semibold text-gray-800">{data.label}</p>
          </div>
          <Tippy content={<div className="p-1 max-w-xs">{nodeInfo[data.label] || 'No information available.'}</div>} placement="top">
            <span className="flex items-center">
              <InformationCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer"/>
            </span>
          </Tippy>
        </div>
      </div>
      
      <div
        className="relative border-b border-gray-200 bg-gray-50/50"
        style={{ height: `${logicInputs.length * 28}px`, padding: '8px 0' }}
      >
        {logicInputs.map((input, index) => {
          const topPosition = `${(100 / logicInputs.length) * (index + 0.5)}%`;
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
      
      <div className="p-3 bg-gray-50" style={{minHeight: '36px'}}>
        <NodeOutputDisplay data={outputData} placeholder={<p className="text-xs text-gray-500">Awaiting inputs...</p>} />
      </div>
      
      <div className="relative border-t border-gray-200 bg-gray-50/50" style={{ height: `${outputs.length * 28}px`, padding: '8px 0' }}>
        {outputs.map((output, index) => {
          const topPosition = `${(100 / outputs.length) * (index + 0.5)}%`;
          return (
            <React.Fragment key={output.id}>
              <div
                className="absolute text-xs text-gray-600"
                style={{ top: topPosition, right: '20px', transform: 'translateY(-50%)' }}
              >
                {output.name}
              </div>
              <Handle
                type="source"
                position={Position.Right}
                id={output.id}
                className="!bg-gray-400"
                style={{ top: topPosition }}
              />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default LogicNode;