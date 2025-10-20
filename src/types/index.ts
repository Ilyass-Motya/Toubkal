/**
 * Type Definitions Index
 *
 * Central export for all Toubkal Browser types
 * Following Toubkal coding rules: clean imports
 */

export * from './CommonTypes'
export * from './TelemetryTypes'
export * from './PrivacyTypes'

// URL Scheme Types
export type {
  ToubkalUrl,
  LegacyChromeUrl,
  RemovedBraveUrl,
  UrlRedirect,
  UrlSchemeConfig
} from '@/constants/url-schemes'