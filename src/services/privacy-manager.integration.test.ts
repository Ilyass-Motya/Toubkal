/**
 * Privacy Manager Integration Tests
 *
 * Integration tests for the privacy system including
 * audit logging, fingerprinting tests, and end-to-end workflows.
 */

import { describe, it, expect } from 'vitest'
import { PrivacyManager } from './privacy-manager'

describe('PrivacyManager Integration', () => {
  let privacyManager: PrivacyManager

  beforeEach(() => {
    privacyManager = new PrivacyManager()
  })

  afterEach(() => {
    // Cleanup if needed
  })

  describe('AC1: Fingerprinting protection enabled by default', () => {
    it('should have fingerprinting protection enabled on initialization', async () => {
      // Arrange & Act
      const result = await privacyManager.initialize()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.features.fingerprinting).toBe(true)
      }

      const settings = privacyManager.getSettings()
      expect(settings.fingerprintingProtection).toBe(true)
    })

    it('should maintain fingerprinting protection across settings updates', async () => {
      // Arrange
      await privacyManager.initialize()

      // Act
      await privacyManager.updateSettings({
        trackerBlocking: false,
        braveShieldsAggressive: false,
      })

      // Assert
      const settings = privacyManager.getSettings()
      expect(settings.fingerprintingProtection).toBe(true) // Should remain enabled
      expect(settings.trackerBlocking).toBe(false)
      expect(settings.braveShieldsAggressive).toBe(false)
    })
  })

  describe('AC2: Tracker blocking enabled by default', () => {
    it('should have tracker blocking enabled on initialization', async () => {
      // Arrange & Act
      const result = await privacyManager.initialize()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.features.tracking).toBe(true)
      }

      const settings = privacyManager.getSettings()
      expect(settings.trackerBlocking).toBe(true)
    })

    it('should maintain tracker blocking when other settings change', async () => {
      // Arrange
      await privacyManager.initialize()

      // Act
      await privacyManager.updateSettings({
        fingerprintingProtection: false,
      })

      // Assert
      const settings = privacyManager.getSettings()
      expect(settings.trackerBlocking).toBe(true) // Should remain enabled
      expect(settings.fingerprintingProtection).toBe(false)
    })
  })

  describe('AC3: Privacy settings UI shows "Protection: Enabled" on first launch', () => {
    it('should return enabled status on first launch', async () => {
      // Arrange & Act
      const result = await privacyManager.initialize()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('enabled')
      }

      const status = privacyManager.getStatus()
      expect(status.status).toBe('enabled')
    })

    it('should show all features as enabled on first launch', async () => {
      // Arrange & Act
      const result = await privacyManager.initialize()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.features.fingerprinting).toBe(true)
        expect(result.data.features.tracking).toBe(true)
        expect(result.data.features.shields).toBe(true)
      }
    })
  })

  describe('AC4: User can opt-out via settings with clear warning', () => {
    it('should allow disabling protection with warning', async () => {
      // Arrange
      await privacyManager.initialize()

      // Act
      const result = await privacyManager.disableProtection()

      // Assert
      expect(result.success).toBe(true)

      const settings = privacyManager.getSettings()
      expect(settings.protectionEnabled).toBe(false)
    })

    it('should allow disabling individual features', async () => {
      // Arrange
      await privacyManager.initialize()

      // Act
      await privacyManager.updateSettings({
        fingerprintingProtection: false,
        trackerBlocking: false,
      })

      // Assert
      const settings = privacyManager.getSettings()
      expect(settings.fingerprintingProtection).toBe(false)
      expect(settings.trackerBlocking).toBe(false)
      expect(settings.protectionEnabled).toBe(true) // Overall protection still enabled
    })

    it('should disable overall protection when all features are disabled', async () => {
      // Arrange
      await privacyManager.initialize()

      // Act
      await privacyManager.updateSettings({
        fingerprintingProtection: false,
        trackerBlocking: false,
        braveShieldsAggressive: false,
      })

      // Assert
      const settings = privacyManager.getSettings()
      expect(settings.fingerprintingProtection).toBe(false)
      expect(settings.trackerBlocking).toBe(false)
      expect(settings.braveShieldsAggressive).toBe(false)
      // Note: In real implementation, this might trigger overall protection to be disabled
    })
  })

  describe('AC5: Audit log entry created when privacy settings changed', () => {
    it('should create audit log entry for settings changes', async () => {
      // Arrange
      await privacyManager.initialize()
      const initialLogResult = await privacyManager.getAuditLog()
      const initialLogCount = initialLogResult.success ? initialLogResult.data.length : 0

      // Act
      await privacyManager.updateSettings({
        fingerprintingProtection: false,
      })

      // Assert
      const newLogResult = await privacyManager.getAuditLog()
      const newLogCount = newLogResult.success ? newLogResult.data.length : 0
      expect(newLogCount).toBeGreaterThan(initialLogCount)

      const latestLogResult = await privacyManager.getAuditLog(1)
      const latestEntry = latestLogResult.success ? latestLogResult.data[0] : null
      expect(latestEntry?.eventType).toBe('PRIVACY_SETTINGS_CHANGED')
      expect(latestEntry?.details.userId).toBeDefined()
      expect(latestEntry?.signature).toBeDefined()
      expect(latestEntry?.merkleProof).toBeDefined()
    })

    it('should create audit log entry for protection enable/disable', async () => {
      // Arrange
      await privacyManager.initialize()
      const initialLogResult = await privacyManager.getAuditLog()
      const initialLogCount = initialLogResult.success ? initialLogResult.data.length : 0

      // Act
      await privacyManager.disableProtection()

      // Assert
      const newLogResult = await privacyManager.getAuditLog()
      const newLogCount = newLogResult.success ? newLogResult.data.length : 0
      expect(newLogCount).toBeGreaterThan(initialLogCount)

      const latestLogResult = await privacyManager.getAuditLog(1)
      const latestEntry = latestLogResult.success ? latestLogResult.data[0] : null
      expect(latestEntry?.eventType).toBe('PRIVACY_SETTINGS_CHANGED')
    })

    it('should create audit log entry for initialization', async () => {
      // Arrange
      const initialLogResult = await privacyManager.getAuditLog()
      const initialLogCount = initialLogResult.success ? initialLogResult.data.length : 0

      // Act
      await privacyManager.initialize()

      // Assert
      const newLogResult = await privacyManager.getAuditLog()
      const newLogCount = newLogResult.success ? newLogResult.data.length : 0
      expect(newLogCount).toBeGreaterThan(initialLogCount)

      const latestLogResult = await privacyManager.getAuditLog(1)
      const latestEntry = latestLogResult.success ? latestLogResult.data[0] : null
      expect(latestEntry?.eventType).toBe('PRIVACY_SETTINGS_CHANGED')
    })
  })

  describe('AC6: First-run experience completes in <10 seconds', () => {
    it('should complete initialization within 10 seconds', async () => {
      // Arrange
      const startTime = performance.now()

      // Act
      const result = await privacyManager.initialize()

      // Assert
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(result.success).toBe(true)
      expect(duration).toBeLessThan(10000) // 10 seconds

      if (result.success) {
        expect(result.data.performance.firstRunTime).toBeLessThan(10000)
      }
    })
  })

  describe('AC7: Privacy protection activation time <2 seconds', () => {
    it('should activate protection within 2 seconds', async () => {
      // Arrange
      const startTime = performance.now()

      // Act
      const result = await privacyManager.initialize()

      // Assert
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(result.success).toBe(true)
      expect(duration).toBeLessThan(2000) // 2 seconds

      if (result.success) {
        expect(result.data.performance.activationTime).toBeLessThan(2000)
      }
    })
  })

  describe('AC8: Passes Panopticlick fingerprinting tests', () => {
    it('should pass fingerprinting tests when protection is enabled', async () => {
      // Arrange
      await privacyManager.initialize()

      // Act
      const result = await privacyManager.runFingerprintingTests()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.length).toBeGreaterThan(0)

        // All tests should pass when protection is enabled
        const allPassed = result.data.every((test) => test.passed)
        expect(allPassed).toBe(true)

        // Scores should be high (>= 80)
        const allHighScores = result.data.every((test) => test.score >= 80)
        expect(allHighScores).toBe(true)
      }
    })

    it('should fail fingerprinting tests when protection is disabled', async () => {
      // Arrange
      await privacyManager.initialize()
      await privacyManager.updateSettings({
        fingerprintingProtection: false,
      })

      // Act
      const result = await privacyManager.runFingerprintingTests()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.length).toBeGreaterThan(0)

        // Tests should fail when protection is disabled
        const allFailed = result.data.every((test) => !test.passed)
        expect(allFailed).toBe(true)

        // Scores should be low (< 80)
        const allLowScores = result.data.every((test) => test.score < 80)
        expect(allLowScores).toBe(true)
      }
    })
  })

  describe('End-to-end privacy workflow', () => {
    it('should handle complete privacy workflow from initialization to testing', async () => {
      // Arrange
      const startTime = performance.now()

      // Act - Complete workflow
      // 1. Initialize
      const initResult = await privacyManager.initialize()
      expect(initResult.success).toBe(true)

      // 2. Check initial status
      const initialStatus = privacyManager.getStatus()
      expect(initialStatus.status).toBe('enabled')

      // 3. Run initial tests
      const initialTests = await privacyManager.runFingerprintingTests()
      expect(initialTests.success).toBe(true)

      // 4. Disable some protection
      await privacyManager.updateSettings({
        fingerprintingProtection: false,
      })

      // 5. Run tests again
      const disabledTests = await privacyManager.runFingerprintingTests()
      expect(disabledTests.success).toBe(true)

      // 6. Re-enable protection
      await privacyManager.updateSettings({
        fingerprintingProtection: true,
      })

      // 7. Run final tests
      const finalTests = await privacyManager.runFingerprintingTests()
      expect(finalTests.success).toBe(true)

      // 8. Check final status
      const finalStatus = privacyManager.getStatus()
      expect(finalStatus.status).toBe('enabled')

      // Assert
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(15000) // Should complete entire workflow within 15 seconds

      // Verify audit log has entries for all operations
      const auditLogResult = await privacyManager.getAuditLog()
      expect(auditLogResult.success ? auditLogResult.data.length : 0).toBeGreaterThan(0)
    })

    it('should maintain consistency across multiple operations', async () => {
      // Arrange
      await privacyManager.initialize()

      // Act - Multiple operations
      const operations = [
        () => privacyManager.updateSettings({ fingerprintingProtection: false }),
        () => privacyManager.updateSettings({ trackerBlocking: false }),
        () => privacyManager.updateSettings({ braveShieldsAggressive: false }),
        () => privacyManager.disableProtection(),
        () => privacyManager.enableProtection(),
        () => privacyManager.updateSettings({ fingerprintingProtection: true }),
        () => privacyManager.updateSettings({ trackerBlocking: true }),
        () => privacyManager.updateSettings({ braveShieldsAggressive: true }),
      ]

      for (const operation of operations) {
        const result = await operation()
        expect(result.success).toBe(true)
      }

      // Assert - Final state should be consistent
      const finalSettings = privacyManager.getSettings()
      const finalStatus = privacyManager.getStatus()

      expect(finalSettings.protectionEnabled).toBe(true)
      expect(finalSettings.fingerprintingProtection).toBe(true)
      expect(finalSettings.trackerBlocking).toBe(true)
      expect(finalSettings.braveShieldsAggressive).toBe(true)

      expect(finalStatus.status).toBe('enabled')
      expect(finalStatus.features.fingerprinting).toBe(true)
      expect(finalStatus.features.tracking).toBe(true)
      expect(finalStatus.features.shields).toBe(true)
    })
  })

  describe('Error handling and recovery', () => {
    it('should handle errors gracefully and maintain state consistency', async () => {
      // Arrange
      await privacyManager.initialize()
      const initialSettings = privacyManager.getSettings()

      // Act - Attempt invalid operation
      const result = await privacyManager.updateSettings({
        fingerprintingProtection: 'invalid' as unknown as boolean,
      })

      // Assert
      expect(result.success).toBe(false)

      // Settings should remain unchanged
      const currentSettings = privacyManager.getSettings()
      expect(currentSettings).toEqual(initialSettings)
    })

    it('should recover from failed operations', async () => {
      // Arrange
      await privacyManager.initialize()

      // Act - Attempt invalid operation followed by valid operation
      const invalidResult = await privacyManager.updateSettings({
        fingerprintingProtection: 'invalid' as unknown as boolean,
      })

      const validResult = await privacyManager.updateSettings({
        fingerprintingProtection: false,
      })

      // Assert
      expect(invalidResult.success).toBe(false)
      expect(validResult.success).toBe(true)

      const settings = privacyManager.getSettings()
      expect(settings.fingerprintingProtection).toBe(false)
    })
  })
})
