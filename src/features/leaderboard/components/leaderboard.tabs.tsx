// Component thanh chuyển đổi tiêu chí xếp hạng và mốc thời gian thi đua với hiệu ứng bóng mềm.
'use client'

import React from 'react'
import { Flame, Zap, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMounted } from '@/hooks/use.mounted'
import type { LeaderboardType } from '@/features/dashboard/types/dashboard'

interface LeaderboardTabsProps {
  active: LeaderboardType
  onChange: (type: LeaderboardType) => void
  period?: 'weekly' | 'monthly' | 'all-time'
  onPeriodChange?: (period: 'weekly' | 'monthly' | 'all-time') => void
}

export function LeaderboardTabs({
  active,
  onChange,
  period = 'weekly',
  onPeriodChange,
}: LeaderboardTabsProps) {
  const { i18n } = useTranslation()
  const mounted = useMounted()
  const isVietnamese = mounted ? i18n.language === 'vi' : true

  const metricTabs: Array<{ id: LeaderboardType; labelVi: string; labelEn: string; icon: React.ElementType; color: string }> = [
    { id: 'xp', labelVi: 'Điểm XP', labelEn: 'XP Points', icon: Zap, color: 'text-amber-500' },
    { id: 'streak', labelVi: 'Chuỗi Streak', labelEn: 'Streak Days', icon: Flame, color: 'text-orange-500' },
    { id: 'level', labelVi: 'Cấp độ Level', labelEn: 'Level', icon: Trophy, color: 'text-emerald-500' },
  ]

  const periodOptions: Array<{ id: 'weekly' | 'monthly' | 'all-time'; labelVi: string; labelEn: string }> = [
    { id: 'weekly', labelVi: 'Tuần này', labelEn: 'Weekly' },
    { id: 'monthly', labelVi: 'Tháng này', labelEn: 'Monthly' },
    { id: 'all-time', labelVi: 'Toàn thời gian', labelEn: 'All-time' },
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
      <div className="inline-flex p-1 rounded-2xl bg-surface border border-border shadow-2xs">
        {metricTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.color}`} />
              <span>{isVietnamese ? tab.labelVi : tab.labelEn}</span>
            </button>
          )
        })}
      </div>

      {onPeriodChange && (
        <div className="inline-flex p-1 rounded-2xl bg-surface-subtle border border-border">
          {periodOptions.map((opt) => {
            const isActive = period === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onPeriodChange(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-surface text-text-primary shadow-xs font-bold'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {isVietnamese ? opt.labelVi : opt.labelEn}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
