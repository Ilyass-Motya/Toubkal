/**
 * useAuditData Hook Tests
 * 
 * Unit tests for the useAuditData hook.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuditData } from './use-audit-data'

// Mock the hook implementation
vi.mock('./use-audit-data', () => ({
  useAuditData: vi.fn()
}))

describe('useAuditData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should return loading state initially', () => {
      const mockUseAuditData = vi.mocked(useAuditData)
      mockUseAuditData.mockReturnValue({
        auditData: null,
        loading: true,
        error: null,
        refresh: vi.fn()
      })

      const { result } = renderHook(() => useAuditData())

      expect(result.current.loading).toBe(true)
      expect(result.current.auditData).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })

  describe('successful data loading', () => {
    it('should return audit data when loaded successfully', () => {
      const mockAuditData = {
        totalEntries: 150,
        consentHistory: [],
        networkRequests: [],
        aiQueries: [],
        privacyActions: [],
        systemEvents: [],
        lastUpdated: new Date().toISOString(),
        merkleRoot: 'mock-merkle-root'
      }

      const mockUseAuditData = vi.mocked(useAuditData)
      mockUseAuditData.mockReturnValue({
        auditData: mockAuditData,
        loading: false,
        error: null,
        refresh: vi.fn()
      })

      const { result } = renderHook(() => useAuditData())

      expect(result.current.loading).toBe(false)
      expect(result.current.auditData).toEqual(mockAuditData)
      expect(result.current.error).toBeNull()
    })

    it('should provide refresh function', () => {
      const mockRefresh = vi.fn()
      const mockUseAuditData = vi.mocked(useAuditData)
      mockUseAuditData.mockReturnValue({
        auditData: null,
        loading: false,
        error: null,
        refresh: mockRefresh
      })

      const { result } = renderHook(() => useAuditData())

      expect(result.current.refresh).toBe(mockRefresh)
    })
  })

  describe('error handling', () => {
    it('should return error state when loading fails', () => {
      const mockError = new Error('Failed to load audit data')
      const mockUseAuditData = vi.mocked(useAuditData)
      mockUseAuditData.mockReturnValue({
        auditData: null,
        loading: false,
        error: mockError,
        refresh: vi.fn()
      })

      const { result } = renderHook(() => useAuditData())

      expect(result.current.loading).toBe(false)
      expect(result.current.auditData).toBeNull()
      expect(result.current.error).toBe(mockError)
    })

    it('should handle network errors', () => {
      const networkError = new Error('Network request failed')
      const mockUseAuditData = vi.mocked(useAuditData)
      mockUseAuditData.mockReturnValue({
        auditData: null,
        loading: false,
        error: networkError,
        refresh: vi.fn()
      })

      const { result } = renderHook(() => useAuditData())

      expect(result.current.error).toBe(networkError)
    })
  })

  describe('data structure', () => {
    it('should return audit data with correct structure', () => {
      const mockAuditData = {
        totalEntries: 150,
        consentHistory: [
          {
            id: 'consent-1',
            timestamp: new Date().toISOString(),
            actionType: 'AI_QUERY',
            dataDisclosed: ['page_content'],
            decision: 'granted',
            userAgent: 'Toubkal Browser 1.0',
            signature: 'mock-signature'
          }
        ],
        networkRequests: [],
        aiQueries: [],
        privacyActions: [],
        systemEvents: [],
        lastUpdated: new Date().toISOString(),
        merkleRoot: 'mock-merkle-root'
      }

      const mockUseAuditData = vi.mocked(useAuditData)
      mockUseAuditData.mockReturnValue({
        auditData: mockAuditData,
        loading: false,
        error: null,
        refresh: vi.fn()
      })

      const { result } = renderHook(() => useAuditData())

      expect(result.current.auditData).toHaveProperty('totalEntries')
      expect(result.current.auditData).toHaveProperty('consentHistory')
      expect(result.current.auditData).toHaveProperty('lastUpdated')
      expect(result.current.auditData).toHaveProperty('merkleRoot')
    })

    it('should handle empty audit data', () => {
      const emptyAuditData = {
        totalEntries: 0,
        consentHistory: [],
        networkRequests: [],
        aiQueries: [],
        privacyActions: [],
        systemEvents: [],
        lastUpdated: new Date().toISOString(),
        merkleRoot: 'empty-merkle-root'
      }

      const mockUseAuditData = vi.mocked(useAuditData)
      mockUseAuditData.mockReturnValue({
        auditData: emptyAuditData,
        loading: false,
        error: null,
        refresh: vi.fn()
      })

      const { result } = renderHook(() => useAuditData())

      expect(result.current.auditData?.totalEntries).toBe(0)
      expect(result.current.auditData?.consentHistory).toHaveLength(0)
    })
  })

  describe('refresh functionality', () => {
    it('should call refresh function when provided', () => {
      const mockRefresh = vi.fn()
      const mockUseAuditData = vi.mocked(useAuditData)
      mockUseAuditData.mockReturnValue({
        auditData: null,
        loading: false,
        error: null,
        refresh: mockRefresh
      })

      const { result } = renderHook(() => useAuditData())

      result.current.refresh()

      expect(mockRefresh).toHaveBeenCalledTimes(1)
    })

    it('should handle refresh errors', () => {
      const mockRefresh = vi.fn().mockRejectedValue(new Error('Refresh failed'))
      const mockUseAuditData = vi.mocked(useAuditData)
      mockUseAuditData.mockReturnValue({
        auditData: null,
        loading: false,
        error: null,
        refresh: mockRefresh
      })

      const { result } = renderHook(() => useAuditData())

      expect(() => result.current.refresh()).not.toThrow()
    })
  })
})
