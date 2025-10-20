/**
 * Main App Component
 * 
 * Root component that handles URL scheme routing and navigation.
 * Integrates ToubkalRouter with InternalPageRouter for complete
 * toubkal:// URL handling as per AC1, AC2, AC6, and AC7.
 */

import React, { useState, useEffect } from 'react'
import ToubkalRouter from '@/components/routing/ToubkalRouter'
import InternalPageRouter from '@/components/routing/InternalPageRouter'
import { urlSchemeManager } from '@/services/url-scheme-manager'

interface AppState {
  currentUrl: string
  isInternalPage: boolean
  isLoading: boolean
  error: string | null
}

export const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentUrl: 'toubkal://newtab',
    isInternalPage: true,
    isLoading: false,
    error: null,
  })

  // Handle navigation to new URLs
  const handleNavigate = (url: string) => {
    void (async () => {
    setAppState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Process the URL through the URL scheme manager
      const result = await urlSchemeManager.processUrl(url)
      
      if (!result.success) {
        setAppState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error,
        }))
        return
      }

      const { data: validation } = result

      // Handle redirects for backward compatibility (AC6)
      if (validation.isLegacy && validation.redirectUrl) {
        setAppState(prev => ({
          ...prev,
          currentUrl: validation.redirectUrl,
          isInternalPage: true,
          isLoading: false,
        }))
        return
      }

      // Handle removed Brave URLs (AC3)
      if (validation.isRemoved) {
        setAppState(prev => ({
          ...prev,
          currentUrl: 'toubkal://error',
          isInternalPage: true,
          isLoading: false,
          error: 'This Brave URL is no longer supported',
        }))
        return
      }

      // Update state based on URL type
      setAppState(prev => ({
        ...prev,
        currentUrl: url,
        isInternalPage: validation.isInternal,
        isLoading: false,
        error: validation.isValid ? null : (validation.error ?? 'Invalid URL'),
      }))

    } catch (error) {
      console.error('[App.handleNavigate] Failed:', error)
      setAppState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Navigation failed',
      }))
    }
    })()
  }

  // Handle external URL navigation
  // const handleExternalNavigate = (url: string) => {
  //   // For external URLs, we would typically open them in a new tab
  //   // For now, we'll just log and show an error
  //   console.log('External URL navigation:', url)
  //   setAppState(prev => ({
  //     ...prev,
  //     error: 'External URL navigation not implemented in this demo',
  //   }))
  // }

  // Initialize app with default URL
  useEffect(() => {
    // In a real browser, this would be set by the browser's navigation system
    void handleNavigate('toubkal://newtab')
  }, [])

  // Show loading state
  if (appState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (appState.error != null && appState.error.length > 0 && !appState.isInternalPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-4">
              Navigation Error
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-4">
              {appState.error}
            </p>
            <button
              onClick={() => void handleNavigate('toubkal://newtab')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Go to New Tab
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render internal pages with routing
  if (appState.isInternalPage) {
    return (
      <ToubkalRouter
        currentUrl={appState.currentUrl}
        onNavigate={handleNavigate}
      >
        <InternalPageRouter
          currentUrl={appState.currentUrl}
          onNavigate={handleNavigate}
        />
      </ToubkalRouter>
    )
  }

  // This should not be reached in normal operation
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Unexpected State
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The application is in an unexpected state.
        </p>
        <button
          onClick={() => handleNavigate('toubkal://newtab')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Reset to New Tab
        </button>
      </div>
    </div>
  )
}

export default App
