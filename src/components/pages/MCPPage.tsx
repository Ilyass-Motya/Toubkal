/**
 * MCP Page Component (MCP Overview)
 *
 * Main MCP page accessible via toubkal://mcp
 * Provides MCP server management interface with privacy labels and real-time logs.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react'
// import { INTERNAL_PAGES } from '../../constants/url-schemes'

interface MCPServer {
  id: string
  name: string
  description: string
  version: string
  status: 'running' | 'stopped' | 'error' | 'installing'
  privacyLevel: 'local' | 'network' | 'remote_api'
  capabilities: string[]
  port?: number
  pid?: number
  memoryUsage?: number
  lastActivity?: Date
  logs: MCPLogEntry[]
}

interface MCPLogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'debug'
  source: 'stdout' | 'stderr' | 'system'
  message: string
}

interface MCPPageProps {
  initialFilter?: string
}

export const MCPPage: React.FC<MCPPageProps> = ({ initialFilter = 'all' }) => {
  const [servers, setServers] = useState<MCPServer[]>([])
  const [filteredServers, setFilteredServers] = useState<MCPServer[]>([])
  const [filter, setFilter] = useState(initialFilter)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedServer, setSelectedServer] = useState<string | null>(null)
  const [isInstalling, setIsInstalling] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Mock data for demonstration
  const mockServers: MCPServer[] = useMemo(
    () => [
      {
        id: 'file-reader',
        name: 'File Reader',
        description: 'Reads and processes local files securely',
        version: '1.2.0',
        status: 'running',
        privacyLevel: 'local',
        capabilities: ['file_read', 'file_metadata', 'file_search'],
        port: 3001,
        pid: 12345,
        memoryUsage: 45.2,
        lastActivity: new Date('2025-01-18T10:30:00Z'),
        logs: [
          {
            id: '1',
            timestamp: new Date('2025-01-18T10:30:00Z'),
            level: 'info',
            source: 'stdout',
            message: 'File Reader server started on port 3001',
          },
          {
            id: '2',
            timestamp: new Date('2025-01-18T10:29:45Z'),
            level: 'info',
            source: 'stdout',
            message: 'Initialized file system watcher',
          },
        ],
      },
      {
        id: 'web-search',
        name: 'Web Search',
        description: 'Performs web searches with privacy protection',
        version: '2.1.0',
        status: 'running',
        privacyLevel: 'network',
        capabilities: ['web_search', 'url_analysis', 'content_extraction'],
        port: 3002,
        pid: 12346,
        memoryUsage: 78.5,
        lastActivity: new Date('2025-01-18T10:28:00Z'),
        logs: [
          {
            id: '3',
            timestamp: new Date('2025-01-18T10:28:00Z'),
            level: 'info',
            source: 'stdout',
            message: 'Web Search server connected to DuckDuckGo API',
          },
          {
            id: '4',
            timestamp: new Date('2025-01-18T10:27:30Z'),
            level: 'warn',
            source: 'stderr',
            message: 'Rate limit approaching for search API',
          },
        ],
      },
      {
        id: 'ai-assistant',
        name: 'AI Assistant',
        description: 'Local AI model integration for natural language processing',
        version: '3.0.1',
        status: 'stopped',
        privacyLevel: 'local',
        capabilities: ['text_generation', 'text_analysis', 'conversation'],
        port: 3003,
        memoryUsage: 0,
        logs: [
          {
            id: '5',
            timestamp: new Date('2025-01-18T10:25:00Z'),
            level: 'error',
            source: 'stderr',
            message: 'Failed to load AI model: insufficient memory',
          },
        ],
      },
      {
        id: 'weather-api',
        name: 'Weather API',
        description: 'Fetches weather data from external APIs',
        version: '1.0.5',
        status: 'error',
        privacyLevel: 'remote_api',
        capabilities: ['weather_data', 'location_services'],
        port: 3004,
        memoryUsage: 12.3,
        lastActivity: new Date('2025-01-18T10:20:00Z'),
        logs: [
          {
            id: '6',
            timestamp: new Date('2025-01-18T10:20:00Z'),
            level: 'error',
            source: 'stderr',
            message: 'API key expired, please update configuration',
          },
        ],
      },
    ],
    []
  )

  // Load servers on component mount
  useEffect(() => {
    setServers(mockServers)
  }, [mockServers])

  // Filter servers
  useEffect(() => {
    let filtered = servers

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter((server) => server.status === filter)
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (server) =>
          server.name.toLowerCase().includes(term) ||
          server.description.toLowerCase().includes(term) ||
          server.capabilities.some((cap) => cap.toLowerCase().includes(term))
      )
    }

    setFilteredServers(filtered)
  }, [servers, filter, searchTerm])

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logsEndRef.current && typeof logsEndRef.current.scrollIntoView === 'function') {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedServer, servers])

  const getPrivacyLevelColor = (level: string) => {
    switch (level) {
      case 'local':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'network':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'remote_api':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getPrivacyLevelIcon = (level: string) => {
    switch (level) {
      case 'local':
        return '🟢'
      case 'network':
        return '🟡'
      case 'remote_api':
        return '🟠'
      default:
        return '⚪'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'stopped':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'installing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'text-blue-600 dark:text-blue-400'
      case 'warn':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'error':
        return 'text-red-600 dark:text-red-400'
      case 'debug':
        return 'text-gray-600 dark:text-gray-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    }).format(timestamp)
  }

  const handleStartServer = (serverId: string) => {
    setServers((prev) =>
      prev.map((server) =>
        server.id === serverId
          ? { ...server, status: 'running' as const, lastActivity: new Date() }
          : server
      )
    )
  }

  const handleStopServer = (serverId: string) => {
    setServers((prev) =>
      prev.map((server) =>
        server.id === serverId ? { ...server, status: 'stopped' as const } : server
      )
    )
  }

  const handleInstallServer = async (serverId: string) => {
    setIsInstalling(serverId)
    setError(null)

    try {
      // Simulate installation
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const newServer: MCPServer = {
        id: serverId,
        name: 'New Server',
        description: 'A newly installed MCP server',
        version: '1.0.0',
        status: 'running',
        privacyLevel: 'local',
        capabilities: ['basic_functionality'],
        port: 3005,
        pid: 12347,
        memoryUsage: 25.0,
        lastActivity: new Date(),
        logs: [
          {
            id: Date.now().toString(),
            timestamp: new Date(),
            level: 'info',
            source: 'stdout',
            message: 'Server installed and started successfully',
          },
        ],
      }

      setServers((prev) => [...prev, newServer])
    } catch (err) {
      console.error('[MCPPage.handleInstallServer] Failed:', err)
      setError('Failed to install server')
    } finally {
      setIsInstalling(null)
    }
  }

  const selectedServerData =
    selectedServer != null ? servers.find((s) => s.id === selectedServer) : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            MCP Server Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage Model Context Protocol servers with privacy-first approach
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Server List */}
          <div className="lg:col-span-2">
            {/* Filters and Search */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="status-filter"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Filter by Status
                  </label>
                  <select
                    id="status-filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="all">All Servers</option>
                    <option value="running">Running</option>
                    <option value="stopped">Stopped</option>
                    <option value="error">Error</option>
                    <option value="installing">Installing</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="search-servers"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Search Servers
                  </label>
                  <input
                    id="search-servers"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, description, or capabilities..."
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Server Cards */}
            <div className="space-y-4">
              {filteredServers.map((server) => (
                <div
                  key={server.id}
                  className={`bg-white dark:bg-gray-800 shadow rounded-lg p-6 cursor-pointer transition-colors ${
                    selectedServer === server.id
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedServer(server.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {server.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(server.status)}`}
                        >
                          {server.status}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrivacyLevelColor(server.privacyLevel)}`}
                        >
                          <span className="mr-1">{getPrivacyLevelIcon(server.privacyLevel)}</span>
                          {server.privacyLevel.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mb-3">{server.description}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {server.capabilities.map((capability) => (
                          <span
                            key={capability}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            {capability.replace('_', ' ')}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>v{server.version}</span>
                        {server.port != null && <span>Port: {server.port}</span>}
                        {server.memoryUsage != null && (
                          <span>Memory: {server.memoryUsage.toFixed(1)}MB</span>
                        )}
                        {server.lastActivity && (
                          <span>Last activity: {formatTimestamp(server.lastActivity)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      {server.status === 'running' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStopServer(server.id)
                          }}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50"
                        >
                          Stop
                        </button>
                      ) : server.status === 'stopped' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartServer(server.id)
                          }}
                          className="px-3 py-1 text-sm text-green-600 hover:text-green-800 border border-green-300 rounded-md hover:bg-green-50"
                        >
                          Start
                        </button>
                      ) : server.status === 'error' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartServer(server.id)
                          }}
                          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50"
                        >
                          Restart
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}

              {filteredServers.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔌</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No servers found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchTerm
                      ? 'Try adjusting your search terms'
                      : 'No servers match the current filter'}
                  </p>
                </div>
              )}
            </div>

            {/* Install New Server */}
            <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Install New Server
              </h3>
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Enter server name or URL..."
                  className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    void handleInstallServer('new-server')
                  }}
                  disabled={isInstalling !== null}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isInstalling != null ? 'Installing...' : 'Install'}
                </button>
              </div>
            </div>
          </div>

          {/* Server Details and Logs */}
          <div className="lg:col-span-1">
            {selectedServerData ? (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg h-[600px] flex flex-col">
                {/* Server Details Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {selectedServerData.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedServerData.description}
                  </p>
                </div>

                {/* Server Info */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Status:</span>
                      <span
                        className={`font-medium ${getStatusColor(selectedServerData.status).split(' ')[1]}`}
                      >
                        {selectedServerData.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Version:</span>
                      <span className="font-medium">{selectedServerData.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Privacy:</span>
                      <span
                        className={`font-medium ${getPrivacyLevelColor(selectedServerData.privacyLevel).split(' ')[1]}`}
                      >
                        {getPrivacyLevelIcon(selectedServerData.privacyLevel)}{' '}
                        {selectedServerData.privacyLevel.replace('_', ' ')}
                      </span>
                    </div>
                    {selectedServerData.port != null && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Port:</span>
                        <span className="font-medium">{selectedServerData.port}</span>
                      </div>
                    )}
                    {selectedServerData.memoryUsage != null && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Memory:</span>
                        <span className="font-medium">
                          {selectedServerData.memoryUsage.toFixed(1)}MB
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Real-time Logs */}
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Real-time Logs
                    </h4>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
                    <div className="space-y-2">
                      {selectedServerData.logs.map((log) => (
                        <div key={log.id} className="text-xs font-mono">
                          <div className="flex items-start space-x-2">
                            <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                              {formatTimestamp(log.timestamp)}
                            </span>
                            <span
                              className={`flex-shrink-0 ${
                                log.source === 'stderr'
                                  ? 'text-red-500'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              [{log.source}]
                            </span>
                            <span className={`flex-shrink-0 ${getLogLevelColor(log.level)}`}>
                              [{log.level.toUpperCase()}]
                            </span>
                            <span className="text-gray-900 dark:text-white break-words">
                              {log.message}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg h-[600px] flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium mb-2">Select a server</h3>
                  <p>Choose a server from the list to view details and logs</p>
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

export default MCPPage
