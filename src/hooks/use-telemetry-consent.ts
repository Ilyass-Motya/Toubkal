/**
 * Telemetry Consent Hook
 * 
 * Manages consent state and operations for telemetry
 * Following Toubkal coding rules: use-kebab-case for hooks
 */

import { useState, useEffect, useCallback } from 'react'
import type { ConsentRequest, ConsentResponse, Result } from '@/types/TelemetryTypes'
import { telemetryManager } from '@/services/telemetry-manager'

export interface UseTelemetryConsentReturn {
  readonly hasConsent: (actionType: string, userId: string) => Promise<Result<boolean>>
  readonly requestConsent: (request: ConsentRequest) => Promise<Result<ConsentResponse>>
  readonly revokeConsent: (consentId: string) => Promise<Result<void>>
  readonly isLoading: boolean
  readonly error: string | null
  readonly clearError: () => void
}

export const useTelemetryConsent = (): UseTelemetryConsentReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback((): void => {
    setError(null)
  }, [])

  const hasConsent = useCallback(async (actionType: string, userId: string): Promise<Result<boolean>> => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await telemetryManager.hasConsent(actionType, userId)
      
      if (!result.success) {
        setError(result.error)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check consent'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const requestConsent = useCallback(async (request: ConsentRequest): Promise<Result<ConsentResponse>> => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await telemetryManager.requestConsent(request)
      
      if (!result.success) {
        setError(result.error)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request consent'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const revokeConsent = useCallback(async (consentId: string): Promise<Result<void>> => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await telemetryManager.revokeConsent(consentId)
      
      if (!result.success) {
        setError(result.error)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke consent'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    hasConsent,
    requestConsent,
    revokeConsent,
    isLoading,
    error,
    clearError
  }
}

export default useTelemetryConsent
