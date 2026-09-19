// Handles user-related validation schemas.

import { z } from 'zod'

export const UserRoleSchema = z.enum(['ADMIN', 'INSTRUCTOR', 'STUDENT', 'USER'])
export const AccountStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING'])

export const UserSchema = z.object({
  user_id: z.string(),
  _id: z.string().optional(),
  id: z.string().optional(),
  email: z.string(),
  full_name: z.string().default(''),
  phone_number: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  role: UserRoleSchema.default('STUDENT'),
  status: AccountStatusSchema.default('ACTIVE'),
  is_email_verified: z.boolean().optional(),
  bio: z.string().nullable().optional(),
  level: z.string().nullable().optional(),
  target_score: z.number().nullable().optional(),
  target_toeic_score: z.number().nullable().optional(),
  current_estimated_score: z.number().nullable().optional(),
  placement_test_score: z.number().nullable().optional(),
  placement_listening_score: z.number().nullable().optional(),
  placement_reading_score: z.number().nullable().optional(),
  placement_speaking_score: z.number().nullable().optional(),
  placement_writing_score: z.number().nullable().optional(),
  placement_skills_type: z.string().nullable().optional(),
  placement_tested_at: z.string().nullable().optional(),
  is_score_manually_edited: z.boolean().optional(),
  xp: z.number().optional(),
  streak_count: z.number().optional(),
  is_premium: z.boolean().optional(),
  subscription_expires_at: z.string().nullable().optional(),
  subscription_plan: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
}).passthrough()

export const GamificationProfileSchema = z.object({
  total_xp: z.number().default(0),
  weekly_xp: z.number().optional(),
  monthly_xp: z.number().optional(),
  level: z.number().default(1),
  current_streak: z.number().default(0),
  longest_streak: z.number().default(0),
  streak_freezes_left: z.number().optional(),
  gems: z.number().optional(),
  league: z.string().optional(),
}).passthrough()

export const LeaderboardEntrySchema = z.object({
  rank: z.number().default(0),
  user_id: z.string().default(''),
  full_name: z.string().default('Học viên'),
  user_name: z.string().optional(),
  avatar_url: z.string().optional(),
  user_avatar: z.string().optional(),
  xp: z.number().default(0),
  level: z.number().optional(),
  current_streak: z.number().optional(),
  streak_days: z.number().optional(),
  league: z.string().optional(),
  is_current_user: z.boolean().optional(),
}).passthrough()

export const LeaderboardListSchema = z.union([
  z.array(LeaderboardEntrySchema),
  z.object({ items: z.array(LeaderboardEntrySchema) }).transform((val) => val.items),
]).default([])

export const UserSubscriptionSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  user_id: z.string().optional(),
  plan_id: z.string().optional(),
  billing_cycle: z.string().optional(),
  price_paid: z.number().optional(),
  status: z.string().optional(),
  started_at: z.string().optional(),
  expires_at: z.string().nullable().optional(),
  cancelled_at: z.string().nullable().optional(),
  auto_renew: z.boolean().optional(),
}).passthrough()

export const UserProfileResponseSchema = z.object({
  profile: UserSchema,
  is_premium: z.boolean().default(false),
  subscription_expires_at: z.string().nullable().optional(),
  subscription_plan: z.string().nullable().optional(),
  gamification: GamificationProfileSchema.nullable().optional(),
  settings: z.record(z.string(), z.unknown()).nullable().optional(),
  subscription: UserSubscriptionSchema.nullable().optional(),
}).passthrough()

export const AuthResponseSchema = z.object({
  user: UserSchema,
  access_token: z.string(),
  refresh_token: z.string().optional(),
}).passthrough()

export const RegisterResponseSchema = z.object({
  message: z.string().optional(),
  email: z.string().optional(),
  expire_minutes: z.number().optional(),
  user: UserSchema.optional(),
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
}).passthrough()

export type User = z.infer<typeof UserSchema>
export type GamificationProfile = z.infer<typeof GamificationProfileSchema>
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>
export type UserSubscription = z.infer<typeof UserSubscriptionSchema>
export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>
