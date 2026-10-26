'use client'

import { useCallback, useEffect, useState } from 'react'
import { resolveMediaUrl, resolveMediaUrlAsync } from '@/utils/media.utils'

export function useListeningMedia(value?: string) {
  const [state, setState] = useState(() => ({
    value,
    url: value && !/^[a-f\d]{24}$/i.test(value) ? resolveMediaUrl(value) : '',
    ready: !value,
  }))
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!value) return
    let cancelled = false
    void resolveMediaUrlAsync(value).then((url) => {
      if (!cancelled) setState({ value, url, ready: true })
    })
    return () => {
      cancelled = true
    }
  }, [value, attempt])
  const retry = useCallback(() => setAttempt((previous) => previous + 1), [])
  return {
    url: state.value === value ? state.url : '',
    ready: !value || (state.value === value && state.ready),
    retry,
  }
}
