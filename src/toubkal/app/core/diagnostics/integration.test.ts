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
      mode: ScalabilityMode.CLUSTER,
      maxNodes: 10,
      minNodes: 1,
      loadBalancingStrategy: LoadBalancingStrategy.ROUND_ROBIN,
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
    scalabilityManager.clearMetrics();
  });

  describe('System Initialization', () => {
    it('should initialize all systems successfully', async () => {
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
        ErrorCategory.SYSTEM,
        { source: 'integration-test' }
      );

      expect(error).toBeDefined();
      expect(error.id).toBeDefined();

      // Check that the error was logged
      const logs = logger.getRecentLogs();
      const errorLog = logs.find(log => 
        log.message.includes('Integration test error')
      );
      expect(errorLog).toBeDefined();
    });

    it('should log performance metrics', async () => {
      const metric = await performanceMonitor.trackMetric(
        PerformanceMetricType.PAGE_LOAD,
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
        log.message.includes('Integration Test Page Load')
      );
      expect(metricLog).toBeDefined();
    });

    it('should log scalability events', async () => {
      const metrics = await scalabilityManager.getScalabilityMetrics();
      expect(metrics).toBeDefined();

      // Check that scalability events were logged
      const logs = logger.getRecentLogs();
      const scalabilityLog = logs.find(log => 
        log.message.includes('scalability') || log.message.includes('cluster')
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
        ErrorCategory.SYSTEM,
        { system: 'primary' }
      );

      const error2 = await errorTracker.trackError(
        new Error('Secondary system affected'),
        ErrorSeverity.MEDIUM,
        ErrorCategory.SYSTEM,
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
        PerformanceMetricType.PAGE_LOAD,
        'Integration Test Page',
        1200,
        'ms',
        { url: 'https://integration-test.com' }
      );

      const memoryMetric = await performanceMonitor.trackMetric(
        PerformanceMetricType.MEMORY_USAGE,
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
        PerformanceMetricType.PAGE_LOAD,
        'Slow Page Load',
        5000, // 5 seconds - poor performance
        'ms',
        { url: 'https://slow-site.com' }
      );

      await performanceMonitor.trackMetric(
        PerformanceMetricType.MEMORY_USAGE,
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
        PerformanceMetricType.CPU_USAGE,
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
        ErrorCategory.SYSTEM,
        { test: 'timestamp' }
      );
      await performanceMonitor.trackMetric(
        PerformanceMetricType.PAGE_LOAD,
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

      expect(logs[0].timestamp).toBeGreaterThanOrEqual(startTime);
      expect(logs[0].timestamp).toBeLessThanOrEqual(endTime);
      expect(errors[0].timestamp).toBeGreaterThanOrEqual(startTime);
      expect(errors[0].timestamp).toBeLessThanOrEqual(endTime);
      expect(metrics[0].timestamp).toBeGreaterThanOrEqual(startTime);
      expect(metrics[0].timestamp).toBeLessThanOrEqual(endTime);
    });

    it('should maintain consistent context across systems', async () => {
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
        ErrorCategory.SYSTEM,
        context
      );
      await performanceMonitor.trackMetric(
        PerformanceMetricType.PAGE_LOAD,
        'Context Test',
        1000,
        'ms',
        context
      );

      // Check that context was preserved
      const logs = logger.getRecentLogs();
      const errors = errorTracker.getRecentErrors();
      const metrics = performanceMonitor.getRecentMetrics();

      expect(logs[0].context).toEqual(context);
      expect(errors[0].context).toEqual(context);
      expect(metrics[0].context).toEqual(context);
    });
  });

  describe('System Health Monitoring', () => {
    it('should provide overall system health status', async () => {
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
        ErrorCategory.SYSTEM,
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
      const errorCount = 50;

      // Generate high volume of errors
      for (let i = 0; i < errorCount; i++) {
        await errorTracker.trackError(
          new Error(`High volume error ${i}`),
          ErrorSeverity.LOW,
          ErrorCategory.SYSTEM,
          { index: i }
        );
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Check that all errors were tracked
      const errors = errorTracker.getRecentErrors();
      expect(errors.length).toBeGreaterThanOrEqual(errorCount);

      // Check performance (should complete within reasonable time)
      expect(duration).toBeLessThan(3000); // 3 seconds
    });
  });
});
