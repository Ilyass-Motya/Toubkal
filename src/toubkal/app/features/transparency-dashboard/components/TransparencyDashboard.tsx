/**
 * Toubkal Browser - Transparency Dashboard Component
 * 
 * Main dashboard component that provides real-time visibility into
 * browser operations, consent decisions, and audit data.
 */

import React, { useState } from 'react';
import { AuditLogViewer } from './AuditLogViewer';
import { ConsentHistory } from './ConsentHistory';
import { AuditExport } from './AuditExport';
import { TransparencyDashboardProps } from '../types/TransparencyTypes';

export function TransparencyDashboard({ 
  className = '',
  initialFilters
}: TransparencyDashboardProps) {
  const [activeTab, setActiveTab] = useState<'logs' | 'consent' | 'export'>('logs');

  const tabs = [
    { id: 'logs', label: 'Audit Logs', icon: '📋' },
    { id: 'consent', label: 'Consent History', icon: '🔒' },
    { id: 'export', label: 'Export Data', icon: '📤' }
  ] as const;

  return (
    <div className={`transparency-dashboard ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transparency Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Real-time visibility into browser operations and privacy decisions
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50 min-h-screen">
        <div className="px-6 py-6">
          {activeTab === 'logs' && (
            <AuditLogViewer 
              initialFilters={initialFilters}
              maxLogs={1000}
            />
          )}
          
          {activeTab === 'consent' && (
            <ConsentHistory />
          )}
          
          {activeTab === 'export' && (
            <AuditExport />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Toubkal Browser Transparency Dashboard v1.0.0
          </div>
          <div className="flex items-center space-x-4">
            <span>All operations cryptographically signed</span>
            <span>•</span>
            <span>Zero telemetry by default</span>
            <span>•</span>
            <span>Local-first AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
