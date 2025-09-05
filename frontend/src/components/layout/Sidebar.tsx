"use client";

import React, { useState } from 'react';
import DraggableNode from '../ui/DraggableNode';
import { 
  ArrowDownTrayIcon, 
  CpuChipIcon, 
  ScaleIcon, 
  RectangleStackIcon, 
  CodeBracketIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

export const componentLibrary = [
  { 
    groupName: 'Inputs', 
    icon: ArrowDownTrayIcon, 
    items: [
      { type: 'Input', label: 'Transaction Stream', icon: ArrowDownTrayIcon },
    ]
  },
  { 
    groupName: 'Features', 
    icon: RectangleStackIcon, 
    items: [
      // --- FIX: RESTORED MISSING FEATURE NODES ---
      { type: 'Feature', label: 'Spending Deviation', icon: RectangleStackIcon },
      { type: 'Feature', label: 'Velocity Counter (24h)', icon: RectangleStackIcon },
      { type: 'Feature', label: 'Terminal Risk Score', icon: RectangleStackIcon },
    ]
  },
  { 
    groupName: 'Models', 
    icon: CpuChipIcon, 
    items: [
      { type: 'Model', label: 'XGBoost Model', icon: CpuChipIcon },
    ]
  },
  { 
    groupName: 'Logic', 
    icon: CodeBracketIcon, 
    items: [
      { 
        type: 'Rule', 
        label: 'Threshold Gate', 
        icon: ScaleIcon,
        outputs: [
          { id: 'true', name: '>= Threshold' },
          { id: 'false', name: '< Threshold' }
        ]
      },
      { 
        type: 'Rule', 
        label: 'Amount Gate', 
        icon: ScaleIcon,
        outputs: [
          { id: 'true', name: '>= Amount' },
          { id: 'false', name: '< Amount' }
        ]
      },
      { type: 'Logic', label: 'AND Gate', icon: CodeBracketIcon },
      { type: 'Logic', label: 'OR Gate', icon: CodeBracketIcon },
    ]
  },
  { 
    groupName: 'Actions', 
    icon: CheckCircleIcon, 
    items: [
      { type: 'Action', label: 'BLOCK', icon: XCircleIcon },
      { type: 'Action', label: 'APPROVE', icon: CheckCircleIcon },
      { type: 'Action', label: 'REVIEW', icon: QuestionMarkCircleIcon },
    ]
  },
];

// ... rest of the component remains the same
const Sidebar = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>('Logic');

  const handleCategoryClick = (category: string) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  const activeItems = componentLibrary.find(cat => cat.groupName === activeCategory)?.items || [];

  return (
    <aside className="h-full flex flex-row bg-white border-r border-gray-200">
      <div className="w-20 border-r border-gray-200 p-2 flex flex-col items-center space-y-2">
        {componentLibrary.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.groupName;
          return (
            <button
              key={category.groupName}
              onClick={() => handleCategoryClick(category.groupName)}
              className={`flex flex-col items-center justify-center w-full p-2 rounded-md transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-700'
              }`}
              title={category.groupName}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1">{category.groupName}</span>
            </button>
          );
        })}
      </div>

      {activeCategory && (
        <div className="flex-1 p-4">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
            {activeCategory}
          </h3>
          <div>
            {activeItems.map((item) => (
              <DraggableNode 
                key={item.label} 
                component={item}
              />
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;