/**
 * @file subscription.schema.ts
 * @description Zod Schemas định nghĩa cấu trúc dữ liệu cho dịch vụ subscription
 */

import { z } from 'zod'

export const BankInfoSchema = z.object({
  bank_name: z.string(),
  bank_code: z.string(),
  account_number: z.string(),
  account_name: z.string(),
}).passthrough()

export const PaymentOrderResponseSchema = z.object({
  order_code: z.string(),
  amount: z.number(),
  billing_cycle: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY', 'LIFETIME']),
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
