"use client";

import useCanvasStore from '@/store/canvasStore';

const MetricsDisplay = () => {
  const { precision, recall } = useCanvasStore();

  return (
    // This is now styled as a self-contained card
    <div className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Live Performance</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Precision Metric */}
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-500 uppercase">Precision</p>
          <p className="text-3xl font-bold text-gray-800">
            {(precision * 100).toFixed(1)}%
          </p>
        </div>
        
        {/* Recall Metric */}
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-500 uppercase">Recall</p>
          <p className="text-3xl font-bold text-gray-800">
            {(recall * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetricsDisplay;