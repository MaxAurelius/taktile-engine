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

const StrategyNode = ({ id, data, selected }: NodeProps<{ label: string, type: string, icon: React.ElementType }>) => {
  const Icon = data.icon;
  const { 
    activeNodeId, 
    deleteNodeAndEdges, 
    nodeOutputs = {},
  } = useCanvasStore();

  const isActive = activeNodeId === id;
  const outputData = nodeOutputs[id];
  const isActionNode = data.type === 'Action';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNodeAndEdges(id);
  };


  const getBorderStyle = () => {
    if (selected) return 'border-sky-500 ring-2 ring-sky-300';
    if (isActive) {
      if (isActionNode) {
        switch (data.label) {
          case 'BLOCK':   return 'border-red-500 shadow-lg shadow-red-500/50';
          case 'APPROVE': return 'border-green-500 shadow-lg shadow-green-500/50';
          default:        return 'border-orange-400 shadow-lg shadow-orange-400/50';
        }
      }
      return 'border-blue-500 shadow-lg shadow-blue-500/50';
    }
    return 'border-gray-300';
  };

  return (
    <div className={`group relative rounded-md border-2 bg-white shadow-md w-60 transition-all ${getBorderStyle()}`}>
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 z-10 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
        title="Delete Node"
      >
        <XMarkIcon className="h-3 w-3" />
      </button>

      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
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
      <div className="p-3 bg-gray-50" style={{ minHeight: '36px' }}>
        {!isActionNode && (
          <NodeOutputDisplay data={outputData} placeholder={<p className="text-xs text-gray-500">Awaiting execution...</p>} />
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-gray-400" />
    </div>
  );
};

export default StrategyNode;