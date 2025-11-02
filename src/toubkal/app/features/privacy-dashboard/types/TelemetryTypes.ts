/**
 * Telemetry Types for Toubkal Browser
 *
 * Defines types for zero-telemetry enforcement system
 * Following Toubkal coding rules: PascalCase for types
 */

import { Result } from '@/shared/types/CommonTypes'

export interface TelemetryEvent {
  readonly eventId: string
  readonly timestamp: number
  readonly eventType: TelemetryEventType
  readonly details: Record<string, unknown>
  readonly consentId?: string
}

export type TelemetryEventType = 
  | 'AI_QUERY_LOCAL'
  | 'AI_QUERY_CLOUD'
  | 'CONSENT_GRANTED'
  | 'CONSENT_DENIED'
  | 'CONSENT_REVOKED'
  | 'TELEMETRY_DISABLED'
  | 'NETWORK_REQUEST_BLOCKED'
  | 'PRIVACY_DASHBOARD_VIEWED'

export interface TelemetryConfig {
  readonly enabled: boolean
  readonly consentRequired: boolean
  readonly auditLogging: boolean
  readonly maxRetentionDays: number
}

export interface ConsentRequest {
  readonly actionType: string
  readonly userId: string
  readonly dataDisclosed: string[]
  readonly purpose: string
  readonly retentionPeriod: number
}

export interface ConsentResponse {
  readonly granted: boolean
  readonly timestamp: number
  readonly consentId: string
  readonly expiresAt?: number
}

export interface TelemetryAuditLogEntry {
  readonly id: string
  readonly timestamp: number
  readonly eventType: TelemetryEventType
  readonly details: Record<string, unknown>
  readonly signature: string
  readonly merkleProof: string[]
}

export interface NetworkRequestInfo {
  readonly url: string
  readonly method: string
  readonly blocked: boolean
  readonly reason?: string
  readonly timestamp: number
}

export interface PrivacyDashboardState {
  readonly telemetryStatus: 'disabled' | 'enabled' | 'unknown'
  readonly dataCollected: 'zero' | 'minimal' | 'standard'
  readonly lastAuditLog: number
  readonly consentCount: number
  readonly networkRequestsBlocked: number
}

export interface TelemetryManager {
  readonly isEnabled: () => boolean
  readonly logEvent: (event: Omit<TelemetryEvent, 'eventId' | 'timestamp'>) => Promise<Result<void>>
  readonly requestConsent: (request: ConsentRequest) => Promise<Result<ConsentResponse>>
  readonly hasConsent: (actionType: string, userId: string) => Promise<Result<boolean>>
  readonly revokeConsent: (consentId: string) => Promise<Result<void>>
  readonly getAuditLogs: (limit?: number) => Promise<Result<TelemetryAuditLogEntry[]>>
  readonly getPrivacyDashboardState: () => Promise<Result<PrivacyDashboardState>>
  readonly blockNetworkRequest: (url: string, reason: string) => Promise<Result<void>>
}

// Error types following coding rules
export class TelemetryError extends Error {
  constructor(message: string, public context: { actionType?: string; userId?: string }) {
    super(message)
    this.name = 'TelemetryError'
  }
}

export class AuditLogError extends Error {
  constructor(message: string, public context: { eventId?: string; operation?: string }) {
    super(message)
    this.name = 'AuditLogError'
  }
}
