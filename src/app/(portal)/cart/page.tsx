// Trang giỏ hàng và thanh toán khóa học của học viên
'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react'
import { useCart } from '@/features/cart/hooks/use.cart.query'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { CourseCheckoutModal, type CheckoutCourseItem } from '@/features/courses/components/course.checkout.modal'
import { CoursePlacementPromptModal } from '@/features/courses/components/course.placement.prompt.modal'
import { toast } from '@/store/toast.store'
import { useNavigate } from '@/lib/navigation'
import { CartItemCard } from '@/features/cart/components/cart.item.card'
import { CartTrustBanner } from '@/features/cart/components/cart.trust.banner'
import { CartOrderSummary } from '@/features/cart/components/cart.order.summary'
import { CartRecommendedSection } from '@/features/cart/components/cart.recommended.section'

export default function CartPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const { cart, removeFromCart, clearCart } = useCart(isAuthenticated)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [showPlacementPromptModal, setShowPlacementPromptModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isAuthenticated && mounted) {
      navigate('/courses')
    }
  }, [isAuthenticated, mounted, navigate])

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
        isVi ? 'Đã áp dụng mã giảm giá LINGO50 (-50%) thành công!' : 'Applied promo code LINGO50 (-50%) successfully!',
        isVi ? 'Khuyến mãi' : 'Promo code'
      )
    } else {
      toast.error(
        isVi ? 'Mã giảm giá không hợp lệ hoặc đã hết hạn.' : 'Invalid or expired promo code.',
        isVi ? 'Khuyến mãi' : 'Promo code'
      )
    }
  }

  const handleQuickApplyPromo = (code: string) => {
    setPromoCode(code)
    if (code.toUpperCase() === 'LINGO50') {
      setAppliedPromo('LINGO50')
      toast.success(
        isVi ? 'Đã áp dụng mã giảm giá LINGO50 (-50%) thành công!' : 'Applied promo code LINGO50 (-50%) successfully!',
        isVi ? 'Khuyến mãi' : 'Promo code'
      )
    }
  }

  const handleCheckout = () => {
    if (items.length === 0) return

    const hasPlacementScore = Boolean(
      (user?.placement_test_score && Number(user.placement_test_score) > 0) ||
      (user?.current_estimated_score && Number(user.current_estimated_score) > 0) ||
      (user?.target_toeic_score && Number(user.target_toeic_score) > 0) ||
      user?.placement_tested_at
    )

    if (!hasPlacementScore) {
      setShowPlacementPromptModal(true)
    } else {
      setShowCheckoutModal(true)
    }
  }

  const checkoutCourses: CheckoutCourseItem[] = items.map((it) => {
    const rawPrice = it.price || 0
    const rawDiscount = it.discount_price || 0
    const effectivePrice =
      rawDiscount > 0 && rawDiscount < rawPrice ? rawDiscount : rawPrice > 0 ? rawPrice : rawDiscount
    return {
      id: it.course_id,
      title: it.title,
      price: effectivePrice,
      thumbnail: (it as unknown as { thumbnail?: string })?.thumbnail || it.thumbnail_url,
    }
  })

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-text-primary px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 w-full max-w-[1536px] mx-auto space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-surface-subtle rounded-lg" />
        <div className="flex items-center justify-between border-b border-border pb-5">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-surface-hover rounded-xl" />
            <div className="h-4 w-96 bg-surface-subtle rounded-lg" />
          </div>
          <div className="h-6 w-32 bg-surface-subtle rounded-lg" />
        </div>
        <div className="h-20 bg-surface rounded-2xl border border-border" />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-4">
            <div className="h-32 bg-surface rounded-2xl border border-border" />
            <div className="h-32 bg-surface rounded-2xl border border-border" />
          </div>
          <div className="xl:col-span-4 h-96 bg-surface rounded-2xl border border-border" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-background text-text-primary px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 w-full max-w-[1536px] mx-auto space-y-6">
        <div className="space-y-4">
          <div>
            <button
              onClick={() => navigate('/courses')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-purple-600 dark:hover:text-purple-400 bg-surface hover:bg-surface-hover px-3.5 py-1.5 rounded-full border border-border transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span suppressHydrationWarning>{isVi ? 'Tiếp tục xem khóa học' : 'Continue shopping'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <ShoppingBag size={24} />
                </div>
                <span suppressHydrationWarning>{isVi ? 'Giỏ hàng của bạn' : 'Shopping Cart'}</span>
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary">
                {isVi
                  ? 'Kiểm tra danh sách khóa học và hoàn tất thanh toán để kích hoạt lộ trình học tập ngay.'
                  : 'Review your selected courses and proceed to checkout to start learning.'}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs border border-purple-500/20 self-start sm:self-auto" suppressHydrationWarning>
              <ShoppingBag size={14} />
              <span>
                {items.length} {isVi ? 'khóa học trong giỏ' : 'courses in cart'}
              </span>
            </div>
          </div>
        </div>

        <CartTrustBanner isVi={isVi} />

        {items.length === 0 ? (
          <div className="space-y-8">
            <div className="py-16 text-center rounded-3xl border border-dashed border-border bg-surface/60 p-8 space-y-4 max-w-2xl mx-auto shadow-xs">
              <div className="h-20 w-20 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto border border-purple-500/20">
                <ShoppingBag size={36} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-text-primary">
                  {isVi ? 'Giỏ hàng của bạn đang trống' : 'Your cart is empty'}
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
                  {isVi
                    ? 'Bạn chưa chọn khóa học nào. Hãy khám phá các lộ trình TOEIC từ mất gốc đến mục tiêu 850+ được biên soạn bởi giảng viên LingoSphere.'
                    : 'Explore our comprehensive TOEIC courses and master English today!'}
                </p>
              </div>
              <button
                onClick={() => navigate('/courses')}
                className="mt-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-6 py-3 transition-colors shadow-md shadow-purple-600/25 cursor-pointer"
              >
                {isVi ? 'Khám phá tất cả khóa học' : 'Explore Courses Now'}
              </button>
            </div>

            <CartRecommendedSection
              currentCartCourseIds={[]}
              isVi={isVi}
              onNavigate={navigate}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            <div className="xl:col-span-8 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-text-secondary px-1">
                  <span>
                    {isVi ? `Danh sách khóa học (${items.length})` : `Selected Courses (${items.length})`}
                  </span>
                  <button
                    onClick={() => clearCart()}
                    className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 hover:underline cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>{isVi ? 'Xóa tất cả' : 'Clear all'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <CartItemCard
                      key={item.course_id}
                      item={item}
                      isVi={isVi}
                      onNavigate={navigate}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              </div>

              <CartRecommendedSection
                currentCartCourseIds={items.map((it) => it.course_id)}
                isVi={isVi}
                onNavigate={navigate}
              />
            </div>

            <div className="xl:col-span-4 xl:sticky xl:top-6 space-y-6">
              <CartOrderSummary
                originalTotal={originalTotal}
                finalTotal={finalTotal}
                savings={savings}
                appliedPromo={appliedPromo}
                promoCode={promoCode}
                itemCount={items.length}
                isVi={isVi}
                onPromoCodeChange={setPromoCode}
                onApplyPromo={handleApplyPromo}
                onQuickApplyPromo={handleQuickApplyPromo}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        )}
      </div>

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

      {showPlacementPromptModal && items.length > 0 && (
        <CoursePlacementPromptModal
          open={showPlacementPromptModal}
          onOpenChange={setShowPlacementPromptModal}
          onProceedPurchase={() => setShowCheckoutModal(true)}
          courseTitle={items[0]?.title}
          courseCategory={items[0]?.category}
        />
      )}
    </>
  )
}
