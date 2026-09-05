/**
 * @file streak.leaderboard.tsx
 * @description Component giao diện React StreakLeaderboard cho học viên
 */

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Icon } from '@/components/icons/icon.map'
import { SectionHeading } from '@/components/dashboard/section.heading'
import { useDashboardStore } from '@/store/dashboard.store'
import type { LeaderboardData, LeaderboardPeriod } from '@/types/dashboard'

interface StreakLeaderboardProps {
  leaderboard: LeaderboardData
  onAction: (message: string) => void
}

export function StreakLeaderboard({ leaderboard, onAction }: StreakLeaderboardProps) {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const period = useDashboardStore((state) => state.leaderboardPeriod)
  const setPeriod = useDashboardStore((state) => state.setLeaderboardPeriod)
  const entries = leaderboard[period]

  const periodLabels: Record<LeaderboardPeriod, { vi: string; en: string }> = {
    week: { vi: 'Tuần', en: 'Week' },
    month: { vi: 'Tháng', en: 'Month' },
    year: { vi: 'Năm', en: 'Year' },
  }

  const handlePeriodChange = (value: string) => {
    if (value === 'week' || value === 'month' || value === 'year') setPeriod(value)
  }

  return (
    <Card className="dashboard-card flex h-full flex-col p-0">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <SectionHeading eyebrow={t('leaderboard.title')} title={isVietnamese ? 'Bảng xếp hạng' : 'Streak Leaderboard'} />
          <Icon className="mt-1 shrink-0 text-warning" name="trophy" size={20} />
        </div>
        <Tabs className="mt-4 flex flex-1 flex-col" onValueChange={handlePeriodChange} value={period}>
          <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-background p-1">
            {(Object.keys(periodLabels) as LeaderboardPeriod[]).map((key) => (
              <TabsTrigger className="rounded-lg px-3 py-2 text-[11px]" key={key} value={key}>
                {periodLabels[key][isVietnamese ? 'vi' : 'en']}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent className="mt-3 flex-1" value={period}>
            <div role="table" aria-label={`Streak leaderboard ${periodLabels[period][isVietnamese ? 'vi' : 'en']}`}>
              {entries.map((entry, idx) => (
                <div className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0" key={`leaderboard-entry-${entry.rank}-${idx}`} role="row">
                  <span className={`w-5 text-center text-[12px] font-bold ${entry.rank === 1 ? 'text-warning' : entry.rank === 3 ? 'text-warning/80' : 'text-text-tertiary'}`} role="cell">{entry.rank}</span>
                  <span className="flex-1 text-[13px] font-semibold text-text-primary" role="cell">{entry.name}</span>
                  <span className="text-[12px] font-semibold text-text-secondary" role="cell">
                    {entry.streakDays} {isVietnamese ? 'ngày' : 'days'}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        <Button className="mt-3 h-auto self-end p-0 text-[11px] font-semibold text-primary hover:bg-transparent hover:text-primary-hover" onClick={() => onAction(`${isVietnamese ? 'Đã mở leaderboard' : 'Opened leaderboard'} ${periodLabels[period][isVietnamese ? 'vi' : 'en'].toLowerCase()}.`)} variant="ghost">
          {isVietnamese ? 'Xem bảng xếp hạng' : 'View leaderboard'} →
        </Button>
      </CardContent>
    </Card>
  )
}
