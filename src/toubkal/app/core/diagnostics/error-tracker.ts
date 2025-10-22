/**
 * Error Tracking & Reporting System
 * 
 * Provides comprehensive error tracking, categorization, and reporting capabilities
 * for the Toubkal Browser diagnostics system.
 */

import { Logger, LogLevel } from './logger';

export interface ToubkalError extends Error {
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  context?: ErrorContext;
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  low = 'low',
  medium = 'medium',
  high = 'high',
  critical = 'critical'
}

export enum ErrorCategory {
  NETWORK = 'network',
  RENDERING = 'rendering',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  USER_INPUT = 'user_input',
  SYSTEM = 'system',
  THIRD_PARTY = 'third_party',
  UNKNOWN = 'unknown',
  network = 'network',
  rendering = 'rendering',
  security = 'security',
  performance = 'performance',
  user_input = 'user_input',
  system = 'system',
  third_party = 'third_party',
  unknown = 'unknown'
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  timestamp: number;
  stackTrace?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
  source?: string;
  system?: string;
  test?: string;
  scope?: string;
  index?: number;
  causedBy?: string;
  threshold?: number;
  currentLoad?: number;
}

export interface ErrorReport {
  id: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  context: ErrorContext;
  count: number;
  firstSeen: number;
  lastSeen: number;
  resolved: boolean;
  tags: string[];
  timestamp: number;
}

export interface ErrorStats {
  totalErrors: number;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorsByCategory: Record<ErrorCategory, number>;
  topErrors: ErrorReport[];
  recentErrors: ErrorReport[];
  errorRate: number;
  timeWindow: {
    start: number;
    end: number;
  };
}

export interface ErrorTrackerConfig {
  maxReports: number;
  reportRetentionDays: number;
  enableAutoReporting: boolean;
  enableUserFeedback: boolean;
  enableCrashReporting: boolean;
  privacyMode: boolean;
  maxErrors?: number;
  autoReport?: boolean;
  retentionDays?: number;
  deduplicationWindow?: number;
}

export class ErrorTracker {
  private static instance: ErrorTracker;
  private logger: Logger;
  private reports: Map<string, ErrorReport> = new Map();
  private config: ErrorTrackerConfig;
  private errorCounts: Map<string, number> = new Map();
  private isInitialized = false;

  private constructor() {
    this.logger = Logger.getInstance();
    this.config = {
      maxReports: 1000,
      reportRetentionDays: 30,
      enableAutoReporting: true,
      enableUserFeedback: true,
      enableCrashReporting: true,
      privacyMode: true
    };
  }

  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  public initialize(config: Partial<ErrorTrackerConfig> = {}): void {
    this.config = { ...this.config, ...config };
    this.setupGlobalErrorHandlers();
    this.isInitialized = true;
    
    this.logger.info('ErrorTracker', 'Error tracking system initialized', {
      maxReports: this.config.maxReports,
      privacyMode: this.config.privacyMode
    });
  }

  public trackError(
    error: Error,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    context: Partial<ErrorContext> = {}
  ): ErrorReport {
    if (!this.isInitialized) {
      this.initialize();
    }

    const errorId = this.generateErrorId(error, context);
    const now = Date.now();
    
    // Create error context
    const fullContext: ErrorContext = {
      timestamp: now,
      stackTrace: error.stack,
      component: context.component || 'unknown',
      action: context.action || 'unknown',
      metadata: context.metadata || {},
      ...context
    };

    // Check if this error already exists
    const existingReport = this.reports.get(errorId);
    let report: ErrorReport;
    
    if (existingReport) {
      // Update existing report
      existingReport.count += 1;
      existingReport.lastSeen = now;
      existingReport.severity = severity; // Update severity if changed
      existingReport.category = category; // Update category if changed
      report = existingReport;
      
      this.logger.warn('ErrorTracker', `Error tracked (count: ${existingReport.count})`, {
        errorId,
        severity,
        category,
        message: error.message
      });
    } else {
      // Create new error report
      report = {
        id: errorId,
        severity,
        category,
        message: error.message,
        context: fullContext,
        count: 1,
        firstSeen: now,
        lastSeen: now,
        resolved: false,
        tags: this.generateTags(error, severity, category),
        timestamp: now
      };

      this.reports.set(errorId, report);
      
      this.logger.error('ErrorTracker', 'New error tracked', {
        errorId,
        severity,
        category,
        message: error.message
      });
    }

    // Update error counts
    const countKey = `${severity}:${category}`;
    this.errorCounts.set(countKey, (this.errorCounts.get(countKey) || 0) + 1);

    // Auto-report if enabled
    if (this.config.enableAutoReporting && severity === ErrorSeverity.CRITICAL) {
      this.reportError(errorId);
    }

    // Cleanup old reports if needed
    this.cleanupOldReports();

    return report;
  }

  public getErrorReport(errorId: string): ErrorReport | undefined {
    return this.reports.get(errorId);
  }

  public getAllErrors(): ErrorReport[] {
    return Array.from(this.reports.values());
  }

  public getErrorsBySeverity(severity: ErrorSeverity): ErrorReport[] {
    return Array.from(this.reports.values()).filter(report => report.severity === severity);
  }

  public getErrorsByCategory(category: ErrorCategory): ErrorReport[] {
    return Array.from(this.reports.values()).filter(report => report.category === category);
  }

  public getErrorStats(timeWindowHours: number = 24): ErrorStats {
    const now = Date.now();
    const timeWindow = {
      start: now - (timeWindowHours * 60 * 60 * 1000),
      end: now
    };

    const recentErrors = Array.from(this.reports.values())
      .filter(report => report.lastSeen >= timeWindow.start);

    const errorsBySeverity: Record<ErrorSeverity, number> = {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.CRITICAL]: 0
    };

    const errorsByCategory: Record<ErrorCategory, number> = {
      [ErrorCategory.NETWORK]: 0,
      [ErrorCategory.RENDERING]: 0,
      [ErrorCategory.SECURITY]: 0,
      [ErrorCategory.PERFORMANCE]: 0,
      [ErrorCategory.USER_INPUT]: 0,
      [ErrorCategory.SYSTEM]: 0,
      [ErrorCategory.THIRD_PARTY]: 0,
      [ErrorCategory.UNKNOWN]: 0
    };

    recentErrors.forEach(report => {
      errorsBySeverity[report.severity] += report.count;
      errorsByCategory[report.category] += report.count;
    });

    const topErrors = recentErrors
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const errorRate = recentErrors.length / timeWindowHours;

    return {
      totalErrors: recentErrors.length,
      errorsBySeverity,
      errorsByCategory,
      topErrors,
      recentErrors: recentErrors.slice(0, 20),
      errorRate,
      timeWindow
    };
  }

  public markErrorResolved(errorId: string): boolean {
    const report = this.reports.get(errorId);
    if (report) {
      report.resolved = true;
      this.logger.info('ErrorTracker', 'Error marked as resolved', { errorId });
      return true;
    }
    return false;
  }

  public reportError(errorId: string): boolean {
    const report = this.reports.get(errorId);
    if (!report) {
      return false;
    }

    // In a real implementation, this would send the error report to a remote service
    // For now, we'll just log it
    this.logger.error('ErrorTracker', 'Error report generated', {
      errorId,
      severity: report.severity,
      category: report.category,
      message: report.message,
      count: report.count,
      firstSeen: new Date(report.firstSeen).toISOString(),
      lastSeen: new Date(report.lastSeen).toISOString()
    });

    return true;
  }

  public exportErrors(): string {
    const errors = Array.from(this.reports.values());
    return JSON.stringify(errors, null, 2);
  }

  public clearErrors(): void {
    this.reports.clear();
    this.errorCounts.clear();
    this.logger.info('ErrorTracker', 'All error reports cleared');
  }

  public getRecentErrors(limit: number = 100): ErrorReport[] {
    return Array.from(this.reports.values())
      .sort((a, b) => b.lastSeen - a.lastSeen)
      .slice(0, limit);
  }

  public getConfig(): ErrorTrackerConfig {
    return { ...this.config };
  }

  public getHealthStatus(): { status: string; message: string; details: Record<string, unknown> } {
    const totalErrors = this.reports.size;
    const criticalErrors = Array.from(this.reports.values())
      .filter(report => report.severity === ErrorSeverity.CRITICAL).length;
    
    return {
      status: criticalErrors > 0 ? 'degraded' : 'healthy',
      message: `Error tracker operational with ${totalErrors} tracked errors`,
      details: {
        totalErrors,
        criticalErrors,
        maxReports: this.config.maxReports,
        privacyMode: this.config.privacyMode,
        autoReporting: this.config.enableAutoReporting
      }
    };
  }

  private generateErrorId(error: Error, context: Partial<ErrorContext>): string {
    // Create a unique ID based on error message, stack trace, and context
    const key = `${error.message}:${error.stack}:${context.component}:${context.action}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  private generateTags(error: Error, severity: ErrorSeverity, category: ErrorCategory): string[] {
    const tags: string[] = [severity, category];
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      tags.push('network');
    }
    if (error.message.includes('render') || error.message.includes('DOM')) {
      tags.push('rendering');
    }
    if (error.message.includes('security') || error.message.includes('auth')) {
      tags.push('security');
    }
    if (error.message.includes('performance') || error.message.includes('slow')) {
      tags.push('performance');
    }

    return tags;
  }

  private setupGlobalErrorHandlers(): void {
    if (typeof window === 'undefined') return;

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      const error = new Error(event.message);
      error.stack = event.error?.stack;
      
      this.trackError(
        error,
        ErrorSeverity.HIGH,
        ErrorCategory.SYSTEM,
        {
          component: 'global',
          action: 'uncaught_error',
          url: window.location.href,
          userAgent: navigator.userAgent
        }
      );
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = new Error(event.reason?.message || 'Unhandled promise rejection');
      error.stack = event.reason?.stack;
      
      this.trackError(
        error,
        ErrorSeverity.MEDIUM,
        ErrorCategory.SYSTEM,
        {
          component: 'global',
          action: 'unhandled_rejection',
          url: window.location.href,
          userAgent: navigator.userAgent
        }
      );
    });
  }

  private cleanupOldReports(): void {
    const maxAge = this.config.reportRetentionDays * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - maxAge;
    
    for (const [id, report] of this.reports.entries()) {
      if (report.lastSeen < cutoff) {
        this.reports.delete(id);
      }
    }

    // Also limit by max reports
    if (this.reports.size > this.config.maxReports) {
      const sortedReports = Array.from(this.reports.entries())
        .sort(([, a], [, b]) => a.lastSeen - b.lastSeen);
      
      const toDelete = sortedReports.slice(0, this.reports.size - this.config.maxReports);
      toDelete.forEach(([id]) => this.reports.delete(id));
    }
  }
}
