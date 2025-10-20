/**
 * Privacy Settings Component Tests
 * 
 * Unit tests for the PrivacySettings React component
 * following AAA pattern and mocking external dependencies.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PrivacySettings } from './PrivacySettings'
import { usePrivacySettings } from '@/hooks/use-privacy-settings'

// Mock the privacy settings hook
vi.mock('@/hooks/use-privacy-settings', () => ({
  usePrivacySettings: vi.fn()
}))

const mockUsePrivacySettings = vi.mocked(usePrivacySettings)

describe('PrivacySettings', () => {
  const defaultMockReturn = {
    settings: {
      fingerprintingProtection: true,
      trackerBlocking: true,
      braveShieldsAggressive: true,
      protectionEnabled: true,
      lastModified: Date.now(),
      userId: 'user_123'
    },
    status: {
      status: 'enabled' as const,
      features: {
        fingerprinting: true,
        tracking: true,
        shields: true
      },
      performance: {
        activationTime: 100,
        firstRunTime: 500
      },
      lastAuditId: 'audit_123'
    },
    warnings: [],
    isLoading: false,
    error: null,
    updateSettings: vi.fn(),
    enableProtection: vi.fn(),
    disableProtection: vi.fn(),
    runFingerprintingTests: vi.fn(),
    acknowledgeWarning: vi.fn(),
    clearWarnings: vi.fn(),
    refresh: vi.fn(),
    isProtectionEnabled: true,
    isFingerprintingEnabled: true,
    isTrackerBlockingEnabled: true
  }

  beforeEach(() => {
    mockUsePrivacySettings.mockReturnValue(defaultMockReturn)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
    it('should render loading state', async () => {
      // Arrange
      mockUsePrivacySettings.mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
        settings: null,
        status: null
      })

      // Act
      render(<PrivacySettings />)

      // Assert - wait for loading state
      await waitFor(() => {
        expect(screen.getByText('Loading privacy settings...')).toBeInTheDocument()
      })
      // Loading state shows a spinner, not buttons
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should render error state', () => {
      // Arrange
      const errorMessage = 'Failed to load settings'
      mockUsePrivacySettings.mockReturnValue({
        ...defaultMockReturn,
        error: errorMessage,
        settings: null,
        status: null
      })

      // Act
      render(<PrivacySettings />)

      // Assert
      expect(screen.getByText('Error loading privacy settings')).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('should render privacy settings successfully', () => {
      // Arrange & Act
      render(<PrivacySettings />)

      // Assert
      expect(screen.getByText('Privacy Settings')).toBeInTheDocument()
      expect(screen.getByText('Overall Protection')).toBeInTheDocument()
      expect(screen.getByText('Protection: Enabled')).toBeInTheDocument()
      expect(screen.getByText('Privacy Features')).toBeInTheDocument()
      expect(screen.getByText('Privacy Protection')).toBeInTheDocument()
      expect(screen.getByText('Fingerprinting Protection')).toBeInTheDocument()
      expect(screen.getByText('Tracker Blocking')).toBeInTheDocument()
      expect(screen.getByText('Brave Shields (Aggressive)')).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      // Arrange
      const customClassName = 'custom-class'

      // Act
      const { container } = render(<PrivacySettings className={customClassName} />)

      // Assert
      // The root div has the custom class
      const rootDiv = container.firstChild as HTMLElement
      expect(rootDiv).toHaveClass(customClassName)
    })
  })

  describe('protection status display', () => {
    it('should display enabled status correctly', () => {
      // Arrange & Act
      render(<PrivacySettings />)

      // Assert
      expect(screen.getByText('Protection: Enabled')).toBeInTheDocument()
      const statusBadge = screen.getByText('Protection: Enabled')
      expect(statusBadge).toHaveClass('text-green-600', 'bg-green-100')
    })

    it('should display disabled status correctly', () => {
      // Arrange
      mockUsePrivacySettings.mockReturnValue({
        ...defaultMockReturn,
        status: {
          ...defaultMockReturn.status,
          status: 'disabled'
        },
        isProtectionEnabled: false
      })

      // Act
      render(<PrivacySettings />)

      // Assert
      expect(screen.getByText('Protection: Disabled')).toBeInTheDocument()
      const statusBadge = screen.getByText('Protection: Disabled')
      expect(statusBadge).toHaveClass('text-red-600', 'bg-red-100')
    })

    it('should display partial status correctly', () => {
      // Arrange
      mockUsePrivacySettings.mockReturnValue({
        ...defaultMockReturn,
        status: {
          ...defaultMockReturn.status,
          status: 'partial'
        }
      })

      // Act
      render(<PrivacySettings />)

      // Assert
      expect(screen.getByText('Protection: Partial')).toBeInTheDocument()
      const statusBadge = screen.getByText('Protection: Partial')
      expect(statusBadge).toHaveClass('text-yellow-600', 'bg-yellow-100')
    })

    it('should display performance metrics', () => {
      // Arrange
      mockUsePrivacySettings.mockReturnValue({
        ...defaultMockReturn,
        status: {
          ...defaultMockReturn.status,
          performance: {
            activationTime: 150,
            firstRunTime: 750
          }
        }
      })

      // Act
      render(<PrivacySettings />)

      // Assert
      expect(screen.getByText('Activation: 150ms')).toBeInTheDocument()
    })
  })

  describe('privacy warnings', () => {
    it('should display privacy warnings', () => {
      // Arrange
      const warnings = [
        {
          type: 'REDUCED_PRIVACY' as const,
          message: 'Privacy protection has been disabled',
          acknowledged: false,
          timestamp: Date.now()
        },
        {
          type: 'FINGERPRINTING_ENABLED' as const,
          message: 'Fingerprinting protection has been disabled',
          acknowledged: false,
          timestamp: Date.now()
        }
      ]

      mockUsePrivacySettings.mockReturnValue({
        ...defaultMockReturn,
        warnings
      })

      // Act
      render(<PrivacySettings />)

      // Assert
      expect(screen.getByText('Privacy Warnings')).toBeInTheDocument()
      expect(screen.getByText('Privacy protection has been disabled')).toBeInTheDocument()
      expect(screen.getByText('Fingerprinting protection has been disabled')).toBeInTheDocument()
    })

    it('should acknowledge warnings when clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockAcknowledgeWarning = vi.fn()
      const warnings = [
        {
          type: 'REDUCED_PRIVACY' as const,
          message: 'Privacy protection has been disabled',
          acknowledged: false,
          timestamp: Date.now()
        }
      ]

      mockUsePrivacySettings.mockReturnValue({
        ...defaultMockReturn,
        warnings,
        acknowledgeWarning: mockAcknowledgeWarning
      })

      // Act
      render(<PrivacySettings />)
      const acknowledgeButton = screen.getByText('Acknowledge')
      await user.click(acknowledgeButton)

      // Assert
      expect(mockAcknowledgeWarning).toHaveBeenCalledWith(0)
    })

    it('should clear all warnings', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockClearWarnings = vi.fn()
      const warnings = [
        {
          type: 'REDUCED_PRIVACY' as const,
          message: 'Privacy protection has been disabled',
          acknowledged: false,
          timestamp: Date.now()
        }
      ]

      mockUsePrivacySettings.mockReturnValue({
        ...defaultMockReturn,
        warnings,
        clearWarnings: mockClearWarnings
      })

      // Act
      render(<PrivacySettings />)
      const clearButton = screen.getByText('Clear all warnings')
      await user.click(clearButton)

      // Assert
      expect(mockClearWarnings).toHaveBeenCalledTimes(1)
    })
  })

  describe('protection toggles', () => {
    it('should toggle overall protection', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockDisableProtection = vi.fn().mockResolvedValue({ success: true, data: true })

      mockUsePrivacySettings.mockReturnValue({
        ...defaultMockReturn,
        disableProtection: mockDisableProtection
      })

      // Act
      render(<PrivacySettings />)
      const protectionToggle = screen.getByRole('button', { name: /privacy protection/i })
      await user.click(protectionToggle)

      // Assert
      expect(mockDisableProtection).toHaveBeenCalledTimes(1)
    })

    it('should toggle fingerprinting protection', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockUpdateSettings = vi.fn().mockResolvedValue({ success: true, data: {} })

      mockUsePrivacySettings.mockReturnValue({
        ...defaultMockReturn,
        updateSettings: mockUpdateSettings
      })

      // Act
      render(<PrivacySettings />)
      const fingerprintingToggle = screen.getByRole('button', { name: /fingerprinting protection/i })
      await user.click(fingerprintingToggle)

      // Assert
      expect(mockUpdateSettings).toHaveBeenCalledWith({
        fingerprintingProtection: false
      })
    })

    it('should toggle tracker blocking', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockUpdateSettings = vi.fn().mockResolvedValue({ success: true, data: {} })

      mockUsePrivacySettings.mockReturnValue({
        ...defaultMockReturn,
        updateSettings: mockUpdateSettings
      })

      // Act
      render(<PrivacySettings />)
      const trackerToggle = screen.getByRole('button', { name: /tracker blocking/i })
      await user.click(trackerToggle)

      // Assert
      expect(mockUpdateSettings).toHaveBeenCalledWith({
        trackerBlocking: false
      })
    })

    it('should toggle Brave Shields', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockUpdateSettings = vi.fn().mockResolvedValue({ success: true, data: {} })

      mockUsePrivacySettings.mockReturnValue({
        ...defaultMockReturn,
        updateSettings: mockUpdateSettings
      })

      // Act
      render(<PrivacySettings />)
      const shieldsToggle = screen.getByRole('button', { name: /brave shields/i })
      await user.click(shieldsToggle)

      // Assert
      expect(mockUpdateSettings).toHaveBeenCalledWith({
        braveShieldsAggressive: false
      })
    })

    it('should disable individual toggles when protection is disabled', () => {
      // Arrange
      mockUsePrivacySettings.mockReturnValue({
        ...defaultMockReturn,
        isProtectionEnabled: false,
        isFingerprintingEnabled: false,
        isTrackerBlockingEnabled: false
      })

      // Act
      render(<PrivacySettings />)

      // Assert
      const fingerprintingToggle = screen.getByRole('button', { name: /fingerprinting protection/i })
      const trackerToggle = screen.getByRole('button', { name: /tracker blocking/i })
      const shieldsToggle = screen.getByRole('button', { name: /brave shields/i })

      expect(fingerprintingToggle).toBeDisabled()
      expect(trackerToggle).toBeDisabled()
      expect(shieldsToggle).toBeDisabled()
    })
  })

  describe('fingerprinting tests', () => {
    it('should run fingerprinting tests', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockRunTests = vi.fn().mockResolvedValue({
        success: true,
        data: [
          {
            testName: 'Canvas Fingerprinting',
            testUrl: 'https://panopticlick.eff.org/',
            score: 95,
            passed: true,
            details: {
              canvasFingerprint: false,
              webglFingerprint: false,
              fontFingerprint: false,
              audioFingerprint: false,
              screenFingerprint: false,
              timezoneFingerprint: false
            },
            timestamp: Date.now()
          }
        ]
      })

      mockUsePrivacySettings.mockReturnValue({
        ...defaultMockReturn,
        runFingerprintingTests: mockRunTests
      })

      // Act
      render(<PrivacySettings />)
      const runTestsButton = screen.getByText('Run Privacy Tests')
      await user.click(runTestsButton)

      // Assert
      expect(mockRunTests).toHaveBeenCalledTimes(1)
    })

    it('should display test results', async () => {
      // Arrange
      const user = userEvent.setup()
      const testResults = [
        {
          testName: 'Canvas Fingerprinting',
          testUrl: 'https://panopticlick.eff.org/',
          score: 95,
          passed: true,
          details: {
            canvasFingerprint: false,
            webglFingerprint: false,
            fontFingerprint: false,
            audioFingerprint: false,
            screenFingerprint: false,
            timezoneFingerprint: false
          },
          timestamp: Date.now()
        },
        {
          testName: 'WebGL Fingerprinting',
          testUrl: 'https://panopticlick.eff.org/',
          score: 85,
          passed: false,
          details: {
            canvasFingerprint: false,
            webglFingerprint: true,
            fontFingerprint: false,
            audioFingerprint: false,
            screenFingerprint: false,
            timezoneFingerprint: false
          },
          timestamp: Date.now()
        }
      ]

      // Mock the component state to include test results
      const { rerender } = render(<PrivacySettings />)
      
      // Simulate test results being set
      const component = screen.getByText('Privacy Settings').closest('div')
      if (component) {
        // This would normally be handled by the component's internal state
        // For testing, we'll render with the test results
        mockUsePrivacySettings.mockReturnValue({
          ...defaultMockReturn,
          runFingerprintingTests: vi.fn().mockResolvedValue({
            success: true,
            data: testResults
          })
        })
      }

      rerender(<PrivacySettings />)

      // Act
      const runTestsButton = screen.getByText('Run Privacy Tests')
      await user.click(runTestsButton)

      // Wait for test results to appear
      await waitFor(() => {
        expect(screen.getByText('Test Results')).toBeInTheDocument()
      })

      // Assert
      expect(screen.getByText('Canvas Fingerprinting')).toBeInTheDocument()
      expect(screen.getByText('WebGL Fingerprinting')).toBeInTheDocument()
      expect(screen.getByText('Score: 95/100')).toBeInTheDocument()
      expect(screen.getByText('Score: 85/100')).toBeInTheDocument()
      expect(screen.getByText('Passed')).toBeInTheDocument()
      expect(screen.getByText('Failed')).toBeInTheDocument()
    })

    it('should show loading state during tests', async () => {
      // Arrange
      const user = userEvent.setup()
      let resolvePromise: (value: unknown) => void
      const testPromise = new Promise(resolve => {
        resolvePromise = resolve
      })

      const mockRunTests = vi.fn().mockReturnValue(testPromise)

      mockUsePrivacySettings.mockReturnValue({
        ...defaultMockReturn,
        runFingerprintingTests: mockRunTests
      })

      // Act
      render(<PrivacySettings />)
      const runTestsButton = screen.getByText('Run Privacy Tests')
      await user.click(runTestsButton)

      // Assert
      expect(screen.getByText('Running Tests...')).toBeInTheDocument()
      expect(runTestsButton).toBeDisabled()

      // Cleanup
      resolvePromise({ success: true, data: [] })
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels for toggles', () => {
      // Arrange & Act
      render(<PrivacySettings />)

      // Assert
      expect(screen.getByRole('button', { name: /privacy protection/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /fingerprinting protection/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /tracker blocking/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /brave shields/i })).toBeInTheDocument()
    })

    it('should have proper button labels', () => {
      // Arrange & Act
      render(<PrivacySettings />)

      // Assert
      expect(screen.getByRole('button', { name: /run privacy tests/i })).toBeInTheDocument()
    })
  })
})
