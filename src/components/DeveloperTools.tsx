/**
 * Developer Tools
 * 
 * Advanced diagnostics and debugging tools for Toubkal Browser developers.
 * Provides system inspection, configuration management, and debugging utilities.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Logger, LogLevel } from '@/toubkal/app/core/diagnostics/logger';
import { ErrorTracker, ErrorSeverity, ErrorCategory } from '@/toubkal/app/core/diagnostics/error-tracker';
import { PerformanceMonitor, PerformanceMetricType } from '@/toubkal/app/core/diagnostics/performance-monitor';
import { ScalabilityManager, ScalabilityMode, LoadBalancingStrategy } from '@/toubkal/app/core/diagnostics/scalability-manager';

interface SystemInfo {
  browser: {
    name: string;
    version: string;
    userAgent: string;
  };
  system: {
    platform: string;
    language: string;
    timezone: string;
    memory: number;
  };
  diagnostics: {
    logger: {
      enabled: boolean;
      maxLevel: LogLevel;
      privacyMode: boolean;
    };
    errorTracker: {
      enabled: boolean;
      autoReporting: boolean;
      maxErrors: number;
    };
    performanceMonitor: {
      enabled: boolean;
      maxMetrics: number;
      retentionDays: number;
    };
    scalabilityManager: {
      mode: ScalabilityMode;
      maxNodes: number;
      autoScaling: boolean;
    };
  };
}

interface DebugCommand {
  id: string;
  name: string;
  description: string;
  command: string;
  category: 'system' | 'diagnostics' | 'performance' | 'scalability';
}

const DeveloperTools: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [debugCommands, setDebugCommands] = useState<DebugCommand[]>([]);
  const [commandOutput, setCommandOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('system');

  // Initialize system info
  useEffect(() => {
    const initializeSystemInfo = async () => {
      try {
        const info: SystemInfo = {
          browser: {
            name: 'Toubkal Browser',
            version: '1.0.0',
            userAgent: navigator.userAgent
          },
          system: {
            platform: navigator.platform,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            memory: (performance as any).memory?.jsHeapSizeLimit || 0
          },
          diagnostics: {
            logger: {
              enabled: true,
              maxLevel: LogLevel.DEBUG,
              privacyMode: false
            },
            errorTracker: {
              enabled: true,
              autoReporting: true,
              maxErrors: 1000
            },
            performanceMonitor: {
              enabled: true,
              maxMetrics: 10000,
              retentionDays: 7
            },
            scalabilityManager: {
              mode: ScalabilityMode.CLUSTER,
              maxNodes: 10,
              autoScaling: true
            }
          }
        };
        
        setSystemInfo(info);
      } catch (error) {
        console.error('Failed to initialize system info:', error);
      }
    };

    initializeSystemInfo();
  }, []);

  // Initialize debug commands
  useEffect(() => {
    const commands: DebugCommand[] = [
      {
        id: 'system-info',
        name: 'System Information',
        description: 'Display detailed system information',
        command: 'system.info',
        category: 'system'
      },
      {
        id: 'memory-usage',
        name: 'Memory Usage',
        description: 'Show current memory usage and statistics',
        command: 'system.memory',
        category: 'system'
      },
      {
        id: 'performance-metrics',
        name: 'Performance Metrics',
        description: 'Display current performance metrics',
        command: 'performance.metrics',
        category: 'performance'
      },
      {
        id: 'error-summary',
        name: 'Error Summary',
        description: 'Show error statistics and recent errors',
        command: 'errors.summary',
        category: 'diagnostics'
      },
      {
        id: 'log-levels',
        name: 'Log Levels',
        description: 'Display current log levels and configuration',
        command: 'logs.levels',
        category: 'diagnostics'
      },
      {
        id: 'scalability-status',
        name: 'Scalability Status',
        description: 'Show current scalability configuration and status',
        command: 'scalability.status',
        category: 'scalability'
      },
      {
        id: 'clear-logs',
        name: 'Clear Logs',
        description: 'Clear all diagnostic logs',
        command: 'logs.clear',
        category: 'diagnostics'
      },
      {
        id: 'clear-errors',
        name: 'Clear Errors',
        description: 'Clear all error reports',
        command: 'errors.clear',
        category: 'diagnostics'
      },
      {
        id: 'clear-metrics',
        name: 'Clear Metrics',
        description: 'Clear all performance metrics',
        command: 'metrics.clear',
        category: 'performance'
      },
      {
        id: 'export-data',
        name: 'Export Data',
        description: 'Export all diagnostic data',
        command: 'data.export',
        category: 'system'
      }
    ];
    
    setDebugCommands(commands);
  }, []);

  const executeCommand = useCallback(async (command: DebugCommand) => {
    setIsExecuting(true);
    setCommandOutput('');
    
    try {
      let output = '';
      
      switch (command.id) {
        case 'system-info':
          output = JSON.stringify(systemInfo, null, 2);
          break;
          
        case 'memory-usage':
          const memory = (performance as any).memory;
          output = JSON.stringify({
            used: memory?.usedJSHeapSize || 0,
            total: memory?.totalJSHeapSize || 0,
            limit: memory?.jsHeapSizeLimit || 0,
            timestamp: new Date().toISOString()
          }, null, 2);
          break;
          
        case 'performance-metrics':
          const metrics = PerformanceMonitor.getInstance().getRecentMetrics(100);
          output = JSON.stringify(metrics, null, 2);
          break;
          
        case 'error-summary':
          const errors = ErrorTracker.getInstance().getRecentErrors(100);
          const errorSummary = {
            total: errors.length,
            bySeverity: errors.reduce((acc, error) => {
              acc[error.severity] = (acc[error.severity] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
            byCategory: errors.reduce((acc, error) => {
              acc[error.category] = (acc[error.category] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
            recent: errors.slice(0, 10)
          };
          output = JSON.stringify(errorSummary, null, 2);
          break;
          
        case 'log-levels':
          const logger = Logger.getInstance();
          output = JSON.stringify({
            maxLevel: LogLevel[logger.getMaxLogLevel()],
            privacyMode: logger.isPrivacyMode(),
            consoleEnabled: logger.isConsoleEnabled(),
            fileEnabled: logger.isFileEnabled(),
            jsonEnabled: logger.isJsonEnabled()
          }, null, 2);
          break;
          
        case 'scalability-status':
          const scalability = ScalabilityManager.getInstance();
          const scalabilityMetrics = scalability.getScalabilityMetrics();
          output = JSON.stringify(scalabilityMetrics, null, 2);
          break;
          
        case 'clear-logs':
          Logger.getInstance().clearLogBuffer();
          output = 'Logs cleared successfully';
          break;
          
        case 'clear-errors':
          ErrorTracker.getInstance().clearErrors();
          output = 'Errors cleared successfully';
          break;
          
        case 'clear-metrics':
          PerformanceMonitor.getInstance().clearMetrics();
          output = 'Metrics cleared successfully';
          break;
          
        case 'export-data':
          const exportData = {
            systemInfo,
            logs: Logger.getInstance().getRecentLogs(1000),
            errors: ErrorTracker.getInstance().getRecentErrors(1000),
            metrics: PerformanceMonitor.getInstance().getRecentMetrics(1000),
            scalability: ScalabilityManager.getInstance().getScalabilityMetrics(),
            timestamp: new Date().toISOString()
          };
          output = JSON.stringify(exportData, null, 2);
          break;
          
        default:
          output = `Command "${command.command}" not implemented`;
      }
      
      setCommandOutput(output);
    } catch (error) {
      setCommandOutput(`Error executing command: ${error}`);
    } finally {
      setIsExecuting(false);
    }
  }, [systemInfo]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(commandOutput);
  }, [commandOutput]);

  const downloadOutput = useCallback(() => {
    const blob = new Blob([commandOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toubkal-debug-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [commandOutput]);

  const filteredCommands = debugCommands.filter(cmd => 
    selectedCategory === 'all' || cmd.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Toubkal Developer Tools</h1>
              <p className="text-sm text-gray-500">
                Advanced diagnostics and debugging utilities
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Commands Panel */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Debug Commands</h2>
              <p className="text-sm text-gray-500">
                Execute diagnostic commands and inspect system state
              </p>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Filter
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="system">System</option>
                  <option value="diagnostics">Diagnostics</option>
                  <option value="performance">Performance</option>
                  <option value="scalability">Scalability</option>
                </select>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredCommands.map(command => (
                  <div
                    key={command.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => executeCommand(command)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-sm">{command.name}</h3>
                        <p className="text-xs text-gray-500">{command.description}</p>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {command.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Output Panel */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Command Output</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={copyToClipboard}
                    disabled={!commandOutput}
                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Copy
                  </button>
                  <button
                    onClick={downloadOutput}
                    disabled={!commandOutput}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {isExecuting ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-500">Executing command...</span>
                </div>
              ) : commandOutput ? (
                <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto max-h-96 overflow-y-auto">
                  {commandOutput}
                </pre>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Select a command to execute</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* System Information */}
        {systemInfo && (
          <div className="mt-6 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">System Information</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-sm text-gray-700 mb-2">Browser</h3>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">Name:</span> {systemInfo.browser.name}</div>
                    <div><span className="font-medium">Version:</span> {systemInfo.browser.version}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-gray-700 mb-2">System</h3>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">Platform:</span> {systemInfo.system.platform}</div>
                    <div><span className="font-medium">Language:</span> {systemInfo.system.language}</div>
                    <div><span className="font-medium">Timezone:</span> {systemInfo.system.timezone}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-gray-700 mb-2">Diagnostics</h3>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">Logger:</span> {systemInfo.diagnostics.logger.enabled ? 'Enabled' : 'Disabled'}</div>
                    <div><span className="font-medium">Error Tracker:</span> {systemInfo.diagnostics.errorTracker.enabled ? 'Enabled' : 'Disabled'}</div>
                    <div><span className="font-medium">Performance Monitor:</span> {systemInfo.diagnostics.performanceMonitor.enabled ? 'Enabled' : 'Disabled'}</div>
                    <div><span className="font-medium">Scalability Manager:</span> {systemInfo.diagnostics.scalabilityManager.mode}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperTools;
