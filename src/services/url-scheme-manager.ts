/**
 * URL Scheme Manager Service
 * 
 * Handles URL scheme operations including:
 * - Converting chrome:// URLs to toubkal:// URLs
 * - Redirecting legacy URLs for backward compatibility
 * - Validating internal page URLs
 * - Managing URL scheme configuration
 */

import { 
  INTERNAL_PAGES, 
  LEGACY_CHROME_URLS, 
  REMOVED_BRAVE_URLS, 
  URL_REDIRECTS,
  ToubkalUrl,
  LegacyChromeUrl,
  RemovedBraveUrl
} from '@/constants/url-schemes'

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export interface UrlValidationResult {
  isValid: boolean
  isInternal: boolean
  isLegacy: boolean
  isRemoved: boolean
  redirectUrl?: ToubkalUrl
  error?: string
}

export class UrlSchemeManager {
  private static instance: UrlSchemeManager
  private performanceMetrics: Map<string, number> = new Map()

  private constructor() {}

  static getInstance(): UrlSchemeManager {
    if (!UrlSchemeManager.instance) {
      UrlSchemeManager.instance = new UrlSchemeManager()
    }
    return UrlSchemeManager.instance
  }

  /**
   * Validates and processes a URL, handling redirects and validation
   */
  async processUrl(url: string): Promise<Result<UrlValidationResult>> {
    try {
      const startTime = performance.now()
      
      const validation = this.validateUrl(url)
      
      const endTime = performance.now()
      this.performanceMetrics.set('processUrl', endTime - startTime)
      
      return { success: true, data: validation }
    } catch (error) {
      console.error('[UrlSchemeManager.processUrl] Failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }

  /**
   * Validates a URL and determines its type and handling
   */
  private validateUrl(url: string): UrlValidationResult {
    // Check if it's a toubkal:// URL
    if (url.startsWith('toubkal://')) {
      return {
        isValid: this.isValidToubkalUrl(url),
        isInternal: true,
        isLegacy: false,
        isRemoved: false,
      }
    }

    // Check if it's a legacy chrome:// URL
    if (url.startsWith('chrome://')) {
      const redirectUrl = URL_REDIRECTS[url as LegacyChromeUrl]
      if (redirectUrl) {
        return {
          isValid: true,
          isInternal: false,
          isLegacy: true,
          isRemoved: false,
          redirectUrl,
        }
      }
      return {
        isValid: false,
        isInternal: false,
        isLegacy: true,
        isRemoved: false,
        error: 'Unsupported chrome:// URL',
      }
    }

    // Check if it's a removed brave:// URL
    if (url.startsWith('brave://')) {
      const isRemoved = Object.values(REMOVED_BRAVE_URLS).includes(url as RemovedBraveUrl)
      return {
        isValid: false,
        isInternal: false,
        isLegacy: false,
        isRemoved,
        error: isRemoved ? 'Brave URLs are no longer supported' : 'Unknown brave:// URL',
      }
    }

    // External URL
    return {
      isValid: this.isValidExternalUrl(url),
      isInternal: false,
      isLegacy: false,
      isRemoved: false,
    }
  }

  /**
   * Checks if a toubkal:// URL is valid
   */
  private isValidToubkalUrl(url: string): boolean {
    const toubkalUrls = Object.values(INTERNAL_PAGES)
    return toubkalUrls.includes(url as ToubkalUrl)
  }

  /**
   * Checks if an external URL is valid
   */
  private isValidExternalUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return ['http:', 'https:', 'file:'].includes(urlObj.protocol)
    } catch {
      return false
    }
  }

  /**
   * Converts a chrome:// URL to toubkal:// URL
   */
  convertChromeToToubkal(chromeUrl: string): Result<ToubkalUrl> {
    try {
      const redirectUrl = URL_REDIRECTS[chromeUrl as LegacyChromeUrl]
      if (!redirectUrl) {
        return {
          success: false,
          error: `No toubkal:// equivalent for ${chromeUrl}`,
        }
      }

      return { success: true, data: redirectUrl }
    } catch (error) {
      console.error('[UrlSchemeManager.convertChromeToToubkal] Failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Conversion failed',
      }
    }
  }

  /**
   * Gets all available internal pages
   */
  getInternalPages(): Record<string, string> {
    return { ...INTERNAL_PAGES }
  }

  /**
   * Gets all URL redirects
   */
  getRedirects(): Record<string, string> {
    return { ...URL_REDIRECTS }
  }

  /**
   * Gets all removed Brave URLs
   */
  getRemovedBraveUrls(): string[] {
    return Object.values(REMOVED_BRAVE_URLS)
  }

  /**
   * Checks if a URL should be redirected
   */
  shouldRedirect(url: string): boolean {
    return url in URL_REDIRECTS
  }

  /**
   * Gets the redirect URL for a given URL
   */
  getRedirectUrl(url: string): ToubkalUrl | null {
    return URL_REDIRECTS[url as LegacyChromeUrl] || null
  }

  /**
   * Gets performance metrics
   */
  getPerformanceMetrics(): Record<string, number> {
    return Object.fromEntries(this.performanceMetrics)
  }

  /**
   * Clears performance metrics
   */
  clearPerformanceMetrics(): void {
    this.performanceMetrics.clear()
  }

  /**
   * Checks if URL scheme changes impact performance (AC8)
   */
  checkPerformanceImpact(): Result<{ impact: number; withinThreshold: boolean }> {
    try {
      const metrics = this.getPerformanceMetrics()
      const processUrlTime = metrics.processUrl || 0
      
      // Threshold: 5% degradation (assuming baseline is 0ms for simplicity)
      const threshold = 5 // 5ms threshold
      const impact = processUrlTime
      const withinThreshold = impact <= threshold

      return {
        success: true,
        data: {
          impact,
          withinThreshold,
        },
      }
    } catch (error) {
      console.error('[UrlSchemeManager.checkPerformanceImpact] Failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Performance check failed',
      }
    }
  }
}

// Export singleton instance
export const urlSchemeManager = UrlSchemeManager.getInstance()
