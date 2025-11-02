/**
 * Transparency Dashboard - Main Component
 * 
 * Real-time transparency dashboard that shows all browser operations
 * for privacy verification and audit trail visibility.
 */

import React, { useState, useEffect } from 'react'
import { AuditLogViewer } from './components/AuditLogViewer'
import { ConsentHistory } from './components/ConsentHistory'
import { ExportPanel } from './components/ExportPanel'
import { useAuditData } from './hooks/use-audit-data'
import { useRealTimeLogs } from './hooks/use-real-time-logs'
import { TransparencyTypes } from './types/TransparencyTypes'

interface TransparencyDashboardProps {
  className?: string
}

export const TransparencyDashboard: React.FC<TransparencyDashboardProps> = ({ 
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'consent' | 'export'>('logs')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  const { 
    auditData, 
    loading: auditLoading, 
    error: auditError 
  } = useAuditData()
  
  const {
    realTimeLogs,
    loading: logsLoading,
    error: logsError,
    startStreaming,
    stopStreaming
  } = useRealTimeLogs()

  useEffect(() => {
    // Start real-time streaming when component mounts
    startStreaming()
    
    return () => {
      // Clean up streaming when component unmounts
      stopStreaming()
    }
  }, [startStreaming, stopStreaming])

  // Handle authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // TODO: Implement actual authentication check
        // For now, assume authenticated for development
        setIsAuthenticated(true)
      } catch (error) {
        console.error('[TransparencyDashboard] Authentication failed:', error)
        setIsAuthenticated(false)
      }
    }
    
    checkAuth()
  }, [])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please authenticate to access the transparency dashboard.
          </p>
          <button 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => setIsAuthenticated(true)}
          >
            Authenticate
          </button>
        </div>
      </div>
    )
  }

  if (auditLoading || logsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transparency data...</p>
        </div>
      </div>
    )
  }

  if (auditError || logsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Data</h2>
          <p className="text-red-600 mb-4">
            {auditError?.message || logsError?.message || 'Failed to load transparency data'}
          </p>
          <button 
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transparency Dashboard</h1>
              <p className="text-sm text-gray-600">
                Real-time view of all browser operations and privacy decisions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
              <button
                onClick={() => window.location.href = 'toubkal://settings'}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Back to Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Operation Logs
            </button>
            <button
              onClick={() => setActiveTab('consent')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'consent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Consent History
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'export'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Export Data
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'logs' && (
          <AuditLogViewer 
            logs={realTimeLogs}
            onRefresh={() => startStreaming()}
          />
        )}
        
        {activeTab === 'consent' && (
          <ConsentHistory 
            consentData={auditData?.consentHistory || []}
          />
        )}
        
        {activeTab === 'export' && (
          <ExportPanel 
            auditData={auditData}
            logs={realTimeLogs}
          />
        )}
      </main>
    </div>
  )
}
