// Custom hook xác định trạng thái đã mount trên client của component
'use client'

import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}
