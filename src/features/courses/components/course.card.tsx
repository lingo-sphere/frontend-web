/**
 * @file course.card.tsx
 * @description Component giao diện React CourseCard cho học viên
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import {
  Play,
  MoreVertical,
  Heart,
  Star,
  Check,
  Loader2,
  Crown,
} from 'lucide-react'
import type { CourseCardData } from '@/features/courses/types/course'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useCart } from '@/features/cart/hooks/use.cart.query'
import { useEnrollmentStore } from '@/features/courses/store/enrollment.store'
import { toast } from '@/store/toast.store'
import { useQueryClient } from '@tanstack/react-query'
import { courseKeys } from '@/features/courses/keys/course.keys'
import { courseService } from '@/features/courses/services/course.service'
import { useNavigate } from '@/lib/navigation'
import { buildCourseUrl } from '@/features/courses/lib/course.url'

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
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { addToCart, isInCart } = useCart(isAuthenticated)
  const isEnrolled = useEnrollmentStore((state) =>
    state.isEnrolled(course.id) || (course.slug ? state.isEnrolled(course.slug) : false)
  )
  const isPremiumUser = Boolean(user?.is_premium)
  const isPrivilegedUser = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR'
  const isAlreadyEnrolled = isEnrolled || isPremiumUser || isPrivilegedUser
  const [isAdding, setIsAdding] = useState(false)
  const isAlreadyInCart = isInCart(course.id)
  const queryClient = useQueryClient()
  const menuRef = useRef<HTMLDivElement>(null)

  const handlePrefetch = () => {
    if (course.id) {
      queryClient.prefetchQuery({
        queryKey: courseKeys.detail(course.id),
        queryFn: () => courseService.getCourseById(course.id),
        staleTime: 5 * 60 * 1000,
      })
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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isAlreadyEnrolled) {
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

  return (
    <div
      onClick={() => onClick(course.id)}
      onMouseEnter={handlePrefetch}
      className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-surface p-3.5 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-surface-hover cursor-pointer"
    >
      <div>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/5">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover rounded-xl"
          />

          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#2d2f31] shadow-xl">
              <Play size={18} className="ml-1 fill-[#2d2f31]" />
            </div>
          </div>

          {isPremiumUser && (
            <div className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
              <Crown size={11} />
              <span>{isVi ? 'ĐÃ MỞ KHÓA' : 'UNLOCKED'}</span>
            </div>
          )}

          <div ref={menuRef} className="absolute right-2.5 top-2.5 z-20">
            <button
              type="button"
              onClick={(e) => onToggleMenu(course.id, e)}
              className={`flex h-7 w-7 items-center justify-center rounded-lg shadow-sm backdrop-blur-sm transition-all duration-200 cursor-pointer ${
                isMenuOpen
                  ? 'bg-surface text-primary ring-2 ring-primary/20 shadow-md'
                  : 'bg-white/90 text-text-primary hover:bg-white dark:bg-zinc-900/90 dark:hover:bg-zinc-800'
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
                  className="absolute right-0 top-8.5 w-48 origin-top-right rounded-xl border border-border/80 bg-surface/95 backdrop-blur-md p-1.5 shadow-2xl z-30 space-y-1 text-xs text-text-primary ring-1 ring-black/5 dark:ring-white/10"
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
                    <span className="font-medium">{isVi ? 'Chia sẻ qua Facebook' : 'Share on Facebook'}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="line-clamp-2 text-sm sm:text-[15px] font-bold text-text-primary group-hover:text-primary transition-colors leading-snug">
            {course.title}
          </h3>
          <p className="text-xs text-text-secondary line-clamp-1 leading-relaxed">
            {course.description || ''}
          </p>
          <div className="text-[11px] text-text-tertiary line-clamp-1">
            {course.instructor}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-2.5">
          {course.badge && (
            <span className="rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] px-1.5 py-0.5 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50">
              {course.badge}
            </span>
          )}

          <span className="rounded border border-border/80 bg-surface-subtle/50 px-1.5 py-0.5 text-[10px] font-bold text-text-primary flex items-center gap-1">
            <Star size={10} className="text-warning fill-warning" />
            {course.rating.toFixed(1)}
          </span>

          <span className="rounded border border-border/80 bg-surface-subtle/50 px-1.5 py-0.5 text-[10px] font-medium text-text-secondary">
            {course.ratingCount > 0
              ? `${course.ratingCount.toLocaleString('en-US')} ${isVi ? 'đánh giá' : 'ratings'}`
              : isVi ? 'Mới' : 'New'}
          </span>

          <span className="rounded border border-border/80 bg-surface-subtle/50 px-1.5 py-0.5 text-[10px] font-medium text-text-secondary">
            {course.duration}
          </span>

          <span className="rounded border border-border/80 bg-surface-subtle/50 px-1.5 py-0.5 text-[10px] font-medium text-text-secondary">
            {course.totalLessons} {isVi ? 'bài giảng' : 'lectures'}
          </span>

          <span className="rounded border border-border/80 bg-surface-subtle/50 px-1.5 py-0.5 text-[10px] font-medium text-text-secondary">
            {course.level || 'All Levels'}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          {isAlreadyEnrolled ? (
            <span className="text-[13px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check size={14} className="text-emerald-500" />
              {isPremiumUser ? (isVi ? 'Gói Premium VIP' : 'Premium VIP') : (isVi ? 'Đã sở hữu' : 'Enrolled')}
            </span>
          ) : (
            <>
              <span className="text-[15px] font-extrabold text-text-primary">
                {course.price > 0
                  ? `₫${course.price.toLocaleString('vi-VN')}`
                  : isVi
                  ? 'Miễn phí'
                  : 'Free'}
              </span>
              {course.discountPrice && course.discountPrice > course.price ? (
                <span className="text-xs text-text-tertiary line-through font-normal">
                  ₫${course.discountPrice.toLocaleString('vi-VN')}
                </span>
              ) : null}
            </>
          )}
        </div>

        {isAlreadyEnrolled ? (
          <button
            onClick={handleAddToCart}
            className="rounded-lg bg-primary hover:bg-primary-hover px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Play size={12} className="fill-white" />
            <span>{isVi ? 'Vào học' : 'Learn Now'}</span>
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`rounded-lg border px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              isAlreadyInCart
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                : 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30'
            }`}
          >
            {isAdding ? (
              <Loader2 size={13} className="animate-spin" />
            ) : isAlreadyInCart ? (
              <>
                <Check size={13} />
                <span>{isVi ? 'Đã trong giỏ' : 'In Cart'}</span>
              </>
            ) : (
              <span>Add to cart</span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
