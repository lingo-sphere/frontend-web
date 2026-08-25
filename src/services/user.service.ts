import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { User, GamificationProfile, LeaderboardEntry } from '@/types/api.types'

export const userService = {
  // Lấy Profile người dùng
  async getProfile(): Promise<User> {
    return api.get<User>(API_CONFIG.ENDPOINTS.USERS.PROFILE)
  },

  // Cập nhật Profile
  async updateProfile(data: Partial<User>): Promise<User> {
    return api.patch<User>(API_CONFIG.ENDPOINTS.USERS.PROFILE, data)
  },

  // Lấy dữ liệu Gamification (XP, Streak, Rank, Level)
  async getGamificationProfile(): Promise<GamificationProfile> {
    return api.get<GamificationProfile>(API_CONFIG.ENDPOINTS.USERS.GAMIFICATION)
  },

  // Lấy Bảng xếp hạng tuần
  async getLeaderboard(period: 'weekly' | 'all-time' = 'weekly'): Promise<LeaderboardEntry[]> {
    return api.get<LeaderboardEntry[]>(API_CONFIG.ENDPOINTS.USERS.LEADERBOARD, { period })
  },
}
