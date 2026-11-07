// Component giao diện React PostHogProvider và theo dõi lượt xem trang cho học viên
'use client'

import { memo, useEffect, useRef, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { initPostHog, identifyUser, resetUser, trackPageView } from '@/lib/posthog'

const PostHogPageViewTracker = memo(function PostHogPageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedUrlRef = useRef<string | null>(null)

  const queryString = searchParams?.toString() ?? ''

  useEffect(() => {
    if (!pathname || typeof window === 'undefined') return
    const url = queryString ? `${window.origin}${pathname}?${queryString}` : `${window.origin}${pathname}`
    if (lastTrackedUrlRef.current === url) return
    lastTrackedUrlRef.current = url
    trackPageView(url)
  }, [pathname, queryString])

  return null
})

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    initPostHog()
  }, [])

  useEffect(() => {
    if (user?.user_id) {
      identifyUser(user)
    } else {
      resetUser()
    }
  }, [user])

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageViewTracker />
      </Suspense>
      {children}
    </>
  )
}
