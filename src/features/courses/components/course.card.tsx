// Component hiển thị thẻ khóa học theo phong cách thiết kế hiện đại có hỗ trợ trạng thái tương tác và xem trước.
'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { useMounted } from '@/hooks/use.mounted'
import {
  Play,
  MoreVertical,
  Heart,
  Star,
  Check,
  Loader2,
  Tv,
  Clock,
  BarChart2,
  Users,
  Sparkles,
} from 'lucide-react'
import type { CourseCardData } from '@/features/courses/types/course'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useCart } from '@/features/cart/hooks/use.cart.query'
import { prefetchCourseDetail, useUserEnrollments } from '@/features/courses/hooks/use.courses.query'
import { toast } from '@/store/toast.store'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useNavigate } from '@/lib/navigation'
import { buildCourseUrl } from '@/features/courses/lib/course.url'
import { resolveMediaUrl } from '@/utils/media.utils'
import { formatCurrency, formatNumber } from '@/lib/format'
import { storage, STORAGE_KEYS } from '@/lib/storage'

interface CourseCardProps {
  course: CourseCardData
  isFavorite: boolean
  isMenuOpen: boolean
  onToggleMenu: (courseId: string, e: React.MouseEvent) => void
  onToggleWishlist: (courseId: string, e: React.MouseEvent) => void
  onClick: (courseId: string) => void
  onCloseMenu: () => void
}

export function CourseCard({
  course,
  isFavorite,
  isMenuOpen,
  onToggleMenu,
  onToggleWishlist,
  onClick,
  onCloseMenu,
}: CourseCardProps) {
  const { i18n } = useTranslation()
  const mounted = useMounted()
  const isVi = mounted ? i18n.language === 'vi' : true
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { addToCart, isInCart } = useCart(isAuthenticated)
  const { isEnrolled: checkEnrolled } = useUserEnrollments(isAuthenticated)
  const isEnrolled = checkEnrolled(course.id) || (course.slug ? checkEnrolled(course.slug) : false)
  const isPremiumUser = Boolean(user?.is_premium)
  const isPrivilegedUser = user?.role === 'INSTRUCTOR'
  const isAlreadyEnrolled = isEnrolled || isPremiumUser || isPrivilegedUser
  const [isAdding, setIsAdding] = useState(false)
  const isAlreadyInCart = isInCart(course.id)
  const queryClient = useQueryClient()
  const menuRef = useRef<HTMLDivElement>(null)

  const handlePrefetch = () => {
    if (course.id) {
      prefetchCourseDetail(queryClient, course.id)
    }
  }

  useEffect(() => {
    if (!isMenuOpen) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onCloseMenu()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseMenu()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen, onCloseMenu])

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.warning(
        isVi
          ? 'Vui lòng đăng nhập để lưu khóa học vào danh sách yêu thích!'
          : 'Please sign in to add courses to your wishlist!',
        isVi ? 'Yêu cầu đăng nhập' : 'Authentication required'
      )
      onCloseMenu()
      return
    }
    onToggleWishlist(course.id, e)
    onCloseMenu()
  }

  const handleShareFacebook = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCloseMenu()
    const courseUrl = typeof window !== 'undefined' ? `${window.location.origin}${buildCourseUrl(course)}` : ''
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(courseUrl)}`
    window.open(fbShareUrl, '_blank', 'noopener,noreferrer,width=620,height=580')
  }

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation()
    onCloseMenu()
    const courseUrl = typeof window !== 'undefined' ? `${window.location.origin}${buildCourseUrl(course)}` : ''
    try {
      await navigator.clipboard.writeText(courseUrl)
      toast.success(
        isVi ? 'Đã sao chép liên kết khóa học!' : 'Course link copied!',
        isVi ? 'Chia sẻ' : 'Share'
      )
    } catch {
      toast.info(courseUrl)
    }
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isAlreadyEnrolled) {
      const cid = course.id
      if (cid && typeof window !== 'undefined') {
        try {
          storage.cookie.set(STORAGE_KEYS.COURSE_ENROLLED(cid), 'true', { days: 30, path: '/' })
          localStorage.setItem(STORAGE_KEYS.COURSE_ENROLLED(cid), 'true')
        } catch {}
      }
      navigate(buildCourseUrl(course))
      return
    }
    if (!isAuthenticated) {
      toast.warning(
        isVi ? 'Vui lòng đăng nhập để thêm khóa học vào giỏ hàng!' : 'Please sign in to add courses to your cart!',
        isVi ? 'Yêu cầu đăng nhập' : 'Authentication required'
      )
      return
    }
    if (isAlreadyInCart) {
      navigate('/cart')
      return
    }
    setIsAdding(true)
    try {
      await addToCart(course.id)
      toast.success(
        isVi ? 'Đã thêm khóa học vào giỏ hàng thành công!' : 'Course added to cart successfully!',
        isVi ? 'Giỏ hàng' : 'Shopping Cart'
      )
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : isVi ? 'Không thể thêm vào giỏ hàng' : 'Failed to add to cart'
      toast.error(msg, isVi ? 'Lỗi' : 'Error')
    } finally {
      setIsAdding(false)
    }
  }

  const discountPercent =
    course.discountPrice && course.discountPrice > course.price
      ? Math.round(((course.discountPrice - course.price) / course.discountPrice) * 100)
      : 0

  const levelLabel =
    course.targetScore && course.targetScore > 0
      ? `${course.targetScore}+ TOEIC`
      : course.category === 'TOEIC_4_SKILLS'
        ? isVi ? 'Nâng cao' : 'Advanced'
        : isVi ? 'Căn bản' : 'Beginner'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(course.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(course.id)
        }
      }}
      onMouseEnter={handlePrefetch}
      className="group relative flex flex-col justify-between rounded-[20px] border border-border/80 bg-white dark:bg-card shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-indigo-500/40 dark:hover:border-indigo-500/40 cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-[20px] bg-slate-100 dark:bg-zinc-900">
        <Link
          href={buildCourseUrl(course)}
          onClick={(e) => e.stopPropagation()}
          className="relative h-full w-full block overflow-hidden"
        >
          <img
            src={resolveMediaUrl(course.thumbnail)}
            alt={course.title}
            loading="lazy"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'
            }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-indigo-600 shadow-xl transition-all duration-300 scale-90 group-hover:scale-100">
              <Play size={18} className="ml-0.5 fill-indigo-600 text-indigo-600" />
            </div>
          </div>
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          <span className="inline-flex items-center rounded-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 shadow-xs border border-white/40">
            {course.badge || (course.category === 'TOEIC_4_SKILLS' ? 'TOEIC 4 Kỹ Năng' : 'TOEIC 2 Kỹ Năng')}
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 text-white px-2.5 py-0.5 text-[10px] font-bold shadow-xs">
            <Sparkles size={10} className="fill-white" />
            <span>{course.is_bestseller ? (isVi ? 'Bán chạy nhất' : 'Bestseller') : 'All-Access Monthly'}</span>
          </span>
        </div>

        {discountPercent > 0 ? (
          <div className="pointer-events-none absolute right-3 top-3 z-10">
            <span className="inline-flex items-center rounded-full bg-rose-500 text-white px-2.5 py-0.5 text-[11px] font-black shadow-xs tracking-tight">
              -{discountPercent}%
            </span>
          </div>
        ) : course.targetScore ? (
          <div className="pointer-events-none absolute right-3 top-3 z-10">
            <span className="inline-flex items-center rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-bold shadow-xs">
              Target {course.targetScore}+
            </span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleWishlistClick}
          className="absolute left-3 bottom-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md shadow-md text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:scale-110 active:scale-95 transition-all cursor-pointer"
          title={isFavorite ? (isVi ? 'Bỏ yêu thích' : 'Remove from wishlist') : (isVi ? 'Thêm vào yêu thích' : 'Add to wishlist')}
          aria-label={isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
        >
          <Heart
            size={15}
            className={`transition-colors ${
              isFavorite ? 'text-rose-500 fill-rose-500' : 'text-slate-600 dark:text-slate-300'
            }`}
          />
        </button>

        <div ref={menuRef} className="absolute right-3 bottom-3 z-20">
          <button
            type="button"
            onClick={(e) => onToggleMenu(course.id, e)}
            className={`flex h-8 w-8 items-center justify-center rounded-full shadow-md backdrop-blur-md transition-all cursor-pointer ${
              isMenuOpen
                ? 'bg-indigo-600 text-white'
                : 'bg-white/95 text-slate-600 hover:bg-white hover:text-slate-900 dark:bg-zinc-900/90 dark:text-slate-300 dark:hover:bg-zinc-800'
            }`}
            title={isVi ? 'Tùy chọn' : 'Options'}
            aria-expanded={isMenuOpen}
          >
            <MoreVertical size={14} />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -6 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bottom-10 w-48 origin-bottom-right rounded-xl border border-border/80 bg-surface/95 backdrop-blur-md p-1.5 shadow-2xl z-30 space-y-1 text-xs text-text-primary ring-1 ring-black/5 dark:ring-white/10"
              >
                <button
                  type="button"
                  onClick={handleWishlistClick}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-surface-hover transition-colors text-left cursor-pointer group/item"
                >
                  <Heart
                    size={14}
                    className={`transition-transform duration-200 group-hover/item:scale-110 ${
                      isFavorite ? 'text-rose-500 fill-rose-500' : 'text-text-secondary group-hover/item:text-rose-500'
                    }`}
                  />
                  <span className={isFavorite ? 'font-semibold text-rose-500' : 'font-medium'}>
                    {isFavorite
                      ? isVi
                        ? 'Bỏ yêu thích'
                        : 'Remove from wishlist'
                      : isVi
                      ? 'Thêm yêu thích'
                      : 'Add to wishlist'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleShareFacebook}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-surface-hover transition-colors text-left cursor-pointer group/item text-text-primary"
                >
                  <svg
                    className="w-3.5 h-3.5 shrink-0 fill-[#1877F2] transition-transform duration-200 group-hover/item:scale-110"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="font-medium">{isVi ? 'Chia sẻ Facebook' : 'Share on Facebook'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-surface-hover transition-colors text-left cursor-pointer group/item text-text-primary"
                >
                  <svg
                    className="w-3.5 h-3.5 shrink-0 fill-none stroke-current"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <span className="font-medium">{isVi ? 'Sao chép liên kết' : 'Copy link'}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="text-xs font-black text-slate-800 dark:text-slate-100">
              {course.rating.toFixed(1)}
            </span>
          </div>

          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span suppressHydrationWarning>{formatNumber(course.students)}</span> {isVi ? 'học viên' : 'students'}
          </span>
        </div>

        <div>
          <h3 className="text-[15px] sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 leading-snug">
            {course.title}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] overflow-hidden flex-shrink-0">
            <Users size={12} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300 line-clamp-1">
            {course.instructor}
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Tv size={13} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <span>{course.totalLessons} {isVi ? 'bài giảng' : 'lessons'}</span>
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Clock size={13} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <span>{course.duration}</span>
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <BarChart2 size={13} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <span>{levelLabel}</span>
          </span>
        </div>

        <div className="mt-2 pt-3.5 border-t border-border/50 flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check size={12} className="text-emerald-600 dark:text-emerald-400 stroke-[3] flex-shrink-0" />
              <span className="whitespace-nowrap">
                {isAlreadyEnrolled
                  ? isPremiumUser
                    ? isVi ? 'Mở khóa qua VIP' : 'VIP Access'
                    : isVi ? 'Đã sở hữu' : 'Enrolled'
                  : isVi ? 'Kèm theo tài liệu & đề thi' : 'Free with All-Access'}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5">
              {isAlreadyEnrolled ? (
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  {isVi ? 'Đã kích hoạt' : 'Activated'}
                </span>
              ) : (
                <>
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white whitespace-nowrap">
                    {formatCurrency(course.price, isVi ? 'Miễn phí' : 'Free')}
                  </span>
                  {course.discountPrice && course.discountPrice > course.price ? (
                    <span className="text-xs text-slate-400 line-through font-medium whitespace-nowrap">
                      {formatCurrency(course.discountPrice)}
                    </span>
                  ) : null}
                </>
              )}
            </div>
          </div>

          {isAlreadyEnrolled ? (
            <button
              type="button"
              onClick={handleAddToCart}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:shadow-emerald-500/25 whitespace-nowrap flex-shrink-0 cursor-pointer active:scale-95"
            >
              <Play size={11} className="fill-white flex-shrink-0" />
              <span>{isVi ? 'Vào học' : 'Learn'}</span>
            </button>
          ) : isAlreadyInCart ? (
            <button
              type="button"
              onClick={handleAddToCart}
              className="rounded-xl border border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs whitespace-nowrap flex-shrink-0 cursor-pointer active:scale-95"
            >
              <Check size={12} className="flex-shrink-0" />
              <span>{isVi ? 'Đã trong giỏ' : 'In Cart'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding}
              className="rounded-xl border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs whitespace-nowrap flex-shrink-0 cursor-pointer active:scale-95"
            >
              {isAdding ? (
                <Loader2 size={12} className="animate-spin flex-shrink-0" />
              ) : (
                <span>{isVi ? 'Xem' : 'View'}</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
