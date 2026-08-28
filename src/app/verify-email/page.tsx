'use client'

import { Suspense } from 'react'
import { VerifyEmailPage } from '@/components/auth/VerifyEmailPage'

export default function VerifyEmailAppPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Đang xác thực email...</div>}>
      <VerifyEmailPage />
    </Suspense>
  )
}
