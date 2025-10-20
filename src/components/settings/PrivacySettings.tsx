/**
 * Privacy Settings Component
 *
 * Main UI component for managing privacy settings including
 * fingerprinting protection, tracker blocking, and Brave Shields.
 */

import React, { useState } from 'react'
import { usePrivacySettings } from '@/hooks/use-privacy-settings'
import { PrivacyWarning } from '@/types/PrivacyTypes'

interface PrivacySettingsProps {
  className?: string
}

export function PrivacySettings({ className = '' }: PrivacySettingsProps): React.JSX.Element {
  const {
    settings,
    status,
    warnings,
    isLoading,
    error,
    updateSettings,
    enableProtection,
    disableProtection,
    runFingerprintingTests,
    acknowledgeWarning,
    clearWarnings,
    isProtectionEnabled,
    isFingerprintingEnabled,
    isTrackerBlockingEnabled,
  } = usePrivacySettings()

  const [isRunningTests, setIsRunningTests] = useState(false)
  const [testResults, setTestResults] = useState<unknown[]>([])

  const handleToggleProtection = async (): Promise<void> => {
    if (isProtectionEnabled) {
      await disableProtection()
    } else {
      await enableProtection()
    }
  }

  const handleToggleFingerprinting = async (): Promise<void> => {
    if (!settings) return

    await updateSettings({
      fingerprintingProtection: !isFingerprintingEnabled,
    })
  }

  const handleToggleTrackerBlocking = async (): Promise<void> => {
    if (!settings) return

    await updateSettings({
      trackerBlocking: !isTrackerBlockingEnabled,
    })
  }

  const handleToggleBraveShields = async (): Promise<void> => {
    if (!settings) return

    await updateSettings({
      braveShieldsAggressive: !settings.braveShieldsAggressive,
    })
  }

  const handleRunTests = async (): Promise<void> => {
    setIsRunningTests(true)
    try {
      const result = await runFingerprintingTests()
      if (result.success) {
        setTestResults(result.data)
      }
    } finally {
      setIsRunningTests(false)
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'enabled':
        return 'text-green-600 bg-green-100'
      case 'disabled':
        return 'text-red-600 bg-red-100'
      case 'partial':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'enabled':
        return 'Protection: Enabled'
      case 'disabled':
        return 'Protection: Disabled'
      case 'partial':
        return 'Protection: Partial'
      default:
        return 'Protection: Unknown'
    }
  }

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading privacy settings...</span>
        </div>
      </div>
    )
  }

  if (error != null && error.length > 0) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading privacy settings</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Privacy Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage your privacy protection settings and security preferences.
        </p>
      </div>

      {/* Protection Status */}
      {status && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Overall Protection</h3>
              <p className="text-sm text-gray-600">
                Current privacy protection status and performance metrics.
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status.status)}`}
              >
                {getStatusText(status.status)}
              </span>
              {status.performance.activationTime > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  Activation: {status.performance.activationTime.toFixed(0)}ms
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Privacy Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Privacy Warnings</h3>
          {warnings.map((warning, index) => (
            <WarningBanner
              key={index}
              warning={warning}
              onAcknowledge={() => acknowledgeWarning(index)}
            />
          ))}
          <button
            onClick={clearWarnings}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear all warnings
          </button>
        </div>
      )}

      {/* Main Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Privacy Features</h3>

        {/* Overall Protection Toggle */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-base font-medium text-gray-900">Privacy Protection</h4>
              <p className="text-sm text-gray-600">
                Enable or disable all privacy protection features.
              </p>
            </div>
            <button
              onClick={() => void handleToggleProtection()}
              aria-label="Toggle privacy protection"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isProtectionEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isProtectionEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Individual Feature Toggles */}
        <div className="space-y-3">
          {/* Fingerprinting Protection */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-base font-medium text-gray-900">Fingerprinting Protection</h4>
                <p className="text-sm text-gray-600">
                  Prevents websites from creating unique fingerprints of your device.
                </p>
              </div>
              <button
                onClick={() => void handleToggleFingerprinting()}
                disabled={!isProtectionEnabled}
                aria-label="Toggle fingerprinting protection"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isFingerprintingEnabled && isProtectionEnabled ? 'bg-blue-600' : 'bg-gray-200'
                } ${!isProtectionEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isFingerprintingEnabled && isProtectionEnabled
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Tracker Blocking */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-base font-medium text-gray-900">Tracker Blocking</h4>
                <p className="text-sm text-gray-600">
                  Blocks known tracking domains and advertising networks.
                </p>
              </div>
              <button
                onClick={() => void handleToggleTrackerBlocking()}
                disabled={!isProtectionEnabled}
                aria-label="Toggle tracker blocking"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isTrackerBlockingEnabled && isProtectionEnabled ? 'bg-blue-600' : 'bg-gray-200'
                } ${!isProtectionEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isTrackerBlockingEnabled && isProtectionEnabled
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Brave Shields */}
          {settings && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-base font-medium text-gray-900">
                    Brave Shields (Aggressive)
                  </h4>
                  <p className="text-sm text-gray-600">
                    Enhanced ad and tracker blocking with aggressive filtering.
                  </p>
                </div>
                <button
                  onClick={() => void handleToggleBraveShields()}
                  disabled={!isProtectionEnabled}
                  aria-label="Toggle Brave Shields"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    settings.braveShieldsAggressive && isProtectionEnabled
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  } ${!isProtectionEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.braveShieldsAggressive && isProtectionEnabled
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fingerprinting Tests */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Privacy Testing</h3>
            <p className="text-sm text-gray-600">
              Test your privacy protection against fingerprinting attempts.
            </p>
          </div>
          <button
            onClick={() => void handleRunTests()}
            disabled={isRunningTests}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunningTests ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Running Tests...
              </>
            ) : (
              'Run Privacy Tests'
            )}
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-base font-medium text-gray-900">Test Results</h4>
            {testResults.map((result, index) => {
              const testResult = result as { testName: string; score: number; passed: boolean }
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{testResult.testName}</p>
                    <p className="text-xs text-gray-600">Score: {testResult.score}/100</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      testResult.passed === true
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {testResult.passed === true ? 'Passed' : 'Failed'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

interface WarningBannerProps {
  warning: PrivacyWarning
  onAcknowledge: () => void
}

function WarningBanner({ warning, onAcknowledge }: WarningBannerProps): React.JSX.Element {
  const getWarningIcon = (type: string) => {
    switch (type) {
      case 'REDUCED_PRIVACY':
        return (
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'TRACKING_ENABLED':
        return (
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'FINGERPRINTING_ENABLED':
        return (
          <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )
      default:
        return null
    }
  }

  const getWarningColor = (type: string) => {
    switch (type) {
      case 'REDUCED_PRIVACY':
        return 'bg-red-50 border-red-200'
      case 'TRACKING_ENABLED':
        return 'bg-yellow-50 border-yellow-200'
      case 'FINGERPRINTING_ENABLED':
        return 'bg-orange-50 border-orange-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className={`border rounded-md p-4 ${getWarningColor(warning.type)}`}>
      <div className="flex">
        <div className="flex-shrink-0">{getWarningIcon(warning.type)}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">{warning.message}</p>
          {!warning.acknowledged && (
            <div className="mt-2">
              <button
                onClick={onAcknowledge}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Acknowledge
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
