// Updated: 2026-08-17
// Dashboard page chính, render các sections:
// 1. WelcomeBanner - header greeting
// 2. StreakHistory - heatmap 90 ngày gần nhất
// 3. Grid 2 columns:
//    - Left: ContinueLearning, TodaysLearning, LearningRoadmap
//    - Right: InsightRail (AI recommendation, Vocabulary, Rewards)
// 4. Grid 3 columns: StreakRewards, StreakLeaderboard, ExploreTopics
// Layout dùng items-stretch + h-full để columns cao bằng nhau

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

interface DashboardPageProps {
  onAction: (message: string) => void
}

export function DashboardPage({ onAction }: DashboardPageProps) {
  return (
    <main aria-labelledby="dashboard-title" className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <WelcomeBanner />
      <section className="mt-6">
        <StreakHistory days={mockDashboardData.heatmap} summary={mockDashboardData.heatmapSummary} />
      </section>
      <div className="mt-6 grid items-stretch gap-6 xl:grid-cols-[minmax(0,1.72fr)_minmax(320px,.92fr)]">
        <div className="flex h-full flex-col gap-6">
          <ContinueLearningCard onAction={onAction} />
          <TodaysLearningCard onAction={onAction} tasks={mockDashboardData.tasks} />
          <LearningRoadmap onAction={onAction} units={mockDashboardData.roadmap} />
        </div>
        <InsightRail onAction={onAction} />
      </div>
      <section className="mt-6 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StreakRewards milestones={mockDashboardData.milestones} onAction={onAction} />
        <StreakLeaderboard leaderboard={mockDashboardData.leaderboard} onAction={onAction} />
        <ExploreTopics onAction={onAction} topics={mockDashboardData.topics} />
      </section>
    </main>
  )
}
