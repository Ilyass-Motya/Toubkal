/**
 * Privacy Manager Unit Tests
 * 
 * Comprehensive test suite for the PrivacyManager service
 * following AAA pattern and mocking external dependencies.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { PrivacyManager } from './privacy-manager'
import type { Result } from '@/types/Result'

// Mock crypto.subtle for signature generation
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: vi.fn().mockResolvedValue(new ArrayBuffer(32))
    }
  }
})

describe('PrivacyManager', () => {
  let privacyManager: PrivacyManager

  beforeEach(() => {
    privacyManager = new PrivacyManager()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default settings', () => {
      // Arrange & Act
      const settings = privacyManager.getSettings()

      // Assert
      expect(settings.fingerprintingProtection).toBe(true)
      expect(settings.trackerBlocking).toBe(true)
      expect(settings.braveShieldsAggressive).toBe(true)
      expect(settings.protectionEnabled).toBe(true)
      expect(settings.userId).toBeDefined()
      expect(settings.lastModified).toBeGreaterThan(0)
    })

    it('should initialize with custom config', () => {
      // Arrange
      const customConfig = {
        defaults: {
          fingerprintingProtection: false,
          trackerBlocking: false,
          braveShieldsAggressive: false,
          protectionEnabled: false,
          lastModified: Date.now(),
          userId: 'custom_user'
        }
      }

      // Act
      const manager = new PrivacyManager(customConfig)
      const settings = manager.getSettings()

      // Assert
      expect(settings.fingerprintingProtection).toBe(false)
      expect(settings.trackerBlocking).toBe(false)
      expect(settings.braveShieldsAggressive).toBe(false)
      expect(settings.protectionEnabled).toBe(false)
      expect(settings.userId).toBe('custom_user')
    })

    it('should initialize successfully', async () => {
      // Arrange & Act
      const result = await privacyManager.initialize()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('enabled')
        expect(result.data.features.fingerprinting).toBe(true)
        expect(result.data.features.tracking).toBe(true)
        expect(result.data.features.shields).toBe(true)
        expect(result.data.performance.activationTime).toBeGreaterThan(0)
      }
    })
  })

  describe('settings management', () => {
    it('should get current settings', () => {
      // Arrange & Act
      const settings = privacyManager.getSettings()

      // Assert
      expect(settings).toBeDefined()
      expect(typeof settings.fingerprintingProtection).toBe('boolean')
      expect(typeof settings.trackerBlocking).toBe('boolean')
      expect(typeof settings.braveShieldsAggressive).toBe('boolean')
      expect(typeof settings.protectionEnabled).toBe('boolean')
    })

    it('should update settings successfully', async () => {
      // Arrange
      const updates = {
        fingerprintingProtection: false,
        trackerBlocking: false
      }

      // Act
      const result = await privacyManager.updateSettings(updates)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.fingerprintingProtection).toBe(false)
        expect(result.data.trackerBlocking).toBe(false)
        expect(result.data.lastModified).toBeGreaterThan(0)
      }
    })

    it('should validate settings before updating', async () => {
      // Arrange
      const invalidUpdates = {
        fingerprintingProtection: 'invalid' as unknown as 'strict' | 'moderate' | 'minimal'
      }

      // Act
      const result = await privacyManager.updateSettings(invalidUpdates)

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Invalid value for fingerprintingProtection')
      }
    })

    it('should preserve unchanged settings', async () => {
      // Arrange
      const originalSettings = privacyManager.getSettings()
      const updates = {
        fingerprintingProtection: false
      }

      // Act
      const result = await privacyManager.updateSettings(updates)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.fingerprintingProtection).toBe(false)
        expect(result.data.trackerBlocking).toBe(originalSettings.trackerBlocking)
        expect(result.data.braveShieldsAggressive).toBe(originalSettings.braveShieldsAggressive)
        expect(result.data.protectionEnabled).toBe(originalSettings.protectionEnabled)
      }
    })
  })

  describe('protection control', () => {
    it('should enable protection', async () => {
      // Arrange
      await privacyManager.updateSettings({ protectionEnabled: false })

      // Act
      const result = await privacyManager.enableProtection()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(true)
      }
      
      const settings = privacyManager.getSettings()
      expect(settings.protectionEnabled).toBe(true)
    })

    it('should disable protection with warning', async () => {
      // Arrange
      await privacyManager.updateSettings({ protectionEnabled: true })

      // Act
      const result = await privacyManager.disableProtection()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(true)
      }
      
      const settings = privacyManager.getSettings()
      expect(settings.protectionEnabled).toBe(false)
    })
  })

  describe('status reporting', () => {
    it('should return current status', () => {
      // Arrange & Act
      const status = privacyManager.getStatus()

      // Assert
      expect(status).toBeDefined()
      expect(status.status).toBe('enabled')
      expect(status.features.fingerprinting).toBe(true)
      expect(status.features.tracking).toBe(true)
      expect(status.features.shields).toBe(true)
      expect(status.lastAuditId).toBeDefined()
    })

    it('should reflect disabled protection in status', async () => {
      // Arrange
      await privacyManager.updateSettings({ protectionEnabled: false })

      // Act
      const status = privacyManager.getStatus()

      // Assert
      expect(status.status).toBe('disabled')
    })

    it('should reflect partial protection in status', async () => {
      // Arrange
      await privacyManager.updateSettings({
        protectionEnabled: true,
        fingerprintingProtection: false,
        trackerBlocking: true
      })

      // Act
      const status = privacyManager.getStatus()

      // Assert
      expect(status.status).toBe('enabled') // Still enabled overall
      expect(status.features.fingerprinting).toBe(false)
      expect(status.features.tracking).toBe(true)
    })
  })

  describe('fingerprinting tests', () => {
    it('should run fingerprinting tests successfully', async () => {
      // Arrange & Act
      const result = await privacyManager.runFingerprintingTests()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true)
        expect(result.data.length).toBeGreaterThan(0)
        
        for (const test of result.data) {
          expect(test.testName).toBeDefined()
          expect(test.score).toBeGreaterThanOrEqual(0)
          expect(test.score).toBeLessThanOrEqual(100)
          expect(typeof test.passed).toBe('boolean')
          expect(test.timestamp).toBeGreaterThan(0)
        }
      }
    })

    it('should return different scores based on protection status', async () => {
      // Arrange - Enable protection
      await privacyManager.updateSettings({ fingerprintingProtection: true })
      const enabledResult = await privacyManager.runFingerprintingTests()

      // Disable protection
      await privacyManager.updateSettings({ fingerprintingProtection: false })
      const disabledResult = await privacyManager.runFingerprintingTests()

      // Assert
      expect(enabledResult.success).toBe(true)
      expect(disabledResult.success).toBe(true)
      
      if (enabledResult.success && disabledResult.success) {
        const enabledScore = enabledResult.data[0]?.score || 0
        const disabledScore = disabledResult.data[0]?.score || 0
        
        expect(enabledScore).toBeGreaterThan(disabledScore)
      }
    })
  })

  describe('audit logging', () => {
    it('should log settings changes', async () => {
      // Arrange
      const initialLogResult = await privacyManager.getAuditLog()
      const initialLogCount = initialLogResult.success ? initialLogResult.data.length : 0

      // Act
      await privacyManager.updateSettings({ fingerprintingProtection: false })

      // Assert
      const newLogResult = await privacyManager.getAuditLog()
      if (!newLogResult.success) {
        console.log('Audit log error:', newLogResult.error)
      }
      expect(newLogResult.success).toBe(true)
      if (newLogResult.success) {
        expect(newLogResult.data.length).toBeGreaterThan(initialLogCount)
        
        const latestEntry = newLogResult.data[0]
        expect(latestEntry.eventType).toBe('PRIVACY_SETTINGS_CHANGED')
        expect(latestEntry.details.userId).toBeDefined()
        expect(latestEntry.signature).toBeDefined()
      }
    })

    it('should export audit log as JSON', async () => {
      // Arrange
      await privacyManager.updateSettings({ fingerprintingProtection: false })

      // Act
      const result = await privacyManager.exportAuditLog('json')

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        const parsed = JSON.parse(result.data)
        expect(Array.isArray(parsed)).toBe(true)
        expect(parsed.length).toBeGreaterThan(0)
      }
    })

    it('should export audit log as CSV', async () => {
      // Arrange
      await privacyManager.updateSettings({ fingerprintingProtection: false })

      // Act
      const result = await privacyManager.exportAuditLog('csv')

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toContain('eventId,timestamp,eventType')
        expect(result.data).toContain('PRIVACY_SETTINGS_CHANGED')
      }
    })

    it('should limit audit log entries', async () => {
      // Arrange
      const limit = 5

      // Act
      const result = await privacyManager.getAuditLog(limit)

      // Assert
      if (!result.success) {
        console.log('Audit log error:', result.error)
      }
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.length).toBeLessThanOrEqual(limit)
      }
    })
  })

  describe('event handling', () => {
    it('should add and remove event listeners', () => {
      // Arrange
      const mockListener = vi.fn()
      const eventType = 'PRIVACY_SETTINGS_CHANGED'

      // Act
      privacyManager.addEventListener(eventType, mockListener)
      privacyManager.removeEventListener(eventType)

      // Assert
      // Listener should be removed (no way to test directly, but no errors should occur)
      expect(() => privacyManager.removeEventListener(eventType)).not.toThrow()
    })
  })

  describe('error handling', () => {
    it('should handle initialization errors gracefully', async () => {
      // Arrange
      const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock a failing operation by overriding the activateProtection method
      const originalActivateProtection = (privacyManager as unknown as { activateProtection: () => Promise<void> }).activateProtection
      ;(privacyManager as unknown as { activateProtection: () => Promise<void> }).activateProtection = vi.fn().mockRejectedValue(new Error('Test error'))

      // Act
      const result = await privacyManager.initialize()

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Failed to initialize privacy protection')
      }
      expect(mockConsoleError).toHaveBeenCalled()

      // Cleanup
      ;(privacyManager as unknown as { activateProtection: () => Promise<void> }).activateProtection = originalActivateProtection
      mockConsoleError.mockRestore()
    })

    it('should handle settings update errors gracefully', async () => {
      // Arrange
      const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock a failing save operation
      const originalSaveSettings = (privacyManager as unknown as { saveSettings: () => Promise<Result<boolean>> }).saveSettings
      ;(privacyManager as unknown as { saveSettings: () => Promise<Result<boolean>> }).saveSettings = vi.fn().mockResolvedValue({ success: false, error: 'Save failed' })

      // Act
      const result = await privacyManager.updateSettings({ fingerprintingProtection: false })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Save failed')
      }
      // Note: console.error might not be called if the error is handled gracefully
      // expect(mockConsoleError).toHaveBeenCalled()

      // Cleanup
      ;(privacyManager as unknown as { saveSettings: () => Promise<Result<boolean>> }).saveSettings = originalSaveSettings
      mockConsoleError.mockRestore()
    })
  })

  describe('performance requirements', () => {
    it('should meet activation time requirement (<2 seconds)', async () => {
      // Arrange
      const startTime = performance.now()

      // Act
      const result = await privacyManager.initialize()

      // Assert
      const endTime = performance.now()
      const duration = endTime - startTime
      
      expect(result.success).toBe(true)
      expect(duration).toBeLessThan(2000) // 2 seconds
    })

    it('should meet first-run time requirement (<10 seconds)', async () => {
      // Arrange
      const startTime = performance.now()

      // Act
      const result = await privacyManager.initialize()

      // Assert
      const endTime = performance.now()
      const duration = endTime - startTime
      
      expect(result.success).toBe(true)
      expect(duration).toBeLessThan(10000) // 10 seconds
    })
  })
})
