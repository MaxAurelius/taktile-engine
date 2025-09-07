"use client";

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import useCanvasStore from '@/store/canvasStore';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { nodeInfo } from '@/lib/nodeInfo';
import TippyWrapper from '../ui/TippyWrapper';
import NodeOutputDisplay from './NodeOutputDisplay';

type RuleNodeData = {
  label: string;
  icon: React.ElementType;
  value: number;
  outputs?: { id: string; name: string }[];
};

const RuleNode = ({ id, data, selected }: NodeProps<RuleNodeData>) => {
  const { 
    updateNodeData, 
    activeNodeId, 
    deleteNodeAndEdges, 
    nodeOutputs = {},
  } = useCanvasStore();

  const Icon = data.icon;
  const isActive = activeNodeId === id;
  const outputData = nodeOutputs[id];

  const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    updateNodeData(id, { value: isNaN(newValue) ? 0 : newValue });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNodeAndEdges(id);
  };
  
  const getBorderStyle = () => {
    if (selected) return 'border-sky-500 ring-2 ring-sky-300';
    if (isActive) return 'border-blue-500 shadow-lg shadow-blue-500/50';
    return 'border-gray-300';
  };
  
  // --- NEW: TYPE GUARD ---
  // This constant checks if outputData is a valid, non-empty object.
  // TypeScript knows that inside any block that uses this, outputData is safe to use.
  const isDataDisplayable = typeof outputData === 'object' && outputData !== null && Object.keys(outputData).length > 0;

  return (
    <div className={`group relative rounded-md border-2 bg-white shadow-md w-60 transition-all ${getBorderStyle()}`}>
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 z-10 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
        title="Delete Node"
      >
        <XMarkIcon className="h-3 w-3" />
      </button>

      <Handle type="target" position={Position.Left} id="input" className="!bg-gray-400" />
      
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {Icon && <Icon className="h-5 w-5 text-gray-500" />}
              <p className="text-sm font-semibold text-gray-800">{data.label}</p>
            </div>
            {/* <Tippy content={<div className="p-1 max-w-xs">{nodeInfo[data.label] || 'No information available.'}</div>} placement="top"> */}
              {/* <TippyWrapper> */}
                {/* <InformationCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer"/> */}
              {/* </TippyWrapper> */}
            {/* </Tippy> */}
            <Tippy content={<div className="p-1 max-w-xs">{nodeInfo[data.label] || 'No information available.'}</div>} placement="top">
            <span className="flex items-center">
              <InformationCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer"/>
            </span>
          </Tippy>
        </div>
      </div>
      
      {/* --- FIX: USE THE TYPE GUARD FOR CONDITIONAL RENDERING --- */}
      {isDataDisplayable && (
          <div className="space-y-1 p-3 border-b border-gray-200">
            {/* Pass the now-safe outputData to the display component */}
            <NodeOutputDisplay data={outputData} />
          </div>
      )}

      <div className="p-3 bg-gray-50">
        <label className="text-xs text-gray-500 block mb-1">Parameter Value</label>
        <input
          type="number"
          defaultValue={data.value}
          onChange={onValueChange}
          className="w-full p-1 rounded-md border border-gray-300 text-sm"
        />
      </div>

      <div className="relative border-t border-gray-200 bg-gray-50/50" style={{ height: `${(data.outputs?.length || 0) * 28}px`, padding: '8px 0' }}>
        {data.outputs?.map((output, index) => {
          const topPosition = `${(100 / (data.outputs?.length || 1)) * (index + 0.5)}%`;
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

export default RuleNode;