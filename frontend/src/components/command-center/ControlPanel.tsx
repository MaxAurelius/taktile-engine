"use client";

import { PlayIcon, PauseIcon, ArrowPathIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/solid';
import useCanvasStore from '@/store/canvasStore';

const ControlPanel = () => {
  const { simulationStatus, isLiveMode, runSimulation, pauseSimulation, resetSimulation } = useCanvasStore();

  const isRunning = simulationStatus === 'running';
  const isStopped = simulationStatus === 'stopped';
  const isPaused = simulationStatus === 'paused';

  // The mode indicator provides immediate situational awareness
  const ModeIndicator = () => (
    <div className="flex items-center space-x-2 mr-4 border-r pr-4">
      {isLiveMode ? (
        <>
          <EyeIcon className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">Live Mode</span>
        </>
      ) : (
        <>
          <PencilIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-semibold text-gray-600">Design Mode</span>
        </>
      )}
    </div>
  );

  return (
    <div className="flex items-center space-x-2 rounded-lg bg-white p-1 border border-gray-200 shadow-sm">
      <ModeIndicator />
      <button 
        onClick={runSimulation}
        disabled={isRunning || isLiveMode} // Cannot run if already running or if in live mode but paused
        className="flex items-center space-x-2 px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <PlayIcon className="h-5 w-5" />
        <span>{isPaused ? 'Resume' : 'Run Live'}</span>
      </button>
      <button 
        onClick={pauseSimulation}
        disabled={!isRunning}
        className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors disabled:text-gray-300 disabled:cursor-not-allowed" 
        title="Pause"
      >
        <PauseIcon className="h-5 w-5" />
      </button>
      <button 
        onClick={resetSimulation}
        disabled={isStopped}
        className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors disabled:text-gray-300 disabled:cursor-not-allowed" 
        title="Reset and Exit Live Mode"
      >
        <ArrowPathIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ControlPanel;
