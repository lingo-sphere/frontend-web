/**
 * @file LeaderboardList.tsx
 * @description Component giao diện React LeaderboardList cho học viên
 */

import { useTranslation } from 'react-i18next'
import type { LeaderboardType, MonthlyLeaderboardUser } from '@/types/dashboard'

interface LeaderboardListProps {
  users: MonthlyLeaderboardUser[]
  type: LeaderboardType
}

export function LeaderboardList({ users, type }: LeaderboardListProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const rankedUsers = users.slice(3)

  const columnLabel = type === 'streak'
    ? (isVietnamese ? 'Chuỗi' : 'Streak')
    : type === 'learning'
    ? (isVietnamese ? 'Phút' : 'Minutes')
    : (isVietnamese ? 'Từ' : 'Words')

  const statValue = (user: MonthlyLeaderboardUser) => {
    if (type === 'streak') return user.streakDays
    if (type === 'learning') return user.totalMinutes
    return user.wordsLearned
  }

  return (
    <div className="dashboard-card overflow-hidden">

      <div className="flex items-center gap-4 border-b border-border bg-surface-subtle px-4 py-3">
        <span className="w-10 text-center text-[12px] font-semibold text-text-tertiary">
          {isVietnamese ? 'Hạng' : 'Rank'}
        </span>
        <span className="flex-1 text-[12px] font-semibold text-text-tertiary">
          {isVietnamese ? 'Người dùng' : 'User'}
        </span>
        <span className="w-20 text-right text-[12px] font-semibold text-text-tertiary">
          {columnLabel}
        </span>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {rankedUsers.map((user, idx) => (
          <div
            key={`ranked-user-${user.rank}-${idx}`}
            className={`flex items-center gap-4 px-4 py-3 transition-colors ${
              idx % 2 === 0 ? 'bg-surface' : 'bg-surface-subtle/50'
            } ${user.isCurrentUser ? 'border-l-4 border-l-primary' : ''}`}
          >

            <div className="flex h-8 w-10 items-center justify-center">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-semibold ${
                  user.rank <= 3 ? 'bg-warning/10 text-warning' : 'bg-surface-subtle text-text-secondary'
                }`}
              >
                {user.rank}
              </span>
            </div>

            <div className="flex flex-1 items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white"
                style={{ backgroundColor: user.avatarColor }}
              >
                {user.name.charAt(0)}
              </div>
              <span className="text-[14px] font-medium text-text-primary">{user.name}</span>
            </div>

            <div className="flex w-20 items-center justify-end gap-1">
              <span className="text-[14px] font-semibold text-text-primary">
                {statValue(user)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
