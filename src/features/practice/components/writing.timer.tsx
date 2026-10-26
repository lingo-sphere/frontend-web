// Component Timer cho Writing Workspace với countdown và animation
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTime, getTimeStatus } from '@/features/practice/lib/writing-time-mode'

interface WritingTimerProps {
  totalSeconds: number
  onTimeUp: () => void
  onElapsedChange?: (seconds: number) => void
  isPaused?: boolean
}

export function WritingTimer({ totalSeconds, onTimeUp, onElapsedChange, isPaused = false }: WritingTimerProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [elapsed, setElapsed] = useState(0)
  const [hasTriggeredTimeUp, setHasTriggeredTimeUp] = useState(false)

  const remaining = Math.max(0, totalSeconds - elapsed)
  const status = getTimeStatus(remaining, totalSeconds)

  // Timer logic
  useEffect(() => {
    if (isPaused || remaining === 0) return

    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPaused, remaining, totalSeconds])

  useEffect(() => { onElapsedChange?.(elapsed) }, [elapsed, onElapsedChange])

  // Gọi callback khi hết giờ
  useEffect(() => {
    if (remaining === 0 && !hasTriggeredTimeUp) {
      setHasTriggeredTimeUp(true)
      onTimeUp()
    }
  }, [remaining, hasTriggeredTimeUp, onTimeUp])

  const statusStyles = {
    normal: {
      container: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      pulse: false,
    },
    warning: {
      container: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      pulse: false,
    },
    urgent: {
      container: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-300',
      pulse: true,
    },
  }

  const currentStyle = statusStyles[status]

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-2 transition-all',
        currentStyle.bg,
        currentStyle.border,
        currentStyle.pulse && 'animate-pulse'
      )}
    >
      {status === 'urgent' && remaining > 0 ? (
        <AlertTriangle className={cn('h-5 w-5 animate-bounce text-red-500')} />
      ) : (
        <Clock className={cn('h-5 w-5', currentStyle.container)} />
      )}

      <div className="flex flex-col">
        <span
          className={cn(
            'font-mono font-bold transition-all',
            // Size: bình thường → to hơn khi urgent
            status === 'urgent' ? 'text-[28px] leading-none animate-[shake_0.5s_ease-in-out_infinite]' : 'text-[16px]',
            currentStyle.container,
            // Scale up animation khi urgent
            status === 'urgent' && 'scale-110'
          )}
        >
          {remaining === 0 ? '00:00' : formatTime(remaining)}
        </span>

        {status === 'urgent' && remaining > 0 && (
          <span className="text-[10px] font-medium text-red-500 animate-pulse">
            {isVietnamese ? 'Sắp hết giờ!' : 'Time almost up!'}
          </span>
        )}

        {remaining === 0 && (
          <span className="text-[10px] font-medium text-red-500">
            {isVietnamese ? 'Đã hết giờ!' : 'Time is up!'}
          </span>
        )}
      </div>

      {/* CSS for shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
      `}</style>
    </div>
  )
}

// Progress bar version của timer
interface WritingTimerProgressProps extends WritingTimerProps {
  showProgress?: boolean
}

export function WritingTimerProgress({ totalSeconds, onTimeUp, onElapsedChange, isPaused = false, showProgress = true }: WritingTimerProgressProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [elapsed, setElapsed] = useState(0)
  const [hasTriggeredTimeUp, setHasTriggeredTimeUp] = useState(false)

  const remaining = Math.max(0, totalSeconds - elapsed)
  const status = getTimeStatus(remaining, totalSeconds)
  const progress = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0

  useEffect(() => {
    if (isPaused || remaining === 0) return

    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1
        if (next >= totalSeconds) {
          setHasTriggeredTimeUp(true)
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPaused, remaining, totalSeconds])

  useEffect(() => {
    if (remaining === 0 && !hasTriggeredTimeUp) {
      setHasTriggeredTimeUp(true)
      onTimeUp()
    }
  }, [remaining, hasTriggeredTimeUp, onTimeUp])

  const progressColors = {
    normal: 'bg-blue-500',
    warning: 'bg-amber-500',
    urgent: 'bg-red-500',
  }

  return (
    <div className="space-y-1">
      <WritingTimer totalSeconds={totalSeconds} onTimeUp={onTimeUp} isPaused={isPaused} />

      {showProgress && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={cn(
              'h-full transition-all duration-1000',
              progressColors[status],
              status === 'urgent' && 'animate-pulse'
            )}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
    </div>
  )
}
