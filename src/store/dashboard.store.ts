// Store quản lý trạng thái giao diện và theme của dashboard học viên
import { useSyncExternalStore } from 'react'
import { createStore } from 'zustand/vanilla'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { LeaderboardPeriod, ThemeMode } from '@/types/dashboard'

interface DashboardStore {
  theme: ThemeMode
  activeNavItem: string
  leaderboardPeriod: LeaderboardPeriod
  selectedHeatmapDayId: string
  mobileSidebarOpen: boolean
  sidebarCollapsed: boolean
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  setActiveNavItem: (activeNavItem: string) => void
  setLeaderboardPeriod: (leaderboardPeriod: LeaderboardPeriod) => void
  setSelectedHeatmapDay: (selectedHeatmapDayId: string) => void
  setMobileSidebarOpen: (mobileSidebarOpen: boolean) => void
  toggleSidebarCollapsed: () => void
}

const getInitialTheme = (): ThemeMode => {
  const savedTheme = storage.get<ThemeMode>(STORAGE_KEYS.THEME)
  return savedTheme === 'dark' ? 'dark' : 'light'
}

export const dashboardStore = createStore<DashboardStore>()((set, get) => ({
  theme: getInitialTheme(),
  activeNavItem: 'home',
  leaderboardPeriod: 'week',
  selectedHeatmapDayId: '2026-08-14',
  mobileSidebarOpen: false,
  sidebarCollapsed: false,
  setTheme: (theme) => {
    storage.set(STORAGE_KEYS.THEME, theme)
    set({ theme })
  },
  toggleTheme: () => {
    const nextTheme: ThemeMode = get().theme === 'light' ? 'dark' : 'light'
    storage.set(STORAGE_KEYS.THEME, nextTheme)
    set({ theme: nextTheme })
  },
  setActiveNavItem: (activeNavItem) => set({ activeNavItem }),
  setLeaderboardPeriod: (leaderboardPeriod) => set({ leaderboardPeriod }),
  setSelectedHeatmapDay: (selectedHeatmapDayId) => set({ selectedHeatmapDayId }),
  setMobileSidebarOpen: (mobileSidebarOpen) => set({ mobileSidebarOpen }),
  toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}))

export function useDashboardStore<T>(selector: (state: DashboardStore) => T): T {
  return useSyncExternalStore(
    dashboardStore.subscribe,
    () => selector(dashboardStore.getState()),
    () => selector(dashboardStore.getInitialState()),
  )
}
