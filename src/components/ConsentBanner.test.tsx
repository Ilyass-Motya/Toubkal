import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ConsentBanner } from './ConsentBanner'

// Mock the consent manager
const mockConsentManager = {
  requestConsent: vi.fn(),
  hasConsent: vi.fn(),
  revokeConsent: vi.fn(),
}

vi.mock('../toubkal/app/features/consent/services/consent-manager', () => ({
  getConsentManager: () => mockConsentManager,
}))

describe('ConsentBanner', () => {
  const defaultProps = {
    actionType: 'AI_QUERY' as const,
    onGrant: vi.fn(),
    onDeny: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should display consent message for AI query', async () => {
      // Arrange
      mockConsentManager.hasConsent.mockResolvedValue(false)
      render(<ConsentBanner {...defaultProps} />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText(/Loading consent status/i)).not.toBeInTheDocument()
      })

      // Assert
      expect(screen.getByText(/AI query requires consent/i)).toBeInTheDocument()
    })

    it('should display consent message for data collection', async () => {
      // Arrange
      mockConsentManager.hasConsent.mockResolvedValue(false)
      render(<ConsentBanner {...defaultProps} actionType="DATA_COLLECTION" />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText(/Loading consent status/i)).not.toBeInTheDocument()
      })

      // Assert
      expect(screen.getByText(/Data collection requires consent/i)).toBeInTheDocument()
    })

    it('should show loading state initially', async () => {
      // Arrange
      mockConsentManager.hasConsent.mockResolvedValue(false)
      render(<ConsentBanner {...defaultProps} />)

      // Act (not needed for render test)

      // Assert
      expect(screen.getByText(/Loading consent status/i)).toBeInTheDocument()

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText(/Loading consent status/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('user interaction', () => {
    it('should call onGrant when user clicks Grant button', async () => {
      // Arrange
      const mockOnGrant = vi.fn()
      const user = userEvent.setup()
      mockConsentManager.hasConsent.mockResolvedValue(false)

      render(<ConsentBanner {...defaultProps} onGrant={mockOnGrant} />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText(/Loading consent status/i)).not.toBeInTheDocument()
      })

      // Act
      const grantButton = screen.getByRole('button', { name: /grant/i })
      await user.click(grantButton)

      // Assert
      expect(mockOnGrant).toHaveBeenCalledTimes(1)
      expect(mockConsentManager.requestConsent).toHaveBeenCalledWith({
        actionType: 'AI_QUERY',
        userId: 'current-user',
        context: 'banner-request',
        timestamp: expect.any(Number),
      })
    })

    it('should call onDeny when user clicks Deny button', async () => {
      // Arrange
      const mockOnDeny = vi.fn()
      const user = userEvent.setup()
      mockConsentManager.hasConsent.mockResolvedValue(false)

      render(<ConsentBanner {...defaultProps} onDeny={mockOnDeny} />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText(/Loading consent status/i)).not.toBeInTheDocument()
      })

      // Act
      const denyButton = screen.getByRole('button', { name: /deny/i })
      await user.click(denyButton)

      // Assert
      expect(mockOnDeny).toHaveBeenCalledTimes(1)
    })

    it('should not show banner when consent already granted', async () => {
      // Arrange
      mockConsentManager.hasConsent.mockResolvedValue(true)

      render(<ConsentBanner {...defaultProps} />)

      // Act
      await waitFor(() => {
        expect(screen.queryByText(/Loading consent status/i)).not.toBeInTheDocument()
      })

      // Assert
      expect(screen.queryByRole('button', { name: /grant/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /deny/i })).not.toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('should display error message when consent check fails', async () => {
      // Arrange
      mockConsentManager.hasConsent.mockRejectedValue(new Error('Consent check failed'))

      render(<ConsentBanner {...defaultProps} />)

      // Act
      await waitFor(() => {
        expect(screen.queryByText(/Loading consent status/i)).not.toBeInTheDocument()
      })

      // Assert
      expect(screen.getByText('Error checking consent status')).toBeInTheDocument()
    })

    it('should retry consent check when retry button clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      mockConsentManager.hasConsent
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(false)

      render(<ConsentBanner {...defaultProps} />)

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('Error checking consent status')).toBeInTheDocument()
      })

      // Act
      const retryButton = screen.getByRole('button', { name: /retry/i })
      await user.click(retryButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/AI query requires consent/i)).toBeInTheDocument()
      })
      expect(mockConsentManager.hasConsent).toHaveBeenCalledTimes(2)
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      // Arrange
      mockConsentManager.hasConsent.mockResolvedValue(false)
      render(<ConsentBanner {...defaultProps} />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText(/Loading consent status/i)).not.toBeInTheDocument()
      })

      // Assert
      const banner = screen.getByRole('banner')
      expect(banner).toHaveAttribute('aria-live', 'polite')
      expect(banner).toHaveAttribute('aria-label', 'Consent request')
    })

    it('should be keyboard navigable', async () => {
      // Arrange
      const user = userEvent.setup()
      mockConsentManager.hasConsent.mockResolvedValue(false)

      render(<ConsentBanner {...defaultProps} />)

      await waitFor(() => {
        expect(screen.queryByText(/Loading consent status/i)).not.toBeInTheDocument()
      })

      // Act
      await user.tab()
      await user.tab()

      // Assert
      const grantButton = screen.getByRole('button', { name: /grant/i })
      expect(grantButton).toHaveFocus()
    })
  })
})
