/**
 * Settings Page Component
 * 
 * Main settings page accessible via toubkal://settings
 * Replaces chrome://settings with Toubkal branding.
 */

import React from 'react'
import { INTERNAL_PAGES } from '../../toubkal/app/shared/constants/url-schemes'
import { PrivacySettings } from '../../toubkal/app/features/privacy-settings/components/PrivacySettings'

interface SettingsPageProps {
  currentSection?: string
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ 
  currentSection = 'general' 
}) => {
  const settingsSections = [
    { id: 'general', name: 'General', url: INTERNAL_PAGES.SETTINGS },
    { id: 'privacy', name: 'Privacy', url: INTERNAL_PAGES.PRIVACY },
    { id: 'ai', name: 'AI Settings', url: INTERNAL_PAGES.AI_SETTINGS },
    { id: 'mcp', name: 'MCP Servers', url: INTERNAL_PAGES.MCP_SERVERS },
    { id: 'help', name: 'Help', url: INTERNAL_PAGES.HELP },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Toubkal Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Configure your Toubkal Browser experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {settingsSections.map((section) => (
                <a
                  key={section.id}
                  href={section.url}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentSection === section.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {section.name}
                </a>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                {currentSection === 'general' && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      General Settings
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Default Search Engine
                        </label>
                        <select className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500">
                          <option>DuckDuckGo</option>
                          <option>Startpage</option>
                          <option>Google</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Home Page
                        </label>
                        <input
                          type="url"
                          defaultValue={INTERNAL_PAGES.NEW_TAB}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          id="auto-updates"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="auto-updates" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Automatically check for updates
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {currentSection === 'privacy' && (
                  <PrivacySettings />
                )}

                {currentSection === 'ai' && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      AI Settings
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Default AI Model
                        </label>
                        <select className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500">
                          <option>Llama 3.2 (Local)</option>
                          <option>Llama 3.1 (Local)</option>
                          <option>Mistral 7B (Local)</option>
                        </select>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="local-ai-only"
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="local-ai-only" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Use only local AI models (recommended for privacy)
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Ollama Server URL
                        </label>
                        <input
                          type="url"
                          defaultValue="http://localhost:11434"
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
