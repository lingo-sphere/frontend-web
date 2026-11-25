// Tuyến điều hướng trang bảng xếp hạng tự động chuyển về trang chủ học tập.
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LeaderboardAppPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/home')
  }, [router])

  return null
}
