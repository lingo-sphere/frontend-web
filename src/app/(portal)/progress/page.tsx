/**
 * @file page.tsx
 * @description Thành phần Page phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (portal)/progress
 */

import { ComingSoon } from '@/components/common/coming.soon'

export default function ProgressAppPage() {
  return (
    <>
      <ComingSoon title="Progress & Analytics" />
    </>
  )
}
