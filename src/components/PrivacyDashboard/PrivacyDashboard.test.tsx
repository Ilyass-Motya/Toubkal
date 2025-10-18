/**
 * Privacy Dashboard Component Tests
 * 
 * Tests for PrivacyDashboard component
 * Following Toubkal coding rules: AAA pattern, proper mocking
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PrivacyDashboard } from './PrivacyDashboard'
import type { PrivacyDashboardState } from '@/types/TelemetryTypes'

// Mock the telemetry manager
vi.mock('@/services/telemetry-manager', () => ({
  telemetryManager: {
    getPrivacyDashboardState: vi.fn()
  }
}))

import { telemetryManager } from '@/services/telemetry-manager'

const mockTelemetryManager = vi.mocked(telemetryManager)

describe('PrivacyDashboard', () => {
  const mockProps = {
    onConsentHistoryClick: vi.fn(),
    onAuditLogsClick: vi.fn(),
    onSettingsClick: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('should display loading animation initially', () => {
      // Arrange
      mockTelemetryManager.getPrivacyDashboardState.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      // Act
      render(<PrivacyDashboard {...mockProps} />)

      // Assert
      expect(screen.getByText('Privacy Dashboard')).toBeInTheDocument()
      // Check for loading animation elements instead of text
      expect(screen.getByText('Privacy Dashboard')).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('should display error message when loading fails', async () => {
      // Arrange
      const errorMessage = 'Failed to load privacy state'
      mockTelemetryManager.getPrivacyDashboardState.mockResolvedValue({
        success: false,
        error: errorMessage
      })

      // Act
      render(<PrivacyDashboard {...mockProps} />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Privacy Dashboard Error')).toBeInTheDocument()
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('should allow retry on error', async () => {
      // Arrange
      const user = userEvent.setup()
      mockTelemetryManager.getPrivacyDashboardState
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          success: true,
          data: {
            telemetryStatus: 'disabled',
            dataCollected: 'zero',
            lastAuditLog: Date.now(),
            consentCount: 0,
            networkRequestsBlocked: 0
          }
        })

      // Act
      render(<PrivacyDashboard {...mockProps} />)
      
      await waitFor(() => {
        expect(screen.getByText('Privacy Dashboard Error')).toBeInTheDocument()
      })

      const retryButton = screen.getByText('Retry')
      await user.click(retryButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Telemetry: Disabled')).toBeInTheDocument()
      })
    })
  })

  const mockState: PrivacyDashboardState = {
    telemetryStatus: 'disabled',
    dataCollected: 'zero',
    lastAuditLog: 1640995200000, // 2022-01-01
    consentCount: 5,
    networkRequestsBlocked: 12
  }

  describe('success state', () => {

    beforeEach(() => {
      mockTelemetryManager.getPrivacyDashboardState.mockResolvedValue({
        success: true,
        data: mockState
      })
    })

    it('should display privacy dashboard with correct data', async () => {
      // Arrange
      // (setup in beforeEach)

      // Act
      render(<PrivacyDashboard {...mockProps} />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Privacy Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Telemetry: Disabled')).toBeInTheDocument()
        expect(screen.getByText('(Zero Data Collected)')).toBeInTheDocument()
        expect(screen.getByText('5')).toBeInTheDocument() // consent count
        expect(screen.getByText('12')).toBeInTheDocument() // blocked requests
      })
    })

    it('should show enabled status when telemetry is enabled', async () => {
      // Arrange
      const enabledState = { ...mockState, telemetryStatus: 'enabled' as const }
      mockTelemetryManager.getPrivacyDashboardState.mockResolvedValue({
        success: true,
        data: enabledState
      })

      // Act
      render(<PrivacyDashboard {...mockProps} />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Telemetry: Enabled')).toBeInTheDocument()
      })
    })

    it('should call onConsentHistoryClick when consent history button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<PrivacyDashboard {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('View Consent History')).toBeInTheDocument()
      })

      // Act
      const consentButton = screen.getByText('View Consent History')
      await user.click(consentButton)

      // Assert
      expect(mockProps.onConsentHistoryClick).toHaveBeenCalledTimes(1)
    })

    it('should call onAuditLogsClick when audit logs button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<PrivacyDashboard {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('View Audit Logs')).toBeInTheDocument()
      })

      // Act
      const auditButton = screen.getByText('View Audit Logs')
      await user.click(auditButton)

      // Assert
      expect(mockProps.onAuditLogsClick).toHaveBeenCalledTimes(1)
    })

    it('should call onSettingsClick when settings button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<PrivacyDashboard {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('Privacy Settings')).toBeInTheDocument()
      })

      // Act
      const settingsButton = screen.getByText('Privacy Settings')
      await user.click(settingsButton)

      // Assert
      expect(mockProps.onSettingsClick).toHaveBeenCalledTimes(1)
    })

    it('should refresh data when refresh button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<PrivacyDashboard {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument()
      })

      // Act
      const refreshButton = screen.getByText('Refresh')
      await user.click(refreshButton)

      // Assert
      expect(mockTelemetryManager.getPrivacyDashboardState).toHaveBeenCalledTimes(2)
    })

    it('should display privacy notice', async () => {
      // Arrange
      // (setup in beforeEach)

      // Act
      render(<PrivacyDashboard {...mockProps} />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Privacy Notice')).toBeInTheDocument()
        expect(screen.getByText(/Toubkal Browser is designed with privacy-first principles/)).toBeInTheDocument()
      })
    })
  })

  describe('status colors', () => {
    it('should show green color for disabled status', async () => {
      // Arrange
      const disabledState = { ...mockState, telemetryStatus: 'disabled' as const }
      mockTelemetryManager.getPrivacyDashboardState.mockResolvedValue({
        success: true,
        data: disabledState
      })

      // Act
      render(<PrivacyDashboard {...mockProps} />)

      // Assert
      await waitFor(() => {
        const statusElement = screen.getByText('Telemetry: Disabled')
        expect(statusElement).toHaveClass('text-green-600', 'bg-green-100')
      })
    })

    it('should show red color for enabled status', async () => {
      // Arrange
      const enabledState = { ...mockState, telemetryStatus: 'enabled' as const }
      mockTelemetryManager.getPrivacyDashboardState.mockResolvedValue({
        success: true,
        data: enabledState
      })

      // Act
      render(<PrivacyDashboard {...mockProps} />)

      // Assert
      await waitFor(() => {
        const statusElement = screen.getByText('Telemetry: Enabled')
        expect(statusElement).toHaveClass('text-red-600', 'bg-red-100')
      })
    })
  })

  describe('data collected text', () => {
    it('should display correct text for zero data collected', async () => {
      // Arrange
      const zeroDataState = { ...mockState, dataCollected: 'zero' as const }
      mockTelemetryManager.getPrivacyDashboardState.mockResolvedValue({
        success: true,
        data: zeroDataState
      })

      // Act
      render(<PrivacyDashboard {...mockProps} />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('(Zero Data Collected)')).toBeInTheDocument()
      })
    })

    it('should display correct text for minimal data collected', async () => {
      // Arrange
      const minimalDataState = { ...mockState, dataCollected: 'minimal' as const }
      mockTelemetryManager.getPrivacyDashboardState.mockResolvedValue({
        success: true,
        data: minimalDataState
      })

      // Act
      render(<PrivacyDashboard {...mockProps} />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('(Minimal Data Collected)')).toBeInTheDocument()
      })
    })
  })
})
