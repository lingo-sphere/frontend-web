'use client'

/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (study)/roadmap
 */

import { Layout } from '@/components/layout/Layout'
import { ComingSoon } from '@/components/common/ComingSoon'

export default function RoadmapAppPage() {
  return (
    <Layout>
      <ComingSoon title="Personalized Learning Roadmap" />
    </Layout>
  )
}
