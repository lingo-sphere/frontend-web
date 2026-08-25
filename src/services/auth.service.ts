import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { User, LoginPayload, RegisterPayload, AuthResponse } from '@/types/api.types'

export const authService = {

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, payload)
    if (res.access_token) {
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, res.access_token)
      if (res.refresh_token) {
        localStorage.setItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, res.refresh_token)
      }
      if (res.user) {
        localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(res.user))
      }
    }
    return res
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return api.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, payload)
  },

  async getCurrentUser(): Promise<User> {
    return api.get<User>(API_CONFIG.ENDPOINTS.AUTH.ME)
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN)
      await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, { refresh_token: refreshToken })
    } catch {
      // Bỏ qua lỗi server khi logout
    } finally {
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER)
      window.location.href = '/'
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER)
    if (!userStr) return null
    try {
      return JSON.parse(userStr) as User
    } catch {
      return null
    }
  },
}
