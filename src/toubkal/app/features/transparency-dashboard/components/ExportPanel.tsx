/**
 * Export Panel Component
 * 
 * Audit export functionality with JSON/CSV formats and filtering options.
 */

import React, { useState } from 'react'
import { ExportOptions, ExportPanelProps, AuditData, AuditLogEntry } from '../types/TransparencyTypes'

export const ExportPanel: React.FC<ExportPanelProps> = ({ 
  auditData,
  logs,
  className = '' 
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeSignatures: true,
    includeMerkleProofs: true
  })
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [exportResult, setExportResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)

  const categories = ['network', 'ai', 'consent', 'privacy', 'system']

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const generateExportData = () => {
    let filteredLogs = [...logs]

    // Filter by date range
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start)
      const endDate = new Date(dateRange.end)
      filteredLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.timestamp)
        return logDate >= startDate && logDate <= endDate
      })
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filteredLogs = filteredLogs.filter(log => selectedCategories.includes(log.category))
    }

    // Prepare export data
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalEntries: filteredLogs.length,
        dateRange: dateRange.start && dateRange.end ? { start: dateRange.start, end: dateRange.end } : null,
        categories: selectedCategories.length > 0 ? selectedCategories : null,
        format: exportOptions.format,
        includeSignatures: exportOptions.includeSignatures,
        includeMerkleProofs: exportOptions.includeMerkleProofs
      },
      auditData: auditData ? {
        totalEntries: auditData.totalEntries,
        lastUpdated: auditData.lastUpdated,
        merkleRoot: auditData.merkleRoot
      } : null,
      entries: filteredLogs.map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        eventType: log.eventType,
        category: log.category,
        details: log.details,
        ...(exportOptions.includeSignatures && { signature: log.signature }),
        ...(exportOptions.includeMerkleProofs && { merkleProof: log.merkleProof })
      }))
    }

    return exportData
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportResult(null)

    try {
      const exportData = generateExportData()
      
      if (exportOptions.format === 'json') {
        const jsonData = JSON.stringify(exportData, null, 2)
        const blob = new Blob([jsonData], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `toubkal-audit-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else if (exportOptions.format === 'csv') {
        // Convert to CSV format
        const csvData = convertToCSV(exportData.entries)
        const blob = new Blob([csvData], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `toubkal-audit-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      setExportResult({
        success: true,
        message: `Export completed successfully. ${exportData.entries.length} entries exported.`
      })
    } catch (error) {
      setExportResult({
        success: false,
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsExporting(false)
    }
  }

  const convertToCSV = (entries: any[]) => {
    if (entries.length === 0) return ''

    const headers = [
      'ID',
      'Timestamp',
      'Event Type',
      'Category',
      'Action',
      'Resource',
      'Data Accessed',
      'Success',
      'Duration',
      'Consent Required',
      'Consent Granted'
    ]

    const rows = entries.map(entry => [
      entry.id,
      entry.timestamp,
      entry.eventType,
      entry.category,
      entry.details.action,
      entry.details.resource || '',
      entry.details.dataAccessed ? entry.details.dataAccessed.join('; ') : '',
      entry.details.success,
      entry.details.duration || '',
      entry.details.consentRequired || false,
      entry.details.consentGranted || false
    ])

    return [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n')
  }

  const verifyIntegrity = () => {
    // TODO: Implement integrity verification
    console.log('Verifying export integrity...')
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={exportOptions.format === 'json'}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'json' | 'csv' }))}
                  className="mr-2"
                />
                <span className="text-sm">JSON (Complete data with metadata)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportOptions.format === 'csv'}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'json' | 'csv' }))}
                  className="mr-2"
                />
                <span className="text-sm">CSV (Spreadsheet compatible)</span>
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range (Optional)
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Start date"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="End date"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categories (Select all to include all categories)
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="mr-2"
                />
                <span className="text-sm capitalize">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Advanced Options */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Advanced Options
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeSignatures}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeSignatures: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm">Include cryptographic signatures</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeMerkleProofs}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeMerkleProofs: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm">Include Merkle tree proofs</span>
            </label>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Export Data</h3>
            <p className="text-sm text-gray-600">
              Export audit logs and consent decisions for external analysis
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={verifyIntegrity}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Verify Integrity
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? 'Exporting...' : 'Export Data'}
            </button>
          </div>
        </div>

        {exportResult && (
          <div className={`mt-4 p-4 rounded-md ${
            exportResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`text-sm ${
              exportResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {exportResult.message}
            </div>
          </div>
        )}
      </div>

      {/* Export Preview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Preview</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <div>Total entries to export: {logs.length}</div>
          <div>Format: {exportOptions.format.toUpperCase()}</div>
          <div>Date range: {dateRange.start && dateRange.end ? `${dateRange.start} to ${dateRange.end}` : 'All dates'}</div>
          <div>Categories: {selectedCategories.length > 0 ? selectedCategories.join(', ') : 'All categories'}</div>
          <div>Signatures: {exportOptions.includeSignatures ? 'Included' : 'Excluded'}</div>
          <div>Merkle proofs: {exportOptions.includeMerkleProofs ? 'Included' : 'Excluded'}</div>
        </div>
      </div>
    </div>
  )
}
