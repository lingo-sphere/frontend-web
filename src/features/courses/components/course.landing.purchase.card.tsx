// Card thanh toan va dang ky hoc sticky ben phai giao dien landing page khoa hoc.
'use client'

import { useState } from 'react'
import {
  Play,
  ShoppingCart,
  Heart,
  ShieldCheck,
  Video,
  FileText,
  Smartphone,
  Award,
  Clock,
  Sparkles,
  Share2,
} from 'lucide-react'
import type { Course } from '@/features/courses/types/course'
import { getCourseEffectivePrice } from '@/features/courses/helpers/course.workspace.adapter'

interface CourseLandingPurchaseCardProps {
  course: Course
  onEnrollOrBuy: () => void
  onAddToCart: () => void
  onOpenPreview: () => void
  isInCart: boolean
  isAddingToCart: boolean
}

export function CourseLandingPurchaseCard({
  course,
  onEnrollOrBuy,
  onAddToCart,
  onOpenPreview,
  isInCart,
  isAddingToCart,
}: CourseLandingPurchaseCardProps) {
  const [isCopied, setIsCopied] = useState(false)

  const effectivePrice = getCourseEffectivePrice(course)
  const originalPrice = (course.price || 0) > effectivePrice ? (course.price || 0) : 0
  const discountPercent =
    originalPrice > 0 ? Math.max(0, Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)) : 0

  const rawThumbnail =
    (course.thumbnail && course.thumbnail.trim()) ||
    (course.thumbnail_url && course.thumbnail_url.trim()) ||
    ''
  const thumbnailSrc =
    rawThumbnail !== ''
      ? rawThumbnail
      : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden space-y-5 transition-all duration-200">
      <div
        onClick={onOpenPreview}
        className="relative aspect-video w-full overflow-hidden cursor-pointer group bg-slate-950"
      >
        <img
          src={thumbnailSrc}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-75"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex flex-col items-center justify-center gap-2">
          <div className="w-16 h-16 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 fill-slate-900 ml-1" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide drop-shadow-md">
            Xem trước khóa học này
          </span>
        </div>
      </div>

      <div className="p-6 pt-0 space-y-5">
        <div className="space-y-1">
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {effectivePrice > 0 ? `₫${effectivePrice.toLocaleString('vi-VN')}` : 'Miễn phí'}
            </span>
            {originalPrice > effectivePrice && (
              <span className="text-sm text-slate-400 line-through font-semibold">
                ₫{originalPrice.toLocaleString('vi-VN')}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                Giảm {discountPercent}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-rose-500 font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>Còn 23 giờ để được hưởng mức giá ưu đãi này!</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onEnrollOrBuy}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Mua ngay / Đăng ký học</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAddToCart}
              disabled={isAddingToCart || isInCart}
              className={`flex-1 py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isInCart
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-300 dark:border-slate-700 hover:border-indigo-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-indigo-600'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isInCart ? 'Đã có trong giỏ hàng' : 'Thêm vào giỏ hàng'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Sao chép liên kết chia sẻ khóa học"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          {isCopied && (
            <p className="text-[11px] text-center text-emerald-600 dark:text-emerald-400 font-semibold">
              Đã sao chép liên kết khóa học!
            </p>
          )}
        </div>

        <div className="text-center text-[11px] text-slate-400 font-medium space-y-1">
          <p>Đảm bảo hoàn tiền trong 30 ngày nếu không hài lòng</p>
          <p>Quyền truy cập đầy đủ suốt đời</p>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Khóa học này bao gồm:
          </h4>

          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-2.5">
              <Video className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{course.duration || '24 giờ'} video bài giảng theo yêu cầu</span>
            </li>
            <li className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{course.totalLessons || 20} bài học & cẩm nang học tập độc quyền</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Học trực tuyến trên máy tính và điện thoại di động</span>
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Kiểm tra chặng chương học & Bài thi tốt nghiệp</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Cấp giấy chứng nhận hoàn thành khóa học điện tử</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
