// Component hiển thị thông tin phần thưởng đua top và thể lệ tích lũy kinh nghiệm trong tuần.
'use client'

import React from 'react'
import { Trophy, Award, Zap, CheckCircle2, Flame, Gift } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMounted } from '@/hooks/use.mounted'
import type { MonthlyReward } from '@/features/dashboard/types/dashboard'

interface LeaderboardRewardsProps {
  rewards: MonthlyReward[]
}

export function LeaderboardRewards({ rewards }: LeaderboardRewardsProps) {
  const { i18n } = useTranslation()
  const mounted = useMounted()
  const isVietnamese = mounted ? i18n.language === 'vi' : true

  const rewardStyles = [
    {
      rank: 1,
      badge: isVietnamese ? 'Quán quân' : '1st Place',
      bg: 'bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-surface border-amber-400/50',
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      rank: 2,
      badge: isVietnamese ? 'Á quân' : '2nd Place',
      bg: 'bg-gradient-to-br from-slate-400/15 via-slate-400/5 to-surface border-slate-300 dark:border-slate-700',
      badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
      textColor: 'text-slate-600 dark:text-slate-300',
    },
    {
      rank: 3,
      badge: isVietnamese ? 'Top 3' : '3rd Place',
      bg: 'bg-gradient-to-br from-amber-700/15 via-amber-700/5 to-surface border-amber-600/40',
      badgeClass: 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 border-amber-600/40',
      textColor: 'text-amber-700 dark:text-amber-400',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Gift className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-text-primary">
              {isVietnamese ? 'Phần Thưởng Đua Top' : 'Weekly Rewards'}
            </h3>
            <p className="text-xs text-text-secondary">
              {isVietnamese ? 'Trao giải tự động vào 23:59 Chủ Nhật' : 'Awarded every Sunday 23:59'}
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {rewards.map((reward, idx) => {
            const style = rewardStyles[idx] || rewardStyles[2]
            return (
              <div
                key={reward.rank}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-transform hover:-translate-y-0.5 ${style.bg}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm border shadow-xs ${style.badgeClass}`}>
                    #{reward.rank}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary">
                      {style.badge}
                    </p>
                    <p className="text-[11px] text-text-tertiary">
                      {isVietnamese ? 'Huy hiệu vinh danh tuần' : 'Seasonal badge'}
                    </p>
                  </div>
                </div>

                <div className={`flex items-center gap-1 font-extrabold text-sm ${style.textColor}`}>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>+{reward.xp_reward} XP</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Award className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              {isVietnamese ? 'Bí Quyết Tích Lũy XP' : 'How to Earn XP'}
            </h3>
            <p className="text-xs text-text-secondary">
              {isVietnamese ? 'Mẹo leo hạng nhanh nhất' : 'Tips to climb faster'}
            </p>
          </div>
        </div>

        <div className="space-y-2.5 pt-1 text-xs">
          <div className="flex items-start gap-2 text-text-secondary">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Hoàn thành 1 bài học khóa học: <strong>+15 ~ +30 XP</strong></span>
          </div>
          <div className="flex items-start gap-2 text-text-secondary">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Luyện đề thi TOEIC / Kiểm tra: <strong>+50 ~ +100 XP</strong></span>
          </div>
          <div className="flex items-start gap-2 text-text-secondary">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Duy trì chuỗi học liên tiếp (Streak): <strong>Hệ số x1.5 XP</strong></span>
          </div>
          <div className="flex items-start gap-2 text-text-secondary">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Ôn tập từ vựng Spaced Repetition: <strong>+2 XP / từ</strong></span>
          </div>
        </div>
      </div>
    </div>
  )
}
