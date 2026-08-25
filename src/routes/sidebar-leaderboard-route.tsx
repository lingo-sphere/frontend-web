// Updated: 2026-08-17
// Route wrapper cho Leaderboard page

import { Layout } from '@/components/layout/Layout'
import { LeaderboardPage } from '@/components/leaderboard/LeaderboardPage'
import { useApp } from '@/contexts/AppContext'

export function SidebarLeaderboardRoute() {
  const { showAction } = useApp()

  return (
    <Layout>
      <LeaderboardPage onAction={showAction} />
    </Layout>
  )
}
