// Updated: 2026-08-17
// Hiển thị danh sách streak milestones:
// - Mỗi milestone là 1 row: icon + "Mốc X ngày" + reward + button
// - Trạng thái: done (success), current (warning), locked (disabled)
// - Props: milestones[], onAction callback

import { useTranslation } from 'react-i18next'
import { Gift, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/icons/icon-map'
import { SectionHeading } from '@/components/dashboard/SectionHeading'
import type { StreakMilestone } from '@/types/dashboard'

interface StreakRewardsProps {
  milestones: StreakMilestone[]
  onAction: (message: string) => void
}

export function StreakRewards({ milestones, onAction }: StreakRewardsProps) {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  // Get remaining days
  const getRemainingDays = (days: number, currentStreak: number = 1) => {
    const remaining = Math.max(0, days - currentStreak)
    return remaining
  }

  return (
    <Card className="dashboard-card flex h-full flex-col p-0">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <SectionHeading eyebrow={t('dashboard.streak')} title={isVietnamese ? 'Phần thưởng Streak' : 'Streak Rewards'} />
          <Gift aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-warning" />
        </div>
        <ul className="mt-5 space-y-2">
          {milestones.map((milestone) => {
            const isDone = milestone.status === 'done'
            const isCurrent = milestone.status === 'current'
            const remaining = getRemainingDays(milestone.days, 1)

            return (
              <li
                key={milestone.days}
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                  isDone ? 'border-success/35 bg-success-soft' :
                  isCurrent ? 'border-warning/35 bg-warning-soft' :
                  'border-border bg-background'
                }`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  isDone ? 'bg-success/15 text-success' :
                  isCurrent ? 'border-2 border-warning/70 text-warning' :
                  'bg-surface-subtle text-text-disabled'
                }`}>
                  {isDone ? <Icon name="check" size={15} /> : <Lock className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-text-primary">
                    {isVietnamese ? 'Mốc' : 'Milestone'} {milestone.days} {isVietnamese ? 'ngày' : 'days'}
                  </p>
                  <p className="text-[11px] text-text-secondary">
                    {isDone ? (
                      isVietnamese ? 'Hoàn thành' : 'Completed'
                    ) : (
                      isVietnamese ? `Còn ${remaining} ngày` : `${remaining} days left`
                    )}
                  </p>
                </div>
                <span className="hidden text-[11px] font-semibold text-text-secondary sm:inline">
                  {milestone.reward}
                </span>
                <Button
                  aria-label={`${milestone.days} ${isVietnamese ? 'ngày' : 'days'} · ${milestone.reward}`}
                  className="ml-auto h-auto rounded-lg px-3 py-1 text-[11px] font-semibold hover:bg-surface-hover"
                  onClick={() => onAction(`${milestone.days} ${isVietnamese ? 'ngày' : 'days'}: ${milestone.reward}.`)}
                  variant="ghost"
                >
                  {isDone ? (isVietnamese ? 'Đã nhận' : 'Claimed') : (isVietnamese ? 'Chưa mở' : 'Locked')}
                </Button>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
