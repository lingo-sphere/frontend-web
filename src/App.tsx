
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/contexts/AppContext'
import { useAuthStore } from '@/store/auth-store'

export function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <AppProvider>
      <TooltipProvider>
        <Outlet />
      </TooltipProvider>
    </AppProvider>
  )
}
