'use client'

/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (portal)/progress
 */

import { Layout } from '@/components/layout/Layout'
import { ComingSoon } from '@/components/common/ComingSoon'

export default function ProgressAppPage() {
  return (
    <Layout>
      <ComingSoon title="Progress & Analytics" />
    </Layout>
  )
}
