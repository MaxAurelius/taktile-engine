"use client";
import React from 'react';

interface DraggableNodeProps {
  component: {
    type: string;
    label: string;
    icon: React.ElementType;
  }
}

const DraggableNode: React.FC<DraggableNodeProps> = ({ component }) => {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('application/reactflow', component.label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const Icon = component.icon;

  return (
    <div 
      className="mb-2 cursor-grab rounded-md p-3 transition-colors hover:bg-gray-100"
      draggable
      onDragStart={onDragStart}
    >
      <div className="flex items-center space-x-3">
        <Icon className="h-5 w-5 text-gray-500" />
        <p className="text-sm font-medium text-gray-800">{component.label}</p>
      </div>
    </div>
  );
};

export default DraggableNode;