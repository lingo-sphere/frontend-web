// Component danh sách thứ hạng học viên chi tiết với thông tin điểm số và liên đoàn.
'use client'

import React from 'react'
import { Flame, Zap, Trophy, ShieldCheck, User as UserIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMounted } from '@/hooks/use.mounted'
import { resolveMediaUrl } from '@/utils/media.utils'
import type { LeaderboardType, MonthlyLeaderboardUser } from '@/features/dashboard/types/dashboard'

interface LeaderboardListProps {
  users: MonthlyLeaderboardUser[]
  type: LeaderboardType
}

export function LeaderboardList({ users, type }: LeaderboardListProps) {
  const { i18n } = useTranslation()
  const mounted = useMounted()
  const isVietnamese = mounted ? i18n.language === 'vi' : true

  const rankedUsers = users.slice(3)

  return (
    <div className="rounded-3xl bg-surface border border-border overflow-hidden shadow-xs">
      <div className="grid grid-cols-12 gap-3 px-5 py-3.5 border-b border-border bg-surface-subtle/70 text-xs font-bold text-text-secondary select-none">
        <div className="col-span-2 sm:col-span-1 text-center">
          {isVietnamese ? 'Hạng' : 'Rank'}
        </div>
        <div className="col-span-6 sm:col-span-5 text-left">
          {isVietnamese ? 'Học viên' : 'Learner'}
        </div>
        <div className="col-span-4 sm:col-span-3 text-center sm:text-right">
          {type === 'streak' ? (isVietnamese ? 'Chuỗi Streak' : 'Streak') : (isVietnamese ? 'Điểm XP' : 'XP Points')}
        </div>
        <div className="hidden sm:block sm:col-span-3 text-right">
          {isVietnamese ? 'Cấp độ & Liên đoàn' : 'Level & League'}
        </div>
      </div>

      <div className="divide-y divide-border/60">
        {rankedUsers.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-secondary">
            {isVietnamese ? 'Chưa có thêm học viên trong danh sách xếp hạng tuần này.' : 'No more ranked learners this week.'}
          </div>
        ) : (
          rankedUsers.map((user, idx) => {
            const displayName = user.name || (user.userId ? `Học viên ${user.userId.slice(-4)}` : 'Học viên LingoSphere')
            const avatarSrc = user.avatarUrl ? resolveMediaUrl(user.avatarUrl) : undefined
            const initial = displayName.charAt(0).toUpperCase()
            const xpVal = (user.xp ?? user.streakDays * 50).toLocaleString('vi-VN')

            return (
              <div
                key={`rank-row-${user.rank}-${idx}`}
                className={`grid grid-cols-12 gap-3 items-center px-5 py-3.5 transition-colors hover:bg-surface-subtle/60 ${
                  user.isCurrentUser ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                  <span className="w-7 h-7 rounded-xl bg-surface-subtle border border-border/80 flex items-center justify-center text-xs font-black text-text-secondary">
                    #{user.rank}
                  </span>
                </div>

                <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-subtle border border-border shrink-0 flex items-center justify-center font-bold text-sm text-white">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: user.avatarColor || '#6366f1' }}
                      >
                        {initial}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-xs sm:text-sm text-text-primary truncate" title={displayName}>
                        {displayName}
                      </p>
                      {user.isCurrentUser && (
                        <span className="px-1.5 py-0.5 rounded-md bg-primary text-white text-[10px] font-extrabold uppercase">
                          {isVietnamese ? 'Bạn' : 'You'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-tertiary truncate">
                      {user.league || 'Hạng Đồng • Bronze'}
                    </p>
                  </div>
                </div>

                <div className="col-span-4 sm:col-span-3 flex items-center justify-center sm:justify-end gap-1.5">
                  {type === 'streak' ? (
                    <div className="flex items-center gap-1 font-bold text-xs sm:text-sm text-orange-600 dark:text-orange-400">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>{user.streakDays} ngày</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>{xpVal} XP</span>
                    </div>
                  )}
                </div>

                <div className="hidden sm:flex sm:col-span-3 items-center justify-end gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    <Trophy className="w-3 h-3" />
                    <span>Lv.{user.level || 1}</span>
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
