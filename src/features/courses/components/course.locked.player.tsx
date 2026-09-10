// Màn hình khóa bài giảng khi học viên chưa mua khóa học.

'use client'

import { Lock, ShoppingCart, Crown, ArrowRight, CheckCircle2, LogIn } from 'lucide-react'
import type { Course, Lesson } from '@/features/courses/types/course'

interface CourseLockedPlayerProps {
  course: Course
  currentLesson: Lesson
  isAuthenticated: boolean
  isAlreadyInCart: boolean
  isAddingToCart: boolean
  onBuyNow?: () => void
  onAddToCart: () => void
  onGoToCart: () => void
  onOpenUpgrade: () => void
  onOpenAuth: () => void
}

export function CourseLockedPlayer({
  course,
  currentLesson,
  isAuthenticated,
  isAlreadyInCart,
  isAddingToCart,
  onBuyNow,
  onAddToCart,
  onGoToCart,
  onOpenUpgrade,
  onOpenAuth,
}: CourseLockedPlayerProps) {
  const price = course.price || 0
  const formattedPrice = price > 0 ? `₫${price.toLocaleString('vi-VN')}` : 'Miễn phí'

  return (
    <div className="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] bg-slate-950 flex items-center justify-center border-b border-border select-none py-12 sm:py-16 px-4 sm:px-6 overflow-hidden">
      
      {course.thumbnail && (
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 filter blur-2xl opacity-15 pointer-events-none"
          style={{ backgroundImage: `url(${course.thumbnail})` }}
        />
      )}

      
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-950/95 to-slate-950 pointer-events-none" />

      
      <div className="relative z-10 w-full max-w-xl mx-auto text-center flex flex-col items-center gap-3.5 sm:gap-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] sm:text-xs font-bold tracking-wide shadow-sm shadow-amber-500/10">
          <Lock size={13} className="text-amber-400" />
          <span>Nội dung bài giảng bị khóa</span>
        </div>

        <div className="space-y-1">
          <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
            {currentLesson.title || course.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Khóa học này yêu cầu bạn phải sở hữu khóa học hoặc nâng cấp gói thành viên Premium để xem video bài giảng và làm đề thi.
          </p>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left bg-slate-900/70 border border-slate-800 rounded-xl p-3 sm:p-3.5 w-full max-w-md my-0.5 text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
            <span className="truncate text-[11px] sm:text-xs">Xem toàn bộ video Full HD</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
            <span className="truncate text-[11px] sm:text-xs">Mở khóa toàn bộ đề thi & bài tập</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
            <span className="truncate text-[11px] sm:text-xs">Tải tài liệu & Ghi chú bài học</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
            <span className="truncate text-[11px] sm:text-xs">Cấp chứng nhận hoàn thành</span>
          </div>
        </div>

        
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-1 w-full max-w-md">
          {!isAuthenticated ? (
            <button
              onClick={onOpenAuth}
              className="w-full h-10 sm:h-11 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn size={15} />
              <span>Đăng nhập để đăng ký khóa học</span>
            </button>
          ) : (
            <>
              {isAlreadyInCart ? (
                <button
                  onClick={onGoToCart}
                  className="flex-1 min-w-[180px] h-10 sm:h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={15} />
                  <span>Đến giỏ hàng thanh toán</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={onBuyNow || onAddToCart}
                  disabled={isAddingToCart}
                  className="flex-1 min-w-[180px] h-10 sm:h-11 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingCart size={15} />
                  <span>Mua khóa học ({formattedPrice})</span>
                </button>
              )}

              <button
                onClick={onOpenUpgrade}
                className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <Crown size={14} className="fill-white" />
                <span>Nâng cấp VIP</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
