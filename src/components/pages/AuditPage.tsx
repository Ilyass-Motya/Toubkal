/**
 * Audit Page Component (Transparency Dashboard)
 * 
 * Main audit page accessible via toubkal://audit
 * Provides real-time audit log viewer with filtering and search capabilities.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { INTERNAL_PAGES } from '@/constants/url-schemes'

interface AuditLogEntry {
  id: string
  timestamp: Date
  operationType: 'ai_query' | 'network_call' | 'plugin_action' | 'consent_decision' | 'privacy_action'
  description: string
  details: Record<string, unknown>
  signature: string
  verified: boolean
}

interface AuditPageProps {
  initialFilter?: string
}

export const AuditPage: React.FC<AuditPageProps> = ({ 
  initialFilter = 'all' 
}) => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([])
  const [filter, setFilter] = useState(initialFilter)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const logsPerPage = 50

  // Mock data for demonstration - in real implementation, this would come from Mojo IPC
  const mockAuditLogs: AuditLogEntry[] = [
    {
      id: '1',
      timestamp: new Date('2025-01-18T10:30:00Z'),
      operationType: 'ai_query',
      description: 'AI query processed using Ollama Llama 3.2',
      details: {
        model: 'llama3.2:latest',
        tokens: 150,
        latency: 1200,
        local: true
      },
      signature: 'ed25519:abc123...',
      verified: true
    },
    {
      id: '2',
      timestamp: new Date('2025-01-18T10:25:00Z'),
      operationType: 'consent_decision',
      description: 'User granted consent for data collection',
      details: {
        consentType: 'analytics',
        granted: true,
        timestamp: '2025-01-18T10:25:00Z'
      },
      signature: 'ed25519:def456...',
      verified: true
    },
    {
      id: '3',
      timestamp: new Date('2025-01-18T10:20:00Z'),
      operationType: 'network_call',
      description: 'HTTPS request to api.example.com',
      details: {
        url: 'https://api.example.com/data',
        method: 'GET',
        status: 200,
        encrypted: true
      },
      signature: 'ed25519:ghi789...',
      verified: true
    },
    {
      id: '4',
      timestamp: new Date('2025-01-18T10:15:00Z'),
      operationType: 'plugin_action',
      description: 'MCP server executed: file-reader',
      details: {
        server: 'file-reader',
        action: 'read_file',
        file: '/path/to/document.pdf',
        local: true
      },
      signature: 'ed25519:jkl012...',
      verified: true
    },
    {
      id: '5',
      timestamp: new Date('2025-01-18T10:10:00Z'),
      operationType: 'privacy_action',
      description: 'Privacy settings updated',
      details: {
        setting: 'tracking_protection',
        value: 'strict',
        previousValue: 'standard'
      },
      signature: 'ed25519:mno345...',
      verified: true
    }
  ]

  // Load audit logs (mock implementation)
  const loadAuditLogs = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setAuditLogs(mockAuditLogs)
    } catch (err) {
      console.error('[AuditPage.loadAuditLogs] Failed:', err)
      setError('Failed to load audit logs')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Filter and search logs
  useEffect(() => {
    let filtered = auditLogs

    // Apply operation type filter
    if (filter !== 'all') {
      filtered = filtered.filter(log => log.operationType === filter)
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(log => 
        log.description.toLowerCase().includes(term) ||
        log.operationType.toLowerCase().includes(term)
      )
    }

    setFilteredLogs(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }, [auditLogs, filter, searchTerm])

  // Load logs on component mount
  useEffect(() => {
    loadAuditLogs()
  }, [loadAuditLogs])

  const getOperationTypeColor = (type: string) => {
    switch (type) {
      case 'ai_query': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'network_call': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'plugin_action': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'consent_decision': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'privacy_action': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getOperationTypeIcon = (type: string) => {
    switch (type) {
      case 'ai_query': return '🤖'
      case 'network_call': return '🌐'
      case 'plugin_action': return '🔌'
      case 'consent_decision': return '✅'
      case 'privacy_action': return '🔒'
      default: return '📝'
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
      timeZoneName: 'short'
    }).format(timestamp)
  }

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage)
  const startIndex = (currentPage - 1) * logsPerPage
  const endIndex = startIndex + logsPerPage
  const currentLogs = filteredLogs.slice(startIndex, endIndex)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading audit logs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Audit Logs</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadAuditLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Transparency Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Real-time audit log of all Toubkal Browser operations
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Operation Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Operation Type
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Operations</option>
                <option value="ai_query">AI Queries</option>
                <option value="network_call">Network Calls</option>
                <option value="plugin_action">Plugin Actions</option>
                <option value="consent_decision">Consent Decisions</option>
                <option value="privacy_action">Privacy Actions</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Logs
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search descriptions..."
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Total Logs: {auditLogs.length}</span>
            <span>Filtered: {filteredLogs.length}</span>
            <span>Verified: {filteredLogs.filter(log => log.verified).length}</span>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Operation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Signature
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOperationTypeColor(log.operationType)}`}>
                        <span className="mr-1">{getOperationTypeIcon(log.operationType)}</span>
                        {log.operationType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <details className="cursor-pointer">
                        <summary className="hover:text-gray-700 dark:hover:text-gray-300">
                          View Details
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          log.verified 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {log.verified ? '✓ Verified' : '✗ Invalid'}
                        </span>
                        <span className="ml-2 text-gray-500 dark:text-gray-400 font-mono text-xs">
                          {log.signature.substring(0, 16)}...
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, filteredLogs.length)}</span> of{' '}
                    <span className="font-medium">{filteredLogs.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-300'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export and Actions */}
        <div className="mt-6 flex justify-end space-x-4">
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            Export JSON
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            Export CSV
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
            Refresh Logs
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuditPage
