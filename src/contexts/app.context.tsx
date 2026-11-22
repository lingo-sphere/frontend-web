// Quản lý trạng thái giao diện toàn cục, thanh bên và hiển thị thông báo tác vụ nhanh
'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'

export type ThemeMode = 'light' | 'dark'

interface AppContextType {
  actionMessage: string
  showAction: (message: string) => void
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebarCollapsed: () => void
  mobileSidebarOpen: boolean
  setMobileSidebarOpen: (open: boolean) => void
}

const applyThemeToDOM = (theme: ThemeMode) => {
  if (typeof window === 'undefined') return
  document.documentElement.dataset.theme = theme
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  } else {
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f8fafc' : '#020617')
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light'
  const saved = storage.get<ThemeMode>(STORAGE_KEYS.THEME)
  const theme: ThemeMode = saved === 'dark' ? 'dark' : 'light'
  applyThemeToDOM(theme)
  return theme
}

export const AppContext = createContext<AppContextType>({
  actionMessage: '',
  showAction: () => {},
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  toggleSidebarCollapsed: () => {},
  mobileSidebarOpen: false,
  setMobileSidebarOpen: () => {},
})

export function useApp() {
  return useContext(AppContext)
}

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [actionMessage, setActionMessage] = useState('')
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    storage.set(STORAGE_KEYS.THEME, nextTheme)
    applyThemeToDOM(nextTheme)
    setThemeState(nextTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: ThemeMode = current === 'light' ? 'dark' : 'light'
      storage.set(STORAGE_KEYS.THEME, next)
      applyThemeToDOM(next)
      return next
    })
  }, [])

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  useEffect(() => {
    applyThemeToDOM(theme)
  }, [theme])

  const showAction = useCallback((message: string) => {
    setActionMessage(message)
    window.setTimeout(() => setActionMessage(''), 2800)
  }, [])

  const value = useMemo(
    () => ({
      actionMessage,
      showAction,
      theme,
      setTheme,
      toggleTheme,
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebarCollapsed,
      mobileSidebarOpen,
      setMobileSidebarOpen,
    }),
    [
      actionMessage,
      showAction,
      theme,
      setTheme,
      toggleTheme,
      sidebarCollapsed,
      toggleSidebarCollapsed,
      mobileSidebarOpen,
    ]
  )

  return (
    <AppContext.Provider value={value}>
      {children}
      {actionMessage && (
        <div
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-border bg-surface px-4 py-3 text-[13px] font-semibold text-text-primary shadow-[var(--shadow-popover)]"
        >
          {actionMessage}
        </div>
      )}
    </AppContext.Provider>
  )
}

