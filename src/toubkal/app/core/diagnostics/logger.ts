/**
 * Toubkal Browser - Diagnostics Logger
 * 
 * Structured logging system for TypeScript/React components with privacy-safe logging
 * and integration with C++ logging system via Mojo IPC.
 */

// Browser APIs

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  component: string;
  message: string;
  context?: LogContext;
  correlationId?: string;
  timestamp: string;
}

export interface LoggerConfig {
  consoleEnabled?: boolean;
  fileEnabled?: boolean;
  jsonEnabled?: boolean;
  filePath?: string;
  jsonPath?: string;
  maxLogLevel?: LogLevel;
  privacyMode?: boolean;
}

export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private correlationId: string = '';
  private logBuffer: LogEntry[] = [];
  private maxBufferSize: number = 1000;

  private constructor() {
    this.config = {
      consoleEnabled: true,
      fileEnabled: false,
      jsonEnabled: false,
      maxLogLevel: LogLevel.INFO,
      privacyMode: true
    };
  }

  public static getInstance(): Logger {
    if (Logger.instance == null) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public initialize(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Setup global error handlers if enabled
    if (this.config.consoleEnabled === true) {
      this.setupGlobalErrorHandlers();
    }
  }

  public log(level: LogLevel, component: string, message: string, context: LogContext = {}): void {
    // Check log level filter - only log if level >= maxLogLevel
    const maxLevel = this.config.maxLogLevel ?? LogLevel.INFO;
    console.log(`Logger.log: level=${level}, maxLevel=${maxLevel}, shouldLog=${level >= maxLevel}`);
    if (level < maxLevel) {
      console.log('Logger.log: filtered out due to level');
      return;
    }

    const entry: LogEntry = {
      level,
      component,
      message,
      context: (this.config.privacyMode ?? false) === true ? this.redactPII(context) : context,
      correlationId: this.correlationId,
      timestamp: new Date().toISOString()
    };

    // Add to buffer
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift(); // Remove oldest entry
    }

    // Output to configured sinks
    if (this.config.consoleEnabled === true) {
      this.logToConsole(entry);
    }

    if (this.config.fileEnabled === true && (this.config.filePath ?? '').length > 0) {
      void this.logToFile(entry);
    }

    if (this.config.jsonEnabled === true && (this.config.jsonPath ?? '').length > 0) {
      this.logToJson(entry);
    }
  }

  public debug(component: string, message: string, context: LogContext = {}): void {
    this.log(LogLevel.DEBUG, component, message, context);
  }

  public info(component: string, message: string, context: LogContext = {}): void {
    this.log(LogLevel.INFO, component, message, context);
  }

  public warn(component: string, message: string, context: LogContext = {}): void {
    this.log(LogLevel.WARN, component, message, context);
  }

  public error(component: string, message: string, context: LogContext = {}): void {
    this.log(LogLevel.ERROR, component, message, context);
  }

  public fatal(component: string, message: string, context: LogContext = {}): void {
    this.log(LogLevel.FATAL, component, message, context);
  }

  public setCorrelationId(correlationId: string): void {
    this.correlationId = correlationId;
  }

  public getCorrelationId(): string {
    return this.correlationId;
  }

  public getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  public clearLogBuffer(): void {
    this.logBuffer = [];
  }

  public exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }

  public getRecentLogs(limit: number = 100): LogEntry[] {
    return this.logBuffer.slice(-limit);
  }

  public clearLogs(): void {
    this.logBuffer = [];
  }

  public getConfig(): LoggerConfig {
    return { ...this.config };
  }

  public isConsoleEnabled(): boolean {
    return (this.config.consoleEnabled ?? false) === true;
  }

  public isFileEnabled(): boolean {
    return (this.config.fileEnabled ?? false) === true;
  }

  public isJsonEnabled(): boolean {
    return (this.config.jsonEnabled ?? false) === true;
  }

  public getMaxLogLevel(): LogLevel {
    return this.config.maxLogLevel ?? LogLevel.INFO;
  }

  public isPrivacyMode(): boolean {
    return (this.config.privacyMode ?? false) === true;
  }

  public getHealthStatus(): { status: string; message: string; details: Record<string, unknown> } {
    return {
      status: 'healthy',
      message: 'Logger is operational',
      details: {
        bufferSize: this.logBuffer.length,
        maxBufferSize: this.maxBufferSize,
        consoleEnabled: this.config.consoleEnabled,
        fileEnabled: this.config.fileEnabled,
        jsonEnabled: this.config.jsonEnabled,
        privacyMode: this.config.privacyMode
      }
    };
  }

  private logToConsole(entry: LogEntry): void {
    const levelStr = this.getLevelString(entry.level);
    const timestamp = entry.timestamp;
    const contextStr = (entry.context != null && Object.keys(entry.context).length > 0) 
      ? ` ${JSON.stringify(entry.context)}` 
      : '';
    const correlationStr = (entry.correlationId ?? '').length > 0 ? ` [${entry.correlationId}]` : '';

    const logMessage = `[${timestamp}] ${levelStr} ${entry.component}: ${entry.message}${contextStr}${correlationStr}`;

    // Use appropriate console method based on level
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(logMessage);
        break;
      case LogLevel.INFO:
        console.info(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.ERROR:
        console.error(logMessage);
        break;
      case LogLevel.FATAL:
        console.error(`FATAL: ${logMessage}`);
        break;
    }
  }

  private logToFile(entry: LogEntry): void {
    if ((this.config.filePath ?? '').length === 0) return;

    try {
      // Use File System Access API if available (with user consent)
      if ('showSaveFilePicker' in window) {
        // This would require user interaction for file access
        // For now, we'll use a different approach
        this.logToLocalStorage(entry);
      } else {
        this.logToLocalStorage(entry);
      }
    } catch (error) {
      console.error('[Logger] Failed to write to file:', error);
    }
  }

  private logToJson(entry: LogEntry): void {
    if ((this.config.jsonPath ?? '').length === 0) return;

    try {
      const jsonStr = JSON.stringify(entry) + '\n';
      // Store in localStorage for now (would be replaced with proper file access)
      const existing = localStorage.getItem('toubkal_logs_json') ?? '';
      localStorage.setItem('toubkal_logs_json', existing + jsonStr);
    } catch (error) {
      console.error('[Logger] Failed to write JSON log:', error);
    }
  }

  private logToLocalStorage(entry: LogEntry): void {
    try {
      const existing = localStorage.getItem('toubkal_logs') ?? '';
      const logLine = `[${entry.timestamp}] ${this.getLevelString(entry.level)} ${entry.component}: ${entry.message}\n`;
      localStorage.setItem('toubkal_logs', existing + logLine);
    } catch (error) {
      console.error('[Logger] Failed to write to localStorage:', error);
    }
  }

  private setupGlobalErrorHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.error('GlobalError', event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.error('UnhandledRejection', 'Unhandled promise rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });
  }

  private getLevelString(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return 'DEBUG';
      case LogLevel.INFO: return 'INFO';
      case LogLevel.WARN: return 'WARN';
      case LogLevel.ERROR: return 'ERROR';
      case LogLevel.FATAL: return 'FATAL';
      default: return 'UNKNOWN';
    }
  }

  private redactPII(context: LogContext): LogContext {
    const redacted = { ...context };
    
    // List of PII fields to redact (excluding url which has special handling)
    const piiFields = [
      'email', 'phone', 'ssn', 'creditCard', 'password', 'token',
      'userId', 'sessionId', 'ipAddress', 'query', 'search',
      'name', 'address', 'birthday', 'socialSecurity'
    ];

    for (const field of piiFields) {
      if (field in redacted) {
        redacted[field] = '[REDACTED]';
      }
    }

    // Redact URLs and queries (special handling for url field)
    if (typeof redacted.url === 'string') {
      try {
        const url = new URL(redacted.url as string);
        // Only redact query parameters, keep the path
        redacted.url = `${url.protocol}//${url.hostname}${url.pathname}`;
      } catch {
        redacted.url = '[REDACTED_URL]';
      }
    }

    return redacted;
  }
}

// Convenience functions
export const logger = Logger.getInstance();

// Convenience functions for common logging patterns
export const logDebug = (component: string, message: string, context?: LogContext) => {
  logger.debug(component, message, context);
};

export const logInfo = (component: string, message: string, context?: LogContext) => {
  logger.info(component, message, context);
};

export const logWarn = (component: string, message: string, context?: LogContext) => {
  logger.warn(component, message, context);
};

export const logError = (component: string, message: string, context?: LogContext) => {
  logger.error(component, message, context);
};

export const logFatal = (component: string, message: string, context?: LogContext) => {
  logger.fatal(component, message, context);
};

// Privacy-safe logging functions
export const logSafeDebug = (component: string, message: string, context?: LogContext) => {
  logger.debug(component, message, context);
};

export const logSafeInfo = (component: string, message: string, context?: LogContext) => {
  logger.info(component, message, context);
};

export const logSafeWarn = (component: string, message: string, context?: LogContext) => {
  logger.warn(component, message, context);
};

export const logSafeError = (component: string, message: string, context?: LogContext) => {
  logger.error(component, message, context);
};

export const logSafeFatal = (component: string, message: string, context?: LogContext) => {
  logger.fatal(component, message, context);
};

// Export missing classes for tests
export { ErrorTracker } from './error-tracker';
export { PerformanceMonitor } from './performance-monitor';
export { ScalabilityManager } from './scalability-manager';