/**
 * New Tab Page Component
 * 
 * New tab page accessible via toubkal://newtab
 * Replaces chrome://newtab with Toubkal branding.
 */

import React, { useState, useEffect } from 'react'
import { INTERNAL_PAGES } from '@/constants/url-schemes'

interface NewTabPageProps {
  onNavigate?: (url: string) => void
}

export const NewTabPage: React.FC<NewTabPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [recentPages, setRecentPages] = useState<string[]>([])

  // Mock recent pages data
  useEffect(() => {
    setRecentPages([
      INTERNAL_PAGES.SETTINGS,
      INTERNAL_PAGES.AUDIT,
      INTERNAL_PAGES.AI,
      'https://example.com',
    ])
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    const url = searchQuery.startsWith('http') 
      ? searchQuery 
      : `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`
    
    onNavigate?.(url)
  }

  const handleQuickAccess = (url: string) => {
    onNavigate?.(url)
  }

  const quickAccessPages = [
    { name: 'Settings', url: INTERNAL_PAGES.SETTINGS, icon: '⚙️' },
    { name: 'Privacy Dashboard', url: INTERNAL_PAGES.AUDIT, icon: '🔒' },
    { name: 'AI Assistant', url: INTERNAL_PAGES.AI, icon: '🤖' },
    { name: 'MCP Servers', url: INTERNAL_PAGES.MCP, icon: '🔌' },
    { name: 'Help', url: INTERNAL_PAGES.HELP, icon: '❓' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
              🏔️
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Toubkal Browser
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            The intelligent browser that protects your mind
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search the web or enter a URL"
                className="w-full px-6 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Quick Access */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Quick Access
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {quickAccessPages.map((page) => (
              <button
                key={page.name}
                onClick={() => handleQuickAccess(page.url)}
                className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {page.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                  {page.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Pages */}
        {recentPages.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
              Recent Pages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentPages.map((url, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAccess(url)}
                  className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
                >
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                    {url.startsWith('toubkal://') ? '🏔️' : '🌐'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {url.startsWith('toubkal://') 
                        ? url.replace('toubkal://', '').charAt(0).toUpperCase() + url.replace('toubkal://', '').slice(1)
                        : url
                      }
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {url}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full text-sm">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Zero telemetry • Local AI • Open source
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewTabPage
