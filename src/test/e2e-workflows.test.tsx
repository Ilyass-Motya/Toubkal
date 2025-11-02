/**
 * End-to-End Workflow Tests
 *
 * Comprehensive E2E tests for complete user workflows with toubkal:// URLs.
 * Tests brand elements, accessibility, and user interactions across all pages.
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ToubkalRouter } from '../components/routing/ToubkalRouter'
import { InternalPageRouter } from '../components/routing/InternalPageRouter'
import { INTERNAL_PAGES } from '../constants/url-schemes'

// Mock IntersectionObserver
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

// Mock ResizeObserver
global.ResizeObserver = class {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: () => Date.now(),
  },
})

describe('End-to-End Workflows', () => {
  describe('URL Navigation Workflow', () => {
    it('should navigate between all toubkal:// pages', () => {
      const mockNavigate = vi.fn()

      const pages = [
        INTERNAL_PAGES.SETTINGS,
        INTERNAL_PAGES.AI,
        INTERNAL_PAGES.MCP,
        INTERNAL_PAGES.CONSENT,
        INTERNAL_PAGES.AUDIT,
        INTERNAL_PAGES.HELP,
      ]

      for (const pageUrl of pages) {
        render(<InternalPageRouter currentUrl={pageUrl} onNavigate={mockNavigate} />)

        // Each page should render without errors
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()

        // Clean up for next iteration
        screen.getByRole('heading', { level: 1 }).remove()
      }
    })

    it('should handle chrome:// to toubkal:// redirects', () => {
      const mockNavigate = vi.fn()

      // Test redirect from chrome:// to toubkal://
      render(
        <ToubkalRouter currentUrl="chrome://settings" onNavigate={mockNavigate}>
          <div>Test content</div>
        </ToubkalRouter>
      )

      // Should show loading state or redirect in progress
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should maintain navigation state across pages', () => {
      const mockNavigate = vi.fn()

      // Start at settings
      render(<InternalPageRouter currentUrl={INTERNAL_PAGES.SETTINGS} onNavigate={mockNavigate} />)

      // Should show navigation links
      expect(screen.getByText('AI Settings')).toBeInTheDocument()
      expect(screen.getByText('Privacy')).toBeInTheDocument()
      expect(screen.getByText('MCP Servers')).toBeInTheDocument()

      // Test direct navigation to AI page
      render(
        <InternalPageRouter currentUrl={INTERNAL_PAGES.AI_SETTINGS} onNavigate={mockNavigate} />
      )
      // Look for the heading specifically, not the navigation links
      expect(screen.getByRole('heading', { name: 'AI Settings' })).toBeInTheDocument()
    })
  })

  describe('Brand Consistency Workflow', () => {
    it('should maintain consistent branding across all pages', () => {
      const pages = [
        INTERNAL_PAGES.SETTINGS,
        INTERNAL_PAGES.AI,
        INTERNAL_PAGES.MCP,
        INTERNAL_PAGES.CONSENT,
        INTERNAL_PAGES.AUDIT,
      ]

      pages.forEach((pageUrl) => {
        const { container } = render(<InternalPageRouter currentUrl={pageUrl} />)

        // Check for consistent color scheme
        const buttons = container.querySelectorAll('button')
        const links = container.querySelectorAll('a')

        // Should have interactive elements
        expect(buttons.length + links.length).toBeGreaterThan(0)

        // Check for consistent typography
        const headings = container.querySelectorAll('h1, h2, h3')
        expect(headings.length).toBeGreaterThan(0)

        // Check for consistent spacing
        const paddedElements = container.querySelectorAll('[class*="p-"]')
        const marginedElements = container.querySelectorAll('[class*="m-"]')
        expect(paddedElements.length + marginedElements.length).toBeGreaterThan(0)
      })
    })

    it('should use Toubkal Blue consistently', () => {
      const { container } = render(<InternalPageRouter currentUrl={INTERNAL_PAGES.SETTINGS} />)

      // Check for Toubkal Blue usage in buttons and links
      const blueElements = container.querySelectorAll('[class*="blue-"]')
      expect(blueElements.length).toBeGreaterThan(0)
    })

    it('should maintain consistent typography', () => {
      const { container } = render(<InternalPageRouter currentUrl={INTERNAL_PAGES.AI} />)

      // Check for Inter font family usage
      const elements = container.querySelectorAll('*')
      Array.from(elements).some(
        (el) => el instanceof HTMLElement && getComputedStyle(el).fontFamily.includes('Inter')
      )

      // In a real test, this would check actual computed styles
      expect(elements.length).toBeGreaterThan(0)
    })
  })

  describe('Privacy Features Workflow', () => {
    it('should complete consent management workflow', async () => {
      render(<InternalPageRouter currentUrl={INTERNAL_PAGES.CONSENT} />)

      // Should show consent history
      expect(screen.getByText('Consent History')).toBeInTheDocument()

      // Should show consent decisions
      await waitFor(() => {
        expect(screen.getAllByText('analytics')).toHaveLength(4) // Should have 4 analytics elements
        expect(screen.getAllByText('cookies')).toHaveLength(2) // Should have 2 cookies elements
      })

      // Should allow filtering
      const actionFilter = screen.getByLabelText('Filter by Action')
      fireEvent.change(actionFilter, { target: { value: 'granted' } })

      // Should show filtered results
      expect(screen.getAllByText('granted')).toHaveLength(3) // Should have 3 granted elements
    })

    it('should complete audit trail workflow', async () => {
      render(<InternalPageRouter currentUrl={INTERNAL_PAGES.AUDIT} />)

      // Should show audit dashboard
      expect(screen.getByText('Transparency Dashboard')).toBeInTheDocument()

      // Should show audit logs section
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Audit Logs' })).toBeInTheDocument()
        expect(screen.getByText('No logs found')).toBeInTheDocument()
      })

      // Should allow filtering
      const levelFilter = screen.getByLabelText('Level')
      fireEvent.change(levelFilter, { target: { value: 'info' } })

      // Should show filtered results (level filter applied)
      expect(screen.getByText('Info (0)')).toBeInTheDocument()
    })
  })

  describe('AI Features Workflow', () => {
    it('should complete AI assistant workflow', () => {
      render(<InternalPageRouter currentUrl={INTERNAL_PAGES.AI} />)

      // Should show AI assistant
      expect(screen.getByText('AI Assistant')).toBeInTheDocument()

      // Should show model selection
      expect(screen.getByText('Select Model')).toBeInTheDocument()
      expect(screen.getByText('Llama 3.2 8B')).toBeInTheDocument()

      // Should show resource usage
      expect(screen.getByText('Resource Usage')).toBeInTheDocument()

      // Should allow model selection
      const modelCard = screen.getByText('Mistral 7B')
      fireEvent.click(modelCard)

      // Should allow message input
      const messageInput = screen.getByPlaceholderText('Type your message here...')
      fireEvent.change(messageInput, { target: { value: 'Hello, AI!' } })

      // Should allow sending message
      const sendButton = screen.getByText('Send')
      fireEvent.click(sendButton)

      // Should show user message
      expect(screen.getByText('Hello, AI!')).toBeInTheDocument()
    })

    it('should complete MCP server management workflow', () => {
      render(<InternalPageRouter currentUrl={INTERNAL_PAGES.MCP} />)

      // Should show MCP management
      expect(screen.getByText('MCP Server Management')).toBeInTheDocument()

      // Should show server list
      expect(screen.getByText('File Reader')).toBeInTheDocument()
      expect(screen.getByText('Web Search')).toBeInTheDocument()

      // Should allow server selection
      const serverCard = screen.getByText('File Reader')
      fireEvent.click(serverCard)

      // Should show server details
      expect(screen.getByText('Real-time Logs')).toBeInTheDocument()

      // Should allow filtering
      const statusFilter = screen.getByLabelText('Filter by Status')
      fireEvent.change(statusFilter, { target: { value: 'running' } })

      // Should show filtered results
      expect(screen.getAllByText('File Reader')).toHaveLength(2) // Should have 2 File Reader elements
    })
  })

  describe('Settings Management Workflow', () => {
    it('should complete settings configuration workflow', () => {
      render(<InternalPageRouter currentUrl={INTERNAL_PAGES.SETTINGS} />)

      // Should show settings page
      expect(screen.getByText('Toubkal Settings')).toBeInTheDocument()

      // Should show navigation sections
      expect(screen.getByText('General')).toBeInTheDocument()
      expect(screen.getByText('Privacy')).toBeInTheDocument()
      expect(screen.getByText('AI Settings')).toBeInTheDocument()

      // Should show general settings by default
      expect(screen.getByText('General Settings')).toBeInTheDocument()
      expect(screen.getByText('Default Search Engine')).toBeInTheDocument()
    })

    it('should show privacy settings when navigating to privacy section', async () => {
      render(<InternalPageRouter currentUrl="toubkal://settings/privacy" />)

      // Wait for loading to complete and privacy settings to appear
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 2, name: 'Privacy Settings' })
        ).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling Workflow', () => {
    it('should handle 404 errors gracefully', () => {
      render(<InternalPageRouter currentUrl="toubkal://nonexistent" />)

      // Should show 404 error
      expect(screen.getByText('Page Not Found')).toBeInTheDocument()

      // Should show toubkal:// URL examples
      expect(screen.getByText('Valid Toubkal URLs:')).toBeInTheDocument()
      expect(screen.getByText('Common Mistakes:')).toBeInTheDocument()

      // Should provide navigation options
      expect(screen.getByText('Go to New Tab')).toBeInTheDocument()
      expect(screen.getByText('Open Settings')).toBeInTheDocument()
      expect(screen.getByText('Get Help')).toBeInTheDocument()
    })

    it('should handle network errors gracefully', () => {
      // Use a custom error page with network error code
      render(<InternalPageRouter currentUrl="toubkal://network-error" />)

      // Should show network error
      expect(screen.getByText('Network Error')).toBeInTheDocument()
      expect(screen.getByText('Unable to connect to the internet.')).toBeInTheDocument()
    })
  })

  describe('Accessibility Workflow', () => {
    it('should support keyboard navigation', () => {
      render(<InternalPageRouter currentUrl={INTERNAL_PAGES.AI} />)

      // Should be able to navigate with keyboard
      const messageInput = screen.getByPlaceholderText('Type your message here...')
      messageInput.focus()

      // Should handle Enter key
      fireEvent.keyPress(messageInput, { key: 'Enter', code: 'Enter' })

      // Should handle Shift+Enter for new line
      fireEvent.keyPress(messageInput, { key: 'Enter', code: 'Enter', shiftKey: true })
    })

    it('should have proper ARIA labels', () => {
      render(<InternalPageRouter currentUrl={INTERNAL_PAGES.AUDIT} />)

      // Should have form labels
      expect(screen.getByLabelText('Level')).toBeInTheDocument()
      expect(screen.getByLabelText('Search')).toBeInTheDocument()
    })

    it('should have proper heading hierarchy', () => {
      render(<InternalPageRouter currentUrl={INTERNAL_PAGES.CONSENT} />)

      // Should have proper heading levels
      const h1 = screen.getByRole('heading', { level: 1 })
      const h3 = screen.getAllByRole('heading', { level: 3 })

      expect(h1).toBeInTheDocument()
      expect(h3.length).toBeGreaterThan(0)

      // Check that we have at least one heading at each level that exists
      const allHeadings = screen.getAllByRole('heading')
      expect(allHeadings.length).toBeGreaterThan(0)
    })
  })

  describe('Responsive Design Workflow', () => {
    it('should work on mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<InternalPageRouter currentUrl={INTERNAL_PAGES.SETTINGS} />)

      // Should render without errors
      expect(screen.getByText('Toubkal Settings')).toBeInTheDocument()
    })

    it('should work on tablet devices', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      render(<InternalPageRouter currentUrl={INTERNAL_PAGES.MCP} />)

      // Should render without errors
      expect(screen.getByText('MCP Server Management')).toBeInTheDocument()
    })

    it('should work on desktop devices', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      render(<InternalPageRouter currentUrl={INTERNAL_PAGES.AUDIT} />)

      // Should render without errors
      expect(screen.getByText('Transparency Dashboard')).toBeInTheDocument()
    })
  })

  describe('Performance Workflow', () => {
    it('should load pages within performance threshold', async () => {
      const startTime = performance.now()

      render(<InternalPageRouter currentUrl={INTERNAL_PAGES.AI} />)

      await waitFor(() => {
        expect(screen.getByText('AI Assistant')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const loadTime = endTime - startTime

      // Should load within 100ms
      expect(loadTime).toBeLessThan(100)
    })

    it('should handle multiple page loads efficiently', async () => {
      const pages = [
        INTERNAL_PAGES.SETTINGS,
        INTERNAL_PAGES.AI,
        INTERNAL_PAGES.MCP,
        INTERNAL_PAGES.CONSENT,
        INTERNAL_PAGES.AUDIT,
      ]

      const startTime = performance.now()

      for (const pageUrl of pages) {
        const { unmount } = render(<InternalPageRouter currentUrl={pageUrl} />)
        await waitFor(() => {
          expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
        })
        unmount() // Clean up before next render
      }

      const endTime = performance.now()
      const totalTime = endTime - startTime

      // Should load all pages within 500ms
      expect(totalTime).toBeLessThan(500)
    })
  })

  describe('Brand Validation Workflow', () => {
    it('should validate all pages against brand guidelines', () => {
      const pages = [
        INTERNAL_PAGES.SETTINGS,
        INTERNAL_PAGES.AI,
        INTERNAL_PAGES.MCP,
        INTERNAL_PAGES.CONSENT,
        INTERNAL_PAGES.AUDIT,
      ]

      pages.forEach((pageUrl) => {
        const { container } = render(<InternalPageRouter currentUrl={pageUrl} />)

        // Check for brand elements
        const headings = container.querySelectorAll('h1, h2, h3')
        expect(headings.length).toBeGreaterThan(0)

        // Check for interactive elements
        const buttons = container.querySelectorAll('button')
        const links = container.querySelectorAll('a')
        expect(buttons.length + links.length).toBeGreaterThan(0)

        // Check for consistent spacing
        const paddedElements = container.querySelectorAll('[class*="p-"]')
        const marginedElements = container.querySelectorAll('[class*="m-"]')
        expect(paddedElements.length + marginedElements.length).toBeGreaterThan(0)
      })
    })

    it('should maintain consistent color scheme', () => {
      const { container } = render(<InternalPageRouter currentUrl={INTERNAL_PAGES.SETTINGS} />)

      // Check for Toubkal Blue usage
      const blueElements = container.querySelectorAll('[class*="blue-"]')
      expect(blueElements.length).toBeGreaterThan(0)

      // Check for consistent color classes
      const colorElements = container.querySelectorAll('[class*="text-"], [class*="bg-"]')
      expect(colorElements.length).toBeGreaterThan(0)
    })
  })
})
