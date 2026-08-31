import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'

export interface SubscribePayload {
  plan_slug: string
  billing_cycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'LIFETIME'
  payment_method?: string
}

export interface SubscriptionResponse {
  success: boolean
  message: string
  expires_at: string
  subscription: {
    status: string
    billing_cycle: string
    price_paid: number
    started_at: string
    expires_at: string
  }
}

export const subscriptionService = {
  async subscribe(payload: SubscribePayload): Promise<SubscriptionResponse> {
    return api.post<SubscriptionResponse>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.SUBSCRIBE, payload)
  },

  async getMySubscription(): Promise<Record<string, unknown>> {
    return api.get<Record<string, unknown>>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.MY)
  },

  async cancelSubscription(reason?: string): Promise<Record<string, unknown>> {
    return api.post<Record<string, unknown>>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.CANCEL, { reason })
  },
}
