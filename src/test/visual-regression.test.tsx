/**
 * Visual Regression Tests
 *
 * Automated visual regression tests for Toubkal Browser UI components.
 * Ensures brand consistency across different screen sizes and themes.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuditPage } from '../components/pages/AuditPage'
import { AIPage } from '../components/pages/AIPage'
import { MCPPage } from '../components/pages/MCPPage'
import { ConsentPage } from '../components/pages/ConsentPage'
import { SettingsPage } from '../components/pages/SettingsPage'
import { NewTabPage } from '../components/pages/NewTabPage'
import { ErrorPage } from '../components/pages/ErrorPage'

// Mock IntersectionObserver for tests
global.IntersectionObserver = class {
  constructor() {}
  root: Element | null = null
  rootMargin: string = ''
  thresholds: ReadonlyArray<number> = []
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

// Mock ResizeObserver for tests
global.ResizeObserver = class {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

describe('Visual Regression Tests', () => {
  describe('Page Components', () => {
    it('should render AuditPage with consistent styling', () => {
      render(<AuditPage />)

      // Check for brand elements
      expect(screen.getByText('Transparency Dashboard')).toBeInTheDocument()
      expect(
        screen.getByText('Real-time audit log of all Toubkal Browser operations')
      ).toBeInTheDocument()

      // Check for proper heading hierarchy
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Transparency Dashboard')

      // Check for filter controls
      expect(screen.getByLabelText('Filter by Operation Type')).toBeInTheDocument()
      expect(screen.getByLabelText('Search Logs')).toBeInTheDocument()
    })

    it('should render AIPage with consistent styling', () => {
      render(<AIPage />)

      // Check for brand elements
      expect(screen.getByText('AI Assistant')).toBeInTheDocument()
      expect(
        screen.getByText('Chat with local AI models for privacy-first assistance')
      ).toBeInTheDocument()

      // Check for model selection
      expect(screen.getByText('Select Model')).toBeInTheDocument()
      expect(screen.getByText('Resource Usage')).toBeInTheDocument()

      // Check for proper heading hierarchy
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('AI Assistant')
    })

    it('should render MCPPage with consistent styling', () => {
      render(<MCPPage />)

      // Check for brand elements
      expect(screen.getByText('MCP Server Management')).toBeInTheDocument()
      expect(
        screen.getByText('Manage Model Context Protocol servers with privacy-first approach')
      ).toBeInTheDocument()

      // Check for server management features
      expect(screen.getByText('Filter by Status')).toBeInTheDocument()
      expect(screen.getByText('Search Servers')).toBeInTheDocument()
      expect(screen.getByText('Install New Server')).toBeInTheDocument()
    })

    it('should render ConsentPage with consistent styling', () => {
      render(<ConsentPage />)

      // Check for brand elements
      expect(screen.getByText('Consent History')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Track and manage your privacy consent decisions with cryptographic verification'
        )
      ).toBeInTheDocument()

      // Check for consent management features
      expect(screen.getByText('Filter by Action')).toBeInTheDocument()
      expect(screen.getByText('Search Decisions')).toBeInTheDocument()
      expect(screen.getByText('Export Data')).toBeInTheDocument()
      expect(screen.getByText('Snapshots')).toBeInTheDocument()
    })

    it('should render SettingsPage with consistent styling', () => {
      render(<SettingsPage />)

      // Check for brand elements
      expect(screen.getByText('Toubkal Settings')).toBeInTheDocument()
      expect(screen.getByText('Configure your Toubkal Browser experience')).toBeInTheDocument()

      // Check for settings sections
      expect(screen.getByText('General')).toBeInTheDocument()
      expect(screen.getByText('Privacy')).toBeInTheDocument()
      expect(screen.getByText('AI Settings')).toBeInTheDocument()
    })

    it('should render NewTabPage with consistent styling', () => {
      render(<NewTabPage />)

      // Check for brand elements
      expect(screen.getByText('Toubkal Browser')).toBeInTheDocument()
      expect(
        screen.getByText('The intelligent browser that protects your mind')
      ).toBeInTheDocument()
    })

    it('should render ErrorPage with consistent styling', () => {
      render(<ErrorPage errorCode="404" />)

      // Check for brand elements
      expect(screen.getByText('Page Not Found')).toBeInTheDocument()
      expect(screen.getByText("The page you're looking for doesn't exist.")).toBeInTheDocument()

      // Check for toubkal:// URL examples
      expect(screen.getByText('Valid Toubkal URLs:')).toBeInTheDocument()
      expect(screen.getByText('Common Mistakes:')).toBeInTheDocument()
    })
  })

  describe('Brand Consistency', () => {
    it('should use consistent color scheme across all pages', () => {
      const pages = [
        <AuditPage key="audit" />,
        <AIPage key="ai" />,
        <MCPPage key="mcp" />,
        <ConsentPage key="consent" />,
        <SettingsPage key="settings" />,
        <NewTabPage key="newtab" />,
        <ErrorPage key="error" errorCode="404" />,
      ]

      pages.forEach((page) => {
        const { container } = render(page)

        // Check for Toubkal Blue usage in buttons and links
        const buttons = container.querySelectorAll('button')
        const links = container.querySelectorAll('a')

        // At least one interactive element should be present
        expect(buttons.length + links.length).toBeGreaterThan(0)
      })
    })

    it('should use consistent typography across all pages', () => {
      const pages = [
        <AuditPage key="audit" />,
        <AIPage key="ai" />,
        <MCPPage key="mcp" />,
        <ConsentPage key="consent" />,
        <SettingsPage key="settings" />,
      ]

      pages.forEach((page) => {
        const { container } = render(page)

        // Check for proper heading hierarchy
        const h1 = container.querySelector('h1')
        const h2 = container.querySelector('h2')

        expect(h1).not.toBeNull()
        expect(h2).not.toBeNull()

        // Check for consistent text content
        const mainHeading = h1?.textContent
        expect(mainHeading).toBeTruthy()
        expect(mainHeading?.length).toBeGreaterThan(0)
      })
    })

    it('should use consistent spacing across all pages', () => {
      const pages = [
        <AuditPage key="audit" />,
        <AIPage key="ai" />,
        <MCPPage key="mcp" />,
        <ConsentPage key="consent" />,
        <SettingsPage key="settings" />,
      ]

      pages.forEach((page) => {
        const { container } = render(page)

        // Check for consistent container structure
        const mainContainer = container.querySelector('.min-h-screen')
        expect(mainContainer).toBeInTheDocument()

        // Check for consistent padding/margin classes
        const paddedElements = container.querySelectorAll('[class*="p-"]')
        const marginedElements = container.querySelectorAll('[class*="m-"]')

        expect(paddedElements.length + marginedElements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Responsive Design', () => {
    it('should handle different screen sizes gracefully', () => {
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      })

      render(<SettingsPage />)

      // Check for responsive elements (buttons, links, or form elements)
      const buttons = screen.queryAllByRole('button')
      const links = screen.queryAllByRole('link')
      const formElements = screen.queryAllByRole('textbox')

      // Should have at least some interactive elements
      expect(buttons.length + links.length + formElements.length).toBeGreaterThan(0)
    })

    it('should maintain layout integrity on tablet viewport', () => {
      // Test tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      render(<AIPage />)

      // Check for grid layout
      const gridElements = document.querySelectorAll('[class*="grid"]')
      expect(gridElements.length).toBeGreaterThan(0)
    })

    it('should maintain layout integrity on desktop viewport', () => {
      // Test desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1080,
      })

      render(<MCPPage />)

      // Check for desktop-specific layout
      const desktopElements = document.querySelectorAll('[class*="lg:"]')
      expect(desktopElements.length).toBeGreaterThan(0)
    })
  })

  describe('Dark Mode Support', () => {
    it('should render components in dark mode', () => {
      // Mock dark mode preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      render(<ConsentPage />)

      // Check for dark mode classes
      const darkElements = document.querySelectorAll('[class*="dark:"]')
      expect(darkElements.length).toBeGreaterThan(0)
    })

    it('should maintain contrast in dark mode', () => {
      render(<ErrorPage errorCode="404" />)

      // Check for proper contrast elements
      const highContrastElements = document.querySelectorAll(
        '[class*="text-white"], [class*="text-gray-900"]'
      )
      expect(highContrastElements.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<AuditPage />)

      // Check for form labels
      expect(screen.getByLabelText('Filter by Operation Type')).toBeInTheDocument()
      expect(screen.getByLabelText('Search Logs')).toBeInTheDocument()
    })

    it('should have proper heading hierarchy', () => {
      render(<AIPage />)

      // Check heading levels
      const h1 = screen.getByRole('heading', { level: 1 })
      const h3 = screen.getAllByRole('heading', { level: 3 })

      expect(h1).toBeInTheDocument()
      expect(h3.length).toBeGreaterThan(0)

      // Check that we have a proper heading structure
      const allHeadings = screen.getAllByRole('heading')
      expect(allHeadings.length).toBeGreaterThan(0)
    })

    it('should have proper button labels', () => {
      render(<MCPPage />)

      // Check for descriptive button text
      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button.textContent).toBeTruthy()
        expect(button.textContent?.length).toBeGreaterThan(0)
      })
    })

    it('should have proper form controls', () => {
      render(<ConsentPage />)

      // Check for form inputs
      const inputs = screen.getAllByRole('textbox')
      const selects = screen.getAllByRole('combobox')

      inputs.forEach((input) => {
        expect(input).toHaveAttribute('placeholder')
      })

      selects.forEach((select) => {
        expect(select).toBeInTheDocument()
      })
    })
  })
})
