/**
 * Privacy Settings Feature
 * 
 * Public API for the privacy-settings feature.
 * Exports components, hooks, services, and types for external use.
 */

// Components
export { PrivacySettings } from './components/PrivacySettings'

// Hooks
export { usePrivacySettings } from './hooks/use-privacy-settings'

// Services
export { PrivacyManager, getPrivacyManager } from './services/privacy-manager'

// Types
export type {
  PrivacySettings as PrivacySettingsType,
  PrivacyStatus,
  AuditLogEntry,
  TrackerBlocklist,
  FingerprintingTestResult,
  PrivacyWarning,
  PrivacyManagerConfig,
  PrivacyEvent,
  PrivacyEventType,
} from './types/PrivacyTypes'
