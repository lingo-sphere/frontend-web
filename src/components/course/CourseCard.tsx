'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Play,
  MoreVertical,
  Heart,
  Share2,
  ListPlus,
  Archive,
  Star,
  Check,
  Loader2,
} from 'lucide-react'
import type { CourseCardData } from '@/types/course'
import { useAuthStore } from '@/store/auth-store'
import { useCartStore } from '@/store/cart-store'
import { useNavigate } from '@/lib/navigation'

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
  const { isAuthenticated } = useAuthStore()
  const { addToCart, isInCart } = useCartStore()
  const [isAdding, setIsAdding] = useState(false)
  const isAlreadyInCart = isInCart(course.id)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      alert(isVi ? 'Vui lòng đăng nhập để thêm khóa học vào giỏ hàng!' : 'Please sign in to add courses to your cart!')
      return
    }
    if (isAlreadyInCart) {
      navigate('/cart')
      return
    }
    setIsAdding(true)
    const result = await addToCart(course.id)
    setIsAdding(false)
    if (result.success) {
      alert(isVi ? 'Đã thêm khóa học vào giỏ hàng thành công!' : 'Course added to cart successfully!')
    } else {
      alert(result.message || (isVi ? 'Không thể thêm vào giỏ hàng' : 'Failed to add to cart'))
    }
  }

  return (
    <div
      onClick={() => onClick(course.id)}
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

          <div className="absolute right-2.5 top-2.5 z-10">
            <button
              onClick={(e) => onToggleMenu(course.id, e)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-text-primary shadow-sm backdrop-blur-sm hover:bg-white transition-colors"
              title={isVi ? 'Tùy chọn' : 'Options'}
            >
              <MoreVertical size={14} />
            </button>

            {isMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-8 w-44 rounded-xl border border-border bg-surface p-1.5 shadow-xl z-20 space-y-1 text-xs text-text-primary animate-in fade-in duration-150"
              >
                <button
                  onClick={(e) => onToggleWishlist(course.id, e)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-surface-hover transition-colors text-left"
                >
                  <Heart size={13} className={isFavorite ? 'text-red-500 fill-red-500' : ''} />
                  <span>
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
                  onClick={() => {
                    navigator.clipboard.writeText(
                      window.location.origin + `/course/${course.id}`
                    )
                    onCloseMenu()
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-surface-hover transition-colors text-left"
                >
                  <Share2 size={13} />
                  <span>{isVi ? 'Chia sẻ khóa học' : 'Share course'}</span>
                </button>
                <button
                  onClick={onCloseMenu}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-surface-hover transition-colors text-left"
                >
                  <ListPlus size={13} />
                  <span>{isVi ? 'Tạo danh sách mới' : 'Add to list'}</span>
                </button>
                <button
                  onClick={onCloseMenu}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-surface-hover transition-colors text-left text-text-tertiary"
                >
                  <Archive size={13} />
                  <span>{isVi ? 'Lưu trữ' : 'Archive'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="line-clamp-2 text-sm sm:text-[15px] font-bold text-text-primary group-hover:text-primary transition-colors leading-snug">
            {course.title}
          </h3>
          <p className="text-xs text-text-secondary line-clamp-1 leading-relaxed">
            {course.description || course.title}
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
          <span className="text-[15px] font-extrabold text-text-primary">
            {course.price > 0
              ? `₫${course.price.toLocaleString('vi-VN')}`
              : isVi
              ? 'Miễn phí'
              : 'Free'}
          </span>
          {course.discountPrice && course.discountPrice > course.price ? (
            <span className="text-xs text-text-tertiary line-through font-normal">
              ₫{course.discountPrice.toLocaleString('vi-VN')}
            </span>
          ) : null}
        </div>

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
      </div>
    </div>
  )
}
