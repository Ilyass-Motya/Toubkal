/**
 * Toubkal Router Tests
 *
 * Test suite for ToubkalRouter component covering URL processing,
 * redirects, and error handling as per AC6 and AC7.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Result } from '../../../app/shared/types/CommonTypes'
import { UrlValidationResult } from '../../../app/shared/services/url-scheme-manager'
import ToubkalRouter from '../../../app/core/routing/ToubkalRouter'
import { urlSchemeManager } from '../../../app/shared/services/url-scheme-manager'
import { INTERNAL_PAGES, LEGACY_CHROME_URLS } from '../../../app/shared/constants/url-schemes'

// Mock the URL scheme manager
vi.mock('../../../app/shared/services/url-scheme-manager', () => ({
  urlSchemeManager: {
    processUrl: vi.fn(),
  },
}))

const mockUrlSchemeManager = vi.mocked(urlSchemeManager)

describe('ToubkalRouter', () => {
  const mockOnNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('valid toubkal:// URLs', () => {
    it('should render children for valid toubkal:// URLs', async () => {
      // Arrange
      mockUrlSchemeManager.processUrl.mockResolvedValue({
        success: true,
        data: {
          isValid: true,
          isInternal: true,
          isLegacy: false,
          isRemoved: false,
        },
      })

      // Act
      render(
        <ToubkalRouter currentUrl={INTERNAL_PAGES.SETTINGS} onNavigate={mockOnNavigate}>
          <div data-testid="test-content">Test Content</div>
        </ToubkalRouter>
      )

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('test-content')).toBeInTheDocument()
      })
    })
  })

  describe('chrome:// URL redirects (AC6)', () => {
    it('should show redirect notification for chrome:// URLs', async () => {
      // Arrange
      mockUrlSchemeManager.processUrl.mockResolvedValue({
        success: true,
        data: {
          isValid: true,
          isInternal: false,
          isLegacy: true,
          isRemoved: false,
          redirectUrl: INTERNAL_PAGES.SETTINGS,
        },
      })

      // Act
      render(
        <ToubkalRouter currentUrl={LEGACY_CHROME_URLS.SETTINGS} onNavigate={mockOnNavigate}>
          <div data-testid="test-content">Test Content</div>
        </ToubkalRouter>
      )

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Redirecting...')).toBeInTheDocument()
      })

      expect(screen.getByText(/chrome:\/\/ URL has been moved/)).toBeInTheDocument()
      expect(
        screen.getByText(`${LEGACY_CHROME_URLS.SETTINGS} → ${INTERNAL_PAGES.SETTINGS}`)
      ).toBeInTheDocument()
    })

    it('should auto-redirect after showing notification', async () => {
      // Arrange
      mockUrlSchemeManager.processUrl.mockResolvedValue({
        success: true,
        data: {
          isValid: true,
          isInternal: false,
          isLegacy: true,
          isRemoved: false,
          redirectUrl: INTERNAL_PAGES.SETTINGS,
        },
      })

      // Act
      render(
        <ToubkalRouter currentUrl={LEGACY_CHROME_URLS.SETTINGS} onNavigate={mockOnNavigate}>
          <div data-testid="test-content">Test Content</div>
        </ToubkalRouter>
      )

      // Wait for redirect notification to appear
      await waitFor(() => {
        expect(screen.getByText('Redirecting...')).toBeInTheDocument()
      })

      // Assert auto-redirect happens after timeout
      await waitFor(
        () => {
          expect(mockOnNavigate).toHaveBeenCalledWith(INTERNAL_PAGES.SETTINGS)
        },
        { timeout: 2000 }
      )
    })
  })

  describe('removed Brave URLs (AC3)', () => {
    it('should show error for removed Brave URLs', async () => {
      // Arrange
      mockUrlSchemeManager.processUrl.mockResolvedValue({
        success: true,
        data: {
          isValid: false,
          isInternal: false,
          isLegacy: false,
          isRemoved: true,
          error: 'This Brave URL is no longer supported. Please use the equivalent Toubkal page.',
        },
      })

      // Act
      render(
        <ToubkalRouter currentUrl="brave://rewards" onNavigate={mockOnNavigate}>
          <div data-testid="test-content">Test Content</div>
        </ToubkalRouter>
      )

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(
            'This Brave URL is no longer supported. Please use the equivalent Toubkal page.'
          )
        ).toBeInTheDocument()
      })
    })
  })

  describe('invalid URLs', () => {
    it('should show error page for invalid URLs', async () => {
      // Arrange
      mockUrlSchemeManager.processUrl.mockResolvedValue({
        success: true,
        data: {
          isValid: false,
          isInternal: false,
          isLegacy: false,
          isRemoved: false,
          error: 'Invalid URL',
        },
      })

      // Act
      render(
        <ToubkalRouter currentUrl="invalid-url" onNavigate={mockOnNavigate}>
          <div data-testid="test-content">Test Content</div>
        </ToubkalRouter>
      )

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Page Not Found')).toBeInTheDocument()
        expect(screen.getByText('Invalid URL')).toBeInTheDocument()
      })
    })

    it('should show valid URL examples in error page', async () => {
      // Arrange
      mockUrlSchemeManager.processUrl.mockResolvedValue({
        success: true,
        data: {
          isValid: false,
          isInternal: false,
          isLegacy: false,
          isRemoved: false,
          error: 'Invalid URL',
        },
      })

      // Act
      render(
        <ToubkalRouter currentUrl="invalid-url" onNavigate={mockOnNavigate}>
          <div data-testid="test-content">Test Content</div>
        </ToubkalRouter>
      )

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Valid Toubkal URLs:')).toBeInTheDocument()
        expect(screen.getByText(INTERNAL_PAGES.SETTINGS)).toBeInTheDocument()
        expect(screen.getByText(INTERNAL_PAGES.NEW_TAB)).toBeInTheDocument()
      })
    })

    it('should show common mistakes in error page', async () => {
      // Arrange
      mockUrlSchemeManager.processUrl.mockResolvedValue({
        success: true,
        data: {
          isValid: false,
          isInternal: false,
          isLegacy: false,
          isRemoved: false,
          error: 'Invalid URL',
        },
      })

      // Act
      render(
        <ToubkalRouter currentUrl="invalid-url" onNavigate={mockOnNavigate}>
          <div data-testid="test-content">Test Content</div>
        </ToubkalRouter>
      )

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Common Mistakes:')).toBeInTheDocument()
        expect(screen.getByText('toubkal://setting')).toBeInTheDocument()
        expect(screen.getByText('toubkal://settigns')).toBeInTheDocument()
      })
    })

    it('should allow navigation to settings from error page', async () => {
      // Arrange
      const user = userEvent.setup()
      mockUrlSchemeManager.processUrl.mockResolvedValue({
        success: true,
        data: {
          isValid: false,
          isInternal: false,
          isLegacy: false,
          isRemoved: false,
          error: 'Invalid URL',
        },
      })

      // Act
      render(
        <ToubkalRouter currentUrl="invalid-url" onNavigate={mockOnNavigate}>
          <div data-testid="test-content">Test Content</div>
        </ToubkalRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Go to Settings')).toBeInTheDocument()
      })

      const settingsButton = screen.getByText('Go to Settings')
      await user.click(settingsButton)

      // Assert
      expect(mockOnNavigate).toHaveBeenCalledWith(INTERNAL_PAGES.SETTINGS)
    })
  })

  describe('loading state', () => {
    it('should show loading state while processing URL', async () => {
      // Arrange
      let resolveProcessUrl: (value: Result<UrlValidationResult>) => void = () => {}
      const processUrlPromise = new Promise<Result<UrlValidationResult>>((resolve) => {
        resolveProcessUrl = resolve
      })
      mockUrlSchemeManager.processUrl.mockReturnValue(processUrlPromise)

      // Act
      render(
        <ToubkalRouter currentUrl={INTERNAL_PAGES.SETTINGS} onNavigate={mockOnNavigate}>
          <div data-testid="test-content">Test Content</div>
        </ToubkalRouter>
      )

      // Assert
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.queryByTestId('test-content')).not.toBeInTheDocument()

      // Resolve the promise
      resolveProcessUrl({
        success: true,
        data: {
          isValid: true,
          isInternal: true,
          isLegacy: false,
          isRemoved: false,
        },
      })

      await waitFor(() => {
        expect(screen.getByTestId('test-content')).toBeInTheDocument()
      })
    })
  })

  describe('error handling', () => {
    it('should handle URL scheme manager errors', async () => {
      // Arrange
      mockUrlSchemeManager.processUrl.mockRejectedValue(new Error('Processing failed'))

      // Act
      render(
        <ToubkalRouter currentUrl={INTERNAL_PAGES.SETTINGS} onNavigate={mockOnNavigate}>
          <div data-testid="test-content">Test Content</div>
        </ToubkalRouter>
      )

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Processing failed')).toBeInTheDocument()
      })
    })
  })

  describe('URL changes', () => {
    it('should handle URL changes', () => {
      // Arrange
      mockUrlSchemeManager.processUrl.mockResolvedValue({
        success: true,
        data: {
          isValid: true,
          isInternal: true,
          isLegacy: false,
          isRemoved: false,
        },
      })

      const { rerender } = render(
        <ToubkalRouter currentUrl={INTERNAL_PAGES.SETTINGS} onNavigate={mockOnNavigate}>
          <div data-testid="test-content">Test Content</div>
        </ToubkalRouter>
      )

      // Act - change URL
      rerender(
        <ToubkalRouter currentUrl={INTERNAL_PAGES.NEW_TAB} onNavigate={mockOnNavigate}>
          <div data-testid="test-content">Test Content</div>
        </ToubkalRouter>
      )

      // Assert
      expect(mockUrlSchemeManager.processUrl).toHaveBeenCalledWith(INTERNAL_PAGES.NEW_TAB)
    })
  })
})
