/**
 * URL Scheme Constants for Toubkal Browser
 * 
 * This file defines all internal URL schemes used by Toubkal Browser,
 * replacing chrome:// URLs with toubkal:// for brand identity.
 */

// Toubkal URL Scheme
export const TOUBKAL_SCHEME = 'toubkal://'

// Internal page URLs
export const INTERNAL_PAGES = {
  // Core pages
  SETTINGS: `${TOUBKAL_SCHEME}settings`,
  NEW_TAB: `${TOUBKAL_SCHEME}newtab`,
  ABOUT: `${TOUBKAL_SCHEME}about`,
  VERSION: `${TOUBKAL_SCHEME}version`,
  
  // Privacy pages
  PRIVACY: `${TOUBKAL_SCHEME}privacy`,
  AUDIT: `${TOUBKAL_SCHEME}audit`,
  CONSENT: `${TOUBKAL_SCHEME}consent`,
  
  // AI pages
  AI: `${TOUBKAL_SCHEME}ai`,
  AI_SETTINGS: `${TOUBKAL_SCHEME}ai/settings`,
  AI_MODELS: `${TOUBKAL_SCHEME}ai/models`,
  
  // MCP pages
  MCP: `${TOUBKAL_SCHEME}mcp`,
  MCP_SERVERS: `${TOUBKAL_SCHEME}mcp/servers`,
  
  // Help pages
  HELP: `${TOUBKAL_SCHEME}help`,
  HELP_PRIVACY: `${TOUBKAL_SCHEME}help/privacy`,
  HELP_AI: `${TOUBKAL_SCHEME}help/ai`,
  
  // Error pages
  ERROR: `${TOUBKAL_SCHEME}error`,
  NOT_FOUND: `${TOUBKAL_SCHEME}404`,
} as const

// Legacy Chrome URLs for backward compatibility
export const LEGACY_CHROME_URLS = {
  SETTINGS: 'chrome://settings',
  NEW_TAB: 'chrome://newtab',
  ABOUT: 'chrome://about',
  VERSION: 'chrome://version',
  HELP: 'chrome://help',
} as const

// Brave URLs to be removed (no longer supported)
export const REMOVED_BRAVE_URLS = {
  REWARDS: 'brave://rewards',
  WALLET: 'brave://wallet',
  REFERRALS: 'brave://referrals',
} as const

// URL scheme mapping for redirects
export const URL_REDIRECTS = {
  [LEGACY_CHROME_URLS.SETTINGS]: INTERNAL_PAGES.SETTINGS,
  [LEGACY_CHROME_URLS.NEW_TAB]: INTERNAL_PAGES.NEW_TAB,
  [LEGACY_CHROME_URLS.ABOUT]: INTERNAL_PAGES.ABOUT,
  [LEGACY_CHROME_URLS.VERSION]: INTERNAL_PAGES.VERSION,
  [LEGACY_CHROME_URLS.HELP]: INTERNAL_PAGES.HELP,
} as const

// Error page examples using toubkal:// URLs
export const ERROR_EXAMPLES = {
  VALID_URLS: [
    INTERNAL_PAGES.SETTINGS,
    INTERNAL_PAGES.NEW_TAB,
    INTERNAL_PAGES.AUDIT,
    INTERNAL_PAGES.AI,
  ],
  COMMON_MISTAKES: [
    'toubkal://setting', // Missing 's'
    'toubkal://settigns', // Typo
    'toubkal://new-tab', // Wrong separator
  ],
} as const

// Type definitions
export type ToubkalUrl = typeof INTERNAL_PAGES[keyof typeof INTERNAL_PAGES]
export type LegacyChromeUrl = typeof LEGACY_CHROME_URLS[keyof typeof LEGACY_CHROME_URLS]
export type RemovedBraveUrl = typeof REMOVED_BRAVE_URLS[keyof typeof REMOVED_BRAVE_URLS]

export interface UrlRedirect {
  from: LegacyChromeUrl
  to: ToubkalUrl
}

export interface UrlSchemeConfig {
  scheme: string
  internalPages: Record<string, string>
  redirects: Record<string, string>
  removedUrls: string[]
}
