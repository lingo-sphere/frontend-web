// Component bục vinh danh Top 3 học viên xuất sắc theo phong cách Olympic thể thao điện tử hiện đại.
'use client'

import { Crown, Sparkles, Flame, Zap, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMounted } from '@/hooks/use.mounted'
import { resolveMediaUrl } from '@/utils/media.utils'
import type { LeaderboardType, MonthlyLeaderboardUser } from '@/features/dashboard/types/dashboard'

interface LeaderboardPodiumProps {
  users: MonthlyLeaderboardUser[]
  type: LeaderboardType
}

export function LeaderboardPodium({ users, type }: LeaderboardPodiumProps) {
  const { i18n } = useTranslation()
  const mounted = useMounted()
  const isVietnamese = mounted ? i18n.language === 'vi' : true

  const top1 = users.find((u) => u.rank === 1) || users[0]
  const top2 = users.find((u) => u.rank === 2) || users[1]
  const top3 = users.find((u) => u.rank === 3) || users[2]

  const getMetricDisplay = (u?: MonthlyLeaderboardUser) => {
    if (!u) return { val: '0', icon: Zap, label: 'XP' }
    if (type === 'streak') {
      return { val: `${u.streakDays} ngày`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/15' }
    }
    if (type === 'level') {
      return { val: `Cấp ${u.level || 1}`, icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-500/15' }
    }
    return { val: `${(u.xp ?? u.streakDays * 50).toLocaleString('vi-VN')} XP`, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/15' }
  }

  const renderPodiumItem = (
    user: MonthlyLeaderboardUser | undefined,
    rank: 1 | 2 | 3,
    heightClass: string,
    stepHeight: string,
    gradientRing: string,
    badgeBg: string,
    badgeBorder: string,
    badgeText: string,
    titleLabel: string,
    bonusXP: number
  ) => {
    if (!user) return null
    const metric = getMetricDisplay(user)
    const MetricIcon = metric.icon
    const displayName = user.name || `Học viên ${user.userId?.slice(-4) || 'Lingo'}`
    const avatarSrc = user.avatarUrl ? resolveMediaUrl(user.avatarUrl) : undefined

    return (
      <div className={`flex flex-col items-center flex-1 max-w-[220px] ${heightClass} justify-end transition-transform hover:-translate-y-1`}>
        <div className="relative mb-2 flex flex-col items-center">
          {rank === 1 && (
            <div className="absolute -top-7 z-20 animate-bounce">
              <span className="p-1.5 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-slate-900 shadow-md flex items-center justify-center">
                <Crown className="w-4 h-4 fill-current stroke-[1.5]" />
              </span>
            </div>
          )}

          <div className={`relative p-1 rounded-full ${gradientRing} shadow-md`}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface border-2 border-surface overflow-hidden flex items-center justify-center font-black text-lg sm:text-xl text-white uppercase shadow-inner">
              {avatarSrc ? (
                <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: user.avatarColor || '#10b981' }}
                >
                  {displayName.charAt(0)}
                </div>
              )}
            </div>
            <div className={`absolute -bottom-2 inset-x-0 mx-auto w-fit px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border shadow-xs ${badgeBg} ${badgeBorder} ${badgeText}`}>
              #{rank} {titleLabel}
            </div>
          </div>
        </div>

        <div className="w-full text-center px-1 mb-2">
          <p className="font-bold text-xs sm:text-sm text-text-primary truncate" title={displayName}>
            {displayName}
          </p>
          <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-surface-subtle border border-border text-[11px] font-extrabold text-text-primary">
            <MetricIcon className={`w-3.5 h-3.5 ${metric.color}`} />
            <span>{metric.val}</span>
          </div>
        </div>

        <div className={`w-full ${stepHeight} rounded-t-3xl border-t-2 border-x-2 flex flex-col items-center justify-between p-3 relative overflow-hidden shadow-xs ${
          rank === 1
            ? 'bg-gradient-to-b from-amber-500/20 via-amber-500/10 to-surface border-amber-400/80 dark:border-amber-500/40'
            : rank === 2
            ? 'bg-gradient-to-b from-slate-400/20 via-slate-400/10 to-surface border-slate-300 dark:border-slate-700'
            : 'bg-gradient-to-b from-amber-700/20 via-amber-700/10 to-surface border-amber-600/70 dark:border-amber-800/40'
        }`}>
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
            <Sparkles className="w-3 h-3" />
            <span>+{bonusXP} XP</span>
          </div>
          <span className={`text-3xl sm:text-4xl font-black tracking-tighter opacity-80 ${
            rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-slate-400' : 'text-amber-700'
          }`}>
            #{rank}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl bg-surface border border-border p-5 sm:p-7 shadow-xs">
      <div className="flex items-end justify-center gap-2 sm:gap-6 pt-6">
        {renderPodiumItem(
          top2,
          2,
          'order-1',
          'h-24 sm:h-28',
          'bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-400',
          'bg-slate-100 dark:bg-slate-800',
          'border-slate-300 dark:border-slate-700',
          'text-slate-700 dark:text-slate-300',
          isVietnamese ? 'Á quân' : '2nd',
          300
        )}

        {renderPodiumItem(
          top1,
          1,
          'order-2',
          'h-32 sm:h-36',
          'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500',
          'bg-amber-100 dark:bg-amber-950/60',
          'border-amber-400 dark:border-amber-600',
          'text-amber-800 dark:text-amber-200',
          isVietnamese ? 'Quán quân' : '1st',
          500
        )}

        {renderPodiumItem(
          top3,
          3,
          'order-3',
          'h-20 sm:h-24',
          'bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-800',
          'bg-amber-100/70 dark:bg-amber-950/40',
          'border-amber-600/60 dark:border-amber-700',
          'text-amber-800 dark:text-amber-300',
          isVietnamese ? 'Top 3' : '3rd',
          150
        )}
      </div>
    </div>
  )
}
