// Trang chuyển hướng tính năng Gia sư AI sang widget nổi toàn cục.
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AiLearningRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/home')
  }, [router])

  return null
}
