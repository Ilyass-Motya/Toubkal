/**
 * Transparency Dashboard Integration Tests
 * 
 * Integration tests for the transparency dashboard feature.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransparencyDashboard } from './TransparencyDashboard'

// Mock the hooks with realistic data
const mockAuditData = {
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
    },
    {
      id: 'consent-2',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      actionType: 'NETWORK_REQUEST',
      dataDisclosed: ['url', 'headers'],
      decision: 'denied',
      userAgent: 'Toubkal Browser 1.0',
      signature: 'mock-signature-2'
    }
  ],
  networkRequests: [],
  aiQueries: [],
  privacyActions: [],
  systemEvents: [],
  lastUpdated: new Date().toISOString(),
  merkleRoot: 'mock-merkle-root'
}

const mockRealTimeLogs = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    eventType: 'AI_QUERY',
    category: 'ai',
    details: {
      action: 'Process AI query',
      resource: 'https://example.com',
      dataAccessed: ['user_prompt', 'page_content'],
      consentRequired: true,
      consentGranted: true,
      duration: 1500,
      success: true
    },
    signature: 'mock-signature-1',
    merkleProof: ['hash1', 'hash2']
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    eventType: 'NETWORK_REQUEST',
    category: 'network',
    details: {
      action: 'Fetch resource',
      resource: 'https://api.example.com/data',
      dataAccessed: ['url', 'headers'],
      consentRequired: false,
      duration: 500,
      success: true
    },
    signature: 'mock-signature-2',
    merkleProof: ['hash3', 'hash4']
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    eventType: 'CONSENT_DECISION',
    category: 'consent',
    details: {
      action: 'User consent decision',
      dataAccessed: ['user_choice'],
      consentRequired: false,
      duration: 100,
      success: false
    },
    signature: 'mock-signature-3',
    merkleProof: ['hash5', 'hash6']
  }
]

// Mock the hooks
vi.mock('./hooks/use-audit-data', () => ({
  useAuditData: vi.fn(() => ({
    auditData: mockAuditData,
    loading: false,
    error: null,
    refresh: vi.fn()
  }))
}))

vi.mock('./hooks/use-real-time-logs', () => ({
  useRealTimeLogs: vi.fn(() => ({
    realTimeLogs: mockRealTimeLogs,
    loading: false,
    error: null,
    isStreaming: true,
    startStreaming: vi.fn(),
    stopStreaming: vi.fn(),
    clearLogs: vi.fn()
  }))
}))

describe('Transparency Dashboard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('full dashboard workflow', () => {
    it('should render complete dashboard with all components', () => {
      render(<TransparencyDashboard />)
      
      // Header
      expect(screen.getByText('Transparency Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Real-time view of all browser operations and privacy decisions')).toBeInTheDocument()
      
      // Navigation
      expect(screen.getByText('Operation Logs')).toBeInTheDocument()
      expect(screen.getByText('Consent History')).toBeInTheDocument()
      expect(screen.getByText('Export Data')).toBeInTheDocument()
      
      // Live indicator
      expect(screen.getByText('Live')).toBeInTheDocument()
    })

    it('should display operation logs by default', () => {
      render(<TransparencyDashboard />)
      
      // Should show logs viewer content
      expect(screen.getByText('Operation Logs')).toHaveClass('border-blue-500', 'text-blue-600')
      expect(screen.getByText('Process AI query')).toBeInTheDocument()
      expect(screen.getByText('Fetch resource')).toBeInTheDocument()
    })

    it('should switch to consent history when tab is clicked', async () => {
      const user = userEvent.setup()
      render(<TransparencyDashboard />)
      
      const consentTab = screen.getByText('Consent History')
      await user.click(consentTab)
      
      expect(consentTab).toHaveClass('border-blue-500', 'text-blue-600')
      expect(screen.getByText('AI_QUERY')).toBeInTheDocument()
      expect(screen.getByText('NETWORK_REQUEST')).toBeInTheDocument()
    })

    it('should switch to export panel when tab is clicked', async () => {
      const user = userEvent.setup()
      render(<TransparencyDashboard />)
      
      const exportTab = screen.getByText('Export Data')
      await user.click(exportTab)
      
      expect(exportTab).toHaveClass('border-blue-500', 'text-blue-600')
      expect(screen.getByText('Export Options')).toBeInTheDocument()
      expect(screen.getByText('Export Data')).toBeInTheDocument()
    })
  })

  describe('operation logs integration', () => {
    it('should display all log entries with proper formatting', () => {
      render(<TransparencyDashboard />)
      
      // Check that all log entries are displayed
      expect(screen.getByText('Process AI query')).toBeInTheDocument()
      expect(screen.getByText('Fetch resource')).toBeInTheDocument()
      expect(screen.getByText('User consent decision')).toBeInTheDocument()
      
      // Check event type icons
      expect(screen.getByText('🤖')).toBeInTheDocument() // AI_QUERY
      expect(screen.getByText('🌐')).toBeInTheDocument() // NETWORK_REQUEST
      expect(screen.getByText('✅')).toBeInTheDocument() // CONSENT_DECISION
    })

    it('should show stats for all operations', () => {
      render(<TransparencyDashboard />)
      
      expect(screen.getByText('3')).toBeInTheDocument() // Total operations
      expect(screen.getByText('Total Operations')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument() // Successful operations
      expect(screen.getByText('Successful')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // Failed operations
      expect(screen.getByText('Failed')).toBeInTheDocument()
    })

    it('should allow filtering logs by category', async () => {
      const user = userEvent.setup()
      render(<TransparencyDashboard />)
      
      const categorySelect = screen.getByDisplayValue('All Categories')
      await user.selectOptions(categorySelect, 'ai')
      
      await waitFor(() => {
        expect(screen.getByText('Process AI query')).toBeInTheDocument()
        expect(screen.queryByText('Fetch resource')).not.toBeInTheDocument()
      })
    })

    it('should allow searching logs', async () => {
      const user = userEvent.setup()
      render(<TransparencyDashboard />)
      
      const searchInput = screen.getByPlaceholderText('Search operations...')
      await user.type(searchInput, 'AI')
      
      await waitFor(() => {
        expect(screen.getByText('Process AI query')).toBeInTheDocument()
        expect(screen.queryByText('Fetch resource')).not.toBeInTheDocument()
      })
    })
  })

  describe('consent history integration', () => {
    it('should display consent decisions when consent tab is active', async () => {
      const user = userEvent.setup()
      render(<TransparencyDashboard />)
      
      await user.click(screen.getByText('Consent History'))
      
      expect(screen.getByText('AI_QUERY')).toBeInTheDocument()
      expect(screen.getByText('NETWORK_REQUEST')).toBeInTheDocument()
      expect(screen.getByText('Data disclosed: page_content, user_prompt')).toBeInTheDocument()
      expect(screen.getByText('Data disclosed: url, headers')).toBeInTheDocument()
    })

    it('should show consent decision stats', async () => {
      const user = userEvent.setup()
      render(<TransparencyDashboard />)
      
      await user.click(screen.getByText('Consent History'))
      
      expect(screen.getByText('2')).toBeInTheDocument() // Total decisions
      expect(screen.getByText('Total Decisions')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // Granted decisions
      expect(screen.getByText('Granted')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // Denied decisions
      expect(screen.getByText('Denied')).toBeInTheDocument()
    })

    it('should allow filtering consent decisions', async () => {
      const user = userEvent.setup()
      render(<TransparencyDashboard />)
      
      await user.click(screen.getByText('Consent History'))
      
      const decisionSelect = screen.getByDisplayValue('All Decisions')
      await user.selectOptions(decisionSelect, 'granted')
      
      await waitFor(() => {
        expect(screen.getByText('AI_QUERY')).toBeInTheDocument()
        expect(screen.queryByText('NETWORK_REQUEST')).not.toBeInTheDocument()
      })
    })
  })

  describe('export functionality integration', () => {
    it('should display export options when export tab is active', async () => {
      const user = userEvent.setup()
      render(<TransparencyDashboard />)
      
      await user.click(screen.getByText('Export Data'))
      
      expect(screen.getByText('Export Options')).toBeInTheDocument()
      expect(screen.getByText('Export Format')).toBeInTheDocument()
      expect(screen.getByText('Date Range (Optional)')).toBeInTheDocument()
      expect(screen.getByText('Categories (Select all to include all categories)')).toBeInTheDocument()
    })

    it('should show export preview with correct data', async () => {
      const user = userEvent.setup()
      render(<TransparencyDashboard />)
      
      await user.click(screen.getByText('Export Data'))
      
      expect(screen.getByText('Total entries to export: 3')).toBeInTheDocument()
      expect(screen.getByText('Format: JSON')).toBeInTheDocument()
      expect(screen.getByText('Date range: All dates')).toBeInTheDocument()
      expect(screen.getByText('Categories: All categories')).toBeInTheDocument()
    })

    it('should allow changing export format', async () => {
      const user = userEvent.setup()
      render(<TransparencyDashboard />)
      
      await user.click(screen.getByText('Export Data'))
      
      const csvRadio = screen.getByLabelText('CSV (Spreadsheet compatible)')
      await user.click(csvRadio)
      
      expect(csvRadio).toBeChecked()
    })

    it('should allow selecting categories for export', async () => {
      const user = userEvent.setup()
      render(<TransparencyDashboard />)
      
      await user.click(screen.getByText('Export Data'))
      
      const networkCheckbox = screen.getByLabelText('network')
      await user.click(networkCheckbox)
      
      expect(networkCheckbox).toBeChecked()
    })
  })

  describe('error handling integration', () => {
    it('should handle audit data loading errors', () => {
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

    it('should handle real-time logs errors', () => {
      vi.mocked(require('./hooks/use-real-time-logs').useRealTimeLogs).mockReturnValue({
        realTimeLogs: [],
        loading: false,
        error: new Error('Streaming connection failed'),
        isStreaming: false,
        startStreaming: vi.fn(),
        stopStreaming: vi.fn(),
        clearLogs: vi.fn()
      })

      render(<TransparencyDashboard />)
      
      expect(screen.getByText('Error Loading Data')).toBeInTheDocument()
      expect(screen.getByText('Streaming connection failed')).toBeInTheDocument()
    })
  })

  describe('loading states integration', () => {
    it('should show loading state when audit data is loading', () => {
      vi.mocked(require('./hooks/use-audit-data').useAuditData).mockReturnValue({
        auditData: null,
        loading: true,
        error: null,
        refresh: vi.fn()
      })

      render(<TransparencyDashboard />)
      
      expect(screen.getByText('Loading transparency data...')).toBeInTheDocument()
    })

    it('should show loading state when logs are loading', () => {
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

  describe('navigation integration', () => {
    it('should maintain tab state when switching between tabs', async () => {
      const user = userEvent.setup()
      render(<TransparencyDashboard />)
      
      // Start on logs tab
      expect(screen.getByText('Operation Logs')).toHaveClass('border-blue-500', 'text-blue-600')
      
      // Switch to consent tab
      await user.click(screen.getByText('Consent History'))
      expect(screen.getByText('Consent History')).toHaveClass('border-blue-500', 'text-blue-600')
      
      // Switch to export tab
      await user.click(screen.getByText('Export Data'))
      expect(screen.getByText('Export Data')).toHaveClass('border-blue-500', 'text-blue-600')
      
      // Switch back to logs tab
      await user.click(screen.getByText('Operation Logs'))
      expect(screen.getByText('Operation Logs')).toHaveClass('border-blue-500', 'text-blue-600')
    })
  })
})
