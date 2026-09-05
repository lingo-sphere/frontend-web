/**
 * @file navigation.ts
 * @description Thành phần Navigation phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file navigation.ts
 * @description Mã nguồn thành phần navigation.ts
 */

import { useCallback } from 'react'
import {
  useRouter as useNextRouter,
  useParams as useNextParams,
  useSearchParams as useNextSearchParams,
  usePathname as useNextPathname,
} from 'next/navigation'

export function useNavigate() {
  const router = useNextRouter()
  return useCallback(
    (to: string | number, options?: { replace?: boolean }) => {
      if (typeof to === 'number') {
        if (to === -1) window.history.back()
        else if (to === 1) window.history.forward()
        return
      }
      if (options?.replace) {
        router.replace(to)
      } else {
        router.push(to)
      }
    },
    [router]
  )
}

export function useParams<
  T extends Record<string, string | string[] | undefined> = Record<string, string>,
>() {
  return (useNextParams() || {}) as T
}

export function useSearchParams() {
  return useNextSearchParams()
}

export function useLocation() {
  const pathname = useNextPathname()
  const searchParams = useNextSearchParams()
  return {
    pathname: pathname || '/',
    search: searchParams?.toString() ? `?${searchParams.toString()}` : '',
  }
}
