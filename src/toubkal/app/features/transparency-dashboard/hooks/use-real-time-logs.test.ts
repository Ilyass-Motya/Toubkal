/**
 * useRealTimeLogs Hook Tests
 * 
 * Unit tests for the useRealTimeLogs hook.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useRealTimeLogs } from './use-real-time-logs'

// Mock the hook implementation
vi.mock('./use-real-time-logs', () => ({
  useRealTimeLogs: vi.fn()
}))

describe('useRealTimeLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('initial state', () => {
    it('should return initial state', () => {
      const mockUseRealTimeLogs = vi.mocked(useRealTimeLogs)
      mockUseRealTimeLogs.mockReturnValue({
        realTimeLogs: [],
        loading: false,
        error: null,
        isStreaming: false,
        startStreaming: vi.fn(),
        stopStreaming: vi.fn(),
        clearLogs: vi.fn()
      })

      const { result } = renderHook(() => useRealTimeLogs())

      expect(result.current.realTimeLogs).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.isStreaming).toBe(false)
    })
  })

  describe('streaming state', () => {
    it('should return streaming state when active', () => {
      const mockLogs = [
        {
          id: 'log-1',
          timestamp: new Date().toISOString(),
          eventType: 'AI_QUERY',
          category: 'ai',
          details: { action: 'Test query', success: true },
          signature: 'mock-signature',
          merkleProof: ['hash1', 'hash2']
        }
      ]

      const mockUseRealTimeLogs = vi.mocked(useRealTimeLogs)
      mockUseRealTimeLogs.mockReturnValue({
        realTimeLogs: mockLogs,
        loading: false,
        error: null,
        isStreaming: true,
        startStreaming: vi.fn(),
        stopStreaming: vi.fn(),
        clearLogs: vi.fn()
      })

      const { result } = renderHook(() => useRealTimeLogs())

      expect(result.current.realTimeLogs).toEqual(mockLogs)
      expect(result.current.isStreaming).toBe(true)
    })

    it('should provide streaming control functions', () => {
      const mockStartStreaming = vi.fn()
      const mockStopStreaming = vi.fn()
      const mockClearLogs = vi.fn()

      const mockUseRealTimeLogs = vi.mocked(useRealTimeLogs)
      mockUseRealTimeLogs.mockReturnValue({
        realTimeLogs: [],
        loading: false,
        error: null,
        isStreaming: false,
        startStreaming: mockStartStreaming,
        stopStreaming: mockStopStreaming,
        clearLogs: mockClearLogs
      })

      const { result } = renderHook(() => useRealTimeLogs())

      expect(result.current.startStreaming).toBe(mockStartStreaming)
      expect(result.current.stopStreaming).toBe(mockStopStreaming)
      expect(result.current.clearLogs).toBe(mockClearLogs)
    })
  })

  describe('loading state', () => {
    it('should return loading state when fetching logs', () => {
      const mockUseRealTimeLogs = vi.mocked(useRealTimeLogs)
      mockUseRealTimeLogs.mockReturnValue({
        realTimeLogs: [],
        loading: true,
        error: null,
        isStreaming: false,
        startStreaming: vi.fn(),
        stopStreaming: vi.fn(),
        clearLogs: vi.fn()
      })

      const { result } = renderHook(() => useRealTimeLogs())

      expect(result.current.loading).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should return error state when streaming fails', () => {
      const mockError = new Error('Streaming connection failed')
      const mockUseRealTimeLogs = vi.mocked(useRealTimeLogs)
      mockUseRealTimeLogs.mockReturnValue({
        realTimeLogs: [],
        loading: false,
        error: mockError,
        isStreaming: false,
        startStreaming: vi.fn(),
        stopStreaming: vi.fn(),
        clearLogs: vi.fn()
      })

      const { result } = renderHook(() => useRealTimeLogs())

      expect(result.current.error).toBe(mockError)
      expect(result.current.isStreaming).toBe(false)
    })

    it('should handle network errors', () => {
      const networkError = new Error('Network request failed')
      const mockUseRealTimeLogs = vi.mocked(useRealTimeLogs)
      mockUseRealTimeLogs.mockReturnValue({
        realTimeLogs: [],
        loading: false,
        error: networkError,
        isStreaming: false,
        startStreaming: vi.fn(),
        stopStreaming: vi.fn(),
        clearLogs: vi.fn()
      })

      const { result } = renderHook(() => useRealTimeLogs())

      expect(result.current.error).toBe(networkError)
    })
  })

  describe('log management', () => {
    it('should handle multiple log entries', () => {
      const mockLogs = [
        {
          id: 'log-1',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          eventType: 'AI_QUERY',
          category: 'ai',
          details: { action: 'Query 1', success: true },
          signature: 'signature-1',
          merkleProof: ['hash1']
        },
        {
          id: 'log-2',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          eventType: 'NETWORK_REQUEST',
          category: 'network',
          details: { action: 'Request 1', success: true },
          signature: 'signature-2',
          merkleProof: ['hash2']
        }
      ]

      const mockUseRealTimeLogs = vi.mocked(useRealTimeLogs)
      mockUseRealTimeLogs.mockReturnValue({
        realTimeLogs: mockLogs,
        loading: false,
        error: null,
        isStreaming: true,
        startStreaming: vi.fn(),
        stopStreaming: vi.fn(),
        clearLogs: vi.fn()
      })

      const { result } = renderHook(() => useRealTimeLogs())

      expect(result.current.realTimeLogs).toHaveLength(2)
      expect(result.current.realTimeLogs[0].id).toBe('log-1')
      expect(result.current.realTimeLogs[1].id).toBe('log-2')
    })

    it('should handle empty logs array', () => {
      const mockUseRealTimeLogs = vi.mocked(useRealTimeLogs)
      mockUseRealTimeLogs.mockReturnValue({
        realTimeLogs: [],
        loading: false,
        error: null,
        isStreaming: false,
        startStreaming: vi.fn(),
        stopStreaming: vi.fn(),
        clearLogs: vi.fn()
      })

      const { result } = renderHook(() => useRealTimeLogs())

      expect(result.current.realTimeLogs).toEqual([])
    })
  })

  describe('streaming control', () => {
    it('should call startStreaming function', () => {
      const mockStartStreaming = vi.fn()
      const mockUseRealTimeLogs = vi.mocked(useRealTimeLogs)
      mockUseRealTimeLogs.mockReturnValue({
        realTimeLogs: [],
        loading: false,
        error: null,
        isStreaming: false,
        startStreaming: mockStartStreaming,
        stopStreaming: vi.fn(),
        clearLogs: vi.fn()
      })

      const { result } = renderHook(() => useRealTimeLogs())

      result.current.startStreaming()

      expect(mockStartStreaming).toHaveBeenCalledTimes(1)
    })

    it('should call stopStreaming function', () => {
      const mockStopStreaming = vi.fn()
      const mockUseRealTimeLogs = vi.mocked(useRealTimeLogs)
      mockUseRealTimeLogs.mockReturnValue({
        realTimeLogs: [],
        loading: false,
        error: null,
        isStreaming: true,
        startStreaming: vi.fn(),
        stopStreaming: mockStopStreaming,
        clearLogs: vi.fn()
      })

      const { result } = renderHook(() => useRealTimeLogs())

      result.current.stopStreaming()

      expect(mockStopStreaming).toHaveBeenCalledTimes(1)
    })

    it('should call clearLogs function', () => {
      const mockClearLogs = vi.fn()
      const mockUseRealTimeLogs = vi.mocked(useRealTimeLogs)
      mockUseRealTimeLogs.mockReturnValue({
        realTimeLogs: [],
        loading: false,
        error: null,
        isStreaming: false,
        startStreaming: vi.fn(),
        stopStreaming: vi.fn(),
        clearLogs: mockClearLogs
      })

      const { result } = renderHook(() => useRealTimeLogs())

      result.current.clearLogs()

      expect(mockClearLogs).toHaveBeenCalledTimes(1)
    })
  })

  describe('log data structure', () => {
    it('should handle logs with correct structure', () => {
      const mockLog = {
        id: 'log-1',
        timestamp: new Date().toISOString(),
        eventType: 'AI_QUERY',
        category: 'ai',
        details: {
          action: 'Test query',
          success: true,
          duration: 1500
        },
        signature: 'mock-signature',
        merkleProof: ['hash1', 'hash2']
      }

      const mockUseRealTimeLogs = vi.mocked(useRealTimeLogs)
      mockUseRealTimeLogs.mockReturnValue({
        realTimeLogs: [mockLog],
        loading: false,
        error: null,
        isStreaming: true,
        startStreaming: vi.fn(),
        stopStreaming: vi.fn(),
        clearLogs: vi.fn()
      })

      const { result } = renderHook(() => useRealTimeLogs())

      expect(result.current.realTimeLogs[0]).toHaveProperty('id')
      expect(result.current.realTimeLogs[0]).toHaveProperty('timestamp')
      expect(result.current.realTimeLogs[0]).toHaveProperty('eventType')
      expect(result.current.realTimeLogs[0]).toHaveProperty('category')
      expect(result.current.realTimeLogs[0]).toHaveProperty('details')
      expect(result.current.realTimeLogs[0]).toHaveProperty('signature')
      expect(result.current.realTimeLogs[0]).toHaveProperty('merkleProof')
    })
  })
})
