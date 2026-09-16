// Modal phat video xem truoc bai hoc mau danh cho hoc vien chua mua khoa hoc.
'use client'

import { X, Play, Lock, Sparkles, CheckCircle2 } from 'lucide-react'
import type { Lesson } from '@/features/courses/types/course'

interface CourseLandingPreviewModalProps {
  open: boolean
  onClose: () => void
  lesson: Lesson | null
  courseTitle: string
  coursePrice?: number
  onBuyNow: () => void
}

export function CourseLandingPreviewModal({
  open,
  onClose,
  lesson,
  courseTitle,
  coursePrice,
  onBuyNow,
}: CourseLandingPreviewModalProps) {
  if (!open || !lesson) return null

  const videoSrc =
    lesson.videoUrl ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-150 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="space-y-0.5 min-w-0 pr-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">
              Xem trước bài học miễn phí
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate">
              {lesson.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative aspect-video w-full bg-black">
          <video
            src={videoSrc}
            controls
            autoPlay
            className="w-full h-full object-contain"
          />
        </div>

        <div className="p-6 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Đăng ký khóa học để mở khóa toàn bộ bài giảng và bài tập!</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-md">
              {courseTitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose()
              onBuyNow()
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Lock className="w-4 h-4" />
            <span>
              {coursePrice && coursePrice > 0
                ? `Mua ngay với ₫${coursePrice.toLocaleString('vi-VN')}`
                : 'Đăng ký khóa học ngay'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
