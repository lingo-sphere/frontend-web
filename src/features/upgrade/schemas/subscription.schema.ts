// Zod Schemas và kiểu dữ liệu TypeScript cho gói dịch vụ nâng cấp tài khoản subscription.

import { z } from 'zod'

export interface SubscriptionPlanDto {
  _id?: string
  id?: string
  name?: string
  name_vi?: string | null
  name_en?: string | null
  slug: string
  description?: string
  tier: number
  plan_type?: string
  price: number
  original_price?: number | null
  discount?: string | null
  currency?: string
  duration_days?: number
  discount_price?: number
  billing_cycle?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'LIFETIME' | string | null
  features?: string[]
  is_active?: boolean
  is_popular?: boolean
  badge?: string | null
}

export const BankInfoSchema = z.object({
  bank_name: z.string(),
  bank_code: z.string(),
  account_number: z.string(),
  account_name: z.string(),
}).passthrough()

export const PaymentOrderResponseSchema = z.object({
  order_code: z.string(),
  amount: z.number(),
  billing_cycle: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY', 'LIFETIME', 'ONCE']),
  qr_url: z.string(),
  bank_info: BankInfoSchema,
  expires_at: z.string(),
}).passthrough()

export const PaymentOrderStatusResponseSchema = z.object({
  order_code: z.string(),
  status: z.enum(['PENDING', 'PAID', 'EXPIRED', 'CANCELLED']),
  amount: z.number(),
  billing_cycle: z.string(),
  paid_at: z.string().optional(),
}).passthrough()

export const SubscriptionDetailsSchema = z.object({
  status: z.string(),
  billing_cycle: z.string(),
  price_paid: z.number(),
  started_at: z.string(),
  expires_at: z.string(),
}).passthrough()

export const SubscriptionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  expires_at: z.string(),
  subscription: SubscriptionDetailsSchema,
}).passthrough()

export type BankInfo = z.infer<typeof BankInfoSchema>
export type PaymentOrderResponse = z.infer<typeof PaymentOrderResponseSchema>
export type PaymentOrderStatusResponse = z.infer<typeof PaymentOrderStatusResponseSchema>
export type SubscriptionResponse = z.infer<typeof SubscriptionResponseSchema>
