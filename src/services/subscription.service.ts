/**
 * @file subscription.service.ts
 * @description Service xử lý các logic nghiệp vụ chính cho dịch vụ subscription
 */

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

export interface CreateOrderPayload {
  plan_slug?: string
  billing_cycle?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'LIFETIME' | 'ONCE'
  amount?: number
  order_type?: 'SUBSCRIPTION' | 'COURSE'
  course_ids?: string[]
}

export interface BankInfo {
  bank_name: string
  bank_code: string
  account_number: string
  account_name: string
}

export interface PaymentOrderResponse {
  order_code: string
  amount: number
  billing_cycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'LIFETIME'
  qr_url: string
  bank_info: BankInfo
  expires_at: string
}

export interface PaymentOrderStatusResponse {
  order_code: string
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED'
  amount: number
  billing_cycle: string
  paid_at?: string
}

export const subscriptionService = {
  async getPlans(): Promise<any[]> {
    return api.get(API_CONFIG.ENDPOINTS.SUBSCRIPTION.PLANS)
  },

  async subscribe(payload: SubscribePayload): Promise<SubscriptionResponse> {
    return api.post<SubscriptionResponse>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.SUBSCRIBE, payload)
  },

  async createPaymentOrder(payload: CreateOrderPayload): Promise<PaymentOrderResponse> {
    return api.post<PaymentOrderResponse>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.CREATE_ORDER, payload)
  },

  async getPaymentOrderStatus(orderCode: string): Promise<PaymentOrderStatusResponse> {
    return api.get<PaymentOrderStatusResponse>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.ORDER_STATUS(orderCode))
  },

  async simulatePayment(orderCode: string): Promise<{ success: boolean; message: string; order_code: string }> {
    return api.post<{ success: boolean; message: string; order_code: string }>(
      API_CONFIG.ENDPOINTS.SUBSCRIPTION.SIMULATE_ORDER(orderCode),
      {}
    )
  },

  async getMySubscription(): Promise<Record<string, unknown>> {
    return api.get<Record<string, unknown>>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.MY)
  },

  async cancelSubscription(reason?: string): Promise<Record<string, unknown>> {
    return api.post<Record<string, unknown>>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.CANCEL, { reason })
  },
}
