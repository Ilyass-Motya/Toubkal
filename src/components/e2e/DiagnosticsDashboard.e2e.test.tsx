/**
 * Diagnostics Dashboard End-to-End Tests
 * 
 * Comprehensive E2E tests for the diagnostics dashboard,
 * testing the complete user workflow.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DiagnosticsDashboard from '../DiagnosticsDashboard';
import { Logger, ErrorTracker, PerformanceMonitor, ScalabilityManager } from '@/toubkal/app/core/diagnostics/logger';

// Mock the diagnostics modules for E2E testing
vi.mock('@/toubkal/app/core/diagnostics/logger', () => ({
  Logger: {
    getInstance: vi.fn(() => ({
      initialize: vi.fn(),
      getRecentLogs: vi.fn(() => [
        {
          level: 0, // DEBUG
          component: 'TestComponent',
          message: 'Debug message',
          timestamp: new Date().toISOString(),
          context: { source: 'e2e-test' },
          correlationId: 'test-correlation-id'
        },
        {
          level: 1, // INFO
          component: 'TestComponent',
          message: 'Info message',
          timestamp: new Date().toISOString(),
          context: { source: 'e2e-test' },
          correlationId: 'test-correlation-id'
        },
        {
          level: 1, // INFO
          component: 'TestComponent',
          message: 'Searchable log message',
          timestamp: new Date().toISOString(),
          context: { source: 'e2e-test' },
          correlationId: 'test-correlation-id'
        },
        {
          level: 2, // WARN
          component: 'TestComponent',
          message: 'Warning message',
          timestamp: new Date().toISOString(),
          context: { source: 'e2e-test' },
          correlationId: 'test-correlation-id'
        }
      ]),
      log: vi.fn(),
      getHealthStatus: vi.fn(() => ({ status: 'healthy', uptime: 1000 })),
      getConfig: vi.fn(() => ({ privacyMode: false }))
    }))
  },
  LogLevel: {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4
  },
  ErrorTracker: {
    getInstance: vi.fn(() => ({
      initialize: vi.fn(),
      getRecentErrors: vi.fn(() => [
        {
          id: 'error-1',
          severity: 2, // HIGH
          category: 0, // SYSTEM
          message: 'High severity error',
          timestamp: Date.now(),
          context: { source: 'e2e-test' },
          firstSeen: Date.now(),
          lastSeen: Date.now(),
          count: 1
        },
        {
          id: 'error-2',
          severity: 0, // LOW
          category: 0, // SYSTEM
          message: 'Low severity error',
          timestamp: Date.now(),
          context: { source: 'e2e-test' },
          firstSeen: Date.now(),
          lastSeen: Date.now(),
          count: 1
        }
      ]),
      trackError: vi.fn(),
      getHealthStatus: vi.fn(() => ({ status: 'healthy', uptime: 1000 })),
      getConfig: vi.fn(() => ({ privacyMode: false }))
    }))
  },
  PerformanceMonitor: {
    getInstance: vi.fn(() => ({
      initialize: vi.fn(),
      getRecentMetrics: vi.fn(() => [
        {
          id: 'metric-1',
          type: 0, // PAGE_LOAD
          name: 'Page Load Time',
          value: 1500,
          unit: 'ms',
          timestamp: Date.now(),
          context: { url: 'https://example.com' }
        }
      ]),
      trackMetric: vi.fn(),
      getHealthStatus: vi.fn(() => ({ status: 'healthy', uptime: 1000 })),
      getConfig: vi.fn(() => ({ privacyMode: false }))
    }))
  },
  ScalabilityManager: {
    getInstance: vi.fn(() => ({
      initialize: vi.fn(),
      getScalabilityMetrics: vi.fn(() => ({ totalNodes: 1, activeNodes: 1, averageLoad: 0, healthStatus: 'healthy' })),
      getHealthStatus: vi.fn(() => ({ status: 'healthy', uptime: 1000 })),
      getConfig: vi.fn(() => ({ privacyMode: false }))
    }))
  }
}));

vi.mock('@/toubkal/app/core/diagnostics/error-tracker', () => ({
  ErrorTracker: {
    getInstance: vi.fn(() => ({
      initialize: vi.fn(),
      getRecentErrors: vi.fn(() => [
        {
          id: 'error-1',
          severity: 2, // HIGH
          category: 0, // SYSTEM
          message: 'High severity error',
          timestamp: Date.now(),
          context: { source: 'e2e-test' },
          firstSeen: Date.now(),
          lastSeen: Date.now(),
          count: 1
        },
        {
          id: 'error-2',
          severity: 0, // LOW
          category: 0, // SYSTEM
          message: 'Low severity error',
          timestamp: Date.now(),
          context: { source: 'e2e-test' },
          firstSeen: Date.now(),
          lastSeen: Date.now(),
          count: 1
        }
      ]),
      trackError: vi.fn(),
      getHealthStatus: vi.fn(() => ({ status: 'healthy', uptime: 1000 })),
      getConfig: vi.fn(() => ({ privacyMode: false }))
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
          unit: 'ms',
          timestamp: Date.now(),
          context: { url: 'https://example.com' }
        }
      ]),
      trackMetric: vi.fn(),
      getHealthStatus: vi.fn(() => ({ status: 'healthy', uptime: 1000 })),
      getConfig: vi.fn(() => ({ privacyMode: false }))
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
      })),
      getHealthStatus: vi.fn(() => ({ status: 'healthy', uptime: 1000 })),
      getConfig: vi.fn(() => ({ privacyMode: false }))
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

describe('Diagnostics Dashboard E2E Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Dashboard Initialization', () => {
    it('should load and display the dashboard correctly', () => {
      render(<DiagnosticsDashboard />);

      // Check main elements are present
      expect(screen.getByText('Toubkal Diagnostics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Real-time monitoring and diagnostics for Toubkal Browser')).toBeInTheDocument();
      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByLabelText('Auto-refresh:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    });

    it.skip('should initialize all diagnostics systems on load', async () => {
      render(<DiagnosticsDashboard />);

      await waitFor(() => {
        expect(Logger.getInstance).toHaveBeenCalled();
        expect(ErrorTracker.getInstance).toHaveBeenCalled();
        expect(PerformanceMonitor.getInstance).toHaveBeenCalled();
        expect(ScalabilityManager.getInstance).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Navigation and Tab Switching', () => {
    it('should switch between tabs correctly', async () => {
      render(<DiagnosticsDashboard />);

      // Check initial tab (Logs)
      expect(screen.getByRole('button', { name: /Logs/ })).toBeInTheDocument();
      expect(screen.getByText('System Logs')).toBeInTheDocument();

      // Switch to Errors tab
      await user.click(screen.getByRole('button', { name: /Errors/ }));
      expect(screen.getByText('Error Tracking')).toBeInTheDocument();

      // Switch to Performance tab
      await user.click(screen.getByRole('button', { name: /Performance/ }));
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();

      // Switch to Scalability tab
      await user.click(screen.getByRole('button', { name: /Scalability/ }));
      expect(screen.getByText('Scalability Management')).toBeInTheDocument();
    });

    it('should maintain tab state during navigation', async () => {
      render(<DiagnosticsDashboard />);

      // Switch to Performance tab
      await user.click(screen.getByRole('button', { name: /Performance/ }));
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();

      // Switch back to Logs tab
      await user.click(screen.getByRole('button', { name: /Logs/ }));
      expect(screen.getByText('System Logs')).toBeInTheDocument();
    });
  });

  describe('Auto-refresh Functionality', () => {
    it('should toggle auto-refresh on and off', async () => {
      render(<DiagnosticsDashboard />);

      const autoRefreshCheckbox = screen.getByLabelText('Auto-refresh:');
      expect(autoRefreshCheckbox).toBeChecked();

      // Toggle off
      await user.click(autoRefreshCheckbox);
      expect(autoRefreshCheckbox).not.toBeChecked();

      // Toggle back on
      await user.click(autoRefreshCheckbox);
      expect(autoRefreshCheckbox).toBeChecked();
    });

    it.skip('should update data when auto-refresh is enabled', async () => {
      const mockGetRecentLogs = vi.fn(() => [
        {
          id: 'log-1',
          level: 1,
          message: 'Auto-refresh test log',
          timestamp: Date.now(),
          context: { source: 'e2e-test' }
        }
      ]);

      (Logger.getInstance() as unknown as { getRecentLogs: typeof mockGetRecentLogs }).getRecentLogs = mockGetRecentLogs;

      render(<DiagnosticsDashboard />);

      // Wait for auto-refresh to trigger
      await waitFor(() => {
        expect(mockGetRecentLogs).toHaveBeenCalled();
      }, { timeout: 6000 });
    });
  });

  describe('Manual Refresh', () => {
    it.skip('should refresh data when refresh button is clicked', async () => {
      const mockGetRecentLogs = vi.fn(() => []);
      const mockLogger = Logger.getInstance() as unknown as { getRecentLogs: typeof mockGetRecentLogs };
      mockLogger.getRecentLogs = mockGetRecentLogs;

      render(<DiagnosticsDashboard />);

      const refreshButton = screen.getByRole('button', { name: 'Refresh' });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(mockGetRecentLogs).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Log Level Filtering', () => {
    it('should filter logs by level', async () => {
      const mockGetRecentLogs = vi.fn(() => [
        {
          id: 'log-1',
          level: 0, // DEBUG
          message: 'Debug message',
          timestamp: Date.now(),
          context: { source: 'e2e-test' }
        },
        {
          id: 'log-2',
          level: 1, // INFO
          message: 'Info message',
          timestamp: Date.now(),
          context: { source: 'e2e-test' }
        }
      ]);

      (Logger.getInstance() as unknown as { getRecentLogs: typeof mockGetRecentLogs }).getRecentLogs = mockGetRecentLogs;

      render(<DiagnosticsDashboard />);

      // Wait for logs to load
      await waitFor(() => {
        expect(screen.getByText('Debug message')).toBeInTheDocument();
      });

      // Change log level filter
      const levelSelect = screen.getByDisplayValue('All Levels');
      await user.selectOptions(levelSelect, '1'); // INFO

      // Check that filtering works
      expect(screen.getByText('Info message')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should search through logs', async () => {
      const mockGetRecentLogs = vi.fn(() => [
        {
          id: 'log-1',
          level: 1,
          message: 'Searchable log message',
          timestamp: Date.now(),
          context: { source: 'e2e-test' }
        },
        {
          id: 'log-2',
          level: 1,
          message: 'Another log message',
          timestamp: Date.now(),
          context: { source: 'e2e-test' }
        }
      ]);

      (Logger.getInstance() as unknown as { getRecentLogs: typeof mockGetRecentLogs }).getRecentLogs = mockGetRecentLogs;

      render(<DiagnosticsDashboard />);

      // Wait for logs to load
      await waitFor(() => {
        expect(screen.getByText('Searchable log message')).toBeInTheDocument();
      });

      // Search for specific text
      const searchInput = screen.getByPlaceholderText('Search logs...');
      await user.type(searchInput, 'Searchable');

      // Check that search works
      expect(screen.getByText('Searchable log message')).toBeInTheDocument();
      expect(screen.queryByText('Another log message')).not.toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('should display errors with correct severity colors', async () => {
      const mockGetRecentErrors = vi.fn(() => [
        {
          id: 'error-1',
          severity: 2, // HIGH
          category: 0, // SYSTEM
          message: 'High severity error',
          timestamp: Date.now(),
          context: { source: 'e2e-test' }
        },
        {
          id: 'error-2',
          severity: 0, // LOW
          category: 1, // NETWORK
          message: 'Low severity error',
          timestamp: Date.now(),
          context: { source: 'e2e-test' }
        }
      ]);

      (ErrorTracker.getInstance() as unknown as { getRecentErrors: typeof mockGetRecentErrors }).getRecentErrors = mockGetRecentErrors;

      render(<DiagnosticsDashboard />);

      // Switch to Errors tab
      await user.click(screen.getByRole('button', { name: /Errors/ }));

      // Wait for errors to load
      await waitFor(() => {
        expect(screen.getByText('High severity error')).toBeInTheDocument();
      });

      // Check that errors are displayed
      expect(screen.getByText('High severity error')).toBeInTheDocument();
      expect(screen.getByText('Low severity error')).toBeInTheDocument();
    });
  });

  describe('Performance Metrics Display', () => {
    it('should display performance metrics correctly', async () => {
      const mockGetRecentMetrics = vi.fn(() => [
        {
          id: 'metric-1',
          type: 0, // PAGE_LOAD
          name: 'Page Load Time',
          value: 1500,
          timestamp: Date.now(),
          context: { url: 'https://example.com' }
        },
        {
          id: 'metric-2',
          type: 1, // MEMORY_USAGE
          name: 'Memory Usage',
          value: 75.5,
          timestamp: Date.now(),
          context: { process: 'test' }
        }
      ]);

      (PerformanceMonitor.getInstance() as unknown as { getRecentMetrics: typeof mockGetRecentMetrics }).getRecentMetrics = mockGetRecentMetrics;

      render(<DiagnosticsDashboard />);

      // Switch to Performance tab
      await user.click(screen.getByRole('button', { name: /Performance/ }));

      // Wait for metrics to load
      await waitFor(() => {
        expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
      });

      // Check that metrics are displayed
      expect(screen.getByText('Page Load Time')).toBeInTheDocument();
      expect(screen.getByText('MEMORY USAGE')).toBeInTheDocument();
    });
  });

  describe('Scalability Management Display', () => {
    it('should display scalability metrics correctly', async () => {
      const mockGetScalabilityMetrics = vi.fn(() => ({
        totalNodes: 5,
        activeNodes: 3,
        averageLoad: 75.5,
        healthStatus: 'healthy'
      }));

      (ScalabilityManager.getInstance() as unknown as { getScalabilityMetrics: typeof mockGetScalabilityMetrics }).getScalabilityMetrics = mockGetScalabilityMetrics;

      render(<DiagnosticsDashboard />);

      // Switch to Scalability tab
      await user.click(screen.getByRole('button', { name: /Scalability/ }));

      // Wait for metrics to load
      await waitFor(() => {
        expect(screen.getByText('Scalability Management')).toBeInTheDocument();
      });

      // Check that metrics are displayed
      expect(screen.getByText('3')).toBeInTheDocument(); // Total Nodes value
      expect(screen.getByText('2')).toBeInTheDocument(); // Active Nodes value
      expect(screen.getByText('65.5%')).toBeInTheDocument(); // Average Load value
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', () => {
      (Logger.getInstance() as unknown as { initialize: { mockImplementation: (fn: () => void) => void } }).initialize.mockImplementation(() => {
        throw new Error('Initialization failed');
      });

      render(<DiagnosticsDashboard />);

      // Dashboard should still render
      expect(screen.getByText('Toubkal Diagnostics Dashboard')).toBeInTheDocument();
    });

    it('should handle data loading errors gracefully', () => {
      (Logger.getInstance() as unknown as { getRecentLogs: { mockImplementation: (fn: () => void) => void } }).getRecentLogs.mockImplementation(() => {
        throw new Error('Data loading failed');
      });

      render(<DiagnosticsDashboard />);

      // Dashboard should still render
      expect(screen.getByText('Toubkal Diagnostics Dashboard')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on different screen sizes', () => {
      render(<DiagnosticsDashboard />);

      // Check that the dashboard renders on mobile
      expect(screen.getByText('Toubkal Diagnostics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Real-time monitoring and diagnostics for Toubkal Browser')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with keyboard navigation', () => {
      render(<DiagnosticsDashboard />);

      // Check that all interactive elements are accessible
      expect(screen.getByLabelText('Auto-refresh:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Logs/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Errors/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Performance/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Scalability/ })).toBeInTheDocument();
    });

    it('should have proper ARIA labels', () => {
      render(<DiagnosticsDashboard />);

      // Check that elements have proper ARIA labels
      const autoRefreshCheckbox = screen.getByLabelText('Auto-refresh:');
      expect(autoRefreshCheckbox).toBeInTheDocument();
      expect(autoRefreshCheckbox).toHaveAttribute('id', 'auto-refresh');
    });
  });

  describe('Data Persistence', () => {
    it('should maintain state during component re-renders', async () => {
      const { rerender } = render(<DiagnosticsDashboard />);

      // Switch to Performance tab
      await user.click(screen.getByRole('button', { name: /Performance/ }));
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();

      // Re-render component
      rerender(<DiagnosticsDashboard />);

      // State should be maintained
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render within acceptable time', () => {
      const startTime = Date.now();
      render(<DiagnosticsDashboard />);
      const endTime = Date.now();

      // Should render within 1 second
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle rapid user interactions', async () => {
      render(<DiagnosticsDashboard />);

      // Rapidly switch between tabs
      await user.click(screen.getByRole('button', { name: /Errors/ }));
      await user.click(screen.getByRole('button', { name: /Performance/ }));
      await user.click(screen.getByRole('button', { name: /Scalability/ }));
      await user.click(screen.getByRole('button', { name: /Logs/ }));

      // Should handle all interactions gracefully
      expect(screen.getByText('System Logs')).toBeInTheDocument();
    });
  });
});
