'use client'

/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (portal)/leaderboard
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { userService } from '@/services/user.service'
import type {
  LeaderboardType,
  MonthlyLeaderboardUser,
  MonthlyReward,
} from '@/types/dashboard'
import { LeaderboardCountdown } from '@/components/leaderboard/LeaderboardCountdown'
import { LeaderboardTabs } from '@/components/leaderboard/LeaderboardTabs'
import { LeaderboardPodium } from '@/components/leaderboard/LeaderboardPodium'
import { LeaderboardList } from '@/components/leaderboard/LeaderboardList'
import { LeaderboardRewards } from '@/components/leaderboard/LeaderboardRewards'

const avatarColors = [
  'bg-primary-soft text-primary',
  'bg-success-soft text-success',
  'bg-warning-soft text-warning',
  'bg-info-soft text-info',
  'bg-surface-subtle text-text-primary',
]

export default function LeaderboardAppPage() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('streak')
  const [users, setUsers] = useState<MonthlyLeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const defaultRewards: MonthlyReward[] = [
    { rank: 1, diamonds: 500, specialBadge: 'Quán quân' },
    { rank: 2, diamonds: 300, specialBadge: 'Á quân' },
    { rank: 3, diamonds: 150, specialBadge: 'Top 3' },
  ]

  useEffect(() => {
    let isMounted = true
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true)
        const data = await userService.getLeaderboard('weekly')
        if (isMounted && Array.isArray(data)) {
          const mapped: MonthlyLeaderboardUser[] = data.map((entry: any, idx: number) => ({
            rank: idx + 1,
            name: entry.full_name || entry.username || entry.user_name || `Học viên #${idx + 1}`,
            avatarColor: avatarColors[idx % avatarColors.length],
            streakDays: entry.streak_days || entry.streakDays || 1,
            totalMinutes: entry.total_minutes || entry.totalMinutes || 60 + idx * 10,
            questionsAnswered: entry.questions_answered || 20 + idx * 5,
            wordsLearned: entry.words_learned || 15 + idx * 3,
            diamonds: entry.diamonds || 50,
            freezes: entry.freezes || 1,
            isCurrentUser: idx === 0,
          }))
          setUsers(mapped)
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchLeaderboard()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>
      <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-text-primary">
              {isVietnamese ? 'Bảng xếp hạng tuần' : 'Weekly Leaderboard'}
            </h1>
            <p className="mt-1 text-[13px] text-text-secondary">
              {isVietnamese
                ? 'Thi đua học tập cùng các học viên LingoSphere'
                : 'Compete and rank with LingoSphere learners'}
            </p>
          </div>
          <LeaderboardCountdown daysLeft={6} isCurrentMonth={true} />
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <div className="flex-1">
            <LeaderboardTabs active={leaderboardType} onChange={setLeaderboardType} />

            {isLoading ? (
              <div className="mt-12 flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <>
                {users.length > 0 && (
                  <section className="mt-6">
                    <LeaderboardPodium users={users.slice(0, 3)} type={leaderboardType} />
                  </section>
                )}

                <section className="mt-6">
                  <LeaderboardList users={users} type={leaderboardType} />
                </section>
              </>
            )}
          </div>

          <aside className="w-full lg:w-[360px]">
            <LeaderboardRewards rewards={defaultRewards} />
          </aside>
        </div>
      </main>
    </>
  )
}
