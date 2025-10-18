/**
 * Consent Prompt Component Tests
 * 
 * Tests for ConsentPrompt component
 * Following Toubkal coding rules: AAA pattern, proper mocking
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ConsentPrompt } from './ConsentPrompt'
import type { ConsentPromptProps } from '@/types/TelemetryTypes'

describe('ConsentPrompt', () => {
  const mockProps: ConsentPromptProps = {
    actionType: 'AI_QUERY_CLOUD',
    dataDisclosed: ['prompt text', 'page content', 'user context'],
    purpose: 'Process AI query using cloud provider',
    onGrant: vi.fn(),
    onDeny: vi.fn(),
    onClose: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should display consent prompt with correct information', () => {
      // Arrange
      // (props provided in describe block)

      // Act
      render(<ConsentPrompt {...mockProps} />)

      // Assert
      expect(screen.getByText('Consent Required')).toBeInTheDocument()
      expect(screen.getByText('Cloud AI Query')).toBeInTheDocument()
      expect(screen.getByText('Process AI query using cloud provider')).toBeInTheDocument()
      expect(screen.getByText('Data that will be accessed/sent:')).toBeInTheDocument()
      expect(screen.getByText('prompt text')).toBeInTheDocument()
      expect(screen.getByText('page content')).toBeInTheDocument()
      expect(screen.getByText('user context')).toBeInTheDocument()
    })

    it('should display close button', () => {
      // Arrange
      // (props provided in describe block)

      // Act
      render(<ConsentPrompt {...mockProps} />)

      // Assert
      const closeButton = screen.getByRole('button', { name: /close/i })
      expect(closeButton).toBeInTheDocument()
    })

    it('should display action buttons', () => {
      // Arrange
      // (props provided in describe block)

      // Act
      render(<ConsentPrompt {...mockProps} />)

      // Assert
      expect(screen.getByText('Grant Consent')).toBeInTheDocument()
      expect(screen.getByText('Deny')).toBeInTheDocument()
      expect(screen.getByText('Cancel (no action taken)')).toBeInTheDocument()
    })

    it('should display privacy notice', () => {
      // Arrange
      // (props provided in describe block)

      // Act
      render(<ConsentPrompt {...mockProps} />)

      // Assert
      expect(screen.getByText('Privacy Notice')).toBeInTheDocument()
      expect(screen.getByText(/Toubkal Browser collects zero data/)).toBeInTheDocument()
    })
  })

  describe('user interaction', () => {
    it('should call onGrant when grant button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<ConsentPrompt {...mockProps} />)

      // Act
      const grantButton = screen.getByText('Grant Consent')
      await user.click(grantButton)

      // Assert
      expect(mockProps.onGrant).toHaveBeenCalledTimes(1)
    })

    it('should call onDeny when deny button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<ConsentPrompt {...mockProps} />)

      // Act
      const denyButton = screen.getByText('Deny')
      await user.click(denyButton)

      // Assert
      expect(mockProps.onDeny).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when close button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<ConsentPrompt {...mockProps} />)

      // Act
      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      // Assert
      expect(mockProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when cancel button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<ConsentPrompt {...mockProps} />)

      // Act
      const cancelButton = screen.getByText('Cancel (no action taken)')
      await user.click(cancelButton)

      // Assert
      expect(mockProps.onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('loading state', () => {
    it('should show processing state when grant is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      const slowOnGrant = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      const propsWithSlowGrant = { ...mockProps, onGrant: slowOnGrant }
      render(<ConsentPrompt {...propsWithSlowGrant} />)

      // Act
      const grantButton = screen.getByText('Grant Consent')
      await user.click(grantButton)

      // Assert
      expect(screen.getAllByText('Processing...')).toHaveLength(2)
      expect(grantButton).toBeDisabled()
    })

    it('should show processing state when deny is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      const slowOnDeny = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      const propsWithSlowDeny = { ...mockProps, onDeny: slowOnDeny }
      render(<ConsentPrompt {...propsWithSlowDeny} />)

      // Act
      const denyButton = screen.getByText('Deny')
      await user.click(denyButton)

      // Assert
      expect(screen.getAllByText('Processing...')).toHaveLength(2)
      expect(denyButton).toBeDisabled()
    })
  })

  describe('error handling', () => {
    it('should handle onGrant errors gracefully', async () => {
      // Arrange
      const user = userEvent.setup()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const errorOnGrant = vi.fn().mockRejectedValue(new Error('Grant failed'))
      const propsWithErrorGrant = { ...mockProps, onGrant: errorOnGrant }
      render(<ConsentPrompt {...propsWithErrorGrant} />)

      // Act
      const grantButton = screen.getByText('Grant Consent')
      await user.click(grantButton)

      // Assert
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('[ConsentPrompt] Grant failed:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })

    it('should handle onDeny errors gracefully', async () => {
      // Arrange
      const user = userEvent.setup()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const errorOnDeny = vi.fn().mockRejectedValue(new Error('Deny failed'))
      const propsWithErrorDeny = { ...mockProps, onDeny: errorOnDeny }
      render(<ConsentPrompt {...propsWithErrorDeny} />)

      // Act
      const denyButton = screen.getByText('Deny')
      await user.click(denyButton)

      // Assert
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('[ConsentPrompt] Deny failed:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })
  })

  describe('action type display', () => {
    it('should display correct text for AI_QUERY_CLOUD', () => {
      // Arrange
      const props = { ...mockProps, actionType: 'AI_QUERY_CLOUD' }

      // Act
      render(<ConsentPrompt {...props} />)

      // Assert
      expect(screen.getByText('Cloud AI Query')).toBeInTheDocument()
    })

    it('should display correct text for TELEMETRY_ENABLE', () => {
      // Arrange
      const props = { ...mockProps, actionType: 'TELEMETRY_ENABLE' }

      // Act
      render(<ConsentPrompt {...props} />)

      // Assert
      expect(screen.getByText('Enable Telemetry')).toBeInTheDocument()
    })

    it('should display correct text for ANALYTICS_COLLECT', () => {
      // Arrange
      const props = { ...mockProps, actionType: 'ANALYTICS_COLLECT' }

      // Act
      render(<ConsentPrompt {...props} />)

      // Assert
      expect(screen.getByText('Analytics Collection')).toBeInTheDocument()
    })

    it('should display formatted text for unknown action type', () => {
      // Arrange
      const props = { ...mockProps, actionType: 'UNKNOWN_ACTION_TYPE' }

      // Act
      render(<ConsentPrompt {...props} />)

      // Assert
      expect(screen.getByText('unknown action type')).toBeInTheDocument()
    })
  })

  describe('visibility', () => {
    it('should hide prompt after successful grant', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<ConsentPrompt {...mockProps} />)

      // Act
      const grantButton = screen.getByText('Grant Consent')
      await user.click(grantButton)

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('Consent Required')).not.toBeInTheDocument()
      })
    })

    it('should hide prompt after successful deny', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<ConsentPrompt {...mockProps} />)

      // Act
      const denyButton = screen.getByText('Deny')
      await user.click(denyButton)

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('Consent Required')).not.toBeInTheDocument()
      })
    })

    it('should hide prompt after close', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<ConsentPrompt {...mockProps} />)

      // Act
      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('Consent Required')).not.toBeInTheDocument()
      })
    })
  })
})
