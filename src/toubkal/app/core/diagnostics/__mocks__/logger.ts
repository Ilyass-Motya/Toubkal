import { vi } from 'vitest';

export const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  fatal: vi.fn(),
  getRecentLogs: vi.fn(() => []),
  initialize: vi.fn(),
  clearLogBuffer: vi.fn(),
  getLogBuffer: vi.fn(() => [])
};

export const Logger = {
  getInstance: vi.fn(() => mockLogger)
};

export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

export const logger = mockLogger;

// Export other classes that might be imported
export const ErrorTracker = {
  getInstance: vi.fn(() => ({
    clearErrors: vi.fn(),
    getRecentErrors: vi.fn(() => []),
    trackError: vi.fn(() => ({ id: 'test-id' })),
    reportError: vi.fn(() => true)
  }))
};

export const PerformanceMonitor = {
  getInstance: vi.fn(() => ({
    clearMetrics: vi.fn(),
    getRecentMetrics: vi.fn(() => []),
    trackMetric: vi.fn(),
    getMetrics: vi.fn(() => [])
  }))
};

export const ScalabilityManager = {
  getInstance: vi.fn(() => ({
    clearMetrics: vi.fn(),
    getScalabilityMetrics: vi.fn(() => []),
    getClusterState: vi.fn(() => ({ nodes: [] }))
  }))
};
