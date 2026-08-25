// Updated: 2026-08-17
// Route wrapper cho Learning Roadmap page

import { ComingSoon } from '@/components/common/ComingSoon'
import { Layout } from '@/components/layout/Layout'

export function RoadmapRoute() {
  return (
    <Layout>
      <ComingSoon title="Learning Roadmap" />
    </Layout>
  )
}
