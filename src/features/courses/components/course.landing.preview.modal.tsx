// Modal xem truoc video bai hoc mau danh cho hoc vien voi danh sach bai giang mien phi.
'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  Play,
  Sparkles,
  CheckCircle2,
  ShoppingCart,
  PlayCircle,
  ShieldCheck,
  Clock,
} from 'lucide-react'
import type { Course, Lesson } from '@/features/courses/types/course'
import { getCourseEffectivePrice } from '@/features/courses/helpers/course.workspace.adapter'
import { CoursePreviewVideoPlayer } from '@/features/courses/components/course.preview.video.player'

interface CourseLandingPreviewModalProps {
  open: boolean
  onClose: () => void
  lesson: Lesson | null
  course?: Course
  courseTitle?: string
  coursePrice?: number
  onBuyNow: () => void
  onAddToCart?: () => void
  isInCart?: boolean
  isAddingToCart?: boolean
}

function formatDurationSeconds(sec?: number): string {
  if (!sec || sec <= 0) return '05:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
}

export function CourseLandingPreviewModal({
  open,
  onClose,
  lesson,
  course,
  courseTitle,
  coursePrice,
  onBuyNow,
  onAddToCart,
  isInCart = false,
  isAddingToCart = false,
}: CourseLandingPreviewModalProps) {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(lesson)

  useEffect(() => {
    if (lesson) {
      setCurrentLesson(lesson)
    }
  }, [lesson])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const previewItems = useMemo(() => {
    const items: Array<{
      lesson: Lesson
      chapterTitle: string
      chapterNumber: number
    }> = []

    if (course?.chapters && course.chapters.length > 0) {
      course.chapters.forEach((ch, chIdx) => {
        ch.lessons?.forEach((l) => {
          const isPreviewable = Boolean(l.is_free_preview || l.is_preview)
          if (isPreviewable) {
            items.push({
              lesson: l,
              chapterTitle: ch.title,
              chapterNumber: chIdx + 1,
            })
          }
        })
      })
    }

    if (items.length === 0 && lesson && (lesson.is_free_preview || lesson.is_preview)) {
      items.push({
        lesson,
        chapterTitle: 'Chương 1',
        chapterNumber: 1,
      })
    }

    return items
  }, [course, lesson])

  const activeLesson = currentLesson || lesson

  const rawVideoSrc =
    activeLesson?.videoUrl ||
    activeLesson?.content?.videoUrl ||
    ''
  const videoSrc = rawVideoSrc.trim()

  const effectivePrice = course ? getCourseEffectivePrice(course) : (coursePrice || 0)
  const originalPrice = (course?.price || 0) > effectivePrice ? (course?.price || 0) : 0
  const discountPercent =
    originalPrice > 0 ? Math.max(0, Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)) : 0
  const displayTitle = course?.title || courseTitle || 'Khóa học LingoSphere'

  return (
    <AnimatePresence>
      {open && activeLesson && (
        <motion.div
          key="course-preview-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            key="course-preview-card"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 340,
              mass: 0.75,
            }}
            className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[92vh] text-white ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
        <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950/70 backdrop-blur-md shrink-0">
          <div className="min-w-0 pr-4 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] sm:text-[11px] font-extrabold tracking-wide uppercase">
                <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                Xem trước bài học miễn phí
              </span>
              <span className="text-xs text-slate-400 truncate max-w-[240px] sm:max-w-md hidden sm:inline">
                • {displayTitle}
              </span>
            </div>
            <h3 className="text-sm sm:text-base md:text-lg font-black text-white truncate tracking-tight">
              {activeLesson.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700/50 shrink-0 shadow-xs"
            title="Đóng cửa sổ xem trước (Esc)"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(92vh-150px)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
            <div className="lg:col-span-8 space-y-4">
              <CoursePreviewVideoPlayer
                key={activeLesson.id}
                videoSrc={videoSrc}
                title={activeLesson.title}
                autoPlay
              />

              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                      Bài học mẫu miễn phí
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatDurationSeconds(activeLesson.duration)}
                    </span>
                    <span>•</span>
                    <span className="text-slate-300 font-medium">Âm thanh & hình ảnh chuẩn HD</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium line-clamp-2">
                    {activeLesson.title}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4 text-indigo-400" />
                  <span>Bài học xem trước ({previewItems.length})</span>
                </h4>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Miễn phí
                </span>
              </div>

              <div className="space-y-2 max-h-[360px] lg:max-h-[420px] overflow-y-auto pr-1.5">
                {previewItems.map((item, idx) => {
                  const isActive = item.lesson.id === activeLesson.id
                  return (
                    <button
                      key={item.lesson.id || idx}
                      type="button"
                      onClick={() => setCurrentLesson(item.lesson)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border-indigo-500/70 shadow-md shadow-indigo-950/50 text-white ring-1 ring-indigo-500/40'
                          : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div
                        className={`mt-0.5 p-2 rounded-lg shrink-0 transition-colors ${
                          isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                            Phần {item.chapterNumber}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {formatDurationSeconds(item.lesson.duration)}
                          </span>
                        </div>
                        <p
                          className={`text-xs font-bold line-clamp-2 ${
                            isActive ? 'text-indigo-200 font-extrabold' : 'text-slate-200'
                          }`}
                        >
                          {item.lesson.title}
                        </p>
                        {isActive && (
                          <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-400 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Đang phát
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                <div className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Quyền lợi khi đăng ký</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Toàn bộ bài giảng & tài liệu độc quyền</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Bài tập trắc nghiệm & ngân hàng đề thi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Cấp chứng nhận hoàn thành khóa học</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-7 py-3.5 sm:py-4 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 backdrop-blur-md">
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="flex items-baseline justify-center sm:justify-start gap-2.5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {effectivePrice > 0 ? `₫${effectivePrice.toLocaleString('vi-VN')}` : 'Miễn phí'}
              </span>
              {originalPrice > effectivePrice && (
                <span className="text-xs sm:text-sm text-slate-400 line-through font-semibold">
                  ₫{originalPrice.toLocaleString('vi-VN')}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Giảm {discountPercent}%
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Đảm bảo hoàn tiền trong 30 ngày • Quyền truy cập trọn đời
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onAddToCart && (
              <button
                type="button"
                onClick={onAddToCart}
                disabled={isAddingToCart || isInCart}
                className={`flex-1 sm:flex-initial px-4 py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isInCart
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400'
                    : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isInCart ? 'Đã có trong giỏ' : 'Thêm vào giỏ'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onBuyNow}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>Mua ngay / Đăng ký học</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  )
}
