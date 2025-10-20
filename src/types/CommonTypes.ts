/**
 * Common Types for Toubkal Browser
 *
 * Central definitions for shared types across the application
 * Following Toubkal coding rules: PascalCase for types
 */

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export type ResultVoid = Result<void>

// Error classes following coding rules
export class ToubkalError extends Error {
  constructor(message: string, public context?: Record<string, unknown>) {
    super(message)
    this.name = 'ToubkalError'
  }
}

export class ValidationError extends ToubkalError {
  constructor(message: string, public field?: string) {
    super(message, { field })
    this.name = 'ValidationError'
  }
}

export class NetworkError extends ToubkalError {
  constructor(message: string, public url?: string, public statusCode?: number) {
    super(message, { url, statusCode })
    this.name = 'NetworkError'
  }
}

export class CryptoError extends ToubkalError {
  constructor(message: string, public operation?: string) {
    super(message, { operation })
    this.name = 'CryptoError'
  }
}
