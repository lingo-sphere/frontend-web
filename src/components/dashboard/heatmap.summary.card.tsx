/**
 * @file heatmap.summary.card.tsx
 * @description Component giao diện React HeatmapSummaryCard cho học viên
 */

import { useTranslation } from 'react-i18next'

import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/icons/icon.map'
import type { HeatmapSummary } from '@/types/dashboard'

interface HeatmapSummaryCardProps {
  summary: HeatmapSummary
}

export function HeatmapSummaryCard({ summary }: HeatmapSummaryCardProps) {
  const { t } = useTranslation()

  const stats = [
    { label: t('dashboard.studyDays'), value: `${summary.studyDays} / 90`, icon: 'heartPulse', className: 'text-success' },
    { label: t('dashboard.studyTime'), value: `${summary.totalMinutes} ${t('dashboard.minutes')}`, icon: 'clock', className: 'text-info' },
    { label: t('dashboard.longestStreak'), value: `${summary.longestStreak} ${t('dashboard.days')}`, icon: 'trendingUp', className: 'text-streak' },
  ]

  return (
    <Card className="h-full rounded-2xl border border-border bg-background p-0 shadow-none">
      <CardContent className="p-5 sm:p-6">
        <h3 className="text-[16px] font-bold uppercase tracking-[0.08em] text-text-secondary">{t('dashboard.yourProgress')}</h3>
        <div className="mt-6 space-y-5">
          {stats.map((stat) => (
            <div className="flex items-start gap-3" key={stat.label}>
              <Icon className={`mt-0.5 ${stat.className}`} name={stat.icon} size={21} />
              <div><p className="text-[13px] text-text-secondary">{stat.label}</p><p className="text-[18px] font-bold text-text-primary">{stat.value}</p></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
