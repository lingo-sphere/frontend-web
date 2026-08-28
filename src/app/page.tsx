'use client'

import { useApp } from '@/contexts/AppContext'
import { Layout } from '@/components/layout/Layout'
import { DashboardPage } from '@/components/dashboard/DashboardPage'

export default function HomePage() {
  const { showAction } = useApp()

  return (
    <Layout>
      <DashboardPage onAction={showAction} />
    </Layout>
  )
}
