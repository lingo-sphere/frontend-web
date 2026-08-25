// Updated: 2026-08-17
// Route wrapper cho Topics page

import { Layout } from '@/components/layout/Layout'
import { TopicsPage } from '@/components/topics/TopicsPage'
import { useApp } from '@/contexts/AppContext'

export function TopicsRoute() {
  const { showAction } = useApp()

  return (
    <Layout>
      <TopicsPage onAction={showAction} />
    </Layout>
  )
}
