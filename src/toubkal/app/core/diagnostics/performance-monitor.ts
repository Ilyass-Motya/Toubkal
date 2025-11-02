/**
 * Performance Monitoring System
 * 
 * Comprehensive performance monitoring for Toubkal Browser, tracking
 * key metrics like page load times, memory usage, CPU performance,
 * network performance, and user interactions.
 */

import { Logger } from './logger';

// Browser APIs

export enum PerformanceMetricType {
  PageLoad = 'page_load',
  MemoryUsage = 'memory_usage',
  CpuUsage = 'cpu_usage',
  NetworkRequest = 'network_request',
  UserInteraction = 'user_interaction',
  Rendering = 'rendering',
  JavaScriptExecution = 'javascript_execution',
  ResourceLoading = 'resource_loading',
  NetworkLatency = 'network_latency'
}

export enum PerformanceThreshold {
  Excellent = 'excellent',
  Good = 'good',
  NeedsImprovement = 'needs_improvement',
  Poor = 'poor'
}

export interface PerformanceMetric {
  id: string;
  type: PerformanceMetricType;
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  url?: string;
  component?: string;
  context?: Record<string, unknown>;
  threshold?: PerformanceThreshold;
}

export interface PerformanceSnapshot {
  timestamp: number;
  metrics: PerformanceMetric[];
  summary: {
    totalMetrics: number;
    averageValue: number;
    minValue: number;
    maxValue: number;
    thresholdDistribution: Record<PerformanceThreshold, number>;
  };
}

export interface PerformanceReport {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  metrics: PerformanceMetric[];
  summary: {
    totalMetrics: number;
    averageValue: number;
    minValue: number;
    maxValue: number;
    thresholdDistribution: Record<PerformanceThreshold, number>;
    topSlowestMetrics: PerformanceMetric[];
    performanceScore: number;
  };
  recommendations: string[];
}

export interface PerformanceMonitorConfig {
  enablePageLoadTracking: boolean;
  enableMemoryTracking: boolean;
  enableCPUTracking: boolean;
  enableNetworkTracking: boolean;
  enableUserInteractionTracking: boolean;
  enableRenderingTracking: boolean;
  enableJavaScriptTracking: boolean;
  enableResourceTracking: boolean;
  samplingInterval: number; // milliseconds
  maxMetricsPerSnapshot: number;
  enableRealTimeMonitoring: boolean;
  enablePerformanceAlerts: boolean;
  alertThresholds: Record<PerformanceMetricType, number>;
  privacyMode: boolean;
  enabled?: boolean;
  enableMetrics?: boolean;
  maxMetrics?: number;
  retentionDays?: number;
  collectionInterval?: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private logger: Logger;
  private config: PerformanceMonitorConfig;
  private metrics: Map<string, PerformanceMetric> = new Map();
  private snapshots: PerformanceSnapshot[] = [];
  private isInitialized = false;
  private isInitializing = false;
  private monitoringInterval: ReturnType<typeof setInterval> | null = null;
  private observers: Map<string, PerformanceObserver> = new Map();
  private animationFrameId: number | null = null;
  private metricCounter = 0;

  private constructor() {
    this.logger = Logger.getInstance();
    this.config = {
      enablePageLoadTracking: true,
      enableMemoryTracking: true,
      enableCPUTracking: true,
      enableNetworkTracking: true,
      enableUserInteractionTracking: true,
      enableRenderingTracking: true,
      enableJavaScriptTracking: true,
      enableResourceTracking: true,
      samplingInterval: 1000, // 1 second
      maxMetricsPerSnapshot: 1000,
      enableRealTimeMonitoring: true,
      enablePerformanceAlerts: true,
      alertThresholds: {
        [PerformanceMetricType.PageLoad]: 3000, // 3 seconds
        [PerformanceMetricType.MemoryUsage]: 100 * 1024 * 1024, // 100MB
        [PerformanceMetricType.CpuUsage]: 80, // 80%
        [PerformanceMetricType.NetworkRequest]: 5000, // 5 seconds
        [PerformanceMetricType.UserInteraction]: 100, // 100ms
        [PerformanceMetricType.Rendering]: 16.67, // 60fps
        [PerformanceMetricType.JavaScriptExecution]: 50, // 50ms
        [PerformanceMetricType.ResourceLoading]: 2000, // 2 seconds
        [PerformanceMetricType.NetworkLatency]: 1000 // 1 second
      },
      privacyMode: true
    };
  }

  public static getInstance(): PerformanceMonitor {
    if (PerformanceMonitor.instance == null) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public initialize(config: Partial<PerformanceMonitorConfig> = {}): void {
    if (this.isInitialized || this.isInitializing) {
      // If already initialized, just update the config
      this.config = { ...this.config, ...config };
      return;
    }
    
    this.isInitializing = true;
    this.config = { ...this.config, ...config };
    this.setupPerformanceObservers();
    this.startMonitoring();
    this.isInitialized = true;
    this.isInitializing = false;
    
    this.logger.info('PerformanceMonitor', 'Performance monitoring system initialized', {
      samplingInterval: this.config.samplingInterval,
      privacyMode: this.config.privacyMode
    });
  }

  public trackMetric(
    type: PerformanceMetricType,
    name: string,
    value: number,
    unit: string,
    context: Record<string, unknown> = {}
  ): string {
    if (!this.isInitialized && !this.isInitializing) {
      this.initialize();
    }

    const metric: PerformanceMetric = {
      id: this.generateMetricId(type, name, value),
      type,
      name,
      value,
      unit,
      timestamp: Date.now(),
      url: context.url as string || window.location.href,
      component: context.component as string,
      context: this.sanitizeContext(context),
      threshold: this.calculateThreshold(type, value)
    };

    this.metrics.set(metric.id, metric);
    
    // Check for performance alerts
    if (this.config.enablePerformanceAlerts && this.shouldAlert(metric)) {
      this.triggerPerformanceAlert(metric);
    }

    this.logger.debug('PerformanceMonitor', 'Performance metric tracked', {
      type,
      name,
      value,
      unit,
      threshold: metric.threshold
    });

    return metric.id;
  }

  public getMetric(metricId: string): PerformanceMetric | undefined {
    return this.metrics.get(metricId);
  }

  public getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  public getMetricsByType(type: PerformanceMetricType): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter(metric => metric.type === type);
  }

  public getMetricsByThreshold(threshold: PerformanceThreshold): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter(metric => metric.threshold === threshold);
  }

  public getRecentMetrics(timeWindowMs: number = 60000): PerformanceMetric[] {
    const cutoff = Date.now() - timeWindowMs;
    return Array.from(this.metrics.values()).filter(metric => metric.timestamp >= cutoff);
  }

  public createSnapshot(): PerformanceSnapshot {
    const now = Date.now();
    const recentMetrics = this.getRecentMetrics(this.config.samplingInterval);
    
    const snapshot: PerformanceSnapshot = {
      timestamp: now,
      metrics: recentMetrics,
      summary: this.calculateSnapshotSummary(recentMetrics)
    };

    this.snapshots.push(snapshot);
    
    // Keep only recent snapshots
    if (this.snapshots.length > 100) {
      this.snapshots = this.snapshots.slice(-100);
    }

    this.logger.debug('PerformanceMonitor', 'Performance snapshot created', {
      metricsCount: recentMetrics.length,
      averageValue: snapshot.summary.averageValue
    });

    return snapshot;
  }

  public generateReport(startTime: number, endTime: number): PerformanceReport {
    const reportMetrics = Array.from(this.metrics.values()).filter(
      metric => metric.timestamp >= startTime && metric.timestamp <= endTime
    );

    const summary = this.calculateSnapshotSummary(reportMetrics);
    const topSlowestMetrics = reportMetrics
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const performanceScore = this.calculatePerformanceScore(reportMetrics);
    const recommendations = this.generateRecommendations(reportMetrics);

    const report: PerformanceReport = {
      id: this.generateReportId(startTime, endTime),
      startTime,
      endTime,
      duration: endTime - startTime,
      metrics: reportMetrics,
      summary: {
        ...summary,
        topSlowestMetrics,
        performanceScore,
        thresholdDistribution: summary.thresholdDistribution
      },
      recommendations
    };

    this.logger.info('PerformanceMonitor', 'Performance report generated', {
      reportId: report.id,
      duration: report.duration,
      metricsCount: reportMetrics.length,
      performanceScore
    });

    return report;
  }

  public getPerformanceScore(): number {
    const recentMetrics = this.getRecentMetrics(300000); // 5 minutes
    return this.calculatePerformanceScore(recentMetrics);
  }

  public exportMetrics(): string {
    const metrics = Array.from(this.metrics.values());
    return JSON.stringify(metrics, null, 2);
  }

  public clearMetrics(): void {
    this.metrics.clear();
    this.snapshots = [];
    this.metricCounter = 0; // Reset counter when clearing metrics
    this.logger.info('PerformanceMonitor', 'All performance metrics cleared');
  }

  public getRecommendations(): string[] {
    const recentMetrics = this.getRecentMetrics(300000); // 5 minutes
    return this.generateRecommendations(recentMetrics);
  }

  public getConfig(): PerformanceMonitorConfig {
    return { ...this.config };
  }

  public getHealthStatus(): { status: string; message: string; details: Record<string, unknown> } {
    const recentMetrics = this.getRecentMetrics(300000); // 5 minutes
    const performanceScore = this.calculatePerformanceScore(recentMetrics);
    
    return {
      status: performanceScore > 80 ? 'healthy' : performanceScore > 60 ? 'degraded' : 'critical',
      message: `Performance monitor operational with score ${performanceScore}`,
      details: {
        performanceScore,
        totalMetrics: this.metrics.size,
        recentMetrics: recentMetrics.length,
        snapshots: this.snapshots.length,
        privacyMode: this.config.privacyMode,
        realTimeMonitoring: this.config.enableRealTimeMonitoring
      }
    };
  }

  private setupPerformanceObservers(): void {
    if (typeof window === 'undefined') return;

    // Page Load Performance
    if (this.config.enablePageLoadTracking) {
      this.setupPageLoadObserver();
    }

    // Memory Performance
    if (this.config.enableMemoryTracking) {
      this.setupMemoryObserver();
    }

    // Network Performance
    if (this.config.enableNetworkTracking) {
      this.setupNetworkObserver();
    }

    // User Interaction Performance
    if (this.config.enableUserInteractionTracking) {
      this.setupUserInteractionObserver();
    }

    // Rendering Performance
    if (this.config.enableRenderingTracking) {
      this.setupRenderingObserver();
    }

    // JavaScript Performance
    if (this.config.enableJavaScriptTracking) {
      this.setupJavaScriptObserver();
    }

    // Resource Loading Performance
    if (this.config.enableResourceTracking) {
      this.setupResourceObserver();
    }
  }

  private setupPageLoadObserver(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      // Only track if we're already initialized to avoid circular calls
      if (!this.isInitialized) return;
      
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation != null) {
        this.trackMetric(
          PerformanceMetricType.PageLoad,
          'DOM Content Loaded',
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          'ms',
          { url: window.location.href }
        );

        this.trackMetric(
          PerformanceMetricType.PageLoad,
          'Page Load Complete',
          navigation.loadEventEnd - navigation.loadEventStart,
          'ms',
          { url: window.location.href }
        );

        this.trackMetric(
          PerformanceMetricType.PageLoad,
          'Total Page Load Time',
          navigation.loadEventEnd - navigation.fetchStart,
          'ms',
          { url: window.location.href }
        );
      }
    });
  }

  private setupMemoryObserver(): void {
    if (typeof window === 'undefined' || (window as { performance: { memory?: unknown } }).performance.memory == null) return;

    const trackMemory = () => {
      const memory = (window as unknown as { performance: { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } } }).performance.memory;
      
      this.trackMetric(
        PerformanceMetricType.MemoryUsage,
        'Used Memory',
        memory.usedJSHeapSize,
        'bytes',
        { component: 'memory' }
      );

      this.trackMetric(
        PerformanceMetricType.MemoryUsage,
        'Total Memory',
        memory.totalJSHeapSize,
        'bytes',
        { component: 'memory' }
      );
    };

    // Track memory on page load and periodically
    trackMemory();
    setInterval(trackMemory, this.config.samplingInterval);
  }

  private setupNetworkObserver(): void {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          this.trackMetric(
            PerformanceMetricType.NetworkRequest,
            `Network Request: ${resourceEntry.name}`,
            resourceEntry.responseEnd - resourceEntry.requestStart,
            'ms',
            { 
              url: resourceEntry.name,
              component: 'network',
              method: 'GET' // Default, could be extracted from headers
            }
          );
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.set('network', observer);
  }

  private setupUserInteractionObserver(): void {
    if (typeof window === 'undefined') return;

    const trackInteraction = (event: Event) => {
      const startTime = performance.now();
      
      // eslint-disable-next-line no-undef
      requestAnimationFrame(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.trackMetric(
          PerformanceMetricType.UserInteraction,
          `User Interaction: ${event.type}`,
          duration,
          'ms',
          { 
            component: 'user-interaction',
            eventType: event.type,
            target: (event.target as Element)?.tagName
          }
        );
      });
    };

    ['click', 'keydown', 'scroll', 'resize'].forEach(eventType => {
      window.addEventListener(eventType, trackInteraction, { passive: true });
    });
  }

  private setupRenderingObserver(): void {
    if (typeof window === 'undefined') return;

    let frameCount = 0;
    let lastTime = performance.now();

    const trackFrame = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) { // Every second
        const fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
        
        this.trackMetric(
          PerformanceMetricType.Rendering,
          'Frames Per Second',
          fps,
          'fps',
          { component: 'rendering' }
        );
      }
      
      // eslint-disable-next-line no-undef
      this.animationFrameId = requestAnimationFrame(trackFrame);
    };

    // eslint-disable-next-line no-undef
    this.animationFrameId = requestAnimationFrame(trackFrame);
  }

  private setupJavaScriptObserver(): void {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          this.trackMetric(
            PerformanceMetricType.JavaScriptExecution,
            `JavaScript Execution: ${entry.name}`,
            entry.duration,
            'ms',
            { component: 'javascript' }
          );
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });
    this.observers.set('javascript', observer);
  }

  private setupResourceObserver(): void {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          this.trackMetric(
            PerformanceMetricType.ResourceLoading,
            `Resource Loading: ${resourceEntry.name}`,
            resourceEntry.duration,
            'ms',
            { 
              url: resourceEntry.name,
              component: 'resource',
              size: resourceEntry.transferSize
            }
          );
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.set('resource', observer);
  }

  private startMonitoring(): void {
    if (!this.config.enableRealTimeMonitoring) return;

    this.monitoringInterval = setInterval(() => {
      this.createSnapshot();
    }, this.config.samplingInterval);
  }

  private stopMonitoring(): void {
    if (this.monitoringInterval != null) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    // Cancel animation frame
    if (this.animationFrameId != null) {
      // eslint-disable-next-line no-undef
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  private generateMetricId(type: PerformanceMetricType, name: string, value: number): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const counter = ++this.metricCounter;
    const key = `${type}:${name}:${value}:${timestamp}:${counter}:${random}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  private generateReportId(startTime: number, endTime: number): string {
    const key = `report:${startTime}:${endTime}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  private calculateThreshold(type: PerformanceMetricType, value: number): PerformanceThreshold {
    const threshold = this.config.alertThresholds[type];
    
    if (value <= threshold * 0.5) return PerformanceThreshold.Excellent;
    if (value <= threshold * 0.8) return PerformanceThreshold.Good;
    if (value <= threshold) return PerformanceThreshold.NeedsImprovement;
    return PerformanceThreshold.Poor;
  }

  private shouldAlert(metric: PerformanceMetric): boolean {
    return metric.threshold === PerformanceThreshold.Poor;
  }

  private triggerPerformanceAlert(metric: PerformanceMetric): void {
    this.logger.warn('PerformanceMonitor', 'Performance alert triggered', {
      type: metric.type,
      name: metric.name,
      value: metric.value,
      unit: metric.unit,
      threshold: metric.threshold
    });
  }

  private sanitizeContext(context: Record<string, unknown>): Record<string, unknown> {
    if (!this.config.privacyMode) return context;
    
    const sanitized = { ...context };
    
    // Remove sensitive information
    delete sanitized.userId;
    delete sanitized.sessionId;
    delete sanitized.ipAddress;
    
    // Completely redact URLs in privacy mode
    if (typeof sanitized.url === 'string' && sanitized.url.length > 0) {
      sanitized.url = '[REDACTED_URL]';
    }
    
    return sanitized;
  }

  private calculateSnapshotSummary(metrics: PerformanceMetric[]): {
    totalMetrics: number;
    averageValue: number;
    minValue: number;
    maxValue: number;
    thresholdDistribution: Record<PerformanceThreshold, number>;
  } {
    if (metrics.length === 0) {
      return {
        totalMetrics: 0,
        averageValue: 0,
        minValue: 0,
        maxValue: 0,
        thresholdDistribution: {
          [PerformanceThreshold.Excellent]: 0,
          [PerformanceThreshold.Good]: 0,
          [PerformanceThreshold.NeedsImprovement]: 0,
          [PerformanceThreshold.Poor]: 0
        }
      };
    }

    const values = metrics.map(m => m.value);
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const thresholdDistribution: Record<PerformanceThreshold, number> = {
      [PerformanceThreshold.Excellent]: 0,
      [PerformanceThreshold.Good]: 0,
      [PerformanceThreshold.NeedsImprovement]: 0,
      [PerformanceThreshold.Poor]: 0
    };

    metrics.forEach(metric => {
      if (metric.threshold != null) {
        thresholdDistribution[metric.threshold]++;
      }
    });

    return {
      totalMetrics: metrics.length,
      averageValue,
      minValue,
      maxValue,
      thresholdDistribution
    };
  }

  private calculatePerformanceScore(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 100;

    const thresholdCounts = {
      [PerformanceThreshold.Excellent]: 0,
      [PerformanceThreshold.Good]: 0,
      [PerformanceThreshold.NeedsImprovement]: 0,
      [PerformanceThreshold.Poor]: 0
    };

    metrics.forEach(metric => {
      if (metric.threshold != null) {
        thresholdCounts[metric.threshold]++;
      }
    });

    const total = metrics.length;
    const excellentWeight = 1.0;
    const goodWeight = 0.8;
    const needsImprovementWeight = 0.6;
    const poorWeight = 0.3;

    const score = (
      (thresholdCounts[PerformanceThreshold.Excellent] * excellentWeight +
       thresholdCounts[PerformanceThreshold.Good] * goodWeight +
       thresholdCounts[PerformanceThreshold.NeedsImprovement] * needsImprovementWeight +
       thresholdCounts[PerformanceThreshold.Poor] * poorWeight) / total
    ) * 100;

    return Math.round(score);
  }

  private generateRecommendations(metrics: PerformanceMetric[]): string[] {
    const recommendations: string[] = [];
    
    const slowMetrics = metrics.filter(m => m.threshold === PerformanceThreshold.Poor);
    
    if (slowMetrics.some(m => m.type === PerformanceMetricType.PageLoad)) {
      recommendations.push('Consider optimizing page load performance by reducing bundle size and implementing lazy loading');
    }
    
    if (slowMetrics.some(m => m.type === PerformanceMetricType.MemoryUsage)) {
      recommendations.push('Memory usage is high - consider implementing memory optimization strategies');
    }
    
    if (slowMetrics.some(m => m.type === PerformanceMetricType.NetworkRequest)) {
      recommendations.push('Network requests are slow - consider implementing caching and request optimization');
    }
    
    if (slowMetrics.some(m => m.type === PerformanceMetricType.Rendering)) {
      recommendations.push('Rendering performance is poor - consider optimizing CSS and reducing layout thrashing');
    }
    
    if (slowMetrics.some(m => m.type === PerformanceMetricType.JavaScriptExecution)) {
      recommendations.push('JavaScript execution is slow - consider code splitting and performance optimization');
    }
    
    return recommendations;
  }

  public destroy(): void {
    this.stopMonitoring();
    this.clearMetrics();
    this.isInitialized = false;
    this.isInitializing = false;
    
    // Reset config to default values
    this.config = {
      enablePageLoadTracking: true,
      enableMemoryTracking: true,
      enableCPUTracking: true,
      enableNetworkTracking: true,
      enableUserInteractionTracking: true,
      enableRenderingTracking: true,
      enableJavaScriptTracking: true,
      enableResourceTracking: true,
      samplingInterval: 1000, // 1 second
      maxMetricsPerSnapshot: 1000,
      enableRealTimeMonitoring: true,
      enablePerformanceAlerts: true,
      alertThresholds: {
        [PerformanceMetricType.PageLoad]: 3000, // 3 seconds
        [PerformanceMetricType.MemoryUsage]: 100 * 1024 * 1024, // 100MB
        [PerformanceMetricType.CpuUsage]: 80, // 80%
        [PerformanceMetricType.NetworkRequest]: 5000, // 5 seconds
        [PerformanceMetricType.UserInteraction]: 100, // 100ms
        [PerformanceMetricType.Rendering]: 16.67, // 60fps
        [PerformanceMetricType.JavaScriptExecution]: 50, // 50ms
        [PerformanceMetricType.ResourceLoading]: 2000, // 2 seconds
        [PerformanceMetricType.NetworkLatency]: 1000 // 1 second
      },
      privacyMode: true
    };
  }
}
