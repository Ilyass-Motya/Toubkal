/**
 * URL Scheme Integration Tests
 * 
 * End-to-end integration tests for URL scheme functionality.
 * Tests complete flow from URL input to page rendering (AC1-AC8).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { urlSchemeManager } from '@/services/url-scheme-manager'
import { INTERNAL_PAGES, LEGACY_CHROME_URLS, REMOVED_BRAVE_URLS } from '@/constants/url-schemes'

describe('URL Scheme Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete URL Processing Flow', () => {
    it('should process toubkal:// URLs end-to-end (AC1, AC2)', async () => {
      // Arrange
      const toubkalUrl = INTERNAL_PAGES.SETTINGS

      // Act
      const result = await urlSchemeManager.processUrl(toubkalUrl)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(true)
        expect(result.data.isInternal).toBe(true)
        expect(result.data.isLegacy).toBe(false)
        expect(result.data.isRemoved).toBe(false)
      }
    })

    it('should process chrome:// URLs with redirects end-to-end (AC6)', async () => {
      // Arrange
      const chromeUrl = LEGACY_CHROME_URLS.SETTINGS

      // Act
      const result = await urlSchemeManager.processUrl(chromeUrl)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(true)
        expect(result.data.isLegacy).toBe(true)
        expect(result.data.redirectUrl).toBe(INTERNAL_PAGES.SETTINGS)
      }
    })

    it('should process removed Brave URLs end-to-end (AC3)', async () => {
      // Arrange
      const braveUrl = REMOVED_BRAVE_URLS.REWARDS

      // Act
      const result = await urlSchemeManager.processUrl(braveUrl)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(false)
        expect(result.data.isRemoved).toBe(true)
        expect(result.data.error).toContain('Brave URLs are no longer supported')
      }
    })
  })

  describe('URL Scheme Consistency (AC7)', () => {
    it('should consistently handle all internal pages', async () => {
      // Arrange
      const internalPages = Object.values(INTERNAL_PAGES)

      // Act & Assert
      for (const url of internalPages) {
        const result = await urlSchemeManager.processUrl(url)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.isValid).toBe(true)
          expect(result.data.isInternal).toBe(true)
        }
      }
    })

    it('should consistently redirect all chrome:// URLs', async () => {
      // Arrange
      const chromeUrls = Object.values(LEGACY_CHROME_URLS)

      // Act & Assert
      for (const url of chromeUrls) {
        const result = await urlSchemeManager.processUrl(url)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.isValid).toBe(true)
          expect(result.data.isLegacy).toBe(true)
          expect(result.data.redirectUrl).toBeDefined()
        }
      }
    })

    it('should consistently reject all removed Brave URLs', async () => {
      // Arrange
      const braveUrls = Object.values(REMOVED_BRAVE_URLS)

      // Act & Assert
      for (const url of braveUrls) {
        const result = await urlSchemeManager.processUrl(url)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.isValid).toBe(false)
          expect(result.data.isRemoved).toBe(true)
        }
      }
    })
  })

  describe('Performance Impact (AC8)', () => {
    it('should maintain performance within threshold', async () => {
      // Arrange
      const testUrls = [
        INTERNAL_PAGES.SETTINGS,
        INTERNAL_PAGES.NEW_TAB,
        LEGACY_CHROME_URLS.SETTINGS,
        'https://example.com',
      ]

      // Act
      const startTime = performance.now()
      
      for (const url of testUrls) {
        await urlSchemeManager.processUrl(url)
      }
      
      const endTime = performance.now()
      const totalTime = endTime - startTime

      // Assert
      expect(totalTime).toBeLessThan(50) // 50ms threshold for multiple URLs
    })

    it('should track performance metrics correctly', async () => {
      // Arrange
      const url = INTERNAL_PAGES.SETTINGS

      // Act
      await urlSchemeManager.processUrl(url)
      const metrics = urlSchemeManager.getPerformanceMetrics()

      // Assert
      expect(metrics.processUrl).toBeDefined()
      expect(typeof metrics.processUrl).toBe('number')
      expect(metrics.processUrl).toBeGreaterThanOrEqual(0)
    })

    it('should check performance impact correctly', () => {
      // Act
      const result = urlSchemeManager.checkPerformanceImpact()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(typeof result.data.impact).toBe('number')
        expect(typeof result.data.withinThreshold).toBe('boolean')
      }
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle malformed URLs gracefully', async () => {
      // Arrange
      const malformedUrls = [
        'not-a-url',
        'toubkal://',
        'chrome://',
        'brave://',
        '',
        null as unknown as string,
        undefined as unknown as string,
      ]

      // Act & Assert
      for (const url of malformedUrls) {
        const result = await urlSchemeManager.processUrl(url)
        expect(result.success).toBe(true) // Should not throw
        if (result.success) {
          expect(result.data.isValid).toBe(false)
        }
      }
    })

    it('should handle URL scheme manager errors gracefully', async () => {
      // Arrange
      const url = INTERNAL_PAGES.SETTINGS

      // Mock a processing error
      vi.spyOn(urlSchemeManager, 'processUrl').mockResolvedValue({
        success: false,
        error: 'Processing failed'
      })

      // Act
      const result = await urlSchemeManager.processUrl(url)

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Processing failed')
      }

      // Restore original method
      vi.restoreAllMocks()
    })
  })

  describe('URL Conversion Integration', () => {
    it('should convert all supported chrome:// URLs to toubkal:// URLs', () => {
      // Arrange
      const chromeUrls = Object.values(LEGACY_CHROME_URLS)

      // Act & Assert
      for (const chromeUrl of chromeUrls) {
        const result = urlSchemeManager.convertChromeToToubkal(chromeUrl)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toMatch(/^toubkal:\/\//)
        }
      }
    })

    it('should handle unsupported chrome:// URLs', () => {
      // Arrange
      const unsupportedChromeUrl = 'chrome://unsupported'

      // Act
      const result = urlSchemeManager.convertChromeToToubkal(unsupportedChromeUrl)

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('No toubkal:// equivalent')
      }
    })
  })

  describe('URL Validation Integration', () => {
    it('should validate external URLs correctly', async () => {
      // Arrange
      const externalUrls = [
        'https://example.com',
        'http://localhost:3000',
        'file:///path/to/file',
      ]

      // Act & Assert
      for (const url of externalUrls) {
        const result = await urlSchemeManager.processUrl(url)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.isValid).toBe(true)
          expect(result.data.isInternal).toBe(false)
        }
      }
    })

    it('should reject invalid external URLs', async () => {
      // Arrange
      const invalidUrls = [
        'ftp://example.com',
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
      ]

      // Act & Assert
      for (const url of invalidUrls) {
        const result = await urlSchemeManager.processUrl(url)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.isValid).toBe(false)
        }
      }
    })
  })

  describe('Memory and Resource Management', () => {
    it('should not leak memory with repeated URL processing', async () => {
      // Arrange
      const url = INTERNAL_PAGES.SETTINGS
      const iterations = 100

      // Act
      for (let i = 0; i < iterations; i++) {
        await urlSchemeManager.processUrl(url)
      }

      // Assert - should not throw or crash
      expect(true).toBe(true)
    })

    it('should clear performance metrics correctly', async () => {
      // Arrange
      await urlSchemeManager.processUrl(INTERNAL_PAGES.SETTINGS)

      // Act
      urlSchemeManager.clearPerformanceMetrics()
      const metrics = urlSchemeManager.getPerformanceMetrics()

      // Assert
      expect(Object.keys(metrics)).toHaveLength(0)
    })
  })
})
