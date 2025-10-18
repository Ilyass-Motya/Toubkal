/**
 * Error Page Component
 * 
 * Error page accessible via toubkal://error and toubkal://404
 * Shows toubkal:// URLs in examples as per AC5.
 */

import React from 'react'
import { INTERNAL_PAGES, ERROR_EXAMPLES } from '@/constants/url-schemes'

interface ErrorPageProps {
  errorCode?: '404' | '500' | 'network' | 'unknown'
  errorMessage?: string
  onNavigate?: (url: string) => void
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ 
  errorCode = '404',
  errorMessage,
  onNavigate 
}) => {
  const getErrorContent = () => {
    switch (errorCode) {
      case '404':
        return {
          title: 'Page Not Found',
          description: 'The page you\'re looking for doesn\'t exist.',
          icon: '🔍',
          suggestions: [
            'Check the URL for typos',
            'Use the search bar to find what you need',
            'Browse our help section for guidance',
          ],
        }
      case '500':
        return {
          title: 'Internal Server Error',
          description: 'Something went wrong on our end.',
          icon: '⚠️',
          suggestions: [
            'Try refreshing the page',
            'Check your internet connection',
            'Contact support if the problem persists',
          ],
        }
      case 'network':
        return {
          title: 'Network Error',
          description: 'Unable to connect to the internet.',
          icon: '🌐',
          suggestions: [
            'Check your internet connection',
            'Try again in a few moments',
            'Check your firewall settings',
          ],
        }
      default:
        return {
          title: 'Something Went Wrong',
          description: 'An unexpected error occurred.',
          icon: '❌',
          suggestions: [
            'Try refreshing the page',
            'Clear your browser cache',
            'Contact support for help',
          ],
        }
    }
  }

  const errorContent = getErrorContent()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Icon */}
        <div className="text-6xl mb-6">
          {errorContent.icon}
        </div>

        {/* Error Title */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {errorContent.title}
        </h1>

        {/* Error Description */}
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          {errorMessage || errorContent.description}
        </p>

        {/* Suggestions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 text-left">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            What you can try:
          </h2>
          <ul className="space-y-2">
            {errorContent.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Valid URL Examples (AC5) */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Valid Toubkal URLs:
          </h2>
          <div className="space-y-2">
            {ERROR_EXAMPLES.VALID_URLS.map((url) => (
              <div key={url} className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <code className="text-sm font-mono text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                  {url}
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* Common Mistakes (AC5) */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">
            Common Mistakes:
          </h2>
          <div className="space-y-2">
            {ERROR_EXAMPLES.COMMON_MISTAKES.map((mistake) => (
              <div key={mistake} className="flex items-center">
                <span className="text-red-500 mr-2">✗</span>
                <code className="text-sm font-mono text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-800 px-2 py-1 rounded">
                  {mistake}
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onNavigate?.(INTERNAL_PAGES.NEW_TAB)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go to New Tab
          </button>
          <button
            onClick={() => onNavigate?.(INTERNAL_PAGES.SETTINGS)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Open Settings
          </button>
          <button
            onClick={() => onNavigate?.(INTERNAL_PAGES.HELP)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Get Help
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Error Code: {errorCode} • Toubkal Browser
          </p>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage
