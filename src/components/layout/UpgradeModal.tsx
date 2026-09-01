/**
 * @file UpgradeModal.tsx
 * @description Component giao diện React UpgradeModal cho học viên
 */

import { useTranslation } from 'react-i18next'
import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Check, Shield, Zap, Loader2, Sparkles, Copy, ArrowLeft, CheckCircle2, Clock, QrCode, FlaskConical, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'
import { subscriptionService, PaymentOrderResponse } from '@/services/subscription.service'
import { API_CONFIG } from '@/config/api.config'

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
    perMonth: { en: '79,000/month', vi: '79.000đ/tháng' },
  },
  {
    id: '3-month',
    cycle: 'QUARTERLY',
    duration: { en: '3 Months', vi: '3 tháng' },
    price: 169000,
    originalPrice: 237000,
    perMonth: { en: '~56,333/month', vi: '~56.333đ/tháng' },
    discount: '-29%',
  },
  {
    id: '12-month',
    cycle: 'YEARLY',
    duration: { en: '1 Year', vi: '1 năm' },
    price: 499000,
    originalPrice: 948000,
    perMonth: { en: '~41,583/month', vi: '~41.583đ/tháng' },
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
  { icon: '👑', title: isVietnamese ? 'Tất cả khóa học' : 'All Courses Unlocked', desc: isVietnamese ? 'Học không giới hạn toàn bộ khóa học' : 'Unlimited access to all courses' },
  { icon: '🤖', title: isVietnamese ? 'AI đánh giá Writing' : 'AI Writing Evaluation', desc: isVietnamese ? 'Phân tích ngữ pháp, từ vựng 100%' : 'Grammar, vocabulary analysis' },
  { icon: '🎯', title: isVietnamese ? 'AI chấm điểm Speaking' : 'AI Speaking Scoring', desc: isVietnamese ? 'Đánh giá phát âm chuẩn Whisper' : 'Pronunciation & intonation STT' },
  { icon: '📝', title: isVietnamese ? 'AI Gia sư 24/7' : '24/7 AI Tutor', desc: isVietnamese ? 'Giải đáp thắc mắc câu hỏi siêu tốc' : 'Ultra-fast pedagogical tutor' },
  { icon: '📊', title: isVietnamese ? 'Đề thi TOEIC Full/Mini' : 'Full TOEIC Exams', desc: isVietnamese ? 'Không giới hạn lượt thi ETS' : 'Unlimited ETS mock exams' },
  { icon: '⚡', title: isVietnamese ? 'Không quảng cáo' : 'Ad-free Experience', desc: isVietnamese ? 'Tập trung tối đa khi học' : 'Distraction-free learning' },
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
      alert(isVietnamese ? 'Vui lòng đăng nhập để nâng cấp gói Premium!' : 'Please log in to upgrade to Premium!')
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
      const msg = err instanceof Error ? err.message : (isVietnamese ? 'Có lỗi xảy ra khi tạo đơn hàng' : 'Failed to create payment order')
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleManualCheck = async () => {
    setIsCheckingStatus(true)
    const isPaid = await checkPaymentStatus()
    setIsCheckingStatus(false)
    if (!isPaid && step === 'PAYMENT_QR') {
      alert(isVietnamese ? 'Hệ thống đang kiểm tra biến động số dư. Nếu bạn đã chuyển khoản, vui lòng đợi vài giây để hệ thống đối soát tự động!' : 'Checking status... If you have made the transfer, please wait a few seconds.')
    }
  }

  const handleSimulatePayment = async () => {
    if (!order?.order_code) return
    setIsSimulating(true)
    try {
      await subscriptionService.simulatePayment(order.order_code)
      handlePaymentSuccess()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isVietnamese ? 'Lỗi khi mô phỏng' : 'Simulation error')
      alert(msg)
    } finally {
      setIsSimulating(false)
    }
  }

  const minutes = Math.floor(timeLeftSeconds / 60)
  const seconds = timeLeftSeconds % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && onOpenChange(false)} />

      <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="overflow-hidden rounded-2xl bg-surface shadow-2xl border border-border/80">
          <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-5 py-3.5 text-center text-white">
            {step === 'PAYMENT_QR' && (
              <button
                onClick={() => {
                  stopAllTimers()
                  setStep('SELECT_PLAN')
                }}
                className="absolute left-4 top-3.5 rounded-full p-1 transition-colors hover:bg-white/20"
              >
                <ArrowLeft size={18} />
              </button>
            )}

            <button
              onClick={() => {
                stopAllTimers()
                onOpenChange(false)
              }}
              className="absolute right-4 top-3.5 rounded-full p-1 transition-colors hover:bg-white/20"
            >
              <X size={18} />
            </button>

            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">👑</span>
              <div className="text-left">
                <h2 className="text-base font-bold tracking-tight">LingoSphere Premium VIP</h2>
                <p className="text-[11px] text-white/90">
                  {step === 'PAYMENT_QR'
                    ? (isVietnamese ? 'Quét mã VietQR chuyển khoản tự động' : 'Scan VietQR to pay automatically')
                    : (isVietnamese ? 'Mở khóa toàn bộ tính năng - học bứt phá' : 'Unlock everything - learn 10x faster')}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 max-h-[85vh] overflow-y-auto">
            {step === 'SUCCESS' && (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in-90 duration-300">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-lg ring-8 ring-emerald-50">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600 animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">
                  {isVietnamese ? '🎉 KÍCH HOẠT VIP THÀNH CÔNG!' : '🎉 UPGRADE SUCCESSFUL!'}
                </h3>
                <p className="mt-2 text-sm text-text-secondary max-w-xs">
                  {isVietnamese
                    ? 'Hệ thống đã xác nhận thanh toán và mở khóa toàn bộ đặc quyền VIP cho bạn!'
                    : 'Your payment was confirmed and VIP features are now fully active!'}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                  <Sparkles size={14} /> {isVietnamese ? 'Đang chuyển trang học...' : 'Redirecting...'}
                </div>
              </div>
            )}

            {step === 'SELECT_PLAN' && (
              <>
                {errorMessage && (
                  <div className="mb-3 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                    <AlertCircle size={16} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <h3 className="mb-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
                  {isVietnamese ? '1. Chọn gói thời hạn' : '1. Select Plan'}
                </h3>
                <div className="mb-4 grid grid-cols-2 gap-2.5">
                  {plans.map((plan) => {
                    const isSelected = selectedPlan === plan.id
                    return (
                      <label
                        key={plan.id}
                        className={`relative cursor-pointer rounded-xl border-2 p-3 transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/5 shadow-md shadow-amber-500/10 ring-1 ring-amber-500'
                            : 'border-border bg-surface hover:border-amber-300'
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
                        <div className="flex items-start gap-2">
                          <div
                            className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 transition-all ${
                              isSelected ? 'border-amber-500 bg-amber-500' : 'border-border'
                            }`}
                          >
                            {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-text-primary">
                                {isVietnamese ? plan.duration.vi : plan.duration.en}
                              </span>
                              {plan.discount && (
                                <span className="rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-bold text-emerald-700">
                                  {plan.discount}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-extrabold text-amber-600 mt-0.5">
                              {plan.price.toLocaleString(isVietnamese ? 'vi-VN' : 'en-US')} đ
                            </p>
                            {plan.originalPrice && (
                              <p className="text-[10px] text-text-tertiary line-through">
                                {plan.originalPrice.toLocaleString(isVietnamese ? 'vi-VN' : 'en-US')} đ
                              </p>
                            )}
                            <p className="text-[10px] text-text-secondary mt-0.5">
                              {isVietnamese ? plan.perMonth.vi : plan.perMonth.en}
                            </p>
                          </div>
                        </div>
                        {plan.recommended && (
                          <div className="absolute -top-2.5 left-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                            ✨ {isVietnamese ? 'PHỔ BIẾN NHẤT' : 'BEST VALUE'}
                          </div>
                        )}
                      </label>
                    )
                  })}
                </div>

                <Button
                  disabled={isSubmitting}
                  className="h-11 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-orange-600"
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

                <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-text-secondary">
                  <span className="flex items-center gap-1 font-medium text-emerald-600">
                    <Shield className="h-3.5 w-3.5" />
                    {isVietnamese ? 'Tự động 100%' : '100% Automated'}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-amber-600">
                    <Zap className="h-3.5 w-3.5" />
                    {isVietnamese ? 'Nhận VIP sau 2 giây' : 'Instant 2s activation'}
                  </span>
                </div>

                <div className="mt-4 border-t border-border pt-3">
                  <h3 className="mb-2 flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Sparkles size={14} /> {isVietnamese ? 'Quyền lợi VIP LingoSphere' : 'Premium VIP Benefits'}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {benefits.map((b, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-xl bg-surface-subtle p-2.5 border border-border/50">
                        <span className="text-base">{b.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-text-primary">{b.title}</p>
                          <p className="truncate text-[10px] text-text-secondary">{b.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 'PAYMENT_QR' && order && (
              <div className="flex flex-col items-center">
                <div className="mb-3 flex items-center justify-between w-full rounded-xl bg-amber-500/10 px-3.5 py-2 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                    <Clock size={15} />
                    <span>{isVietnamese ? 'Mã QR hết hạn sau:' : 'QR expires in:'}</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
                    {formattedTime}
                  </span>
                </div>

                <div className="relative rounded-2xl bg-white p-3 shadow-inner border border-gray-200 flex flex-col items-center">
                  <img
                    src={order.qr_url}
                    alt="VietQR Transfer"
                    className="w-56 h-56 object-contain rounded-lg"
                  />
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
                    <span className="text-red-500">★</span> MBBank 24/7 NAPAS VietQR
                  </div>
                </div>

                <div className="mt-3.5 w-full space-y-1.5 text-xs">
                  <div className="flex items-center justify-between rounded-lg bg-surface-subtle px-3 py-2 border border-border/60">
                    <span className="text-text-secondary font-medium">{isVietnamese ? 'Ngân hàng:' : 'Bank:'}</span>
                    <span className="font-bold text-text-primary">{order.bank_info.bank_name}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-surface-subtle px-3 py-2 border border-border/60">
                    <span className="text-text-secondary font-medium">{isVietnamese ? 'Số tài khoản:' : 'Account No:'}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-600 text-sm">{order.bank_info.account_number}</span>
                      <button
                        onClick={() => handleCopy(order.bank_info.account_number, 'stk')}
                        className="rounded p-1 text-text-secondary hover:bg-surface hover:text-text-primary"
                        title={isVietnamese ? 'Sao chép STK' : 'Copy account number'}
                      >
                        {copiedField === 'stk' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-surface-subtle px-3 py-2 border border-border/60">
                    <span className="text-text-secondary font-medium">{isVietnamese ? 'Chủ tài khoản:' : 'Account Name:'}</span>
                    <span className="font-bold text-text-primary">{order.bank_info.account_name}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-surface-subtle px-3 py-2 border border-border/60">
                    <span className="text-text-secondary font-medium">{isVietnamese ? 'Số tiền:' : 'Amount:'}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary text-sm">
                        {order.amount.toLocaleString(isVietnamese ? 'vi-VN' : 'en-US')} đ
                      </span>
                      <button
                        onClick={() => handleCopy(String(order.amount), 'amount')}
                        className="rounded p-1 text-text-secondary hover:bg-surface hover:text-text-primary"
                        title={isVietnamese ? 'Sao chép số tiền' : 'Copy amount'}
                      >
                        {copiedField === 'amount' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-amber-500/10 px-3 py-2.5 border border-amber-500/30">
                    <div>
                      <span className="text-amber-800 font-bold block">{isVietnamese ? 'Nội dung chuyển khoản:' : 'Transfer code:'}</span>
                      <span className="text-[10px] text-amber-700/80">{isVietnamese ? '(Bắt buộc để tự động kích hoạt)' : '(Required for auto activation)'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-amber-700 text-base tracking-wider bg-amber-200/80 px-2 py-0.5 rounded border border-amber-300">
                        {order.order_code}
                      </span>
                      <button
                        onClick={() => handleCopy(order.order_code, 'code')}
                        className="rounded p-1.5 bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm"
                        title={isVietnamese ? 'Sao chép nội dung' : 'Copy code'}
                      >
                        {copiedField === 'code' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-text-secondary">
                  <Loader2 size={15} className="animate-spin text-amber-500" />
                  <span>{isVietnamese ? 'Đang chờ bạn quét mã thanh toán...' : 'Waiting for payment confirmation...'}</span>
                </div>

                <div className="mt-3.5 w-full space-y-2 border-t border-border pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isCheckingStatus}
                    onClick={handleManualCheck}
                    className="w-full h-9 text-xs font-semibold border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    {isCheckingStatus ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {isVietnamese ? 'Đang kiểm tra...' : 'Checking...'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <RefreshCw size={14} />
                        {isVietnamese ? 'Tôi Đã Chuyển Khoản - Kiểm Tra Ngay' : 'I Have Transferred - Check Now'}
                      </span>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isSimulating}
                    onClick={handleSimulatePayment}
                    className="w-full h-8 text-[11px] font-medium text-text-tertiary hover:text-text-primary hover:bg-surface-subtle"
                  >
                    {isSimulating ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        {isVietnamese ? 'Đang mô phỏng...' : 'Simulating...'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <FlaskConical size={13} />
                        {isVietnamese ? 'Mô phỏng thanh toán thành công (Test Mode)' : 'Simulate Successful Payment (Test Mode)'}
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
