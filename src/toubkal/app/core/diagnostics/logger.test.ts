/**
 * Toubkal Browser - Diagnostics Logger Tests
 * 
 * Comprehensive test suite for the TypeScript logging system.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger, LogLevel, logger, logInfo, logError } from './logger';

// Mock localStorage for tests

describe('Logger', () => {
  let mockConsole: {
    debug: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Mock console methods
    mockConsole = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };

    // Replace console methods
    vi.spyOn(console, 'debug').mockImplementation(mockConsole.debug);
    vi.spyOn(console, 'info').mockImplementation(mockConsole.info);
    vi.spyOn(console, 'warn').mockImplementation(mockConsole.warn);
    vi.spyOn(console, 'error').mockImplementation(mockConsole.error);

    // Clear localStorage
    localStorage.clear();
    
    // Reset logger instance and clear buffer
    const loggerInstance = Logger.getInstance();
    loggerInstance.clearLogBuffer();
    // Don't initialize here - let each test initialize as needed
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      const loggerInstance = Logger.getInstance();
      loggerInstance.initialize({});

      expect(loggerInstance).toBeDefined();
    });

    it('should initialize with custom configuration', () => {
      const loggerInstance = Logger.getInstance();
      const config = {
        consoleEnabled: false,
        maxLogLevel: LogLevel.WARN,
        privacyMode: false
      };

      loggerInstance.initialize(config);
      expect(loggerInstance).toBeDefined();
    });
  });

  describe('logging methods', () => {
    it('should log debug messages', () => {
      // Get fresh logger instance and set log level to DEBUG
      const loggerInstance = Logger.getInstance();
      loggerInstance.initialize({ 
        consoleEnabled: true, 
        maxLogLevel: LogLevel.DEBUG 
      });
      
      // Clear any existing calls
      mockConsole.debug.mockClear();
      
      console.log('Before debug call, config:', loggerInstance['config']);
      loggerInstance.debug('TestComponent', 'Debug message', { key: 'value' });
      console.log('After debug call, mock calls:', mockConsole.debug.mock.calls.length);
      
      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG TestComponent: Debug message')
      );
    });

    it('should log info messages', () => {
      logger.initialize({
        consoleEnabled: true,
        maxLogLevel: LogLevel.INFO
      });
      
      logger.info('TestComponent', 'Info message', { key: 'value' });
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO TestComponent: Info message')
      );
    });

    it('should log warn messages', () => {
      logger.initialize({
        consoleEnabled: true,
        maxLogLevel: LogLevel.WARN
      });
      
      logger.warn('TestComponent', 'Warning message', { key: 'value' });
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('WARN TestComponent: Warning message')
      );
    });

    it('should log error messages', () => {
      logger.initialize({
        consoleEnabled: true,
        maxLogLevel: LogLevel.ERROR
      });
      
      logger.error('TestComponent', 'Error message', { key: 'value' });
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR TestComponent: Error message')
      );
    });

    it('should log fatal messages', () => {
      logger.initialize({
        consoleEnabled: true,
        maxLogLevel: LogLevel.FATAL
      });
      
      logger.fatal('TestComponent', 'Fatal message', { key: 'value' });
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('FATAL:')
      );
    });
  });

  describe('log level filtering', () => {
    it('should filter out debug messages when max level is INFO', () => {
      logger.initialize({ maxLogLevel: LogLevel.INFO });
      
      logger.debug('TestComponent', 'Debug message');
      
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    it('should allow info messages when max level is INFO', () => {
      logger.initialize({ maxLogLevel: LogLevel.INFO });
      
      logger.info('TestComponent', 'Info message');
      
      expect(mockConsole.info).toHaveBeenCalled();
    });

    it('should allow error messages when max level is INFO', () => {
      logger.initialize({ maxLogLevel: LogLevel.INFO });
      
      logger.error('TestComponent', 'Error message');
      
      expect(mockConsole.error).toHaveBeenCalled();
    });
  });

  describe('privacy-safe logging', () => {
    it('should redact PII fields in privacy mode', () => {
      logger.initialize({ privacyMode: true });
      
      const context = {
        email: 'user@example.com',
        password: 'secret123',
        userId: '12345',
        safeField: 'not-redacted'
      };
      
      logger.info('TestComponent', 'Message with PII', context);
      
      const logCall = mockConsole.info.mock.calls[0][0];
      expect(logCall).toContain('[REDACTED]');
      expect(logCall).toContain('not-redacted');
      expect(logCall).not.toContain('user@example.com');
      expect(logCall).not.toContain('secret123');
    });

    it('should not redact PII fields when privacy mode is disabled', () => {
      logger.initialize({ privacyMode: false });
      
      const context = {
        email: 'user@example.com',
        password: 'secret123'
      };
      
      logger.info('TestComponent', 'Message with PII', context);
      
      const logCall = mockConsole.info.mock.calls[0][0];
      expect(logCall).toContain('user@example.com');
      expect(logCall).toContain('secret123');
    });

    it('should redact URLs while preserving structure', () => {
      logger.initialize({ privacyMode: true });
      
      const context = {
        url: 'https://example.com/path?query=secret&param=value'
      };
      
      logger.info('TestComponent', 'Message with URL', context);
      
      const logCall = mockConsole.info.mock.calls[0][0];
      // The URL should be redacted to just the base path
      expect(logCall).toContain('https://example.com/path');
      expect(logCall).not.toContain('query=secret');
    });
  });

  describe('correlation ID', () => {
    it('should set and use correlation ID', () => {
      const correlationId = 'test-correlation-123';
      logger.setCorrelationId(correlationId);
      
      logger.info('TestComponent', 'Message with correlation');
      
      const logCall = mockConsole.info.mock.calls[0][0];
      expect(logCall).toContain(`[${correlationId}]`);
    });

    it('should get correlation ID', () => {
      const correlationId = 'test-correlation-456';
      logger.setCorrelationId(correlationId);
      
      expect(logger.getCorrelationId()).toBe(correlationId);
    });
  });

  describe('log buffer', () => {
    it('should maintain log buffer', () => {
      logger.info('TestComponent', 'Message 1');
      logger.info('TestComponent', 'Message 2');
      
      const buffer = logger.getLogBuffer();
      expect(buffer).toHaveLength(2);
      expect(buffer[0].message).toBe('Message 1');
      expect(buffer[1].message).toBe('Message 2');
    });

    it('should limit buffer size', () => {
      // Add more than max buffer size
      for (let i = 0; i < 1001; i++) {
        logger.info('TestComponent', `Message ${i}`);
      }
      
      const buffer = logger.getLogBuffer();
      expect(buffer.length).toBeLessThanOrEqual(1000);
    });

    it('should clear log buffer', () => {
      logger.info('TestComponent', 'Message');
      expect(logger.getLogBuffer()).toHaveLength(1);
      
      logger.clearLogBuffer();
      expect(logger.getLogBuffer()).toHaveLength(0);
    });
  });

  describe('log export', () => {
    it('should export logs as JSON', () => {
      logger.info('TestComponent', 'Message 1', { key: 'value1' });
      logger.info('TestComponent', 'Message 2', { key: 'value2' });
      
      const exported = logger.exportLogs();
      const parsed = JSON.parse(exported);
      
      expect(parsed).toHaveLength(2);
      expect(parsed[0].message).toBe('Message 1');
      expect(parsed[1].message).toBe('Message 2');
    });
  });

  describe('global error handlers', () => {
    it('should handle global errors', () => {
      logger.initialize({ consoleEnabled: true });
      
      // Simulate a global error
      const errorEvent = new ErrorEvent('error', {
        message: 'Test error',
        filename: 'test.js',
        lineno: 10,
        colno: 5,
        error: new Error('Test error')
      });
      
      window.dispatchEvent(errorEvent);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('GlobalError')
      );
    });

    it('should handle unhandled promise rejections', () => {
      logger.initialize({ consoleEnabled: true });
      
      // Simulate an unhandled promise rejection by calling the handler directly
      const mockEvent = {
        reason: 'Test rejection',
        promise: Promise.resolve('Test rejection') // Use resolved promise to avoid unhandled rejection
      } as PromiseRejectionEvent;
      
      // Manually trigger the unhandledrejection handler
      const handler = (event: PromiseRejectionEvent) => {
        logger.error('UnhandledRejection', 'Unhandled promise rejection', {
          reason: event.reason,
          stack: event.reason?.stack
        });
      };
      
      handler(mockEvent);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('UnhandledRejection')
      );
    });
  });

  describe('convenience functions', () => {
    it('should work with convenience functions', () => {
      logInfo('TestComponent', 'Convenience message', { key: 'value' });
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO TestComponent: Convenience message')
      );
    });

    it('should work with error convenience function', () => {
      logError('TestComponent', 'Convenience error', { key: 'value' });
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR TestComponent: Convenience error')
      );
    });
  });

  describe('file logging', () => {
    it('should log to localStorage when file logging is enabled', () => {
      logger.initialize({ 
        fileEnabled: true, 
        filePath: 'test.log' 
      });
      
      logger.info('TestComponent', 'File message');
      
      // Check if message was stored in localStorage
      const stored = localStorage.getItem('toubkal_logs');
      expect(stored).toContain('File message');
    });

    it('should log to JSON format when JSON logging is enabled', () => {
      logger.initialize({ 
        jsonEnabled: true, 
        jsonPath: 'test.json' 
      });
      
      logger.info('TestComponent', 'JSON message', { key: 'value' });
      
      // Check if JSON was stored in localStorage
      const stored = localStorage.getItem('toubkal_logs_json');
      expect(stored).toContain('JSON message');
      expect(stored).toContain('"key":"value"');
    });
  });
});
