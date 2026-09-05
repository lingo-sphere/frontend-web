/**
 * @file header.wishlist.tsx
 * @description Thành phần Header Wishlist phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file HeaderWishlistHover.tsx
 * @description Dropdown danh sách khóa học yêu thích trên Header với giao diện hiện đại, tinh tế
 */

import { useTranslation } from 'react-i18next'
import { Heart, ShoppingCart, Check, X, ArrowRight, ChevronRight } from 'lucide-react'
import { useNavigate } from '@/lib/navigation'
import { useWishlistStore } from '@/store/wishlist.store'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore } from '@/store/auth.store'
import { useEnrollmentStore } from '@/store/enrollment.store'
import { toast } from '@/store/toast.store'
import { buildCourseUrl } from '@/lib/course.url'

export function HeaderWishlistHover() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()
  const { items, removeItem } = useWishlistStore()
  const { addToCart, isInCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const isEnrolled = useEnrollmentStore((state) => state.isEnrolled)
  const isPremiumUser = Boolean(user?.is_premium)
  const isPrivilegedUser = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR'

  const formatPrice = (price?: number) => {
    if (!price || price === 0) return isVi ? 'Miễn phí' : 'Free'
    return `₫${price.toLocaleString('vi-VN')}`
  }

  const handleAddToCart = async (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation()
    const hasAccess = isEnrolled(courseId) || isPremiumUser || isPrivilegedUser
    if (hasAccess) {
      const courseItem = items.find((c) => c.id === courseId)
      navigate(courseItem ? buildCourseUrl(courseItem) : `/course/${courseId}`)
      return
    }
    if (!isAuthenticated) {
      toast.warning(
        isVi ? 'Vui lòng đăng nhập để thêm vào giỏ hàng!' : 'Please sign in to add to cart!',
        isVi ? 'Yêu cầu đăng nhập' : 'Authentication required'
      )
      return
    }
    if (isInCart(courseId)) {
      navigate('/cart')
      return
    }
    await addToCart(courseId)
    toast.success(
      isVi ? 'Đã thêm vào giỏ hàng!' : 'Added to cart!',
      isVi ? 'Giỏ hàng' : 'Shopping Cart'
    )
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-[360px] rounded-2xl border border-border bg-surface shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-left">
      <div className="px-4 py-2.5 bg-surface-subtle/50 border-b border-border/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart size={15} className="text-red-500 fill-red-500" />
          <span className="text-xs font-bold text-text-primary">
            {isVi ? 'Khóa học yêu thích' : 'Wishlist'}
          </span>
          {items.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              {items.length}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={() => navigate('/courses?tab=wishlist')}
            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>{isVi ? 'Xem tất cả' : 'View all'}</span>
            <ChevronRight size={13} />
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-8 px-6 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <Heart size={22} />
          </div>
          <p className="text-xs text-text-secondary font-medium">
            {isVi ? 'Danh sách yêu thích của bạn đang trống.' : 'Your wishlist is empty.'}
          </p>
          <button
            onClick={() => navigate('/courses')}
            className="text-xs font-bold text-primary hover:underline cursor-pointer block mx-auto"
          >
            {isVi ? 'Khám phá khóa học ngay →' : 'Explore courses now →'}
          </button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border/40 max-h-[340px] overflow-y-auto">
            {items.map((course) => {
              const inCart = isInCart(course.id)
              const hasAccess = isEnrolled(course.id) || isPremiumUser || isPrivilegedUser

              return (
                <div
                  key={course.id}
                  onClick={() => navigate(buildCourseUrl(course))}
                  className="p-3 hover:bg-surface-subtle/70 transition-colors cursor-pointer group relative flex items-start gap-3"
                >
                  <img
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'}
                    alt={course.title}
                    className="h-14 w-20 rounded-xl object-cover shrink-0 border border-border/60 shadow-2xs"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-text-primary line-clamp-1 leading-snug group-hover:text-primary transition-colors pr-5">
                      {course.title}
                    </h4>

                    <p className="text-[10px] text-text-tertiary truncate">
                      {course.instructor || 'LingoSphere'}
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <div className="flex items-baseline gap-1.5 min-w-0">
                        <span className="text-xs font-black text-text-primary truncate">
                          {formatPrice(course.price)}
                        </span>
                        {course.discountPrice && course.discountPrice > 0 && (
                          <span className="text-[10px] text-text-tertiary line-through truncate">
                            {formatPrice(course.discountPrice)}
                          </span>
                        )}
                      </div>

                      <div className="shrink-0">
                        {hasAccess ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(buildCourseUrl(course))
                            }}
                            className="h-7 px-2.5 text-[11px] font-bold rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
                          >
                            {isVi ? 'Vào học' : 'Learn'}
                          </button>
                        ) : inCart ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate('/cart')
                            }}
                            className="h-7 px-2.5 text-[11px] font-bold rounded-lg border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-500/10 transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Check size={12} className="stroke-[3]" />
                            <span>{isVi ? 'Đã trong giỏ' : 'In Cart'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handleAddToCart(e, course.id)}
                            className="h-7 px-2.5 text-[11px] font-bold rounded-lg bg-primary text-white hover:bg-primary-hover transition-all cursor-pointer flex items-center gap-1 shadow-2xs shadow-primary/20"
                          >
                            <ShoppingCart size={12} />
                            <span>{isVi ? 'Thêm giỏ' : 'Add'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeItem(course.id)
                      toast.info(
                        isVi ? 'Đã xóa khỏi danh sách yêu thích' : 'Removed from wishlist',
                        isVi ? 'Yêu thích' : 'Wishlist'
                      )
                    }}
                    title={isVi ? 'Bỏ thích' : 'Remove'}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-text-tertiary hover:text-red-500 hover:bg-red-500/10 cursor-pointer absolute top-2.5 right-2.5"
                  >
                    <X size={13} />
                  </button>
                </div>
              )
            })}
          </div>

          <div className="p-3 bg-surface-subtle/40 border-t border-border">
            <button
              onClick={() => navigate('/courses?tab=wishlist')}
              className="w-full h-9 rounded-xl border border-border bg-surface hover:bg-surface-hover hover:border-primary/40 text-text-primary hover:text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <span>{isVi ? 'Đến danh sách yêu thích' : 'Go to Wishlist'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
