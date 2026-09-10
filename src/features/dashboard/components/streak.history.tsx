/**
 * @file streak.history.tsx
 * @description Component giao diện React StreakHistory cho học viên
 */

import { useTranslation } from 'react-i18next'
import { CalendarDays } from 'lucide-react'

import { Card, CardContent } from '@/components/card'
import { HeatmapDetailCard } from '@/features/dashboard/components/heatmap.detail.card'
import { HeatmapGrid } from '@/features/dashboard/components/heatmap.grid'
import { HeatmapSummaryCard } from '@/features/dashboard/components/heatmap.summary.card'
import { useDashboardStore } from '@/features/dashboard/store/dashboard.store'
import type { HeatmapDay, HeatmapSummary } from '@/features/dashboard/types/dashboard'

interface StreakHistoryProps {
  days: HeatmapDay[]
  summary: HeatmapSummary
}

export function StreakHistory({ days, summary }: StreakHistoryProps) {
  const { t } = useTranslation()
  const selectedDayId = useDashboardStore((state) => state.selectedHeatmapDayId)
  const setSelectedHeatmapDay = useDashboardStore((state) => state.setSelectedHeatmapDay)
  const selectedDay = days.find((day) => day.id === selectedDayId) ?? days.at(-1)!

  return (
    <Card aria-labelledby="streak-history-title" className="dashboard-card p-0">
      <CardContent className="p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary"><CalendarDays className="h-[19px] w-[19px]" /></span>
          <div>
            <h2 className="text-[20px] font-bold text-text-primary" id="streak-history-title">{t('dashboard.streak')}</h2>
            <p className="mt-1 text-[14px] text-text-secondary">
              {t('dashboard.dayStreak', { count: 90 })}
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(430px,1.15fr)_minmax(300px,.9fr)_minmax(240px,.72fr)] xl:gap-6">
          <HeatmapGrid days={days} onSelect={(day) => setSelectedHeatmapDay(day.id)} selectedDayId={selectedDay.id} />
          <HeatmapDetailCard day={selectedDay} />
          <HeatmapSummaryCard summary={summary} />
        </div>
      </CardContent>
    </Card>
  )
}
