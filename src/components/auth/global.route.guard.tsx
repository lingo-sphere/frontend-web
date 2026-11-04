// Component bảo vệ và kiểm soát quyền truy cập toàn bộ các trang nội bộ của Web Client.
'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { authService } from '@/features/auth/services/auth.service'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { API_CONFIG } from '@/config/api.config'

const PUBLIC_EXACT_ROUTES = new Set([
  '/',
  '/login',
  '/verify-email',
  '/about',
  '/privacy',
  '/blog',
])

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_EXACT_ROUTES.has(pathname)) return true
  if (pathname.startsWith('/blog/')) return true
  return false
}

export function GlobalRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/'
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = authService.getAccessToken()
    if (token && !storage.cookie.get(STORAGE_KEYS.ACCESS_TOKEN)) {
      storage.cookie.set(STORAGE_KEYS.ACCESS_TOKEN, token, { days: 1 })
    }
  }, [])

  const isPublic = isPublicRoute(pathname)

  useEffect(() => {
    if (!mounted || isPublic) return

    const isAuthed = isAuthenticated || authService.isAuthenticated()
    if (!isAuthed && !isLoading) {
      const search = typeof window !== 'undefined' ? window.location.search : ''
      const returnUrl = encodeURIComponent(`${pathname}${search}`)
      if (typeof window !== 'undefined') {
        window.location.replace(`/login?returnUrl=${returnUrl}`)
      }
    }
  }, [mounted, isPublic, isAuthenticated, isLoading, pathname])

  if (isPublic) {
    return <>{children}</>
  }

  if (!mounted || isLoading || (!isAuthenticated && !authService.isAuthenticated())) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background text-text-primary">
        <div className="relative flex items-center justify-center mb-5">
          <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/10 animate-pulse">
            L
          </div>
          <div className="absolute -inset-3 rounded-3xl border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-text-primary">LingoSphere Security</p>
        <p className="text-xs text-text-secondary mt-1 animate-pulse">Đang xác thực phiên học viên...</p>
      </div>
    )
  }

  if (user?.role === 'ADMIN') {
    const adminUrl = API_CONFIG.ADMIN_WEB_URL
    if (adminUrl && typeof window !== 'undefined') {
      window.location.replace(adminUrl)
    }
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background text-text-primary p-6 text-center">
        <p className="text-sm font-semibold text-rose-500 mb-2">Tài khoản Quản trị viên (ADMIN)</p>
        <p className="text-xs text-text-secondary max-w-md">Tài khoản quản trị không sử dụng giao diện học viên. Đang chuyển hướng sang Trang Quản Trị...</p>
      </div>
    )
  }

  return <>{children}</>
}

