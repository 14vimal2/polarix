"use client";

import React, { useState, ReactNode } from 'react';

// Define the types for the tabs and props
type TabId = 'modules' | 'scopes' | 'roles';
interface SimpleTabsProps {
  modulesContent: ReactNode;
  scopesContent: ReactNode;
  rolesContent: ReactNode;
}

export function SimpleTabs({ modulesContent, scopesContent, rolesContent }: SimpleTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('modules');

  const tabs = [
    { id: 'modules' as TabId, label: 'Modules' },
    { id: 'scopes' as TabId, label: 'Actions (Scopes)' },
    { id: 'roles' as TabId, label: 'Roles' },
  ];

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="pt-4">
        {activeTab === 'modules' && modulesContent}
        {activeTab === 'scopes' && scopesContent}
        {activeTab === 'roles' && rolesContent}
      </div>
    </div>
  );
}