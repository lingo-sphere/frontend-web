import { create } from 'zustand'
import { authService } from '@/services/auth.service'
import type { User, LoginPayload, RegisterPayload } from '@/types/api.types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: authService.getStoredUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  clearError: () => set({ error: null }),

  login: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const res = await authService.login(payload)
      set({
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập không thành công'
      set({ error: msg, isLoading: false })
      throw err
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const res = await authService.register(payload)
      set({
        user: res.user,
        isAuthenticated: !!res.access_token,
        isLoading: false,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng ký không thành công'
      set({ error: msg, isLoading: false })
      throw err
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await authService.logout()
    } finally {
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
      set({ user, isAuthenticated: true })
    } catch {
      set({ user: null, isAuthenticated: false })
    }
  },
}))
