// Component hiển thị huy hiệu Chuỗi ngày Streak và Nút nâng cấp VIP.

'use client'

import { Flame, Crown } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/tooltip'

interface HeaderStatsBadgesProps {
  mounted: boolean
  isPremium?: boolean
  isVi: boolean
  streak?: number
  streakFreezesLeft?: number
  onAction?: (msg: string) => void
  onOpenStreak?: () => void
  onOpenUpgrade: () => void
}

export function HeaderStatsBadges({
  mounted,
  isPremium,
  isVi,
  streak = 0,
  streakFreezesLeft,
  onOpenStreak,
  onOpenUpgrade,
}: HeaderStatsBadgesProps) {
  const currentStreak = mounted ? streak : 0
  const hasStreak = currentStreak > 0

  const handleStreakClick = () => {
    if (onOpenStreak) {
      onOpenStreak()
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('lingosphere:streak-celebration', {
          detail: {
            streak: currentStreak,
            isNewRecord: false,
            streakFreezesLeft,
          },
        })
      )
    }
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleStreakClick}
            aria-label={
              isVi
                ? `Chuỗi Streak: ${currentStreak} ngày`
                : `Streak: ${currentStreak} days`
            }
            className={`group hidden h-9 items-center gap-1.5 rounded-xl px-3 text-[12px] font-bold transition-all duration-200 sm:inline-flex cursor-pointer select-none active:scale-95 ${
              hasStreak
                ? 'border border-orange-200 bg-orange-50/90 text-orange-600 shadow-2xs hover:border-orange-300 hover:bg-orange-100 hover:shadow-xs dark:border-orange-500/30 dark:bg-orange-950/25 dark:text-orange-400 dark:hover:border-orange-500/50 dark:hover:bg-orange-950/45'
                : 'border border-border/80 bg-surface-subtle text-text-tertiary hover:border-border hover:text-text-secondary'
            }`}
          >
            <Flame
              size={18}
              className={`shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3 ${
                hasStreak
                  ? 'fill-orange-500 text-orange-600 dark:text-orange-400'
                  : 'fill-text-tertiary/20 text-text-tertiary'
              }`}
            />
            <span
              suppressHydrationWarning
              className={`font-black text-[13px] tracking-tight ${
                hasStreak
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-text-tertiary'
              }`}
            >
              {currentStreak.toLocaleString('vi-VN')}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-center text-xs">
          <p className="font-bold text-orange-600 dark:text-orange-400">
            {isVi ? `🔥 Chuỗi học tập: ${currentStreak} ngày` : `🔥 Learning Streak: ${currentStreak} days`}
          </p>
          <p className="text-[11px] text-text-muted mt-0.5">
            {hasStreak
              ? (isVi ? 'Bấm để xem chi tiết chuỗi kỷ lục' : 'Click to view streak celebration')
              : (isVi ? 'Học ngay hôm nay để thắp lửa Streak!' : 'Practice today to ignite your streak!')}
          </p>
        </TooltipContent>
      </Tooltip>

      {mounted && !isPremium && (
        <button
          type="button"
          onClick={onOpenUpgrade}
          aria-label={isVi ? 'Nâng cấp' : 'Upgrade'}
          className="hidden h-9 items-center gap-1.5 rounded-xl border border-warning/40 bg-gradient-to-r from-warning/20 to-warning/10 px-3 text-[12px] font-semibold text-warning transition-all duration-300 hover:border-warning/80 hover:from-warning/30 hover:to-warning/20 hover:scale-[1.02] sm:inline-flex cursor-pointer select-none active:scale-95"
        >
          <Crown size={16} className="text-warning fill-warning/20" />
          <span suppressHydrationWarning>{isVi ? 'Nâng cấp' : 'Upgrade'}</span>
        </button>
      )}
    </>
  )
}
