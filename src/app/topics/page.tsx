'use client'

import { Layout } from '@/components/layout/Layout'
import { TopicsPage } from '@/components/topics/TopicsPage'
import { useApp } from '@/contexts/AppContext'

export default function TopicsAppPage() {
  const { showAction } = useApp()

  return (
    <Layout>
      <TopicsPage onAction={showAction} />
    </Layout>
  )
}
