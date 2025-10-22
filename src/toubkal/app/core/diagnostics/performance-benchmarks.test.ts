/**
 * Diagnostics System Performance Benchmarks
 * 
 * Performance benchmarks for the diagnostics system,
 * testing throughput, latency, and resource usage.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Logger, LogLevel } from './logger';
import { ErrorTracker, ErrorSeverity, ErrorCategory } from './error-tracker';
import { PerformanceMonitor, PerformanceMetricType } from './performance-monitor';
import { ScalabilityManager, ScalabilityMode, LoadBalancingStrategy } from './scalability-manager';

describe('Diagnostics System Performance Benchmarks', () => {
  let logger: Logger;
  let errorTracker: ErrorTracker;
  let performanceMonitor: PerformanceMonitor;
  let scalabilityManager: ScalabilityManager;

  beforeEach(async () => {
    // Initialize all diagnostics systems
    logger = Logger.getInstance();
    await logger.initialize({
      consoleEnabled: false, // Disable console for performance testing
      fileEnabled: false,
      jsonEnabled: false,
      maxLogLevel: LogLevel.DEBUG,
      privacyMode: false
    });

    errorTracker = ErrorTracker.getInstance();
    await errorTracker.initialize({
      autoReport: false, // Disable auto-reporting for performance testing
      maxErrors: 10000,
      deduplicationWindow: 300000,
      privacyMode: false
    });

    performanceMonitor = PerformanceMonitor.getInstance();
    await performanceMonitor.initialize({
      enabled: true,
      maxMetrics: 50000,
      collectionInterval: 100,
      privacyMode: false
    });

    scalabilityManager = ScalabilityManager.getInstance();
    await scalabilityManager.initialize({
      mode: ScalabilityMode.CLUSTER,
      maxNodes: 100,
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

  describe('Logging Performance', () => {
    it('should handle high-volume logging efficiently', async () => {
      const logCount = 1000;
      const startTime = Date.now();

      // Generate high volume of logs
      for (let i = 0; i < logCount; i++) {
        await logger.log(LogLevel.INFO, 'PerformanceTest', `Performance test log ${i}`, { index: i });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const logsPerSecond = (logCount / duration) * 1000;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(2000); // 2 seconds
      expect(logsPerSecond).toBeGreaterThan(500); // At least 500 logs per second

      // Verify all logs were stored
      const logs = logger.getRecentLogs();
      expect(logs.length).toBeGreaterThanOrEqual(logCount);
    });

    it('should handle concurrent logging efficiently', async () => {
      const concurrentLogs = 100;
      const startTime = Date.now();

      // Generate concurrent logs
      const promises = [];
      for (let i = 0; i < concurrentLogs; i++) {
        promises.push(logger.log(LogLevel.INFO, 'ConcurrentTest', `Concurrent log ${i}`, { index: i }));
      }

      await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should handle concurrency efficiently
      expect(duration).toBeLessThan(1000); // 1 second
      expect(duration / concurrentLogs).toBeLessThan(10); // Less than 10ms per log

      // Verify all logs were stored
      const logs = logger.getRecentLogs();
      expect(logs.length).toBeGreaterThanOrEqual(concurrentLogs);
    });

    it('should maintain performance with large log entries', async () => {
      const logCount = 100;
      const largeMessage = 'x'.repeat(1000); // 1KB message
      const startTime = Date.now();

      // Generate logs with large messages
      for (let i = 0; i < logCount; i++) {
        await logger.log(LogLevel.INFO, 'LargeMessageTest', largeMessage, { 
          index: i,
          largeData: 'y'.repeat(500) // Additional large context
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should handle large entries efficiently
      expect(duration).toBeLessThan(1500); // 1.5 seconds
      expect(duration / logCount).toBeLessThan(15); // Less than 15ms per log

      // Verify all logs were stored
      const logs = logger.getRecentLogs();
      expect(logs.length).toBeGreaterThanOrEqual(logCount);
    });
  });

  describe('Error Tracking Performance', () => {
    it('should handle high-volume error tracking efficiently', async () => {
      const errorCount = 500;
      const startTime = Date.now();

      // Generate high volume of errors
      for (let i = 0; i < errorCount; i++) {
        await errorTracker.trackError(
          new Error(`Performance test error ${i}`),
          ErrorSeverity.LOW,
          ErrorCategory.SYSTEM,
          { index: i }
        );
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const errorsPerSecond = (errorCount / duration) * 1000;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(1500); // 1.5 seconds
      expect(errorsPerSecond).toBeGreaterThan(300); // At least 300 errors per second

      // Verify all errors were tracked
      const errors = errorTracker.getRecentErrors();
      expect(errors.length).toBeGreaterThanOrEqual(errorCount);
    });

    it('should handle error deduplication efficiently', async () => {
      const duplicateCount = 100;
      const startTime = Date.now();

      // Generate duplicate errors
      for (let i = 0; i < duplicateCount; i++) {
        await errorTracker.trackError(
          new Error('Duplicate error message'),
          ErrorSeverity.LOW,
          ErrorCategory.SYSTEM,
          { index: i }
        );
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should handle deduplication efficiently
      expect(duration).toBeLessThan(1000); // 1 second
      expect(duration / duplicateCount).toBeLessThan(10); // Less than 10ms per error

      // Verify deduplication worked
      const errors = errorTracker.getRecentErrors();
      expect(errors.length).toBeLessThan(duplicateCount); // Should be deduplicated
    });

    it('should handle concurrent error tracking efficiently', async () => {
      const concurrentErrors = 50;
      const startTime = Date.now();

      // Generate concurrent errors
      const promises = [];
      for (let i = 0; i < concurrentErrors; i++) {
        promises.push(errorTracker.trackError(
          new Error(`Concurrent error ${i}`),
          ErrorSeverity.LOW,
          ErrorCategory.SYSTEM,
          { index: i }
        ));
      }

      await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should handle concurrency efficiently
      expect(duration).toBeLessThan(500); // 0.5 seconds
      expect(duration / concurrentErrors).toBeLessThan(10); // Less than 10ms per error

      // Verify all errors were tracked
      const errors = errorTracker.getRecentErrors();
      expect(errors.length).toBeGreaterThanOrEqual(concurrentErrors);
    });
  });

  describe('Performance Monitoring Performance', () => {
    it('should handle high-volume metric collection efficiently', async () => {
      const metricCount = 1000;
      const startTime = Date.now();

      // Generate high volume of metrics
      for (let i = 0; i < metricCount; i++) {
        await performanceMonitor.trackMetric(
          PerformanceMetricType.PAGE_LOAD,
          `Performance test metric ${i}`,
          Math.random() * 1000,
          'ms',
          { index: i }
        );
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const metricsPerSecond = (metricCount / duration) * 1000;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(2000); // 2 seconds
      expect(metricsPerSecond).toBeGreaterThan(500); // At least 500 metrics per second

      // Verify all metrics were tracked
      const metrics = performanceMonitor.getRecentMetrics();
      expect(metrics.length).toBeGreaterThanOrEqual(metricCount);
    });

    it('should handle concurrent metric collection efficiently', async () => {
      const concurrentMetrics = 100;
      const startTime = Date.now();

      // Generate concurrent metrics
      const promises = [];
      for (let i = 0; i < concurrentMetrics; i++) {
        promises.push(performanceMonitor.trackMetric(
          PerformanceMetricType.MEMORY_USAGE,
          `Concurrent metric ${i}`,
          Math.random() * 100,
          'MB',
          { index: i }
        ));
      }

      await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should handle concurrency efficiently
      expect(duration).toBeLessThan(500); // 0.5 seconds
      expect(duration / concurrentMetrics).toBeLessThan(5); // Less than 5ms per metric

      // Verify all metrics were tracked
      const metrics = performanceMonitor.getRecentMetrics();
      expect(metrics.length).toBeGreaterThanOrEqual(concurrentMetrics);
    });

    it('should handle metric aggregation efficiently', async () => {
      const metricCount = 500;
      const startTime = Date.now();

      // Generate metrics for aggregation
      for (let i = 0; i < metricCount; i++) {
        await performanceMonitor.trackMetric(
          PerformanceMetricType.PAGE_LOAD,
          'Aggregation test metric',
          Math.random() * 1000,
          'ms',
          { index: i }
        );
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000); // 1 second
      expect(duration / metricCount).toBeLessThan(2); // Less than 2ms per metric

      // Test aggregation performance
      const aggregationStartTime = Date.now();
      const recommendations = performanceMonitor.getRecommendations();
      const aggregationEndTime = Date.now();
      const aggregationDuration = aggregationEndTime - aggregationStartTime;

      // Aggregation should be fast
      expect(aggregationDuration).toBeLessThan(100); // Less than 100ms
      expect(recommendations).toBeDefined();
    });
  });

  describe('Scalability Performance', () => {
    it('should handle scalability calculations efficiently', async () => {
      const calculationCount = 100;
      const startTime = Date.now();

      // Generate scalability calculations
      for (let i = 0; i < calculationCount; i++) {
        await scalabilityManager.getScalabilityMetrics();
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(500); // 0.5 seconds
      expect(duration / calculationCount).toBeLessThan(5); // Less than 5ms per calculation
    });

    it('should handle load balancing calculations efficiently', async () => {
      const calculationCount = 50;
      const startTime = Date.now();

      // Generate load balancing calculations
      for (let i = 0; i < calculationCount; i++) {
        const shouldScale = scalabilityManager.shouldScale();
        expect(shouldScale).toBeDefined();
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(200); // 0.2 seconds
      expect(duration / calculationCount).toBeLessThan(4); // Less than 4ms per calculation
    });

    it('should handle health status calculations efficiently', async () => {
      const calculationCount = 100;
      const startTime = Date.now();

      // Generate health status calculations
      for (let i = 0; i < calculationCount; i++) {
        const healthStatus = scalabilityManager.getHealthStatus();
        expect(healthStatus).toBeDefined();
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(300); // 0.3 seconds
      expect(duration / calculationCount).toBeLessThan(3); // Less than 3ms per calculation
    });
  });

  describe('Memory Usage', () => {
    it('should maintain reasonable memory usage under load', async () => {
      const initialMemory = process.memoryUsage();
      const logCount = 1000;

      // Generate high volume of logs
      for (let i = 0; i < logCount; i++) {
        await logger.log(LogLevel.INFO, 'MemoryTest', `Memory test log ${i}`, { index: i });
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB

      // Clean up and check memory usage
      logger.clearLogs();
      const cleanedMemory = process.memoryUsage();
      const memoryAfterCleanup = cleanedMemory.heapUsed - initialMemory.heapUsed;

      // Memory should be cleaned up reasonably
      expect(memoryAfterCleanup).toBeLessThan(10 * 1024 * 1024); // 10MB
    });

    it('should handle memory cleanup efficiently', async () => {
      const logCount = 500;
      const startTime = Date.now();

      // Generate logs
      for (let i = 0; i < logCount; i++) {
        await logger.log(LogLevel.INFO, 'CleanupTest', `Cleanup test log ${i}`, { index: i });
      }

      // Clear logs and measure cleanup time
      const cleanupStartTime = Date.now();
      logger.clearLogs();
      const cleanupEndTime = Date.now();
      const cleanupDuration = cleanupEndTime - cleanupStartTime;

      // Cleanup should be fast
      expect(cleanupDuration).toBeLessThan(100); // Less than 100ms

      // Verify cleanup worked
      const logs = logger.getRecentLogs();
      expect(logs.length).toBe(0);
    });
  });

  describe('System Integration Performance', () => {
    it('should handle integrated operations efficiently', async () => {
      const operationCount = 100;
      const startTime = Date.now();

      // Perform integrated operations across all systems
      for (let i = 0; i < operationCount; i++) {
        await logger.log(LogLevel.INFO, 'IntegratedTest', `Integrated operation ${i}`, { index: i });
        await errorTracker.trackError(
          new Error(`Integrated error ${i}`),
          ErrorSeverity.LOW,
          ErrorCategory.SYSTEM,
          { index: i }
        );
        await performanceMonitor.trackMetric(
          PerformanceMetricType.PAGE_LOAD,
          `Integrated metric ${i}`,
          Math.random() * 1000,
          'ms',
          { index: i }
        );
        await scalabilityManager.getScalabilityMetrics();
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(3000); // 3 seconds
      expect(duration / operationCount).toBeLessThan(30); // Less than 30ms per operation
    });

    it('should handle concurrent integrated operations efficiently', async () => {
      const concurrentOperations = 20;
      const startTime = Date.now();

      // Perform concurrent integrated operations
      const promises = [];
      for (let i = 0; i < concurrentOperations; i++) {
        promises.push(Promise.all([
          logger.log(LogLevel.INFO, 'ConcurrentTest', `Concurrent operation ${i}`, { index: i }),
          errorTracker.trackError(
            new Error(`Concurrent error ${i}`),
            ErrorSeverity.LOW,
            ErrorCategory.SYSTEM,
            { index: i }
          ),
          performanceMonitor.trackMetric(
            PerformanceMetricType.PAGE_LOAD,
            `Concurrent metric ${i}`,
            Math.random() * 1000,
            'ms',
            { index: i }
          ),
          scalabilityManager.getScalabilityMetrics()
        ]));
      }

      await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should handle concurrency efficiently
      expect(duration).toBeLessThan(1000); // 1 second
      expect(duration / concurrentOperations).toBeLessThan(50); // Less than 50ms per operation
    });
  });

  describe('Latency Benchmarks', () => {
    it('should maintain low latency for individual operations', async () => {
      const operationCount = 100;
      const latencies: number[] = [];

      // Measure latency for individual operations
      for (let i = 0; i < operationCount; i++) {
        const startTime = Date.now();
        await logger.log(LogLevel.INFO, 'LatencyTest', `Latency test ${i}`, { index: i });
        const endTime = Date.now();
        latencies.push(endTime - startTime);
      }

      // Calculate statistics
      const avgLatency = latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length;
      const maxLatency = Math.max(...latencies);
      const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];

      // Should maintain low latency
      expect(avgLatency).toBeLessThan(5); // Less than 5ms average
      expect(maxLatency).toBeLessThan(20); // Less than 20ms maximum
      expect(p95Latency).toBeLessThan(10); // Less than 10ms 95th percentile
    });

    it('should maintain consistent latency under load', async () => {
      const operationCount = 200;
      const latencies: number[] = [];

      // Measure latency under load
      for (let i = 0; i < operationCount; i++) {
        const startTime = Date.now();
        await errorTracker.trackError(
          new Error(`Load test error ${i}`),
          ErrorSeverity.LOW,
          ErrorCategory.SYSTEM,
          { index: i }
        );
        const endTime = Date.now();
        latencies.push(endTime - startTime);
      }

      // Calculate statistics
      const avgLatency = latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length;
      const maxLatency = Math.max(...latencies);
      const stdDev = Math.sqrt(
        latencies.reduce((sum, latency) => sum + Math.pow(latency - avgLatency, 2), 0) / latencies.length
      );

      // Should maintain consistent latency
      expect(avgLatency).toBeLessThan(10); // Less than 10ms average
      expect(maxLatency).toBeLessThan(50); // Less than 50ms maximum
      expect(stdDev).toBeLessThan(10); // Low standard deviation
    });
  });
});
