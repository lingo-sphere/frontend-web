// Trang bảng xếp hạng thi đua vinh danh học viên toàn diện theo phong cách thể thao điện tử hiện đại.
'use client'

import { useState, useMemo } from 'react'
import { Trophy, Zap, Flame } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMounted } from '@/hooks/use.mounted'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useLeaderboardQuery, type LeaderboardPeriod } from '@/features/leaderboard/hooks/use.leaderboard.query'
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
  '#10b981',
  '#06b6d4',
  '#6366f1',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
]

export default function LeaderboardAppPage() {
  const { i18n } = useTranslation()
  const mounted = useMounted()
  const isVietnamese = mounted ? i18n.language === 'vi' : true
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('xp')
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly')
  const currentUser = useAuthStore((s) => s.user)

  const defaultRewards: MonthlyReward[] = [
    { rank: 1, xp_reward: 500, specialBadge: 'Quán quân' },
    { rank: 2, xp_reward: 300, specialBadge: 'Á quân' },
    { rank: 3, xp_reward: 150, specialBadge: 'Top 3' },
  ]

  const { data: rawEntries = [], isLoading } = useLeaderboardQuery(period)

  const users: MonthlyLeaderboardUser[] = useMemo(() => {
    if (!Array.isArray(rawEntries)) return []

    const mapped = rawEntries.map((entry: LeaderboardEntry, idx: number) => {
      const isMe = Boolean(
        entry.is_current_user ||
        (currentUser?.user_id && (entry.user_id === currentUser.user_id || entry.user_id === (currentUser as any)?.id))
      )
      const name = entry.full_name || entry.user_name || (entry.user_id ? `Học viên ${entry.user_id.slice(-4)}` : 'Học viên')

      return {
        rank: idx + 1,
        name,
        avatarUrl: entry.avatar_url || entry.user_avatar,
        avatarColor: avatarColors[idx % avatarColors.length],
        streakDays: entry.current_streak ?? entry.streak_days ?? 0,
        xp: entry.xp ?? 0,
        level: entry.level ?? 1,
        league: entry.league || 'Hạng Đồng • Bronze',
        totalMinutes: 0,
        questionsAnswered: 0,
        wordsLearned: 0,
        freezes: 0,
        isCurrentUser: isMe,
        userId: entry.user_id,
      }
    })

    if (leaderboardType === 'streak') {
      mapped.sort((a, b) => b.streakDays - a.streakDays)
    } else if (leaderboardType === 'level') {
      mapped.sort((a, b) => (b.level || 0) - (a.level || 0))
    } else {
      mapped.sort((a, b) => (b.xp || 0) - (a.xp || 0))
    }

    return mapped.map((u, i) => ({ ...u, rank: i + 1 }))
  }, [rawEntries, leaderboardType, currentUser])

  const myRankUser = useMemo(() => {
    return users.find((u) => u.isCurrentUser)
  }, [users])

  return (
    <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>{isVietnamese ? 'Bảng Vinh Danh & Thi Đua Học Tập' : 'Hall of Fame & Competition'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary" suppressHydrationWarning>
            {isVietnamese ? 'Bảng Xếp Hạng Học Viên' : 'Learner Leaderboard'}
          </h1>
          <p className="mt-1 text-xs text-text-secondary leading-relaxed" suppressHydrationWarning>
            {isVietnamese
              ? 'Thi đua tích lũy XP, rèn luyện chuỗi chuyên cần và bứt phá thứ hạng cùng cộng đồng LingoSphere.'
              : 'Compete, maintain your learning streak, and rise through the ranks in the community.'}
          </p>
        </div>

        <LeaderboardCountdown daysLeft={6} isCurrentMonth={true} />
      </div>

      {myRankUser && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-surface border border-emerald-500/30 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
              #{myRankUser.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-extrabold text-sm sm:text-base text-text-primary">
                  {myRankUser.name} ({isVietnamese ? 'Bạn' : 'You'})
                </p>
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                  {myRankUser.league}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                {myRankUser.rank <= 3
                  ? (isVietnamese ? 'Xuất sắc! Bạn đang nằm trong nhóm nhận thưởng đua top tuần này!' : 'Great job! You are in the top rewards group!')
                  : (isVietnamese ? `Bạn đang ở vị trí #${myRankUser.rank}. Hãy luyện đề và duy trì chuỗi để bứt phá Top 3!` : `You are ranked #${myRankUser.rank}. Keep practicing to break into the Top 3!`)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400 bg-amber-500/15 px-3 py-1.5 rounded-xl border border-amber-500/25">
              <Zap className="w-4 h-4 fill-current" />
              <span>{(myRankUser.xp || 0).toLocaleString('vi-VN')} XP</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-orange-600 dark:text-orange-400 bg-orange-500/15 px-3 py-1.5 rounded-xl border border-orange-500/25">
              <Flame className="w-4 h-4 fill-current" />
              <span>{myRankUser.streakDays} {isVietnamese ? 'ngày' : 'days'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 w-full space-y-6">
          <LeaderboardTabs
            active={leaderboardType}
            onChange={setLeaderboardType}
            period={period}
            onPeriodChange={setPeriod}
          />

          {isLoading ? (
            <div className="py-24 rounded-3xl bg-surface border border-border flex flex-col items-center justify-center gap-3 text-text-secondary">
              <div className="w-8 h-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
              <p className="text-xs font-semibold">{isVietnamese ? 'Đang tổng hợp dữ liệu thứ hạng...' : 'Loading rankings...'}</p>
            </div>
          ) : (
            <>
              {users.length > 0 && (
                <LeaderboardPodium users={users.slice(0, 3)} type={leaderboardType} />
              )}

              <LeaderboardList users={users} type={leaderboardType} />
            </>
          )}
        </div>

        <aside className="w-full lg:w-[360px] shrink-0">
          <LeaderboardRewards rewards={defaultRewards} />
        </aside>
      </div>
    </main>
  )
}
