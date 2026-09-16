// Trang chủ bảng điều khiển học tập cá nhân (Learner Dashboard).
'use client'

import { useMemo } from 'react'
import { useApp } from '@/contexts/app.context'
import { ContinueLearningCard } from '@/features/dashboard/components/continue.learning.card'
import { ExploreTopics } from '@/features/dashboard/components/explore.topics'
import { InsightRail } from '@/features/dashboard/components/insight.rail'
import { LearningRoadmap } from '@/features/dashboard/components/learning.roadmap'
import { StreakHistory } from '@/features/dashboard/components/streak.history'
import { StreakLeaderboard } from '@/features/dashboard/components/streak.leaderboard'
import { StreakRewards } from '@/features/dashboard/components/streak.rewards'
import { TodaysLearningCard } from '@/features/dashboard/components/todays.learning.card'
import { WelcomeBanner } from '@/features/dashboard/components/welcome.banner'
import { useLeaderboardQuery } from '@/features/leaderboard/hooks/use.leaderboard.query'
import { useTopicsQuery } from '@/features/vocabulary/hooks/use.vocabulary.query'
import type { LeaderboardEntry } from '@/features/user/services/user.service'
import type { BackendTopic } from '@/features/vocabulary/services/vocabulary.service'
import type {
  HeatmapDay,
  HeatmapSummary,
  LeaderboardData,
  Topic,
  LearningTask,
  RoadmapUnit,
  StreakMilestone,
} from '@/features/dashboard/types/dashboard'

export default function HomeAppPage() {
  const { showAction } = useApp()
  const { data: lbData = [] } = useLeaderboardQuery('weekly')
  const { data: topData = [] } = useTopicsQuery()

  const leaderboard: LeaderboardData = useMemo(() => {
    const mappedEntries = Array.isArray(lbData)
      ? lbData.map((u: LeaderboardEntry, idx: number) => ({
          rank: idx + 1,
          name: u.full_name || `Học viên #${idx + 1}`,
          streakDays: u.current_streak ?? u.streak_days ?? 1,
        }))
      : []

    return {
      week: mappedEntries,
      month: mappedEntries,
      year: mappedEntries,
    }
  }, [lbData])

  const topics: Topic[] = useMemo(() => {
    if (!Array.isArray(topData)) return []
    return topData.map((t: BackendTopic) => ({
      id: t._id || `topic-${t.code || ''}`,
      label: t.name_vi || t.name_en || 'Chủ đề',
      emoji: '📚',
      words: t.lexical_count || 0,
    }))
  }, [topData])

  const defaultHeatmap: HeatmapDay[] = Array.from({ length: 35 }, (_, i) => ({
    id: `day-${i}`,
    date: new Date(Date.now() - (34 - i) * 86400000).toISOString().split('T')[0],
    intensity: (i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 0) as 0 | 1 | 2 | 3 | 4,
    status: (i % 3 === 0 ? 'checked-in' : i % 2 === 0 ? 'checked-in' : 'inactive') as
      | 'checked-in'
      | 'freeze'
      | 'inactive',
    minutes: i % 3 === 0 ? 30 : i % 2 === 0 ? 15 : 0,
    activityLabel: i % 2 === 0 ? 'Hoàn thành bài học' : 'Chưa học',
  }))

  const heatmapSummary: HeatmapSummary = {
    studyDays: 20,
    totalMinutes: 450,
    longestStreak: 7,
  }

  const tasks: LearningTask[] = [
    {
      id: 'task-1',
      kind: 'vocabulary',
      label: 'Học 10 từ vựng Spaced Repetition',
      durationLabel: '5 phút',
      icon: 'book',
      completed: false,
    },
    {
      id: 'task-2',
      kind: 'listening',
      label: 'Luyện 1 bài nghe chép chính tả Dictation',
      durationLabel: '10 phút',
      icon: 'headphones',
      completed: false,
    },
    {
      id: 'task-3',
      kind: 'speaking',
      label: 'Luyện 1 bài nói Whisper AI',
      durationLabel: '10 phút',
      icon: 'mic',
      completed: false,
    },
  ]

  const roadmapUnits: RoadmapUnit[] = [
    {
      id: 'unit-1',
      label: 'Unit 1: Giao tiếp hàng ngày & Phát âm',
      status: 'completed',
    },
    {
      id: 'unit-2',
      label: 'Unit 2: Từ vựng văn phòng & Phỏng vấn',
      status: 'current',
    },
    {
      id: 'unit-3',
      label: 'Unit 3: Phản xạ giao tiếp nâng cao',
      status: 'locked',
    },
  ]

  const milestones: StreakMilestone[] = [
    { days: 3, reward: '+50 XP', status: 'done' },
    { days: 7, reward: '+150 XP', status: 'current' },
    { days: 14, reward: 'Huy hiệu Chiến Binh', status: 'locked' },
  ]

  return (
    <>
      <main
        aria-labelledby="dashboard-title"
        className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 space-y-6"
      >
        <WelcomeBanner />
        <section>
          <StreakHistory days={defaultHeatmap} summary={heatmapSummary} />
        </section>
        <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1.72fr)_minmax(320px,.92fr)]">
          <div className="flex h-full flex-col gap-6">
            <ContinueLearningCard onAction={showAction} />
            <TodaysLearningCard onAction={showAction} tasks={tasks} />
            <LearningRoadmap onAction={showAction} units={roadmapUnits} />
          </div>
          <InsightRail onAction={showAction} />
        </div>
        <section className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StreakRewards milestones={milestones} onAction={showAction} />
          <StreakLeaderboard leaderboard={leaderboard} onAction={showAction} />
          <ExploreTopics onAction={showAction} topics={topics} />
        </section>
      </main>
    </>
  )
}
