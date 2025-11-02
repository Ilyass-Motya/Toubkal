/**
 * ExportPanel Tests
 * 
 * Unit tests for the export panel component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExportPanel } from './ExportPanel'
import { AuditData, AuditLogEntry } from '../types/TransparencyTypes'

const mockAuditData: AuditData = {
  totalEntries: 150,
  consentHistory: [],
  networkRequests: [],
  aiQueries: [],
  privacyActions: [],
  systemEvents: [],
  lastUpdated: new Date().toISOString(),
  merkleRoot: 'mock-merkle-root'
}

const mockLogs: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    eventType: 'AI_QUERY',
    category: 'ai',
    details: {
      action: 'Process AI query',
      success: true,
      duration: 1500
    },
    signature: 'mock-signature-1',
    merkleProof: ['hash1', 'hash2']
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    eventType: 'NETWORK_REQUEST',
    category: 'network',
    details: {
      action: 'Fetch resource',
      success: true,
      duration: 500
    },
    signature: 'mock-signature-2',
    merkleProof: ['hash3', 'hash4']
  }
]

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'mock-url')
const mockRevokeObjectURL = vi.fn()

Object.defineProperty(URL, 'createObjectURL', {
  value: mockCreateObjectURL,
  writable: true
})

Object.defineProperty(URL, 'revokeObjectURL', {
  value: mockRevokeObjectURL,
  writable: true
})

// Mock document.createElement and appendChild
const mockCreateElement = vi.fn(() => ({
  href: '',
  download: '',
  click: vi.fn()
}))
const mockAppendChild = vi.fn()
const mockRemoveChild = vi.fn()

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  writable: true
})

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild,
  writable: true
})

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild,
  writable: true
})

describe('ExportPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render without errors', () => {
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      expect(screen.getByText('Export Options')).toBeInTheDocument()
      expect(screen.getByText('Export Data')).toBeInTheDocument()
      expect(screen.getByText('Export Preview')).toBeInTheDocument()
    })

    it('should display format selection', () => {
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      expect(screen.getByText('Export Format')).toBeInTheDocument()
      expect(screen.getByText('JSON (Complete data with metadata)')).toBeInTheDocument()
      expect(screen.getByText('CSV (Spreadsheet compatible)')).toBeInTheDocument()
    })

    it('should display date range inputs', () => {
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      expect(screen.getByText('Date Range (Optional)')).toBeInTheDocument()
      expect(screen.getAllByRole('textbox')).toHaveLength(2) // Start and end date inputs
    })

    it('should display category checkboxes', () => {
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      expect(screen.getByText('Categories (Select all to include all categories)')).toBeInTheDocument()
      expect(screen.getByText('network')).toBeInTheDocument()
      expect(screen.getByText('ai')).toBeInTheDocument()
      expect(screen.getByText('consent')).toBeInTheDocument()
      expect(screen.getByText('privacy')).toBeInTheDocument()
      expect(screen.getByText('system')).toBeInTheDocument()
    })

    it('should display advanced options', () => {
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      expect(screen.getByText('Advanced Options')).toBeInTheDocument()
      expect(screen.getByText('Include cryptographic signatures')).toBeInTheDocument()
      expect(screen.getByText('Include Merkle tree proofs')).toBeInTheDocument()
    })
  })

  describe('export preview', () => {
    it('should show total entries count', () => {
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      expect(screen.getByText('Total entries to export: 2')).toBeInTheDocument()
    })

    it('should show format information', () => {
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      expect(screen.getByText('Format: JSON')).toBeInTheDocument()
    })

    it('should show date range information', () => {
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      expect(screen.getByText('Date range: All dates')).toBeInTheDocument()
    })

    it('should show categories information', () => {
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      expect(screen.getByText('Categories: All categories')).toBeInTheDocument()
    })

    it('should show signatures information', () => {
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      expect(screen.getByText('Signatures: Included')).toBeInTheDocument()
    })

    it('should show Merkle proofs information', () => {
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      expect(screen.getByText('Merkle proofs: Included')).toBeInTheDocument()
    })
  })

  describe('format selection', () => {
    it('should default to JSON format', () => {
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      const jsonRadio = screen.getByLabelText('JSON (Complete data with metadata)')
      expect(jsonRadio).toBeChecked()
    })

    it('should allow switching to CSV format', async () => {
      const user = userEvent.setup()
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      const csvRadio = screen.getByLabelText('CSV (Spreadsheet compatible)')
      await user.click(csvRadio)
      
      expect(csvRadio).toBeChecked()
    })
  })

  describe('date range selection', () => {
    it('should allow setting start date', async () => {
      const user = userEvent.setup()
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      const startDateInput = screen.getAllByRole('textbox')[0]
      await user.type(startDateInput, '2025-01-01')
      
      expect(startDateInput).toHaveValue('2025-01-01')
    })

    it('should allow setting end date', async () => {
      const user = userEvent.setup()
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      const endDateInput = screen.getAllByRole('textbox')[1]
      await user.type(endDateInput, '2025-01-31')
      
      expect(endDateInput).toHaveValue('2025-01-31')
    })
  })

  describe('category selection', () => {
    it('should allow selecting categories', async () => {
      const user = userEvent.setup()
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      const networkCheckbox = screen.getByLabelText('network')
      await user.click(networkCheckbox)
      
      expect(networkCheckbox).toBeChecked()
    })

    it('should allow deselecting categories', async () => {
      const user = userEvent.setup()
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      const networkCheckbox = screen.getByLabelText('network')
      await user.click(networkCheckbox)
      await user.click(networkCheckbox)
      
      expect(networkCheckbox).not.toBeChecked()
    })
  })

  describe('advanced options', () => {
    it('should default to including signatures', () => {
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      const signaturesCheckbox = screen.getByLabelText('Include cryptographic signatures')
      expect(signaturesCheckbox).toBeChecked()
    })

    it('should default to including Merkle proofs', () => {
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      const merkleCheckbox = screen.getByLabelText('Include Merkle tree proofs')
      expect(merkleCheckbox).toBeChecked()
    })

    it('should allow toggling signatures', async () => {
      const user = userEvent.setup()
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      const signaturesCheckbox = screen.getByLabelText('Include cryptographic signatures')
      await user.click(signaturesCheckbox)
      
      expect(signaturesCheckbox).not.toBeChecked()
    })

    it('should allow toggling Merkle proofs', async () => {
      const user = userEvent.setup()
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      const merkleCheckbox = screen.getByLabelText('Include Merkle tree proofs')
      await user.click(merkleCheckbox)
      
      expect(merkleCheckbox).not.toBeChecked()
    })
  })

  describe('export functionality', () => {
    it('should show export button', () => {
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      expect(screen.getByRole('button', { name: 'Export Data' })).toBeInTheDocument()
    })

    it('should show verify integrity button', () => {
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      expect(screen.getByRole('button', { name: 'Verify Integrity' })).toBeInTheDocument()
    })

    it('should handle export button click', async () => {
      const user = userEvent.setup()
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      const exportButton = screen.getByRole('button', { name: 'Export Data' })
      await user.click(exportButton)
      
      // Should create download link
      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockAppendChild).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalled()
    })

    it('should handle verify integrity button click', async () => {
      const user = userEvent.setup()
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      const verifyButton = screen.getByRole('button', { name: 'Verify Integrity' })
      await user.click(verifyButton)
      
      // Should not throw error (function exists)
      expect(verifyButton).toBeInTheDocument()
    })
  })

  describe('export results', () => {
    it('should show success message after successful export', async () => {
      const user = userEvent.setup()
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      const exportButton = screen.getByRole('button', { name: 'Export Data' })
      await user.click(exportButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Export completed successfully/)).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('should have proper form controls', () => {
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      expect(screen.getAllByRole('radio')).toHaveLength(2) // JSON and CSV options
      expect(screen.getAllByRole('checkbox')).toHaveLength(7) // 5 categories + 2 advanced options
      expect(screen.getAllByRole('textbox')).toHaveLength(2) // Date inputs
      expect(screen.getAllByRole('button')).toHaveLength(2) // Export and Verify buttons
    })

    it('should have proper labels', () => {
      render(<ExportPanel auditData={mockAuditData} logs={mockLogs} />)
      
      expect(screen.getByText('Export Format')).toBeInTheDocument()
      expect(screen.getByText('Date Range (Optional)')).toBeInTheDocument()
      expect(screen.getByText('Categories (Select all to include all categories)')).toBeInTheDocument()
      expect(screen.getByText('Advanced Options')).toBeInTheDocument()
    })
  })
})
