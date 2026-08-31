'use client'

import { useApp } from '@/contexts/AppContext'
import { Layout } from '@/components/layout/Layout'
import { ContinueLearningCard } from '@/components/dashboard/ContinueLearningCard'
import { ExploreTopics } from '@/components/dashboard/ExploreTopics'
import { InsightRail } from '@/components/dashboard/InsightRail'
import { LearningRoadmap } from '@/components/dashboard/LearningRoadmap'
import { StreakHistory } from '@/components/dashboard/StreakHistory'
import { StreakLeaderboard } from '@/components/dashboard/StreakLeaderboard'
import { StreakRewards } from '@/components/dashboard/StreakRewards'
import { TodaysLearningCard } from '@/components/dashboard/TodaysLearningCard'
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner'
import { mockDashboardData } from '@/data/dashboard-data'

export default function HomeAppPage() {
  const { showAction } = useApp()

  return (
    <Layout>
      <main aria-labelledby="dashboard-title" className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <WelcomeBanner />
        <section className="mt-6">
          <StreakHistory days={mockDashboardData.heatmap} summary={mockDashboardData.heatmapSummary} />
        </section>
        <div className="mt-6 grid items-stretch gap-6 xl:grid-cols-[minmax(0,1.72fr)_minmax(320px,.92fr)]">
          <div className="flex h-full flex-col gap-6">
            <ContinueLearningCard onAction={showAction} />
            <TodaysLearningCard onAction={showAction} tasks={mockDashboardData.tasks} />
            <LearningRoadmap onAction={showAction} units={mockDashboardData.roadmap} />
          </div>
          <InsightRail onAction={showAction} />
        </div>
        <section className="mt-6 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StreakRewards milestones={mockDashboardData.milestones} onAction={showAction} />
          <StreakLeaderboard leaderboard={mockDashboardData.leaderboard} onAction={showAction} />
          <ExploreTopics onAction={showAction} topics={mockDashboardData.topics} />
        </section>
      </main>
    </Layout>
  )
}
