// Modal thanh toán chuyển khoản ngân hàng qua VietQR kèm xác thực tự động cho Khóa học LingoSphere
'use client'

import { useTranslation } from 'react-i18next'
import { X, AlertCircle, RefreshCw, GraduationCap, ShieldCheck } from 'lucide-react'
import { useCourseCheckout, type CheckoutCourseItem } from '@/features/courses/hooks/use.course.checkout'
import { CheckoutQrCard } from '@/features/courses/components/checkout.qr.card'
import { CheckoutSuccessView } from '@/features/courses/components/checkout.success.view'

export type { CheckoutCourseItem }

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

  const {
    step,
    isSubmitting,
    isCheckingStatus,
    order,
    errorMessage,
    formattedTotal,
    totalAmount,
    formattedTime,
    handleCopy,
    handleManualCheck,
    stopAllTimers,
  } = useCourseCheckout({
    open,
    courses,
    onOpenChange,
    onSuccess,
    isVi,
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => {
          stopAllTimers()
          onOpenChange(false)
        }}
      />

      <div className="relative z-10 w-full max-w-4xl lg:max-w-5xl my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="overflow-hidden rounded-3xl bg-surface shadow-2xl border border-border/80">
          <div className="relative px-6 py-4 sm:px-8 sm:py-5 border-b border-border/60 bg-surface flex items-center justify-between">
            <div className="flex items-center gap-3.5 pr-8">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20 ring-4 ring-purple-600/10">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold tracking-tight text-text-primary truncate">
                    {isVi ? 'Thanh toán Khóa học' : 'Course Checkout'}
                  </h2>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    <ShieldCheck size={12} />
                    <span>VietQR 24/7</span>
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5 truncate">
                  {isVi
                    ? 'Quét mã VietQR chuyển khoản tự động xác thực trong 30 giây'
                    : 'Scan VietQR for instant automatic activation'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                stopAllTimers()
                onOpenChange(false)
              }}
              className="rounded-full p-2 text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer shrink-0"
              title={isVi ? 'Đóng' : 'Close'}
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-5 sm:p-6 md:p-7 max-h-[85vh] overflow-y-auto">
            {step === 'SUCCESS' && <CheckoutSuccessView isVi={isVi} />}

            {step === 'PAYMENT_QR' && (
              <div className="space-y-4">
                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-3.5 text-xs text-rose-600 border border-rose-500/20">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {isSubmitting || !order ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-3.5">
                    <div className="p-4 rounded-full bg-purple-500/10 text-purple-600">
                      <RefreshCw className="h-8 w-8 animate-spin" />
                    </div>
                    <p className="text-sm font-semibold text-text-secondary">
                      {isVi ? 'Đang tạo mã VietQR thanh toán cho bạn...' : 'Generating VietQR code...'}
                    </p>
                  </div>
                ) : (
                  <CheckoutQrCard
                    order={order}
                    courses={courses}
                    formattedTime={formattedTime}
                    formattedTotal={formattedTotal}
                    totalAmount={totalAmount}
                    isVi={isVi}
                    isCheckingStatus={isCheckingStatus}
                    onCopy={handleCopy}
                    onManualCheck={handleManualCheck}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
