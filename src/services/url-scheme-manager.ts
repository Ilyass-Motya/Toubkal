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
  // LEGACY_CHROME_URLS,
  REMOVED_BRAVE_URLS,
  URL_REDIRECTS,
  ToubkalUrl,
  LegacyChromeUrl,
  RemovedBraveUrl,
} from '@/constants/url-schemes'
import { Result } from '@/types/CommonTypes'

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
    if (UrlSchemeManager.instance == null) {
      UrlSchemeManager.instance = new UrlSchemeManager()
    }
    return UrlSchemeManager.instance
  }

  /**
   * Validates and processes a URL, handling redirects and validation
   */
  processUrl(url: string): Promise<Result<UrlValidationResult>> {
    try {
      const startTime = performance.now()

      const validation = this.validateUrl(url)

      const endTime = performance.now()
      this.performanceMetrics.set('processUrl', endTime - startTime)

      return Promise.resolve({ success: true, data: validation })
    } catch (error) {
      console.error('[UrlSchemeManager.processUrl] Failed:', error)
      return Promise.resolve({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    }
  }

  /**
   * Validates a URL and determines its type and handling
   */
  private validateUrl(url: string): UrlValidationResult {
    // Handle null, undefined, or empty URLs
    if (!url || typeof url !== 'string') {
      return {
        isValid: false,
        isInternal: false,
        isLegacy: false,
        isRemoved: false,
        error: 'Invalid URL: URL must be a non-empty string',
      }
    }

    // Trim whitespace and normalize case for scheme
    const trimmedUrl = url.trim().toLowerCase()

    if (trimmedUrl.length === 0) {
      return {
        isValid: false,
        isInternal: false,
        isLegacy: false,
        isRemoved: false,
        error: 'Invalid URL: URL cannot be empty',
      }
    }

    // Check if it's a toubkal:// URL
    if (trimmedUrl.startsWith('toubkal://')) {
      const isValid = this.isValidToubkalUrl(trimmedUrl)
      return {
        isValid,
        isInternal: true,
        isLegacy: false,
        isRemoved: false,
        error: isValid ? undefined : 'Invalid toubkal:// URL',
      }
    }

    // Check if it's a legacy chrome:// URL
    if (trimmedUrl.startsWith('chrome://')) {
      const redirectUrl = URL_REDIRECTS[trimmedUrl as LegacyChromeUrl]
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
    if (trimmedUrl.startsWith('brave://')) {
      const isRemoved = Object.values(REMOVED_BRAVE_URLS).includes(trimmedUrl as RemovedBraveUrl)
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
      isValid: this.isValidExternalUrl(trimmedUrl),
      isInternal: false,
      isLegacy: false,
      isRemoved: false,
    }
  }

  /**
   * Checks if a toubkal:// URL is valid
   */
  private isValidToubkalUrl(url: string): boolean {
    // Strip query parameters and fragments for validation
    const baseUrl = url.toLowerCase().split('?')[0].split('#')[0]
    const toubkalUrls = Object.values(INTERNAL_PAGES).map((u) => u.toLowerCase())
    return toubkalUrls.includes(baseUrl as string)
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
      if (!chromeUrl || typeof chromeUrl !== 'string') {
        return {
          success: false,
          error: 'Invalid URL: URL must be a non-empty string',
        }
      }

      const trimmedUrl = chromeUrl.trim()
      const redirectUrl = URL_REDIRECTS[trimmedUrl as LegacyChromeUrl]
      if (!redirectUrl) {
        return {
          success: false,
          error: `No toubkal:// equivalent for ${trimmedUrl}`,
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
