// Service xử lý các yêu cầu API liên quan đến gói dịch vụ nâng cấp subscription và đơn hàng thanh toán.

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import {
  SubscriptionResponseSchema,
  PaymentOrderResponseSchema,
  PaymentOrderStatusResponseSchema,
  type BankInfo,
  type SubscriptionResponse,
  type PaymentOrderResponse,
  type PaymentOrderStatusResponse,
  type SubscriptionPlanDto,
} from '@/features/upgrade/schemas/subscription.schema'

export type { BankInfo, SubscriptionResponse, PaymentOrderResponse, PaymentOrderStatusResponse, SubscriptionPlanDto }

export interface SubscribePayload {
  plan_slug: string
  billing_cycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'LIFETIME'
  payment_method?: string
}

export interface CreateOrderPayload {
  plan_slug?: string
  billing_cycle?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'LIFETIME' | 'ONCE'
  amount?: number
  order_type?: 'SUBSCRIPTION' | 'COURSE'
  course_ids?: string[]
}

export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlanDto[]> {
    return api.get<SubscriptionPlanDto[]>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.PLANS)
  },

  async subscribe(payload: SubscribePayload): Promise<SubscriptionResponse> {
    return api.post<SubscriptionResponse>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.SUBSCRIBE, payload, SubscriptionResponseSchema)
  },

  async createPaymentOrder(payload: CreateOrderPayload): Promise<PaymentOrderResponse> {
    return api.post<PaymentOrderResponse>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.CREATE_ORDER, payload, PaymentOrderResponseSchema)
  },

  async getPaymentOrderStatus(orderCode: string): Promise<PaymentOrderStatusResponse> {
    return api.get<PaymentOrderStatusResponse>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.ORDER_STATUS(orderCode), undefined, PaymentOrderStatusResponseSchema)
  },

  async simulatePayment(orderCode: string): Promise<{ success: boolean; message: string; order_code: string }> {
    return api.post<{ success: boolean; message: string; order_code: string }>(
      API_CONFIG.ENDPOINTS.SUBSCRIPTION.SIMULATE_ORDER(orderCode),
    )
  },

  async getMySubscription(): Promise<Record<string, unknown>> {
    return api.get<Record<string, unknown>>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.MY)
  },

  async cancelSubscription(reason?: string): Promise<Record<string, unknown>> {
    return api.post<Record<string, unknown>>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.CANCEL, { reason })
  },
}
