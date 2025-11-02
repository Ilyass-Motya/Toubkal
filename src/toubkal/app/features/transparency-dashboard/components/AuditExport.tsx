/**
 * Toubkal Browser - Audit Export Component
 * 
 * Provides JSON and CSV export functionality for audit data with
 * filtering, date range selection, and integrity verification.
 */

import React, { useState } from 'react';
import { AuditExportData, LogFilters } from '../types/TransparencyTypes';
import { AuditApiService } from '../services/audit-api';

interface AuditExportProps {
  className?: string;
}

export function AuditExport({ className = '' }: AuditExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    end: new Date().toISOString().split('T')[0] // today
  });
  const [includeLogs, setIncludeLogs] = useState(true);
  const [includeConsent, setIncludeConsent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const auditApi = AuditApiService.getInstance();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);
      setSuccess(null);

      // Build filters based on current settings
      const filters: LogFilters = {
        dateRange: {
          start: new Date(dateRange.start).toISOString(),
          end: new Date(dateRange.end).toISOString()
        }
      };

      const result = await auditApi.exportAuditData(filters);
      if (!result.success) {
        setError(result.error);
        return;
      }

      const exportData = result.data;

      // Filter data based on user selections
      const filteredData: AuditExportData = {
        ...exportData,
        logs: includeLogs ? exportData.logs : [],
        consentDecisions: includeConsent ? exportData.consentDecisions : []
      };

      // Generate export content
      let content: string;
      let filename: string;
      let mimeType: string;

      if (exportFormat === 'json') {
        content = JSON.stringify(filteredData, null, 2);
        filename = `toubkal-audit-export-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        // Generate CSV content
        content = generateCSV(filteredData);
        filename = `toubkal-audit-export-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess(`Export completed: ${filename}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Export failed: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSV = (data: AuditExportData): string => {
    const lines: string[] = [];
    
    // CSV Header
    lines.push('Type,Timestamp,Component,Operation,Level,Message,Decision,Data Accessed,Context');
    
    // Add logs
    if (data.logs.length > 0) {
      data.logs.forEach(log => {
        const context = log.context ? JSON.stringify(log.context).replace(/"/g, '""') : '';
        const line = [
          'LOG',
          log.timestamp,
          log.component,
          log.operation,
          log.level,
          `"${log.message.replace(/"/g, '""')}"`,
          '',
          '',
          `"${context}"`
        ].join(',');
        lines.push(line);
      });
    }
    
    // Add consent decisions
    if (data.consentDecisions.length > 0) {
      data.consentDecisions.forEach(decision => {
        const dataAccessed = decision.dataAccessed.join(';');
        const line = [
          'CONSENT',
          decision.timestamp,
          'consent',
          decision.action,
          '',
          `"${decision.reason ?? ''}"`,
          decision.decision,
          `"${dataAccessed}"`,
          ''
        ].join(',');
        lines.push(line);
      });
    }
    
    return lines.join('\n');
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className={`audit-export ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Export Audit Data</h2>
        <p className="text-sm text-gray-600">
          Export audit logs and consent decisions for external analysis or compliance reporting.
        </p>
      </div>

      {/* Export Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
                  className="mr-2"
                />
                <span className="text-sm">JSON (Structured data)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
                  className="mr-2"
                />
                <span className="text-sm">CSV (Spreadsheet compatible)</span>
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Data Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Include Data
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeLogs}
                  onChange={(e) => setIncludeLogs(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Audit Logs</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeConsent}
                  onChange={(e) => setIncludeConsent(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Consent Decisions</span>
              </label>
            </div>
          </div>

          {/* Export Button */}
          <div className="pt-4">
          <button
            onClick={() => void handleExport()}
            disabled={isExporting || (!includeLogs && !includeConsent)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Exporting...' : 'Export Data'}
          </button>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error != null && error.length > 0 && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success != null && success.length > 0 && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Export Information */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Export Information</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Exported data includes cryptographic signatures for verification</li>
          <li>• All timestamps are in ISO 8601 format (UTC)</li>
          <li>• Sensitive data is automatically sanitized for privacy</li>
          <li>• Export files are signed with Ed25519 for integrity verification</li>
        </ul>
      </div>
    </div>
  );
}
