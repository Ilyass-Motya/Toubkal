import React, { useState, useEffect } from 'react'
import { Shield, Activity, Clock, CheckCircle, AlertCircle, XCircle, Search, Download, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

// Types for audit log entries
interface AuditLogEntry {
  id: string
  timestamp: Date
  eventType: string
  description: string
  userId: string
  signature: string
  verified: boolean
}

// Mock data for development
const mockAuditLogs: AuditLogEntry[] = [
  {
    id: 'audit_001',
    timestamp: new Date('2025-10-20T10:30:00Z'),
    eventType: 'PRIVACY_SETTINGS_CHANGED',
    description: 'Fingerprinting protection enabled',
    userId: 'user_123',
    signature: 'a1b2c3d4e5f6...',
    verified: true
  },
  {
    id: 'audit_002',
    timestamp: new Date('2025-10-20T09:15:00Z'),
    eventType: 'CONSENT_DECISION_MADE',
    description: 'User granted consent for analytics',
    userId: 'user_123',
    signature: 'b2c3d4e5f6a1...',
    verified: true
  },
  {
    id: 'audit_003',
    timestamp: new Date('2025-10-20T08:45:00Z'),
    eventType: 'DATA_ACCESS_REQUESTED',
    description: 'AI service requested user browsing data',
    userId: 'user_123',
    signature: 'c3d4e5f6a1b2...',
    verified: false
  },
  {
    id: 'audit_004',
    timestamp: new Date('2025-10-19T16:20:00Z'),
    eventType: 'TRACKER_BLOCKED',
    description: 'Blocked Google Analytics tracker on example.com',
    userId: 'user_123',
    signature: 'd4e5f6a1b2c3...',
    verified: true
  },
  {
    id: 'audit_005',
    timestamp: new Date('2025-10-19T14:10:00Z'),
    eventType: 'PRIVACY_SETTINGS_CHANGED',
    description: 'Enhanced privacy mode disabled',
    userId: 'user_123',
    signature: 'e5f6a1b2c3d4...',
    verified: true
  }
]

const App: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState<'timestamp' | 'eventType'>('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    // Simulate loading audit logs
    const loadAuditLogs = async () => {
      setLoading(true)
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAuditLogs(mockAuditLogs)
      setFilteredLogs(mockAuditLogs)
      setLoading(false)
    }

    void loadAuditLogs()
  }, [])

  useEffect(() => {
    // Filter and sort logs
    let filtered = auditLogs.filter(log => {
      const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.eventType.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterType === 'all' || log.eventType === filterType
      return matchesSearch && matchesFilter
    })

    // Sort logs
    filtered.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'timestamp') {
        comparison = a.timestamp.getTime() - b.timestamp.getTime()
      } else {
        comparison = a.eventType.localeCompare(b.eventType)
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredLogs(filtered)
  }, [auditLogs, searchTerm, filterType, sortBy, sortOrder])

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'PRIVACY_SETTINGS_CHANGED':
        return <Shield className="w-4 h-4" />
      case 'CONSENT_DECISION_MADE':
        return <CheckCircle className="w-4 h-4" />
      case 'DATA_ACCESS_REQUESTED':
        return <Activity className="w-4 h-4" />
      case 'TRACKER_BLOCKED':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'PRIVACY_SETTINGS_CHANGED':
        return 'text-blue-600'
      case 'CONSENT_DECISION_MADE':
        return 'text-green-600'
      case 'DATA_ACCESS_REQUESTED':
        return 'text-yellow-600'
      case 'TRACKER_BLOCKED':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getVerificationStatus = (verified: boolean) => {
    return verified ? (
      <span className="badge badge-success">Verified</span>
    ) : (
      <span className="badge badge-danger">Unverified</span>
    )
  }

  const exportAuditLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `toubkal-audit-logs-${format(new Date(), 'yyyy-MM-dd')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading audit logs...</h2>
          <p className="text-gray-500">Please wait while we fetch your privacy audit data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transparency Dashboard</h1>
              <p className="text-gray-600 mt-1">Complete audit trail of your privacy decisions and data access</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportAuditLogs}
                className="btn btn-secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{auditLogs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">
                  {auditLogs.filter(log => log.verified).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unverified</p>
                <p className="text-2xl font-bold text-gray-900">
                  {auditLogs.filter(log => !log.verified).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trackers Blocked</p>
                <p className="text-2xl font-bold text-gray-900">
                  {auditLogs.filter(log => log.eventType === 'TRACKER_BLOCKED').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search audit logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Events</option>
                <option value="PRIVACY_SETTINGS_CHANGED">Privacy Settings</option>
                <option value="CONSENT_DECISION_MADE">Consent Decisions</option>
                <option value="DATA_ACCESS_REQUESTED">Data Access</option>
                <option value="TRACKER_BLOCKED">Tracker Blocks</option>
              </select>
              
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-')
                  setSortBy(sort as 'timestamp' | 'eventType')
                  setSortOrder(order as 'asc' | 'desc')
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="timestamp-desc">Newest First</option>
                <option value="timestamp-asc">Oldest First</option>
                <option value="eventType-asc">Event Type A-Z</option>
                <option value="eventType-desc">Event Type Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audit Logs List */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Audit Log Entries</h2>
          
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getEventTypeColor(log.eventType)}`}>
                        {getEventTypeIcon(log.eventType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{log.description}</h3>
                          {getVerificationStatus(log.verified)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Event:</span> {log.eventType}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {format(log.timestamp, 'MMM dd, yyyy HH:mm:ss')}
                          </span>
                          <span>ID: {log.id}</span>
                          <span>User: {log.userId}</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                            Signature: {log.signature}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container py-6">
          <div className="text-center text-gray-500">
            <p>Toubkal Browser - Privacy-First Transparency Dashboard</p>
            <p className="text-sm mt-1">
              All audit logs are cryptographically signed and tamper-evident.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
