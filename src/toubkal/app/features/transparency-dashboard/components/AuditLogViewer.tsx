/**
 * Audit Log Viewer Component
 * 
 * Real-time operation log viewer with filtering, search, and categorization.
 */

import React, { useState, useMemo } from 'react'
import { AuditLogEntry, LogFilter, AuditLogViewerProps } from '../types/TransparencyTypes'

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ 
  logs, 
  onRefresh,
  className = '' 
}) => {
  const [filter, setFilter] = useState<LogFilter>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'timestamp' | 'category' | 'eventType'>('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filter and search logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Category filter
      if (filter.category && log.category !== filter.category) {
        return false
      }

      // Event type filter
      if (filter.eventType && log.eventType !== filter.eventType) {
        return false
      }

      // Success filter
      if (filter.successOnly && !log.details.success) {
        return false
      }

      // Search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          log.details.action.toLowerCase().includes(searchLower) ||
          log.eventType.toLowerCase().includes(searchLower) ||
          log.category.toLowerCase().includes(searchLower) ||
          (log.details.resource && log.details.resource.toLowerCase().includes(searchLower))
        
        if (!matchesSearch) {
          return false
        }
      }

      // Date range filter
      if (filter.dateRange) {
        const logDate = new Date(log.timestamp)
        const startDate = new Date(filter.dateRange.start)
        const endDate = new Date(filter.dateRange.end)
        
        if (logDate < startDate || logDate > endDate) {
          return false
        }
      }

      return true
    })
  }, [logs, filter, searchTerm])

  // Sort logs
  const sortedLogs = useMemo(() => {
    return [...filteredLogs].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          break
        case 'category':
          comparison = a.category.localeCompare(b.category)
          break
        case 'eventType':
          comparison = a.eventType.localeCompare(b.eventType)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [filteredLogs, sortBy, sortOrder])

  const getCategoryColor = (category: string) => {
    const colors = {
      network: 'bg-blue-100 text-blue-800',
      ai: 'bg-purple-100 text-purple-800',
      consent: 'bg-green-100 text-green-800',
      privacy: 'bg-yellow-100 text-yellow-800',
      system: 'bg-gray-100 text-gray-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getEventTypeIcon = (eventType: string) => {
    const icons = {
      AI_QUERY: '🤖',
      CONSENT_DECISION: '✅',
      NETWORK_REQUEST: '🌐',
      PRIVACY_ACTION: '🔒',
      SYSTEM_EVENT: '⚙️'
    }
    return icons[eventType as keyof typeof icons] || '📝'
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A'
    return `${duration}ms`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search operations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filter.category || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value as any || undefined }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="network">Network</option>
              <option value="ai">AI</option>
              <option value="consent">Consent</option>
              <option value="privacy">Privacy</option>
              <option value="system">System</option>
            </select>

            <select
              value={filter.eventType || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, eventType: e.target.value || undefined }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Events</option>
              <option value="AI_QUERY">AI Query</option>
              <option value="CONSENT_DECISION">Consent Decision</option>
              <option value="NETWORK_REQUEST">Network Request</option>
              <option value="PRIVACY_ACTION">Privacy Action</option>
              <option value="SYSTEM_EVENT">System Event</option>
            </select>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filter.successOnly || false}
                onChange={(e) => setFilter(prev => ({ ...prev, successOnly: e.target.checked || undefined }))}
                className="mr-2"
              />
              Success only
            </label>
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="timestamp">Time</option>
              <option value="category">Category</option>
              <option value="eventType">Event Type</option>
            </select>

            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-blue-600">{logs.length}</div>
          <div className="text-sm text-gray-600">Total Operations</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-green-600">
            {logs.filter(log => log.details.success).length}
          </div>
          <div className="text-sm text-gray-600">Successful</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-red-600">
            {logs.filter(log => !log.details.success).length}
          </div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-purple-600">{filteredLogs.length}</div>
          <div className="text-sm text-gray-600">Filtered</div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Operation Logs</h3>
          <p className="text-sm text-gray-600">
            Showing {sortedLogs.length} of {logs.length} operations
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {sortedLogs.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No operations found matching your criteria.
            </div>
          ) : (
            sortedLogs.map((log) => (
              <div key={log.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg">{getEventTypeIcon(log.eventType)}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(log.category)}`}>
                        {log.category}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {log.eventType}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${log.details.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </div>
                    
                    <div className="text-sm text-gray-900 mb-1">
                      {log.details.action}
                    </div>
                    
                    {log.details.resource && (
                      <div className="text-sm text-gray-600 mb-1">
                        Resource: {log.details.resource}
                      </div>
                    )}
                    
                    {log.details.dataAccessed && log.details.dataAccessed.length > 0 && (
                      <div className="text-sm text-gray-600 mb-1">
                        Data accessed: {log.details.dataAccessed.join(', ')}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatTimestamp(log.timestamp)}</span>
                      {log.details.duration && (
                        <span>Duration: {formatDuration(log.details.duration)}</span>
                      )}
                      {log.details.consentRequired && (
                        <span className="text-yellow-600">
                          Consent: {log.details.consentGranted ? 'Granted' : 'Denied'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        // TODO: Implement log details modal
                        console.log('View details for log:', log.id)
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}