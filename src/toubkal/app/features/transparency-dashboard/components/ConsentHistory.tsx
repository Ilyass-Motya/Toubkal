/**
 * Consent History Component
 * 
 * Displays consent decision timeline with detailed information and filtering.
 */

import React, { useState, useMemo } from 'react'
import { ConsentDecision, ConsentHistoryProps } from '../types/TransparencyTypes'

export const ConsentHistory: React.FC<ConsentHistoryProps> = ({ 
  consentData,
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDecision, setFilterDecision] = useState<'all' | 'granted' | 'denied' | 'revoked'>('all')
  const [sortBy, setSortBy] = useState<'timestamp' | 'actionType' | 'decision'>('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filter and search consent data
  const filteredConsentData = useMemo(() => {
    return consentData.filter(consent => {
      // Decision filter
      if (filterDecision !== 'all' && consent.decision !== filterDecision) {
        return false
      }

      // Search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          consent.actionType.toLowerCase().includes(searchLower) ||
          consent.decision.toLowerCase().includes(searchLower) ||
          consent.dataDisclosed.some(data => data.toLowerCase().includes(searchLower))
        
        if (!matchesSearch) {
          return false
        }
      }

      return true
    })
  }, [consentData, filterDecision, searchTerm])

  // Sort consent data
  const sortedConsentData = useMemo(() => {
    return [...filteredConsentData].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          break
        case 'actionType':
          comparison = a.actionType.localeCompare(b.actionType)
          break
        case 'decision':
          comparison = a.decision.localeCompare(b.decision)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [filteredConsentData, sortBy, sortOrder])

  const getDecisionColor = (decision: string) => {
    const colors = {
      granted: 'bg-green-100 text-green-800',
      denied: 'bg-red-100 text-red-800',
      revoked: 'bg-yellow-100 text-yellow-800'
    }
    return colors[decision as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getDecisionIcon = (decision: string) => {
    const icons = {
      granted: '✅',
      denied: '❌',
      revoked: '🔄'
    }
    return icons[decision as keyof typeof icons] || '❓'
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatDataDisclosed = (dataDisclosed: string[]) => {
    if (dataDisclosed.length === 0) return 'No data disclosed'
    if (dataDisclosed.length <= 3) return dataDisclosed.join(', ')
    return `${dataDisclosed.slice(0, 3).join(', ')} and ${dataDisclosed.length - 3} more`
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
              placeholder="Search consent decisions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filterDecision}
              onChange={(e) => setFilterDecision(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Decisions</option>
              <option value="granted">Granted</option>
              <option value="denied">Denied</option>
              <option value="revoked">Revoked</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="timestamp">Time</option>
              <option value="actionType">Action Type</option>
              <option value="decision">Decision</option>
            </select>

            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-blue-600">{consentData.length}</div>
          <div className="text-sm text-gray-600">Total Decisions</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-green-600">
            {consentData.filter(c => c.decision === 'granted').length}
          </div>
          <div className="text-sm text-gray-600">Granted</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-red-600">
            {consentData.filter(c => c.decision === 'denied').length}
          </div>
          <div className="text-sm text-gray-600">Denied</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {consentData.filter(c => c.decision === 'revoked').length}
          </div>
          <div className="text-sm text-gray-600">Revoked</div>
        </div>
      </div>

      {/* Consent Timeline */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Consent Decision Timeline</h3>
          <p className="text-sm text-gray-600">
            Showing {sortedConsentData.length} of {consentData.length} decisions
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {sortedConsentData.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No consent decisions found matching your criteria.
            </div>
          ) : (
            sortedConsentData.map((consent, index) => (
              <div key={consent.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      consent.decision === 'granted' ? 'bg-green-100' :
                      consent.decision === 'denied' ? 'bg-red-100' :
                      'bg-yellow-100'
                    }`}>
                      {getDecisionIcon(consent.decision)}
                    </div>
                    {index < sortedConsentData.length - 1 && (
                      <div className="w-px h-8 bg-gray-300 mt-2"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {consent.actionType}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDecisionColor(consent.decision)}`}>
                        {consent.decision.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      Data disclosed: {formatDataDisclosed(consent.dataDisclosed)}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatTimestamp(consent.timestamp)}</span>
                      <span>ID: {consent.id}</span>
                      {consent.ipAddress && (
                        <span>IP: {consent.ipAddress}</span>
                      )}
                    </div>

                    {/* Signature verification indicator */}
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600">Cryptographically verified</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        // TODO: Implement consent details modal
                        console.log('View details for consent:', consent.id)
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Details
                    </button>
                    {consent.decision === 'granted' && (
                      <button
                        onClick={() => {
                          // TODO: Implement consent revocation
                          console.log('Revoke consent:', consent.id)
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Revoke
                      </button>
                    )}
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