/**
 * URL Scheme Manager Tests
 * 
 * Comprehensive test suite for URL scheme management functionality.
 * Tests all acceptance criteria: AC1, AC2, AC3, AC6, AC7, AC8.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UrlSchemeManager } from './url-scheme-manager'
import { INTERNAL_PAGES, LEGACY_CHROME_URLS, REMOVED_BRAVE_URLS } from '@/constants/url-schemes'

// Mock performance.now for consistent testing
const mockPerformanceNow = vi.fn()
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow,
  },
  writable: true,
})

describe('UrlSchemeManager', () => {
  let manager: UrlSchemeManager

  beforeEach(() => {
    manager = UrlSchemeManager.getInstance()
    manager.clearPerformanceMetrics()
    mockPerformanceNow.mockReturnValue(0)
  })

  describe('processUrl()', () => {
    it('should validate toubkal:// URLs correctly (AC1, AC2)', async () => {
      // Arrange
      const validToubkalUrl = INTERNAL_PAGES.SETTINGS

      // Act
      const result = await manager.processUrl(validToubkalUrl)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(true)
        expect(result.data.isInternal).toBe(true)
        expect(result.data.isLegacy).toBe(false)
        expect(result.data.isRemoved).toBe(false)
      }
    })

    it('should handle invalid toubkal:// URLs', async () => {
      // Arrange
      const invalidToubkalUrl = 'toubkal://invalid-page'

      // Act
      const result = await manager.processUrl(invalidToubkalUrl)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(false)
        expect(result.data.isInternal).toBe(true)
        expect(result.data.error).toBeDefined()
      }
    })

    it('should redirect chrome:// URLs to toubkal:// URLs (AC6)', async () => {
      // Arrange
      const chromeUrl = LEGACY_CHROME_URLS.SETTINGS

      // Act
      const result = await manager.processUrl(chromeUrl)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(true)
        expect(result.data.isLegacy).toBe(true)
        expect(result.data.redirectUrl).toBe(INTERNAL_PAGES.SETTINGS)
      }
    })

    it('should handle unsupported chrome:// URLs', async () => {
      // Arrange
      const unsupportedChromeUrl = 'chrome://unsupported'

      // Act
      const result = await manager.processUrl(unsupportedChromeUrl)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(false)
        expect(result.data.isLegacy).toBe(true)
        expect(result.data.error).toBe('Unsupported chrome:// URL')
      }
    })

    it('should identify removed Brave URLs (AC3)', async () => {
      // Arrange
      const removedBraveUrl = REMOVED_BRAVE_URLS.REWARDS

      // Act
      const result = await manager.processUrl(removedBraveUrl)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(false)
        expect(result.data.isRemoved).toBe(true)
        expect(result.data.error).toBe('Brave URLs are no longer supported')
      }
    })

    it('should handle unknown brave:// URLs', async () => {
      // Arrange
      const unknownBraveUrl = 'brave://unknown'

      // Act
      const result = await manager.processUrl(unknownBraveUrl)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(false)
        expect(result.data.isRemoved).toBe(false)
        expect(result.data.error).toBe('Unknown brave:// URL')
      }
    })

    it('should validate external URLs', async () => {
      // Arrange
      const externalUrl = 'https://example.com'

      // Act
      const result = await manager.processUrl(externalUrl)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(true)
        expect(result.data.isInternal).toBe(false)
        expect(result.data.isLegacy).toBe(false)
        expect(result.data.isRemoved).toBe(false)
      }
    })

    it('should handle invalid external URLs', async () => {
      // Arrange
      const invalidUrl = 'not-a-url'

      // Act
      const result = await manager.processUrl(invalidUrl)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(false)
        expect(result.data.isInternal).toBe(false)
        expect(result.data.isLegacy).toBe(false)
        expect(result.data.isRemoved).toBe(false)
      }
    })

    it('should handle errors gracefully', async () => {
      // Arrange
      const invalidUrl = null as unknown as string

      // Act
      const result = await manager.processUrl(invalidUrl)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(false)
        expect(result.data.error).toContain('Invalid URL')
      }
    })
  })

  describe('convertChromeToToubkal()', () => {
    it('should convert supported chrome:// URLs to toubkal:// URLs (AC1)', () => {
      // Arrange
      const chromeUrl = LEGACY_CHROME_URLS.SETTINGS

      // Act
      const result = manager.convertChromeToToubkal(chromeUrl)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(INTERNAL_PAGES.SETTINGS)
      }
    })

    it('should handle unsupported chrome:// URLs', () => {
      // Arrange
      const unsupportedChromeUrl = 'chrome://unsupported'

      // Act
      const result = manager.convertChromeToToubkal(unsupportedChromeUrl)

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('No toubkal:// equivalent')
      }
    })

    it('should handle errors gracefully', () => {
      // Arrange
      const invalidUrl = null as unknown as string

      // Act
      const result = manager.convertChromeToToubkal(invalidUrl)

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })
  })

  describe('getInternalPages()', () => {
    it('should return all internal pages (AC2)', () => {
      // Act
      const pages = manager.getInternalPages()

      // Assert
      expect(pages).toBeDefined()
      expect(pages.SETTINGS).toBe(INTERNAL_PAGES.SETTINGS)
      expect(pages.NEW_TAB).toBe(INTERNAL_PAGES.NEW_TAB)
      expect(pages.AUDIT).toBe(INTERNAL_PAGES.AUDIT)
      expect(pages.AI).toBe(INTERNAL_PAGES.AI)
    })
  })

  describe('getRedirects()', () => {
    it('should return all URL redirects (AC6)', () => {
      // Act
      const redirects = manager.getRedirects()

      // Assert
      expect(redirects).toBeDefined()
      expect(redirects[LEGACY_CHROME_URLS.SETTINGS]).toBe(INTERNAL_PAGES.SETTINGS)
      expect(redirects[LEGACY_CHROME_URLS.NEW_TAB]).toBe(INTERNAL_PAGES.NEW_TAB)
    })
  })

  describe('getRemovedBraveUrls()', () => {
    it('should return all removed Brave URLs (AC3)', () => {
      // Act
      const removedUrls = manager.getRemovedBraveUrls()

      // Assert
      expect(removedUrls).toBeDefined()
      expect(removedUrls).toContain(REMOVED_BRAVE_URLS.REWARDS)
      expect(removedUrls).toContain(REMOVED_BRAVE_URLS.WALLET)
      expect(removedUrls).toContain(REMOVED_BRAVE_URLS.REFERRALS)
    })
  })

  describe('shouldRedirect()', () => {
    it('should identify URLs that should be redirected (AC6)', () => {
      // Arrange
      const chromeUrl = LEGACY_CHROME_URLS.SETTINGS
      const toubkalUrl = INTERNAL_PAGES.SETTINGS

      // Act & Assert
      expect(manager.shouldRedirect(chromeUrl)).toBe(true)
      expect(manager.shouldRedirect(toubkalUrl)).toBe(false)
    })
  })

  describe('getRedirectUrl()', () => {
    it('should return redirect URL for supported chrome:// URLs (AC6)', () => {
      // Arrange
      const chromeUrl = LEGACY_CHROME_URLS.SETTINGS

      // Act
      const redirectUrl = manager.getRedirectUrl(chromeUrl)

      // Assert
      expect(redirectUrl).toBe(INTERNAL_PAGES.SETTINGS)
    })

    it('should return null for unsupported URLs', () => {
      // Arrange
      const unsupportedUrl = 'chrome://unsupported'

      // Act
      const redirectUrl = manager.getRedirectUrl(unsupportedUrl)

      // Assert
      expect(redirectUrl).toBeNull()
    })
  })

  describe('checkPerformanceImpact()', () => {
    it('should check performance impact within threshold (AC8)', async () => {
      // Arrange
      mockPerformanceNow
        .mockReturnValueOnce(0) // Start time
        .mockReturnValueOnce(2) // End time (2ms)

      // Act - need to call processUrl first to populate metrics
      await manager.processUrl(INTERNAL_PAGES.SETTINGS)
      const result = manager.checkPerformanceImpact()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.impact).toBe(2)
        expect(result.data.withinThreshold).toBe(true)
      }
    })

    it('should detect performance impact exceeding threshold (AC8)', async () => {
      // Arrange
      manager.clearPerformanceMetrics() // Clear previous test data
      mockPerformanceNow
        .mockReturnValueOnce(0) // Start time
        .mockReturnValueOnce(10) // End time (10ms, exceeds 5ms threshold)

      // Act - need to call processUrl first to populate metrics
      await manager.processUrl(INTERNAL_PAGES.SETTINGS)
      const result = manager.checkPerformanceImpact()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.impact).toBe(10)
        expect(result.data.withinThreshold).toBe(false)
      }
    })
  })

  describe('performance metrics', () => {
    it('should track performance metrics', async () => {
      // Arrange
      mockPerformanceNow
        .mockReturnValueOnce(0) // Start time
        .mockReturnValueOnce(5) // End time

      // Act
      await manager.processUrl(INTERNAL_PAGES.SETTINGS)
      const metrics = manager.getPerformanceMetrics()

      // Assert
      expect(metrics.processUrl).toBe(5)
    })

    it('should clear performance metrics', async () => {
      // Arrange
      await manager.processUrl(INTERNAL_PAGES.SETTINGS)

      // Act
      manager.clearPerformanceMetrics()
      const metrics = manager.getPerformanceMetrics()

      // Assert
      expect(Object.keys(metrics)).toHaveLength(0)
    })
  })

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      // Act
      const instance1 = UrlSchemeManager.getInstance()
      const instance2 = UrlSchemeManager.getInstance()

      // Assert
      expect(instance1).toBe(instance2)
    })
  })
})
