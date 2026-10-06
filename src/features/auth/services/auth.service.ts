// Service xử lý các logic nghiệp vụ xác thực và lưu trữ phiên đăng nhập học viên
import { api, apiClient } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { LoginPayload, RegisterPayload, SocialLoginPayload } from '@/types/api.types'
import {
  AuthResponseSchema,
  RegisterResponseSchema,
  UserSchema,
  type AuthResponse,
  type RegisterResponse,
  type User,
} from '@/features/user/schemas/user.schema'

export type { AuthResponse, RegisterResponse, User }

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, payload, AuthResponseSchema)
    const isRemember = payload.rememberMe !== false && payload.remember_me !== false
    const primaryStorage = isRemember ? storage : storage.session
    const secondaryStorage = isRemember ? storage.session : storage

    if (res.access_token) {
      secondaryStorage.remove(STORAGE_KEYS.ACCESS_TOKEN)
      secondaryStorage.remove(STORAGE_KEYS.REFRESH_TOKEN)
      secondaryStorage.remove(STORAGE_KEYS.USER)

      primaryStorage.set(STORAGE_KEYS.ACCESS_TOKEN, res.access_token)
      if (isRemember) {
        storage.cookie.set(STORAGE_KEYS.ACCESS_TOKEN, res.access_token, { days: 1 })
      } else {
        storage.cookie.set(STORAGE_KEYS.ACCESS_TOKEN, res.access_token)
      }
      if (res.refresh_token) {
        if (isRemember) {
          storage.cookie.set(STORAGE_KEYS.REFRESH_TOKEN, res.refresh_token, { days: 7 })
        } else {
          storage.cookie.set(STORAGE_KEYS.REFRESH_TOKEN, res.refresh_token)
        }
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN)
        storage.session.remove(STORAGE_KEYS.REFRESH_TOKEN)
      }
      if (res.user) {
        primaryStorage.set(STORAGE_KEYS.USER, res.user)
      }
    }
    return res
  },

  async socialLogin(payload: SocialLoginPayload): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.SOCIAL_LOGIN, payload, AuthResponseSchema)
    const isRemember = payload.rememberMe !== false && payload.remember_me !== false
    const primaryStorage = isRemember ? storage : storage.session
    const secondaryStorage = isRemember ? storage.session : storage

    if (res.access_token) {
      secondaryStorage.remove(STORAGE_KEYS.ACCESS_TOKEN)
      secondaryStorage.remove(STORAGE_KEYS.REFRESH_TOKEN)
      secondaryStorage.remove(STORAGE_KEYS.USER)

      primaryStorage.set(STORAGE_KEYS.ACCESS_TOKEN, res.access_token)
      if (isRemember) {
        storage.cookie.set(STORAGE_KEYS.ACCESS_TOKEN, res.access_token, { days: 1 })
      } else {
        storage.cookie.set(STORAGE_KEYS.ACCESS_TOKEN, res.access_token)
      }
      if (res.refresh_token) {
        if (isRemember) {
          storage.cookie.set(STORAGE_KEYS.REFRESH_TOKEN, res.refresh_token, { days: 7 })
        } else {
          storage.cookie.set(STORAGE_KEYS.REFRESH_TOKEN, res.refresh_token)
        }
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN)
        storage.session.remove(STORAGE_KEYS.REFRESH_TOKEN)
      }
      if (res.user) {
        primaryStorage.set(STORAGE_KEYS.USER, res.user)
      }
    }
    return res
  },

  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const res = await api.post<RegisterResponse>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, payload, RegisterResponseSchema)
    if (res.access_token) {
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, res.access_token)
      storage.cookie.set(STORAGE_KEYS.ACCESS_TOKEN, res.access_token, { days: 1 })
      if (res.refresh_token) {
        storage.cookie.set(STORAGE_KEYS.REFRESH_TOKEN, res.refresh_token, { days: 7 })
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN)
      }
      if (res.user) {
        storage.set(STORAGE_KEYS.USER, res.user)
      }
    }
    return res
  },

  async verifyEmailOtp(payload: { email: string; otp: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL_OTP, payload, AuthResponseSchema)
    if (res.access_token) {
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, res.access_token)
      storage.cookie.set(STORAGE_KEYS.ACCESS_TOKEN, res.access_token, { days: 1 })
      if (res.refresh_token) {
        storage.cookie.set(STORAGE_KEYS.REFRESH_TOKEN, res.refresh_token, { days: 7 })
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN)
      }
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
      storage.cookie.set(STORAGE_KEYS.ACCESS_TOKEN, res.access_token, { days: 1 })
      if (res.refresh_token) {
        storage.cookie.set(STORAGE_KEYS.REFRESH_TOKEN, res.refresh_token, { days: 7 })
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN)
      }
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

  clearAuthStorage(): void {
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN)
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN)
    storage.remove(STORAGE_KEYS.USER)
    storage.remove(STORAGE_KEYS.PLACEMENT_SCORE)
    storage.remove(STORAGE_KEYS.PROFILE_STATS)
    storage.remove(STORAGE_KEYS.USER_NOTES)
    storage.remove(STORAGE_KEYS.WISHLIST)
    storage.remove(STORAGE_KEYS.PENDING_ORDER)
    storage.remove(STORAGE_KEYS.IS_PRIVILEGED)
    storage.session.remove(STORAGE_KEYS.ACCESS_TOKEN)
    storage.session.remove(STORAGE_KEYS.REFRESH_TOKEN)
    storage.session.remove(STORAGE_KEYS.USER)
    storage.session.remove(STORAGE_KEYS.PLACEMENT_SCORE)
    storage.session.remove(STORAGE_KEYS.PROFILE_STATS)
    storage.session.remove(STORAGE_KEYS.USER_NOTES)
    storage.session.remove(STORAGE_KEYS.WISHLIST)
    storage.session.remove(STORAGE_KEYS.PENDING_ORDER)
    storage.session.remove(STORAGE_KEYS.IS_PRIVILEGED)
    storage.cookie.remove(STORAGE_KEYS.ACCESS_TOKEN)
    storage.cookie.remove(STORAGE_KEYS.REFRESH_TOKEN)
    storage.cookie.remove(STORAGE_KEYS.USER)
    storage.cookie.remove(STORAGE_KEYS.IS_PRIVILEGED)
    storage.cookie.remove('refresh_token')
    storage.cookie.remove('access_token')
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = storage.cookie.get(STORAGE_KEYS.REFRESH_TOKEN)
      await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.LOGOUT,
        {},
        {
          headers: refreshToken ? { 'x-refresh-token': refreshToken } : undefined,
        },
      )
    } catch {
    } finally {
      this.clearAuthStorage()
    }
  },

  isAuthenticated(): boolean {
    return !!storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN) || !!storage.session.get<string>(STORAGE_KEYS.ACCESS_TOKEN)
  },

  getRefreshToken(): string | null {
    return storage.cookie.get(STORAGE_KEYS.REFRESH_TOKEN)
  },

  getStoredUser(): User | null {
    return storage.get<User>(STORAGE_KEYS.USER) || storage.session.get<User>(STORAGE_KEYS.USER)
  },
}

