// Component cung cấp context tổng thể, xác thực và cấu hình giao diện cho toàn bộ web app
'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useTranslation } from 'react-i18next'
import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import enUS from 'antd/locale/en_US'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import 'dayjs/locale/en'
import { initClientLanguage } from '@/i18n/i18n.config'
import { TooltipProvider } from '@/components/tooltip'
import { AppProvider } from '@/contexts/app.context'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { authService } from '@/features/auth/services/auth.service'
import { API_CONFIG } from '@/config/api.config'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { Modal } from '@/components/modal'
import { Button } from '@/components/button'
import { PersistentLayout } from '@/layouts/persistent.layout'
import { ToastContainer } from '@/components/toast.container'

const GOOGLE_CLIENT_ID = API_CONFIG.GOOGLE_CLIENT_ID ?? ''

interface AppClientProviderProps {
  children: ReactNode
}

export function AppClientProvider({ children }: AppClientProviderProps) {
  const { i18n, t } = useTranslation()
  const currentLanguage = ((i18n.language || 'vi').toLowerCase().startsWith('en') ? 'en' : 'vi') as 'vi' | 'en'
  const user = useAuthStore((s) => s.user)
  const checkAuth = useAuthStore((s) => s.checkAuth)
  const setUser = useAuthStore((s) => s.setUser)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [kickoutMessage, setKickoutMessage] = useState<string | null>(null)
  const lastVerifiedAt = useRef<number>(0)
  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    if (isAdmin) {
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN)
      storage.remove(STORAGE_KEYS.USER)
      storage.session.remove(STORAGE_KEYS.ACCESS_TOKEN)
      storage.session.remove(STORAGE_KEYS.USER)
      storage.cookie.remove(STORAGE_KEYS.IS_PRIVILEGED)
      setUser(null)
      const adminUrl = API_CONFIG.ADMIN_WEB_URL
      if (adminUrl && typeof window !== 'undefined') {
        window.location.replace(adminUrl)
      }
    }
  }, [isAdmin, setUser])

  useEffect(() => {
    initClientLanguage()
  }, [])

  useEffect(() => {
    dayjs.locale(currentLanguage)
  }, [currentLanguage])

  const triggerKickout = (message?: string) => {
    if (typeof window === 'undefined') return
    if (Date.now() - lastVerifiedAt.current < 8000) {
      checkAuth()
      return
    }
    authService.clearAuthStorage()
    setUser(null)
    setKickoutMessage(
      message || t('common.sessionTerminatedDesc')
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
      authService.clearAuthStorage()
      setUser(null)
      if (typeof window !== 'undefined') {
        const path = window.location.pathname
        const isProtected =
          path.startsWith('/home') ||
          path.startsWith('/profile') ||
          path.startsWith('/settings') ||
          path.startsWith('/cart') ||
          path.startsWith('/ai-learning') ||
          path.startsWith('/notes') ||
          path.startsWith('/progress') ||
          path.startsWith('/exam-history') ||
          path.startsWith('/toeic/exam') ||
          path.includes('/exam') ||
          path.startsWith('/practice/mistakes') ||
          path.startsWith('/speaking') ||
          path.startsWith('/writing')
        if (isProtected) {
          window.location.href = '/login'
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

    const token = storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN) || storage.session.get<string>(STORAGE_KEYS.ACCESS_TOKEN)
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

        }
      }
    } catch {

    }

    return () => {
      eventSource?.close()
    }
  }, [isAuthenticated, setUser])

  if (isAdmin) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-text-primary">
        <p className="text-sm font-medium">Tài khoản Quản trị viên (ADMIN) không được phép truy cập Client Web. Đang chuyển hướng sang Admin Web...</p>
      </div>
    )
  }

  return (
    <ConfigProvider
      locale={currentLanguage === 'vi' ? viVN : enUS}
      theme={{
        token: {
          colorPrimary: '#10b981',
          borderRadius: 12,
        },
      }}
    >
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AppProvider>
          <TooltipProvider>
            <PersistentLayout>{children}</PersistentLayout>
            <ToastContainer />

            <Modal
              open={Boolean(kickoutMessage)}
              onClose={() => {
                authService.clearAuthStorage()
                setKickoutMessage(null)
                if (typeof window !== 'undefined') {
                  window.location.href = '/login'
                }
              }}
              title={t('common.sessionTerminatedTitle')}
              size="sm"
              footer={
                <Button
                  className="w-full bg-primary font-semibold text-white shadow-md hover:bg-primary/90 cursor-pointer"
                  onClick={() => {
                    authService.clearAuthStorage()
                    setKickoutMessage(null)
                    if (typeof window !== 'undefined') {
                      window.location.href = '/login'
                    }
                  }}
                >
                  {t('common.understandAndReLogin')}
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
    </ConfigProvider>
  )
}
