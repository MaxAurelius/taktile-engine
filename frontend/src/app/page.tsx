"use client";

import { useState } from 'react';
import Sidebar from "@/components/layout/Sidebar";
import AnalyticsPanel from "@/components/layout/AnalyticsPanel";
import StrategyCanvas from "@/components/canvas/StrategyCanvas";
import ControlPanel from "@/components/command-center/ControlPanel";
import PrimaryNavBar from '@/components/layout/PrimaryNavBar';
import SimulationManager from '@/components/core/SimulationManager'; 

export default function Home() {
  const [activeTab, setActiveTab] = useState('components');

  return (
    <div className="grid h-screen w-screen grid-cols-[80px_400px_1fr] bg-white">
      <PrimaryNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="border-r border-gray-200">
        {activeTab === 'components' && <Sidebar />}
        {activeTab === 'analytics' && <AnalyticsPanel />}
      </div>
      
      <main className="flex flex-col bg-gray-50 overflow-hidden">
        <header className="flex w-full items-center justify-between border-b border-gray-200 bg-white p-4">
          <h1 className="text-xl font-semibold text-gray-800">The Taktile Engine</h1>
          <ControlPanel />
        </header>

        <div className="flex-grow p-4">
          <StrategyCanvas />
        </div>
      </main>
      
      <SimulationManager />
    </div>
  );
}