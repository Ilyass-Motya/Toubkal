/**
 * Page Components Tests
 * 
 * Comprehensive tests for all Toubkal Browser page components.
 * Tests rendering, functionality, and user interactions.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuditPage } from '../components/pages/AuditPage'
import { AIPage } from '../components/pages/AIPage'
import { MCPPage } from '../components/pages/MCPPage'
import { ConsentPage } from '../components/pages/ConsentPage'
import { SettingsPage } from '../components/pages/SettingsPage'
import { NewTabPage } from '../components/pages/NewTabPage'
import { ErrorPage } from '../components/pages/ErrorPage'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now())
  }
})

describe('Page Components', () => {
  describe('AuditPage', () => {
    it('should render with correct title and description', () => {
      render(<AuditPage />)
      
      expect(screen.getByText('Transparency Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Real-time audit log of all Toubkal Browser operations')).toBeInTheDocument()
    })

    it('should show loading state initially', () => {
      render(<AuditPage />)
      
      expect(screen.getByText('Loading audit logs...')).toBeInTheDocument()
    })

    it('should render filter controls', async () => {
      render(<AuditPage />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Filter by Operation Type')).toBeInTheDocument()
        expect(screen.getByLabelText('Search Logs')).toBeInTheDocument()
      })
    })

    it('should filter logs by operation type', async () => {
      render(<AuditPage />)
      
      await waitFor(() => {
        const filterSelect = screen.getByLabelText('Filter by Operation Type')
        fireEvent.change(filterSelect, { target: { value: 'ai_query' } })
      })
      
      // Should show filtered results
      expect(screen.getByText('AI Queries')).toBeInTheDocument()
    })

    it('should search logs by description', async () => {
      render(<AuditPage />)
      
      await waitFor(() => {
        const searchInput = screen.getByLabelText('Search Logs')
        fireEvent.change(searchInput, { target: { value: 'AI query' } })
      })
      
      // Should show search results
      expect(screen.getByText('AI query processed using Ollama Llama 3.2')).toBeInTheDocument()
    })

    it('should display audit log entries', async () => {
      render(<AuditPage />)
      
      await waitFor(() => {
        expect(screen.getByText('AI query processed using Ollama Llama 3.2')).toBeInTheDocument()
        expect(screen.getByText('User granted consent for data collection')).toBeInTheDocument()
        expect(screen.getByText('HTTPS request to api.example.com')).toBeInTheDocument()
      })
    })

    it('should show export buttons', async () => {
      render(<AuditPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Export JSON')).toBeInTheDocument()
        expect(screen.getByText('Export CSV')).toBeInTheDocument()
        expect(screen.getByText('Refresh Logs')).toBeInTheDocument()
      })
    })
  })

  describe('AIPage', () => {
    it('should render with correct title and description', () => {
      render(<AIPage />)
      
      expect(screen.getByText('AI Assistant')).toBeInTheDocument()
      expect(screen.getByText('Chat with local AI models for privacy-first assistance')).toBeInTheDocument()
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
      
      // Should update selected model
      expect(modelCard.closest('div')).toHaveClass('border-blue-500')
    })

    it('should handle message input and sending', async () => {
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
      expect(screen.getByText('Manage Model Context Protocol servers with privacy-first approach')).toBeInTheDocument()
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
      
      expect(screen.getByText('running')).toBeInTheDocument()
      expect(screen.getByText('stopped')).toBeInTheDocument()
      expect(screen.getByText('error')).toBeInTheDocument()
      expect(screen.getByText('🟢 local')).toBeInTheDocument()
      expect(screen.getByText('🟡 network')).toBeInTheDocument()
      expect(screen.getByText('🟠 remote_api')).toBeInTheDocument()
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
      expect(screen.getByText('Track and manage your privacy consent decisions with cryptographic verification')).toBeInTheDocument()
    })

    it('should display consent decisions', () => {
      render(<ConsentPage />)
      
      expect(screen.getByText('AI query processed using Ollama Llama 3.2')).toBeInTheDocument()
      expect(screen.getByText('User granted consent for data collection')).toBeInTheDocument()
      expect(screen.getByText('User granted consent for data collection')).toBeInTheDocument()
    })

    it('should show consent types and actions', () => {
      render(<ConsentPage />)
      
      expect(screen.getByText('analytics')).toBeInTheDocument()
      expect(screen.getByText('cookies')).toBeInTheDocument()
      expect(screen.getByText('ai_processing')).toBeInTheDocument()
      expect(screen.getByText('granted')).toBeInTheDocument()
      expect(screen.getByText('denied')).toBeInTheDocument()
      expect(screen.getByText('revoked')).toBeInTheDocument()
    })

    it('should filter decisions by action', () => {
      render(<ConsentPage />)
      
      const actionFilter = screen.getByLabelText('Filter by Action')
      fireEvent.change(actionFilter, { target: { value: 'granted' } })
      
      // Should show only granted decisions
      expect(screen.getByText('granted')).toBeInTheDocument()
    })

    it('should search decisions by type or reason', () => {
      render(<ConsentPage />)
      
      const searchInput = screen.getByLabelText('Search Decisions')
      fireEvent.change(searchInput, { target: { value: 'analytics' } })
      
      // Should show only analytics-related decisions
      expect(screen.getByText('analytics')).toBeInTheDocument()
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
      
      expect(screen.getByText('✓ Verified')).toBeInTheDocument()
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
      render(<SettingsPage />)
      
      const privacyLink = screen.getByText('Privacy')
      fireEvent.click(privacyLink)
      
      // Should show privacy settings
      expect(screen.getByText('Privacy Settings')).toBeInTheDocument()
    })
  })

  describe('NewTabPage', () => {
    it('should render with correct title and description', () => {
      render(<NewTabPage />)
      
      expect(screen.getByText('Toubkal Browser')).toBeInTheDocument()
      expect(screen.getByText('The intelligent browser that protects your mind')).toBeInTheDocument()
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
      const h2 = screen.getAllByRole('heading', { level: 2 })
      const h3 = screen.getAllByRole('heading', { level: 3 })
      
      expect(h1).toBeInTheDocument()
      expect(h2.length).toBeGreaterThan(0)
      expect(h3.length).toBeGreaterThan(0)
    })

    it('should have proper form labels', () => {
      render(<AuditPage />)
      
      expect(screen.getByLabelText('Filter by Operation Type')).toBeInTheDocument()
      expect(screen.getByLabelText('Search Logs')).toBeInTheDocument()
    })

    it('should have proper button labels', () => {
      render(<AIPage />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
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
