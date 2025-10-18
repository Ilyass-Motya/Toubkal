/**
 * Consent Prompt Component
 * 
 * Displays consent request UI for future telemetry operations
 * AC4: Consent prompt required for any future telemetry
 * Following Toubkal coding rules: PascalCase for components
 */

import React, { useState } from 'react'
import type { ConsentPromptProps } from '@/types/TelemetryTypes'

export const ConsentPrompt: React.FC<ConsentPromptProps> = ({
  actionType,
  dataDisclosed,
  purpose,
  onGrant,
  onDeny,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleGrant = async (): Promise<void> => {
    try {
      setIsProcessing(true)
      await onGrant()
      setIsVisible(false)
    } catch (error) {
      console.error('[ConsentPrompt] Grant failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeny = async (): Promise<void> => {
    try {
      setIsProcessing(true)
      await onDeny()
      setIsVisible(false)
    } catch (error) {
      console.error('[ConsentPrompt] Deny failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = (): void => {
    setIsVisible(false)
    onClose()
  }

  const getActionTypeDisplay = (type: string): string => {
    switch (type) {
      case 'AI_QUERY_CLOUD':
        return 'Cloud AI Query'
      case 'TELEMETRY_ENABLE':
        return 'Enable Telemetry'
      case 'ANALYTICS_COLLECT':
        return 'Analytics Collection'
      case 'CRASH_REPORT':
        return 'Crash Report'
      default:
        return type.replace(/_/g, ' ').toLowerCase()
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Consent Required
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isProcessing}
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h4 className="text-md font-medium text-gray-900 mb-2">
              {getActionTypeDisplay(actionType)}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              {purpose}
            </p>
          </div>

          {/* Data Disclosure */}
          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Data that will be accessed/sent:
            </h5>
            <ul className="space-y-1">
              {dataDisclosed.map((item, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy Notice */}
          <div className="mb-6 p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.726-1.36 3.491 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  Privacy Notice
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  By default, Toubkal Browser collects zero data. This action requires 
                  explicit consent and will be logged in your audit trail.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleGrant}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Grant Consent'}
            </button>
            <button
              onClick={handleDeny}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Deny'}
            </button>
          </div>

          {/* Additional Options */}
          <div className="mt-4 text-center">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
            >
              Cancel (no action taken)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConsentPrompt
