import { api } from '@/services/api-client'
import { apiClient } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { User, LoginPayload, RegisterPayload, AuthResponse } from '@/types/api.types'

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, payload)
    if (typeof window !== 'undefined' && res.access_token) {
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, res.access_token)
      if (res.user) {
        localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(res.user))
      }
    }
    return res
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return api.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, payload)
  },

  async verifyEmailOtp(payload: { email: string; otp: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL_OTP, payload)
    if (typeof window !== 'undefined' && res.access_token) {
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, res.access_token)
      if (res.user) {
        localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(res.user))
      }
    }
    return res
  },

  async verifyEmailToken(payload: { email: string; token: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL_TOKEN, payload)
    if (typeof window !== 'undefined' && res.access_token) {
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, res.access_token)
      if (res.user) {
        localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(res.user))
      }
    }
    return res
  },

  async resendVerificationOtp(payload: { email: string } | string): Promise<{ message: string }> {
    const email = typeof payload === 'string' ? payload : payload.email
    return api.post<{ message: string }>(API_CONFIG.ENDPOINTS.AUTH.RESEND_VERIFICATION_OTP, { email })
  },

  async forgotPassword(payload: { email: string } | string): Promise<{ message: string }> {
    const email = typeof payload === 'string' ? payload : payload.email
    return api.post<{ message: string }>(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
  },

  async resetPassword(payload: { email: string; otp: string; new_password: string }): Promise<{ message: string }> {
    return api.post<{ message: string }>(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, payload)
  },

  async getCurrentUser(): Promise<User> {
    return api.get<User>(API_CONFIG.ENDPOINTS.AUTH.ME)
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT)
    } catch {
      // Ignore server error on logout
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER)
        window.location.href = '/'
      }
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
  },

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER)
    if (!userStr) return null
    try {
      return JSON.parse(userStr) as User
    } catch {
      return null
    }
  },
}
