import { Result } from '@/types'

export interface ConsentRequest {
  actionType: string
  userId: string
  context?: string
  timestamp?: number
}

export interface ConsentResponse {
  granted: boolean
  timestamp: number
  consentId: string
  expiresAt?: number
}

export interface ConsentManager {
  requestConsent(request: ConsentRequest): Promise<Result<ConsentResponse>>
  hasConsent(actionType: string, userId: string): Promise<boolean>
  revokeConsent(actionType: string, userId: string): Promise<boolean>
  getConsentHistory(userId: string): Promise<Result<ConsentResponse[]>>
}

// Simple in-memory implementation for baseline functionality
class InMemoryConsentManager implements ConsentManager {
  private consents = new Map<string, ConsentResponse>()

  requestConsent(request: ConsentRequest): Promise<Result<ConsentResponse>> {
    try {
      const key = `${request.userId}:${request.actionType}`
      const response: ConsentResponse = {
        granted: true, // For baseline, always grant
        timestamp: Date.now(),
        consentId: `consent-${Date.now()}`,
      }
      this.consents.set(key, response)
      return { success: true, data: response }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to request consent'
      }
    }
  }

  hasConsent(actionType: string, userId: string): Promise<boolean> {
    const key = `${userId}:${actionType}`
    const consent = this.consents.get(key)
    return consent?.granted === true
  }

  revokeConsent(actionType: string, userId: string): Promise<boolean> {
    try {
      const key = `${userId}:${actionType}`
      this.consents.delete(key)
      return true
    } catch {
      return false
    }
  }

  getConsentHistory(userId: string): Promise<Result<ConsentResponse[]>> {
    try {
      const history: ConsentResponse[] = []
      for (const [key, consent] of this.consents) {
        if (key.startsWith(`${userId}:`)) {
          history.push(consent)
        }
      }
      return { success: true, data: history }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get consent history'
      }
    }
  }
}

let instance: ConsentManager | null = null

export const getConsentManager = (): ConsentManager => {
  if (!instance) {
    instance = new InMemoryConsentManager()
  }
  return instance
}
