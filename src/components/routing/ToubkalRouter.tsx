/**
 * Toubkal Router Component
 *
 * Handles routing for toubkal:// URLs and provides
 * backward compatibility for chrome:// URLs.
 */

import React, { useEffect, useState, useCallback } from 'react'
import { urlSchemeManager } from '@/services/url-scheme-manager'
// import { Result } from '@/types/CommonTypes'
import { INTERNAL_PAGES, ERROR_EXAMPLES } from '@/constants/url-schemes'

interface ToubkalRouterProps {
  currentUrl: string
  onNavigate: (url: string) => void
  children: React.ReactNode
}

interface RouterState {
  currentPage: string
  isLoading: boolean
  error: string | null
  redirectUrl: string | null
}

export const ToubkalRouter: React.FC<ToubkalRouterProps> = ({
  currentUrl,
  onNavigate,
  children,
}) => {
  const [routerState, setRouterState] = useState<RouterState>({
    currentPage: currentUrl,
    isLoading: false,
    error: null,
    redirectUrl: null,
  })

  const handleUrlChange = useCallback(
    async (url: string) => {
      setRouterState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const result = await urlSchemeManager.processUrl(url)

        if (!result.success) {
          setRouterState((prev) => ({
            ...prev,
            isLoading: false,
            error: result.error,
          }))
          return
        }

        const { data: validation } = result

        // Handle redirects for backward compatibility
        if (validation.isLegacy && validation.redirectUrl) {
          setRouterState((prev) => ({
            ...prev,
            redirectUrl: validation.redirectUrl || '',
            isLoading: false,
          }))

          // Auto-redirect after a brief delay to show the redirect
          setTimeout(() => {
            onNavigate(validation.redirectUrl || '')
          }, 1000)
          return
        }

        // Handle removed Brave URLs
        if (validation.isRemoved) {
          setRouterState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'This Brave URL is no longer supported. Please use the equivalent Toubkal page.',
          }))
          return
        }

        // Handle invalid URLs
        if (!validation.isValid) {
          setRouterState((prev) => ({
            ...prev,
            isLoading: false,
            error: validation.error ?? 'Invalid URL',
          }))
          return
        }

        // Valid URL - update current page
        setRouterState((prev) => ({
          ...prev,
          currentPage: url,
          isLoading: false,
          error: null,
          redirectUrl: null,
        }))
      } catch (error) {
        console.error('[ToubkalRouter.handleUrlChange] Failed:', error)
        setRouterState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        }))
      }
    },
    [onNavigate]
  )

  // Handle URL changes
  useEffect(() => {
    void handleUrlChange(currentUrl)
  }, [currentUrl, handleUrlChange])

  // Show loading state
  if (routerState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show redirect notification
  if (routerState.redirectUrl != null && routerState.redirectUrl.length > 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Redirecting...
            </h2>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              This chrome:// URL has been moved to toubkal:// for better brand identity.
            </p>
            <p className="text-blue-600 dark:text-blue-400 text-xs mt-2 font-mono">
              {currentUrl} → {routerState.redirectUrl}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (routerState.error != null && routerState.error.length > 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-2xl mx-auto p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-4">
              Page Not Found
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-4">{routerState.error}</p>

            <div className="text-left bg-white dark:bg-gray-800 rounded p-4 mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Valid Toubkal URLs:
              </h3>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {ERROR_EXAMPLES.VALID_URLS.map((url) => (
                  <li key={url} className="font-mono">
                    {url}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-left bg-white dark:bg-gray-800 rounded p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Common Mistakes:
              </h3>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {ERROR_EXAMPLES.COMMON_MISTAKES.map((mistake) => (
                  <li key={mistake} className="font-mono text-red-600 dark:text-red-400">
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => onNavigate(INTERNAL_PAGES.SETTINGS)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Go to Settings
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render the current page
  return <>{children}</>
}

export default ToubkalRouter
