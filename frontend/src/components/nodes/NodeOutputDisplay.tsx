"use client";

import React from 'react';

interface NodeOutputDisplayProps {
  // Allow 'unknown' to make the component robust
  data: unknown; 
  placeholder?: React.ReactNode;
}

const NodeOutputDisplay = ({ data, placeholder }: NodeOutputDisplayProps) => {
  // Type guard to ensure data is a usable object before processing
  const isDataDisplayable = typeof data === 'object' && data !== null && Object.keys(data).length > 0;

  if (!isDataDisplayable) {
    return placeholder ? <>{placeholder}</> : null;
  }

  return (
    <div className="space-y-1">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex justify-between text-xs">
          <span className="text-gray-500">{key}:</span>
          <span className="font-mono text-gray-800 font-medium">{String(value)}</span>
        </div>
      ))}
    </div>
  );
};

export default NodeOutputDisplay;