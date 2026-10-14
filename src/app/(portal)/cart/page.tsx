// Trang giỏ hàng và thanh toán khóa học của học viên
'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShoppingBag, ArrowLeft, Trash2, BookmarkCheck, Tag, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/button'
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
import { resolveMediaUrl } from '@/utils/media.utils'

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
      thumbnail: resolveMediaUrl((it as unknown as { thumbnail?: string })?.thumbnail || it.thumbnail_url),
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

  if (!isAuthenticated && mounted) {
    return (
      <div className="min-h-screen bg-background text-text-primary px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 w-full max-w-[1536px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/courses')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-purple-600 dark:hover:text-purple-400 bg-surface hover:bg-surface-hover px-3.5 py-1.5 rounded-full border border-border transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span suppressHydrationWarning>{isVi ? 'Tiếp tục xem khóa học' : 'Continue shopping'}</span>
          </button>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface via-surface to-surface-subtle/50 p-6 sm:p-8 lg:p-10 shadow-xl shadow-purple-500/5 transition-all w-full">
          <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold">
                <ShoppingBag className="w-4 h-4" />
                <span>{isVi ? 'Giỏ hàng của bạn' : 'Your Shopping Cart'}</span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-text-primary">
                {isVi ? 'Đăng nhập để xem giỏ hàng của bạn' : 'Log in to view your shopping cart'}
              </h2>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl">
                {isVi
                  ? 'Lưu lại các khóa học bạn quan tâm, đồng bộ giỏ hàng trên mọi thiết bị và áp dụng mã khuyến mãi học viên.'
                  : 'Log in to save your selected courses, sync your cart across devices, and apply exclusive promo codes.'}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => window.dispatchEvent(new CustomEvent('lingosphere:open-auth-modal'))}
                  className="px-6 py-3 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/25 cursor-pointer text-xs sm:text-sm"
                >
                  {isVi ? 'Đăng nhập ngay' : 'Log In Now'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/courses')}
                  className="px-5 py-3 rounded-xl font-semibold border-border hover:bg-surface-subtle cursor-pointer text-xs sm:text-sm"
                >
                  {isVi ? 'Khám phá khóa học' : 'Explore Courses'}
                </Button>
              </div>

              <div className="pt-1 flex items-center gap-4 text-[11px] text-text-tertiary">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                  {isVi ? 'Bảo mật thanh toán SSL' : 'Secure SSL payment'}
                </span>
                <span>•</span>
                <span>{isVi ? 'Đồng bộ giỏ hàng tức thì' : 'Real-time cart sync'}</span>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-subtle/80 border border-border/70 hover:border-purple-500/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <BookmarkCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary">{isVi ? 'Lưu giỏ hàng' : 'Save Cart'}</p>
                  <p className="text-xs text-text-tertiary">{isVi ? 'Đồng bộ khóa học trên mọi thiết bị' : 'Sync across all devices'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-subtle/80 border border-border/70 hover:border-purple-500/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary">{isVi ? 'Mã ưu đãi độc quyền' : 'Exclusive Promo Codes'}</p>
                  <p className="text-xs text-text-tertiary">{isVi ? 'Giảm đến 50% học phí thành viên' : 'Up to 50% tuition discount'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-subtle/80 border border-border/70 hover:border-purple-500/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary">{isVi ? 'Bảo mật SSL 256-bit' : '256-bit SSL Security'}</p>
                  <p className="text-xs text-text-tertiary">{isVi ? 'Thanh toán và mã hóa an toàn' : 'Safe and encrypted checkout'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-5 rounded-2xl border border-border/70 bg-surface/50 space-y-2 hover:border-purple-500/30 transition-all">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-text-primary">
              {isVi ? '1. Chọn khóa học' : '1. Choose Courses'}
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              {isVi
                ? 'Tìm kiếm khóa học phù hợp với mục tiêu điểm số và thêm vào giỏ hàng.'
                : 'Find the right courses for your target score and add them to your cart.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border/70 bg-surface/50 space-y-2 hover:border-purple-500/30 transition-all">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-text-primary">
              {isVi ? '2. Áp dụng ưu đãi' : '2. Apply Discounts'}
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              {isVi
                ? 'Nhập mã voucher học viên để nhận ưu đãi giảm giá tốt nhất cho đơn hàng.'
                : 'Enter your student coupon code to receive the best tuition discount.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border/70 bg-surface/50 space-y-2 hover:border-purple-500/30 transition-all">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-text-primary">
              {isVi ? '3. Kích hoạt tức thì' : '3. Instant Access'}
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              {isVi
                ? 'Hoàn tất thanh toán an toàn và bắt đầu hành trình học tập ngay lập tức.'
                : 'Complete secure checkout and start your learning journey immediately.'}
            </p>
          </div>
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
