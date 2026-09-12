// Store quản lý trạng thái xác thực và thông tin phiên học viên
import { create } from 'zustand'
import { authService } from '@/features/auth/services/auth.service'
import { userService } from '@/features/user/services/user.service'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { User, LoginPayload, RegisterPayload, SocialLoginPayload } from '@/types/api.types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  login: (payload: LoginPayload) => Promise<void>
  socialLogin: (payload: SocialLoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  verifyEmailOtp: (payload: { email: string; otp: string }) => Promise<void>
  resendVerificationOtp: (payload: { email: string }) => Promise<void>
  forgotPassword: (payload: { email: string }) => Promise<void>
  resetPassword: (payload: { email: string; otp: string; new_password: string }) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: authService.getStoredUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  setUser: (user) => {
    if (user) {
      storage.set(STORAGE_KEYS.USER, user)
    }
    set({ user, isAuthenticated: !!user })
  },

  clearError: () => set({ error: null }),

  login: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const res = await authService.login(payload)
      let isPremium = Boolean(res.user?.is_premium)
      let profileUser: Partial<User> = {}
      try {
        const profileRes = await userService.getProfile()
        if (profileRes) {
          if (profileRes.is_premium) isPremium = true
          if (profileRes.profile) profileUser = profileRes.profile
        }
      } catch {}
      const finalUser = { ...res.user, ...profileUser, is_premium: isPremium }
      storage.set(STORAGE_KEYS.USER, finalUser)
      set({
        user: finalUser,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập không thành công'
      set({ error: msg, isLoading: false })
      throw err
    }
  },

  socialLogin: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const res = await authService.socialLogin(payload)
      let isPremium = Boolean(res.user?.is_premium)
      let profileUser: Partial<User> = {}
      try {
        const profileRes = await userService.getProfile()
        if (profileRes) {
          if (profileRes.is_premium) isPremium = true
          if (profileRes.profile) profileUser = profileRes.profile
        }
      } catch {}
      const finalUser = { ...res.user, ...profileUser, is_premium: isPremium }
      storage.set(STORAGE_KEYS.USER, finalUser)
      set({
        user: finalUser,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập qua mạng xã hội không thành công'
      set({ error: msg, isLoading: false })
      throw err
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      storage.remove(STORAGE_KEYS.PLACEMENT_SCORE)
      await authService.register(payload)
      set({ isLoading: false })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng ký không thành công'
      set({ error: msg, isLoading: false })
      throw err
    }
  },

  verifyEmailOtp: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const res = await authService.verifyEmailOtp(payload)
      set({
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Mã xác thực OTP không chính xác hoặc đã hết hạn'
      set({ error: msg, isLoading: false })
      throw err
    }
  },

  resendVerificationOtp: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      await authService.resendVerificationOtp(payload)
      set({ isLoading: false })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể gửi lại mã xác thực'
      set({ error: msg, isLoading: false })
      throw err
    }
  },

  forgotPassword: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      await authService.forgotPassword(payload)
      set({ isLoading: false })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể gửi yêu cầu đặt lại mật khẩu'
      set({ error: msg, isLoading: false })
      throw err
    }
  },

  resetPassword: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      await authService.resetPassword(payload)
      set({ isLoading: false })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đặt lại mật khẩu không thành công'
      set({ error: msg, isLoading: false })
      throw err
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await authService.logout()
    } finally {
      storage.remove(STORAGE_KEYS.PLACEMENT_SCORE)
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  checkAuth: async () => {
    if (!authService.isAuthenticated()) {
      set({ user: null, isAuthenticated: false })
      return
    }

    try {
      const user = await authService.getCurrentUser()
      let isPremium = Boolean(user?.is_premium)
      let profileUser: Partial<User> = {}
      try {
        const profileRes = await userService.getProfile()
        if (profileRes) {
          if (profileRes.is_premium) isPremium = true
          if (profileRes.profile) profileUser = profileRes.profile
        }
      } catch {}
      const finalUser = { ...user, ...profileUser, is_premium: isPremium }
      storage.set(STORAGE_KEYS.USER, finalUser)
      set({ user: finalUser, isAuthenticated: true })
    } catch {
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN)
      storage.remove(STORAGE_KEYS.USER)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lingosphere:unauthorized'))
      }
      set({ user: null, isAuthenticated: false })
    }
  },
}))
