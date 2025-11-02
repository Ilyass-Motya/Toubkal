/**
 * Privacy Dashboard Types for Toubkal Browser
 *
 * Defines types for privacy dashboard functionality
 * Following Toubkal coding rules: PascalCase for types
 */

export interface PrivacyDashboardProps {
  readonly onConsentHistoryClick: () => void
  readonly onAuditLogsClick: () => void
  readonly onSettingsClick: () => void
}
