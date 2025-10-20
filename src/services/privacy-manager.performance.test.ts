/**
 * Privacy Manager Performance Tests
 * 
 * Performance tests for privacy activation timing and first-run experience
 * to ensure AC6 and AC7 requirements are met.
 */

import { describe, it, expect } from 'vitest'
import { PrivacyManager } from './privacy-manager'

describe('PrivacyManager Performance', () => {
  let privacyManager: PrivacyManager

  beforeEach(() => {
    privacyManager = new PrivacyManager()
  })

  afterEach(() => {
    // Cleanup if needed
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

    it('should handle multiple rapid initializations efficiently', async () => {
      // Arrange
      const startTime = performance.now()
      const promises = []

      // Act - Create multiple managers and initialize them
      for (let i = 0; i < 5; i++) {
        const manager = new PrivacyManager()
        promises.push(manager.initialize())
      }

      const results = await Promise.all(promises)
      const endTime = performance.now()
      const duration = endTime - startTime

      // Assert
      expect(duration).toBeLessThan(10000) // Should complete all within 10 seconds
      results.forEach(result => {
        expect(result.success).toBe(true)
      })
    })

    it('should maintain performance with large audit logs', async () => {
      // Arrange
      const manager = new PrivacyManager()
      
      // Generate a large number of audit entries
      for (let i = 0; i < 1000; i++) {
        await manager.updateSettings({ 
          fingerprintingProtection: i % 2 === 0 
        })
      }

      const startTime = performance.now()

      // Act
      const result = await manager.initialize()

      // Assert
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(result.success).toBe(true)
      expect(duration).toBeLessThan(10000) // Should still complete within 10 seconds
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

    it('should activate individual features quickly', async () => {
      // Arrange
      await privacyManager.initialize()
      const startTime = performance.now()

      // Act
      const result = await (privacyManager as unknown as { activateProtection: () => Promise<void> }).activateProtection()

      // Assert
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(result.success).toBe(true)
      expect(duration).toBeLessThan(2000) // 2 seconds
    })

    it('should handle rapid protection toggles efficiently', async () => {
      // Arrange
      await privacyManager.initialize()
      const startTime = performance.now()

      // Act - Rapidly toggle protection
      const promises = []
      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          promises.push(privacyManager.enableProtection())
        } else {
          promises.push(privacyManager.disableProtection())
        }
      }

      await Promise.all(promises)
      const endTime = performance.now()
      const duration = endTime - startTime

      // Assert
      expect(duration).toBeLessThan(2000) // Should complete all toggles within 2 seconds
    })
  })

  describe('Memory usage optimization', () => {
    it('should not leak memory during repeated operations', async () => {
      // Arrange
      const initialMemory = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? 0

      // Act - Perform many operations
      for (let i = 0; i < 100; i++) {
        await privacyManager.updateSettings({
          fingerprintingProtection: i % 2 === 0,
          trackerBlocking: i % 3 === 0
        })
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }

      const finalMemory = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? 0
      const memoryIncrease = finalMemory - initialMemory

      // Assert - Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
    })

    it('should efficiently manage audit log size', async () => {
      // Arrange
      const maxEntries = 1000
      
      // Act - Generate many audit entries
      for (let i = 0; i < maxEntries * 2; i++) {
        await privacyManager.updateSettings({
          fingerprintingProtection: i % 2 === 0
        })
      }

      const startTime = performance.now()

      // Get all entries
      const allEntriesResult = await privacyManager.getAuditLog()
      const allEntries = allEntriesResult.success ? allEntriesResult.data : []
      const endTime = performance.now()
      const duration = endTime - startTime

      // Assert
      expect(allEntries.length).toBeLessThanOrEqual(maxEntries)
      expect(duration).toBeLessThan(100) // Should retrieve entries quickly
    })
  })

  describe('Concurrent operations', () => {
    it('should handle concurrent settings updates efficiently', async () => {
      // Arrange
      await privacyManager.initialize()
      const startTime = performance.now()

      // Act - Concurrent updates
      const promises = []
      for (let i = 0; i < 20; i++) {
        promises.push(privacyManager.updateSettings({
          fingerprintingProtection: i % 2 === 0,
          trackerBlocking: i % 3 === 0,
          braveShieldsAggressive: i % 4 === 0
        }))
      }

      const results = await Promise.all(promises)
      const endTime = performance.now()
      const duration = endTime - startTime

      // Assert
      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds
      results.forEach(result => {
        expect(result.success).toBe(true)
      })
    })

    it('should handle concurrent fingerprinting tests efficiently', async () => {
      // Arrange
      await privacyManager.initialize()
      const startTime = performance.now()

      // Act - Concurrent tests
      const promises = []
      for (let i = 0; i < 5; i++) {
        promises.push(privacyManager.runFingerprintingTests())
      }

      const results = await Promise.all(promises)
      const endTime = performance.now()
      const duration = endTime - startTime

      // Assert
      expect(duration).toBeLessThan(10000) // Should complete within 10 seconds
      results.forEach(result => {
        expect(result.success).toBe(true)
      })
    })
  })

  describe('Real-world usage patterns', () => {
    it('should perform well during typical user session', async () => {
      // Arrange
      const startTime = performance.now()

      // Act - Simulate typical user session
      await privacyManager.initialize()
      
      // User enables protection
      await privacyManager.enableProtection()
      
      // User runs tests
      await privacyManager.runFingerprintingTests()
      
      // User adjusts settings
      await privacyManager.updateSettings({
        fingerprintingProtection: false
      })
      
      // User runs tests again
      await privacyManager.runFingerprintingTests()
      
      // User re-enables protection
      await privacyManager.updateSettings({
        fingerprintingProtection: true
      })

      const endTime = performance.now()
      const duration = endTime - startTime

      // Assert
      expect(duration).toBeLessThan(5000) // Should complete typical session within 5 seconds
    })

    it('should maintain performance during extended usage', async () => {
      // Arrange
      await privacyManager.initialize()
      const startTime = performance.now()

      // Act - Extended usage simulation
      for (let session = 0; session < 10; session++) {
        // Simulate user session
        await privacyManager.updateSettings({
          fingerprintingProtection: session % 2 === 0
        })
        
        await privacyManager.runFingerprintingTests()
        
        // Simulate some time passing
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      // Assert
      expect(duration).toBeLessThan(15000) // Should complete extended usage within 15 seconds
    })
  })

  describe('Edge cases and stress testing', () => {
    it('should handle very large settings updates efficiently', async () => {
      // Arrange
      await privacyManager.initialize()
      const largeSettings = {
        fingerprintingProtection: true,
        trackerBlocking: true,
        braveShieldsAggressive: true,
        protectionEnabled: true,
        lastModified: Date.now(),
        userId: 'user_' + 'x'.repeat(1000) // Large user ID
      }

      const startTime = performance.now()

      // Act
      const result = await privacyManager.updateSettings(largeSettings)

      // Assert
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(result.success).toBe(true)
      expect(duration).toBeLessThan(1000) // Should complete within 1 second
    })

    it('should handle rapid initialization and cleanup cycles', async () => {
      // Arrange
      const startTime = performance.now()

      // Act - Create and destroy many managers
      for (let i = 0; i < 50; i++) {
        const manager = new PrivacyManager()
        await manager.initialize()
        // Manager will be garbage collected
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      // Assert
      expect(duration).toBeLessThan(10000) // Should complete within 10 seconds
    })
  })
})
