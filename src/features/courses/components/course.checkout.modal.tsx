/**
 * @file course.checkout.modal.tsx
 * @description Modal thanh toán chuyển khoản ngân hàng qua VietQR kèm xác thực tự động cho Khóa học LingoSphere
 */

'use client'

import { useTranslation } from 'react-i18next'
import { X, CheckCircle2, AlertCircle, RefreshCw, GraduationCap } from 'lucide-react'
import { Button } from '@/components/button'
import { useCourseCheckout, type CheckoutCourseItem } from '@/features/courses/hooks/use.course.checkout'
import { CheckoutOrderSummary } from '@/features/courses/components/checkout.order.summary'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-md transition-opacity" />

      <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="overflow-hidden rounded-3xl bg-surface shadow-2xl border border-border">
          <div className="relative px-6 pt-6 pb-4 border-b border-border/60 bg-surface">
            <button
              type="button"
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
                  {isVi
                    ? 'Quét mã VietQR chuyển khoản tự động xác thực'
                    : 'Scan VietQR for instant activation'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 max-h-[82vh] overflow-y-auto space-y-5">
            {step === 'SUCCESS' && <CheckoutSuccessView isVi={isVi} />}

            {step === 'PAYMENT_QR' && (
              <>
                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-600 border border-rose-500/20">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <CheckoutOrderSummary
                  courses={courses}
                  formattedTotal={formattedTotal}
                  isVi={isVi}
                />

                {isSubmitting || !order ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-xs text-text-secondary">
                      {isVi ? 'Đang tạo mã VietQR thanh toán...' : 'Generating VietQR code...'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <CheckoutQrCard
                      order={order}
                      formattedTime={formattedTime}
                      formattedTotal={formattedTotal}
                      totalAmount={totalAmount}
                      isVi={isVi}
                      onCopy={handleCopy}
                    />

                    <div className="pt-2">
                      <Button
                        onClick={handleManualCheck}
                        disabled={isCheckingStatus}
                        className="w-full h-11 text-xs font-bold rounded-xl bg-primary hover:bg-primary-hover text-white cursor-pointer shadow-lg shadow-primary/25 hover:shadow-primary/40 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isCheckingStatus ? (
                          <>
                            <RefreshCw size={15} className="animate-spin" />
                            <span>
                              {isVi
                                ? 'Đang đối soát chuyển khoản...'
                                : 'Checking with Bank...'}
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={15} />
                            <span>
                              {isVi
                                ? 'Tôi Đã Chuyển Khoản - Kiểm Tra Ngay'
                                : 'I Have Transferred - Verify Payment'}
                            </span>
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
