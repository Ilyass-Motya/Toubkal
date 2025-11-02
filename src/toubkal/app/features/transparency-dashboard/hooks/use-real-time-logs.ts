/**
 * useRealTimeLogs Hook
 * 
 * Hook for real-time log streaming with WebSocket/Server-Sent Events.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { AuditLogEntry, RealTimeLogUpdate } from '../types/TransparencyTypes'

interface UseRealTimeLogsResult {
  realTimeLogs: AuditLogEntry[]
  loading: boolean
  error: Error | null
  isStreaming: boolean
  startStreaming: () => void
  stopStreaming: () => void
  clearLogs: () => void
}

export const useRealTimeLogs = (): UseRealTimeLogsResult => {
  const [realTimeLogs, setRealTimeLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  // Mock data for development
  const generateMockLog = (): AuditLogEntry => {
    const eventTypes = ['AI_QUERY', 'CONSENT_DECISION', 'NETWORK_REQUEST', 'PRIVACY_ACTION', 'SYSTEM_EVENT'] as const
    const categories = ['network', 'ai', 'consent', 'privacy', 'system'] as const
    
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]
    
    return {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      eventType,
      category,
      details: {
        action: `Mock ${eventType.toLowerCase().replace('_', ' ')} action`,
        resource: Math.random() > 0.5 ? `https://example.com/resource-${Math.floor(Math.random() * 100)}` : undefined,
        dataAccessed: Math.random() > 0.3 ? ['user_data', 'page_content'] : undefined,
        consentRequired: Math.random() > 0.5,
        consentGranted: Math.random() > 0.3,
        duration: Math.floor(Math.random() * 1000) + 100,
        success: Math.random() > 0.1
      },
      signature: `mock-signature-${Math.random().toString(36).substr(2, 16)}`,
      merkleProof: [`hash-${Math.random().toString(36).substr(2, 8)}`, `hash-${Math.random().toString(36).substr(2, 8)}`]
    }
  }

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const update: RealTimeLogUpdate = JSON.parse(event.data)
      
      setRealTimeLogs(prevLogs => {
        switch (update.type) {
          case 'new':
            return [update.entry, ...prevLogs].slice(0, 1000) // Keep last 1000 entries
          case 'update':
            return prevLogs.map(log => 
              log.id === update.entry.id ? update.entry : log
            )
          case 'delete':
            return prevLogs.filter(log => log.id !== update.entry.id)
          default:
            return prevLogs
        }
      })
    } catch (err) {
      console.error('[useRealTimeLogs] Failed to parse message:', err)
    }
  }, [])

  const handleError = useCallback((event: Event) => {
    console.error('[useRealTimeLogs] EventSource error:', event)
    setError(new Error('Real-time connection failed'))
    
    // Attempt to reconnect
    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current++
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000) // Exponential backoff, max 30s
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isStreaming) {
          console.log(`[useRealTimeLogs] Attempting to reconnect (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`)
          startStreaming()
        }
      }, delay)
    } else {
      setIsStreaming(false)
      setError(new Error('Max reconnection attempts reached'))
    }
  }, [isStreaming])

  const startStreaming = useCallback(() => {
    if (isStreaming) return

    try {
      setError(null)
      setIsStreaming(true)
      reconnectAttempts.current = 0

      // TODO: Replace with actual Server-Sent Events endpoint
      // For now, simulate real-time updates with mock data
      const simulateRealTimeUpdates = () => {
        const interval = setInterval(() => {
          if (!isStreaming) {
            clearInterval(interval)
            return
          }

          const mockLog = generateMockLog()
          const update: RealTimeLogUpdate = {
            type: 'new',
            entry: mockLog,
            timestamp: new Date().toISOString()
          }

          handleMessage({
            data: JSON.stringify(update)
          } as MessageEvent)
        }, Math.random() * 3000 + 1000) // Random interval between 1-4 seconds

        return interval
      }

      const interval = simulateRealTimeUpdates()
      
      // Store interval reference for cleanup
      eventSourceRef.current = {
        close: () => clearInterval(interval)
      } as any

    } catch (err) {
      console.error('[useRealTimeLogs] Failed to start streaming:', err)
      setError(err instanceof Error ? err : new Error('Failed to start real-time streaming'))
      setIsStreaming(false)
    }
  }, [isStreaming, handleMessage])

  const stopStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    setIsStreaming(false)
    reconnectAttempts.current = 0
  }, [])

  const clearLogs = useCallback(() => {
    setRealTimeLogs([])
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreaming()
    }
  }, [stopStreaming])

  return {
    realTimeLogs,
    loading,
    error,
    isStreaming,
    startStreaming,
    stopStreaming,
    clearLogs
  }
}