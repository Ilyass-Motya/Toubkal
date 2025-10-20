import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useConsent } from './use-consent'

// Mock the consent manager
const mockConsentManager = {
  requestConsent: vi.fn(),
  hasConsent: vi.fn(),
  revokeConsent: vi.fn(),
  getConsentHistory: vi.fn(),
}

vi.mock('@/core/consent/consent-manager', () => ({
  getConsentManager: () => mockConsentManager,
}))

describe('useConsent', () => {
  const defaultActionType = 'AI_QUERY'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should return loading state initially', () => {
      // Arrange
      mockConsentManager.hasConsent.mockResolvedValue(false)

      // Act
      const { result } = renderHook(() => useConsent(defaultActionType))

      // Assert
      expect(result.current.isLoading).toBe(true)
      expect(result.current.hasConsent).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should return consent status after loading', async () => {
      // Arrange
      mockConsentManager.hasConsent.mockResolvedValue(true)

      // Act
      const { result } = renderHook(() => useConsent(defaultActionType))

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      expect(result.current.hasConsent).toBe(true)
      expect(result.current.error).toBeNull()
    })
  })

  describe('grantConsent', () => {
    it('should grant consent successfully', async () => {
      // Arrange
      mockConsentManager.hasConsent.mockResolvedValue(false)
      mockConsentManager.requestConsent.mockResolvedValue({
        success: true,
        consentId: 'consent-123',
        timestamp: Date.now(),
      })

      const { result } = renderHook(() => useConsent(defaultActionType))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act
      const grantResult = await result.current.grantConsent()

      // Assert
      expect(grantResult.success).toBe(true)
      expect(mockConsentManager.requestConsent).toHaveBeenCalledWith(defaultActionType)
      expect(result.current.hasConsent).toBe(true)
    })

    it('should handle consent grant failure', async () => {
      // Arrange
      mockConsentManager.hasConsent.mockResolvedValue(false)
      mockConsentManager.requestConsent.mockResolvedValue({
        success: false,
        error: 'Consent request failed',
      })

      const { result } = renderHook(() => useConsent(defaultActionType))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act
      const grantResult = await result.current.grantConsent()

      // Assert
      expect(grantResult.success).toBe(false)
      if (!grantResult.success) {
        expect(grantResult.error).toBe('Consent request failed')
      }
      expect(result.current.hasConsent).toBe(false)
    })

    it('should handle network errors during consent grant', async () => {
      // Arrange
      mockConsentManager.hasConsent.mockResolvedValue(false)
      mockConsentManager.requestConsent.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useConsent(defaultActionType))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act
      const grantResult = await result.current.grantConsent()

      // Assert
      expect(grantResult.success).toBe(false)
      if (!grantResult.success) {
        expect(grantResult.error).toBe('Network error')
      }
      expect(result.current.error).toBe('Network error')
    })
  })

  describe('revokeConsent', () => {
    it('should revoke consent successfully', async () => {
      // Arrange
      mockConsentManager.hasConsent.mockResolvedValue(true)
      mockConsentManager.revokeConsent.mockResolvedValue(true)

      const { result } = renderHook(() => useConsent(defaultActionType))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act
      const revokeResult = await result.current.revokeConsent()

      // Assert
      expect(revokeResult).toBe(true)
      expect(mockConsentManager.revokeConsent).toHaveBeenCalledWith(defaultActionType)
      expect(result.current.hasConsent).toBe(false)
    })

    it('should handle consent revocation failure', async () => {
      // Arrange
      mockConsentManager.hasConsent.mockResolvedValue(true)
      mockConsentManager.revokeConsent.mockResolvedValue(false)

      const { result } = renderHook(() => useConsent(defaultActionType))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act
      const revokeResult = await result.current.revokeConsent()

      // Assert
      expect(revokeResult).toBe(false)
      expect(result.current.hasConsent).toBe(true) // Should remain true on failure
    })
  })

  describe('refreshConsent', () => {
    it('should refresh consent status', async () => {
      // Arrange
      mockConsentManager.hasConsent
        .mockResolvedValueOnce(false) // Initial load
        .mockResolvedValueOnce(true) // After refresh

      const { result } = renderHook(() => useConsent(defaultActionType))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act
      await result.current.refreshConsent()

      // Assert
      expect(mockConsentManager.hasConsent).toHaveBeenCalledTimes(2)
      expect(result.current.hasConsent).toBe(true)
    })

    it('should handle refresh errors', async () => {
      // Arrange
      mockConsentManager.hasConsent
        .mockResolvedValueOnce(false) // Initial load
        .mockRejectedValueOnce(new Error('Refresh failed')) // Refresh error

      const { result } = renderHook(() => useConsent(defaultActionType))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act
      await result.current.refreshConsent()

      // Assert
      expect(result.current.error).toBe('Refresh failed')
      expect(result.current.hasConsent).toBe(false) // Should remain false on error
    })
  })

  describe('consent history', () => {
    it('should load consent history', async () => {
      // Arrange
      const mockHistory = [
        { id: '1', action: 'AI_QUERY', granted: true, timestamp: Date.now() - 1000 },
        { id: '2', action: 'DATA_COLLECTION', granted: false, timestamp: Date.now() - 500 },
      ]
      mockConsentManager.hasConsent.mockResolvedValue(true)
      mockConsentManager.getConsentHistory.mockResolvedValue(mockHistory)

      const { result } = renderHook(() => useConsent(defaultActionType))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act
      const history = await result.current.getConsentHistory()

      // Assert
      expect(history).toEqual(mockHistory)
      expect(mockConsentManager.getConsentHistory).toHaveBeenCalledWith(defaultActionType)
    })

    it('should handle consent history errors', async () => {
      // Arrange
      mockConsentManager.hasConsent.mockResolvedValue(true)
      mockConsentManager.getConsentHistory.mockRejectedValue(new Error('History load failed'))

      const { result } = renderHook(() => useConsent(defaultActionType))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Act
      const history = await result.current.getConsentHistory()

      // Assert
      expect(history).toEqual([])
      expect(result.current.error).toBe('History load failed')
    })
  })

  describe('error handling', () => {
    it('should clear error when operation succeeds', async () => {
      // Arrange
      mockConsentManager.hasConsent
        .mockRejectedValueOnce(new Error('Initial error'))
        .mockResolvedValueOnce(true)

      const { result } = renderHook(() => useConsent(defaultActionType))

      await waitFor(() => {
        expect(result.current.error).toBe('Initial error')
      })

      // Act
      await result.current.refreshConsent()

      // Assert
      expect(result.current.error).toBeNull()
      expect(result.current.hasConsent).toBe(true)
    })
  })
})
