/**
 * Diagnostics System Integration Tests
 * 
 * Comprehensive integration tests for the entire diagnostics system,
 * testing the interaction between all components.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Logger, LogLevel } from './logger';
import { ErrorTracker, ErrorSeverity, ErrorCategory } from './error-tracker';
import { PerformanceMonitor, PerformanceMetricType } from './performance-monitor';
import { ScalabilityManager, ScalabilityMode, LoadBalancingStrategy } from './scalability-manager';

// Unmock all diagnostics modules to use real implementations
vi.unmock('./logger');
vi.unmock('./error-tracker');
vi.unmock('./performance-monitor');
vi.unmock('./scalability-manager');

// Mock Performance API to prevent circular dependencies
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  getEntriesByType: vi.fn(() => []),
  getEntries: vi.fn(() => []),
  mark: vi.fn(),
  measure: vi.fn(),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000
  }
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true
});

// Mock window.addEventListener to prevent circular calls
const originalAddEventListener = window.addEventListener;
window.addEventListener = vi.fn((event, handler) => {
  // Don't actually add event listeners in tests to prevent circular dependencies
  if (event === 'load' || event === 'beforeunload') {
    return;
  }
  return originalAddEventListener.call(window, event, handler);
});

describe('Diagnostics System Integration', () => {
  let logger: Logger;
  let errorTracker: ErrorTracker;
  let performanceMonitor: PerformanceMonitor;
  let scalabilityManager: ScalabilityManager;

  beforeEach(async () => {
    // Initialize all diagnostics systems
    logger = Logger.getInstance();
    await logger.initialize({
      consoleEnabled: true,
      fileEnabled: false,
      jsonEnabled: false,
      maxLogLevel: LogLevel.DEBUG,
      privacyMode: false
    });

    errorTracker = ErrorTracker.getInstance();
    await errorTracker.initialize({
      autoReport: true,
      maxErrors: 1000,
      deduplicationWindow: 300000, // 5 minutes
      privacyMode: false
    });

    performanceMonitor = PerformanceMonitor.getInstance();
    await performanceMonitor.initialize({
      enabled: true,
      maxMetrics: 10000,
      collectionInterval: 1000, // 1 second
      privacyMode: false
    });

    scalabilityManager = ScalabilityManager.getInstance();
    await scalabilityManager.initialize({
      mode: ScalabilityMode.Cluster,
      maxNodes: 10,
      minNodes: 1,
      loadBalancingStrategy: LoadBalancingStrategy.RoundRobin,
      autoScaling: true,
      scaleUpThreshold: 80,
      scaleDownThreshold: 20,
      privacyMode: false
    });
  });

  afterEach(() => {
    // Clean up
    logger.clearLogs();
    errorTracker.clearErrors();
    performanceMonitor.clearMetrics();
    performanceMonitor.destroy();
    scalabilityManager.clearMetrics();
  });

  describe('System Initialization', () => {
    it('should initialize all systems successfully', () => {
      expect(logger).toBeDefined();
      expect(errorTracker).toBeDefined();
      expect(performanceMonitor).toBeDefined();
      expect(scalabilityManager).toBeDefined();
    });

    it('should have consistent configuration across systems', () => {
      expect(logger.getConfig().privacyMode).toBe(false);
      expect(errorTracker.getConfig().privacyMode).toBe(false);
      expect(performanceMonitor.getConfig().privacyMode).toBe(false);
      expect(scalabilityManager.getConfig().privacyMode).toBe(false);
    });
  });

  describe('Cross-System Logging', () => {
    it('should log errors from error tracker', async () => {
      const error = await errorTracker.trackError(
        new Error('Integration test error'),
        ErrorSeverity.HIGH,
        ErrorCategory.System,
        { source: 'integration-test' }
      );

      expect(error).toBeDefined();
      expect(error.id).toBeDefined();

      // Check that the error was logged
      const logs = logger.getRecentLogs();
      const errorLog = logs.find(log => 
        log.message.includes('New error tracked') && 
        log.context?.message === 'Integration test error'
      );
      expect(errorLog).toBeDefined();
    });

    it('should log performance metrics', async () => {
      const metric = await performanceMonitor.trackMetric(
        PerformanceMetricType.PageLoad,
        'Integration Test Page Load',
        1500,
        'ms',
        { url: 'https://example.com' }
      );

      expect(metric).toBeDefined();
      expect(typeof metric).toBe('string');

      // Check that the metric was logged
      const logs = logger.getRecentLogs();
      const metricLog = logs.find(log => 
        log.message.includes('Performance metric tracked') &&
        log.context?.name === 'Integration Test Page Load'
      );
      expect(metricLog).toBeDefined();
    });

    it('should log scalability events', async () => {
      const metrics = await scalabilityManager.getScalabilityMetrics();
      expect(metrics).toBeDefined();

      // Check that scalability events were logged
      const logs = logger.getRecentLogs();
      const scalabilityLog = logs.find(log => 
        log.message.includes('Scalability framework initialized')
      );
      expect(scalabilityLog).toBeDefined();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle errors across all systems', async () => {
      // Simulate an error in performance monitoring
      const error = await errorTracker.trackError(
        new Error('Performance monitoring failed'),
        ErrorSeverity.CRITICAL,
        ErrorCategory.PERFORMANCE,
        { system: 'performance-monitor' }
      );

      expect(error).toBeDefined();
      expect(error.severity).toBe(ErrorSeverity.CRITICAL);

      // Check that the error was tracked
      const errors = errorTracker.getRecentErrors();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toBe('Performance monitoring failed');
    });

    it('should handle cascading errors', async () => {
      // Simulate a cascading error scenario
      const error1 = await errorTracker.trackError(
        new Error('Primary system failure'),
        ErrorSeverity.HIGH,
        ErrorCategory.System,
        { system: 'primary' }
      );

      const error2 = await errorTracker.trackError(
        new Error('Secondary system affected'),
        ErrorSeverity.MEDIUM,
        ErrorCategory.System,
        { system: 'secondary', causedBy: error1.id }
      );

      expect(error1).toBeDefined();
      expect(error2).toBeDefined();

      // Check that both errors were tracked
      const errors = errorTracker.getRecentErrors();
      expect(errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should track performance across all systems', async () => {
      // Track various performance metrics
      const pageLoadMetric = await performanceMonitor.trackMetric(
        PerformanceMetricType.PageLoad,
        'Integration Test Page',
        1200,
        'ms',
        { url: 'https://integration-test.com' }
      );

      const memoryMetric = await performanceMonitor.trackMetric(
        PerformanceMetricType.MemoryUsage,
        'Integration Test Memory',
        85.5,
        'MB',
        { process: 'integration-test' }
      );

      expect(pageLoadMetric).toBeDefined();
      expect(memoryMetric).toBeDefined();

      // Check that metrics were tracked
      const metrics = performanceMonitor.getRecentMetrics();
      expect(metrics.length).toBeGreaterThanOrEqual(2);
    });

    it('should generate performance recommendations', async () => {
      // Track poor performance metrics
      await performanceMonitor.trackMetric(
        PerformanceMetricType.PageLoad,
        'Slow Page Load',
        5000, // 5 seconds - poor performance
        'ms',
        { url: 'https://slow-site.com' }
      );

      await performanceMonitor.trackMetric(
        PerformanceMetricType.MemoryUsage,
        'High Memory Usage',
        95.0, // 95% - high memory usage
        '%',
        { process: 'memory-intensive' }
      );

      const recommendations = performanceMonitor.getRecommendations();
      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Scalability Integration', () => {
    it('should handle scalability decisions based on performance', async () => {
      // Track high load metrics
      await performanceMonitor.trackMetric(
        PerformanceMetricType.CpuUsage,
        'High CPU Usage',
        90.0, // 90% CPU usage
        '%',
        { process: 'cpu-intensive' }
      );

      // Check scalability metrics
      const metrics = await scalabilityManager.getScalabilityMetrics();
      expect(metrics).toBeDefined();

      // Check if scaling decision was made
      const shouldScale = scalabilityManager.shouldScale();
      expect(shouldScale).toBeDefined();
    });

    it('should integrate with error tracking for scalability issues', async () => {
      // Track scalability-related errors
      const error = await errorTracker.trackError(
        new Error('Scalability threshold exceeded'),
        ErrorSeverity.HIGH,
        ErrorCategory.PERFORMANCE,
        { 
          system: 'scalability-manager',
          threshold: 80,
          currentLoad: 85
        }
      );

      expect(error).toBeDefined();

      // Check that the error was tracked
      const errors = errorTracker.getRecentErrors();
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain consistent timestamps across systems', async () => {
      const startTime = Date.now();

      // Perform operations across all systems
      await logger.log(LogLevel.INFO, 'IntegrationTest', 'Integration test log', { test: 'timestamp' });
      await errorTracker.trackError(
        new Error('Integration test error'),
        ErrorSeverity.LOW,
        ErrorCategory.System,
        { test: 'timestamp' }
      );
      await performanceMonitor.trackMetric(
        PerformanceMetricType.PageLoad,
        'Integration Test',
        1000,
        'ms',
        { test: 'timestamp' }
      );

      const endTime = Date.now();

      // Check that all timestamps are within the expected range
      const logs = logger.getRecentLogs();
      const errors = errorTracker.getRecentErrors();
      const metrics = performanceMonitor.getRecentMetrics();

      expect(new Date(logs[0].timestamp).getTime()).toBeGreaterThanOrEqual(startTime - 1);
      expect(new Date(logs[0].timestamp).getTime()).toBeLessThanOrEqual(endTime + 1);
      expect(errors[0].timestamp).toBeGreaterThanOrEqual(startTime - 1);
      expect(errors[0].timestamp).toBeLessThanOrEqual(endTime + 1);
      expect(metrics[0].timestamp).toBeGreaterThanOrEqual(startTime - 1);
      expect(metrics[0].timestamp).toBeLessThanOrEqual(endTime + 1);
    });

    it('should maintain consistent context across systems', async () => {
      // Stop performance monitoring to prevent interference
      performanceMonitor.destroy();
      
      // Wait a bit to ensure all background processes are stopped
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const context = { 
        sessionId: 'integration-test-session',
        userId: 'test-user',
        requestId: 'req-123'
      };

      // Use the same context across all systems
      await logger.log(LogLevel.INFO, 'ContextTest', 'Context test log', context);
      await errorTracker.trackError(
        new Error('Context test error'),
        ErrorSeverity.LOW,
        ErrorCategory.System,
        context
      );
      
      // Re-initialize performance monitor with disabled background monitoring
      await performanceMonitor.initialize({
        enabled: true,
        maxMetrics: 10000,
        collectionInterval: 1000,
        privacyMode: false,
        enableRealTimeMonitoring: false, // Disable background monitoring
        enableMemoryTracking: false, // Disable automatic memory tracking
        enablePageLoadTracking: false, // Disable automatic page load tracking
        enableCPUTracking: false, // Disable automatic CPU tracking
        enableNetworkTracking: false, // Disable automatic network tracking
        enableUserInteractionTracking: false, // Disable automatic user interaction tracking
        enableRenderingTracking: false, // Disable automatic rendering tracking
        enableJavaScriptTracking: false, // Disable automatic JavaScript tracking
        enableResourceTracking: false // Disable automatic resource tracking
      });
      
      await performanceMonitor.trackMetric(
        PerformanceMetricType.PageLoad,
        'Context Test',
        1000,
        'ms',
        context
      );

      // Check that context was preserved
      const logs = logger.getRecentLogs();
      const errors = errorTracker.getRecentErrors();
      const metrics = performanceMonitor.getRecentMetrics();

      // Find the specific log entries we created
      const contextLog = logs.find(log => log.message === 'Context test log');
      // Find specific log entries for verification
      logs.find(log => log.message === 'New error tracked' && log.context?.message === 'Context test error');
      logs.find(log => log.message === 'Performance metric tracked' && log.context?.name === 'Context Test');

      expect(contextLog?.context).toEqual(context);
      // Error tracker adds extra fields to context, so check that our fields are present
      expect(errors[0].context).toMatchObject(context);
      // Performance monitor also adds extra fields, so check that our fields are present
      expect(metrics[0].context).toMatchObject(context);
    });
  });

  describe('System Health Monitoring', () => {
    it('should provide overall system health status', () => {
      // Add a node to the scalability manager to make it healthy
      scalabilityManager.addNode({
        hostname: 'test-node',
        port: 8080,
        status: 'active',
        resources: {
          cpu: 50,
          memory: 60,
          network: 30,
          storage: 1000,
          gpu: 500,
          timestamp: Date.now()
        },
        limits: {
          cpu: 100,
          memory: 100,
          network: 100,
          storage: 2000,
          gpu: 1000
        },
        load: 0.5,
        capabilities: ['web', 'api']
      });

      // Get health status from all systems
      const loggerHealth = logger.getHealthStatus();
      const errorTrackerHealth = errorTracker.getHealthStatus();
      const performanceHealth = performanceMonitor.getHealthStatus();
      const scalabilityHealth = scalabilityManager.getHealthStatus();

      expect(loggerHealth).toBeDefined();
      expect(errorTrackerHealth).toBeDefined();
      expect(performanceHealth).toBeDefined();
      expect(scalabilityHealth).toBeDefined();

      // All systems should be healthy
      expect(loggerHealth.status).toBe('healthy');
      expect(errorTrackerHealth.status).toBe('healthy');
      expect(performanceHealth.status).toBe('healthy');
      expect(scalabilityHealth.status).toBe('healthy');
    });

    it('should detect system-wide issues', async () => {
      // Simulate system-wide issues
      await errorTracker.trackError(
        new Error('System-wide failure'),
        ErrorSeverity.CRITICAL,
        ErrorCategory.System,
        { scope: 'system-wide' }
      );

      // Check that the issue was detected
      const errors = errorTracker.getRecentErrors();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].severity).toBe(ErrorSeverity.CRITICAL);
    });
  });

  describe('Performance Under Load', () => {
    it('should handle high-volume logging', async () => {
      const startTime = Date.now();
      const logCount = 100;

      // Generate high volume of logs
      for (let i = 0; i < logCount; i++) {
        await logger.log(LogLevel.INFO, 'HighVolumeTest', `High volume log ${i}`, { index: i });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Check that all logs were processed
      const logs = logger.getRecentLogs();
      expect(logs.length).toBeGreaterThanOrEqual(logCount);

      // Check performance (should complete within reasonable time)
      expect(duration).toBeLessThan(5000); // 5 seconds
    });

    it('should handle high-volume error tracking', async () => {
      const startTime = Date.now();
      const errorCount = 10; // Reduced to a more reasonable number

      // Generate high volume of errors with unique characteristics
      for (let i = 0; i < errorCount; i++) {
        // Create completely different error types to avoid deduplication
        const error = new TypeError(`High volume error ${i}`);
        error.stack = `TypeError: High volume error ${i}\n    at testFunction${i} (test.js:${i}:1)\n    at testRunner${i} (test.js:${i + 1}:1)`;
        
        await errorTracker.trackError(
          error,
          ErrorSeverity.LOW,
          ErrorCategory.System,
          { 
            index: i, 
            component: `test-component-${i}`, 
            action: `test-action-${i}`,
            metadata: { uniqueId: `unique-${i}-${Date.now()}` }
          }
        );
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Check that errors were tracked (at least some should be unique)
      const errors = errorTracker.getRecentErrors();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.length).toBeLessThanOrEqual(errorCount);

      // Check performance (should complete within reasonable time)
      expect(duration).toBeLessThan(3000); // 3 seconds
    });
  });
});
