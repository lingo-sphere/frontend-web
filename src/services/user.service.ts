/**
 * @file user.service.ts
 * @description Service xử lý các logic nghiệp vụ chính cho dịch vụ user
 */

import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { User, GamificationProfile, LeaderboardEntry } from '@/types/api.types'

export const userService = {
  async getProfile(): Promise<User> {
    return api.get<User>(API_CONFIG.ENDPOINTS.USERS.PROFILE)
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return api.put<User>(API_CONFIG.ENDPOINTS.USERS.PROFILE, data)
  },

  async getGamificationProfile(): Promise<GamificationProfile> {
    return api.get<GamificationProfile>(API_CONFIG.ENDPOINTS.USERS.GAMIFICATION)
  },

  async getLeaderboard(period: 'weekly' | 'all-time' | 'monthly' = 'weekly'): Promise<LeaderboardEntry[]> {
    return api.get<LeaderboardEntry[]>(API_CONFIG.ENDPOINTS.USERS.LEADERBOARD, { period })
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
