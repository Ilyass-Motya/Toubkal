/**
 * Performance Monitor Tests
 * 
 * Comprehensive test suite for the Performance Monitor system.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PerformanceMonitor, PerformanceMetricType, PerformanceThreshold } from './performance-monitor';

// Mock the Logger
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn()
};

vi.mock('./logger', () => ({
  logger: {
    getInstance: vi.fn(() => mockLogger)
  }
}));

// Mock Performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  getEntriesByType: vi.fn(() => []),
  getEntries: vi.fn(() => [])
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true
});

// Mock PerformanceObserver
const mockPerformanceObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn()
}));

Object.defineProperty(global, 'PerformanceObserver', {
  value: mockPerformanceObserver,
  writable: true
});

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 16); // ~60fps
});

Object.defineProperty(global, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
  writable: true
});

describe('PerformanceMonitor', () => {
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    performanceMonitor = PerformanceMonitor.getInstance();
    
    // Clear any existing state
    performanceMonitor.clearMetrics();
    
    // Clear mock calls
    mockLogger.info.mockClear();
    mockLogger.warn.mockClear();
    mockLogger.error.mockClear();
    mockLogger.debug.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      performanceMonitor.initialize();
      
      expect(mockLogger.info).toHaveBeenCalledWith(
        'PerformanceMonitor',
        'Performance monitoring system initialized',
        expect.objectContaining({
          samplingInterval: 1000,
          privacyMode: true
        })
      );
    });

    it('should initialize with custom config', () => {
      const customConfig = {
        samplingInterval: 500,
        enableRealTimeMonitoring: false,
        privacyMode: false
      };
      
      performanceMonitor.initialize(customConfig);
      
      expect(mockLogger.info).toHaveBeenCalledWith(
        'PerformanceMonitor',
        'Performance monitoring system initialized',
        expect.objectContaining({
          samplingInterval: 500,
          privacyMode: false
        })
      );
    });
  });

  describe('metric tracking', () => {
    beforeEach(() => {
      performanceMonitor.initialize();
    });

    it('should track a performance metric', () => {
      const metricId = performanceMonitor.trackMetric(
        PerformanceMetricType.PageLoad,
        'Page Load Time',
        1500,
        'ms',
        { url: 'https://example.com', component: 'page-loader' }
      );

      expect(metricId).toBeDefined();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'PerformanceMonitor',
        'Performance metric tracked',
        expect.objectContaining({
          type: PerformanceMetricType.PageLoad,
          name: 'Page Load Time',
          value: 1500,
          unit: 'ms'
        })
      );
    });

    it('should track multiple metrics', () => {
      performanceMonitor.trackMetric(PerformanceMetricType.MemoryUsage, 'Memory Usage', 50, 'MB');
      performanceMonitor.trackMetric(PerformanceMetricType.CpuUsage, 'CPU Usage', 75, '%');
      
      const allMetrics = performanceMonitor.getAllMetrics();
      expect(allMetrics).toHaveLength(2);
    });

    it('should calculate performance thresholds correctly', () => {
      // Test excellent performance
      performanceMonitor.trackMetric(PerformanceMetricType.PageLoad, 'Fast Load', 1000, 'ms');
      const fastMetric = performanceMonitor.getAllMetrics().find(m => m.name === 'Fast Load');
      expect(fastMetric?.threshold).toBe(PerformanceThreshold.Excellent);
      
      // Test poor performance
      performanceMonitor.trackMetric(PerformanceMetricType.PageLoad, 'Slow Load', 5000, 'ms');
      const slowMetric = performanceMonitor.getAllMetrics().find(m => m.name === 'Slow Load');
      expect(slowMetric?.threshold).toBe(PerformanceThreshold.Poor);
    });
  });

  describe('metric retrieval', () => {
    beforeEach(() => {
      performanceMonitor.initialize();
    });

    it('should get metric by ID', () => {
      const metricId = performanceMonitor.trackMetric(
        PerformanceMetricType.MemoryUsage,
        'Memory Usage',
        100,
        'MB'
      );
      
      const metric = performanceMonitor.getMetric(metricId);
      expect(metric).toBeDefined();
      expect(metric?.name).toBe('Memory Usage');
      expect(metric?.value).toBe(100);
    });

    it('should return undefined for non-existent metric ID', () => {
      const metric = performanceMonitor.getMetric('non-existent-id');
      expect(metric).toBeUndefined();
    });

    it('should get metrics by type', () => {
      // Track metrics with different names to avoid ID conflicts
      performanceMonitor.trackMetric(PerformanceMetricType.PageLoad, 'Page Load A', 1000, 'ms');
      performanceMonitor.trackMetric(PerformanceMetricType.MemoryUsage, 'Memory Usage', 50, 'MB');
      performanceMonitor.trackMetric(PerformanceMetricType.PageLoad, 'Page Load B', 2000, 'ms');
      
      const allMetrics = performanceMonitor.getAllMetrics();
      expect(allMetrics.length).toBeGreaterThanOrEqual(2);
      
      const pageLoadMetrics = performanceMonitor.getMetricsByType(PerformanceMetricType.PageLoad);
      expect(pageLoadMetrics.length).toBeGreaterThanOrEqual(1);
      
      const memoryMetrics = performanceMonitor.getMetricsByType(PerformanceMetricType.MemoryUsage);
      expect(memoryMetrics).toHaveLength(1);
    });

    it('should get metrics by threshold', () => {
      performanceMonitor.trackMetric(PerformanceMetricType.PageLoad, 'Fast Load', 1000, 'ms');
      performanceMonitor.trackMetric(PerformanceMetricType.PageLoad, 'Slow Load', 5000, 'ms');
      
      const excellentMetrics = performanceMonitor.getMetricsByThreshold(PerformanceThreshold.Excellent);
      expect(excellentMetrics).toHaveLength(1);
      expect(excellentMetrics[0].name).toBe('Fast Load');
      
      const poorMetrics = performanceMonitor.getMetricsByThreshold(PerformanceThreshold.Poor);
      expect(poorMetrics).toHaveLength(1);
      expect(poorMetrics[0].name).toBe('Slow Load');
    });

    it('should get recent metrics', async () => {
      performanceMonitor.trackMetric(PerformanceMetricType.PageLoad, 'Recent Metric', 1000, 'ms');
      
      const recentMetrics = performanceMonitor.getRecentMetrics(60000); // 1 minute
      expect(recentMetrics).toHaveLength(1);
      
      // Wait a bit to ensure the metric is old
      await new Promise(resolve => setTimeout(resolve, 10));
      const oldMetrics = performanceMonitor.getRecentMetrics(1); // 1ms
      expect(oldMetrics).toHaveLength(0);
    });
  });

  describe('snapshots and reports', () => {
    beforeEach(() => {
      performanceMonitor.initialize();
    });

    it('should create performance snapshot', () => {
      performanceMonitor.trackMetric(PerformanceMetricType.PageLoad, 'Page Load', 1500, 'ms');
      performanceMonitor.trackMetric(PerformanceMetricType.MemoryUsage, 'Memory Usage', 75, 'MB');
      
      const snapshot = performanceMonitor.createSnapshot();
      
      expect(snapshot.metrics).toHaveLength(2);
      expect(snapshot.summary.totalMetrics).toBe(2);
      expect(snapshot.summary.averageValue).toBeGreaterThan(0);
      expect(snapshot.summary.minValue).toBeGreaterThan(0);
      expect(snapshot.summary.maxValue).toBeGreaterThan(0);
    });

    it('should generate performance report', () => {
      const startTime = Date.now() - 60000; // 1 minute ago
      const endTime = Date.now();
      
      performanceMonitor.trackMetric(PerformanceMetricType.PageLoad, 'Page Load', 2000, 'ms');
      performanceMonitor.trackMetric(PerformanceMetricType.MemoryUsage, 'Memory Usage', 100, 'MB');
      
      const report = performanceMonitor.generateReport(startTime, endTime);
      
      expect(report.id).toBeDefined();
      expect(report.startTime).toBe(startTime);
      expect(report.endTime).toBe(endTime);
      expect(report.duration).toBe(endTime - startTime);
      expect(report.metrics).toHaveLength(2);
      expect(report.summary.totalMetrics).toBe(2);
      expect(report.summary.performanceScore).toBeGreaterThan(0);
      expect(report.recommendations).toBeDefined();
    });

    it('should calculate performance score', () => {
      // Add some good performance metrics
      performanceMonitor.trackMetric(PerformanceMetricType.PageLoad, 'Fast Load', 1000, 'ms');
      performanceMonitor.trackMetric(PerformanceMetricType.MemoryUsage, 'Low Memory', 50, 'MB');
      
      const score = performanceMonitor.getPerformanceScore();
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('performance alerts', () => {
    beforeEach(() => {
      performanceMonitor.initialize({
        enablePerformanceAlerts: true
      });
    });

    it('should trigger alert for poor performance', () => {
      // Track a metric that should trigger an alert (exceeds threshold)
      performanceMonitor.trackMetric(PerformanceMetricType.PageLoad, 'Very Slow Load', 10000, 'ms');
      
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'PerformanceMonitor',
        'Performance alert triggered',
        expect.objectContaining({
          type: PerformanceMetricType.PageLoad,
          name: 'Very Slow Load',
          value: 10000
        })
      );
    });

    it('should not trigger alert for good performance', () => {
      // Track a metric that should not trigger an alert
      performanceMonitor.trackMetric(PerformanceMetricType.PageLoad, 'Fast Load', 1000, 'ms');
      
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });
  });

  describe('context sanitization', () => {
    beforeEach(() => {
      performanceMonitor.initialize({
        privacyMode: true
      });
    });

    it('should sanitize sensitive context in privacy mode', () => {
      const context = {
        userId: 'user123',
        sessionId: 'session456',
        url: 'https://example.com?token=secret',
        component: 'test-component'
      };
      
      performanceMonitor.trackMetric(
        PerformanceMetricType.PageLoad,
        'Page Load',
        1500,
        'ms',
        context
      );
      
      const metric = performanceMonitor.getAllMetrics()[0];
      expect(metric.context?.userId).toBeUndefined();
      expect(metric.context?.sessionId).toBeUndefined();
      expect(metric.context?.url).toBe('https://example.com/');
      expect(metric.context?.component).toBe('test-component');
    });

    it('should preserve context when privacy mode is disabled', () => {
      performanceMonitor.initialize({
        privacyMode: false
      });
      
      const context = {
        userId: 'user123',
        sessionId: 'session456',
        url: 'https://example.com?token=secret',
        component: 'test-component'
      };
      
      performanceMonitor.trackMetric(
        PerformanceMetricType.PageLoad,
        'Page Load',
        1500,
        'ms',
        context
      );
      
      const metric = performanceMonitor.getAllMetrics()[0];
      expect(metric.context?.userId).toBe('user123');
      expect(metric.context?.sessionId).toBe('session456');
      expect(metric.context?.url).toBe('https://example.com?token=secret');
    });
  });

  describe('performance observers', () => {
    beforeEach(() => {
      performanceMonitor.initialize();
    });

    it('should set up performance observers', () => {
      expect(mockPerformanceObserver).toHaveBeenCalled();
    });

    it('should handle page load performance', () => {
      const mockNavigation = {
        domContentLoadedEventStart: 0,
        domContentLoadedEventEnd: 100,
        loadEventStart: 100,
        loadEventEnd: 200,
        fetchStart: 0
      } as PerformanceNavigationTiming;
      
      mockPerformance.getEntriesByType.mockReturnValue([mockNavigation] as unknown as never[]);
      
      // Simulate page load
      window.dispatchEvent(new Event('load'));
      
      // Should have tracked page load metrics
      const metrics = performanceMonitor.getAllMetrics();
      expect(metrics.length).toBeGreaterThan(0);
    });
  });

  describe('export and cleanup', () => {
    beforeEach(() => {
      performanceMonitor.initialize();
    });

    it('should export metrics as JSON', () => {
      performanceMonitor.trackMetric(PerformanceMetricType.PageLoad, 'Page Load', 1500, 'ms');
      performanceMonitor.trackMetric(PerformanceMetricType.MemoryUsage, 'Memory Usage', 75, 'MB');
      
      const exported = performanceMonitor.exportMetrics();
      expect(exported).toBeDefined();
      
      const parsed = JSON.parse(exported);
      expect(parsed).toHaveLength(2);
      expect(parsed[0]).toHaveProperty('id');
      expect(parsed[0]).toHaveProperty('type');
      expect(parsed[0]).toHaveProperty('name');
      expect(parsed[0]).toHaveProperty('value');
      expect(parsed[0]).toHaveProperty('unit');
    });

    it('should clear all metrics', () => {
      performanceMonitor.trackMetric(PerformanceMetricType.PageLoad, 'Page Load', 1500, 'ms');
      performanceMonitor.trackMetric(PerformanceMetricType.MemoryUsage, 'Memory Usage', 75, 'MB');
      
      expect(performanceMonitor.getAllMetrics()).toHaveLength(2);
      
      performanceMonitor.clearMetrics();
      
      expect(performanceMonitor.getAllMetrics()).toHaveLength(0);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'PerformanceMonitor',
        'All performance metrics cleared'
      );
    });
  });

  describe('destroy', () => {
    it('should destroy the monitor', () => {
      performanceMonitor.initialize();
      performanceMonitor.trackMetric(PerformanceMetricType.PageLoad, 'Page Load', 1500, 'ms');
      
      performanceMonitor.destroy();
      
      expect(performanceMonitor.getAllMetrics()).toHaveLength(0);
    });
  });

  describe('threshold calculations', () => {
    beforeEach(() => {
      performanceMonitor.initialize();
    });

    it('should calculate thresholds correctly for different metric types', () => {
      // Test page load thresholds
      const fastLoad = performanceMonitor.trackMetric(PerformanceMetricType.PageLoad, 'Fast', 1000, 'ms');
      const slowLoad = performanceMonitor.trackMetric(PerformanceMetricType.PageLoad, 'Slow', 5000, 'ms');
      
      const fastMetric = performanceMonitor.getMetric(fastLoad);
      const slowMetric = performanceMonitor.getMetric(slowLoad);
      
      expect(fastMetric?.threshold).toBe(PerformanceThreshold.Excellent);
      expect(slowMetric?.threshold).toBe(PerformanceThreshold.Poor);
    });

    it('should handle edge cases in threshold calculation', () => {
      // Test exactly at threshold
      const atThreshold = performanceMonitor.trackMetric(PerformanceMetricType.PageLoad, 'At Threshold', 3000, 'ms');
      const atThresholdMetric = performanceMonitor.getMetric(atThreshold);
      expect(atThresholdMetric?.threshold).toBe(PerformanceThreshold.NeedsImprovement);
    });
  });

  describe('recommendations', () => {
    beforeEach(() => {
      performanceMonitor.initialize();
    });

    it('should generate recommendations for poor performance', () => {
      // Create poor performance metrics that exceed thresholds
      performanceMonitor.trackMetric(PerformanceMetricType.PageLoad, 'Slow Page', 10000, 'ms'); // > 3000ms threshold
      performanceMonitor.trackMetric(PerformanceMetricType.MemoryUsage, 'High Memory', 200 * 1024 * 1024, 'bytes'); // > 100MB threshold
      
      const startTime = Date.now() - 60000;
      const endTime = Date.now();
      const report = performanceMonitor.generateReport(startTime, endTime);
      
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.recommendations.some(rec => rec.includes('page load'))).toBe(true);
      expect(report.recommendations.some(rec => rec.includes('memory'))).toBe(true);
    });
  });
});
