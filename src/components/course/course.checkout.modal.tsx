'use client'

/**
 * @file CourseCheckoutModal.tsx
 * @description Modal thanh toán chuyển khoản ngân hàng qua VietQR kèm xác thực tự động cho Khóa học LingoSphere
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  X,
  CheckCircle2,
  Copy,
  Clock,
  QrCode,
  FlaskConical,
  AlertCircle,
  RefreshCw,
  Sparkles,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'
import { useCartStore } from '@/store/cart-store'
import { useEnrollmentStore } from '@/store/enrollment-store'
import { courseService } from '@/services/course.service'
import { subscriptionService, type PaymentOrderResponse } from '@/services/subscription.service'
import { toast } from '@/store/toast-store'

export interface CheckoutCourseItem {
  id: string
  title: string
  price: number
  thumbnail?: string
}

interface CourseCheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courses: CheckoutCourseItem[]
  onSuccess?: () => void
}

export function CourseCheckoutModal({
  open,
  onOpenChange,
  courses,
  onSuccess,
}: CourseCheckoutModalProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const { user, isAuthenticated } = useAuthStore()

  const [step, setStep] = useState<'PAYMENT_QR' | 'SUCCESS'>('PAYMENT_QR')
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

  const totalAmount = courses.reduce((acc, c) => acc + (c.price || 0), 0)
  const formattedTotal = totalAmount > 0 ? `₫${totalAmount.toLocaleString('vi-VN')}` : 'Miễn phí'

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
      isVi ? 'Đã sao chép vào bộ nhớ tạm!' : 'Copied to clipboard!',
      isVi ? 'Sao chép' : 'Copied'
    )
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handlePaymentSuccess = useCallback(async () => {
    stopAllTimers()
    setStep('SUCCESS')

    try {
      // Enroll in all purchased courses
      await Promise.all(courses.map((c) => courseService.enrollCourse(c.id).catch(() => null)))

      // Add to enrollment store
      courses.forEach((c) => useEnrollmentStore.getState().addEnrolledCourse(c.id))
      await useEnrollmentStore.getState().fetchMyEnrollments()

      // If cart has these courses, clear cart
      await useCartStore.getState().clearCart().catch(() => null)
    } catch {}

    toast.success(
      isVi ? 'Đã kích hoạt khóa học thành công! Chúc bạn học tốt!' : 'Course enrolled successfully!',
      isVi ? 'Thanh toán thành công' : 'Payment Success'
    )

    setTimeout(() => {
      setStep('PAYMENT_QR')
      setOrder(null)
      onOpenChange(false)
      onSuccess?.()
    }, 2500)
  }, [courses, isVi, onOpenChange, onSuccess, stopAllTimers])

  const checkPaymentStatus = useCallback(async () => {
    const currentOrder = orderRef.current
    if (!currentOrder?.order_code) return false

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

  // Initialize payment order when modal opens
  useEffect(() => {
    if (!open || courses.length === 0) {
      stopAllTimers()
      setStep('PAYMENT_QR')
      setOrder(null)
      return
    }

    let isMounted = true

    const initOrder = async () => {
      if (!isAuthenticated || !user) {
        toast.warning(
          isVi ? 'Vui lòng đăng nhập để thanh toán khóa học!' : 'Please log in to checkout!',
          isVi ? 'Yêu cầu đăng nhập' : 'Login required'
        )
        onOpenChange(false)
        return
      }

      setIsSubmitting(true)
      setErrorMessage(null)

      try {
        const newOrder = await subscriptionService.createPaymentOrder({
          plan_slug: 'course',
          amount: totalAmount,
          order_type: 'COURSE',
          course_ids: courses.map((c) => c.id),
          billing_cycle: 'ONCE',
        })

        if (isMounted) {
          setOrder(newOrder)
          orderRef.current = newOrder
          setTimeLeftSeconds(900)
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg =
            err instanceof Error
              ? err.message
              : isVi
              ? 'Có lỗi xảy ra khi tạo đơn hàng'
              : 'Failed to create payment order'
          setErrorMessage(msg)
        }
      } finally {
        if (isMounted) {
          setIsSubmitting(false)
        }
      }
    }

    initOrder()

    return () => {
      isMounted = false
      stopAllTimers()
    }
  }, [open, courses.length, totalAmount, isAuthenticated, user, isVi, onOpenChange, stopAllTimers])

  // Polling timer when QR is active
  useEffect(() => {
    if (open && step === 'PAYMENT_QR' && order?.order_code) {
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
          isVi
            ? 'Hệ thống chưa nhận được thanh toán từ ngân hàng. Nếu bạn vừa chuyển khoản, vui lòng đợi 15-30 giây để ngân hàng đối soát hoặc kiểm tra lại nội dung chuyển khoản!'
            : 'Payment has not been received yet. Please wait a moment for the bank transfer to clear.',
          isVi ? 'Chưa nhận được thanh toán' : 'Payment Pending'
        )
      }
    } catch {
      toast.error(
        isVi ? 'Không thể kiểm tra trạng thái lúc này. Vui lòng thử lại.' : 'Failed to check status. Please try again.',
        isVi ? 'Lỗi kết nối' : 'Connection Error'
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-md transition-opacity" />

      <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="overflow-hidden rounded-3xl bg-surface shadow-2xl border border-border">
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 border-b border-border/60 bg-surface">
            <button
              onClick={() => {
                stopAllTimers()
                onOpenChange(false)
              }}
              className="absolute right-5 top-5 rounded-full p-2 text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
              title={isVi ? 'Đóng' : 'Close'}
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3.5 pr-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-indigo-600 to-purple-600 text-white shadow-md shadow-primary/25 ring-4 ring-primary/10">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-extrabold tracking-tight text-text-primary">
                  {isVi ? 'Thanh toán Khóa học' : 'Course Checkout'}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed truncate">
                  {isVi ? 'Quét mã VietQR chuyển khoản tự động xác thực' : 'Scan VietQR for instant activation'}
                </p>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 max-h-[82vh] overflow-y-auto space-y-5">
            {step === 'SUCCESS' && (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-90 duration-300">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 ring-8 ring-emerald-500/5">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 animate-bounce" />
                </div>
                <h3 className="text-xl font-extrabold text-text-primary">
                  {isVi ? 'THANH TOÁN THÀNH CÔNG!' : 'CHECKOUT SUCCESSFUL!'}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-text-secondary max-w-xs leading-relaxed">
                  {isVi
                    ? 'Hệ thống đã xác nhận chuyển khoản và mở khóa toàn bộ bài giảng cho bạn!'
                    : 'Your payment was verified. Courses are now unlocked!'}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
                  <Sparkles size={14} />
                  <span>{isVi ? 'Đang chuyển đến khóa học...' : 'Redirecting...'}</span>
                </div>
              </div>
            )}

            {step === 'PAYMENT_QR' && (
              <>
                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-600 border border-rose-500/20">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Purchased Courses Summary Card */}
                <div className="rounded-2xl border border-border bg-surface-subtle/50 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-text-secondary uppercase tracking-wider">
                    <span>{isVi ? 'Khóa học đăng ký' : 'Selected Courses'}</span>
                    <span className="text-primary">{courses.length} {isVi ? 'khóa' : 'items'}</span>
                  </div>

                  <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                    {courses.map((c) => (
                      <div key={c.id} className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-semibold text-text-primary truncate flex-1 flex items-center gap-1.5">
                          <BookOpen size={12} className="text-primary shrink-0" />
                          <span className="truncate">{c.title}</span>
                        </span>
                        <span className="font-bold text-text-secondary shrink-0">
                          ₫{c.price.toLocaleString('vi-VN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary">{isVi ? 'Tổng thanh toán:' : 'Total:'}</span>
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formattedTotal}
                    </span>
                  </div>
                </div>

                {/* QR Code and Bank Details */}
                {isSubmitting || !order ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-xs text-text-secondary">
                      {isVi ? 'Đang tạo mã VietQR thanh toán...' : 'Generating VietQR code...'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Countdown Timer */}
                    <div className="flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 text-xs text-amber-700 dark:text-amber-400">
                      <div className="flex items-center gap-2 font-medium">
                        <Clock size={14} className="animate-pulse text-amber-600 dark:text-amber-400" />
                        <span>{isVi ? 'Mã QR hết hạn sau:' : 'QR expires in:'}</span>
                      </div>
                      <span className="font-mono font-extrabold text-sm tracking-wider">
                        {formattedTime}
                      </span>
                    </div>

                    {/* QR Image Box */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-white p-4 shadow-inner">
                      <div className="relative aspect-square w-52 sm:w-56 overflow-hidden rounded-xl bg-white p-2">
                        <img
                          src={order.qr_url}
                          alt="VietQR Payment"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                        <QrCode size={13} />
                        <span>{isVi ? 'Mở App Ngân hàng bất kỳ để quét mã' : 'Open any Banking App to scan'}</span>
                      </div>
                    </div>

                    {/* Bank Info Fields */}
                    <div className="rounded-2xl border border-border bg-surface divide-y divide-border text-xs">
                      {/* Bank Name */}
                      <div className="flex items-center justify-between p-3">
                        <span className="text-text-secondary">{isVi ? 'Ngân hàng' : 'Bank'}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-text-primary">{order.bank_info?.bank_name || 'MB Bank'}</span>
                          <button
                            onClick={() => handleCopy(order.bank_info?.bank_name || 'MB Bank', 'bank')}
                            className="p-1 text-text-tertiary hover:text-primary transition-colors cursor-pointer"
                            title="Sao chép"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Account Number */}
                      <div className="flex items-center justify-between p-3 bg-surface-subtle/30">
                        <span className="text-text-secondary">{isVi ? 'Số tài khoản' : 'Account number'}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-primary text-sm">
                            {order.bank_info?.account_number || '0987654321'}
                          </span>
                          <button
                            onClick={() => handleCopy(order.bank_info?.account_number || '0987654321', 'acc')}
                            className="p-1 text-primary hover:scale-110 transition-transform cursor-pointer"
                            title="Sao chép"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Account Holder */}
                      <div className="flex items-center justify-between p-3">
                        <span className="text-text-secondary">{isVi ? 'Chủ tài khoản' : 'Account name'}</span>
                        <span className="font-bold text-text-primary uppercase">
                          {order.bank_info?.account_name || 'LINGOSPHERE EDUCATION'}
                        </span>
                      </div>

                      {/* Transfer Content */}
                      <div className="flex items-center justify-between p-3 bg-amber-500/5">
                        <div>
                          <span className="text-text-secondary block">{isVi ? 'Nội dung chuyển khoản' : 'Transfer Memo'}</span>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            {isVi ? '*Bắt buộc giữ nguyên' : '*Must be exact'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400 text-sm tracking-wide bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {order.order_code}
                          </span>
                          <button
                            onClick={() => handleCopy(order.order_code, 'memo')}
                            className="p-1 text-amber-600 hover:scale-110 transition-transform cursor-pointer"
                            title="Sao chép nội dung"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="flex items-center justify-between p-3">
                        <span className="text-text-secondary">{isVi ? 'Số tiền' : 'Amount'}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                            {formattedTotal}
                          </span>
                          <button
                            onClick={() => handleCopy(String(totalAmount), 'amount')}
                            className="p-1 text-text-tertiary hover:text-emerald-600 transition-colors cursor-pointer"
                            title="Sao chép số tiền"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2">
                      <Button
                        onClick={handleManualCheck}
                        disabled={isCheckingStatus}
                        className="w-full h-11 text-xs font-bold rounded-xl bg-primary hover:bg-primary-hover text-white cursor-pointer shadow-lg shadow-primary/25 hover:shadow-primary/40 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isCheckingStatus ? (
                          <>
                            <RefreshCw size={15} className="animate-spin" />
                            <span>{isVi ? 'Đang đối soát chuyển khoản...' : 'Checking with Bank...'}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={15} />
                            <span>{isVi ? 'Tôi Đã Chuyển Khoản - Kiểm Tra Ngay' : 'I Have Transferred - Verify Payment'}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
