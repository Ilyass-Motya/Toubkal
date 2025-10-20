/**
 * Consent Page Component (Consent History)
 *
 * Main consent page accessible via toubkal://consent
 * Provides consent decision history with Ed25519 signature verification and export functionality.
 */

import React, { useState, useEffect, useMemo } from 'react'
// import { INTERNAL_PAGES } from '@/constants/url-schemes'

interface ConsentDecision {
  id: string
  timestamp: Date
  consentType:
    | 'analytics'
    | 'cookies'
    | 'location'
    | 'camera'
    | 'microphone'
    | 'notifications'
    | 'ai_processing'
    | 'data_collection'
  action: 'granted' | 'denied' | 'revoked'
  reason?: string
  signature: string
  verified: boolean
  dataRetention?: number // days
  thirdParties?: string[]
  previousDecision?: {
    action: 'granted' | 'denied'
    timestamp: Date
  }
}

interface ConsentSnapshot {
  id: string
  timestamp: Date
  decisions: ConsentDecision[]
  signature: string
  verified: boolean
  description: string
}

interface ConsentPageProps {
  initialFilter?: string
}

export const ConsentPage: React.FC<ConsentPageProps> = ({ initialFilter = 'all' }) => {
  const [decisions, setDecisions] = useState<ConsentDecision[]>([])
  const [snapshots, setSnapshots] = useState<ConsentSnapshot[]>([])
  const [filteredDecisions, setFilteredDecisions] = useState<ConsentDecision[]>([])
  const [filter, setFilter] = useState(initialFilter)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json')
  const [error, setError] = useState<string | null>(null)

  // Mock data for demonstration
  const mockDecisions: ConsentDecision[] = useMemo(
    () => [
      {
        id: '1',
        timestamp: new Date('2025-01-18T10:30:00Z'),
        consentType: 'analytics',
        action: 'granted',
        reason: 'User wants to help improve the browser',
        signature:
          'ed25519:abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890abcdef1234567890',
        verified: true,
        dataRetention: 365,
        thirdParties: ['Google Analytics', 'Mixpanel'],
      },
      {
        id: '2',
        timestamp: new Date('2025-01-18T10:25:00Z'),
        consentType: 'cookies',
        action: 'denied',
        reason: 'User prefers privacy-first browsing',
        signature:
          'ed25519:def456ghi789jkl012mno345pqr678stu901vwx234yz567890abcdef1234567890abc123',
        verified: true,
        dataRetention: 0,
      },
      {
        id: '3',
        timestamp: new Date('2025-01-18T10:20:00Z'),
        consentType: 'ai_processing',
        action: 'granted',
        reason: 'User wants AI assistance features',
        signature:
          'ed25519:ghi789jkl012mno345pqr678stu901vwx234yz567890abcdef1234567890abc123def456',
        verified: true,
        dataRetention: 30,
        thirdParties: ['Ollama (Local)'],
      },
      {
        id: '4',
        timestamp: new Date('2025-01-18T10:15:00Z'),
        consentType: 'location',
        action: 'denied',
        reason: 'User does not want location tracking',
        signature:
          'ed25519:jkl012mno345pqr678stu901vwx234yz567890abcdef1234567890abc123def456ghi789',
        verified: true,
        dataRetention: 0,
      },
      {
        id: '5',
        timestamp: new Date('2025-01-18T10:10:00Z'),
        consentType: 'notifications',
        action: 'granted',
        reason: 'User wants to receive important updates',
        signature:
          'ed25519:mno345pqr678stu901vwx234yz567890abcdef1234567890abc123def456ghi789jkl012',
        verified: true,
        dataRetention: 90,
      },
      {
        id: '6',
        timestamp: new Date('2025-01-18T09:45:00Z'),
        consentType: 'analytics',
        action: 'revoked',
        reason: 'User changed their mind about analytics',
        signature:
          'ed25519:pqr678stu901vwx234yz567890abcdef1234567890abc123def456ghi789jkl012mno345',
        verified: true,
        dataRetention: 0,
        previousDecision: {
          action: 'granted',
          timestamp: new Date('2025-01-15T14:30:00Z'),
        },
      },
    ],
    []
  )

  const mockSnapshots: ConsentSnapshot[] = useMemo(
    () => [
      {
        id: 'snapshot-1',
        timestamp: new Date('2025-01-18T10:30:00Z'),
        decisions: mockDecisions.slice(0, 5),
        signature:
          'ed25519:snapshot1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        verified: true,
        description: 'Current consent state as of January 18, 2025',
      },
      {
        id: 'snapshot-2',
        timestamp: new Date('2025-01-15T14:30:00Z'),
        decisions: mockDecisions.slice(0, 4),
        signature:
          'ed25519:snapshot2345678901bcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
        verified: true,
        description: 'Consent state before analytics revocation',
      },
    ],
    [mockDecisions]
  )

  // Load data on component mount
  useEffect(() => {
    setDecisions(mockDecisions)
    setSnapshots(mockSnapshots)
  }, [mockDecisions, mockSnapshots])

  // Filter decisions
  useEffect(() => {
    let filtered = decisions

    // Apply action filter
    if (filter !== 'all') {
      filtered = filtered.filter((decision) => decision.action === filter)
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (decision) =>
          decision.consentType.toLowerCase().includes(term) ||
          (decision.reason != null && decision.reason.toLowerCase().includes(term)) ||
          decision.action.toLowerCase().includes(term)
      )
    }

    setFilteredDecisions(filtered)
  }, [decisions, filter, searchTerm])

  const getConsentTypeColor = (type: string) => {
    switch (type) {
      case 'analytics':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'cookies':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'location':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'camera':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'microphone':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'notifications':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'ai_processing':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
      case 'data_collection':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getConsentTypeIcon = (type: string) => {
    switch (type) {
      case 'analytics':
        return '📊'
      case 'cookies':
        return '🍪'
      case 'location':
        return '📍'
      case 'camera':
        return '📷'
      case 'microphone':
        return '🎤'
      case 'notifications':
        return '🔔'
      case 'ai_processing':
        return '🤖'
      case 'data_collection':
        return '📋'
      default:
        return '📝'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'granted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'denied':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'revoked':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'granted':
        return '✅'
      case 'denied':
        return '❌'
      case 'revoked':
        return '🔄'
      default:
        return '❓'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    }).format(timestamp)
  }

  const formatSignature = (signature: string) => {
    return `${signature.substring(0, 16)}...${signature.substring(signature.length - 16)}`
  }

  const handleExport = async () => {
    setIsExporting(true)
    setError(null)

    try {
      // Simulate export delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const exportData = {
        exportedAt: new Date().toISOString(),
        totalDecisions: decisions.length,
        decisions: decisions.map((decision) => ({
          ...decision,
          timestamp: decision.timestamp.toISOString(),
          previousDecision: decision.previousDecision
            ? {
                ...decision.previousDecision,
                timestamp: decision.previousDecision.timestamp.toISOString(),
              }
            : undefined,
        })),
        snapshots: snapshots.map((snapshot) => ({
          ...snapshot,
          timestamp: snapshot.timestamp.toISOString(),
          decisions: snapshot.decisions.map((decision) => ({
            ...decision,
            timestamp: decision.timestamp.toISOString(),
          })),
        })),
      }

      if (exportFormat === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `toubkal-consent-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      } else if (exportFormat === 'csv') {
        const csvContent = [
          'ID,Timestamp,Consent Type,Action,Reason,Data Retention (Days),Third Parties,Signature,Verified',
          ...decisions.map((decision) =>
            [
              decision.id,
              decision.timestamp.toISOString(),
              decision.consentType,
              decision.action,
              decision.reason ?? '',
              decision.dataRetention ?? 0,
              decision.thirdParties?.join(';') ?? '',
              decision.signature,
              decision.verified,
            ]
              .map((field) => `"${field}"`)
              .join(',')
          ),
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `toubkal-consent-export-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }

      // In a real implementation, PDF generation would be more complex
      console.log(`Exported consent data in ${exportFormat.toUpperCase()} format`)
    } catch (err) {
      console.error('[ConsentPage.handleExport] Failed:', err)
      setError('Failed to export consent data')
    } finally {
      setIsExporting(false)
    }
  }

  const handleCreateSnapshot = () => {
    try {
      const newSnapshot: ConsentSnapshot = {
        id: `snapshot-${Date.now()}`,
        timestamp: new Date(),
        decisions: [...decisions],
        signature: `ed25519:snapshot${Date.now()}${Math.random().toString(36).substring(2)}`,
        verified: true,
        description: `Manual snapshot created on ${new Date().toLocaleDateString()}`,
      }

      setSnapshots((prev) => [newSnapshot, ...prev])
    } catch (err) {
      console.error('[ConsentPage.handleCreateSnapshot] Failed:', err)
      setError('Failed to create snapshot')
    }
  }

  const selectedSnapshotData =
    selectedSnapshot != null ? snapshots.find((s) => s.id === selectedSnapshot) : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Consent History</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track and manage your privacy consent decisions with cryptographic verification
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Consent Decisions */}
          <div className="lg:col-span-2">
            {/* Filters and Search */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Action
                  </label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="all">All Actions</option>
                    <option value="granted">Granted</option>
                    <option value="denied">Denied</option>
                    <option value="revoked">Revoked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Decisions
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by type, reason, or action..."
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Total Decisions: {decisions.length}</span>
                <span>Granted: {decisions.filter((d) => d.action === 'granted').length}</span>
                <span>Denied: {decisions.filter((d) => d.action === 'denied').length}</span>
                <span>Revoked: {decisions.filter((d) => d.action === 'revoked').length}</span>
                <span>Verified: {decisions.filter((d) => d.verified).length}</span>
              </div>
            </div>

            {/* Consent Decisions Timeline */}
            <div className="space-y-4">
              {filteredDecisions.map((decision) => (
                <div key={decision.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">{getConsentTypeIcon(decision.consentType)}</span>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                            {decision.consentType.replace('_', ' ')}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatTimestamp(decision.timestamp)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(decision.action)}`}
                        >
                          <span className="mr-1">{getActionIcon(decision.action)}</span>
                          {decision.action}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConsentTypeColor(decision.consentType)}`}
                        >
                          {decision.consentType.replace('_', ' ')}
                        </span>
                      </div>

                      {decision.reason != null && decision.reason.length > 0 && (
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                          <strong>Reason:</strong> {decision.reason}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Data Retention:</span>
                          <span className="ml-2 font-medium">
                            {decision.dataRetention != null && decision.dataRetention > 0
                              ? `${decision.dataRetention} days`
                              : 'No retention'}
                          </span>
                        </div>
                        {decision.thirdParties != null && decision.thirdParties.length > 0 && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Third Parties:</span>
                            <span className="ml-2 font-medium">
                              {decision.thirdParties.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      {decision.previousDecision && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Previous Decision:</strong> {decision.previousDecision.action}{' '}
                            on {formatTimestamp(decision.previousDecision.timestamp)}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              decision.verified
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}
                          >
                            {decision.verified ? '✓ Verified' : '✗ Invalid'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {formatSignature(decision.signature)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredDecisions.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No consent decisions found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm
                      ? 'Try adjusting your search terms'
                      : 'No decisions match the current filter'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Snapshots and Export */}
          <div className="lg:col-span-1 space-y-6">
            {/* Export Controls */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Export Data
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Export Format
                  </label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv' | 'pdf')}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    void handleExport()
                  }}
                  disabled={isExporting}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? 'Exporting...' : 'Export Consent Data'}
                </button>
              </div>
            </div>

            {/* Snapshots */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Snapshots</h3>
                <button
                  onClick={handleCreateSnapshot}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50"
                >
                  Create Snapshot
                </button>
              </div>

              <div className="space-y-3">
                {snapshots.map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSnapshot === snapshot.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedSnapshot(snapshot.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatTimestamp(snapshot.timestamp)}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          snapshot.verified
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                      >
                        {snapshot.verified ? '✓' : '✗'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {snapshot.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {snapshot.decisions.length} decisions
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Snapshot Details */}
            {selectedSnapshotData && (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Snapshot Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Created:</span>
                    <span className="font-medium">
                      {formatTimestamp(selectedSnapshotData.timestamp)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Decisions:</span>
                    <span className="font-medium">{selectedSnapshotData.decisions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Verified:</span>
                    <span
                      className={`font-medium ${selectedSnapshotData.verified ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {selectedSnapshotData.verified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="text-gray-500 dark:text-gray-400">Signature:</span>
                    <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                      {formatSignature(selectedSnapshotData.signature)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {error != null && error.length > 0 && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConsentPage
