// Component giao diện hiển thị đồng hồ đếm ngược thời hạn bảng xếp hạng tinh gọn chuẩn phong cách hiện đại.
'use client'

import { Clock3, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMounted } from '@/hooks/use.mounted'

interface LeaderboardCountdownProps {
  daysLeft: number
  isCurrentMonth?: boolean
}

export function LeaderboardCountdown({ daysLeft, isCurrentMonth = true }: LeaderboardCountdownProps) {
  const { i18n } = useTranslation()
  const mounted = useMounted()
  const isVietnamese = mounted ? i18n.language === 'vi' : true

  if (!isCurrentMonth) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-border bg-surface text-xs font-semibold text-text-secondary">
        <span>{isVietnamese ? 'Bảng xếp hạng đã kết thúc' : 'Rankings closed'}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-surface shadow-xs">
      <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
        <Clock3 className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
      </div>
      <div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>{isVietnamese ? 'Kết thúc tuần sau' : 'Ends in'}</span>
        </div>
        <p className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
          {daysLeft} {isVietnamese ? 'ngày nữa' : 'days left'}
        </p>
      </div>
    </div>
  )
}
