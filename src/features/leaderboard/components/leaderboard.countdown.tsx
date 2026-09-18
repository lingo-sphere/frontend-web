// Component giao diện hiển thị đồng hồ đếm ngược thời hạn bảng xếp hạng.
import { useTranslation } from 'react-i18next'
import { Clock3 } from 'lucide-react'
import { useMounted } from '@/hooks/use.mounted'

interface LeaderboardCountdownProps {
  daysLeft: number
  isCurrentMonth: boolean
}

export function LeaderboardCountdown({ daysLeft, isCurrentMonth }: LeaderboardCountdownProps) {
  const { i18n } = useTranslation()
  const mounted = useMounted()
  const isVietnamese = mounted ? i18n.language === 'vi' : true

  if (!isCurrentMonth) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 text-center">
        <p className="text-[14px] font-semibold text-text-secondary" suppressHydrationWarning>
          {isVietnamese ? 'Bảng xếp hạng tháng này đã đóng' : "This month's rankings are closed"}
        </p>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-warning/30 bg-gradient-to-br from-warning-soft via-surface to-surface p-6">

      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-warning/10" />
      <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-warning/5" />

      <div className="relative flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-warning/20">
          <Clock3 className="h-7 w-7 text-warning" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-[13px] font-medium text-text-secondary" suppressHydrationWarning>
            {isVietnamese ? 'Thời gian còn lại trong tháng' : 'Time remaining to complete this month'}
          </p>
          <p className="mt-1 text-[28px] font-bold text-warning sm:text-[32px]" suppressHydrationWarning>
            {daysLeft} {isVietnamese ? 'ngày' : 'days'}
          </p>
        </div>
        <div className="hidden items-center gap-4 sm:flex">
          <div className="text-center">
            <p className="text-[24px] font-bold text-warning">{daysLeft}</p>
            <p className="text-[11px] text-text-tertiary" suppressHydrationWarning>{isVietnamese ? 'Ngày' : 'Days'}</p>
          </div>
          <span className="text-[24px] font-bold text-text-tertiary">:</span>
          <div className="text-center">
            <p className="text-[24px] font-bold text-warning">
              {String(Math.floor((daysLeft * 24) % 24)).padStart(2, '0')}
            </p>
            <p className="text-[11px] text-text-tertiary" suppressHydrationWarning>{isVietnamese ? 'Giờ' : 'Hours'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
