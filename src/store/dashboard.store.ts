/**
 * @file dashboard.store.ts
 * @description Mã nguồn thành phần dashboard-store.ts
 */

import { useSyncExternalStore } from 'react'
import { createStore } from 'zustand/vanilla'

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
  if (typeof window === 'undefined') return 'light'
  const savedTheme = window.localStorage.getItem('lingosphere-theme')
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
    if (typeof window !== 'undefined') window.localStorage.setItem('lingosphere-theme', theme)
    set({ theme })
  },
  toggleTheme: () => {
    const nextTheme: ThemeMode = get().theme === 'light' ? 'dark' : 'light'
    if (typeof window !== 'undefined') window.localStorage.setItem('lingosphere-theme', nextTheme)
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
