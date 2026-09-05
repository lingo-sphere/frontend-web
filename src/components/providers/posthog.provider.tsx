/**
 * @file posthog.provider.tsx
 * @description Thành phần Posthog Provider phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file PostHogProvider.tsx
 * @description Component giao diện React PostHogProvider cho học viên
 */

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { initPostHog, identifyUser, resetUser, trackPageView } from '@/lib/posthog'

function PostHogPageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && typeof window !== 'undefined') {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = `${url}?${searchParams.toString()}`
      }
      trackPageView(url)
    }
  }, [pathname, searchParams])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    initPostHog()
  }, [])

  useEffect(() => {
    if (user) {
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
