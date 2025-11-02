/**
 * ConsentHistory Tests
 * 
 * Unit tests for the consent history component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConsentHistory } from './ConsentHistory'
import { ConsentDecision } from '../types/TransparencyTypes'

const mockConsentData: ConsentDecision[] = [
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
  },
  {
    id: 'consent-3',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    actionType: 'PRIVACY_ACTION',
    dataDisclosed: ['user_preferences'],
    decision: 'revoked',
    userAgent: 'Toubkal Browser 1.0',
    signature: 'mock-signature-3'
  }
]

describe('ConsentHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render without errors', () => {
      render(<ConsentHistory consentData={mockConsentData} />)
      
      expect(screen.getByText('Consent Decision Timeline')).toBeInTheDocument()
      expect(screen.getByText(`Showing ${mockConsentData.length} of ${mockConsentData.length} decisions`)).toBeInTheDocument()
    })

    it('should display search input', () => {
      render(<ConsentHistory consentData={mockConsentData} />)
      
      expect(screen.getByPlaceholderText('Search consent decisions...')).toBeInTheDocument()
    })

    it('should display filter controls', () => {
      render(<ConsentHistory consentData={mockConsentData} />)
      
      expect(screen.getByText('All Decisions')).toBeInTheDocument()
      expect(screen.getByText('Granted')).toBeInTheDocument()
      expect(screen.getByText('Denied')).toBeInTheDocument()
      expect(screen.getByText('Revoked')).toBeInTheDocument()
    })

    it('should display sort controls', () => {
      render(<ConsentHistory consentData={mockConsentData} />)
      
      expect(screen.getByText('Time')).toBeInTheDocument()
      expect(screen.getByText('Action Type')).toBeInTheDocument()
      expect(screen.getByText('Decision')).toBeInTheDocument()
    })
  })

  describe('stats display', () => {
    it('should show total decisions count', () => {
      render(<ConsentHistory consentData={mockConsentData} />)
      
      expect(screen.getByText('3')).toBeInTheDocument() // Total decisions
      expect(screen.getByText('Total Decisions')).toBeInTheDocument()
    })

    it('should show granted decisions count', () => {
      render(<ConsentHistory consentData={mockConsentData} />)
      
      expect(screen.getByText('1')).toBeInTheDocument() // Granted decisions
      expect(screen.getByText('Granted')).toBeInTheDocument()
    })

    it('should show denied decisions count', () => {
      render(<ConsentHistory consentData={mockConsentData} />)
      
      expect(screen.getByText('1')).toBeInTheDocument() // Denied decisions
      expect(screen.getByText('Denied')).toBeInTheDocument()
    })

    it('should show revoked decisions count', () => {
      render(<ConsentHistory consentData={mockConsentData} />)
      
      expect(screen.getByText('1')).toBeInTheDocument() // Revoked decisions
      expect(screen.getByText('Revoked')).toBeInTheDocument()
    })
  })

  describe('consent entries', () => {
    it('should display all consent decisions', () => {
      render(<ConsentHistory consentData={mockConsentData} />)
      
      expect(screen.getByText('AI_QUERY')).toBeInTheDocument()
      expect(screen.getByText('NETWORK_REQUEST')).toBeInTheDocument()
      expect(screen.getByText('PRIVACY_ACTION')).toBeInTheDocument()
    })

    it('should show decision icons', () => {
      render(<ConsentHistory consentData={mockConsentData} />)
      
      expect(screen.getByText('✅')).toBeInTheDocument() // Granted icon
      expect(screen.getByText('❌')).toBeInTheDocument() // Denied icon
      expect(screen.getByText('🔄')).toBeInTheDocument() // Revoked icon
    })

    it('should show decision badges', () => {
      render(<ConsentHistory consentData={mockConsentData} />)
      
      expect(screen.getByText('GRANTED')).toBeInTheDocument()
      expect(screen.getByText('DENIED')).toBeInTheDocument()
      expect(screen.getByText('REVOKED')).toBeInTheDocument()
    })

    it('should show data disclosed information', () => {
      render(<ConsentHistory consentData={mockConsentData} />)
      
      expect(screen.getByText('Data disclosed: page_content, user_prompt')).toBeInTheDocument()
      expect(screen.getByText('Data disclosed: url, headers')).toBeInTheDocument()
      expect(screen.getByText('Data disclosed: user_preferences')).toBeInTheDocument()
    })

    it('should show verification indicators', () => {
      render(<ConsentHistory consentData={mockConsentData} />)
      
      const verificationIndicators = screen.getAllByText('Cryptographically verified')
      expect(verificationIndicators).toHaveLength(3)
    })
  })

  describe('search functionality', () => {
    it('should filter decisions by search term', async () => {
      const user = userEvent.setup()
      render(<ConsentHistory consentData={mockConsentData} />)
      
      const searchInput = screen.getByPlaceholderText('Search consent decisions...')
      await user.type(searchInput, 'AI')
      
      await waitFor(() => {
        expect(screen.getByText('AI_QUERY')).toBeInTheDocument()
        expect(screen.queryByText('NETWORK_REQUEST')).not.toBeInTheDocument()
      })
    })

    it('should show no results message when no matches found', async () => {
      const user = userEvent.setup()
      render(<ConsentHistory consentData={mockConsentData} />)
      
      const searchInput = screen.getByPlaceholderText('Search consent decisions...')
      await user.type(searchInput, 'nonexistent')
      
      await waitFor(() => {
        expect(screen.getByText('No consent decisions found matching your criteria.')).toBeInTheDocument()
    })
  })

  describe('filtering', () => {
    it('should filter by decision type', async () => {
      const user = userEvent.setup()
      render(<ConsentHistory consentData={mockConsentData} />)
      
      const decisionSelect = screen.getByDisplayValue('All Decisions')
      await user.selectOptions(decisionSelect, 'granted')
      
      await waitFor(() => {
        expect(screen.getByText('AI_QUERY')).toBeInTheDocument()
        expect(screen.queryByText('NETWORK_REQUEST')).not.toBeInTheDocument()
      })
    })

    it('should filter by denied decisions', async () => {
      const user = userEvent.setup()
      render(<ConsentHistory consentData={mockConsentData} />)
      
      const decisionSelect = screen.getByDisplayValue('All Decisions')
      await user.selectOptions(decisionSelect, 'denied')
      
      await waitFor(() => {
        expect(screen.getByText('NETWORK_REQUEST')).toBeInTheDocument()
        expect(screen.queryByText('AI_QUERY')).not.toBeInTheDocument()
      })
    })

    it('should filter by revoked decisions', async () => {
      const user = userEvent.setup()
      render(<ConsentHistory consentData={mockConsentData} />)
      
      const decisionSelect = screen.getByDisplayValue('All Decisions')
      await user.selectOptions(decisionSelect, 'revoked')
      
      await waitFor(() => {
        expect(screen.getByText('PRIVACY_ACTION')).toBeInTheDocument()
        expect(screen.queryByText('AI_QUERY')).not.toBeInTheDocument()
      })
    })
  })

  describe('sorting', () => {
    it('should sort by timestamp by default', () => {
      render(<ConsentHistory consentData={mockConsentData} />)
      
      // Should show Time as selected sort option
      expect(screen.getByDisplayValue('timestamp')).toBeInTheDocument()
    })

    it('should allow changing sort criteria', async () => {
      const user = userEvent.setup()
      render(<ConsentHistory consentData={mockConsentData} />)
      
      const sortSelect = screen.getByDisplayValue('Time')
      await user.selectOptions(sortSelect, 'actionType')
      
      expect(sortSelect).toHaveValue('actionType')
    })

    it('should allow changing sort order', async () => {
      const user = userEvent.setup()
      render(<ConsentHistory consentData={mockConsentData} />)
      
      const sortOrderButton = screen.getByText('↓')
      await user.click(sortOrderButton)
      
      expect(screen.getByText('↑')).toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('should show details button for each decision', () => {
      render(<ConsentHistory consentData={mockConsentData} />)
      
      const detailsButtons = screen.getAllByText('Details')
      expect(detailsButtons).toHaveLength(3)
    })

    it('should show revoke button for granted decisions', () => {
      render(<ConsentHistory consentData={mockConsentData} />)
      
      const revokeButtons = screen.getAllByText('Revoke')
      expect(revokeButtons).toHaveLength(1) // Only one granted decision
    })

    it('should not show revoke button for denied decisions', () => {
      render(<ConsentHistory consentData={mockConsentData} />)
      
      // Should not have revoke buttons for denied/revoked decisions
      const revokeButtons = screen.getAllByText('Revoke')
      expect(revokeButtons).toHaveLength(1) // Only for granted decision
    })
  })

  describe('empty state', () => {
    it('should show empty state when no consent data provided', () => {
      render(<ConsentHistory consentData={[]} />)
      
      expect(screen.getByText('No consent decisions found matching your criteria.')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ConsentHistory consentData={mockConsentData} />)
      
      expect(screen.getByPlaceholderText('Search consent decisions...')).toBeInTheDocument()
    })

    it('should have proper form controls', () => {
      render(<ConsentHistory consentData={mockConsentData} />)
      
      expect(screen.getByRole('textbox')).toBeInTheDocument() // Search input
      expect(screen.getAllByRole('combobox')).toHaveLength(2) // Decision and sort selects
    })
  })
})
