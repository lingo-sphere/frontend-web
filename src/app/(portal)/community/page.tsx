'use client'

/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (portal)/community
 */

import { Layout } from '@/components/layout/Layout'
import { ComingSoon } from '@/components/common/ComingSoon'

export default function CommunityAppPage() {
  return (
    <Layout>
      <ComingSoon title="Community Discussions & Groups" />
    </Layout>
  )
}
