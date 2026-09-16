// Trang bảng xếp hạng thi đua tuần của cộng đồng học viên.
'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLeaderboardQuery } from '@/features/leaderboard/hooks/use.leaderboard.query'
import type { LeaderboardEntry } from '@/features/user/services/user.service'
import type {
  LeaderboardType,
  MonthlyLeaderboardUser,
  MonthlyReward,
} from '@/features/dashboard/types/dashboard'
import { LeaderboardCountdown } from '@/features/leaderboard/components/leaderboard.countdown'
import { LeaderboardTabs } from '@/features/leaderboard/components/leaderboard.tabs'
import { LeaderboardPodium } from '@/features/leaderboard/components/leaderboard.podium'
import { LeaderboardList } from '@/features/leaderboard/components/leaderboard.list'
import { LeaderboardRewards } from '@/features/leaderboard/components/leaderboard.rewards'

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

  const defaultRewards: MonthlyReward[] = [
    { rank: 1, diamonds: 500, specialBadge: 'Quán quân' },
    { rank: 2, diamonds: 300, specialBadge: 'Á quân' },
    { rank: 3, diamonds: 150, specialBadge: 'Top 3' },
  ]

  const { data: rawEntries = [], isLoading } = useLeaderboardQuery('weekly')

  const users: MonthlyLeaderboardUser[] = useMemo(() => {
    if (!Array.isArray(rawEntries)) return []
    return rawEntries.map((entry: LeaderboardEntry, idx: number) => ({
      rank: idx + 1,
      name: entry.full_name || `Học viên #${idx + 1}`,
      avatarColor: avatarColors[idx % avatarColors.length],
      streakDays: entry.current_streak ?? entry.streak_days ?? 1,
      totalMinutes: 60 + idx * 10,
      questionsAnswered: 20 + idx * 5,
      wordsLearned: 15 + idx * 3,
      diamonds: 50,
      freezes: 1,
      isCurrentUser: Boolean(entry.is_current_user ?? (idx === 0)),
    }))
  }, [rawEntries])

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
