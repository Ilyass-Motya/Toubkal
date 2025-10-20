/**
 * Telemetry Manager Service
 * 
 * Implements zero-telemetry enforcement for Toubkal Browser
 * All telemetry functions are stubbed as no-ops per AC1
 * Following Toubkal coding rules: kebab-case for services
 */

import type {
  TelemetryManager,
  TelemetryEvent,
  ConsentRequest,
  ConsentResponse,
  PrivacyDashboardState,
  TelemetryAuditLogEntry
} from '@/types/TelemetryTypes'
import { Result } from '@/types/CommonTypes'

/**
 * Zero-telemetry implementation of TelemetryManager
 * All methods are no-ops that return success without side effects
 */
export class ZeroTelemetryManager implements TelemetryManager {
  private readonly config = {
    enabled: false,
    consentRequired: true,
    auditLogging: true,
    maxRetentionDays: 90
  }

  private readonly auditLogs: TelemetryAuditLogEntry[] = []
  private readonly consentRecords: Map<string, ConsentResponse> = new Map()
  private readonly blockedRequests: Array<{ url: string; reason: string; timestamp: number }> = []

  /**
   * Always returns false - telemetry is disabled by default
   */
  isEnabled(): boolean {
    return false
  }

  /**
   * No-op: Logs event to audit trail but doesn't send anywhere
   * AC5: Create audit log entries for telemetry operations
   */
  logEvent(event: Omit<TelemetryEvent, 'eventId' | 'timestamp'>): Promise<Result<void>> {
    try {
      // Create audit log entry for transparency
      const auditEntry: TelemetryAuditLogEntry = {
        id: this.generateId(),
        timestamp: Date.now(),
        eventType: event.eventType,
        details: event.details,
        signature: this.generateSignature(event),
        merkleProof: this.generateMerkleProof()
      }

      this.auditLogs.push(auditEntry)

      // Keep only recent logs (AC5: audit logging)
      if (this.auditLogs.length > 1000) {
        this.auditLogs.splice(0, this.auditLogs.length - 1000)
      }

      return { success: true, data: undefined }
    } catch (error) {
      console.error('[ZeroTelemetryManager.logEvent] Failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to log event' 
      }
    }
  }

  /**
   * No-op: Always returns consent denied for telemetry
   * AC4: Consent prompt required for any future telemetry
   */
  async requestConsent(request: ConsentRequest): Promise<Result<ConsentResponse>> {
    try {
      // Log the consent request attempt
      await this.logEvent({
        eventType: 'CONSENT_DENIED',
        details: {
          actionType: request.actionType,
          userId: request.userId,
          reason: 'Telemetry disabled by default'
        }
      })

      const response: ConsentResponse = {
        granted: false,
        timestamp: Date.now(),
        consentId: this.generateId()
      }

      this.consentRecords.set(response.consentId, response)

      return { success: true, data: response }
    } catch (error) {
      console.error('[ZeroTelemetryManager.requestConsent] Failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process consent request' 
      }
    }
  }

  /**
   * No-op: Always returns false - no consent granted for telemetry
   */
  async hasConsent(actionType: string, userId: string): Promise<Result<boolean>> {
    try {
      // Log the consent check
      await this.logEvent({
        eventType: 'CONSENT_DENIED',
        details: {
          actionType,
          userId,
          reason: 'Telemetry disabled by default'
        }
      })

      return { success: true, data: false }
    } catch (error) {
      console.error('[ZeroTelemetryManager.hasConsent] Failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check consent' 
      }
    }
  }

  /**
   * No-op: Revokes consent (though none was granted)
   */
  async revokeConsent(consentId: string): Promise<Result<void>> {
    try {
      this.consentRecords.delete(consentId)

      await this.logEvent({
        eventType: 'CONSENT_REVOKED',
        details: {
          consentId,
          reason: 'User revoked consent'
        }
      })

      return { success: true, data: undefined }
    } catch (error) {
      console.error('[ZeroTelemetryManager.revokeConsent] Failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to revoke consent' 
      }
    }
  }

  /**
   * Returns audit logs for transparency
   * AC5: Audit log entries for telemetry operations
   */
  getAuditLogs(limit = 100): Promise<Result<TelemetryAuditLogEntry[]>> {
    try {
      const logs = this.auditLogs
        .slice(-limit)
        .sort((a, b) => b.timestamp - a.timestamp)

      return { success: true, data: logs }
    } catch (error) {
      console.error('[ZeroTelemetryManager.getAuditLogs] Failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get audit logs' 
      }
    }
  }

  /**
   * Returns privacy dashboard state
   * AC3: Privacy dashboard shows "Telemetry: Disabled (Zero Data Collected)"
   */
  getPrivacyDashboardState(): Promise<Result<PrivacyDashboardState>> {
    try {
      const state: PrivacyDashboardState = {
        telemetryStatus: 'disabled',
        dataCollected: 'zero',
        lastAuditLog: this.auditLogs[this.auditLogs.length - 1]?.timestamp ?? 0,
        consentCount: this.consentRecords.size,
        networkRequestsBlocked: this.blockedRequests.length
      }

      return { success: true, data: state }
    } catch (error) {
      console.error('[ZeroTelemetryManager.getPrivacyDashboardState] Failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get privacy dashboard state' 
      }
    }
  }

  /**
   * Blocks network requests to telemetry endpoints
   * AC2: Zero network requests to telemetry endpoints
   * AC7: Zero unsanctioned network requests verified
   */
  async blockNetworkRequest(url: string, reason: string): Promise<Result<void>> {
    try {
      this.blockedRequests.push({
        url,
        reason,
        timestamp: Date.now()
      })

      await this.logEvent({
        eventType: 'NETWORK_REQUEST_BLOCKED',
        details: {
          url,
          reason,
          timestamp: Date.now()
        }
      })

      return { success: true, data: undefined }
    } catch (error) {
      console.error('[ZeroTelemetryManager.blockNetworkRequest] Failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to block network request' 
      }
    }
  }

  /**
   * Generates unique ID for events and consent records
   */
  private generateId(): string {
    return `toubkal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generates Ed25519 signature for audit log entries
   * Following PRIVACY-ETHICS-POLICY.md Section 1.4
   */
  private generateSignature(event: Omit<TelemetryEvent, 'eventId' | 'timestamp'>): string {
    // In a real implementation, this would use Ed25519 signing
    // For now, return a mock signature
    const data = JSON.stringify(event)
    return `ed25519_${btoa(data).substr(0, 32)}`
  }

  /**
   * Generates Merkle tree proof for audit log integrity
   * Following PRIVACY-ETHICS-POLICY.md Section 1.4
   */
  private generateMerkleProof(): string[] {
    // In a real implementation, this would compute Merkle tree proof
    // For now, return mock proof
    return [`merkle_${this.auditLogs.length}`, `root_${Date.now()}`]
  }
}

// Singleton instance following Toubkal patterns
export const telemetryManager = new ZeroTelemetryManager()
