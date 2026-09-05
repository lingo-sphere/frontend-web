'use client'

/**
 * @file player.endscreen.tsx
 * @description Thành phần mã nguồn player.endscreen.tsx
 */

import { Sparkles, ChevronRight, RotateCcw as ReplayIcon, X } from 'lucide-react'

interface PlayerEndscreenProps {
  showEndedScreen: boolean
  isTrial: boolean
  lessonTitle: string
  hasNextLesson: boolean
  autoPlayNext: boolean
  countdownSeconds: number
  onOpenCheckout?: () => void
  onNextLesson?: () => void
  onReplay: () => void
  onStopAutoPlay: () => void
  onDismissScreen: () => void
}

export function PlayerEndscreen({
  showEndedScreen,
  isTrial,
  lessonTitle,
  hasNextLesson,
  autoPlayNext,
  countdownSeconds,
  onOpenCheckout,
  onNextLesson,
  onReplay,
  onStopAutoPlay,
  onDismissScreen,
}: PlayerEndscreenProps) {
  if (!showEndedScreen) return null

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/85 p-6 text-center text-white backdrop-blur-sm animate-in fade-in duration-200">
      <div className="space-y-4 max-w-sm">
        {isTrial ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
            <Sparkles size={14} />
            Kết thúc bài học thử
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
            <Sparkles size={14} />
            Đã hoàn thành bài học!
          </span>
        )}
        <h3 className="text-base font-bold text-white truncate">{lessonTitle}</h3>

        {isTrial ? (
          <div className="space-y-3 pt-1">
            <p className="text-xs text-zinc-300">
              Bạn vừa hoàn thành xem thử bài giảng. Hãy đăng ký khóa học để mở khóa toàn bộ bài học và bài thi nhé!
            </p>
            <div className="flex items-center justify-center gap-2.5">
              {onOpenCheckout && (
                <button
                  type="button"
                  onClick={onOpenCheckout}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition-colors cursor-pointer"
                >
                  <span>Đăng ký khóa học</span>
                  <ChevronRight size={15} />
                </button>
              )}
              <button
                type="button"
                onClick={onReplay}
                className="flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 px-3.5 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <ReplayIcon size={14} />
                <span>Xem lại</span>
              </button>
            </div>
          </div>
        ) : hasNextLesson && autoPlayNext ? (
          <div className="space-y-4 pt-1 flex flex-col items-center">
            
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#ff0000] transition-all duration-1000 ease-linear"
                  strokeDasharray={`${(countdownSeconds / 5) * 100}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono font-black text-white text-lg drop-shadow-md">
                {countdownSeconds}s
              </span>
            </div>

            <div className="space-y-1 text-center">
              <p className="text-xs font-semibold text-white/90">
                Tự động chuyển bài tiếp theo sau{' '}
                <span className="font-mono font-bold text-[#ff3333]">{countdownSeconds} giây</span>
              </p>
              <p className="text-[11px] text-zinc-400">
                Sẵn sàng tiếp thu kiến thức mới một cách liền mạch!
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onDismissScreen()
                  onNextLesson?.()
                }}
                className="flex items-center gap-1.5 rounded-xl bg-[#ff0000] hover:bg-[#cc0000] px-4 py-2 text-xs font-extrabold text-white shadow-lg shadow-red-600/30 transition-all transform hover:scale-105 cursor-pointer"
              >
                <span>Chuyển bài ngay</span>
                <ChevronRight size={15} />
              </button>

              <button
                type="button"
                onClick={onStopAutoPlay}
                className="flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer border border-white/10"
              >
                <X size={13} />
                <span>Dừng chuyển</span>
              </button>

              <button
                type="button"
                onClick={onReplay}
                className="flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 px-3 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <ReplayIcon size={13} />
                <span>Xem lại</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-zinc-300">
              {hasNextLesson
                ? 'Bạn đã hoàn thành bài học này. Nhấn nút bên dưới để chuyển bài hoặc xem lại.'
                : '🎉 Chúc mừng bạn đã hoàn thành bài học cuối cùng trong danh sách!'}
            </p>
            <div className="flex items-center justify-center gap-2.5">
              {hasNextLesson && onNextLesson && (
                <button
                  type="button"
                  onClick={() => {
                    onDismissScreen()
                    onNextLesson()
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-[#ff0000] hover:bg-[#cc0000] px-4 py-2 text-xs font-bold text-white shadow-lg transition-colors cursor-pointer"
                >
                  <span>Bài tiếp theo</span>
                  <ChevronRight size={15} />
                </button>
              )}
              <button
                type="button"
                onClick={onReplay}
                className="flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2 text-xs font-bold text-white shadow-lg transition-colors cursor-pointer"
              >
                <ReplayIcon size={14} />
                <span>Xem lại bài học</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
