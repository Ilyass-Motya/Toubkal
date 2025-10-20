/**
 * Privacy Settings Hook
 *
 * React hook for managing privacy settings state and operations.
 * Provides reactive state management for privacy features.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { PrivacyManager, getPrivacyManager } from '@/services/privacy-manager'
import {
  PrivacySettings,
  PrivacyStatus,
  PrivacyWarning,
  FingerprintingTestResult,
} from '@/types/PrivacyTypes'
import { Result } from '@/types/CommonTypes'

interface UsePrivacySettingsReturn {
  // State
  settings: PrivacySettings | null
  status: PrivacyStatus | null
  warnings: PrivacyWarning[]
  isLoading: boolean
  error: string | null

  // Actions
  updateSettings: (updates: Partial<PrivacySettings>) => Promise<Result<PrivacySettings>>
  enableProtection: () => Promise<Result<boolean>>
  disableProtection: () => Promise<Result<boolean>>
  runFingerprintingTests: () => Promise<Result<FingerprintingTestResult[]>>
  acknowledgeWarning: (warningIndex: number) => void
  clearWarnings: () => void

  // Utilities
  refresh: () => Promise<void>
  isProtectionEnabled: boolean
  isFingerprintingEnabled: boolean
  isTrackerBlockingEnabled: boolean
}

export function usePrivacySettings(): UsePrivacySettingsReturn {
  const [settings, setSettings] = useState<PrivacySettings | null>(null)
  const [status, setStatus] = useState<PrivacyStatus | null>(null)
  const [warnings, setWarnings] = useState<PrivacyWarning[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const privacyManagerRef = useRef<PrivacyManager | null>(null)
  const isInitializedRef = useRef(false)

  const handleSettingsChanged = useCallback(() => {
    if (privacyManagerRef.current) {
      const newSettings = privacyManagerRef.current.getSettings()
      const newStatus = privacyManagerRef.current.getStatus()

      setSettings(newSettings)
      setStatus(newStatus)
    }
  }, [])

  const handleWarningShown = useCallback((event: { data?: { warning?: PrivacyWarning } }) => {
    if (event.data?.warning != null) {
      setWarnings((prev) => [...prev, event.data.warning])
    }
  }, [])

  const initializePrivacyManager = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      const manager = getPrivacyManager()
      privacyManagerRef.current = manager

      // Initialize the manager
      const initResult = await manager.initialize()
      if (!initResult.success) {
        throw new Error(initResult.error)
      }

      // Set up event listeners
      manager.addEventListener('PRIVACY_SETTINGS_CHANGED', handleSettingsChanged)
      manager.addEventListener('PRIVACY_WARNING_SHOWN', handleWarningShown)

      // Load initial state
      const currentSettings = manager.getSettings()
      const currentStatus = manager.getStatus()

      setSettings(currentSettings)
      setStatus(currentStatus)
      setWarnings([]) // Warnings will be populated by events

      isInitializedRef.current = true
    } catch (err) {
      console.error('[usePrivacySettings] Initialization failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize privacy settings')
    } finally {
      setIsLoading(false)
    }
  }, [handleSettingsChanged, handleWarningShown])

  // Initialize privacy manager
  useEffect(() => {
    if (!isInitializedRef.current) {
      void initializePrivacyManager()
    }
  }, [initializePrivacyManager])

  const updateSettings = useCallback(
    async (updates: Partial<PrivacySettings>): Promise<Result<PrivacySettings>> => {
      if (!privacyManagerRef.current) {
        return { success: false, error: 'Privacy manager not initialized' }
      }

      try {
        setError(null)
        const result = await privacyManagerRef.current.updateSettings(updates)

        if (result.success) {
          setSettings(result.data)
          const newStatus = privacyManagerRef.current.getStatus()
          setStatus(newStatus)
        } else {
          setError(result.error)
        }

        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update settings'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    },
    []
  )

  const enableProtection = useCallback(async (): Promise<Result<boolean>> => {
    if (!privacyManagerRef.current) {
      return { success: false, error: 'Privacy manager not initialized' }
    }

    try {
      setError(null)
      const result = await privacyManagerRef.current.enableProtection()

      if (result.success) {
        const newSettings = privacyManagerRef.current.getSettings()
        const newStatus = privacyManagerRef.current.getStatus()
        setSettings(newSettings)
        setStatus(newStatus)
      } else {
        setError(result.error)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable protection'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const disableProtection = useCallback(async (): Promise<Result<boolean>> => {
    if (!privacyManagerRef.current) {
      return { success: false, error: 'Privacy manager not initialized' }
    }

    try {
      setError(null)
      const result = await privacyManagerRef.current.disableProtection()

      if (result.success) {
        const newSettings = privacyManagerRef.current.getSettings()
        const newStatus = privacyManagerRef.current.getStatus()
        setSettings(newSettings)
        setStatus(newStatus)
      } else {
        setError(result.error)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disable protection'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const runFingerprintingTests = useCallback(async (): Promise<
    Result<FingerprintingTestResult[]>
  > => {
    if (!privacyManagerRef.current) {
      return { success: false, error: 'Privacy manager not initialized' }
    }

    try {
      setError(null)
      const result = await privacyManagerRef.current.runFingerprintingTests()

      if (!result.success) {
        setError(result.error)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run fingerprinting tests'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const acknowledgeWarning = useCallback((warningIndex: number) => {
    setWarnings((prev) => {
      const newWarnings = [...prev]
      if (newWarnings[warningIndex] != null) {
        newWarnings[warningIndex] = {
          ...newWarnings[warningIndex],
          acknowledged: true,
        }
      }
      return newWarnings
    })
  }, [])

  const clearWarnings = useCallback(() => {
    setWarnings([])
  }, [])

  const refresh = useCallback((): Promise<void> => {
    if (!privacyManagerRef.current) {
      return Promise.resolve()
    }

    try {
      setIsLoading(true)
      setError(null)

      const newSettings = privacyManagerRef.current.getSettings()
      const newStatus = privacyManagerRef.current.getStatus()

      setSettings(newSettings)
      setStatus(newStatus)
      return Promise.resolve()
    } catch (err) {
      console.error('[usePrivacySettings] Refresh failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh settings')
      return Promise.resolve()
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Computed values
  const isProtectionEnabled = settings?.protectionEnabled ?? false
  const isFingerprintingEnabled = settings?.fingerprintingProtection ?? false
  const isTrackerBlockingEnabled = settings?.trackerBlocking ?? false

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (privacyManagerRef.current) {
        privacyManagerRef.current.removeEventListener('PRIVACY_SETTINGS_CHANGED')
        privacyManagerRef.current.removeEventListener('PRIVACY_WARNING_SHOWN')
      }
    }
  }, [])

  return {
    // State
    settings,
    status,
    warnings,
    isLoading,
    error,

    // Actions
    updateSettings,
    enableProtection,
    disableProtection,
    runFingerprintingTests,
    acknowledgeWarning,
    clearWarnings,

    // Utilities
    refresh,
    isProtectionEnabled,
    isFingerprintingEnabled,
    isTrackerBlockingEnabled,
  }
}
