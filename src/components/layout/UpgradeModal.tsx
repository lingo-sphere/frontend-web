'use client'

/**
 * @file UpgradeModal.tsx
 * @description Modal nâng cấp LingoSphere Premium VIP với giao diện cao cấp, hài hòa, không chói
 */

import { useTranslation } from 'react-i18next'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  X,
  Check,
  Shield,
  Zap,
  Loader2,
  Sparkles,
  Copy,
  ArrowLeft,
  CheckCircle2,
  Clock,
  QrCode,
  FlaskConical,
  AlertCircle,
  RefreshCw,
  Crown,
  BookOpen,
  PenTool,
  Mic,
  Bot,
  GraduationCap,
  Sparkle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'
import { subscriptionService, type PaymentOrderResponse } from '@/services/subscription.service'
import { API_CONFIG } from '@/config/api.config'
import { toast } from '@/store/toast-store'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Plan {
  id: string
  cycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'LIFETIME'
  duration: { en: string; vi: string }
  price: number
  originalPrice?: number
  perMonth: { en: string; vi: string }
  discount?: string
  recommended?: boolean
}

const getPlans = (): Plan[] => [
  {
    id: '1-month',
    cycle: 'MONTHLY',
    duration: { en: '1 Month', vi: '1 tháng' },
    price: 79000,
    perMonth: { en: '79,000/mo', vi: '79.000đ/tháng' },
  },
  {
    id: '3-month',
    cycle: 'QUARTERLY',
    duration: { en: '3 Months', vi: '3 tháng' },
    price: 169000,
    originalPrice: 237000,
    perMonth: { en: '~56,333/mo', vi: '~56.333đ/tháng' },
    discount: '-29%',
  },
  {
    id: '12-month',
    cycle: 'YEARLY',
    duration: { en: '1 Year', vi: '1 năm' },
    price: 499000,
    originalPrice: 948000,
    perMonth: { en: '~41,583/mo', vi: '~41.583đ/tháng' },
    discount: '-47%',
    recommended: true,
  },
  {
    id: 'lifetime',
    cycle: 'LIFETIME',
    duration: { en: 'Lifetime', vi: 'Vĩnh viễn' },
    price: 1849000,
    originalPrice: 2641429,
    perMonth: { en: 'Lifetime', vi: 'Trọn đời' },
    discount: '-30%',
  },
]

const getBenefits = (isVietnamese: boolean) => [
  {
    icon: BookOpen,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    title: isVietnamese ? 'Mở khóa toàn bộ khóa học' : 'All Courses Unlocked',
    desc: isVietnamese ? 'Học không giới hạn mọi bài giảng' : 'Unlimited access to all curriculum',
  },
  {
    icon: PenTool,
    color: 'text-violet-600 dark:text-violet-400 bg-violet-500/10',
    title: isVietnamese ? 'AI chấm chữa Writing' : 'AI Writing Evaluation',
    desc: isVietnamese ? 'Sửa chi tiết ngữ pháp & từ vựng' : 'Deep grammar & lexical feedback',
  },
  {
    icon: Mic,
    color: 'text-sky-600 dark:text-sky-400 bg-sky-500/10',
    title: isVietnamese ? 'AI chấm điểm Speaking' : 'AI Speaking Scoring',
    desc: isVietnamese ? 'Phát âm chuẩn xác cùng Whisper AI' : 'Pronunciation analysis via Whisper AI',
  },
  {
    icon: Bot,
    color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
    title: isVietnamese ? 'Gia sư AI 24/7' : '24/7 AI Tutor',
    desc: isVietnamese ? 'Giải đáp thắc mắc chuyên sâu siêu tốc' : 'Real-time interactive tutoring',
  },
  {
    icon: GraduationCap,
    color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10',
    title: isVietnamese ? 'Thi thử TOEIC Full/Mini' : 'TOEIC Mock Exams',
    desc: isVietnamese ? 'Không giới hạn lượt thi đề chuẩn ETS' : 'Unlimited ETS test simulations',
  },
  {
    icon: Sparkle,
    color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10',
    title: isVietnamese ? 'Trải nghiệm không quảng cáo' : 'Ad-free Experience',
    desc: isVietnamese ? 'Tập trung tối đa vào việc học' : 'Zero interruptions & priority speed',
  },
]

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [selectedPlan, setSelectedPlan] = useState('12-month')
  const [step, setStep] = useState<'SELECT_PLAN' | 'PAYMENT_QR' | 'SUCCESS'>('SELECT_PLAN')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [order, setOrder] = useState<PaymentOrderResponse | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(900)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const orderRef = useRef<PaymentOrderResponse | null>(null)
  orderRef.current = order

  const { user, isAuthenticated, setUser } = useAuthStore()

  const plans = getPlans()
  const benefits = getBenefits(isVietnamese)

  const stopAllTimers = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success(
      isVietnamese ? 'Đã sao chép vào bộ nhớ tạm!' : 'Copied to clipboard!',
      isVietnamese ? 'Sao chép' : 'Copied'
    )
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handlePaymentSuccess = useCallback(() => {
    stopAllTimers()
    setStep('SUCCESS')

    const currentUser = useAuthStore.getState().user
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        is_premium: true,
        subscription_plan: orderRef.current?.billing_cycle || 'YEARLY',
      }
      setUser(updatedUser)
      if (typeof window !== 'undefined') {
        localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(updatedUser))
      }
    }

    setTimeout(() => {
      setStep('SELECT_PLAN')
      setOrder(null)
      onOpenChange(false)
    }, 2500)
  }, [stopAllTimers, setUser, onOpenChange])

  const checkPaymentStatus = useCallback(async () => {
    const currentOrder = orderRef.current
    if (!currentOrder?.order_code) return

    try {
      const res = await subscriptionService.getPaymentOrderStatus(currentOrder.order_code)
      const status = res?.status || (res as unknown as { data?: { status?: string } })?.data?.status
      if (status === 'PAID') {
        handlePaymentSuccess()
        return true
      }
    } catch {}
    return false
  }, [handlePaymentSuccess])

  useEffect(() => {
    if (!open) {
      stopAllTimers()
      setStep('SELECT_PLAN')
      setOrder(null)
      return
    }

    if (step === 'PAYMENT_QR' && order?.order_code) {
      pollingRef.current = setInterval(() => {
        checkPaymentStatus()
      }, 2000)

      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            stopAllTimers()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        stopAllTimers()
      }
    }
  }, [open, step, order?.order_code, checkPaymentStatus, stopAllTimers])

  if (!open) return null

  const handleCreateOrder = async () => {
    if (!isAuthenticated || !user) {
      toast.warning(
        isVietnamese ? 'Vui lòng đăng nhập để nâng cấp gói Premium!' : 'Please log in to upgrade to Premium!',
        isVietnamese ? 'Yêu cầu đăng nhập' : 'Authentication required'
      )
      return
    }

    const currentPlan = plans.find((p) => p.id === selectedPlan) || plans[2]
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const newOrder = await subscriptionService.createPaymentOrder({
        plan_slug: 'premium',
        billing_cycle: currentPlan.cycle,
      })
      setOrder(newOrder)
      orderRef.current = newOrder
      setTimeLeftSeconds(900)
      setStep('PAYMENT_QR')
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : isVietnamese
          ? 'Có lỗi xảy ra khi tạo đơn hàng'
          : 'Failed to create payment order'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleManualCheck = async () => {
    if (!order?.order_code) return
    setIsCheckingStatus(true)
    try {
      const res = await subscriptionService.getPaymentOrderStatus(order.order_code)
      const status = res?.status || (res as unknown as { data?: { status?: string } })?.data?.status
      if (status === 'PAID') {
        handlePaymentSuccess()
      } else {
        toast.warning(
          isVietnamese
            ? 'Hệ thống chưa nhận được thanh toán từ ngân hàng. Nếu bạn vừa chuyển khoản, vui lòng đợi 15-30 giây để ngân hàng đối soát hoặc kiểm tra lại nội dung chuyển khoản!'
            : 'Payment has not been received yet. Please wait a moment for the bank transfer to clear.',
          isVietnamese ? 'Chưa nhận được thanh toán' : 'Payment Pending'
        )
      }
    } catch {
      toast.error(
        isVietnamese ? 'Không thể kiểm tra trạng thái lúc này. Vui lòng thử lại.' : 'Failed to check status. Please try again.',
        isVietnamese ? 'Lỗi kết nối' : 'Connection Error'
      )
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const minutes = Math.floor(timeLeftSeconds / 60)
  const seconds = timeLeftSeconds % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - Click outside disabled */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" />

      <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="overflow-hidden rounded-3xl bg-surface shadow-2xl border border-border">
          {/* Integrated Modern VIP Header */}
          <div className="relative px-6 pt-6 pb-4 border-b border-border/60 bg-surface">
            {step === 'PAYMENT_QR' && (
              <button
                onClick={() => {
                  stopAllTimers()
                  setStep('SELECT_PLAN')
                }}
                className="absolute left-5 top-5 rounded-full p-2 text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
                title={isVietnamese ? 'Quay lại' : 'Back'}
              >
                <ArrowLeft size={18} />
              </button>
            )}

            <button
              onClick={() => {
                stopAllTimers()
                onOpenChange(false)
              }}
              className="absolute right-5 top-5 rounded-full p-2 text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
              title={isVietnamese ? 'Đóng' : 'Close'}
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3.5 pr-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 ring-4 ring-amber-500/10">
                <Crown className="h-6 w-6 fill-white text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold tracking-tight text-text-primary">
                    LingoSphere Premium VIP
                  </h2>
                </div>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed truncate">
                  {step === 'PAYMENT_QR'
                    ? isVietnamese
                      ? 'Quét mã VietQR chuyển khoản tự động'
                      : 'Scan VietQR to pay automatically'
                    : isVietnamese
                    ? 'Mở khóa toàn bộ tính năng - học bứt phá không giới hạn'
                    : 'Unlock everything - learn 10x faster'}
                </p>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto space-y-5">
            {step === 'SUCCESS' && (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-90 duration-300">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 ring-8 ring-emerald-500/5">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 animate-bounce" />
                </div>
                <h3 className="text-xl font-extrabold text-text-primary">
                  {isVietnamese ? 'KÍCH HOẠT VIP THÀNH CÔNG!' : 'UPGRADE SUCCESSFUL!'}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-text-secondary max-w-xs leading-relaxed">
                  {isVietnamese
                    ? 'Hệ thống đã xác nhận thanh toán và mở khóa toàn bộ đặc quyền VIP cho bạn!'
                    : 'Your payment was confirmed and VIP features are now fully active!'}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20">
                  <Sparkles size={14} />
                  <span>{isVietnamese ? 'Đang chuyển đến khóa học...' : 'Redirecting...'}</span>
                </div>
              </div>
            )}

            {step === 'SELECT_PLAN' && (
              <>
                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-600 border border-rose-500/20">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      {isVietnamese ? '1. Chọn gói thời hạn' : '1. Select Plan'}
                    </h3>
                    <span className="text-[11px] text-text-tertiary">
                      {isVietnamese ? 'Bảo lưu & nâng cấp linh hoạt' : 'Flexible upgrade'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {plans.map((plan) => {
                      const isSelected = selectedPlan === plan.id
                      return (
                        <label
                          key={plan.id}
                          className={`relative flex flex-col justify-between cursor-pointer rounded-2xl p-3.5 transition-all duration-200 ${
                            isSelected
                              ? 'border-2 border-primary bg-primary-soft/30 shadow-sm'
                              : 'border border-border bg-surface hover:border-primary/40 hover:bg-surface-hover/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="plan"
                            value={plan.id}
                            checked={isSelected}
                            onChange={() => setSelectedPlan(plan.id)}
                            className="sr-only"
                          />

                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`h-4 w-4 shrink-0 rounded-full flex items-center justify-center transition-all ${
                                    isSelected
                                      ? 'bg-primary text-white'
                                      : 'border border-border bg-surface'
                                  }`}
                                >
                                  {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                                </div>
                                <span className="text-xs font-bold text-text-primary">
                                  {isVietnamese ? plan.duration.vi : plan.duration.en}
                                </span>
                              </div>

                              {plan.discount && (
                                <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400">
                                  {plan.discount}
                                </span>
                              )}
                            </div>

                            <div className="mt-1">
                              <p className="text-base font-extrabold text-text-primary tracking-tight">
                                {plan.price.toLocaleString(isVietnamese ? 'vi-VN' : 'en-US')} đ
                              </p>
                              {plan.originalPrice && (
                                <p className="text-[10px] text-text-tertiary line-through">
                                  {plan.originalPrice.toLocaleString(isVietnamese ? 'vi-VN' : 'en-US')} đ
                                </p>
                              )}
                            </div>
                          </div>

                          <p className="text-[11px] font-medium text-text-secondary mt-2 pt-2 border-t border-border/40">
                            {isVietnamese ? plan.perMonth.vi : plan.perMonth.en}
                          </p>

                          {plan.recommended && (
                            <div className="absolute -top-2.5 left-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[9px] font-bold text-white shadow-sm flex items-center gap-1">
                              <Sparkles size={10} />
                              <span>{isVietnamese ? 'PHỔ BIẾN NHẤT' : 'BEST VALUE'}</span>
                            </div>
                          )}
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-xl bg-gradient-to-r from-primary via-[#286f68] to-[#1f5d58] text-sm font-bold text-white shadow-lg shadow-primary/20 hover:brightness-105 transition-all cursor-pointer"
                    onClick={handleCreateOrder}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isVietnamese ? 'Đang tạo mã VietQR...' : 'Generating QR...'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <QrCode size={18} />
                        {isVietnamese ? 'Thanh toán qua VietQR Tự Động' : 'Proceed to VietQR Payment'}
                      </span>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-5 text-xs text-text-secondary">
                    <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                      <Shield className="h-3.5 w-3.5" />
                      {isVietnamese ? 'Tự động 100%' : '100% Automated'}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                      <Zap className="h-3.5 w-3.5" />
                      {isVietnamese ? 'Nhận VIP tức thì sau 2 giây' : 'Instant activation'}
                    </span>
                  </div>
                </div>

                {/* VIP Benefits */}
                <div className="border-t border-border pt-4">
                  <h3 className="mb-3 text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-500" />
                    <span>{isVietnamese ? 'Quyền lợi học viên VIP LingoSphere' : 'Premium VIP Benefits'}</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {benefits.map((b, i) => {
                      const IconComponent = b.icon
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 rounded-xl bg-surface-subtle/60 p-2.5 border border-border/50 hover:bg-surface-hover/70 transition-colors"
                        >
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${b.color}`}>
                            <IconComponent size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-text-primary">{b.title}</p>
                            <p className="truncate text-[10px] text-text-secondary leading-tight">{b.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            {step === 'PAYMENT_QR' && order && (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center justify-between w-full rounded-xl bg-amber-500/10 px-4 py-2.5 border border-amber-500/20 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300">
                    <Clock size={15} />
                    <span>{isVietnamese ? 'Mã QR hết hạn sau:' : 'QR expires in:'}</span>
                  </div>
                  <span className="font-mono font-bold text-amber-900 dark:text-amber-200 bg-amber-500/20 px-2.5 py-0.5 rounded-md text-sm">
                    {formattedTime}
                  </span>
                </div>

                <div className="relative rounded-2xl bg-white p-4 shadow-sm border border-border flex flex-col items-center">
                  <img
                    src={order.qr_url}
                    alt="VietQR Transfer"
                    className="w-56 h-56 object-contain rounded-xl"
                  />
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                    <span className="text-red-500">★</span> MBBank 24/7 NAPAS VietQR
                  </div>
                </div>

                <div className="w-full space-y-2 text-xs">
                  <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-3.5 py-2.5 border border-border/60">
                    <span className="text-text-secondary font-medium">{isVietnamese ? 'Ngân hàng:' : 'Bank:'}</span>
                    <span className="font-bold text-text-primary">{order.bank_info.bank_name}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-3.5 py-2.5 border border-border/60">
                    <span className="text-text-secondary font-medium">{isVietnamese ? 'Số tài khoản:' : 'Account No:'}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-primary text-sm tracking-wide">
                        {order.bank_info.account_number}
                      </span>
                      <button
                        onClick={() => handleCopy(order.bank_info.account_number, 'stk')}
                        className="rounded-lg p-1.5 text-text-secondary hover:bg-surface hover:text-text-primary transition-colors cursor-pointer"
                        title={isVietnamese ? 'Sao chép STK' : 'Copy account number'}
                      >
                        {copiedField === 'stk' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-3.5 py-2.5 border border-border/60">
                    <span className="text-text-secondary font-medium">{isVietnamese ? 'Chủ tài khoản:' : 'Account Name:'}</span>
                    <span className="font-bold text-text-primary">{order.bank_info.account_name}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-3.5 py-2.5 border border-border/60">
                    <span className="text-text-secondary font-medium">{isVietnamese ? 'Số tiền:' : 'Amount:'}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-text-primary text-sm">
                        {order.amount.toLocaleString(isVietnamese ? 'vi-VN' : 'en-US')} đ
                      </span>
                      <button
                        onClick={() => handleCopy(String(order.amount), 'amount')}
                        className="rounded-lg p-1.5 text-text-secondary hover:bg-surface hover:text-text-primary transition-colors cursor-pointer"
                        title={isVietnamese ? 'Sao chép số tiền' : 'Copy amount'}
                      >
                        {copiedField === 'amount' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-amber-500/10 px-3.5 py-2.5 border border-amber-500/30">
                    <div>
                      <span className="text-amber-900 dark:text-amber-300 font-bold block">
                        {isVietnamese ? 'Nội dung chuyển khoản:' : 'Transfer code:'}
                      </span>
                      <span className="text-[10px] text-amber-700/90 dark:text-amber-400">
                        {isVietnamese ? '(Bắt buộc để tự động kích hoạt)' : '(Required for auto activation)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-amber-900 dark:text-amber-200 text-sm tracking-wider bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                        {order.order_code}
                      </span>
                      <button
                        onClick={() => handleCopy(order.order_code, 'code')}
                        className="rounded-lg p-1.5 bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-sm cursor-pointer"
                        title={isVietnamese ? 'Sao chép nội dung' : 'Copy code'}
                      >
                        {copiedField === 'code' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs font-medium text-text-secondary">
                  <Loader2 size={15} className="animate-spin text-primary" />
                  <span>{isVietnamese ? 'Đang chờ xác nhận chuyển khoản từ ngân hàng...' : 'Waiting for bank confirmation...'}</span>
                </div>

                <div className="w-full border-t border-border pt-3">
                  <Button
                    size="sm"
                    disabled={isCheckingStatus}
                    onClick={handleManualCheck}
                    className="w-full h-11 text-xs font-bold rounded-xl bg-primary hover:bg-primary-hover text-white cursor-pointer shadow-lg shadow-primary/25 hover:shadow-primary/40 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isCheckingStatus ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isVietnamese ? 'Đang đối soát chuyển khoản...' : 'Checking with Bank...'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={15} />
                        {isVietnamese ? 'Tôi Đã Chuyển Khoản - Kiểm Tra Ngay' : 'I Have Transferred - Verify Payment'}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
