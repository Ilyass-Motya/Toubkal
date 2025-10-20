import React, { useState, useEffect, useCallback } from 'react'
import { getConsentManager } from '@/core/consent/consent-manager'

interface ConsentBannerProps {
  actionType: 'AI_QUERY' | 'DATA_COLLECTION'
  onGrant: () => void
  onDeny: () => void
}

export const ConsentBanner: React.FC<ConsentBannerProps> = ({ actionType, onGrant, onDeny }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasConsent, setHasConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const consentManager = getConsentManager()

  const checkConsent = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const consent = await consentManager.hasConsent(actionType, 'current-user')
      setHasConsent(consent)
    } catch (err) {
      console.error('[ConsentBanner] Failed to check consent:', err)
      setError('Error checking consent status')
    } finally {
      setIsLoading(false)
    }
  }, [actionType, consentManager])

  useEffect(() => {
    void checkConsent()
  }, [checkConsent])

  const handleGrant = async () => {
    try {
      await consentManager.requestConsent({
        actionType,
        userId: 'current-user',
        context: 'banner-request',
        timestamp: Date.now(),
      })
      setHasConsent(true)
      onGrant()
    } catch (err) {
      console.error('[ConsentBanner] Failed to grant consent:', err)
      setError('Failed to grant consent')
    }
  }

  const handleDeny = () => {
    onDeny()
  }

  const handleRetry = () => {
    setError(null)
    void checkConsent()
  }

  const getMessage = () => {
    switch (actionType) {
      case 'AI_QUERY':
        return 'AI query requires consent'
      case 'DATA_COLLECTION':
        return 'Data collection requires consent'
      default:
        return 'Action requires consent'
    }
  }

  // Don't show banner if consent already granted
  if (hasConsent) {
    return null
  }

  // Show loading state
  if (isLoading) {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 shadow-lg"
        role="banner"
        aria-live="polite"
        aria-label="Consent request"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <span>Loading consent status...</span>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error !== null) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex-1">
            <p className="text-lg font-medium">Error checking consent status</p>
            <p className="text-sm opacity-90 mt-1">
              Please try again or contact support if the problem persists.
            </p>
          </div>
          <div className="flex space-x-3 ml-4">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-white text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show consent banner
  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 shadow-lg"
      role="banner"
      aria-live="polite"
      aria-label="Consent request"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex-1">
          <p className="text-lg font-medium">{getMessage()}</p>
          <p className="text-sm opacity-90 mt-1">
            This action requires your explicit consent. Your privacy and data control are important
            to us.
          </p>
        </div>
        <div className="flex space-x-3 ml-4">
          <button
            onClick={handleDeny}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Deny
          </button>
          <button
            onClick={() => void handleGrant()}
            className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            Grant Consent
          </button>
        </div>
      </div>
    </div>
  )
}
