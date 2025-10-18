import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AuditLogger } from './audit-logger'

// Define AuditEvent type for testing
interface AuditEvent {
  type: string
  timestamp: number
  [key: string]: unknown
}

// Mock the Mojo IPC service
const mockMojoService = {
  logEvent: vi.fn(),
  getAuditLogs: vi.fn(),
  clearAuditLogs: vi.fn(),
  exportAuditLogs: vi.fn(),
}

vi.mock('@/core/ipc/mojo-service', () => ({
  getMojoService: () => mockMojoService,
}))

// Mock crypto for signature generation
const mockCrypto = {
  subtle: {
    importKey: vi.fn(),
    sign: vi.fn(),
  },
}

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
})

describe('AuditLogger', () => {
  let auditLogger: AuditLogger

  beforeEach(() => {
    vi.clearAllMocks()
    auditLogger = new AuditLogger()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('logEvent', () => {
    it('should log consent granted event successfully', async () => {
      // Arrange
      const event = {
        type: 'CONSENT_GRANTED',
        action: 'AI_QUERY',
        userId: 'user-123',
        timestamp: Date.now(),
        metadata: { source: 'banner' },
      }
      mockMojoService.logEvent.mockResolvedValue({ success: true, eventId: 'event-456' })

      // Act
      const result = await auditLogger.logEvent(event)

      // Assert
      expect(result.success).toBe(true)
      expect(result.eventId).toBe('event-456')
      expect(mockMojoService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'CONSENT_GRANTED',
          action: 'AI_QUERY',
          userId: 'user-123',
        })
      )
    })

    it('should log consent denied event successfully', async () => {
      // Arrange
      const event = {
        type: 'CONSENT_DENIED',
        action: 'DATA_COLLECTION',
        userId: 'user-456',
        timestamp: Date.now(),
        metadata: { reason: 'user_choice' },
      }
      mockMojoService.logEvent.mockResolvedValue({ success: true, eventId: 'event-789' })

      // Act
      const result = await auditLogger.logEvent(event)

      // Assert
      expect(result.success).toBe(true)
      expect(result.eventId).toBe('event-789')
      expect(mockMojoService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'CONSENT_DENIED',
          action: 'DATA_COLLECTION',
          userId: 'user-456',
        })
      )
    })

    it('should handle logging errors gracefully', async () => {
      // Arrange
      const event = {
        type: 'CONSENT_GRANTED',
        action: 'AI_QUERY',
        userId: 'user-123',
        timestamp: Date.now(),
      }
      mockMojoService.logEvent.mockRejectedValue(new Error('IPC communication failed'))

      // Act
      const result = await auditLogger.logEvent(event)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('IPC communication failed')
    })

    it('should validate required event fields', async () => {
      // Arrange
      const invalidEvent = {
        type: 'CONSENT_GRANTED',
        // Missing required fields
        timestamp: Date.now(),
      } as unknown as AuditEvent

      // Act
      const result = await auditLogger.logEvent(invalidEvent)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('Missing required fields')
      expect(mockMojoService.logEvent).not.toHaveBeenCalled()
    })

    it('should add digital signature to events', async () => {
      // Arrange
      const event = {
        type: 'CONSENT_GRANTED',
        action: 'AI_QUERY',
        userId: 'user-123',
        timestamp: Date.now(),
      }
      mockMojoService.logEvent.mockResolvedValue({ success: true, eventId: 'event-123' })
      mockCrypto.subtle.importKey.mockResolvedValue('mock-key')
      mockCrypto.subtle.sign.mockResolvedValue(new ArrayBuffer(64))

      // Act
      const result = await auditLogger.logEvent(event)

      // Assert
      expect(result.success).toBe(true)
      expect(mockMojoService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          signature: expect.any(String),
        })
      )
    })
  })

  describe('getAuditLogs', () => {
    it('should retrieve audit logs with default filters', async () => {
      // Arrange
      const mockLogs = [
        { id: '1', type: 'CONSENT_GRANTED', action: 'AI_QUERY', timestamp: Date.now() - 1000 },
        { id: '2', type: 'CONSENT_DENIED', action: 'DATA_COLLECTION', timestamp: Date.now() - 500 },
      ]
      mockMojoService.getAuditLogs.mockResolvedValue({ success: true, logs: mockLogs })

      // Act
      const result = await auditLogger.getAuditLogs()

      // Assert
      expect(result.success).toBe(true)
      expect(result.logs).toEqual(mockLogs)
      expect(mockMojoService.getAuditLogs).toHaveBeenCalledWith({
        limit: 100,
        offset: 0,
        startDate: undefined,
        endDate: undefined,
        eventType: undefined,
      })
    })

    it('should retrieve audit logs with custom filters', async () => {
      // Arrange
      const filters = {
        limit: 50,
        offset: 10,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        eventType: 'CONSENT_GRANTED',
      }
      const mockLogs = [
        { id: '1', type: 'CONSENT_GRANTED', action: 'AI_QUERY', timestamp: Date.now() },
      ]
      mockMojoService.getAuditLogs.mockResolvedValue({ success: true, logs: mockLogs })

      // Act
      const result = await auditLogger.getAuditLogs(filters)

      // Assert
      expect(result.success).toBe(true)
      expect(result.logs).toEqual(mockLogs)
      expect(mockMojoService.getAuditLogs).toHaveBeenCalledWith(filters)
    })

    it('should handle audit log retrieval errors', async () => {
      // Arrange
      mockMojoService.getAuditLogs.mockRejectedValue(new Error('Database connection failed'))

      // Act
      const result = await auditLogger.getAuditLogs()

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Database connection failed')
      expect(result.logs).toEqual([])
    })
  })

  describe('clearAuditLogs', () => {
    it('should clear audit logs successfully', async () => {
      // Arrange
      mockMojoService.clearAuditLogs.mockResolvedValue({ success: true, deletedCount: 150 })

      // Act
      const result = await auditLogger.clearAuditLogs()

      // Assert
      expect(result.success).toBe(true)
      expect(result.deletedCount).toBe(150)
      expect(mockMojoService.clearAuditLogs).toHaveBeenCalledWith()
    })

    it('should handle clear audit logs errors', async () => {
      // Arrange
      mockMojoService.clearAuditLogs.mockRejectedValue(new Error('Permission denied'))

      // Act
      const result = await auditLogger.clearAuditLogs()

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Permission denied')
    })
  })

  describe('exportAuditLogs', () => {
    it('should export audit logs as JSON successfully', async () => {
      // Arrange
      const mockLogs = [
        { id: '1', type: 'CONSENT_GRANTED', action: 'AI_QUERY', timestamp: Date.now() },
      ]
      const mockExportData = { logs: mockLogs, exportedAt: Date.now() }
      mockMojoService.exportAuditLogs.mockResolvedValue({ success: true, data: mockExportData })

      // Act
      const result = await auditLogger.exportAuditLogs('json')

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockExportData)
      expect(mockMojoService.exportAuditLogs).toHaveBeenCalledWith('json')
    })

    it('should export audit logs as CSV successfully', async () => {
      // Arrange
      const mockCsvData = 'id,type,action,timestamp\n1,CONSENT_GRANTED,AI_QUERY,1234567890'
      mockMojoService.exportAuditLogs.mockResolvedValue({ success: true, data: mockCsvData })

      // Act
      const result = await auditLogger.exportAuditLogs('csv')

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toBe(mockCsvData)
      expect(mockMojoService.exportAuditLogs).toHaveBeenCalledWith('csv')
    })

    it('should handle export errors', async () => {
      // Arrange
      mockMojoService.exportAuditLogs.mockRejectedValue(new Error('Export service unavailable'))

      // Act
      const result = await auditLogger.exportAuditLogs('json')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Export service unavailable')
    })

    it('should validate export format', async () => {
      // Arrange
      const invalidFormat = 'invalid' as unknown as 'json' | 'csv'

      // Act
      const result = await auditLogger.exportAuditLogs(invalidFormat)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid export format')
      expect(mockMojoService.exportAuditLogs).not.toHaveBeenCalled()
    })
  })

  describe('privacy compliance', () => {
    it('should anonymize sensitive data in logs', async () => {
      // Arrange
      const event = {
        type: 'CONSENT_GRANTED',
        action: 'AI_QUERY',
        userId: 'user-123',
        timestamp: Date.now(),
        metadata: {
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          sessionId: 'session-abc123',
        },
      }
      mockMojoService.logEvent.mockResolvedValue({ success: true, eventId: 'event-123' })

      // Act
      const result = await auditLogger.logEvent(event)

      // Assert
      expect(result.success).toBe(true)
      expect(mockMojoService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            ipAddress: expect.stringMatching(/^\*{3}\.\*{3}\.\*{3}\.\*{3}$/),
            userAgent: expect.stringMatching(/^anonymized$/),
            sessionId: expect.stringMatching(/^session-\*{6}$/),
          }),
        })
      )
    })

    it('should respect data retention policies', async () => {
      // Arrange
      const oldDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 1 year ago
      const filters = {
        startDate: oldDate,
        endDate: new Date(),
      }
      mockMojoService.getAuditLogs.mockResolvedValue({ success: true, logs: [] })

      // Act
      const result = await auditLogger.getAuditLogs(filters)

      // Assert
      expect(result.success).toBe(true)
      expect(mockMojoService.getAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        })
      )
    })
  })
})
