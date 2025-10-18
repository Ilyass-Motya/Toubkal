/**
 * Audit Logger Service
 * 
 * Handles cryptographic audit logging for privacy events with Ed25519 signatures
 * and Merkle tree integrity verification.
 */

import { AuditLogEntry, PrivacyEventType } from '@/types/PrivacyTypes'

export interface AuditLoggerConfig {
  /** Maximum number of entries to keep in memory */
  maxEntries: number
  /** Whether to enable Merkle tree verification */
  enableMerkleTree: boolean
  /** Whether to enable Ed25519 signatures */
  enableSignatures: boolean
  /** Private key for signing (in real implementation) */
  privateKey?: string
}

export class AuditLogger {
  private entries: AuditLogEntry[] = []
  private merkleTree: string[] = []
  private config: AuditLoggerConfig
  private privateKey: string

  constructor(config: Partial<AuditLoggerConfig> = {}) {
    this.config = {
      maxEntries: 10000,
      enableMerkleTree: true,
      enableSignatures: true,
      ...config
    }
    
    // Generate a mock private key for development
    this.privateKey = this.generateMockPrivateKey()
  }

  /**
   * Log a privacy event with cryptographic verification
   */
  async logEvent(
    eventType: PrivacyEventType,
    data: Record<string, unknown>,
    userId: string
  ): Promise<Result<AuditLogEntry>> {
    try {
      const timestamp = Date.now()
      const eventId = this.generateEventId()
      
      // Create audit entry
      const entry: AuditLogEntry = {
        eventId,
        timestamp,
        eventType,
        details: {
          ...data,
          userId
        },
        signature: '',
        merkleProof: []
      }

      // Generate signature if enabled
      if (this.config.enableSignatures) {
        entry.signature = await this.generateSignature(entry)
      }

      // Add to entries
      this.entries.push(entry)

      // Update Merkle tree if enabled
      if (this.config.enableMerkleTree) {
        entry.merkleProof = this.updateMerkleTree(entry)
      }

      // Trim entries if over limit
      if (this.entries.length > this.config.maxEntries) {
        this.entries = this.entries.slice(-this.config.maxEntries)
        this.rebuildMerkleTree()
      }

      return { success: true, data: entry }
    } catch (error) {
      console.error('[AuditLogger] Failed to log event:', error)
      return { success: false, error: 'Failed to log audit event' }
    }
  }

  /**
   * Get audit log entries with optional filtering
   */
  getEntries(options: {
    limit?: number
    eventType?: PrivacyEventType
    userId?: string
    startTime?: number
    endTime?: number
  } = {}): AuditLogEntry[] {
    let filtered = [...this.entries]

    // Apply filters
    if (options.eventType) {
      filtered = filtered.filter(entry => entry.eventType === options.eventType)
    }

    if (options.userId) {
      filtered = filtered.filter(entry => entry.details.userId === options.userId)
    }

    if (options.startTime) {
      filtered = filtered.filter(entry => entry.timestamp >= options.startTime)
    }

    if (options.endTime) {
      filtered = filtered.filter(entry => entry.timestamp <= options.endTime)
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp)

    // Apply limit
    if (options.limit) {
      filtered = filtered.slice(0, options.limit)
    }

    return filtered
  }

  /**
   * Verify the integrity of audit log entries
   */
  async verifyIntegrity(): Promise<Result<{ valid: boolean; errors: string[] }>> {
    const errors: string[] = []

    try {
      // Verify signatures
      if (this.config.enableSignatures) {
        for (const entry of this.entries) {
          const isValid = await this.verifySignature(entry)
          if (!isValid) {
            errors.push(`Invalid signature for entry ${entry.eventId}`)
          }
        }
      }

      // Verify Merkle tree
      if (this.config.enableMerkleTree) {
        const merkleValid = this.verifyMerkleTree()
        if (!merkleValid) {
          errors.push('Merkle tree verification failed')
        }
      }

      return {
        success: true,
        data: {
          valid: errors.length === 0,
          errors
        }
      }
    } catch (error) {
      console.error('[AuditLogger] Integrity verification failed:', error)
      return {
        success: false,
        error: 'Failed to verify audit log integrity'
      }
    }
  }

  /**
   * Export audit log in various formats
   */
  async exportLog(format: 'json' | 'csv' | 'pdf' = 'json'): Promise<Result<string>> {
    try {
      const entries = this.getEntries()

      switch (format) {
        case 'json':
          return { success: true, data: JSON.stringify(entries, null, 2) }
        case 'csv':
          const csv = this.convertToCSV(entries)
          return { success: true, data: csv }
        case 'pdf':
          return { success: false, error: 'PDF export not implemented yet' }
        default:
          return { success: false, error: 'Unsupported export format' }
      }
    } catch (error) {
      console.error('[AuditLogger] Export failed:', error)
      return { success: false, error: 'Failed to export audit log' }
    }
  }

  /**
   * Get Merkle root hash for integrity verification
   */
  getMerkleRoot(): string {
    if (this.merkleTree.length === 0) {
      return ''
    }
    return this.merkleTree[this.merkleTree.length - 1]
  }

  /**
   * Get statistics about the audit log
   */
  getStatistics(): {
    totalEntries: number
    eventTypeCounts: Record<PrivacyEventType, number>
    oldestEntry: number
    newestEntry: number
    merkleRoot: string
  } {
    const eventTypeCounts = {} as Record<PrivacyEventType, number>
    
    for (const entry of this.entries) {
      eventTypeCounts[entry.eventType] = (eventTypeCounts[entry.eventType] || 0) + 1
    }

    return {
      totalEntries: this.entries.length,
      eventTypeCounts,
      oldestEntry: this.entries.length > 0 ? Math.min(...this.entries.map(e => e.timestamp)) : 0,
      newestEntry: this.entries.length > 0 ? Math.max(...this.entries.map(e => e.timestamp)) : 0,
      merkleRoot: this.getMerkleRoot()
    }
  }

  // Private methods

  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateMockPrivateKey(): string {
    // In a real implementation, this would generate a proper Ed25519 private key
    return `mock_key_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
  }

  private async generateSignature(entry: AuditLogEntry): Promise<string> {
    // In a real implementation, this would use Ed25519 to sign the entry
    const dataToSign = JSON.stringify({
      eventId: entry.eventId,
      timestamp: entry.timestamp,
      eventType: entry.eventType,
      details: entry.details
    })
    
    // Mock signature generation
    const hash = await this.sha256(dataToSign)
    return `ed25519_${hash}_${this.privateKey.slice(-8)}`
  }

  private async verifySignature(entry: AuditLogEntry): Promise<boolean> {
    // In a real implementation, this would verify the Ed25519 signature
    const dataToSign = JSON.stringify({
      eventId: entry.eventId,
      timestamp: entry.timestamp,
      eventType: entry.eventType,
      details: entry.details
    })
    
    const hash = await this.sha256(dataToSign)
    const expectedSignature = `ed25519_${hash}_${this.privateKey.slice(-8)}`
    
    return entry.signature === expectedSignature
  }

  private async sha256(data: string): Promise<string> {
    // In a real implementation, this would use Web Crypto API
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private updateMerkleTree(entry: AuditLogEntry): string[] {
    // Create leaf hash for the entry
    const leafHash = this.hashEntry(entry)
    this.merkleTree.push(leafHash)

    // Rebuild tree from current entries
    this.rebuildMerkleTree()

    // Return proof path
    return this.generateMerkleProof(entry.eventId)
  }

  private rebuildMerkleTree(): void {
    if (this.entries.length === 0) {
      this.merkleTree = []
      return
    }

    // Create leaf hashes for all entries
    const leafHashes = this.entries.map(entry => this.hashEntry(entry))
    
    // Build tree bottom-up
    this.merkleTree = [...leafHashes]
    let currentLevel = leafHashes

    while (currentLevel.length > 1) {
      const nextLevel: string[] = []
      
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i]
        const right = currentLevel[i + 1] || left // Handle odd number of nodes
        const combined = left + right
        nextLevel.push(this.hashString(combined))
      }
      
      this.merkleTree.push(...nextLevel)
      currentLevel = nextLevel
    }
  }

  private generateMerkleProof(eventId: string): string[] {
    const entryIndex = this.entries.findIndex(entry => entry.eventId === eventId)
    if (entryIndex === -1) {
      return []
    }

    // Find the leaf hash index
    const leafIndex = entryIndex
    const proof: string[] = []
    
    // Walk up the tree to build proof
    let currentIndex = leafIndex
    let levelSize = this.entries.length
    let levelStart = 0

    while (levelSize > 1) {
      const siblingIndex = currentIndex % 2 === 0 ? currentIndex + 1 : currentIndex - 1
      
      if (siblingIndex < levelStart + levelSize) {
        const siblingHash = this.merkleTree[levelStart + siblingIndex]
        if (siblingHash) {
          proof.push(siblingHash)
        }
      }

      currentIndex = Math.floor(currentIndex / 2)
      levelStart += levelSize
      levelSize = Math.ceil(levelSize / 2)
    }

    return proof
  }

  private verifyMerkleTree(): boolean {
    if (this.entries.length === 0) {
      return this.merkleTree.length === 0
    }

    // Rebuild tree and compare with stored tree
    const expectedTree = [...this.merkleTree]
    this.rebuildMerkleTree()
    
    return JSON.stringify(this.merkleTree) === JSON.stringify(expectedTree)
  }

  private hashEntry(entry: AuditLogEntry): string {
    const data = JSON.stringify({
      eventId: entry.eventId,
      timestamp: entry.timestamp,
      eventType: entry.eventType,
      details: entry.details
    })
    return this.hashString(data)
  }

  private hashString(data: string): string {
    // Simple hash function for development
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }

  private convertToCSV(entries: AuditLogEntry[]): string {
    const headers = ['eventId', 'timestamp', 'eventType', 'userId', 'signature', 'merkleProof']
    const rows = entries.map(entry => [
      entry.eventId,
      entry.timestamp,
      entry.eventType,
      entry.details.userId,
      entry.signature,
      entry.merkleProof.join('|')
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }
}

// Singleton instance
let auditLoggerInstance: AuditLogger | null = null

export function getAuditLogger(): AuditLogger {
  if (!auditLoggerInstance) {
    auditLoggerInstance = new AuditLogger()
  }
  return auditLoggerInstance
}

// Type for Result<T> pattern
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }
