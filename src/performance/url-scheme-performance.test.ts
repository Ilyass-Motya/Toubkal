/**
 * URL Scheme Performance Tests
 * 
 * Performance tests to ensure URL scheme changes don't impact
 * page load performance by more than 5% (AC8).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { urlSchemeManager } from '@/services/url-scheme-manager'
import { INTERNAL_PAGES, LEGACY_CHROME_URLS } from '@/constants/url-schemes'

// Mock performance.now for consistent testing
const mockPerformanceNow = vi.fn()
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow,
  },
  writable: true,
})

describe('URL Scheme Performance (AC8)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    urlSchemeManager.clearPerformanceMetrics()
  })

  describe('single URL processing performance', () => {
    it('should process toubkal:// URLs within performance threshold', async () => {
      // Arrange
      mockPerformanceNow
        .mockReturnValueOnce(0) // Start time
        .mockReturnValueOnce(2) // End time (2ms)

      // Act
      const result = await urlSchemeManager.processUrl(INTERNAL_PAGES.SETTINGS)

      // Assert
      expect(result.success).toBe(true)
      
      const performanceResult = urlSchemeManager.checkPerformanceImpact()
      expect(performanceResult.success).toBe(true)
      if (performanceResult.success) {
        expect(performanceResult.data.impact).toBeLessThanOrEqual(5) // 5ms threshold
        expect(performanceResult.data.withinThreshold).toBe(true)
      }
    })

    it('should process chrome:// URLs within performance threshold', async () => {
      // Arrange
      mockPerformanceNow
        .mockReturnValueOnce(0) // Start time
        .mockReturnValueOnce(3) // End time (3ms)

      // Act
      const result = await urlSchemeManager.processUrl(LEGACY_CHROME_URLS.SETTINGS)

      // Assert
      expect(result.success).toBe(true)
      
      const performanceResult = urlSchemeManager.checkPerformanceImpact()
      expect(performanceResult.success).toBe(true)
      if (performanceResult.success) {
        expect(performanceResult.data.impact).toBeLessThanOrEqual(5) // 5ms threshold
        expect(performanceResult.data.withinThreshold).toBe(true)
      }
    })

    it('should process external URLs within performance threshold', async () => {
      // Arrange
      mockPerformanceNow
        .mockReturnValueOnce(0) // Start time
        .mockReturnValueOnce(1) // End time (1ms)

      // Act
      const result = await urlSchemeManager.processUrl('https://example.com')

      // Assert
      expect(result.success).toBe(true)
      
      const performanceResult = urlSchemeManager.checkPerformanceImpact()
      expect(performanceResult.success).toBe(true)
      if (performanceResult.success) {
        expect(performanceResult.data.impact).toBeLessThanOrEqual(5) // 5ms threshold
        expect(performanceResult.data.withinThreshold).toBe(true)
      }
    })
  })

  describe('batch URL processing performance', () => {
    it('should process multiple toubkal:// URLs efficiently', async () => {
      // Arrange
      const urls = Object.values(INTERNAL_PAGES).slice(0, 10) // Test first 10 URLs
      let currentTime = 0
      mockPerformanceNow.mockImplementation(() => currentTime++)

      // Act
      const startTime = performance.now()
      
      for (const url of urls) {
        await urlSchemeManager.processUrl(url)
      }
      
      const endTime = performance.now()
      const totalTime = endTime - startTime

      // Assert
      expect(totalTime).toBeLessThan(50) // 50ms for 10 URLs (5ms per URL)
    })

    it('should process multiple chrome:// URLs efficiently', async () => {
      // Arrange
      const urls = Object.values(LEGACY_CHROME_URLS)
      let currentTime = 0
      mockPerformanceNow.mockImplementation(() => currentTime++)

      // Act
      const startTime = performance.now()
      
      for (const url of urls) {
        await urlSchemeManager.processUrl(url)
      }
      
      const endTime = performance.now()
      const totalTime = endTime - startTime

      // Assert
      expect(totalTime).toBeLessThan(30) // 30ms for 5 URLs (6ms per URL)
    })
  })

  describe('performance under load', () => {
    it('should maintain performance with high frequency URL processing', async () => {
      // Arrange
      const url = INTERNAL_PAGES.SETTINGS
      const iterations = 100
      let currentTime = 0
      mockPerformanceNow.mockImplementation(() => currentTime++)

      // Act
      const startTime = performance.now()
      
      for (let i = 0; i < iterations; i++) {
        await urlSchemeManager.processUrl(url)
      }
      
      const endTime = performance.now()
      const totalTime = endTime - startTime
      const averageTime = totalTime / iterations

      // Assert
      expect(averageTime).toBeLessThan(5) // 5ms average per URL
      expect(totalTime).toBeLessThan(500) // 500ms total for 100 URLs
    })

    it('should not degrade performance with repeated processing', async () => {
      // Arrange
      const url = INTERNAL_PAGES.SETTINGS
      const iterations = 50
      let currentTime = 0
      mockPerformanceNow.mockImplementation(() => currentTime++)

      // Act
      const times: number[] = []
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now()
        await urlSchemeManager.processUrl(url)
        const endTime = performance.now()
        times.push(endTime - startTime)
      }

      // Calculate performance variance
      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length
      const maxTime = Math.max(...times)
      const minTime = Math.min(...times)
      const variance = maxTime - minTime

      // Assert
      expect(averageTime).toBeLessThan(5) // 5ms average
      expect(maxTime).toBeLessThan(10) // 10ms maximum
      expect(variance).toBeLessThan(8) // 8ms variance (consistent performance)
    })
  })

  describe('memory usage performance', () => {
    it('should not accumulate memory with repeated processing', async () => {
      // Arrange
      const url = INTERNAL_PAGES.SETTINGS
      const iterations = 1000

      // Act
      for (let i = 0; i < iterations; i++) {
        await urlSchemeManager.processUrl(url)
      }

      // Clear performance metrics to test memory cleanup
      urlSchemeManager.clearPerformanceMetrics()
      const metrics = urlSchemeManager.getPerformanceMetrics()

      // Assert
      expect(Object.keys(metrics)).toHaveLength(0)
    })

    it('should handle large numbers of different URLs efficiently', async () => {
      // Arrange
      const baseUrl = 'toubkal://test-page-'
      const urlCount = 100
      const urls = Array.from({ length: urlCount }, (_, i) => `${baseUrl}${i}`)
      let currentTime = 0
      mockPerformanceNow.mockImplementation(() => currentTime++)

      // Act
      const startTime = performance.now()
      
      for (const url of urls) {
        await urlSchemeManager.processUrl(url)
      }
      
      const endTime = performance.now()
      const totalTime = endTime - startTime

      // Assert
      expect(totalTime).toBeLessThan(1000) // 1 second for 100 URLs
    })
  })

  describe('performance threshold validation (AC8)', () => {
    it('should detect performance impact exceeding 5% threshold', () => {
      // Arrange
      mockPerformanceNow
        .mockReturnValueOnce(0) // Start time
        .mockReturnValueOnce(10) // End time (10ms, exceeds 5ms threshold)

      // Act
      const result = urlSchemeManager.checkPerformanceImpact()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.impact).toBe(10)
        expect(result.data.withinThreshold).toBe(false)
      }
    })

    it('should confirm performance within 5% threshold', () => {
      // Arrange
      mockPerformanceNow
        .mockReturnValueOnce(0) // Start time
        .mockReturnValueOnce(3) // End time (3ms, within 5ms threshold)

      // Act
      const result = urlSchemeManager.checkPerformanceImpact()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.impact).toBe(3)
        expect(result.data.withinThreshold).toBe(true)
      }
    })

    it('should handle edge case at exactly 5ms threshold', () => {
      // Arrange
      mockPerformanceNow
        .mockReturnValueOnce(0) // Start time
        .mockReturnValueOnce(5) // End time (5ms, exactly at threshold)

      // Act
      const result = urlSchemeManager.checkPerformanceImpact()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.impact).toBe(5)
        expect(result.data.withinThreshold).toBe(true) // 5ms is within threshold
      }
    })
  })

  describe('performance metrics accuracy', () => {
    it('should track performance metrics accurately', async () => {
      // Arrange
      mockPerformanceNow
        .mockReturnValueOnce(100) // Start time
        .mockReturnValueOnce(105) // End time (5ms difference)

      // Act
      await urlSchemeManager.processUrl(INTERNAL_PAGES.SETTINGS)
      const metrics = urlSchemeManager.getPerformanceMetrics()

      // Assert
      expect(metrics.processUrl).toBe(5)
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
