'use client'

/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (portal)/cart
 */

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Trash2, ArrowLeft, ShieldCheck, Award, Zap, CheckCircle2, Loader2 } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { useCartStore } from '@/store/cart-store'
import { useAuthStore } from '@/store/auth-store'
import { useEnrollmentStore } from '@/store/enrollment-store'
import { courseService } from '@/services/course.service'
import { CourseCheckoutModal, type CheckoutCourseItem } from '@/components/course/CourseCheckoutModal'
import { toast } from '@/store/toast-store'
import { useNavigate } from '@/lib/navigation'

export default function CartPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const cart = useCartStore((state) => state.cart)
  const isLoading = useCartStore((state) => state.isLoading)
  const fetchCart = useCartStore((state) => state.fetchCart)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const clearCart = useCartStore((state) => state.clearCart)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isAuthenticated && mounted) {
      navigate('/courses')
      return
    }
    if (isAuthenticated) {
      fetchCart()
    }
  }, [isAuthenticated, mounted])

  const items = cart?.items || []

  const originalTotal = items.reduce((acc, it) => {
    const rawPrice = it.price || 0
    const rawDiscount = it.discount_price || 0
    if (rawDiscount > 0 && rawDiscount < rawPrice) {
      return acc + rawPrice
    }
    return acc + (rawPrice > 0 ? rawPrice : rawDiscount)
  }, 0)

  const finalTotal = items.reduce((acc, it) => {
    const rawPrice = it.price || 0
    const rawDiscount = it.discount_price || 0
    if (rawDiscount > 0 && rawDiscount < rawPrice) {
      return acc + rawDiscount
    }
    return acc + (rawPrice > 0 ? rawPrice : rawDiscount)
  }, 0)

  const savings = Math.max(0, originalTotal - finalTotal)

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoCode.trim()) return
    if (promoCode.trim().toUpperCase() === 'LINGO50') {
      setAppliedPromo('LINGO50')
      toast.success(
        isVi ? 'Đã áp dụng mã giảm giá LINGO50 thành công!' : 'Applied promo code LINGO50 successfully!',
        isVi ? 'Khuyến mãi' : 'Promo code'
      )
    } else {
      toast.error(
        isVi ? 'Mã giảm giá không hợp lệ hoặc đã hết hạn.' : 'Invalid or expired promo code.',
        isVi ? 'Khuyến mãi' : 'Promo code'
      )
    }
  }

  const handleCheckout = () => {
    if (items.length === 0) return
    setShowCheckoutModal(true)
  }

  const checkoutCourses: CheckoutCourseItem[] = items.map((it) => {
    const rawPrice = it.price || 0
    const rawDiscount = it.discount_price || 0
    const effectivePrice = rawDiscount > 0 && rawDiscount < rawPrice ? rawDiscount : (rawPrice > 0 ? rawPrice : rawDiscount)
    return {
      id: it.course_id,
      title: it.title,
      price: effectivePrice,
      thumbnail: (it as unknown as { thumbnail?: string })?.thumbnail || it.thumbnail_url,
    }
  })

  if (!mounted) {
    return (
      <Layout>
        <div className="min-h-screen bg-background text-text-primary px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="flex items-center justify-between border-b border-border pb-5">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-surface-subtle rounded-lg" />
              <div className="h-8 w-64 bg-surface-hover rounded-xl" />
            </div>
            <div className="h-5 w-24 bg-surface-subtle rounded-lg" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-28 bg-surface rounded-2xl border border-border" />
              <div className="h-28 bg-surface rounded-2xl border border-border" />
            </div>
            <div className="h-64 bg-surface rounded-2xl border border-border" />
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background text-text-primary px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-border pb-5">
          <div className="space-y-1">
            <button
              onClick={() => navigate('/courses')}
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors cursor-pointer mb-2"
            >
              <ArrowLeft size={14} />
              <span suppressHydrationWarning>{isVi ? 'Tiếp tục xem khóa học' : 'Continue shopping'}</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary flex items-center gap-3 font-serif">
              <ShoppingCart className="text-purple-600 dark:text-purple-400" size={28} />
              <span suppressHydrationWarning>{isVi ? 'Giỏ hàng của bạn' : 'Shopping Cart'}</span>
            </h1>
          </div>
          <div className="text-sm font-semibold text-text-secondary" suppressHydrationWarning>
            {items.length} {isVi ? 'khóa học trong giỏ' : 'courses in cart'}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-dashed border-border bg-surface/40 p-8 space-y-4 max-w-xl mx-auto">
            <div className="h-16 w-16 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
              <ShoppingCart size={32} />
            </div>
            <h2 className="text-lg font-bold text-text-primary">
              {isVi ? 'Giỏ hàng của bạn đang trống' : 'Your cart is empty'}
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed max-w-md mx-auto">
              {isVi
                ? 'Hãy khám phá các khóa học TOEIC 2 kỹ năng và 4 kỹ năng chất lượng cao từ đội ngũ chuyên gia để bắt đầu hành trình học tập!'
                : 'Explore our comprehensive TOEIC courses and master English today!'}
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="mt-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-6 py-3 transition-colors shadow-md cursor-pointer"
            >
              {isVi ? 'Khám phá khóa học ngay' : 'Explore Courses Now'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-text-tertiary px-1">
                <span>{isVi ? 'Chi tiết khóa học' : 'Course Details'}</span>
                <button
                  onClick={() => clearCart()}
                  className="text-red-500 hover:underline cursor-pointer"
                >
                  {isVi ? 'Xóa tất cả' : 'Clear all'}
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item) => {
                  const rawPrice = item.price || 0
                  const rawDiscount = item.discount_price || 0
                  const hasDiscount = rawDiscount > 0 && rawDiscount < rawPrice
                  const itemSalePrice = hasDiscount ? rawDiscount : (rawPrice > 0 ? rawPrice : rawDiscount)
                  const itemOriginalPrice = hasDiscount ? rawPrice : null

                  return (
                    <div
                      key={item.course_id}
                      className="rounded-2xl border border-border/80 bg-surface p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center transition-all hover:shadow-sm"
                    >
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <img
                          src={
                            item.thumbnail_url ||
                            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600'
                          }
                          alt={item.title}
                          className="h-20 w-32 rounded-xl object-cover shrink-0 border border-border/60"
                        />
                        <div className="space-y-1 min-w-0 flex-1">
                          <h3
                            onClick={() => navigate(`/course/${item.course_id}`)}
                            className="text-sm font-bold text-text-primary line-clamp-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer leading-snug"
                          >
                            {item.title}
                          </h3>
                          <div className="text-xs text-text-tertiary">
                            {item.instructor_name || 'LingoSphere Academic Team'}
                          </div>
                          <div className="flex items-center gap-3 pt-1 text-[11px] text-text-secondary">
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 size={12} />
                              {isVi ? 'Truy cập trọn đời' : 'Lifetime access'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 border-t sm:border-t-0 border-border/40 pt-2 sm:pt-0">
                        <div className="flex sm:flex-col items-baseline sm:items-end gap-1.5">
                          <span className="text-base font-extrabold text-text-primary">
                            {itemSalePrice > 0
                              ? `₫${itemSalePrice.toLocaleString('vi-VN')}`
                              : isVi
                              ? 'Miễn phí'
                              : 'Free'}
                          </span>
                          {itemOriginalPrice && (
                            <span className="text-xs text-text-tertiary line-through">
                              ₫{itemOriginalPrice.toLocaleString('vi-VN')}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => removeFromCart(item.course_id)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                          title={isVi ? 'Xóa khỏi giỏ hàng' : 'Remove from cart'}
                        >
                          <Trash2 size={14} />
                          <span className="text-[11px] font-semibold">{isVi ? 'Xóa' : 'Remove'}</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-6">
                <h2 className="text-base font-bold text-text-primary border-b border-border pb-3">
                  {isVi ? 'Tóm tắt đơn hàng' : 'Order Summary'}
                </h2>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-text-secondary">
                    <span>{isVi ? 'Tổng giá gốc:' : 'Original Price:'}</span>
                    <span>₫{originalTotal.toLocaleString('vi-VN')}</span>
                  </div>

                  {savings > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>{isVi ? 'Giảm giá ưu đãi:' : 'Discount Savings:'}</span>
                      <span>-₫{savings.toLocaleString('vi-VN')}</span>
                    </div>
                  )}

                  {appliedPromo && (
                    <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 font-semibold">
                      <span>{isVi ? 'Mã LINGO50 (-50%):' : 'Promo LINGO50 (-50%):'}</span>
                      <span>-₫{Math.round(finalTotal * 0.5).toLocaleString('vi-VN')}</span>
                    </div>
                  )}

                  <div className="border-t border-border pt-3 flex items-baseline justify-between text-sm font-bold text-text-primary">
                    <span>{isVi ? 'Tổng thanh toán:' : 'Total Amount:'}</span>
                    <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
                      ₫
                      {(appliedPromo ? Math.round(finalTotal * 0.5) : finalTotal).toLocaleString(
                        'vi-VN'
                      )}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleApplyPromo} className="space-y-2 pt-2 border-t border-border">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                    {isVi ? 'Mã ưu đãi (Coupon code)' : 'Coupon code'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="LINGO50"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:border-purple-600 focus:outline-none uppercase font-mono font-bold"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-surface-hover border border-border px-3.5 py-2 text-xs font-bold text-text-primary hover:bg-border transition-colors cursor-pointer"
                    >
                      {isVi ? 'Áp dụng' : 'Apply'}
                    </button>
                  </div>
                </form>

                <button
                  onClick={handleCheckout}
                  disabled={items.length === 0}
                  className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm py-3.5 transition-all shadow-md shadow-purple-600/20 hover:shadow-purple-600/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Zap size={16} />
                  <span>{isVi ? 'Thanh toán chuyển khoản VietQR' : 'Proceed to VietQR Checkout'}</span>
                </button>
              </div>

              <div className="rounded-2xl border border-border/80 bg-surface/50 p-5 space-y-3 text-xs text-text-secondary">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                  <span>{isVi ? 'Bảo đảm hoàn tiền trong 30 ngày nếu không hài lòng' : '30-Day Money-Back Guarantee'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Award size={16} className="text-amber-500 shrink-0" />
                  <span>{isVi ? 'Cấp chứng chỉ điện tử hoàn thành khóa học' : 'Certificate of Completion included'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VietQR Bank Transfer Course Checkout Modal */}
      {showCheckoutModal && (
        <CourseCheckoutModal
          open={showCheckoutModal}
          onOpenChange={setShowCheckoutModal}
          courses={checkoutCourses}
          onSuccess={() => {
            navigate('/courses')
          }}
        />
      )}
    </Layout>
  )
}
