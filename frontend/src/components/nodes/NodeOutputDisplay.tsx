import React from 'react';

interface NodeOutputDisplayProps {
  // FIX: Replace 'any' with a specific, type-safe definition.
  data: Record<string, unknown> | null | undefined;
  placeholder?: React.ReactNode;
}

const NodeOutputDisplay = ({ data, placeholder }: NodeOutputDisplayProps) => {
  // If there's no data or the data object is empty, render the placeholder.
  if (!data || Object.keys(data).length === 0) {
    // FIX: Cleaner return logic for the placeholder.
    return placeholder ? <>{placeholder}</> : null;
  }

  // Otherwise, map over the key-value pairs and display them.
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