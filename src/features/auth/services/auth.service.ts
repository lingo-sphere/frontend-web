// Service xử lý các logic nghiệp vụ xác thực và lưu trữ phiên đăng nhập học viên
import { api, apiClient } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { LoginPayload, RegisterPayload, SocialLoginPayload } from '@/types/api.types'
import {
  AuthResponseSchema,
  UserSchema,
  type AuthResponse,
  type User,
} from '@/features/user/schemas/user.schema'

export type { AuthResponse, User }

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, payload, AuthResponseSchema)
    if (res.access_token) {
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, res.access_token)
      if (res.user) {
        storage.set(STORAGE_KEYS.USER, res.user)
      }
    }
    return res
  },

  async socialLogin(payload: SocialLoginPayload): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.SOCIAL_LOGIN, payload, AuthResponseSchema)
    if (res.access_token) {
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, res.access_token)
      if (res.user) {
        storage.set(STORAGE_KEYS.USER, res.user)
      }
    }
    return res
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return api.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, payload, AuthResponseSchema)
  },

  async verifyEmailOtp(payload: { email: string; otp: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL_OTP, payload, AuthResponseSchema)
    if (res.access_token) {
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, res.access_token)
      if (res.user) {
        storage.set(STORAGE_KEYS.USER, res.user)
      }
    }
    return res
  },

  async verifyEmailToken(payload: { email: string; token: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL_TOKEN, payload, AuthResponseSchema)
    if (res.access_token) {
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, res.access_token)
      if (res.user) {
        storage.set(STORAGE_KEYS.USER, res.user)
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

  async changePassword(userId: string, payload: { old_password: string; new_password: string }): Promise<{ message: string }> {
    return api.post<{ message: string }>(`/auth/change-password/${userId}`, payload)
  },

  async getCurrentUser(): Promise<User> {
    return api.get<User>(API_CONFIG.ENDPOINTS.AUTH.ME, undefined, UserSchema)
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT)
    } catch {
    } finally {
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN)
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN)
      storage.remove(STORAGE_KEYS.USER)
      storage.remove(STORAGE_KEYS.PLACEMENT_SCORE)
      storage.remove(STORAGE_KEYS.PROFILE_STATS)
      storage.remove(STORAGE_KEYS.USER_NOTES)
      storage.remove(STORAGE_KEYS.WISHLIST)
      storage.remove(STORAGE_KEYS.PENDING_ORDER)
      storage.cookie.remove(STORAGE_KEYS.ACCESS_TOKEN)
      storage.cookie.remove(STORAGE_KEYS.REFRESH_TOKEN)
      storage.cookie.remove(STORAGE_KEYS.USER)
    }
  },

  isAuthenticated(): boolean {
    return !!storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN)
  },

  getStoredUser(): User | null {
    return storage.get<User>(STORAGE_KEYS.USER)
  },
}
