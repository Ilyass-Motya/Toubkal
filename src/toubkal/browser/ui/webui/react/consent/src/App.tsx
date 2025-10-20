import React, { useState, useEffect } from 'react'
import { Shield, CheckCircle, XCircle, Clock, Search, Download, RefreshCw, User, Calendar, FileText } from 'lucide-react'
import { format } from 'date-fns'

// Types for consent entries
interface ConsentEntry {
  id: string
  timestamp: Date
  consentType: string
  action: 'granted' | 'denied' | 'withdrawn'
  reason: string
  userId: string
  signature: string
  verified: boolean
}

// Mock data for development
const mockConsentHistory: ConsentEntry[] = [
  {
    id: 'consent_001',
    timestamp: new Date('2025-10-20T10:30:00Z'),
    consentType: 'analytics',
    action: 'granted',
    reason: 'User explicitly granted consent for analytics',
    userId: 'user_123',
    signature: 'a1b2c3d4e5f6...',
    verified: true
  },
  {
    id: 'consent_002',
    timestamp: new Date('2025-10-20T09:15:00Z'),
    consentType: 'cookies',
    action: 'denied',
    reason: 'User denied consent for non-essential cookies',
    userId: 'user_123',
    signature: 'b2c3d4e5f6a1...',
    verified: true
  },
  {
    id: 'consent_003',
    timestamp: new Date('2025-10-19T16:20:00Z'),
    consentType: 'location',
    action: 'granted',
    reason: 'User granted location access for weather service',
    userId: 'user_123',
    signature: 'c3d4e5f6a1b2...',
    verified: true
  },
  {
    id: 'consent_004',
    timestamp: new Date('2025-10-19T14:10:00Z'),
    consentType: 'analytics',
    action: 'withdrawn',
    reason: 'User withdrew previous consent for analytics',
    userId: 'user_123',
    signature: 'd4e5f6a1b2c3...',
    verified: true
  },
  {
    id: 'consent_005',
    timestamp: new Date('2025-10-18T11:45:00Z'),
    consentType: 'marketing',
    action: 'denied',
    reason: 'User denied consent for marketing communications',
    userId: 'user_123',
    signature: 'e5f6a1b2c3d4...',
    verified: true
  },
  {
    id: 'consent_006',
    timestamp: new Date('2025-10-18T08:30:00Z'),
    consentType: 'cookies',
    action: 'granted',
    reason: 'User granted consent for essential cookies only',
    userId: 'user_123',
    signature: 'f6a1b2c3d4e5...',
    verified: false
  }
]

const App: React.FC = () => {
  const [consentHistory, setConsentHistory] = useState<ConsentEntry[]>([])
  const [filteredHistory, setFilteredHistory] = useState<ConsentEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterAction, setFilterAction] = useState('all')
  const [sortBy, setSortBy] = useState<'timestamp' | 'consentType'>('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    // Simulate loading consent history
    const loadConsentHistory = async () => {
      setLoading(true)
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setConsentHistory(mockConsentHistory)
      setFilteredHistory(mockConsentHistory)
      setLoading(false)
    }

    void loadConsentHistory()
  }, [])

  useEffect(() => {
    // Filter and sort history
    let filtered = consentHistory.filter(entry => {
      const matchesSearch = entry.consentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.reason.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || entry.consentType === filterType
      const matchesAction = filterAction === 'all' || entry.action === filterAction
      return matchesSearch && matchesType && matchesAction
    })

    // Sort history
    filtered.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'timestamp') {
        comparison = a.timestamp.getTime() - b.timestamp.getTime()
      } else {
        comparison = a.consentType.localeCompare(b.consentType)
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredHistory(filtered)
  }, [consentHistory, searchTerm, filterType, filterAction, sortBy, sortOrder])

  const getConsentTypeIcon = (consentType: string) => {
    switch (consentType) {
      case 'analytics':
        return <FileText className="w-4 h-4" />
      case 'cookies':
        return <Shield className="w-4 h-4" />
      case 'location':
        return <Clock className="w-4 h-4" />
      case 'marketing':
        return <User className="w-4 h-4" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  const getConsentTypeColor = (consentType: string) => {
    switch (consentType) {
      case 'analytics':
        return 'text-blue-600'
      case 'cookies':
        return 'text-green-600'
      case 'location':
        return 'text-yellow-600'
      case 'marketing':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'granted':
        return <span className="badge badge-success">Granted</span>
      case 'denied':
        return <span className="badge badge-danger">Denied</span>
      case 'withdrawn':
        return <span className="badge badge-warning">Withdrawn</span>
      default:
        return <span className="badge badge-secondary">{action}</span>
    }
  }

  const getVerificationStatus = (verified: boolean) => {
    return verified ? (
      <span className="badge badge-success">Verified</span>
    ) : (
      <span className="badge badge-danger">Unverified</span>
    )
  }

  const exportConsentHistory = () => {
    const dataStr = JSON.stringify(filteredHistory, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `toubkal-consent-history-${format(new Date(), 'yyyy-MM-dd')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getConsentStats = () => {
    const total = consentHistory.length
    const granted = consentHistory.filter(entry => entry.action === 'granted').length
    const denied = consentHistory.filter(entry => entry.action === 'denied').length
    const withdrawn = consentHistory.filter(entry => entry.action === 'withdrawn').length
    const verified = consentHistory.filter(entry => entry.verified).length

    return { total, granted, denied, withdrawn, verified }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading consent history...</h2>
          <p className="text-gray-500">Please wait while we fetch your consent decisions.</p>
        </div>
      </div>
    )
  }

  const stats = getConsentStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Consent History</h1>
              <p className="text-gray-600 mt-1">Complete record of your privacy consent decisions</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportConsentHistory}
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Decisions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Granted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.granted}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Denied</p>
                <p className="text-2xl font-bold text-gray-900">{stats.denied}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Withdrawn</p>
                <p className="text-2xl font-bold text-gray-900">{stats.withdrawn}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
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
                  placeholder="Search consent history..."
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
                <option value="all">All Types</option>
                <option value="analytics">Analytics</option>
                <option value="cookies">Cookies</option>
                <option value="location">Location</option>
                <option value="marketing">Marketing</option>
              </select>
              
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Actions</option>
                <option value="granted">Granted</option>
                <option value="denied">Denied</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
              
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-')
                  setSortBy(sort as 'timestamp' | 'consentType')
                  setSortOrder(order as 'asc' | 'desc')
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="timestamp-desc">Newest First</option>
                <option value="timestamp-asc">Oldest First</option>
                <option value="consentType-asc">Type A-Z</option>
                <option value="consentType-desc">Type Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Consent History List */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Consent Decisions</h2>
          
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No consent decisions found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((entry) => (
                <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getConsentTypeColor(entry.consentType)}`}>
                        {getConsentTypeIcon(entry.consentType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900 capitalize">{entry.consentType}</h3>
                          {getActionBadge(entry.action)}
                          {getVerificationStatus(entry.verified)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{entry.reason}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(entry.timestamp, 'MMM dd, yyyy HH:mm:ss')}
                          </span>
                          <span>ID: {entry.id}</span>
                          <span>User: {entry.userId}</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                            Signature: {entry.signature}
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
            <p>Toubkal Browser - Privacy-First Consent Management</p>
            <p className="text-sm mt-1">
              All consent decisions are cryptographically signed and tamper-evident.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
