'use client'

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
