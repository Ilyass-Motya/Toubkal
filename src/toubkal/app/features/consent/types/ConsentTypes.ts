/**
 * Consent Types for Toubkal Browser
 *
 * Defines types for consent management system
 * Following Toubkal coding rules: PascalCase for types
 */

// Result type will be used when implementing consent operations
// import { Result } from '@/shared/types/CommonTypes'

export interface ConsentPromptProps {
  readonly actionType: string
  readonly dataDisclosed: string[]
  readonly purpose: string
  readonly onGrant: () => void
  readonly onDeny: () => void
  readonly onClose: () => void
}

// Error types following coding rules
export class ConsentError extends Error {
  constructor(message: string, public context: { consentId?: string; actionType?: string }) {
    super(message)
    this.name = 'ConsentError'
  }
}
