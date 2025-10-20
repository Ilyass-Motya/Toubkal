/**
 * Privacy Settings Hook Tests
 * 
 * Unit tests for the usePrivacySettings React hook
 * following AAA pattern and mocking external dependencies.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePrivacySettings } from './use-privacy-settings'
import { PrivacyManager } from '@/services/privacy-manager'
import { PrivacySettings, PrivacyStatus, FingerprintingTestResult, PrivacyManagerConfig, PrivacyEvent } from '@/types/PrivacyTypes'
import { Result } from '@/types/CommonTypes'

// Mock the privacy manager - must match full PrivacyManager interface
const mockPrivacyManager = {
  // Public methods
  initialize: vi.fn(),
  getSettings: vi.fn(),
  getStatus: vi.fn(),
  updateSettings: vi.fn(),
  enableProtection: vi.fn(),
  disableProtection: vi.fn(),
  runFingerprintingTests: vi.fn(),
  getAuditLog: vi.fn(),
  exportAuditLog: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),

  // Private properties (mocked for testing)
  settings: {} as PrivacySettings,
  config: {} as PrivacyManagerConfig,
  auditLog: [],        // AuditLogEntry[]
  blocklists: [],      // TrackerBlocklist[]
  warnings: [],        // PrivacyWarning[]
  eventListeners: new Map<string, (event: PrivacyEvent) => void>()
} as PrivacyManager

vi.mock('@/services/privacy-manager', () => ({
  getPrivacyManager: vi.fn(() => mockPrivacyManager)
}))

// Import the mocked function
import { getPrivacyManager } from '@/services/privacy-manager'
const mockGetPrivacyManager = vi.mocked(getPrivacyManager)

describe('usePrivacySettings', () => {
  beforeEach(() => {
    mockGetPrivacyManager.mockReturnValue(mockPrivacyManager)
    vi.clearAllMocks()
    
    // Setup mock return values
    vi.mocked(mockPrivacyManager.initialize).mockResolvedValue({ success: true })
    vi.mocked(mockPrivacyManager.getSettings).mockReturnValue({} as PrivacySettings)
    vi.mocked(mockPrivacyManager.getStatus).mockReturnValue({} as PrivacyStatus)
    vi.mocked(mockPrivacyManager.updateSettings).mockResolvedValue({ success: true, data: {} as PrivacySettings })
    vi.mocked(mockPrivacyManager.enableProtection).mockResolvedValue({ success: true, data: true })
    vi.mocked(mockPrivacyManager.disableProtection).mockResolvedValue({ success: true, data: true })
    vi.mocked(mockPrivacyManager.runFingerprintingTests).mockResolvedValue({ success: true, data: [] as FingerprintingTestResult[] })
    vi.mocked(mockPrivacyManager.getAuditLog).mockReturnValue([])
    vi.mocked(mockPrivacyManager.exportAuditLog).mockResolvedValue({ success: true, data: 'mock-export' })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with loading state', () => {
      // Arrange
      vi.mocked(mockPrivacyManager.initialize).mockResolvedValue({
        success: true,
        data: {
          status: 'enabled',
          features: { fingerprinting: true, tracking: true, shields: true },
          performance: { activationTime: 100, firstRunTime: 500 },
          lastAuditId: 'audit_123'
        }
      })
      vi.mocked(mockPrivacyManager.getSettings).mockReturnValue({
        fingerprintingProtection: true,
        trackerBlocking: true,
        braveShieldsAggressive: true,
        protectionEnabled: true,
        lastModified: Date.now(),
        userId: 'user_123'
      })
      vi.mocked(mockPrivacyManager.getStatus).mockReturnValue({
        status: 'enabled',
        features: { fingerprinting: true, tracking: true, shields: true },
        performance: { activationTime: 100, firstRunTime: 500 },
        lastAuditId: 'audit_123'
      })

      // Act
      const { result } = renderHook(() => usePrivacySettings())

      // Assert
      expect(result.current.isLoading).toBe(true)
      expect(result.current.settings).toBeNull()
      expect(result.current.status).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('should initialize successfully', async () => {
      // Arrange
      const mockSettings: PrivacySettings = {
        fingerprintingProtection: true,
        trackerBlocking: true,
        braveShieldsAggressive: true,
        protectionEnabled: true,
        lastModified: Date.now(),
        userId: 'user_123'
      }

      const mockStatus: PrivacyStatus = {
        status: 'enabled',
        features: { fingerprinting: true, tracking: true, shields: true },
        performance: { activationTime: 100, firstRunTime: 500 },
        lastAuditId: 'audit_123'
      }

      vi.mocked(mockPrivacyManager.initialize).mockResolvedValue({
        success: true,
        data: mockStatus
      })
      vi.mocked(mockPrivacyManager.getSettings).mockReturnValue(mockSettings)
      vi.mocked(mockPrivacyManager.getStatus).mockReturnValue(mockStatus)

      // Act
      const { result } = renderHook(() => usePrivacySettings())

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.settings).toEqual(mockSettings)
        expect(result.current.status).toEqual(mockStatus)
        expect(result.current.error).toBeNull()
      })

      expect(mockPrivacyManager.initialize).toHaveBeenCalledTimes(1)
      expect(mockPrivacyManager.addEventListener).toHaveBeenCalledTimes(2)
    })

    it('should handle initialization errors', async () => {
      // Arrange
      const errorMessage = 'Initialization failed'
      vi.mocked(mockPrivacyManager.initialize).mockResolvedValue({
        success: false,
        error: errorMessage
      })

      // Act
      const { result } = renderHook(() => usePrivacySettings())

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBe(errorMessage)
        expect(result.current.settings).toBeNull()
        expect(result.current.status).toBeNull()
      })
    })
  })

  describe('settings management', () => {
    beforeEach(async () => {
      // Setup successful initialization
      vi.mocked(mockPrivacyManager.initialize).mockResolvedValue({
        success: true,
        data: {
          status: 'enabled',
          features: { fingerprinting: true, tracking: true, shields: true },
          performance: { activationTime: 100, firstRunTime: 500 },
          lastAuditId: 'audit_123'
        }
      })
      vi.mocked(mockPrivacyManager.getSettings).mockReturnValue({
        fingerprintingProtection: true,
        trackerBlocking: true,
        braveShieldsAggressive: true,
        protectionEnabled: true,
        lastModified: Date.now(),
        userId: 'user_123'
      })
      vi.mocked(mockPrivacyManager.getStatus).mockReturnValue({
        status: 'enabled',
        features: { fingerprinting: true, tracking: true, shields: true },
        performance: { activationTime: 100, firstRunTime: 500 },
        lastAuditId: 'audit_123'
      })

      const { result } = renderHook(() => usePrivacySettings())
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should update settings successfully', async () => {
      // Arrange
      const updates = { fingerprintingProtection: false }
      const updatedSettings = {
        fingerprintingProtection: false,
        trackerBlocking: true,
        braveShieldsAggressive: true,
        protectionEnabled: true,
        lastModified: Date.now() + 1000,
        userId: 'user_123'
      }

      vi.mocked(mockPrivacyManager.updateSettings).mockResolvedValue({
        success: true,
        data: updatedSettings
      })
      vi.mocked(mockPrivacyManager.getSettings).mockReturnValue(updatedSettings)
      vi.mocked(mockPrivacyManager.getStatus).mockReturnValue({
        status: 'enabled',
        features: { fingerprinting: false, tracking: true, shields: true },
        performance: { activationTime: 100, firstRunTime: 500 },
        lastAuditId: 'audit_123'
      })

      const { result } = renderHook(() => usePrivacySettings())
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act
      let updateResult: Result<PrivacySettings> | undefined
      await act(async () => {
        updateResult = await result.current.updateSettings(updates)
      })

      // Assert
      expect(updateResult?.success).toBe(true)
      expect(mockPrivacyManager.updateSettings).toHaveBeenCalledWith(updates)
    })

    it('should handle settings update errors', async () => {
      // Arrange
      const updates = { fingerprintingProtection: false }
      const errorMessage = 'Update failed'

      vi.mocked(mockPrivacyManager.updateSettings).mockResolvedValue({
        success: false,
        error: errorMessage
      })

      const { result } = renderHook(() => usePrivacySettings())
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act
      let updateResult: Result<PrivacySettings> | undefined
      await act(async () => {
        updateResult = await result.current.updateSettings(updates)
      })

      // Assert
      expect(updateResult?.success).toBe(false)
      if (updateResult && !updateResult.success) {
        expect(updateResult.error).toBe(errorMessage)
      }
    })
  })

  describe('protection control', () => {
    beforeEach(async () => {
      // Setup successful initialization
      vi.mocked(mockPrivacyManager.initialize).mockResolvedValue({
        success: true,
        data: {
          status: 'enabled',
          features: { fingerprinting: true, tracking: true, shields: true },
          performance: { activationTime: 100, firstRunTime: 500 },
          lastAuditId: 'audit_123'
        }
      })
      vi.mocked(mockPrivacyManager.getSettings).mockReturnValue({
        fingerprintingProtection: true,
        trackerBlocking: true,
        braveShieldsAggressive: true,
        protectionEnabled: true,
        lastModified: Date.now(),
        userId: 'user_123'
      })
      vi.mocked(mockPrivacyManager.getStatus).mockReturnValue({
        status: 'enabled',
        features: { fingerprinting: true, tracking: true, shields: true },
        performance: { activationTime: 100, firstRunTime: 500 },
        lastAuditId: 'audit_123'
      })

      const { result } = renderHook(() => usePrivacySettings())
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should enable protection', async () => {
      // Arrange
      vi.mocked(mockPrivacyManager.enableProtection).mockResolvedValue({
        success: true,
        data: true
      })
      vi.mocked(mockPrivacyManager.getSettings).mockReturnValue({
        fingerprintingProtection: true,
        trackerBlocking: true,
        braveShieldsAggressive: true,
        protectionEnabled: true,
        lastModified: Date.now(),
        userId: 'user_123'
      })
      vi.mocked(mockPrivacyManager.getStatus).mockReturnValue({
        status: 'enabled',
        features: { fingerprinting: true, tracking: true, shields: true },
        performance: { activationTime: 100, firstRunTime: 500 },
        lastAuditId: 'audit_123'
      })

      const { result } = renderHook(() => usePrivacySettings())
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act
      let enableResult: Result<boolean> | undefined
      await act(async () => {
        enableResult = await result.current.enableProtection()
      })

      // Assert
      expect(enableResult?.success).toBe(true)
      expect(mockPrivacyManager.enableProtection).toHaveBeenCalledTimes(1)
    })

    it('should disable protection', async () => {
      // Arrange
      vi.mocked(mockPrivacyManager.disableProtection).mockResolvedValue({
        success: true,
        data: true
      })
      vi.mocked(mockPrivacyManager.getSettings).mockReturnValue({
        fingerprintingProtection: true,
        trackerBlocking: true,
        braveShieldsAggressive: true,
        protectionEnabled: false,
        lastModified: Date.now(),
        userId: 'user_123'
      })
      vi.mocked(mockPrivacyManager.getStatus).mockReturnValue({
        status: 'disabled',
        features: { fingerprinting: true, tracking: true, shields: true },
        performance: { activationTime: 100, firstRunTime: 500 },
        lastAuditId: 'audit_123'
      })

      const { result } = renderHook(() => usePrivacySettings())
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act
      let disableResult: Result<boolean> | undefined
      await act(async () => {
        disableResult = await result.current.disableProtection()
      })

      // Assert
      expect(disableResult?.success).toBe(true)
      expect(mockPrivacyManager.disableProtection).toHaveBeenCalledTimes(1)
    })
  })

  describe('fingerprinting tests', () => {
    beforeEach(async () => {
      // Setup successful initialization
      vi.mocked(mockPrivacyManager.initialize).mockResolvedValue({
        success: true,
        data: {
          status: 'enabled',
          features: { fingerprinting: true, tracking: true, shields: true },
          performance: { activationTime: 100, firstRunTime: 500 },
          lastAuditId: 'audit_123'
        }
      })
      vi.mocked(mockPrivacyManager.getSettings).mockReturnValue({
        fingerprintingProtection: true,
        trackerBlocking: true,
        braveShieldsAggressive: true,
        protectionEnabled: true,
        lastModified: Date.now(),
        userId: 'user_123'
      })
      vi.mocked(mockPrivacyManager.getStatus).mockReturnValue({
        status: 'enabled',
        features: { fingerprinting: true, tracking: true, shields: true },
        performance: { activationTime: 100, firstRunTime: 500 },
        lastAuditId: 'audit_123'
      })

      const { result } = renderHook(() => usePrivacySettings())
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should run fingerprinting tests successfully', async () => {
      // Arrange
      const mockTestResults = [
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

      vi.mocked(mockPrivacyManager.runFingerprintingTests).mockResolvedValue({
        success: true,
        data: mockTestResults
      })

      const { result } = renderHook(() => usePrivacySettings())
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act
      let testResult: Result<FingerprintingTestResult[]> | undefined
      await act(async () => {
        testResult = await result.current.runFingerprintingTests()
      })

      // Assert
      expect(testResult?.success).toBe(true)
      if (testResult?.success === true) {
        expect(testResult.data).toEqual(mockTestResults)
      }
      expect(mockPrivacyManager.runFingerprintingTests).toHaveBeenCalledTimes(1)
    })

    it('should handle fingerprinting test errors', async () => {
      // Arrange
      const errorMessage = 'Test failed'
      vi.mocked(mockPrivacyManager.runFingerprintingTests).mockResolvedValue({
        success: false,
        error: errorMessage
      })

      const { result } = renderHook(() => usePrivacySettings())
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act
      let testResult: Result<FingerprintingTestResult[]> | undefined
      await act(async () => {
        testResult = await result.current.runFingerprintingTests()
      })

      // Assert
      expect(testResult?.success).toBe(false)
      if (testResult && !testResult.success) {
        expect(testResult.error).toBe(errorMessage)
      }
    })
  })

  describe('warning management', () => {
    beforeEach(async () => {
      // Setup successful initialization
      vi.mocked(mockPrivacyManager.initialize).mockResolvedValue({
        success: true,
        data: {
          status: 'enabled',
          features: { fingerprinting: true, tracking: true, shields: true },
          performance: { activationTime: 100, firstRunTime: 500 },
          lastAuditId: 'audit_123'
        }
      })
      vi.mocked(mockPrivacyManager.getSettings).mockReturnValue({
        fingerprintingProtection: true,
        trackerBlocking: true,
        braveShieldsAggressive: true,
        protectionEnabled: true,
        lastModified: Date.now(),
        userId: 'user_123'
      })
      vi.mocked(mockPrivacyManager.getStatus).mockReturnValue({
        status: 'enabled',
        features: { fingerprinting: true, tracking: true, shields: true },
        performance: { activationTime: 100, firstRunTime: 500 },
        lastAuditId: 'audit_123'
      })

      const { result } = renderHook(() => usePrivacySettings())
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should acknowledge warnings', () => {
      // Arrange
      const { result } = renderHook(() => usePrivacySettings())
      
      // Add a warning to state
      act(() => {
        result.current.warnings.push({
          type: 'REDUCED_PRIVACY',
          message: 'Test warning',
          acknowledged: false,
          timestamp: Date.now()
        })
      })

      // Act
      act(() => {
        result.current.acknowledgeWarning(0)
      })

      // Assert
      expect(result.current.warnings[0].acknowledged).toBe(true)
    })

    it('should clear warnings', () => {
      // Arrange
      const { result } = renderHook(() => usePrivacySettings())
      
      // Add warnings to state
      act(() => {
        result.current.warnings.push(
          {
            type: 'REDUCED_PRIVACY',
            message: 'Test warning 1',
            acknowledged: false,
            timestamp: Date.now()
          },
          {
            type: 'TRACKING_ENABLED',
            message: 'Test warning 2',
            acknowledged: false,
            timestamp: Date.now()
          }
        )
      })

      // Act
      act(() => {
        result.current.clearWarnings()
      })

      // Assert
      expect(result.current.warnings).toHaveLength(0)
    })
  })

  describe('computed values', () => {
    beforeEach(async () => {
      // Setup successful initialization
      vi.mocked(mockPrivacyManager.initialize).mockResolvedValue({
        success: true,
        data: {
          status: 'enabled',
          features: { fingerprinting: true, tracking: true, shields: true },
          performance: { activationTime: 100, firstRunTime: 500 },
          lastAuditId: 'audit_123'
        }
      })
      vi.mocked(mockPrivacyManager.getSettings).mockReturnValue({
        fingerprintingProtection: true,
        trackerBlocking: true,
        braveShieldsAggressive: true,
        protectionEnabled: true,
        lastModified: Date.now(),
        userId: 'user_123'
      })
      vi.mocked(mockPrivacyManager.getStatus).mockReturnValue({
        status: 'enabled',
        features: { fingerprinting: true, tracking: true, shields: true },
        performance: { activationTime: 100, firstRunTime: 500 },
        lastAuditId: 'audit_123'
      })

      const { result } = renderHook(() => usePrivacySettings())
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should compute protection status correctly', async () => {
      // Arrange
      const { result } = renderHook(() => usePrivacySettings())

      // Wait for initial load to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act & Assert
      expect(result.current.isProtectionEnabled).toBe(true)
      expect(result.current.isFingerprintingEnabled).toBe(true)
      expect(result.current.isTrackerBlockingEnabled).toBe(true)
    })

    it('should handle null settings gracefully', () => {
      // Arrange
      vi.mocked(mockPrivacyManager.getSettings).mockReturnValue(null)
      const { result } = renderHook(() => usePrivacySettings())

      // Act & Assert
      expect(result.current.isProtectionEnabled).toBe(false)
      expect(result.current.isFingerprintingEnabled).toBe(false)
      expect(result.current.isTrackerBlockingEnabled).toBe(false)
    })
  })

  describe('cleanup', () => {
    it('should remove event listeners on unmount', () => {
      // Arrange
      const { unmount } = renderHook(() => usePrivacySettings())

      // Act
      unmount()

      // Assert
      expect(mockPrivacyManager.removeEventListener).toHaveBeenCalledTimes(2)
    })
  })
})
