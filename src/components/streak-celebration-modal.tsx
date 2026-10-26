// Modal chúc mừng chuỗi Streak học tập cho học viên LingoSphere.

import { useEffect, useState } from 'react'
import { Flame, Trophy, Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/button'

interface StreakCelebrationModalProps {
  open: boolean
  streak: number
  isNewRecord?: boolean
  streakFreezesLeft?: number
  onClose: () => void
}

export function StreakCelebrationModal({
  open,
  streak,
  isNewRecord = false,
  streakFreezesLeft,
  onClose,
}: StreakCelebrationModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (open) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [open])

  if (!open) return null

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-amber-500/30 bg-surface p-6 shadow-2xl text-center overflow-hidden animate-in zoom-in-95 duration-300 space-y-5">
        {/* Decorative background glows */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-orange-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        {/* Top Badge */}
        {isNewRecord ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-black tracking-wider uppercase">
            <Trophy size={14} className="text-amber-500 animate-pulse" />
            <span>Kỷ lục mới!</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-bold">
            <Sparkles size={14} className="text-orange-500" />
            <span>Giữ vững chuỗi học tập!</span>
          </div>
        )}

        {/* Animated Flame Icon */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-orange-500/30 rounded-full animate-ping opacity-30" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Flame size={44} className="text-white fill-white drop-shadow-md animate-bounce" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-1.5">
          <h3 className="text-3xl font-black text-text-primary tracking-tight">
            {streak} Ngày Liên Tiếp!
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            {isNewRecord
              ? 'Tuyệt đỉnh! Bạn vừa lập kỷ lục chuỗi Streak dài nhất từ trước tới nay. Hãy tiếp tục bứt phá nhé!'
              : streak >= 7
              ? 'Phong độ rất vững vàng! Thói quen học tập hàng ngày đang đưa bạn đến gần mục tiêu hơn bao giờ hết.'
              : 'Một ngày học tập tuyệt vời đã hoàn thành. Hãy quay lại vào ngày mai để tăng chuỗi nhé!'}
          </p>
        </div>

        {/* Streak Freeze Info (if any) */}
        {streakFreezesLeft !== undefined && streakFreezesLeft > 0 && (
          <div className="p-2.5 rounded-xl bg-surface-subtle border border-border/60 flex items-center justify-center gap-2 text-[11px] text-text-tertiary">
            <ShieldCheck size={14} className="text-sky-500" />
            <span>
              Bạn đang có <strong className="text-text-primary">{streakFreezesLeft}</strong> Khiên bảo vệ Streak
            </span>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
        >
          <span>Tiếp tục học ngay</span>
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  )
}

