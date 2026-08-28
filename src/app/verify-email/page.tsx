'use client'

import { Suspense } from 'react'
import { VerifyEmailRoute } from '@/routes/verify-email-route'

export default function VerifyEmailAppPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Đang xác thực email...</div>}>
      <VerifyEmailRoute />
    </Suspense>
  )
}
