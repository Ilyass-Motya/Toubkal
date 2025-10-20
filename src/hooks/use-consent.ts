import { useState, useEffect } from 'react'
import { getConsentManager, type ConsentResponse } from '@/core/consent/consent-manager'
import type { Result } from '@/types'

export interface UseConsentReturn {
  isLoading: boolean
  hasConsent: boolean
  error: string | null
  grantConsent: () => Promise<Result<boolean>>
  revokeConsent: () => Promise<Result<boolean>>
  refreshConsent: () => Promise<void>
  getConsentHistory: () => Promise<Result<ConsentResponse[]>>
}

export const useConsent = (actionType: string): UseConsentReturn => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasConsent, setHasConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const consentManager = getConsentManager()

  useEffect(() => {
    const checkConsent = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const consent = await consentManager.hasConsent(actionType, 'current-user')
        setHasConsent(consent)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check consent')
      } finally {
        setIsLoading(false)
      }
    }

    void checkConsent()
  }, [actionType, consentManager])

  const grantConsent = async (): Promise<Result<boolean>> => {
    try {
      setError(null)
      const result = await consentManager.requestConsent({
        actionType,
        userId: 'current-user',
        context: 'hook-request'
      })
      if (result.success) {
        setHasConsent(true)
        return { success: true, data: true }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to request consent'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  const revokeConsent = async (): Promise<Result<boolean>> => {
    try {
      setError(null)
      const result = await consentManager.revokeConsent(actionType, 'current-user')
      if (result) {
        setHasConsent(false)
        return { success: true, data: true }
      } else {
        const errorMsg = 'Failed to revoke consent'
        setError(errorMsg)
        return { success: false, error: errorMsg }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to revoke consent'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  const refreshConsent = async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      const consent = await consentManager.hasConsent(actionType, 'current-user')
      setHasConsent(consent)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh consent')
    } finally {
      setIsLoading(false)
    }
  }

  const getConsentHistory = async (): Promise<Result<ConsentResponse[]>> => {
    try {
      setError(null)
      return await consentManager.getConsentHistory('current-user')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get consent history'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  return {
    isLoading,
    hasConsent,
    error,
    grantConsent,
    revokeConsent,
    refreshConsent,
    getConsentHistory,
  }
}
