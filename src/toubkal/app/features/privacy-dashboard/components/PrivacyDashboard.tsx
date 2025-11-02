/**
 * Privacy Dashboard Component
 * 
 * Displays telemetry status and privacy information
 * AC3: Privacy dashboard shows "Telemetry: Disabled (Zero Data Collected)"
 * Following Toubkal coding rules: PascalCase for components
 */

import React, { useState, useEffect } from 'react'
import type { PrivacyDashboardProps } from '@/features/privacy-dashboard/types/PrivacyDashboardTypes'
import type { PrivacyDashboardState } from '@/features/privacy-dashboard/types/TelemetryTypes'
import { telemetryManager } from '@/features/privacy-dashboard/services/telemetry-manager'

export const PrivacyDashboard: React.FC<PrivacyDashboardProps> = ({
  onConsentHistoryClick,
  onAuditLogsClick,
  onSettingsClick
}) => {
  const [state, setState] = useState<PrivacyDashboardState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadPrivacyState()
  }, [])

  const loadPrivacyState = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const result = await telemetryManager.getPrivacyDashboardState()
      
      if (result.success) {
        setState(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error('[PrivacyDashboard] Failed to load state:', err)
      setError(err instanceof Error ? err.message : 'Failed to load privacy state')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'disabled':
        return 'text-green-600 bg-green-100'
      case 'enabled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-yellow-600 bg-yellow-100'
    }
  }

  const getDataCollectedText = (dataCollected: string): string => {
    switch (dataCollected) {
      case 'zero':
        return 'Zero Data Collected'
      case 'minimal':
        return 'Minimal Data Collected'
      case 'standard':
        return 'Standard Data Collected'
      default:
        return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error != null && error.length > 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="text-red-600 mb-4">
          <h3 className="text-lg font-semibold">Privacy Dashboard Error</h3>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={() => { void loadPrivacyState() }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <p className="text-gray-500">No privacy data available</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy Dashboard</h2>
        <p className="text-gray-600">
          Monitor your privacy settings and data collection status
        </p>
      </div>

      {/* Telemetry Status - AC3 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Telemetry Status</h3>
        <div className="flex items-center space-x-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(state.telemetryStatus)}`}
          >
            Telemetry: {state.telemetryStatus === 'disabled' ? 'Disabled' : 'Enabled'}
          </span>
          <span className="text-sm text-gray-600">
            ({getDataCollectedText(state.dataCollected)})
          </span>
        </div>
        {state.telemetryStatus === 'disabled' && (
          <p className="text-sm text-green-600 mt-2">
            ✓ No data is being sent to external servers
          </p>
        )}
      </div>

      {/* Privacy Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Consent Decisions</h4>
          <p className="text-2xl font-bold text-gray-900">{state.consentCount}</p>
          <p className="text-xs text-gray-500">Total recorded</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Requests Blocked</h4>
          <p className="text-2xl font-bold text-gray-900">{state.networkRequestsBlocked}</p>
          <p className="text-xs text-gray-500">Network requests</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Last Audit Log</h4>
          <p className="text-sm font-bold text-gray-900">
            {state.lastAuditLog > 0 
              ? new Date(state.lastAuditLog).toLocaleDateString()
              : 'Never'
            }
          </p>
          <p className="text-xs text-gray-500">Most recent entry</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onConsentHistoryClick}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          View Consent History
        </button>
        <button
          onClick={onAuditLogsClick}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          View Audit Logs
        </button>
        <button
          onClick={onSettingsClick}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Privacy Settings
        </button>
        <button
          onClick={() => { void loadPrivacyState() }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Privacy Notice */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Privacy Notice</h4>
        <p className="text-sm text-blue-800">
          Toubkal Browser is designed with privacy-first principles. By default, no telemetry 
          data is collected or sent to external servers. All AI operations run locally on your 
          device unless you explicitly consent to cloud processing.
        </p>
      </div>
    </div>
  )
}

export default PrivacyDashboard
