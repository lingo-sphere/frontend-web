
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useDashboardStore } from '@/store/dashboard-store'

interface AppContextType {
  actionMessage: string
  showAction: (message: string) => void
}

export const AppContext = createContext<AppContextType>({
  actionMessage: '',
  showAction: () => {},
})

export function useApp() {
  return useContext(AppContext)
}

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [actionMessage, setActionMessage] = useState('')
  const theme = useDashboardStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#F1F8F7' : '#121A1A')
  }, [theme])

  const showAction = useCallback((message: string) => {
    setActionMessage(message)
    window.setTimeout(() => setActionMessage(''), 2800)
  }, [])

  return (
    <AppContext.Provider value={{ actionMessage, showAction }}>
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
