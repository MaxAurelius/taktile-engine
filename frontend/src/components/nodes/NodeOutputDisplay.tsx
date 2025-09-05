import React from 'react';

interface NodeOutputDisplayProps {
  data: any;
  placeholder?: React.ReactNode;
}


const NodeOutputDisplay = ({ data, placeholder }: NodeOutputDisplayProps) => {

  if (!data || Object.keys(data).length === 0) {
    return <>{placeholder}</> || null;
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