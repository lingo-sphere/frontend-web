// Updated: 2026-08-17
// Route wrapper cho dashboard page, wrap với Layout

import { useApp } from '@/contexts/AppContext'
import { Layout } from '@/components/layout/Layout'
import { DashboardPage } from '@/components/dashboard/DashboardPage'

export function DashboardRoute() {
  const { showAction } = useApp()

  return (
    <Layout>
      <DashboardPage onAction={showAction} />
    </Layout>
  )
}
