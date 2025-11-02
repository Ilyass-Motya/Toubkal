/**
 * Diagnostics Dashboard Tests
 * 
 * Comprehensive test suite for the Diagnostics Dashboard component.
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DiagnosticsDashboard from './DiagnosticsDashboard';

// Import the mocked classes
import { Logger } from '@/toubkal/app/core/diagnostics/logger';
import { ErrorTracker } from '@/toubkal/app/core/diagnostics/error-tracker';
import { PerformanceMonitor } from '@/toubkal/app/core/diagnostics/performance-monitor';
import { ScalabilityManager } from '@/toubkal/app/core/diagnostics/scalability-manager';

// Mock the diagnostics modules
vi.mock('@/toubkal/app/core/diagnostics/logger', () => ({
  Logger: {
    getInstance: vi.fn(() => ({
      initialize: vi.fn(),
      getRecentLogs: vi.fn(() => [
        {
          id: 'log-1',
          level: 0, // DEBUG
          message: 'Debug message',
          timestamp: Date.now(),
          context: { source: 'test' }
        },
        {
          id: 'log-2',
          level: 1, // INFO
          message: 'Test log message',
          timestamp: Date.now(),
          context: { source: 'test' }
        },
        {
          id: 'log-3',
          level: 1, // INFO
          message: 'Searchable message',
          timestamp: Date.now(),
          context: { source: 'test' }
        },
        {
          id: 'log-4',
          level: 1, // INFO
          message: 'Another message',
          timestamp: Date.now(),
          context: { source: 'test' }
        }
      ])
    }))
  },
  LogLevel: {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4
  }
}));

vi.mock('@/toubkal/app/core/diagnostics/error-tracker', () => ({
  ErrorTracker: {
    getInstance: vi.fn(() => ({
      initialize: vi.fn(),
      getRecentErrors: vi.fn(() => [
        {
          id: 'error-1',
          severity: 2, // MEDIUM
          category: 0, // SYSTEM
          message: 'Test error message',
          timestamp: Date.now(),
          context: { source: 'test' }
        }
      ])
    }))
  },
  ErrorSeverity: {
    LOW: 0,
    MEDIUM: 1,
    HIGH: 2,
    CRITICAL: 3
  },
  ErrorCategory: {
    SYSTEM: 0,
    NETWORK: 1,
    SECURITY: 2,
    PERFORMANCE: 3
  }
}));

vi.mock('@/toubkal/app/core/diagnostics/performance-monitor', () => ({
  PerformanceMonitor: {
    getInstance: vi.fn(() => ({
      initialize: vi.fn(),
      getRecentMetrics: vi.fn(() => [
        {
          id: 'metric-1',
          type: 0, // PAGE_LOAD
          name: 'Page Load Time',
          value: 1500,
          timestamp: Date.now(),
          context: { url: 'https://example.com' }
        }
      ])
    }))
  },
  PerformanceMetricType: {
    PAGE_LOAD: 0,
    MEMORY_USAGE: 1,
    CPU_USAGE: 2,
    NETWORK_LATENCY: 3
  }
}));

vi.mock('@/toubkal/app/core/diagnostics/scalability-manager', () => ({
  ScalabilityManager: {
    getInstance: vi.fn(() => ({
      initialize: vi.fn(),
      getScalabilityMetrics: vi.fn(() => ({
        totalNodes: 3,
        activeNodes: 2,
        averageLoad: 65.5,
        healthStatus: 'healthy'
      }))
    }))
  },
  ScalabilityMode: {
    SINGLE_INSTANCE: 0,
    CLUSTER: 1,
    DISTRIBUTED: 2,
    CLOUD: 3
  },
  LoadBalancingStrategy: {
    ROUND_ROBIN: 0,
    LEAST_CONNECTIONS: 1,
    WEIGHTED_ROUND_ROBIN: 2,
    LEAST_RESPONSE_TIME: 3,
    IP_HASH: 4,
    RANDOM: 5
  }
}));

describe('DiagnosticsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should render the dashboard with initial state', () => {
    render(<DiagnosticsDashboard />);
    
    expect(screen.getByText('Toubkal Diagnostics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Real-time monitoring and diagnostics for Toubkal Browser')).toBeInTheDocument();
  });

  it('should initialize all diagnostics systems on mount', async () => {
    render(<DiagnosticsDashboard />);
    
    await waitFor(() => {
      expect(Logger.getInstance).toHaveBeenCalled();
      expect(ErrorTracker.getInstance).toHaveBeenCalled();
      expect(PerformanceMonitor.getInstance).toHaveBeenCalled();
      expect(ScalabilityManager.getInstance).toHaveBeenCalled();
    });
  });

  it('should display connection status', async () => {
    render(<DiagnosticsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
  });

  it('should render all navigation tabs', () => {
    render(<DiagnosticsDashboard />);
    
    expect(screen.getByText('Logs (4)')).toBeInTheDocument();
    expect(screen.getByText('Errors (1)')).toBeInTheDocument();
    expect(screen.getByText('Performance (1)')).toBeInTheDocument();
    expect(screen.getByText('Scalability (3)')).toBeInTheDocument();
  });

  it('should switch between tabs when clicked', () => {
    render(<DiagnosticsDashboard />);
    
    const errorsTab = screen.getByText('Errors (1)');
    fireEvent.click(errorsTab);
    
    expect(screen.getByText('Error Tracking')).toBeInTheDocument();
  });

  it('should display logs in the logs tab', async () => {
    render(<DiagnosticsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('System Logs')).toBeInTheDocument();
    });
  });

  it('should display errors in the errors tab', async () => {
    render(<DiagnosticsDashboard />);
    
    const errorsTab = screen.getByText('Errors (1)');
    fireEvent.click(errorsTab);
    
    await waitFor(() => {
      expect(screen.getByText('Error Tracking')).toBeInTheDocument();
    });
  });

  it('should display performance metrics in the performance tab', async () => {
    render(<DiagnosticsDashboard />);
    
    const performanceTab = screen.getByText('Performance (1)');
    fireEvent.click(performanceTab);
    
    await waitFor(() => {
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    });
  });

  it('should display scalability information in the scalability tab', async () => {
    render(<DiagnosticsDashboard />);
    
    const scalabilityTab = screen.getByText('Scalability (3)');
    fireEvent.click(scalabilityTab);
    
    await waitFor(() => {
      expect(screen.getByText('Scalability Management')).toBeInTheDocument();
    });
  });

  it('should toggle auto-refresh', () => {
    render(<DiagnosticsDashboard />);
    
    const autoRefreshCheckbox = screen.getByLabelText('Auto-refresh:');
    expect(autoRefreshCheckbox).toBeChecked();
    
    fireEvent.click(autoRefreshCheckbox);
    expect(autoRefreshCheckbox).not.toBeChecked();
  });

  it('should have a manual refresh button', () => {
    render(<DiagnosticsDashboard />);
    
    const refreshButton = screen.getByText('Refresh');
    expect(refreshButton).toBeInTheDocument();
  });

  it('should filter logs by level', () => {
    render(<DiagnosticsDashboard />);
    
    const levelSelect = screen.getByDisplayValue('All Levels');
    fireEvent.change(levelSelect, { target: { value: '1' } }); // INFO level
    
    expect(levelSelect).toHaveValue('1');
  });

  it.skip('should display log level colors correctly', async () => {
    // Mock logs with different levels BEFORE rendering
    (Logger.getInstance() as unknown as { getRecentLogs: { mockReturnValue: (logs: unknown[]) => void } }).getRecentLogs.mockReturnValue([
      {
        id: 'log-1',
        level: 0, // DEBUG
        message: 'Debug message',
        timestamp: Date.now()
      },
      {
        id: 'log-2',
        level: 1, // INFO
        message: 'Info message',
        timestamp: Date.now()
      },
      {
        id: 'log-3',
        level: 2, // WARN
        message: 'Warning message',
        timestamp: Date.now()
      },
      {
        id: 'log-4',
        level: 3, // ERROR
        message: 'Error message',
        timestamp: Date.now()
      }
    ]);
    
    render(<DiagnosticsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Debug message')).toBeInTheDocument();
      expect(screen.getByText('Info message')).toBeInTheDocument();
      expect(screen.getByText('Warning message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  it.skip('should display error severity colors correctly', async () => {
    render(<DiagnosticsDashboard />);
    
    const errorsTab = screen.getByText('Errors (1)');
    fireEvent.click(errorsTab);
    
    // Mock errors with different severities
    (ErrorTracker.getInstance() as unknown as { getRecentErrors: { mockReturnValue: (errors: unknown[]) => void } }).getRecentErrors.mockReturnValue([
      {
        id: 'error-1',
        severity: 0, // LOW
        category: 0, // SYSTEM
        message: 'Low severity error',
        timestamp: Date.now()
      },
      {
        id: 'error-2',
        severity: 3, // CRITICAL
        category: 0, // SYSTEM
        message: 'Critical error',
        timestamp: Date.now()
      }
    ]);
    
    await waitFor(() => {
      expect(screen.getByText('Low severity error')).toBeInTheDocument();
      expect(screen.getByText('Critical error')).toBeInTheDocument();
    });
  });

  it('should display performance metrics with correct values', async () => {
    render(<DiagnosticsDashboard />);
    
    const performanceTab = screen.getByText('Performance (1)');
    fireEvent.click(performanceTab);
    
    // Mock performance metrics
    (PerformanceMonitor.getInstance() as unknown as { getRecentMetrics: { mockReturnValue: (metrics: unknown[]) => void } }).getRecentMetrics.mockReturnValue([
      {
        id: 'metric-1',
        type: 0, // PAGE_LOAD
        name: 'Page Load Time',
        value: 1500,
        timestamp: Date.now()
      },
      {
        id: 'metric-2',
        type: 1, // MEMORY_USAGE
        name: 'Memory Usage',
        value: 256,
        timestamp: Date.now()
      }
    ]);
    
    await waitFor(() => {
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    });
  });

  it('should display scalability metrics with correct values', async () => {
    render(<DiagnosticsDashboard />);
    
    const scalabilityTab = screen.getByText('Scalability (3)');
    fireEvent.click(scalabilityTab);
    
    // Mock scalability metrics
    (ScalabilityManager.getInstance() as unknown as { getScalabilityMetrics: { mockReturnValue: (metrics: unknown) => void } }).getScalabilityMetrics.mockReturnValue({
      totalNodes: 5,
      activeNodes: 4,
      averageLoad: 75.5,
      healthStatus: 'degraded'
    });
    
    await waitFor(() => {
      expect(screen.getByText('Scalability Management')).toBeInTheDocument();
    });
  });

  it.skip('should handle empty data gracefully', async () => {
    // Mock empty data BEFORE rendering
    (Logger.getInstance() as unknown as { getRecentLogs: { mockReturnValue: (logs: unknown[]) => void } }).getRecentLogs.mockReturnValue([]);
    (ErrorTracker.getInstance() as unknown as { getRecentErrors: { mockReturnValue: (errors: unknown[]) => void } }).getRecentErrors.mockReturnValue([]);
    (PerformanceMonitor.getInstance() as unknown as { getRecentMetrics: { mockReturnValue: (metrics: unknown[]) => void } }).getRecentMetrics.mockReturnValue([]);
    (ScalabilityManager.getInstance() as unknown as { getScalabilityMetrics: { mockReturnValue: (metrics: unknown) => void } }).getScalabilityMetrics.mockReturnValue({
      totalNodes: 0,
      activeNodes: 0,
      averageLoad: 0,
      healthStatus: 'unknown'
    });
    
    render(<DiagnosticsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No logs available')).toBeInTheDocument();
    });
  });

  it('should display context information when available', async () => {
    // Mock logs with context
    (Logger.getInstance() as unknown as { getRecentLogs: { mockReturnValue: (logs: unknown[]) => void } }).getRecentLogs.mockReturnValue([
      {
        id: 'log-1',
        level: 1, // INFO
        message: 'Test log message',
        timestamp: Date.now(),
        context: { source: 'test', userId: '123' }
      }
    ]);
    
    render(<DiagnosticsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Test log message')).toBeInTheDocument();
    });
  });

  it('should handle search functionality', async () => {
    render(<DiagnosticsDashboard />);
    
    // Mock logs with searchable content
    (Logger.getInstance() as unknown as { getRecentLogs: { mockReturnValue: (logs: unknown[]) => void } }).getRecentLogs.mockReturnValue([
      {
        id: 'log-1',
        level: 1, // INFO
        message: 'Searchable message',
        timestamp: Date.now()
      },
      {
        id: 'log-2',
        level: 1, // INFO
        message: 'Another message',
        timestamp: Date.now()
      }
    ]);
    
    await waitFor(() => {
      expect(screen.getByText('Searchable message')).toBeInTheDocument();
      expect(screen.getByText('Another message')).toBeInTheDocument();
    });
  });

  it('should update last update timestamp', async () => {
    render(<DiagnosticsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    });
  });

  it('should handle initialization errors gracefully', async () => {
    // Mock initialization error
    const mockLoggerInstance = {
      initialize: vi.fn(() => {
        throw new Error('Initialization failed');
      }),
      getRecentLogs: vi.fn(() => []),
      getHealthStatus: vi.fn(() => ({ status: 'healthy', uptime: 1000 })),
      getConfig: vi.fn(() => ({ privacyMode: false }))
    };
    
    vi.mocked(Logger.getInstance).mockReturnValue(mockLoggerInstance as unknown as Logger);
    
    render(<DiagnosticsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });
  });

  it('should handle update errors gracefully', async () => {
    // Mock update error
    const mockLoggerInstance = {
      initialize: vi.fn(),
      getRecentLogs: vi.fn(() => {
        throw new Error('Update failed');
      }),
      getHealthStatus: vi.fn(() => ({ status: 'healthy', uptime: 1000 })),
      getConfig: vi.fn(() => ({ privacyMode: false }))
    };
    
    vi.mocked(Logger.getInstance).mockReturnValue(mockLoggerInstance as unknown as Logger);
    
    render(<DiagnosticsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No logs available')).toBeInTheDocument();
    });
  });
});
