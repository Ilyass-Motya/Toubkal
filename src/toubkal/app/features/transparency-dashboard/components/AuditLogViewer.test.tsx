/**
 * AuditLogViewer Tests
 * 
 * Unit tests for the audit log viewer component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuditLogViewer } from './AuditLogViewer'
import { AuditLogEntry } from '../types/TransparencyTypes'

const mockLogs: AuditLogEntry[] = [
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

describe('AuditLogViewer', () => {
  const mockOnRefresh = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render without errors', () => {
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      expect(screen.getByText('Operation Logs')).toBeInTheDocument()
      expect(screen.getByText(`Showing ${mockLogs.length} of ${mockLogs.length} operations`)).toBeInTheDocument()
    })

    it('should display search input', () => {
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      expect(screen.getByPlaceholderText('Search operations...')).toBeInTheDocument()
    })

    it('should display filter controls', () => {
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      expect(screen.getByText('All Categories')).toBeInTheDocument()
      expect(screen.getByText('All Events')).toBeInTheDocument()
      expect(screen.getByText('Success only')).toBeInTheDocument()
    })

    it('should display sort controls', () => {
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      expect(screen.getByText('Time')).toBeInTheDocument()
      expect(screen.getByText('Category')).toBeInTheDocument()
      expect(screen.getByText('Event Type')).toBeInTheDocument()
    })

    it('should display refresh button', () => {
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
    })
  })

  describe('stats display', () => {
    it('should show total operations count', () => {
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      // Look for the specific text in the stats section
      expect(screen.getByText('Total Operations')).toBeInTheDocument()
      // Find the total operations count by looking for the element with blue color class
      const totalOpsElement = screen.getByText('Total Operations').parentElement?.querySelector('.text-blue-600')
      expect(totalOpsElement).toHaveTextContent('3')
    })

    it('should show successful operations count', () => {
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      expect(screen.getByText('Successful')).toBeInTheDocument()
      // Look for the successful count (2 successful operations)
      const successfulElements = screen.getAllByText('2')
      expect(successfulElements.length).toBeGreaterThan(0)
    })

    it('should show failed operations count', () => {
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      expect(screen.getByText('Failed')).toBeInTheDocument()
      // Look for the failed count (1 failed operation)
      const failedElements = screen.getAllByText('1')
      expect(failedElements.length).toBeGreaterThan(0)
    })
  })

  describe('log entries', () => {
    it('should display all log entries', () => {
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      expect(screen.getByText('Process AI query')).toBeInTheDocument()
      expect(screen.getByText('Fetch resource')).toBeInTheDocument()
      expect(screen.getByText('User consent decision')).toBeInTheDocument()
    })

    it('should show event type icons', () => {
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      expect(screen.getByText('🤖')).toBeInTheDocument() // AI_QUERY icon
      expect(screen.getByText('🌐')).toBeInTheDocument() // NETWORK_REQUEST icon
      expect(screen.getByText('✅')).toBeInTheDocument() // CONSENT_DECISION icon
    })

    it('should show category badges', () => {
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      expect(screen.getByText('ai')).toBeInTheDocument()
      expect(screen.getByText('network')).toBeInTheDocument()
      expect(screen.getByText('consent')).toBeInTheDocument()
    })

    it('should show success/failure indicators', () => {
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      // Should have success indicators (green dots) and failure indicators (red dots)
      const indicators = screen.getAllByRole('generic')
      expect(indicators.some(el => el.classList.contains('bg-green-500'))).toBe(true)
      expect(indicators.some(el => el.classList.contains('bg-red-500'))).toBe(true)
    })
  })

  describe('search functionality', () => {
    it('should filter logs by search term', async () => {
      const user = userEvent.setup()
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      const searchInput = screen.getByPlaceholderText('Search operations...')
      await user.type(searchInput, 'AI')
      
      await waitFor(() => {
        expect(screen.getByText('Process AI query')).toBeInTheDocument()
        expect(screen.queryByText('Fetch resource')).not.toBeInTheDocument()
      })
    })

    it('should show no results message when no matches found', async () => {
      const user = userEvent.setup()
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      const searchInput = screen.getByPlaceholderText('Search operations...')
      await user.type(searchInput, 'nonexistent')
      
      await waitFor(() => {
        expect(screen.getByText('No operations found matching your criteria.')).toBeInTheDocument()
      })
    })
  })

  describe('filtering', () => {
    it('should filter by category', async () => {
      const user = userEvent.setup()
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      const categorySelect = screen.getByDisplayValue('All Categories')
      await user.selectOptions(categorySelect, 'ai')
      
      await waitFor(() => {
        expect(screen.getByText('Process AI query')).toBeInTheDocument()
        expect(screen.queryByText('Fetch resource')).not.toBeInTheDocument()
      })
    })

    it('should filter by event type', async () => {
      const user = userEvent.setup()
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      const eventTypeSelect = screen.getByDisplayValue('All Events')
      await user.selectOptions(eventTypeSelect, 'AI_QUERY')
      
      await waitFor(() => {
        expect(screen.getByText('Process AI query')).toBeInTheDocument()
        expect(screen.queryByText('Fetch resource')).not.toBeInTheDocument()
      })
    })

    it('should filter by success status', async () => {
      const user = userEvent.setup()
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      const successCheckbox = screen.getByLabelText('Success only')
      await user.click(successCheckbox)
      
      await waitFor(() => {
        expect(screen.getByText('Process AI query')).toBeInTheDocument()
        expect(screen.getByText('Fetch resource')).toBeInTheDocument()
        expect(screen.queryByText('User consent decision')).not.toBeInTheDocument()
      })
    })
  })

  describe('sorting', () => {
    it('should sort by timestamp by default', () => {
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      // Should show Time as selected sort option
      expect(screen.getByDisplayValue('Time')).toBeInTheDocument()
    })

    it('should allow changing sort criteria', async () => {
      const user = userEvent.setup()
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      const sortSelect = screen.getByDisplayValue('Time')
      await user.selectOptions(sortSelect, 'category')
      
      expect(sortSelect).toHaveValue('category')
    })

    it('should allow changing sort order', async () => {
      const user = userEvent.setup()
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      const sortOrderButton = screen.getByText('↓')
      await user.click(sortOrderButton)
      
      expect(screen.getByText('↑')).toBeInTheDocument()
    })
  })

  describe('refresh functionality', () => {
    it('should call onRefresh when refresh button is clicked', async () => {
      const user = userEvent.setup()
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      const refreshButton = screen.getByRole('button', { name: 'Refresh' })
      await user.click(refreshButton)
      
      expect(mockOnRefresh).toHaveBeenCalledTimes(1)
    })
  })

  describe('empty state', () => {
    it('should show empty state when no logs provided', () => {
      render(<AuditLogViewer logs={[]} onRefresh={mockOnRefresh} />)
      
      expect(screen.getByText('No operations found matching your criteria.')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Search operations...')).toBeInTheDocument()
    })

    it('should have proper form controls', () => {
      render(<AuditLogViewer logs={mockLogs} onRefresh={mockOnRefresh} />)
      
      expect(screen.getByRole('textbox')).toBeInTheDocument() // Search input
      // There are 3 comboboxes: category, event type, and sort
      expect(screen.getAllByRole('combobox')).toHaveLength(3)
    })
  })
})
