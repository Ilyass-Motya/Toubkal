/**
 * TransparencyDashboard Tests
 * 
 * Unit tests for the main transparency dashboard component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransparencyDashboard } from './TransparencyDashboard'

// Mock the hooks
vi.mock('./hooks/use-audit-data', () => ({
  useAuditData: vi.fn(() => ({
    auditData: {
      totalEntries: 150,
      consentHistory: [
        {
          id: 'consent-1',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          actionType: 'AI_QUERY',
          dataDisclosed: ['page_content', 'user_prompt'],
          decision: 'granted',
          userAgent: 'Toubkal Browser 1.0',
          signature: 'mock-signature-1'
        }
      ],
      lastUpdated: new Date().toISOString(),
      merkleRoot: 'mock-merkle-root'
    },
    loading: false,
    error: null
  }))
}))

vi.mock('./hooks/use-real-time-logs', () => ({
  useRealTimeLogs: vi.fn(() => ({
    realTimeLogs: [
      {
        id: 'log-1',
        timestamp: new Date().toISOString(),
        eventType: 'AI_QUERY',
        category: 'ai',
        details: {
          action: 'Mock AI query',
          success: true,
          duration: 1500
        },
        signature: 'mock-signature',
        merkleProof: ['hash1', 'hash2']
      }
    ],
    loading: false,
    error: null,
    isStreaming: true,
    startStreaming: vi.fn(),
    stopStreaming: vi.fn()
  }))
}))

describe('TransparencyDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render without errors', () => {
      render(<TransparencyDashboard />)
      
      expect(screen.getByText('Transparency Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Real-time view of all browser operations and privacy decisions')).toBeInTheDocument()
    })

    it('should display navigation tabs', () => {
      render(<TransparencyDashboard />)
      
      expect(screen.getByText('Operation Logs')).toBeInTheDocument()
      expect(screen.getByText('Consent History')).toBeInTheDocument()
      expect(screen.getByText('Export Data')).toBeInTheDocument()
    })

    it('should show live indicator when streaming', () => {
      render(<TransparencyDashboard />)
      
      expect(screen.getByText('Live')).toBeInTheDocument()
    })
  })

  describe('authentication', () => {
    it('should show authentication required when not authenticated', () => {
      // Mock unauthenticated state
      vi.mocked(require('./hooks/use-audit-data').useAuditData).mockReturnValue({
        auditData: null,
        loading: false,
        error: null,
        refresh: vi.fn()
      })

      render(<TransparencyDashboard />)
      
      expect(screen.getByText('Authentication Required')).toBeInTheDocument()
      expect(screen.getByText('Please authenticate to access the transparency dashboard.')).toBeInTheDocument()
    })

    it('should show authenticate button when not authenticated', () => {
      vi.mocked(require('./hooks/use-audit-data').useAuditData).mockReturnValue({
        auditData: null,
        loading: false,
        error: null,
        refresh: vi.fn()
      })

      render(<TransparencyDashboard />)
      
      expect(screen.getByRole('button', { name: 'Authenticate' })).toBeInTheDocument()
    })
  })

  describe('loading states', () => {
    it('should show loading spinner when audit data is loading', () => {
      vi.mocked(require('./hooks/use-audit-data').useAuditData).mockReturnValue({
        auditData: null,
        loading: true,
        error: null,
        refresh: vi.fn()
      })

      render(<TransparencyDashboard />)
      
      expect(screen.getByText('Loading transparency data...')).toBeInTheDocument()
    })

    it('should show loading spinner when logs are loading', () => {
      vi.mocked(require('./hooks/use-real-time-logs').useRealTimeLogs).mockReturnValue({
        realTimeLogs: [],
        loading: true,
        error: null,
        isStreaming: false,
        startStreaming: vi.fn(),
        stopStreaming: vi.fn(),
        clearLogs: vi.fn()
      })

      render(<TransparencyDashboard />)
      
      expect(screen.getByText('Loading transparency data...')).toBeInTheDocument()
    })
  })

  describe('error states', () => {
    it('should show error message when audit data fails to load', () => {
      vi.mocked(require('./hooks/use-audit-data').useAuditData).mockReturnValue({
        auditData: null,
        loading: false,
        error: new Error('Failed to load audit data'),
        refresh: vi.fn()
      })

      render(<TransparencyDashboard />)
      
      expect(screen.getByText('Error Loading Data')).toBeInTheDocument()
      expect(screen.getByText('Failed to load audit data')).toBeInTheDocument()
    })

    it('should show retry button when there is an error', () => {
      vi.mocked(require('./hooks/use-audit-data').useAuditData).mockReturnValue({
        auditData: null,
        loading: false,
        error: new Error('Failed to load audit data'),
        refresh: vi.fn()
      })

      render(<TransparencyDashboard />)
      
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    })
  })

  describe('tab navigation', () => {
    it('should switch to consent history tab when clicked', async () => {
      const user = userEvent.setup()
      render(<TransparencyDashboard />)
      
      const consentTab = screen.getByText('Consent History')
      await user.click(consentTab)
      
      expect(consentTab).toHaveClass('border-blue-500', 'text-blue-600')
    })

    it('should switch to export data tab when clicked', async () => {
      const user = userEvent.setup()
      render(<TransparencyDashboard />)
      
      const exportTab = screen.getByText('Export Data')
      await user.click(exportTab)
      
      expect(exportTab).toHaveClass('border-blue-500', 'text-blue-600')
    })

    it('should switch back to operation logs tab when clicked', async () => {
      const user = userEvent.setup()
      render(<TransparencyDashboard />)
      
      // First switch to another tab
      await user.click(screen.getByText('Consent History'))
      
      // Then switch back to logs
      const logsTab = screen.getByText('Operation Logs')
      await user.click(logsTab)
      
      expect(logsTab).toHaveClass('border-blue-500', 'text-blue-600')
    })
  })

  describe('component integration', () => {
    it('should render AuditLogViewer when logs tab is active', () => {
      render(<TransparencyDashboard />)
      
      // Should show the logs viewer (we can't directly test the component, but we can test the tab is active)
      expect(screen.getByText('Operation Logs')).toHaveClass('border-blue-500', 'text-blue-600')
    })

    it('should render ConsentHistory when consent tab is active', async () => {
      const user = userEvent.setup()
      render(<TransparencyDashboard />)
      
      await user.click(screen.getByText('Consent History'))
      
      expect(screen.getByText('Consent History')).toHaveClass('border-blue-500', 'text-blue-600')
    })

    it('should render ExportPanel when export tab is active', async () => {
      const user = userEvent.setup()
      render(<TransparencyDashboard />)
      
      await user.click(screen.getByText('Export Data'))
      
      expect(screen.getByText('Export Data')).toHaveClass('border-blue-500', 'text-blue-600')
    })
  })
})
