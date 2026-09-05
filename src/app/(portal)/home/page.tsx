/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (portal)/home
 */

'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/contexts/app.context'
import { ContinueLearningCard } from '@/components/dashboard/continue.learning.card'
import { ExploreTopics } from '@/components/dashboard/explore.topics'
import { InsightRail } from '@/components/dashboard/insight.rail'
import { LearningRoadmap } from '@/components/dashboard/learning.roadmap'
import { StreakHistory } from '@/components/dashboard/streak.history'
import { StreakLeaderboard } from '@/components/dashboard/streak.leaderboard'
import { StreakRewards } from '@/components/dashboard/streak.rewards'
import { TodaysLearningCard } from '@/components/dashboard/todays.learning.card'
import { WelcomeBanner } from '@/components/dashboard/welcome.banner'
import { userService } from '@/services/user.service'
import { vocabularyService } from '@/services/vocabulary.service'
import type {
  HeatmapDay,
  HeatmapSummary,
  LeaderboardData,
  Topic,
  LearningTask,
  RoadmapUnit,
  StreakMilestone,
} from '@/types/dashboard'

export default function HomeAppPage() {
  const { showAction } = useApp()
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>({
    week: [
      { rank: 1, name: 'Nguyễn Văn A', streakDays: 15 },
      { rank: 2, name: 'Trần Thị B', streakDays: 12 },
      { rank: 3, name: 'Lê Hoàng C', streakDays: 10 },
    ],
    month: [
      { rank: 1, name: 'Nguyễn Văn A', streakDays: 30 },
      { rank: 2, name: 'Trần Thị B', streakDays: 28 },
      { rank: 3, name: 'Lê Hoàng C', streakDays: 25 },
    ],
    year: [
      { rank: 1, name: 'Nguyễn Văn A', streakDays: 120 },
      { rank: 2, name: 'Trần Thị B', streakDays: 95 },
      { rank: 3, name: 'Lê Hoàng C', streakDays: 80 },
    ],
  })
  const [topics, setTopics] = useState<Topic[]>([])

  useEffect(() => {
    let isMounted = true
    const loadHomeData = async () => {
      try {
        const [lbData, topData] = await Promise.all([
          userService.getLeaderboard('weekly').catch(() => []),
          vocabularyService.getTopics().catch(() => []),
        ])

        if (isMounted) {
          if (Array.isArray(lbData) && lbData.length > 0) {
            const mappedEntries = lbData.map((u: any, idx: number) => ({
              rank: idx + 1,
              name: u.full_name || `Học viên #${idx + 1}`,
              streakDays: u.current_streak ?? u.streak_days ?? 1,
            }))
            setLeaderboard({
              week: mappedEntries,
              month: mappedEntries,
              year: mappedEntries,
            })
          }

          if (Array.isArray(topData) && topData.length > 0) {
            const mappedTopics: Topic[] = topData.map((t: any) => ({
              id: t._id || `topic-${t.code || ''}`,
              label: t.name_vi || t.name_en || 'Chủ đề',
              emoji: '📚',
              words: t.lexical_count || 0,
            }))
            setTopics(mappedTopics)
          }
        }
      } catch (err) {
        console.error('Error fetching home dashboard data:', err)
      }
    }
    loadHomeData()
    return () => {
      isMounted = false
    }
  }, [])

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
