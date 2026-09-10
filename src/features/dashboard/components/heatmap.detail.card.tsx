/**
 * @file heatmap.detail.card.tsx
 * @description Component giao diện React HeatmapDetailCard cho học viên
 */

import { useTranslation } from 'react-i18next'
import { Flame } from 'lucide-react'

import { Card, CardContent } from '@/components/card'
import { Icon } from '@/components/icon.map'
import type { HeatmapDay } from '@/features/dashboard/types/dashboard'

interface HeatmapDetailCardProps {
  day: HeatmapDay
}

export function HeatmapDetailCard({ day }: HeatmapDetailCardProps) {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const formatDate = (date: string) => {
    const locale = isVietnamese ? 'vi-VN' : 'en-US'
    return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${date}T12:00:00`))
  }

  const getStatusLabel = (status: string) => {
    if (isVietnamese) {
      if (status === 'checked-in') return 'Đã điểm danh'
      if (status === 'freeze') return 'Đã dùng freeze'
      return 'Chưa học'
    }
    if (status === 'checked-in') return 'Checked in'
    if (status === 'freeze') return 'Freeze used'
    return 'Not studied'
  }

  const today = new Date().toISOString().slice(0, 10)
  const isToday = day.id === today

  return (
    <Card className="h-full rounded-2xl border border-border bg-background p-0 shadow-none">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-[19px] font-bold text-text-primary">{formatDate(day.date)}</h3>
          {isToday && (
            <span className="rounded-full border-2 border-warning/70 px-3 py-1 text-[12px] font-bold text-streak">
              {isVietnamese ? 'Hôm nay' : 'Today'}
            </span>
          )}
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1 text-[13px] font-semibold ${
            day.status === 'checked-in' ? 'border-info/60 text-info' :
            day.status === 'freeze' ? 'border-info/60 text-info' :
            'border-border text-text-tertiary'
          }`}>
            {day.status === 'freeze' ? <Icon name="snowflake" size={16} /> : <Flame className="h-4 w-4" />}
            {getStatusLabel(day.status)}
          </span>
          <span className="flex items-center gap-2 text-[14px] text-text-secondary">
            <Icon name="clock" size={18} />
            {day.minutes} {t('dashboard.minutes')}
          </span>
        </div>
        <p className="mt-8 text-[15px] leading-6 text-text-secondary">{day.activityLabel}</p>
      </CardContent>
    </Card>
  )
}
