/**
 * Error Tracker Tests
 * 
 * Comprehensive test suite for the Error Tracker system.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ErrorTracker, ErrorSeverity, ErrorCategory } from './error-tracker';

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

describe('ErrorTracker', () => {
  let errorTracker: ErrorTracker;

  beforeEach(() => {
    errorTracker = ErrorTracker.getInstance();
    
    // Clear any existing state
    errorTracker.clearErrors();
    
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
      errorTracker.initialize();
      
      expect(mockLogger.info).toHaveBeenCalledWith(
        'ErrorTracker',
        'Error tracking system initialized',
        expect.objectContaining({
          maxReports: 1000,
          privacyMode: true
        })
      );
    });

    it('should initialize with custom config', () => {
      const customConfig = {
        maxReports: 500,
        reportRetentionDays: 7,
        enableAutoReporting: false,
        privacyMode: false
      };
      
      errorTracker.initialize(customConfig);
      
      expect(mockLogger.info).toHaveBeenCalledWith(
        'ErrorTracker',
        'Error tracking system initialized',
        expect.objectContaining({
          maxReports: 500,
          privacyMode: false
        })
      );
    });
  });

  describe('error tracking', () => {
    beforeEach(() => {
      errorTracker.initialize();
    });

    it('should track a new error', () => {
      const error = new Error('Test error message');
      const errorId = errorTracker.trackError(
        error,
        ErrorSeverity.HIGH,
        ErrorCategory.System,
        { component: 'test-component', action: 'test-action' }
      );

      expect(errorId).toBeDefined();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'ErrorTracker',
        'New error tracked',
        expect.objectContaining({
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.System,
          message: 'Test error message'
        })
      );
    });

    it('should track the same error multiple times', () => {
      const error = new Error('Duplicate error');
      const context = { component: 'test', action: 'test' };
      
      const errorId1 = errorTracker.trackError(error, ErrorSeverity.MEDIUM, ErrorCategory.UNKNOWN, context);
      const errorId2 = errorTracker.trackError(error, ErrorSeverity.MEDIUM, ErrorCategory.UNKNOWN, context);

      expect(errorId1).toBe(errorId2);
      
      const report = errorId1;
      expect(report).toBeDefined();
      expect(report?.count).toBe(2);
    });

    it('should generate unique IDs for different errors', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');
      
      const id1 = errorTracker.trackError(error1);
      const id2 = errorTracker.trackError(error2);

      expect(id1).not.toBe(id2);
    });

    it('should update severity and category for existing errors', () => {
      const error = new Error('Test error');
      const context = { component: 'test', action: 'test' };
      
      const errorId = errorTracker.trackError(error, ErrorSeverity.LOW, ErrorCategory.UNKNOWN, context);
      errorTracker.trackError(error, ErrorSeverity.HIGH, ErrorCategory.SECURITY, context);
      
      const report = errorId;
      expect(report?.severity).toBe(ErrorSeverity.HIGH);
      expect(report?.category).toBe(ErrorCategory.SECURITY);
      expect(report?.count).toBe(2);
    });
  });

  describe('error retrieval', () => {
    beforeEach(() => {
      errorTracker.initialize();
    });

    it('should get error report by ID', () => {
      const error = new Error('Test error');
      const errorId = errorTracker.trackError(error);
      
      const report = errorId;
      expect(report).toBeDefined();
      expect(report?.message).toBe('Test error');
      expect(report?.count).toBe(1);
    });

    it('should return undefined for non-existent error ID', () => {
      const report = errorTracker.getErrorReport('non-existent-id');
      expect(report).toBeUndefined();
    });

    it('should get all errors', () => {
      errorTracker.trackError(new Error('Error 1'));
      errorTracker.trackError(new Error('Error 2'));
      
      const allErrors = errorTracker.getAllErrors();
      expect(allErrors).toHaveLength(2);
    });

    it('should get errors by severity', () => {
      errorTracker.trackError(new Error('High error'), ErrorSeverity.HIGH);
      errorTracker.trackError(new Error('Low error'), ErrorSeverity.LOW);
      errorTracker.trackError(new Error('Another high error'), ErrorSeverity.HIGH);
      
      const highErrors = errorTracker.getErrorsBySeverity(ErrorSeverity.HIGH);
      expect(highErrors).toHaveLength(2);
      
      const lowErrors = errorTracker.getErrorsBySeverity(ErrorSeverity.LOW);
      expect(lowErrors).toHaveLength(1);
    });

    it('should get errors by category', () => {
      errorTracker.trackError(new Error('Network error'), ErrorSeverity.MEDIUM, ErrorCategory.NETWORK);
      errorTracker.trackError(new Error('Security error'), ErrorSeverity.HIGH, ErrorCategory.SECURITY);
      errorTracker.trackError(new Error('Another network error'), ErrorSeverity.MEDIUM, ErrorCategory.NETWORK);
      
      const networkErrors = errorTracker.getErrorsByCategory(ErrorCategory.NETWORK);
      expect(networkErrors).toHaveLength(2);
      
      const securityErrors = errorTracker.getErrorsByCategory(ErrorCategory.SECURITY);
      expect(securityErrors).toHaveLength(1);
    });
  });

  describe('error statistics', () => {
    beforeEach(() => {
      errorTracker.initialize();
    });

    it('should generate error statistics', () => {
      // Create some test errors
      errorTracker.trackError(new Error('High error'), ErrorSeverity.HIGH, ErrorCategory.System);
      errorTracker.trackError(new Error('Medium error'), ErrorSeverity.MEDIUM, ErrorCategory.NETWORK);
      errorTracker.trackError(new Error('Another high error'), ErrorSeverity.HIGH, ErrorCategory.SECURITY);
      
      const stats = errorTracker.getErrorStats();
      
      expect(stats.totalErrors).toBe(3);
      expect(stats.errorsBySeverity[ErrorSeverity.HIGH]).toBe(2);
      expect(stats.errorsBySeverity[ErrorSeverity.MEDIUM]).toBe(1);
      expect(stats.errorsByCategory[ErrorCategory.System]).toBe(1);
      expect(stats.errorsByCategory[ErrorCategory.NETWORK]).toBe(1);
      expect(stats.errorsByCategory[ErrorCategory.SECURITY]).toBe(1);
      expect(stats.topErrors).toHaveLength(3);
      expect(stats.recentErrors).toHaveLength(3);
    });

    it('should calculate error rate correctly', () => {
      errorTracker.trackError(new Error('Test error'));
      
      const stats = errorTracker.getErrorStats(1); // 1 hour window
      expect(stats.errorRate).toBeGreaterThan(0);
    });
  });

  describe('error resolution', () => {
    beforeEach(() => {
      errorTracker.initialize();
    });

    it('should mark error as resolved', () => {
      const error = new Error('Test error');
      const errorId = errorTracker.trackError(error);
      
      const result = errorTracker.markErrorResolved(errorId.id);
      expect(result).toBe(true);
      
      const report = errorId;
      expect(report?.resolved).toBe(true);
    });

    it('should return false for non-existent error ID', () => {
      const result = errorTracker.markErrorResolved('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('error reporting', () => {
    beforeEach(() => {
      errorTracker.initialize();
    });

    it('should report error', () => {
      const error = new Error('Test error');
      const errorId = errorTracker.trackError(error);
      
      const result = errorTracker.reportError(errorId.id);
      expect(result).toBe(true);
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'ErrorTracker',
        'Error report generated',
        expect.objectContaining({
          errorId,
          message: 'Test error'
        })
      );
    });

    it('should return false for non-existent error ID', () => {
      const result = errorTracker.reportError('non-existent-id');
      expect(result).toBe(false);
    });

    it('should auto-report critical errors when enabled', () => {
      // Ensure auto-reporting is enabled
      errorTracker.initialize({
        enableAutoReporting: true
      });
      
      const error = new Error('Critical error');
      errorTracker.trackError(error, ErrorSeverity.CRITICAL);
      
      // Should have been auto-reported - check for both the initial tracking and the report
      expect(mockLogger.error).toHaveBeenCalledWith(
        'ErrorTracker',
        'New error tracked',
        expect.any(Object)
      );
      
      // The auto-report should also be called - check that it was called at least once
      expect(mockLogger.error).toHaveBeenCalledTimes(2);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'ErrorTracker',
        'Error report generated',
        expect.any(Object)
      );
    });
  });

  describe('error export and cleanup', () => {
    beforeEach(() => {
      errorTracker.initialize();
    });

    it('should export errors as JSON', () => {
      errorTracker.trackError(new Error('Test error 1'));
      errorTracker.trackError(new Error('Test error 2'));
      
      const exported = errorTracker.exportErrors();
      expect(exported).toBeDefined();
      
      const parsed = JSON.parse(exported);
      expect(parsed).toHaveLength(2);
      expect(parsed[0]).toHaveProperty('id');
      expect(parsed[0]).toHaveProperty('message');
      expect(parsed[0]).toHaveProperty('severity');
      expect(parsed[0]).toHaveProperty('category');
    });

    it('should clear all errors', () => {
      errorTracker.trackError(new Error('Test error 1'));
      errorTracker.trackError(new Error('Test error 2'));
      
      expect(errorTracker.getAllErrors()).toHaveLength(2);
      
      errorTracker.clearErrors();
      
      expect(errorTracker.getAllErrors()).toHaveLength(0);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'ErrorTracker',
        'All error reports cleared'
      );
    });
  });

  describe('error context and metadata', () => {
    beforeEach(() => {
      errorTracker.initialize();
    });

    it('should preserve error context', () => {
      const error = new Error('Test error');
      const context = {
        userId: 'user123',
        sessionId: 'session456',
        url: 'https://example.com',
        userAgent: 'Mozilla/5.0',
        component: 'test-component',
        action: 'test-action',
        metadata: { key: 'value' }
      };
      
      const errorId = errorTracker.trackError(error, ErrorSeverity.MEDIUM, ErrorCategory.UNKNOWN, context);
      const report = errorId;
      
      expect(report?.context.userId).toBe('user123');
      expect(report?.context.sessionId).toBe('session456');
      expect(report?.context.url).toBe('https://example.com');
      expect(report?.context.userAgent).toBe('Mozilla/5.0');
      expect(report?.context.component).toBe('test-component');
      expect(report?.context.action).toBe('test-action');
      expect(report?.context.metadata).toEqual({ key: 'value' });
    });

    it('should generate appropriate tags', () => {
      const error = new Error('Network fetch failed');
      const errorId = errorTracker.trackError(error, ErrorSeverity.HIGH, ErrorCategory.NETWORK);
      const report = errorId;
      
      expect(report?.tags).toContain('high');
      expect(report?.tags).toContain('network');
      expect(report?.tags).toContain('network'); // Content-based tag
    });
  });

  describe('global error handlers', () => {
    beforeEach(() => {
      errorTracker.initialize();
    });

    it('should handle uncaught errors', () => {
      // Mock window and addEventListener
      const mockAddEventListener = vi.fn();
      Object.defineProperty(global, 'window', {
        value: {
          addEventListener: mockAddEventListener,
          location: { href: 'https://example.com' }
        },
        writable: true
      });
      
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0' },
        writable: true
      });

      // Re-initialize to set up handlers
      errorTracker.initialize();
      
      expect(mockAddEventListener).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    });
  });

  describe('error cleanup and retention', () => {
    it('should cleanup old reports when max reports exceeded', () => {
      const config = {
        maxReports: 2,
        reportRetentionDays: 1
      };
      
      errorTracker.initialize(config);
      
      // Add more errors than maxReports
      errorTracker.trackError(new Error('Error 1'));
      errorTracker.trackError(new Error('Error 2'));
      errorTracker.trackError(new Error('Error 3'));
      
      // Should have cleaned up to maxReports
      expect(errorTracker.getAllErrors().length).toBeLessThanOrEqual(2);
    });
  });
});
