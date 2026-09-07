// Service xử lý các logic nghiệp vụ cho người dùng (user).

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import type { UpdateUserProfilePayload } from '@/types/api.types'
import {
  UserSchema,
  UserProfileResponseSchema,
  GamificationProfileSchema,
  LeaderboardListSchema,
  type User,
  type UserProfileResponse,
  type GamificationProfile,
  type LeaderboardEntry,
} from '@/schemas/user.schema'

export type { User, UserProfileResponse, GamificationProfile, LeaderboardEntry }

export const userService = {
  async getProfile(): Promise<UserProfileResponse> {
    return api.get<UserProfileResponse>(API_CONFIG.ENDPOINTS.USERS.PROFILE, undefined, UserProfileResponseSchema)
  },

  async updateProfile(data: UpdateUserProfilePayload): Promise<User> {
    return api.put<User>(API_CONFIG.ENDPOINTS.USERS.PROFILE, data, UserSchema)
  },

  async getGamificationProfile(): Promise<GamificationProfile> {
    return api.get<GamificationProfile>(API_CONFIG.ENDPOINTS.USERS.GAMIFICATION, undefined, GamificationProfileSchema)
  },

  async getLeaderboard(period: 'weekly' | 'all-time' | 'monthly' = 'weekly'): Promise<LeaderboardEntry[]> {
    return api.get<LeaderboardEntry[]>(API_CONFIG.ENDPOINTS.USERS.LEADERBOARD, { period }, LeaderboardListSchema)
  },

  async getMyDailyActivities(): Promise<Array<Record<string, unknown>>> {
    return api.get<Array<Record<string, unknown>>>(API_CONFIG.ENDPOINTS.USERS.DAILY_ACTIVITIES)
  },

  async getMyXpLogs(): Promise<Array<Record<string, unknown>>> {
    return api.get<Array<Record<string, unknown>>>(API_CONFIG.ENDPOINTS.USERS.XP_LOGS)
  },

  async getMySettings(): Promise<Record<string, unknown>> {
    return api.get<Record<string, unknown>>(API_CONFIG.ENDPOINTS.USERS.SETTINGS)
  },

  async updateMySettings(settings: Record<string, unknown>): Promise<Record<string, unknown>> {
    return api.put<Record<string, unknown>>(API_CONFIG.ENDPOINTS.USERS.SETTINGS, settings)
  },

  async useStreakFreeze(): Promise<{ success: boolean }> {
    return api.post<{ success: boolean }>(API_CONFIG.ENDPOINTS.USERS.STREAK_FREEZE)
  },
}
