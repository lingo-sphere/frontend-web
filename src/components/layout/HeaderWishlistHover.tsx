'use client'

/**
 * @file HeaderWishlistHover.tsx
 * @description Component giao diện React HeaderWishlistHover cho học viên
 */

import { useTranslation } from 'react-i18next'
import { Heart } from 'lucide-react'
import { useNavigate } from '@/lib/navigation'
import { useWishlistStore } from '@/store/wishlist-store'
import { useCartStore } from '@/store/cart-store'
import { useAuthStore } from '@/store/auth-store'
import { useEnrollmentStore } from '@/store/enrollment-store'
import { toast } from '@/store/toast-store'

export function HeaderWishlistHover() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()
  const { items } = useWishlistStore()
  const { addToCart, isInCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const isEnrolled = useEnrollmentStore((state) => state.isEnrolled)
  const isPremiumUser = Boolean(user?.is_premium)
  const isPrivilegedUser = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR'

  const handleAddToCart = async (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation()
    const hasAccess = isEnrolled(courseId) || isPremiumUser || isPrivilegedUser
    if (hasAccess) {
      navigate(`/course/${courseId}`)
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
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-[350px] rounded-2xl border border-border bg-surface shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-left">
      {items.length === 0 ? (
        <div className="p-8 text-center space-y-3">
          <Heart size={28} className="mx-auto text-text-tertiary" />
          <p className="text-xs text-text-secondary">
            {isVi ? 'Danh sách yêu thích của bạn đang trống.' : 'Your wishlist is empty.'}
          </p>
          <button
            onClick={() => navigate('/courses')}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            {isVi ? 'Khám phá khóa học' : 'Explore courses'}
          </button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border/60 max-h-[380px] overflow-y-auto">
            {items.map((course) => {
              const inCart = isInCart(course.id)
              return (
                <div
                  key={course.id}
                  onClick={() => navigate(`/course/${course.id}`)}
                  className="p-3.5 hover:bg-surface-subtle transition-colors cursor-pointer space-y-2 group"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-14 w-14 rounded-xl object-cover shrink-0 border border-border/60"
                    />
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <h4 className="text-xs font-bold text-text-primary line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {course.title}
                      </h4>
                      <p className="text-[10px] text-text-tertiary line-clamp-1">
                        {course.instructor}
                      </p>
                      <div className="flex items-baseline gap-1.5 pt-0.5">
                        <span className="text-xs font-extrabold text-text-primary">
                          ₫{(course.price || 399000).toLocaleString('vi-VN')}
                        </span>
                        {course.discountPrice && (
                          <span className="text-[10px] text-text-tertiary line-through">
                            ₫{course.discountPrice.toLocaleString('vi-VN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isEnrolled(course.id) || isPremiumUser || isPrivilegedUser ? (
                    <button
                      onClick={(e) => handleAddToCart(e, course.id)}
                      className="w-full rounded-lg bg-primary hover:bg-primary-hover text-white py-1.5 text-xs font-bold transition-colors cursor-pointer text-center shadow-xs"
                    >
                      {isVi ? 'Vào học' : 'Learn Now'}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleAddToCart(e, course.id)}
                      className={`w-full rounded-lg border py-1.5 text-xs font-bold transition-colors cursor-pointer text-center ${
                        inCart
                          ? 'border-emerald-600 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                          : 'border-primary text-primary hover:bg-primary/10'
                      }`}
                    >
                      {inCart ? (isVi ? 'Đã trong giỏ' : 'In Cart') : 'Add to cart'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="p-3 border-t border-border bg-surface-subtle/30">
            <button
              onClick={() => navigate('/courses?tab=wishlist')}
              className="w-full rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs py-2.5 transition-colors shadow-sm shadow-primary/20 cursor-pointer"
            >
              {isVi ? 'Đến danh sách yêu thích' : 'Go to wishlist'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
