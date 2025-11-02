/**
 * Transparency Dashboard Types
 * 
 * Type definitions for transparency dashboard components and data structures.
 */

export interface AuditLogEntry {
  id: string
  timestamp: string
  eventType: 'AI_QUERY' | 'CONSENT_DECISION' | 'NETWORK_REQUEST' | 'PRIVACY_ACTION' | 'SYSTEM_EVENT'
  category: 'network' | 'ai' | 'consent' | 'privacy' | 'system'
  details: {
    action: string
    resource?: string
    dataAccessed?: string[]
    consentRequired?: boolean
    consentGranted?: boolean
    duration?: number
    success: boolean
  }
  signature: string
  merkleProof: string[]
}

export interface ConsentDecision {
  id: string
  timestamp: string
  actionType: string
  dataDisclosed: string[]
  decision: 'granted' | 'denied' | 'revoked'
  userAgent: string
  ipAddress?: string
  signature: string
}

export interface AuditData {
  totalEntries: number
  consentHistory: ConsentDecision[]
  networkRequests: AuditLogEntry[]
  aiQueries: AuditLogEntry[]
  privacyActions: AuditLogEntry[]
  systemEvents: AuditLogEntry[]
  lastUpdated: string
  merkleRoot: string
}

export interface LogFilter {
  category?: 'network' | 'ai' | 'consent' | 'privacy' | 'system'
  eventType?: string
  dateRange?: {
    start: string
    end: string
  }
  searchTerm?: string
  successOnly?: boolean
}

export interface ExportOptions {
  format: 'json' | 'csv'
  dateRange?: {
    start: string
    end: string
  }
  categories?: string[]
  includeSignatures?: boolean
  includeMerkleProofs?: boolean
}

export interface RealTimeLogUpdate {
  type: 'new' | 'update' | 'delete'
  entry: AuditLogEntry
  timestamp: string
}

export interface TransparencyDashboardState {
  isAuthenticated: boolean
  isStreaming: boolean
  lastUpdate: string
  totalOperations: number
  privacyScore: number
}

export interface AuditLogViewerProps {
  logs: AuditLogEntry[]
  onRefresh: () => void
  className?: string
}

export interface ConsentHistoryProps {
  consentData: ConsentDecision[]
  className?: string
}

export interface ExportPanelProps {
  auditData?: AuditData
  logs: AuditLogEntry[]
  className?: string
}

export interface LogStreamingConfig {
  endpoint: string
  reconnectInterval: number
  maxRetries: number
  bufferSize: number
}

export interface TransparencyServiceConfig {
  auditEndpoint: string
  realTimeEndpoint: string
  exportEndpoint: string
  authenticationRequired: boolean
  sessionTimeout: number
}