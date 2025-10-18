/**
 * URL Scheme Integration Tests
 * 
 * Comprehensive tests for toubkal:// URL scheme functionality.
 * Tests URL redirection, validation, and navigation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { urlSchemeManager } from '../services/url-scheme-manager'
import { INTERNAL_PAGES, LEGACY_CHROME_URLS, URL_REDIRECTS } from '../constants/url-schemes'

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now())
  }
})

describe('URL Scheme Integration Tests', () => {
  beforeEach(() => {
    // Clear performance metrics before each test
    urlSchemeManager.clearPerformanceMetrics()
  })

  describe('URL Processing', () => {
    it('should process toubkal:// URLs correctly', async () => {
      const result = await urlSchemeManager.processUrl(INTERNAL_PAGES.SETTINGS)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(true)
        expect(result.data.isInternal).toBe(true)
        expect(result.data.isLegacy).toBe(false)
        expect(result.data.isRemoved).toBe(false)
      }
    })

    it('should redirect chrome:// URLs to toubkal:// URLs', async () => {
      const result = await urlSchemeManager.processUrl(LEGACY_CHROME_URLS.SETTINGS)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(true)
        expect(result.data.isInternal).toBe(false)
        expect(result.data.isLegacy).toBe(true)
        expect(result.data.isRemoved).toBe(false)
        expect(result.data.redirectUrl).toBe(INTERNAL_PAGES.SETTINGS)
      }
    })

    it('should handle unsupported chrome:// URLs', async () => {
      const result = await urlSchemeManager.processUrl('chrome://unsupported')
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(false)
        expect(result.data.isInternal).toBe(false)
        expect(result.data.isLegacy).toBe(true)
        expect(result.data.isRemoved).toBe(false)
        expect(result.data.error).toBe('Unsupported chrome:// URL')
      }
    })

    it('should handle removed brave:// URLs', async () => {
      const result = await urlSchemeManager.processUrl('brave://rewards')
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(false)
        expect(result.data.isInternal).toBe(false)
        expect(result.data.isLegacy).toBe(false)
        expect(result.data.isRemoved).toBe(true)
        expect(result.data.error).toBe('Brave URLs are no longer supported')
      }
    })

    it('should validate external URLs', async () => {
      const result = await urlSchemeManager.processUrl('https://example.com')
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(true)
        expect(result.data.isInternal).toBe(false)
        expect(result.data.isLegacy).toBe(false)
        expect(result.data.isRemoved).toBe(false)
      }
    })

    it('should reject invalid URLs', async () => {
      const result = await urlSchemeManager.processUrl('invalid-url')
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(false)
        expect(result.data.isInternal).toBe(false)
        expect(result.data.isLegacy).toBe(false)
        expect(result.data.isRemoved).toBe(false)
      }
    })
  })

  describe('URL Conversion', () => {
    it('should convert chrome:// URLs to toubkal:// URLs', () => {
      const result = urlSchemeManager.convertChromeToToubkal(LEGACY_CHROME_URLS.SETTINGS)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(INTERNAL_PAGES.SETTINGS)
      }
    })

    it('should handle unsupported chrome:// URLs in conversion', () => {
      const result = urlSchemeManager.convertChromeToToubkal('chrome://unsupported')
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('No toubkal:// equivalent for chrome://unsupported')
      }
    })

    it('should convert all supported chrome:// URLs', () => {
      Object.entries(URL_REDIRECTS).forEach(([chromeUrl, toubkalUrl]) => {
        const result = urlSchemeManager.convertChromeToToubkal(chromeUrl)
        
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toBe(toubkalUrl)
        }
      })
    })
  })

  describe('URL Validation', () => {
    it('should validate all internal pages', () => {
      Object.values(INTERNAL_PAGES).forEach(url => {
        const result = urlSchemeManager.processUrl(url)
        
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.isValid).toBe(true)
          expect(result.data.isInternal).toBe(true)
        }
      })
    })

    it('should validate redirect functionality', () => {
      Object.entries(URL_REDIRECTS).forEach(([chromeUrl, toubkalUrl]) => {
        expect(urlSchemeManager.shouldRedirect(chromeUrl)).toBe(true)
        expect(urlSchemeManager.getRedirectUrl(chromeUrl)).toBe(toubkalUrl)
      })
    })

    it('should not redirect unsupported URLs', () => {
      const unsupportedUrls = [
        'chrome://unsupported',
        'brave://rewards',
        'https://example.com',
        'invalid-url'
      ]

      unsupportedUrls.forEach(url => {
        expect(urlSchemeManager.shouldRedirect(url)).toBe(false)
        expect(urlSchemeManager.getRedirectUrl(url)).toBe(null)
      })
    })
  })

  describe('Performance Tests', () => {
    it('should process URLs within performance threshold', async () => {
      const startTime = performance.now()
      
      await urlSchemeManager.processUrl(INTERNAL_PAGES.SETTINGS)
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should complete within 5ms
      expect(duration).toBeLessThan(5)
    })

    it('should handle multiple URL processing efficiently', async () => {
      const urls = [
        INTERNAL_PAGES.SETTINGS,
        INTERNAL_PAGES.NEW_TAB,
        INTERNAL_PAGES.AI,
        INTERNAL_PAGES.MCP,
        INTERNAL_PAGES.CONSENT
      ]

      const startTime = performance.now()
      
      await Promise.all(urls.map(url => urlSchemeManager.processUrl(url)))
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should process all URLs within 10ms
      expect(duration).toBeLessThan(10)
    })

    it('should track performance metrics', async () => {
      await urlSchemeManager.processUrl(INTERNAL_PAGES.SETTINGS)
      
      const metrics = urlSchemeManager.getPerformanceMetrics()
      expect(metrics.processUrl).toBeDefined()
      expect(metrics.processUrl).toBeGreaterThan(0)
    })

    it('should check performance impact', () => {
      const result = urlSchemeManager.checkPerformanceImpact()
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.impact).toBeDefined()
        expect(typeof result.data.withinThreshold).toBe('boolean')
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid input gracefully', async () => {
      const invalidInputs = [
        '',
        null,
        undefined,
        123,
        {},
        []
      ]

      for (const input of invalidInputs) {
        const result = await urlSchemeManager.processUrl(input as any)
        
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.isValid).toBe(false)
        }
      }
    })

    it('should handle conversion errors gracefully', () => {
      const invalidInputs = [
        '',
        null,
        undefined,
        123,
        {},
        []
      ]

      for (const input of invalidInputs) {
        const result = urlSchemeManager.convertChromeToToubkal(input as any)
        
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error).toBeDefined()
        }
      }
    })
  })

  describe('API Consistency', () => {
    it('should provide consistent internal pages list', () => {
      const internalPages = urlSchemeManager.getInternalPages()
      
      expect(internalPages).toBeDefined()
      expect(typeof internalPages).toBe('object')
      expect(Object.keys(internalPages).length).toBeGreaterThan(0)
      
      // Should match the constants
      expect(internalPages).toEqual(INTERNAL_PAGES)
    })

    it('should provide consistent redirects list', () => {
      const redirects = urlSchemeManager.getRedirects()
      
      expect(redirects).toBeDefined()
      expect(typeof redirects).toBe('object')
      expect(Object.keys(redirects).length).toBeGreaterThan(0)
      
      // Should match the constants
      expect(redirects).toEqual(URL_REDIRECTS)
    })

    it('should provide consistent removed Brave URLs list', () => {
      const removedUrls = urlSchemeManager.getRemovedBraveUrls()
      
      expect(removedUrls).toBeDefined()
      expect(Array.isArray(removedUrls)).toBe(true)
      expect(removedUrls.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle URLs with query parameters', async () => {
      const urlWithParams = `${INTERNAL_PAGES.SETTINGS}?section=privacy`
      const result = await urlSchemeManager.processUrl(urlWithParams)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(true)
        expect(result.data.isInternal).toBe(true)
      }
    })

    it('should handle URLs with fragments', async () => {
      const urlWithFragment = `${INTERNAL_PAGES.HELP}#troubleshooting`
      const result = await urlSchemeManager.processUrl(urlWithFragment)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(true)
        expect(result.data.isInternal).toBe(true)
      }
    })

    it('should handle case sensitivity', async () => {
      const upperCaseUrl = INTERNAL_PAGES.SETTINGS.toUpperCase()
      const result = await urlSchemeManager.processUrl(upperCaseUrl)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(true)
        expect(result.data.isInternal).toBe(true)
      }
    })

    it('should handle extra whitespace', async () => {
      const urlWithSpaces = `  ${INTERNAL_PAGES.SETTINGS}  `
      const result = await urlSchemeManager.processUrl(urlWithSpaces)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(true)
        expect(result.data.isInternal).toBe(true)
      }
    })
  })

  describe('Integration with Components', () => {
    it('should work with routing components', () => {
      // Test that URL scheme manager integrates properly with routing
      const testUrls = [
        INTERNAL_PAGES.SETTINGS,
        INTERNAL_PAGES.AI,
        INTERNAL_PAGES.MCP,
        INTERNAL_PAGES.CONSENT,
        INTERNAL_PAGES.AUDIT
      ]

      testUrls.forEach(url => {
        const result = urlSchemeManager.processUrl(url)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.isValid).toBe(true)
          expect(result.data.isInternal).toBe(true)
        }
      })
    })

    it('should support navigation between pages', () => {
      // Test that URLs can be used for navigation
      const navigationUrls = [
        { from: INTERNAL_PAGES.SETTINGS, to: INTERNAL_PAGES.PRIVACY },
        { from: INTERNAL_PAGES.AI, to: INTERNAL_PAGES.AI_SETTINGS },
        { from: INTERNAL_PAGES.MCP, to: INTERNAL_PAGES.MCP_SERVERS }
      ]

      navigationUrls.forEach(({ from, to }) => {
        const fromResult = urlSchemeManager.processUrl(from)
        const toResult = urlSchemeManager.processUrl(to)
        
        expect(fromResult.success).toBe(true)
        expect(toResult.success).toBe(true)
        
        if (fromResult.success && toResult.success) {
          expect(fromResult.data.isValid).toBe(true)
          expect(toResult.data.isValid).toBe(true)
        }
      })
    })
  })
})
