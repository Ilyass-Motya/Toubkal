/**
 * Internal Page Router Tests
 * 
 * Test suite for InternalPageRouter component covering
 * toubkal:// URL routing to appropriate page components (AC2, AC7).
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import InternalPageRouter from './InternalPageRouter'
import { INTERNAL_PAGES } from '@/constants/url-schemes'

describe('InternalPageRouter', () => {
  const mockOnNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('settings page routing', () => {
    it('should render settings page for toubkal://settings', () => {
      // Act
      render(
        <InternalPageRouter currentUrl={INTERNAL_PAGES.SETTINGS} onNavigate={mockOnNavigate} />
      )

      // Assert
      expect(screen.getByText('Toubkal Settings')).toBeInTheDocument()
      expect(screen.getByText('Configure your Toubkal Browser experience')).toBeInTheDocument()
    })

    it('should render privacy settings for toubkal://settings/privacy', () => {
      // Act
      render(
        <InternalPageRouter currentUrl={INTERNAL_PAGES.PRIVACY} onNavigate={mockOnNavigate} />
      )

      // Assert
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
      expect(screen.getByText('Zero Telemetry by Default')).toBeInTheDocument()
    })

    it('should render AI settings for toubkal://ai/settings', () => {
      // Act
      render(
        <InternalPageRouter currentUrl={INTERNAL_PAGES.AI_SETTINGS} onNavigate={mockOnNavigate} />
      )

      // Assert
      expect(screen.getAllByText('AI Settings')).toHaveLength(2) // Navigation link and heading
      expect(screen.getByText('Default AI Model')).toBeInTheDocument()
    })
  })

  describe('new tab page routing', () => {
    it('should render new tab page for toubkal://newtab', () => {
      // Act
      render(
        <InternalPageRouter currentUrl={INTERNAL_PAGES.NEW_TAB} onNavigate={mockOnNavigate} />
      )

      // Assert
      expect(screen.getByText('Toubkal Browser')).toBeInTheDocument()
      expect(screen.getByText('The intelligent browser that protects your mind')).toBeInTheDocument()
    })

    it('should handle search form submission', async () => {
      // Arrange
      const user = userEvent.setup()
      render(
        <InternalPageRouter currentUrl={INTERNAL_PAGES.NEW_TAB} onNavigate={mockOnNavigate} />
      )

      // Act
      const searchInput = screen.getByPlaceholderText('Search the web or enter a URL')
      await user.type(searchInput, 'test query')
      
      const searchButton = screen.getByText('Search')
      await user.click(searchButton)

      // Assert
      expect(mockOnNavigate).toHaveBeenCalledWith('https://duckduckgo.com/?q=test%20query')
    })

    it('should handle quick access navigation', async () => {
      // Arrange
      const user = userEvent.setup()
      render(
        <InternalPageRouter currentUrl={INTERNAL_PAGES.NEW_TAB} onNavigate={mockOnNavigate} />
      )

      // Act
      const settingsButtons = screen.getAllByText('Settings')
      const quickAccessButton = settingsButtons.find(button => 
        button.closest('button')?.querySelector('.text-3xl')
      )
      expect(quickAccessButton).toBeInTheDocument()
      if (quickAccessButton) {
        await user.click(quickAccessButton)
      }

      // Assert
      expect(mockOnNavigate).toHaveBeenCalledWith(INTERNAL_PAGES.SETTINGS)
    })
  })

  describe('about page routing', () => {
    it('should render about page for toubkal://about', () => {
      // Act
      render(
        <InternalPageRouter currentUrl={INTERNAL_PAGES.ABOUT} onNavigate={mockOnNavigate} />
      )

      // Assert
      expect(screen.getByText('Toubkal Browser')).toBeInTheDocument()
      expect(screen.getByText('The intelligent browser that protects your mind')).toBeInTheDocument()
      expect(screen.getByText('Version Information')).toBeInTheDocument()
    })
  })

  describe('version page routing', () => {
    it('should render version page for toubkal://version', () => {
      // Act
      render(
        <InternalPageRouter currentUrl={INTERNAL_PAGES.VERSION} onNavigate={mockOnNavigate} />
      )

      // Assert
      expect(screen.getByText('Version Information')).toBeInTheDocument()
      expect(screen.getByText('Toubkal Browser')).toBeInTheDocument()
      expect(screen.getByText('Chromium Engine')).toBeInTheDocument()
    })
  })

  describe('privacy page routing', () => {
    it('should render privacy page for toubkal://privacy', () => {
      // Act
      render(
        <InternalPageRouter currentUrl={INTERNAL_PAGES.PRIVACY} onNavigate={mockOnNavigate} />
      )

      // Assert
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
      expect(screen.getByText('Zero Telemetry by Default')).toBeInTheDocument()
    })
  })

  describe('audit page routing', () => {
    it('should render audit page for toubkal://audit', () => {
      // Act
      render(
        <InternalPageRouter currentUrl={INTERNAL_PAGES.AUDIT} onNavigate={mockOnNavigate} />
      )

      // Assert
      expect(screen.getByText('Transparency Dashboard')).toBeInTheDocument()
      expect(screen.getByText('View all consent decisions and data access logs for complete transparency.')).toBeInTheDocument()
    })
  })

  describe('AI page routing', () => {
    it('should render AI page for toubkal://ai', () => {
      // Act
      render(
        <InternalPageRouter currentUrl={INTERNAL_PAGES.AI} onNavigate={mockOnNavigate} />
      )

      // Assert
      expect(screen.getByText('AI Assistant')).toBeInTheDocument()
      expect(screen.getByText('Chat with your local AI assistant powered by Ollama.')).toBeInTheDocument()
    })
  })

  describe('MCP page routing', () => {
    it('should render MCP page for toubkal://mcp', () => {
      // Act
      render(
        <InternalPageRouter currentUrl={INTERNAL_PAGES.MCP} onNavigate={mockOnNavigate} />
      )

      // Assert
      expect(screen.getByText('MCP Servers')).toBeInTheDocument()
      expect(screen.getByText('Manage your Model Context Protocol servers for enhanced AI capabilities.')).toBeInTheDocument()
    })
  })

  describe('help page routing', () => {
    it('should render help page for toubkal://help', () => {
      // Act
      render(
        <InternalPageRouter currentUrl={INTERNAL_PAGES.HELP} onNavigate={mockOnNavigate} />
      )

      // Assert
      expect(screen.getByText('Help & Support')).toBeInTheDocument()
      expect(screen.getByText('Getting Started')).toBeInTheDocument()
      expect(screen.getByText('Troubleshooting')).toBeInTheDocument()
    })
  })

  describe('error page routing', () => {
    it('should render error page for toubkal://error', () => {
      // Act
      render(
        <InternalPageRouter currentUrl={INTERNAL_PAGES.ERROR} onNavigate={mockOnNavigate} />
      )

      // Assert
      expect(screen.getByText('Page Not Found')).toBeInTheDocument()
      expect(screen.getByText('The page you\'re looking for doesn\'t exist.')).toBeInTheDocument()
    })

    it('should render 404 error page for toubkal://404', () => {
      // Act
      render(
        <InternalPageRouter currentUrl={INTERNAL_PAGES.NOT_FOUND} onNavigate={mockOnNavigate} />
      )

      // Assert
      expect(screen.getByText('Page Not Found')).toBeInTheDocument()
    })

    it('should handle error page navigation', async () => {
      // Arrange
      const user = userEvent.setup()
      render(
        <InternalPageRouter currentUrl={INTERNAL_PAGES.ERROR} onNavigate={mockOnNavigate} />
      )

      // Act
      const newTabButton = screen.getByText('Go to New Tab')
      await user.click(newTabButton)

      // Assert
      expect(mockOnNavigate).toHaveBeenCalledWith(INTERNAL_PAGES.NEW_TAB)
    })
  })

  describe('unknown page routing', () => {
    it('should render error page for unknown toubkal:// URLs', () => {
      // Act
      render(
        <InternalPageRouter currentUrl="toubkal://unknown-page" onNavigate={mockOnNavigate} />
      )

      // Assert
      expect(screen.getByText('Page Not Found')).toBeInTheDocument()
      expect(screen.getByText('Page "unknown-page" not found')).toBeInTheDocument()
    })
  })

  describe('URL path extraction', () => {
    it('should handle toubkal:// URLs correctly', () => {
      // Act
      render(
        <InternalPageRouter currentUrl="toubkal://settings" onNavigate={mockOnNavigate} />
      )

      // Assert
      expect(screen.getByText('Toubkal Settings')).toBeInTheDocument()
    })

    it('should handle non-toubkal:// URLs as unknown', () => {
      // Act
      render(
        <InternalPageRouter currentUrl="https://example.com" onNavigate={mockOnNavigate} />
      )

      // Assert
      expect(screen.getByText('Page Not Found')).toBeInTheDocument()
    })
  })
})
