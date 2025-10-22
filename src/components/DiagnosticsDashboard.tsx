/**
 * Diagnostics Dashboard
 * 
 * Comprehensive real-time monitoring dashboard for Toubkal Browser diagnostics.
 * Provides visualization of logging, error tracking, performance monitoring,
 * and scalability management.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Logger, LogLevel } from '@/toubkal/app/core/diagnostics/logger';
import { ErrorTracker, ErrorSeverity, ErrorCategory } from '@/toubkal/app/core/diagnostics/error-tracker';
import { PerformanceMonitor, PerformanceMetricType } from '@/toubkal/app/core/diagnostics/performance-monitor';
import { ScalabilityManager, ScalabilityMode } from '@/toubkal/app/core/diagnostics/scalability-manager';

interface DashboardState {
  logs: Array<{
    id: string;
    level: LogLevel;
    message: string;
    timestamp: number;
    context?: Record<string, unknown>;
  }>;
  errors: Array<{
    id: string;
    severity: ErrorSeverity;
    category: ErrorCategory;
    message: string;
    timestamp: number;
    context?: Record<string, unknown>;
  }>;
  metrics: Array<{
    id: string;
    type: PerformanceMetricType;
    name: string;
    value: number;
    timestamp: number;
    context?: Record<string, unknown>;
  }>;
  scalability: {
    totalNodes: number;
    activeNodes: number;
    averageLoad: number;
    healthStatus: string;
  };
  isConnected: boolean;
  lastUpdate: number;
}

const DiagnosticsDashboard: React.FC = () => {
  const [state, setState] = useState<DashboardState>({
    logs: [],
    errors: [],
    metrics: [],
    scalability: {
      totalNodes: 0,
      activeNodes: 0,
      averageLoad: 0,
      healthStatus: 'unknown'
    },
    isConnected: false,
    lastUpdate: 0
  });

  const [selectedTab, setSelectedTab] = useState<'logs' | 'errors' | 'performance' | 'scalability'>('logs');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval] = useState(5000); // 5 seconds
  const [filterLevel, setFilterLevel] = useState<LogLevel>(LogLevel.DEBUG);
  const [searchTerm] = useState('');

  // Initialize diagnostics systems
  useEffect(() => {
    const initializeDiagnostics = async () => {
      try {
        // Initialize logger
        Logger.getInstance().initialize({
          consoleEnabled: true,
          fileEnabled: false,
          jsonEnabled: false,
          maxLogLevel: LogLevel.DEBUG,
          privacyMode: false
        });

        // Initialize error tracker
        ErrorTracker.getInstance().initialize({
          enableAutoReporting: true,
          maxErrors: 1000,
          retentionDays: 30
        });

        // Initialize performance monitor
        PerformanceMonitor.getInstance().initialize({
          enableMetrics: true,
          maxMetrics: 10000,
          retentionDays: 7
        });

        // Initialize scalability manager
        ScalabilityManager.getInstance().initialize({
          mode: ScalabilityMode.CLUSTER,
          maxNodes: 10,
          minNodes: 1,
          autoScaling: true,
          scaleUpThreshold: 80,
          scaleDownThreshold: 20
        });

        setState(prev => ({ ...prev, isConnected: true }));
      } catch (error) {
        console.error('Failed to initialize diagnostics:', error);
      }
    };

    void initializeDiagnostics();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      void updateDashboard();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const updateDashboard = useCallback(() => {
    try {
      const logger = Logger.getInstance();
      const errorTracker = ErrorTracker.getInstance();
      const performanceMonitor = PerformanceMonitor.getInstance();
      const scalabilityManager = ScalabilityManager.getInstance();

      // Get recent logs
      const recentLogs = logger.getRecentLogs(100);
      
      // Get recent errors
      const recentErrors = errorTracker.getRecentErrors(100);
      
      // Get recent metrics
      const recentMetrics = performanceMonitor.getRecentMetrics(100);
      
      // Get scalability metrics
      const scalabilityMetrics = scalabilityManager.getScalabilityMetrics();

      setState(prev => ({
        ...prev,
        logs: recentLogs.map(log => ({
          id: log.correlationId ?? `log-${Date.now()}-${Math.random()}`,
          level: log.level,
          message: log.message,
          timestamp: new Date(log.timestamp).getTime(),
          context: log.context
        })),
        errors: recentErrors.map(error => ({
          id: error.id,
          severity: error.severity,
          category: error.category,
          message: error.message,
          timestamp: error.firstSeen,
          context: error.context as unknown as Record<string, unknown>
        })),
        metrics: recentMetrics.map(metric => ({
          id: metric.id,
          type: metric.type,
          name: metric.name,
          value: metric.value,
          timestamp: metric.timestamp,
          context: metric.context
        })),
        scalability: {
          totalNodes: scalabilityMetrics.totalNodes,
          activeNodes: scalabilityMetrics.activeNodes,
          averageLoad: scalabilityMetrics.averageLoad,
          healthStatus: scalabilityMetrics.healthStatus
        },
        lastUpdate: Date.now()
      }));
    } catch (error) {
      console.error('Failed to update dashboard:', error);
    }
  }, []);

  const getLogLevelColor = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.DEBUG: return 'text-gray-500';
      case LogLevel.INFO: return 'text-blue-500';
      case LogLevel.WARN: return 'text-yellow-500';
      case LogLevel.ERROR: return 'text-red-500';
      case LogLevel.FATAL: return 'text-red-700';
      default: return 'text-gray-500';
    }
  };

  const getSeverityColor = (severity: ErrorSeverity): string => {
    switch (severity) {
      case ErrorSeverity.LOW: return 'text-green-500';
      case ErrorSeverity.MEDIUM: return 'text-yellow-500';
      case ErrorSeverity.HIGH: return 'text-orange-500';
      case ErrorSeverity.CRITICAL: return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const filteredLogs = state.logs.filter(log => {
    const matchesLevel = log.level >= filterLevel;
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.context != null && JSON.stringify(log.context).toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesLevel && matchesSearch;
  });

  const renderLogsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">System Logs</h3>
        <div className="flex space-x-2">
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(Number(e.target.value) as LogLevel)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value={LogLevel.DEBUG}>Debug</option>
            <option value={LogLevel.INFO}>Info</option>
            <option value={LogLevel.WARN}>Warn</option>
            <option value={LogLevel.ERROR}>Error</option>
            <option value={LogLevel.FATAL}>Fatal</option>
          </select>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No logs available</p>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map(log => (
              <div key={log.id} className="flex items-start space-x-3 p-2 hover:bg-gray-100 rounded">
                <span className={`text-xs font-mono ${getLogLevelColor(log.level)}`}>
                  {LogLevel[log.level]}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-sm flex-1">{log.message}</span>
                {log.context && (
                  <details className="text-xs text-gray-500">
                    <summary className="cursor-pointer">Context</summary>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                      {JSON.stringify(log.context, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderErrorsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Error Tracking</h3>
        <div className="text-sm text-gray-500">
          {state.errors.length} errors
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
        {state.errors.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No errors reported</p>
        ) : (
          <div className="space-y-2">
            {state.errors.map(error => (
              <div key={error.id} className="flex items-start space-x-3 p-2 hover:bg-gray-100 rounded">
                <span className={`text-xs font-mono ${getSeverityColor(error.severity)}`}>
                  {error.severity}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {new Date(error.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-sm flex-1">{error.message}</span>
                {error.context && (
                  <details className="text-xs text-gray-500">
                    <summary className="cursor-pointer">Context</summary>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                      {JSON.stringify(error.context, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Performance Metrics</h3>
        <div className="text-sm text-gray-500">
          {state.metrics.length} metrics
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(PerformanceMetricType).map(([name, type]) => {
          const typeMetrics = state.metrics.filter(m => m.type === type);
          const avgValue = typeMetrics.length > 0 
            ? typeMetrics.reduce((sum, m) => sum + m.value, 0) / typeMetrics.length 
            : 0;
          
          return (
            <div key={type} className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">{name.replace('_', ' ')}</h4>
              <div className="text-2xl font-bold text-blue-600">
                {avgValue.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">
                {typeMetrics.length} samples
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
        <h4 className="font-semibold text-sm mb-2">Recent Metrics</h4>
        {state.metrics.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No metrics available</p>
        ) : (
          <div className="space-y-2">
            {state.metrics.slice(0, 50).map(metric => (
              <div key={metric.id} className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded">
                <span className="text-xs text-gray-500 font-mono">
                  {new Date(metric.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-sm font-mono">{metric.name}</span>
                <span className="text-sm text-blue-600 font-semibold">
                  {metric.value.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500">
                  {metric.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderScalabilityTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Scalability Management</h3>
        <div className="text-sm text-gray-500">
          Health: <span className={getHealthStatusColor(state.scalability.healthStatus)}>
            {state.scalability.healthStatus}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-2">Total Nodes</h4>
          <div className="text-2xl font-bold text-blue-600">
            {state.scalability.totalNodes}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-2">Active Nodes</h4>
          <div className="text-2xl font-bold text-green-600">
            {state.scalability.activeNodes}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-2">Average Load</h4>
          <div className="text-2xl font-bold text-orange-600">
            {state.scalability.averageLoad.toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-2">Health Status</h4>
          <div className={`text-2xl font-bold ${getHealthStatusColor(state.scalability.healthStatus)}`}>
            {state.scalability.healthStatus}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Toubkal Diagnostics Dashboard</h1>
              <p className="text-sm text-gray-500">
                Real-time monitoring and diagnostics for Toubkal Browser
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${state.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-500">
                  {state.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <label htmlFor="auto-refresh" className="text-sm text-gray-500">Auto-refresh:</label>
                <input
                  id="auto-refresh"
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
              </div>
              
              <button
                onClick={() => { void updateDashboard(); }}
                className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'logs', label: 'Logs', count: state.logs.length },
                { id: 'errors', label: 'Errors', count: state.errors.length },
                { id: 'performance', label: 'Performance', count: state.metrics.length },
                { id: 'scalability', label: 'Scalability', count: state.scalability.totalNodes }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as 'logs' | 'errors' | 'performance' | 'scalability')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {selectedTab === 'logs' && renderLogsTab()}
            {selectedTab === 'errors' && renderErrorsTab()}
            {selectedTab === 'performance' && renderPerformanceTab()}
            {selectedTab === 'scalability' && renderScalabilityTab()}
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          Last updated: {new Date(state.lastUpdate).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsDashboard;
