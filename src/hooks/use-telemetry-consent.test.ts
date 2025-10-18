/**
 * Telemetry Consent Hook Tests
 * 
 * Tests for useTelemetryConsent hook
 * Following Toubkal coding rules: AAA pattern, proper mocking
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTelemetryConsent } from './use-telemetry-consent'
import type { ConsentRequest } from '@/types/TelemetryTypes'

// Mock the telemetry manager
vi.mock('@/services/telemetry-manager', () => ({
  telemetryManager: {
    hasConsent: vi.fn(),
    requestConsent: vi.fn(),
    revokeConsent: vi.fn()
  }
}))

import { telemetryManager } from '@/services/telemetry-manager'

const mockTelemetryManager = vi.mocked(telemetryManager)

describe('useTelemetryConsent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      // Arrange
      // (no setup needed)

      // Act
      const { result } = renderHook(() => useTelemetryConsent())

      // Assert
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(typeof result.current.hasConsent).toBe('function')
      expect(typeof result.current.requestConsent).toBe('function')
      expect(typeof result.current.revokeConsent).toBe('function')
      expect(typeof result.current.clearError).toBe('function')
    })
  })

  describe('hasConsent', () => {
    it('should call telemetry manager and return result', async () => {
      // Arrange
      mockTelemetryManager.hasConsent.mockResolvedValue({
        success: true,
        data: false
      })

      // Act
      const { result } = renderHook(() => useTelemetryConsent())
      let consentResult: any

      await act(async () => {
        consentResult = await result.current.hasConsent('AI_QUERY_CLOUD', 'test-user')
      })

      // Assert
      expect(mockTelemetryManager.hasConsent).toHaveBeenCalledWith('AI_QUERY_CLOUD', 'test-user')
      expect(consentResult.success).toBe(true)
      if (consentResult.success) {
        expect(consentResult.data).toBe(false)
      }
    })

    it('should set loading state during call', async () => {
      // Arrange
      let resolvePromise: (value: any) => void
      const promise = new Promise(resolve => {
        resolvePromise = resolve
      })
      mockTelemetryManager.hasConsent.mockReturnValue(promise as any)

      // Act
      const { result } = renderHook(() => useTelemetryConsent())

      act(() => {
        result.current.hasConsent('AI_QUERY_CLOUD', 'test-user')
      })

      // Assert
      expect(result.current.isLoading).toBe(true)

      // Cleanup
      await act(async () => {
        resolvePromise!({ success: true, data: false })
        await promise
      })
    })

    it('should handle errors and set error state', async () => {
      // Arrange
      const errorMessage = 'Consent check failed'
      mockTelemetryManager.hasConsent.mockResolvedValue({
        success: false,
        error: errorMessage
      })

      // Act
      const { result } = renderHook(() => useTelemetryConsent())
      let consentResult: any

      await act(async () => {
        consentResult = await result.current.hasConsent('AI_QUERY_CLOUD', 'test-user')
      })

      // Assert
      expect(consentResult.success).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })

    it('should handle exceptions', async () => {
      // Arrange
      const errorMessage = 'Network error'
      mockTelemetryManager.hasConsent.mockRejectedValue(new Error(errorMessage))

      // Act
      const { result } = renderHook(() => useTelemetryConsent())
      let consentResult: any

      await act(async () => {
        consentResult = await result.current.hasConsent('AI_QUERY_CLOUD', 'test-user')
      })

      // Assert
      expect(consentResult.success).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('requestConsent', () => {
    const mockRequest: ConsentRequest = {
      actionType: 'AI_QUERY_CLOUD',
      userId: 'test-user',
      dataDisclosed: ['prompt', 'context'],
      purpose: 'AI processing',
      retentionPeriod: 30
    }

    it('should call telemetry manager and return result', async () => {
      // Arrange
      const mockResponse = {
        granted: false,
        timestamp: Date.now(),
        consentId: 'test-consent-id'
      }
      mockTelemetryManager.requestConsent.mockResolvedValue({
        success: true,
        data: mockResponse
      })

      // Act
      const { result } = renderHook(() => useTelemetryConsent())
      let consentResult: any

      await act(async () => {
        consentResult = await result.current.requestConsent(mockRequest)
      })

      // Assert
      expect(mockTelemetryManager.requestConsent).toHaveBeenCalledWith(mockRequest)
      expect(consentResult.success).toBe(true)
      if (consentResult.success) {
        expect(consentResult.data).toEqual(mockResponse)
      }
    })

    it('should set loading state during call', async () => {
      // Arrange
      let resolvePromise: (value: any) => void
      const promise = new Promise(resolve => {
        resolvePromise = resolve
      })
      mockTelemetryManager.requestConsent.mockReturnValue(promise as any)

      // Act
      const { result } = renderHook(() => useTelemetryConsent())

      act(() => {
        result.current.requestConsent(mockRequest)
      })

      // Assert
      expect(result.current.isLoading).toBe(true)

      // Cleanup
      await act(async () => {
        resolvePromise!({ success: true, data: { granted: false, timestamp: Date.now(), consentId: 'test' } })
        await promise
      })
    })

    it('should handle errors and set error state', async () => {
      // Arrange
      const errorMessage = 'Consent request failed'
      mockTelemetryManager.requestConsent.mockResolvedValue({
        success: false,
        error: errorMessage
      })

      // Act
      const { result } = renderHook(() => useTelemetryConsent())
      let consentResult: any

      await act(async () => {
        consentResult = await result.current.requestConsent(mockRequest)
      })

      // Assert
      expect(consentResult.success).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('revokeConsent', () => {
    it('should call telemetry manager and return result', async () => {
      // Arrange
      const consentId = 'test-consent-id'
      mockTelemetryManager.revokeConsent.mockResolvedValue({
        success: true,
        data: undefined
      })

      // Act
      const { result } = renderHook(() => useTelemetryConsent())
      let revokeResult: any

      await act(async () => {
        revokeResult = await result.current.revokeConsent(consentId)
      })

      // Assert
      expect(mockTelemetryManager.revokeConsent).toHaveBeenCalledWith(consentId)
      expect(revokeResult.success).toBe(true)
    })

    it('should set loading state during call', async () => {
      // Arrange
      let resolvePromise: (value: any) => void
      const promise = new Promise(resolve => {
        resolvePromise = resolve
      })
      mockTelemetryManager.revokeConsent.mockReturnValue(promise as any)

      // Act
      const { result } = renderHook(() => useTelemetryConsent())

      act(() => {
        result.current.revokeConsent('test-consent-id')
      })

      // Assert
      expect(result.current.isLoading).toBe(true)

      // Cleanup
      await act(async () => {
        resolvePromise!({ success: true, data: undefined })
        await promise
      })
    })

    it('should handle errors and set error state', async () => {
      // Arrange
      const errorMessage = 'Revoke failed'
      mockTelemetryManager.revokeConsent.mockResolvedValue({
        success: false,
        error: errorMessage
      })

      // Act
      const { result } = renderHook(() => useTelemetryConsent())
      let revokeResult: any

      await act(async () => {
        revokeResult = await result.current.revokeConsent('test-consent-id')
      })

      // Assert
      expect(revokeResult.success).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('clearError', () => {
    it('should clear error state', async () => {
      // Arrange
      mockTelemetryManager.hasConsent.mockResolvedValue({
        success: false,
        error: 'Test error'
      })

      const { result } = renderHook(() => useTelemetryConsent())

      // Set error state
      await act(async () => {
        await result.current.hasConsent('AI_QUERY_CLOUD', 'test-user')
      })

      expect(result.current.error).toBe('Test error')

      // Act
      act(() => {
        result.current.clearError()
      })

      // Assert
      expect(result.current.error).toBe(null)
    })
  })

  describe('error handling', () => {
    it('should handle non-Error exceptions', async () => {
      // Arrange
      mockTelemetryManager.hasConsent.mockRejectedValue('String error')

      // Act
      const { result } = renderHook(() => useTelemetryConsent())
      let consentResult: any

      await act(async () => {
        consentResult = await result.current.hasConsent('AI_QUERY_CLOUD', 'test-user')
      })

      // Assert
      expect(consentResult.success).toBe(false)
      expect(result.current.error).toBe('Failed to check consent')
    })
  })
})
