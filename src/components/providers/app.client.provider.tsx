'use client'

/**
 * @file AppClientProvider.tsx
 * @description Component giao diện React AppClientProvider cho học viên
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import '@/i18n'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/contexts/app.context'
import { useAuthStore } from '@/store/auth-store'
import { API_CONFIG } from '@/config/api.config'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

import { PersistentLayout } from '@/components/layout/persistent.layout'
import { ToastContainer } from '@/components/common/toast.container'

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

interface AppClientProviderProps {
  children: ReactNode
}

export function AppClientProvider({ children }: AppClientProviderProps) {
  const checkAuth = useAuthStore((s) => s.checkAuth)
  const setUser = useAuthStore((s) => s.setUser)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [kickoutMessage, setKickoutMessage] = useState<string | null>(null)
  const lastVerifiedAt = useRef<number>(0)

  const triggerKickout = (message?: string) => {
    if (typeof window === 'undefined') return
    if (Date.now() - lastVerifiedAt.current < 8000) {
      // Just verified in another tab on the same browser, keep session in sync seamlessly
      checkAuth()
      return
    }
    setUser(null)
    setKickoutMessage(
      message ||
        'Tài khoản của bạn vừa được đăng nhập trên một thiết bị khác. Bạn đã bị đăng xuất để đảm bảo an toàn.'
    )
  }

  useEffect(() => {
    checkAuth()

    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel('lingo_auth_channel')
      channel.onmessage = (event) => {
        if (event.data?.type === 'EMAIL_VERIFIED_SUCCESS') {
          lastVerifiedAt.current = Date.now()
          setKickoutMessage(null)
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
      if (typeof window !== 'undefined') {
        const path = window.location.pathname
        const isProtected =
          path.startsWith('/profile') ||
          path.startsWith('/settings') ||
          path.startsWith('/cart') ||
          path.startsWith('/ai-learning') ||
          path.startsWith('/notes') ||
          path.startsWith('/journal') ||
          path.startsWith('/progress')
        if (isProtected) {
          window.location.href = '/'
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener(
      'lingosphere:session_terminated',
      handleSessionTerminated
    )
    window.addEventListener('lingosphere:unauthorized', handleUnauthorized)

    return () => {
      channel?.close()
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener(
        'lingosphere:session_terminated',
        handleSessionTerminated
      )
      window.removeEventListener('lingosphere:unauthorized', handleUnauthorized)
    }
  }, [checkAuth, setUser])

  useEffect(() => {
    if (!isAuthenticated) return

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
        : null
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
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppProvider>
        <TooltipProvider>
          <PersistentLayout>{children}</PersistentLayout>
          <ToastContainer />

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
                  if (typeof window !== 'undefined') {
                    window.location.href = '/'
                  }
                }}
              >
                Đã hiểu & Đăng nhập lại
              </Button>
            }
          >
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <p className="text-sm text-text-secondary">{kickoutMessage}</p>
            </div>
          </Modal>
        </TooltipProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  )
}
