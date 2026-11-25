// Thành phần đồng hồ đếm ngược hoạt họa cho phòng thi trực tuyến sử dụng bộ đếm Counter.
'use client'

import { memo } from 'react'
import { Clock } from 'lucide-react'
import { Counter } from '@/components/counter'
import { cn } from '@/lib/utils'

export interface AnimatedTimerProps {
  seconds: number
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  isWarningThreshold?: number
  digitFontSize?: number | string
  textColor?: string
}

export const AnimatedTimer = memo(function AnimatedTimer({
  seconds,
  className,
  showIcon = true,
  size = 'md',
  isWarningThreshold = 300,
  digitFontSize,
  textColor,
}: AnimatedTimerProps) {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(safeSeconds / 3600)
  const mins = Math.floor((safeSeconds % 3600) / 60)
  const secs = safeSeconds % 60
  const isUrgent = safeSeconds > 0 && safeSeconds < isWarningThreshold

  const resolvedFontSize = digitFontSize ?? (size === 'lg' ? 18 : size === 'sm' ? 13 : 15)

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 transition-all border select-none font-mono shadow-2xs',
        isUrgent
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          : 'bg-surface-subtle/80 dark:bg-slate-800/60 border-border text-text-primary',
        className
      )}
    >
      {showIcon && (
        <Clock
          size={size === 'lg' ? 18 : size === 'sm' ? 14 : 16}
          className={cn(
            isUrgent ? 'text-rose-500 animate-pulse' : 'text-text-secondary'
          )}
        />
      )}

      <div
        className={cn(
          'inline-flex items-center font-bold tracking-tight',
          textColor ? textColor : isUrgent ? 'text-rose-600 dark:text-rose-400' : 'text-text-primary'
        )}
      >
        {hours > 0 && (
          <>
            <Counter
              value={hours}
              minDigits={2}
              fontSize={resolvedFontSize}
              fontWeight={700}
              direction="down"
              duration={0.4}
              bounce={0.15}
              fade={0.15}
              gap={0}
              tabular
              motionBlur
              intro={false}
            />
            <span className="mx-0.5 font-bold opacity-70">:</span>
          </>
        )}
        <Counter
          value={mins}
          minDigits={2}
          fontSize={resolvedFontSize}
          fontWeight={700}
          direction="down"
          duration={0.4}
          bounce={0.15}
          fade={0.15}
          gap={0}
          tabular
          motionBlur
          intro={false}
        />
        <span className="mx-0.5 font-bold opacity-70">:</span>
        <Counter
          value={secs}
          minDigits={2}
          fontSize={resolvedFontSize}
          fontWeight={700}
          direction="down"
          duration={0.35}
          bounce={0.15}
          fade={0.15}
          gap={0}
          tabular
          motionBlur
          intro={false}
        />
      </div>
    </div>
  )
})
