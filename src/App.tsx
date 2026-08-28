
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/contexts/AppContext'
import { useAuthStore } from '@/store/auth-store'
import { API_CONFIG } from '@/config/api.config'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

export function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth)
  const setUser = useAuthStore((s) => s.setUser)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [kickoutMessage, setKickoutMessage] = useState<string | null>(null)

  const triggerKickout = (message?: string) => {
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER)
    setUser(null)
    setKickoutMessage(
      message || 'Tài khoản của bạn vừa được đăng nhập trên một thiết bị khác. Bạn đã bị đăng xuất để đảm bảo an toàn.',
    )
  }

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

    const handleSessionTerminated = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string }>
      triggerKickout(customEvent.detail?.message)
    }

    const handleUnauthorized = () => {
      setUser(null)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('lingosphere:session_terminated', handleSessionTerminated)
    window.addEventListener('lingosphere:unauthorized', handleUnauthorized)

    return () => {
      channel?.close()
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('lingosphere:session_terminated', handleSessionTerminated)
      window.removeEventListener('lingosphere:unauthorized', handleUnauthorized)
    }
  }, [checkAuth, setUser])

  // 🚀 Real-time Session Kickout via Server-Sent Events (SSE)
  useEffect(() => {
    if (!isAuthenticated) return

    const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
    if (!token) return

    let eventSource: EventSource | null = null
    try {
      const sseUrl = `${API_CONFIG.BASE_URL}/auth/session-stream?token=${encodeURIComponent(token)}`
      eventSource = new EventSource(sseUrl)

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'SESSION_TERMINATED') {
            triggerKickout(data.message)
          }
        } catch {
          // ignore parse error
        }
      }
    } catch {
      // EventSource fallback
    }

    return () => {
      eventSource?.close()
    }
  }, [isAuthenticated, setUser])

  return (
    <AppProvider>
      <TooltipProvider>
        <Outlet />

        {/* 🚨 Popup Cảnh Báo An Ninh Khi Bị Đăng Nhập Từ Nơi Khác */}
        <Modal
          open={Boolean(kickoutMessage)}
          onClose={() => setKickoutMessage(null)}
          title="Đăng Nhập Từ Thiết Bị Khác"
          size="sm"
          footer={
            <Button
              className="w-full bg-primary font-semibold text-white shadow-md hover:bg-primary/90"
              onClick={() => {
                setKickoutMessage(null)
                window.location.href = '/'
              }}
            >
              Đã hiểu & Đăng nhập lại
            </Button>
          }
        >
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 ring-8 ring-amber-500/5">
              <ShieldAlert className="h-8 w-8 text-amber-600" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-text-primary">Phiên Đăng Nhập Đã Hết Hạn</h4>
              <p className="text-sm leading-relaxed text-text-secondary">
                {kickoutMessage}
              </p>
            </div>
          </div>
        </Modal>
      </TooltipProvider>
    </AppProvider>
  )
}
