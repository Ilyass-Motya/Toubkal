/**
 * Internal Page Router Component
 * 
 * Routes toubkal:// URLs to their corresponding page components.
 * Handles all internal page navigation as per AC2 and AC7.
 */

import React from 'react'
import { INTERNAL_PAGES } from '@/constants/url-schemes'
import SettingsPage from '@/components/pages/SettingsPage'
import NewTabPage from '@/components/pages/NewTabPage'
import ErrorPage from '@/components/pages/ErrorPage'

interface InternalPageRouterProps {
  currentUrl: string
  onNavigate?: (url: string) => void
}

export const InternalPageRouter: React.FC<InternalPageRouterProps> = ({
  currentUrl,
  onNavigate,
}) => {
  // Extract the path from toubkal:// URLs
  const getPagePath = (url: string): string => {
    if (!url.startsWith('toubkal://')) {
      return 'unknown'
    }
    return url.replace('toubkal://', '')
  }

  const pagePath = getPagePath(currentUrl)

  // Route to appropriate component based on URL
  const renderPage = () => {
    switch (pagePath) {
      case 'settings':
        return <SettingsPage currentSection="general" />
      
      case 'settings/privacy':
        return <SettingsPage currentSection="privacy" />
      
      case 'settings/ai':
      case 'ai/settings':
        return <SettingsPage currentSection="ai" />
      
      case 'settings/mcp':
      case 'mcp/servers':
        return <SettingsPage currentSection="mcp" />
      
      case 'newtab':
      case 'new-tab':
        return <NewTabPage onNavigate={onNavigate} />
      
      case 'about':
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="max-w-2xl mx-auto text-center px-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6">
                🏔️
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Toubkal Browser
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                The intelligent browser that protects your mind
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-left">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Version Information
                </h2>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>Version:</span>
                    <span className="font-mono">1.0.0-alpha</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Build:</span>
                    <span className="font-mono">2025.10.18</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Engine:</span>
                    <span className="font-mono">Chromium 120+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Provider:</span>
                    <span className="font-mono">Ollama (Local)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'version':
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="max-w-4xl mx-auto px-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Version Information
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Toubkal Browser
                    </h2>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between">
                        <span>Version:</span>
                        <span className="font-mono">1.0.0-alpha</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Build Date:</span>
                        <span className="font-mono">2025-10-18</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Git Commit:</span>
                        <span className="font-mono">abc123def</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Chromium Engine
                    </h2>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between">
                        <span>Version:</span>
                        <span className="font-mono">120.0.6099.109</span>
                      </div>
                      <div className="flex justify-between">
                        <span>User Agent:</span>
                        <span className="font-mono text-xs">Toubkal/1.0.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'privacy':
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 py-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Privacy Policy
              </h1>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <div className="prose dark:prose-invert max-w-none">
                  <h2>Zero Telemetry by Default</h2>
                  <p>
                    Toubkal Browser collects no data by default. All telemetry is opt-in only.
                  </p>
                  
                  <h2>Local AI Processing</h2>
                  <p>
                    AI queries are processed locally using Ollama. No data is sent to external servers
                    unless you explicitly consent to cloud AI providers.
                  </p>
                  
                  <h2>Audit Trail</h2>
                  <p>
                    All consent decisions and data access are logged locally with cryptographic signatures
                    for transparency and accountability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'audit':
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto px-4 py-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Transparency Dashboard
              </h1>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  View all consent decisions and data access logs for complete transparency.
                </p>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Audit dashboard coming soon...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'ai':
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 py-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                AI Assistant
              </h1>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Chat with your local AI assistant powered by Ollama.
                </p>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🤖</div>
                  <p className="text-gray-500 dark:text-gray-400">
                    AI interface coming soon...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'mcp':
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 py-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                MCP Servers
              </h1>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Manage your Model Context Protocol servers for enhanced AI capabilities.
                </p>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔌</div>
                  <p className="text-gray-500 dark:text-gray-400">
                    MCP management coming soon...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'help':
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 py-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Help & Support
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Getting Started
                  </h2>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• <a href={INTERNAL_PAGES.SETTINGS} className="text-blue-600 hover:underline">Settings</a></li>
                    <li>• <a href={INTERNAL_PAGES.PRIVACY} className="text-blue-600 hover:underline">Privacy Features</a></li>
                    <li>• <a href={INTERNAL_PAGES.AI} className="text-blue-600 hover:underline">AI Assistant</a></li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Troubleshooting
                  </h2>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• <a href={INTERNAL_PAGES.AUDIT} className="text-blue-600 hover:underline">Audit Logs</a></li>
                    <li>• <a href={INTERNAL_PAGES.VERSION} className="text-blue-600 hover:underline">Version Info</a></li>
                    <li>• <a href="https://github.com/toubkal/toubkal" className="text-blue-600 hover:underline">GitHub Issues</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'error':
      case '404':
        return <ErrorPage errorCode="404" onNavigate={onNavigate} />
      
      default:
        return <ErrorPage errorCode="404" errorMessage={`Page "${pagePath}" not found`} onNavigate={onNavigate} />
    }
  }

  return <>{renderPage()}</>
}

export default InternalPageRouter
