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
  phone_number: z.string().optional(),
  avatar_url: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  role: UserRoleSchema.default('STUDENT'),
  status: AccountStatusSchema.default('ACTIVE'),
  is_email_verified: z.boolean().optional(),
  bio: z.string().optional(),
  level: z.string().optional(),
  target_score: z.number().optional(),
  target_toeic_score: z.number().optional(),
  current_estimated_score: z.number().optional(),
  placement_test_score: z.number().optional(),
  placement_listening_score: z.number().optional(),
  placement_reading_score: z.number().optional(),
  placement_speaking_score: z.number().optional(),
  placement_writing_score: z.number().optional(),
  placement_skills_type: z.string().optional(),
  placement_tested_at: z.string().optional(),
  is_score_manually_edited: z.boolean().optional(),
  xp: z.number().optional(),
  streak_count: z.number().optional(),
  is_premium: z.boolean().optional(),
  subscription_expires_at: z.string().optional(),
  subscription_plan: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
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

export const UserProfileResponseSchema = z.object({
  profile: UserSchema,
  is_premium: z.boolean().default(false),
  subscription_expires_at: z.string().optional(),
  subscription_plan: z.string().optional(),
  gamification: GamificationProfileSchema.optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
  subscription: z.record(z.string(), z.unknown()).optional(),
}).passthrough()

export const AuthResponseSchema = z.object({
  user: UserSchema,
  access_token: z.string(),
  refresh_token: z.string().optional(),
}).passthrough()

export type User = z.infer<typeof UserSchema>
export type GamificationProfile = z.infer<typeof GamificationProfileSchema>
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>
export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
