/**
 * Page Components Tests
 *
 * Comprehensive tests for all Toubkal Browser page components.
 * Tests rendering, functionality, and user interactions.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuditPage } from '../components/pages/AuditPage'
import { AIPage } from '../components/pages/AIPage'
import { MCPPage } from '../components/pages/MCPPage'
import { ConsentPage } from '../components/pages/ConsentPage'
import { SettingsPage } from '../components/pages/SettingsPage'
import { NewTabPage } from '../components/pages/NewTabPage'
import { ErrorPage } from '../components/pages/ErrorPage'

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
    now: vi.fn(() => Date.now()),
  },
})

describe('Page Components', () => {
  describe('AuditPage', () => {
    it('should render with correct title and description', () => {
      render(<AuditPage />)

      expect(screen.getByText('Transparency Dashboard')).toBeInTheDocument()
      expect(
        screen.getByText('Real-time visibility into browser operations and privacy decisions')
      ).toBeInTheDocument()
    })

    it('should render filter controls', async () => {
      render(<AuditPage />)

      await waitFor(() => {
        expect(screen.getByLabelText('Search')).toBeInTheDocument()
        expect(screen.getByLabelText('Level')).toBeInTheDocument()
        expect(screen.getByLabelText('Component')).toBeInTheDocument()
      })
    })

    it('should filter logs by operation type', async () => {
      render(<AuditPage />)

      await waitFor(() => {
        const levelFilter = screen.getByLabelText('Level')
        fireEvent.change(levelFilter, { target: { value: 'info' } })
      })

      // Should show filtered results
      expect(screen.getByText('Info (0)')).toBeInTheDocument()
    })

    it('should search logs by description', async () => {
      render(<AuditPage />)

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search logs...')
        expect(searchInput).toBeInTheDocument()
        fireEvent.change(searchInput, { target: { value: 'AI query' } })
      })

      // Should show search input
      expect(screen.getByDisplayValue('AI query')).toBeInTheDocument()
    })

    it('should display audit log entries', async () => {
      render(<AuditPage />)

      await waitFor(() => {
        expect(screen.getByText('Transparency Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Real-time visibility into browser operations and privacy decisions')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Audit Logs' })).toBeInTheDocument()
      })
    })

    it('should show export buttons', async () => {
      render(<AuditPage />)

      await waitFor(() => {
        expect(screen.getByText('Export Data')).toBeInTheDocument()
        expect(screen.getByText('Consent History')).toBeInTheDocument()
        expect(screen.getByText('Refresh')).toBeInTheDocument()
      })
    })
  })

  describe('AIPage', () => {
    it('should render with correct title and description', () => {
      render(<AIPage />)

      expect(screen.getByText('AI Assistant')).toBeInTheDocument()
      expect(
        screen.getByText('Chat with local AI models for privacy-first assistance')
      ).toBeInTheDocument()
    })

    it('should display model selection', () => {
      render(<AIPage />)

      expect(screen.getByText('Select Model')).toBeInTheDocument()
      expect(screen.getByText('Llama 3.2 8B')).toBeInTheDocument()
      expect(screen.getByText('Mistral 7B')).toBeInTheDocument()
    })

    it('should show resource usage', () => {
      render(<AIPage />)

      expect(screen.getByText('Resource Usage')).toBeInTheDocument()
      expect(screen.getByText('RAM')).toBeInTheDocument()
      expect(screen.getByText('VRAM')).toBeInTheDocument()
      expect(screen.getByText('CPU')).toBeInTheDocument()
    })

    it('should allow model selection', () => {
      render(<AIPage />)

      const modelCard = screen.getByText('Mistral 7B')
      fireEvent.click(modelCard)

      // Should update selected model - check for the selected state styling
      // The border-blue-500 class is on the card container div, not the text span
      const selectedCard = modelCard.closest('div[class*="border"]')
      expect(selectedCard).toHaveClass('border-blue-500')
    })

    it('should handle message input and sending', () => {
      render(<AIPage />)

      const messageInput = screen.getByPlaceholderText('Type your message here...')
      const sendButton = screen.getByText('Send')

      fireEvent.change(messageInput, { target: { value: 'Hello, AI!' } })
      fireEvent.click(sendButton)

      // Should show user message
      expect(screen.getByText('Hello, AI!')).toBeInTheDocument()
    })

    it('should clear chat when clear button is clicked', () => {
      render(<AIPage />)

      const clearButton = screen.getByText('Clear Chat')
      fireEvent.click(clearButton)

      // Should show empty state
      expect(screen.getByText('Start a conversation')).toBeInTheDocument()
    })
  })

  describe('MCPPage', () => {
    it('should render with correct title and description', () => {
      render(<MCPPage />)

      expect(screen.getByText('MCP Server Management')).toBeInTheDocument()
      expect(
        screen.getByText('Manage Model Context Protocol servers with privacy-first approach')
      ).toBeInTheDocument()
    })

    it('should display server list', () => {
      render(<MCPPage />)

      expect(screen.getByText('File Reader')).toBeInTheDocument()
      expect(screen.getByText('Web Search')).toBeInTheDocument()
      expect(screen.getByText('AI Assistant')).toBeInTheDocument()
      expect(screen.getByText('Weather API')).toBeInTheDocument()
    })

    it('should show server status and privacy levels', () => {
      render(<MCPPage />)

      expect(screen.getAllByText('running')).toHaveLength(2) // Should have 2 running servers
      expect(screen.getByText('stopped')).toBeInTheDocument()
      expect(screen.getByText('error')).toBeInTheDocument()
      expect(screen.getAllByText('🟢')).toHaveLength(2) // Should have 2 local servers
      expect(screen.getAllByText('local')).toHaveLength(2) // Should have 2 local servers
      expect(screen.getByText('🟡')).toBeInTheDocument()
      expect(screen.getByText('network')).toBeInTheDocument()
      expect(screen.getByText('🟠')).toBeInTheDocument()
      expect(screen.getByText('remote api')).toBeInTheDocument()
    })

    it('should filter servers by status', () => {
      render(<MCPPage />)

      const statusFilter = screen.getByLabelText('Filter by Status')
      fireEvent.change(statusFilter, { target: { value: 'running' } })

      // Should show only running servers
      expect(screen.getByText('File Reader')).toBeInTheDocument()
      expect(screen.getByText('Web Search')).toBeInTheDocument()
    })

    it('should search servers by name or description', () => {
      render(<MCPPage />)

      const searchInput = screen.getByLabelText('Search Servers')
      fireEvent.change(searchInput, { target: { value: 'file' } })

      // Should show only file-related servers
      expect(screen.getByText('File Reader')).toBeInTheDocument()
    })

    it('should allow server selection for details', () => {
      render(<MCPPage />)

      const serverCard = screen.getByText('File Reader')
      fireEvent.click(serverCard)

      // Should show server details
      expect(screen.getByText('Real-time Logs')).toBeInTheDocument()
    })

    it('should show install new server form', () => {
      render(<MCPPage />)

      expect(screen.getByText('Install New Server')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter server name or URL...')).toBeInTheDocument()
      expect(screen.getByText('Install')).toBeInTheDocument()
    })
  })

  describe('ConsentPage', () => {
    it('should render with correct title and description', () => {
      render(<ConsentPage />)

      expect(screen.getByText('Consent History')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Track and manage your privacy consent decisions with cryptographic verification'
        )
      ).toBeInTheDocument()
    })

    it('should display consent decisions', () => {
      render(<ConsentPage />)

      // Check for consent decision content that actually exists in the component
      expect(screen.getAllByText('analytics')).toHaveLength(4) // Appears in both title and tag for 2 decisions
      expect(screen.getAllByText('cookies')).toHaveLength(2) // Appears in both title and tag
      expect(screen.getAllByText('ai processing')).toHaveLength(2) // Appears in both title and tag
    })

    it('should show consent types and actions', () => {
      render(<ConsentPage />)

      // Use getAllByText for elements that appear multiple times
      expect(screen.getAllByText('analytics')).toHaveLength(4) // Should appear in both title and tag for 2 decisions
      expect(screen.getAllByText('cookies')).toHaveLength(2) // Appears in both title and tag
      expect(screen.getAllByText('ai processing')).toHaveLength(2) // Appears in both title and tag
      expect(screen.getAllByText('granted')).toHaveLength(3) // Should appear multiple times
      expect(screen.getAllByText('denied')).toHaveLength(2) // Appears in 2 decisions
      expect(screen.getByText('revoked')).toBeInTheDocument()
    })

    it('should filter decisions by action', () => {
      render(<ConsentPage />)

      const actionFilter = screen.getByLabelText('Filter by Action')
      fireEvent.change(actionFilter, { target: { value: 'granted' } })

      // Should show only granted decisions - use getAllByText since there are multiple
      expect(screen.getAllByText('granted')).toHaveLength(3) // Should have 3 granted decisions
    })

    it('should search decisions by type or reason', () => {
      render(<ConsentPage />)

      const searchInput = screen.getByLabelText('Search Decisions')
      fireEvent.change(searchInput, { target: { value: 'analytics' } })

      // Should show only analytics-related decisions
      expect(screen.getAllByText('analytics')).toHaveLength(4) // Should appear in both title and tag for 2 decisions
    })

    it('should show export controls', () => {
      render(<ConsentPage />)

      expect(screen.getByText('Export Data')).toBeInTheDocument()
      expect(screen.getByText('Export Format')).toBeInTheDocument()
      expect(screen.getByText('Export Consent Data')).toBeInTheDocument()
    })

    it('should show snapshots section', () => {
      render(<ConsentPage />)

      expect(screen.getByText('Snapshots')).toBeInTheDocument()
      expect(screen.getByText('Create Snapshot')).toBeInTheDocument()
    })

    it('should display signature verification status', () => {
      render(<ConsentPage />)

      expect(screen.getAllByText('✓ Verified')).toHaveLength(6) // Should have 6 verified decisions
    })
  })

  describe('SettingsPage', () => {
    it('should render with correct title and description', () => {
      render(<SettingsPage />)

      expect(screen.getByText('Toubkal Settings')).toBeInTheDocument()
      expect(screen.getByText('Configure your Toubkal Browser experience')).toBeInTheDocument()
    })

    it('should display navigation sections', () => {
      render(<SettingsPage />)

      expect(screen.getByText('General')).toBeInTheDocument()
      expect(screen.getByText('Privacy')).toBeInTheDocument()
      expect(screen.getByText('AI Settings')).toBeInTheDocument()
      expect(screen.getByText('MCP Servers')).toBeInTheDocument()
      expect(screen.getByText('Help')).toBeInTheDocument()
    })

    it('should show general settings by default', () => {
      render(<SettingsPage />)

      expect(screen.getByText('General Settings')).toBeInTheDocument()
      expect(screen.getByText('Default Search Engine')).toBeInTheDocument()
      expect(screen.getByText('Home Page')).toBeInTheDocument()
      expect(screen.getByText('Automatically check for updates')).toBeInTheDocument()
    })

    it('should allow navigation between sections', () => {
      render(<SettingsPage currentSection="privacy" />)

      // Should show privacy settings (loading state)
      expect(screen.getByText('Loading privacy settings...')).toBeInTheDocument()
    })
  })

  describe('NewTabPage', () => {
    it('should render with correct title and description', () => {
      render(<NewTabPage />)

      expect(screen.getByText('Toubkal Browser')).toBeInTheDocument()
      expect(
        screen.getByText('The intelligent browser that protects your mind')
      ).toBeInTheDocument()
    })

    it('should display search functionality', () => {
      render(<NewTabPage />)

      // Should have search input
      const searchInput = screen.getByRole('textbox')
      expect(searchInput).toBeInTheDocument()
    })
  })

  describe('ErrorPage', () => {
    it('should render 404 error correctly', () => {
      render(<ErrorPage errorCode="404" />)

      expect(screen.getByText('Page Not Found')).toBeInTheDocument()
      expect(screen.getByText("The page you're looking for doesn't exist.")).toBeInTheDocument()
    })

    it('should render 500 error correctly', () => {
      render(<ErrorPage errorCode="500" />)

      expect(screen.getByText('Internal Server Error')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong on our end.')).toBeInTheDocument()
    })

    it('should render network error correctly', () => {
      render(<ErrorPage errorCode="network" />)

      expect(screen.getByText('Network Error')).toBeInTheDocument()
      expect(screen.getByText('Unable to connect to the internet.')).toBeInTheDocument()
    })

    it('should show toubkal:// URL examples', () => {
      render(<ErrorPage errorCode="404" />)

      expect(screen.getByText('Valid Toubkal URLs:')).toBeInTheDocument()
      expect(screen.getByText('Common Mistakes:')).toBeInTheDocument()
    })

    it('should provide navigation buttons', () => {
      render(<ErrorPage errorCode="404" />)

      expect(screen.getByText('Go to New Tab')).toBeInTheDocument()
      expect(screen.getByText('Open Settings')).toBeInTheDocument()
      expect(screen.getByText('Get Help')).toBeInTheDocument()
    })

    it('should handle custom error messages', () => {
      const customMessage = 'Custom error message'
      render(<ErrorPage errorCode="404" errorMessage={customMessage} />)

      expect(screen.getByText(customMessage)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<AuditPage />)

      const h1 = screen.getByRole('heading', { level: 1 })

      expect(h1).toBeInTheDocument()
      expect(h1).toHaveTextContent('Transparency Dashboard')

      // Check that we have a proper heading structure
      const allHeadings = screen.getAllByRole('heading')
      expect(allHeadings.length).toBeGreaterThan(0)
    })

    it('should have proper form labels', () => {
      render(<AuditPage />)

      expect(screen.getByLabelText('Search')).toBeInTheDocument()
      expect(screen.getByLabelText('Level')).toBeInTheDocument()
      expect(screen.getByLabelText('Component')).toBeInTheDocument()
    })

    it('should have proper button labels', () => {
      render(<AIPage />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button.textContent).toBeTruthy()
        expect(button.textContent?.length).toBeGreaterThan(0)
      })
    })

    it('should support keyboard navigation', () => {
      render(<AIPage />)

      const messageInput = screen.getByPlaceholderText('Type your message here...')

      // Should handle Enter key
      fireEvent.keyPress(messageInput, { key: 'Enter', code: 'Enter' })

      // Should handle Shift+Enter for new line
      fireEvent.keyPress(messageInput, { key: 'Enter', code: 'Enter', shiftKey: true })
    })
  })

  describe('Responsive Design', () => {
    it('should handle mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<SettingsPage />)

      // Should render without errors
      expect(screen.getByText('Toubkal Settings')).toBeInTheDocument()
    })

    it('should handle tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      render(<MCPPage />)

      // Should render without errors
      expect(screen.getByText('MCP Server Management')).toBeInTheDocument()
    })

    it('should handle desktop viewport', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      render(<ConsentPage />)

      // Should render without errors
      expect(screen.getByText('Consent History')).toBeInTheDocument()
    })
  })
})
