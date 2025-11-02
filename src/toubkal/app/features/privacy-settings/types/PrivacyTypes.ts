/**
 * Privacy Types for Toubkal Browser
 *
 * Defines TypeScript interfaces and types for privacy settings,
 * fingerprinting protection, and tracker blocking functionality.
 */

export interface PrivacySettings {
  /** Whether fingerprinting protection is enabled */
  fingerprintingProtection: boolean
  /** Whether tracker blocking is enabled */
  trackerBlocking: boolean
  /** Whether Brave Shields is in aggressive mode */
  braveShieldsAggressive: boolean
  /** Whether privacy protection is enabled overall */
  protectionEnabled: boolean
  /** Timestamp when settings were last modified */
  lastModified: number
  /** User ID for audit logging */
  userId: string
}

export interface PrivacyStatus {
  /** Overall protection status */
  status: 'enabled' | 'disabled' | 'partial'
  /** Individual feature statuses */
  features: {
    fingerprinting: boolean
    tracking: boolean
    shields: boolean
  }
  /** Performance metrics */
  performance: {
    activationTime: number
    firstRunTime: number
  }
  /** Last audit log entry ID */
  lastAuditId: string
}

export interface AuditLogEntry {
  /** Unique event ID */
  eventId: string
  /** Timestamp of the event */
  timestamp: number
  /** Type of privacy event */
  eventType: PrivacyEventType
  /** Event details */
  details: {
    setting?: string
    oldValue?: boolean
    newValue?: boolean
    userId: string
    userAgent?: string
    url?: string
  }
  /** Ed25519 signature for verification */
  signature: string
  /** Merkle tree proof for integrity */
  merkleProof: string[]
}

export interface TrackerBlocklist {
  /** Blocklist name (e.g., 'EasyList', 'EasyPrivacy') */
  name: string
  /** Blocklist version */
  version: string
  /** Number of rules in the blocklist */
  ruleCount: number
  /** Last updated timestamp */
  lastUpdated: number
  /** Whether the blocklist is active */
  active: boolean
}

export interface FingerprintingTestResult {
  /** Test name (e.g., 'Panopticlick') */
  testName: string
  /** Test URL */
  testUrl: string
  /** Overall privacy score (0-100) */
  score: number
  /** Whether the test passed */
  passed: boolean
  /** Detailed test results */
  details: {
    canvasFingerprint: boolean
    webglFingerprint: boolean
    fontFingerprint: boolean
    audioFingerprint: boolean
    screenFingerprint: boolean
    timezoneFingerprint: boolean
  }
  /** Test timestamp */
  timestamp: number
}

export interface PrivacyWarning {
  /** Warning type */
  type: 'REDUCED_PRIVACY' | 'TRACKING_ENABLED' | 'FINGERPRINTING_ENABLED'
  /** Warning message */
  message: string
  /** Whether user has acknowledged the warning */
  acknowledged: boolean
  /** Timestamp when warning was shown */
  timestamp: number
}

export interface PrivacyManagerConfig {
  /** Default privacy settings */
  defaults: PrivacySettings
  /** Blocklist sources */
  blocklistSources: string[]
  /** Performance thresholds */
  thresholds: {
    maxActivationTime: number // 2000ms
    maxFirstRunTime: number // 10000ms
  }
  /** Audit log retention period (days) */
  auditRetentionDays: number
}

export type PrivacyEventType = 
  | 'PRIVACY_SETTINGS_CHANGED'
  | 'FINGERPRINTING_BLOCKED' 
  | 'TRACKER_BLOCKED'
  | 'SHIELDS_UPDATED'
  | 'BLOCKLIST_UPDATED'
  | 'PRIVACY_WARNING_SHOWN'

export interface PrivacyEvent {
  type: PrivacyEventType
  data: Record<string, unknown>
  timestamp: number
  userId: string
}
