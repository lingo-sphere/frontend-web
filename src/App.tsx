
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/contexts/AppContext'
import { useAuthStore } from '@/store/auth-store'

export function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth)
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    checkAuth()

    // 🌐 Cross-Tab Sync: Tự động đóng modal OTP và đồng bộ phiên đăng nhập khi xác thực qua Email ở tab khác
    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel('lingo_auth_channel')
      channel.onmessage = (event) => {
        if (event.data?.type === 'EMAIL_VERIFIED_SUCCESS') {
          if (event.data?.user) {
            setUser(event.data.user)
          } else {
            checkAuth()
          }
        }
      }
    } catch {
      // BroadcastChannel fallback
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' || e.key === 'user') {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      channel?.close()
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [checkAuth, setUser])

  return (
    <AppProvider>
      <TooltipProvider>
        <Outlet />
      </TooltipProvider>
    </AppProvider>
  )
}
