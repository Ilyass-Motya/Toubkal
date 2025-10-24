/**
 * Diagnostics Configuration
 * 
 * Configuration management interface for Toubkal Browser diagnostics.
 * Allows users to configure logging, error tracking, performance monitoring,
 * and scalability settings.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Logger, LogLevel } from '@/toubkal/app/core/diagnostics/logger';
import { ErrorTracker, ErrorSeverity, ErrorCategory } from '@/toubkal/app/core/diagnostics/error-tracker';
import { PerformanceMonitor, PerformanceMetricType } from '@/toubkal/app/core/diagnostics/performance-monitor';
import { ScalabilityManager, ScalabilityMode, LoadBalancingStrategy } from '@/toubkal/app/core/diagnostics/scalability-manager';

interface LoggerConfig {
  consoleEnabled: boolean;
  fileEnabled: boolean;
  jsonEnabled: boolean;
  maxLogLevel: LogLevel;
  privacyMode: boolean;
  maxLogs: number;
  retentionDays: number;
}

interface ErrorTrackerConfig {
  enableAutoReporting: boolean;
  maxErrors: number;
  retentionDays: number;
  severityThreshold: ErrorSeverity;
  categories: ErrorCategory[];
}

interface PerformanceMonitorConfig {
  enableMetrics: boolean;
  maxMetrics: number;
  retentionDays: number;
  metricTypes: PerformanceMetricType[];
  samplingRate: number;
}

interface ScalabilityConfig {
  mode: ScalabilityMode;
  maxNodes: number;
  minNodes: number;
  autoScaling: boolean;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  cooldownPeriod: number;
  loadBalancingStrategy: LoadBalancingStrategy;
  healthCheckInterval: number;
  maxRetries: number;
  timeout: number;
  stickySessions: boolean;
  sessionTimeout: number;
  failoverEnabled: boolean;
  circuitBreakerThreshold: number;
}

interface DiagnosticsConfig {
  logger: LoggerConfig;
  errorTracker: ErrorTrackerConfig;
  performanceMonitor: PerformanceMonitorConfig;
  scalability: ScalabilityConfig;
}

const DiagnosticsConfigComponent: React.FC = () => {
  const [config, setConfig] = useState<DiagnosticsConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'logger' | 'errors' | 'performance' | 'scalability'>('logger');

  // Load current configuration
  useEffect(() => {
    const loadConfig = () => {
      try {
        const logger = Logger.getInstance();
        ErrorTracker.getInstance();
        PerformanceMonitor.getInstance();
        ScalabilityManager.getInstance();

        const currentConfig: DiagnosticsConfig = {
          logger: {
            consoleEnabled: logger.isConsoleEnabled(),
            fileEnabled: logger.isFileEnabled(),
            jsonEnabled: logger.isJsonEnabled(),
            maxLogLevel: logger.getMaxLogLevel(),
            privacyMode: logger.isPrivacyMode(),
            maxLogs: 1000,
            retentionDays: 7
          },
          errorTracker: {
            enableAutoReporting: true,
            maxErrors: 1000,
            retentionDays: 30,
            severityThreshold: ErrorSeverity.MEDIUM,
            categories: [ErrorCategory.System, ErrorCategory.NETWORK, ErrorCategory.SECURITY]
          },
          performanceMonitor: {
            enableMetrics: true,
            maxMetrics: 10000,
            retentionDays: 7,
            metricTypes: [
              PerformanceMetricType.PageLoad,
              PerformanceMetricType.MemoryUsage,
              PerformanceMetricType.CpuUsage,
              PerformanceMetricType.NetworkLatency
            ],
            samplingRate: 1.0
          },
          scalability: {
            mode: ScalabilityMode.Cluster,
            maxNodes: 10,
            minNodes: 1,
            autoScaling: true,
            scaleUpThreshold: 80,
            scaleDownThreshold: 20,
            cooldownPeriod: 300000, // 5 minutes
            loadBalancingStrategy: LoadBalancingStrategy.RoundRobin,
            healthCheckInterval: 30000, // 30 seconds
            maxRetries: 3,
            timeout: 5000, // 5 seconds
            stickySessions: false,
            sessionTimeout: 1800000, // 30 minutes
            failoverEnabled: true,
            circuitBreakerThreshold: 5
          }
        };

        setConfig(currentConfig);
      } catch (error) {
        console.error('Failed to load configuration:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadConfig();
  }, []);

  const saveConfig = useCallback(() => {
    if (!config) return;

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // Apply logger configuration
      const logger = Logger.getInstance();
      logger.initialize({
        consoleEnabled: config.logger.consoleEnabled,
        fileEnabled: config.logger.fileEnabled,
        jsonEnabled: config.logger.jsonEnabled,
        maxLogLevel: config.logger.maxLogLevel,
        privacyMode: config.logger.privacyMode
      });

      // Apply error tracker configuration
      const errorTracker = ErrorTracker.getInstance();
      errorTracker.initialize({
        enableAutoReporting: config.errorTracker.enableAutoReporting,
        maxErrors: config.errorTracker.maxErrors,
        retentionDays: config.errorTracker.retentionDays
      });

      // Apply performance monitor configuration
      const performanceMonitor = PerformanceMonitor.getInstance();
      performanceMonitor.initialize({
        enableMetrics: config.performanceMonitor.enableMetrics,
        maxMetrics: config.performanceMonitor.maxMetrics,
        retentionDays: config.performanceMonitor.retentionDays
      });

      // Apply scalability configuration
      const scalabilityManager = ScalabilityManager.getInstance();
      scalabilityManager.initialize({
        mode: config.scalability.mode,
        maxNodes: config.scalability.maxNodes,
        minNodes: config.scalability.minNodes,
        autoScaling: config.scalability.autoScaling,
        scaleUpThreshold: config.scalability.scaleUpThreshold,
        scaleDownThreshold: config.scalability.scaleDownThreshold,
        cooldownPeriod: config.scalability.cooldownPeriod,
        loadBalancer: {
          strategy: config.scalability.loadBalancingStrategy,
          healthCheckInterval: config.scalability.healthCheckInterval,
          maxRetries: config.scalability.maxRetries,
          timeout: config.scalability.timeout,
          stickySessions: config.scalability.stickySessions,
          sessionTimeout: config.scalability.sessionTimeout,
          failoverEnabled: config.scalability.failoverEnabled,
          circuitBreakerThreshold: config.scalability.circuitBreakerThreshold
        },
        resourceLimits: {
          cpu: 80,
          memory: 8 * 1024 * 1024 * 1024, // 8GB
          network: 100 * 1024 * 1024, // 100MB/s
          storage: 100 * 1024 * 1024 * 1024, // 100GB
          gpu: 2 * 1024 * 1024 * 1024 // 2GB
        }
      });

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [config]);

  const resetConfig = useCallback(() => {
    if (!config) return;

    const defaultConfig: DiagnosticsConfig = {
      logger: {
        consoleEnabled: true,
        fileEnabled: false,
        jsonEnabled: false,
        maxLogLevel: LogLevel.INFO,
        privacyMode: false,
        maxLogs: 1000,
        retentionDays: 7
      },
      errorTracker: {
        enableAutoReporting: true,
        maxErrors: 1000,
        retentionDays: 30,
        severityThreshold: ErrorSeverity.MEDIUM,
        categories: [ErrorCategory.System, ErrorCategory.NETWORK, ErrorCategory.SECURITY]
      },
      performanceMonitor: {
        enableMetrics: true,
        maxMetrics: 10000,
        retentionDays: 7,
        metricTypes: [
          PerformanceMetricType.PageLoad,
          PerformanceMetricType.MemoryUsage,
          PerformanceMetricType.CpuUsage,
          PerformanceMetricType.NetworkLatency
        ],
        samplingRate: 1.0
      },
      scalability: {
        mode: ScalabilityMode.Cluster,
        maxNodes: 10,
        minNodes: 1,
        autoScaling: true,
        scaleUpThreshold: 80,
        scaleDownThreshold: 20,
        cooldownPeriod: 300000,
        loadBalancingStrategy: LoadBalancingStrategy.RoundRobin,
        healthCheckInterval: 30000,
        maxRetries: 3,
        timeout: 5000,
        stickySessions: false,
        sessionTimeout: 1800000,
        failoverEnabled: true,
        circuitBreakerThreshold: 5
      }
    };

    setConfig(defaultConfig);
  }, [config]);

  const updateConfig = useCallback((section: keyof DiagnosticsConfig, updates: Record<string, unknown>) => {
    setConfig(prev => prev ? { ...prev, [section]: { ...prev[section], ...updates } } : null);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Failed to load configuration</p>
        </div>
      </div>
    );
  }

  const renderLoggerConfig = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Logger Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Channels
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.logger.consoleEnabled}
                    onChange={(e) => updateConfig('logger', { consoleEnabled: e.target.checked })}
                    className="mr-2"
                  />
                  Console Output
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.logger.fileEnabled}
                    onChange={(e) => updateConfig('logger', { fileEnabled: e.target.checked })}
                    className="mr-2"
                  />
                  File Output
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.logger.jsonEnabled}
                    onChange={(e) => updateConfig('logger', { jsonEnabled: e.target.checked })}
                    className="mr-2"
                  />
                  JSON Output
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Log Level
              </label>
              <select
                value={config.logger.maxLogLevel}
                onChange={(e) => updateConfig('logger', { maxLogLevel: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={LogLevel.DEBUG}>Debug</option>
                <option value={LogLevel.INFO}>Info</option>
                <option value={LogLevel.WARN}>Warn</option>
                <option value={LogLevel.ERROR}>Error</option>
                <option value={LogLevel.FATAL}>Fatal</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Privacy & Security
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.logger.privacyMode}
                    onChange={(e) => updateConfig('logger', { privacyMode: e.target.checked })}
                    className="mr-2"
                  />
                  Privacy Mode (Redact PII)
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retention Settings
              </label>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500">Max Logs</label>
                  <input
                    type="number"
                    value={config.logger.maxLogs}
                    onChange={(e) => updateConfig('logger', { maxLogs: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Retention Days</label>
                  <input
                    type="number"
                    value={config.logger.retentionDays}
                    onChange={(e) => updateConfig('logger', { retentionDays: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderErrorTrackerConfig = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Error Tracker Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-Reporting
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.errorTracker.enableAutoReporting}
                    onChange={(e) => updateConfig('errorTracker', { enableAutoReporting: e.target.checked })}
                    className="mr-2"
                  />
                  Enable Auto-Reporting
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity Threshold
              </label>
              <select
                value={config.errorTracker.severityThreshold}
                onChange={(e) => updateConfig('errorTracker', { severityThreshold: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={ErrorSeverity.LOW}>Low</option>
                <option value={ErrorSeverity.MEDIUM}>Medium</option>
                <option value={ErrorSeverity.HIGH}>High</option>
                <option value={ErrorSeverity.CRITICAL}>Critical</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retention Settings
              </label>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500">Max Errors</label>
                  <input
                    type="number"
                    value={config.errorTracker.maxErrors}
                    onChange={(e) => updateConfig('errorTracker', { maxErrors: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Retention Days</label>
                  <input
                    type="number"
                    value={config.errorTracker.retentionDays}
                    onChange={(e) => updateConfig('errorTracker', { retentionDays: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformanceConfig = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Performance Monitor Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monitoring
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.performanceMonitor.enableMetrics}
                    onChange={(e) => updateConfig('performanceMonitor', { enableMetrics: e.target.checked })}
                    className="mr-2"
                  />
                  Enable Metrics Collection
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sampling Rate
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.performanceMonitor.samplingRate}
                onChange={(e) => updateConfig('performanceMonitor', { samplingRate: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-gray-500">
                {Math.round(config.performanceMonitor.samplingRate * 100)}%
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retention Settings
              </label>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500">Max Metrics</label>
                  <input
                    type="number"
                    value={config.performanceMonitor.maxMetrics}
                    onChange={(e) => updateConfig('performanceMonitor', { maxMetrics: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Retention Days</label>
                  <input
                    type="number"
                    value={config.performanceMonitor.retentionDays}
                    onChange={(e) => updateConfig('performanceMonitor', { retentionDays: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderScalabilityConfig = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Scalability Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cluster Mode
              </label>
              <select
                value={config.scalability.mode}
                onChange={(e) => updateConfig('scalability', { mode: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={ScalabilityMode.SingleInstance}>Single Instance</option>
                <option value={ScalabilityMode.Cluster}>Cluster</option>
                <option value={ScalabilityMode.Distributed}>Distributed</option>
                <option value={ScalabilityMode.Cloud}>Cloud</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Node Configuration
              </label>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500">Max Nodes</label>
                  <input
                    type="number"
                    value={config.scalability.maxNodes}
                    onChange={(e) => updateConfig('scalability', { maxNodes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Min Nodes</label>
                  <input
                    type="number"
                    value={config.scalability.minNodes}
                    onChange={(e) => updateConfig('scalability', { minNodes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-Scaling
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.scalability.autoScaling}
                    onChange={(e) => updateConfig('scalability', { autoScaling: e.target.checked })}
                    className="mr-2"
                  />
                  Enable Auto-Scaling
                </label>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scaling Thresholds
              </label>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500">Scale Up Threshold (%)</label>
                  <input
                    type="number"
                    value={config.scalability.scaleUpThreshold}
                    onChange={(e) => updateConfig('scalability', { scaleUpThreshold: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Scale Down Threshold (%)</label>
                  <input
                    type="number"
                    value={config.scalability.scaleDownThreshold}
                    onChange={(e) => updateConfig('scalability', { scaleDownThreshold: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Load Balancing
              </label>
              <select
                value={config.scalability.loadBalancingStrategy}
                onChange={(e) => updateConfig('scalability', { loadBalancingStrategy: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={LoadBalancingStrategy.RoundRobin}>Round Robin</option>
                <option value={LoadBalancingStrategy.LeastConnections}>Least Connections</option>
                <option value={LoadBalancingStrategy.WeightedRoundRobin}>Weighted Round Robin</option>
                <option value={LoadBalancingStrategy.LeastResponseTime}>Least Response Time</option>
                <option value={LoadBalancingStrategy.IpHash}>IP Hash</option>
                <option value={LoadBalancingStrategy.Random}>Random</option>
              </select>
            </div>
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
              <h1 className="text-2xl font-bold text-gray-900">Diagnostics Configuration</h1>
              <p className="text-sm text-gray-500">
                Configure logging, error tracking, performance monitoring, and scalability settings
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={resetConfig}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Reset
              </button>
              <button
                onClick={() => { void saveConfig(); }}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Configuration'}
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
                { id: 'logger', label: 'Logger' },
                { id: 'errors', label: 'Error Tracker' },
                { id: 'performance', label: 'Performance Monitor' },
                { id: 'scalability', label: 'Scalability Manager' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'logger' | 'errors' | 'performance' | 'scalability')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'logger' && renderLoggerConfig()}
            {activeTab === 'errors' && renderErrorTrackerConfig()}
            {activeTab === 'performance' && renderPerformanceConfig()}
            {activeTab === 'scalability' && renderScalabilityConfig()}
          </div>
        </div>
        
        {saveStatus === 'success' && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            Configuration saved successfully!
          </div>
        )}
        
        {saveStatus === 'error' && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            Failed to save configuration. Please try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticsConfigComponent;
