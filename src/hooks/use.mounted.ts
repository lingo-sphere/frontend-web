/**
 * @file use.mounted.ts
 * @description Thành phần Use Mounted phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file use-mounted.ts
 * @description Custom React hook use-mounted hỗ trợ xử lý logic giao diện Web
 */

import { useState, useEffect } from 'react'

let isClientMounted = false

export function useMounted(): boolean {
  const [mounted, setMounted] = useState<boolean>(() => isClientMounted)

  useEffect(() => {
    isClientMounted = true
    setMounted(true)
  }, [])

  return mounted
}
