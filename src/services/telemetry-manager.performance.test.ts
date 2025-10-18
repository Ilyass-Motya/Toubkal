/**
 * Telemetry Manager Performance Tests
 * 
 * Tests performance characteristics and startup time impact
 * AC6: Telemetry removal doesn't impact browser startup time (<10s)
 * Following Toubkal coding rules: AAA pattern, performance testing
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ZeroTelemetryManager } from './telemetry-manager'

describe('ZeroTelemetryManager Performance', () => {
  let manager: ZeroTelemetryManager

  beforeEach(() => {
    manager = new ZeroTelemetryManager()
  })

  describe('startup performance', () => {
    it('should initialize quickly', () => {
      // Arrange
      const startTime = performance.now()

      // Act
      const newManager = new ZeroTelemetryManager()
      const endTime = performance.now()

      // Assert
      const initTime = endTime - startTime
      expect(initTime).toBeLessThan(10) // Should initialize in under 10ms
      expect(newManager.isEnabled()).toBe(false)
    })

    it('should meet startup time requirement (<10s)', async () => {
      // Arrange
      const startTime = performance.now()

      // Act
      // Simulate typical startup operations
      const operations = [
        manager.isEnabled(),
        manager.getPrivacyDashboardState(),
        manager.getAuditLogs(10),
        manager.logEvent({
          eventType: 'AI_QUERY_LOCAL',
          details: { startup: true }
        })
      ]

      await Promise.all(operations)
      const endTime = performance.now()

      // Assert
      const totalTime = endTime - startTime
      expect(totalTime).toBeLessThan(10000) // AC6: <10s requirement
    })
  })

  describe('operation performance', () => {
    it('should log events quickly', async () => {
      // Arrange
      const event = {
        eventType: 'AI_QUERY_LOCAL' as const,
        details: { test: 'performance' }
      }

      // Act
      const startTime = performance.now()
      const result = await manager.logEvent(event)
      const endTime = performance.now()

      // Assert
      expect(result.success).toBe(true)
      const operationTime = endTime - startTime
      expect(operationTime).toBeLessThan(50) // Should complete in under 50ms
    })

    it('should check consent quickly', async () => {
      // Arrange
      const actionType = 'AI_QUERY_CLOUD'
      const userId = 'test-user'

      // Act
      const startTime = performance.now()
      const result = await manager.hasConsent(actionType, userId)
      const endTime = performance.now()

      // Assert
      expect(result.success).toBe(true)
      const operationTime = endTime - startTime
      expect(operationTime).toBeLessThan(50) // Should complete in under 50ms
    })

    it('should request consent quickly', async () => {
      // Arrange
      const request = {
        actionType: 'AI_QUERY_CLOUD',
        userId: 'test-user',
        dataDisclosed: ['prompt'],
        purpose: 'AI processing',
        retentionPeriod: 30
      }

      // Act
      const startTime = performance.now()
      const result = await manager.requestConsent(request)
      const endTime = performance.now()

      // Assert
      expect(result.success).toBe(true)
      const operationTime = endTime - startTime
      expect(operationTime).toBeLessThan(50) // Should complete in under 50ms
    })

    it('should get privacy dashboard state quickly', async () => {
      // Arrange
      // (no setup needed)

      // Act
      const startTime = performance.now()
      const result = await manager.getPrivacyDashboardState()
      const endTime = performance.now()

      // Assert
      expect(result.success).toBe(true)
      const operationTime = endTime - startTime
      expect(operationTime).toBeLessThan(50) // Should complete in under 50ms
    })

    it('should get audit logs quickly', async () => {
      // Arrange
      // Log some events first
      for (let i = 0; i < 100; i++) {
        await manager.logEvent({
          eventType: 'AI_QUERY_LOCAL',
          details: { index: i }
        })
      }

      // Act
      const startTime = performance.now()
      const result = await manager.getAuditLogs(100)
      const endTime = performance.now()

      // Assert
      expect(result.success).toBe(true)
      const operationTime = endTime - startTime
      expect(operationTime).toBeLessThan(100) // Should complete in under 100ms
    })
  })

  describe('memory usage', () => {
    it('should not leak memory with repeated operations', async () => {
      // Arrange
      const initialMemory = process.memoryUsage().heapUsed

      // Act
      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        await manager.logEvent({
          eventType: 'AI_QUERY_LOCAL',
          details: { index: i }
        })
        
        await manager.blockNetworkRequest(`https://test${i}.com`, 'Test')
        
        await manager.requestConsent({
          actionType: 'TEST',
          userId: `user${i}`,
          dataDisclosed: ['data'],
          purpose: 'test',
          retentionPeriod: 1
        })
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      // Assert
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
    })

    it('should limit audit log size to prevent memory issues', async () => {
      // Arrange
      const initialMemory = process.memoryUsage().heapUsed

      // Act
      // Log more than the limit (1000 entries)
      for (let i = 0; i < 2000; i++) {
        await manager.logEvent({
          eventType: 'AI_QUERY_LOCAL',
          details: { index: i }
        })
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      // Assert
      // Memory increase should be bounded due to log size limit
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024) // Less than 5MB
    })
  })

  describe('concurrent operations', () => {
    it('should handle concurrent log events efficiently', async () => {
      // Arrange
      const eventCount = 100
      const events = Array.from({ length: eventCount }, (_, i) => ({
        eventType: 'AI_QUERY_LOCAL' as const,
        details: { index: i }
      }))

      // Act
      const startTime = performance.now()
      const results = await Promise.all(
        events.map(event => manager.logEvent(event))
      )
      const endTime = performance.now()

      // Assert
      expect(results.every(r => r.success)).toBe(true)
      const totalTime = endTime - startTime
      expect(totalTime).toBeLessThan(1000) // Should complete in under 1 second
    })

    it('should handle concurrent consent operations efficiently', async () => {
      // Arrange
      const operationCount = 50
      const operations = Array.from({ length: operationCount }, (_, i) => 
        manager.requestConsent({
          actionType: 'TEST',
          userId: `user${i}`,
          dataDisclosed: ['data'],
          purpose: 'test',
          retentionPeriod: 1
        })
      )

      // Act
      const startTime = performance.now()
      const results = await Promise.all(operations)
      const endTime = performance.now()

      // Assert
      expect(results.every(r => r.success)).toBe(true)
      const totalTime = endTime - startTime
      expect(totalTime).toBeLessThan(500) // Should complete in under 500ms
    })

    it('should handle mixed concurrent operations efficiently', async () => {
      // Arrange
      const operations = [
        manager.logEvent({ eventType: 'AI_QUERY_LOCAL', details: { test: 1 } }),
        manager.blockNetworkRequest('https://test1.com', 'Test'),
        manager.requestConsent({
          actionType: 'TEST1',
          userId: 'user1',
          dataDisclosed: ['data'],
          purpose: 'test',
          retentionPeriod: 1
        }),
        manager.getPrivacyDashboardState(),
        manager.getAuditLogs(10),
        manager.logEvent({ eventType: 'AI_QUERY_LOCAL', details: { test: 2 } }),
        manager.blockNetworkRequest('https://test2.com', 'Test'),
        manager.requestConsent({
          actionType: 'TEST2',
          userId: 'user2',
          dataDisclosed: ['data'],
          purpose: 'test',
          retentionPeriod: 1
        })
      ]

      // Act
      const startTime = performance.now()
      const results = await Promise.all(operations)
      const endTime = performance.now()

      // Assert
      expect(results.every(r => r.success)).toBe(true)
      const totalTime = endTime - startTime
      expect(totalTime).toBeLessThan(200) // Should complete in under 200ms
    })
  })

  describe('scalability', () => {
    it('should maintain performance with large audit logs', async () => {
      // Arrange
      // Fill up audit log to near capacity
      for (let i = 0; i < 950; i++) {
        await manager.logEvent({
          eventType: 'AI_QUERY_LOCAL',
          details: { index: i }
        })
      }

      // Act
      const startTime = performance.now()
      const result = await manager.getAuditLogs(100)
      const endTime = performance.now()

      // Assert
      expect(result.success).toBe(true)
      const operationTime = endTime - startTime
      expect(operationTime).toBeLessThan(100) // Should still be fast with large logs
    })

    it('should maintain performance with many blocked requests', async () => {
      // Arrange
      // Block many requests
      for (let i = 0; i < 1000; i++) {
        await manager.blockNetworkRequest(`https://test${i}.com`, 'Test')
      }

      // Act
      const startTime = performance.now()
      const result = await manager.getPrivacyDashboardState()
      const endTime = performance.now()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.networkRequestsBlocked).toBe(1000)
      }
      const operationTime = endTime - startTime
      expect(operationTime).toBeLessThan(50) // Should still be fast
    })
  })
})
