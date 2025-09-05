"use client";

import { Squares2X2Icon, ChartBarIcon } from '@heroicons/react/24/outline';

interface PrimaryNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const PrimaryNavBar = ({ activeTab, setActiveTab }: PrimaryNavBarProps) => {
  const navItems = [
    { name: 'components', icon: Squares2X2Icon, label: 'Components' },
    { name: 'analytics', icon: ChartBarIcon, label: 'Analytics' },
  ];

  return (
    <nav className="h-full w-20 border-r border-gray-200 bg-white p-2 flex flex-col items-center space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.name;
        return (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className={`flex flex-col items-center justify-center w-full p-2 rounded-md transition-colors ${
              isActive ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-700'
            }`}
            title={item.label}
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default PrimaryNavBar;
