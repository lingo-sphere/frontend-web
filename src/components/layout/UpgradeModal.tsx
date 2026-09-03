'use client'

/**
 * @file UpgradeModal.tsx
 * @description Modal nâng cấp LingoSphere Premium VIP điều phối các bước thanh toán và gia hạn
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { X, ArrowLeft, Crown } from 'lucide-react'

import { useAuthStore } from '@/store/auth-store'
import { subscriptionService, type PaymentOrderResponse } from '@/services/subscription.service'
import { API_CONFIG } from '@/config/api.config'
import { toast } from '@/store/toast-store'
import { getRemainingSubscriptionText } from '@/components/layout/header-utils'
import { getPlans } from '@/components/upgrade/upgrade-data'
import { UpgradeSelectPlanStep } from '@/components/upgrade/UpgradeSelectPlanStep'
import { UpgradePaymentQrStep } from '@/components/upgrade/UpgradePaymentQrStep'
import { UpgradeSuccessStep } from '@/components/upgrade/UpgradeSuccessStep'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [selectedPlan, setSelectedPlan] = useState('12-month')
  const [step, setStep] = useState<'SELECT_PLAN' | 'PAYMENT_QR' | 'SUCCESS'>('SELECT_PLAN')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
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

  const isPremium = Boolean(user?.is_premium || user?.subscription_expires_at)
  const remainingTimeText = isPremium
    ? getRemainingSubscriptionText(user?.subscription_expires_at, user?.subscription_plan, isVietnamese)
    : ''

  const currentExpDate = user?.subscription_expires_at ? new Date(user.subscription_expires_at) : null
  const formattedCurrentExp = currentExpDate
    ? currentExpDate.toLocaleDateString(isVietnamese ? 'vi-VN' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null

  const calculateNewExpiryDate = () => {
    if (selectedPlan === 'lifetime') {
      return isVietnamese ? 'Vĩnh viễn (Trọn đời)' : 'Lifetime Access'
    }
    const daysToAdd = selectedPlan === '1-month' ? 30 : selectedPlan === '3-month' ? 90 : 365
    const now = Date.now()
    const baseTime = currentExpDate && currentExpDate.getTime() > now ? currentExpDate.getTime() : now
    const newDate = new Date(baseTime + daysToAdd * 24 * 60 * 60 * 1000)
    const formatted = newDate.toLocaleDateString(isVietnamese ? 'vi-VN' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    const planName = selectedPlan === '1-month' ? '+30 ngày' : selectedPlan === '3-month' ? '+90 ngày' : '+1 năm'
    return isVietnamese ? `Đến ngày ${formatted} (${planName})` : `Until ${formatted} (${planName})`
  }

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

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success(
      isVietnamese ? `Đã sao chép: ${text}` : `Copied: ${text}`,
      isVietnamese ? 'Sao chép thành công' : 'Copied'
    )
    setTimeout(() => setCopiedField(null), 2000)
  }

  const minutes = Math.floor(timeLeftSeconds / 60)
  const seconds = timeLeftSeconds % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          stopAllTimers()
          onOpenChange(false)
        }}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div
          className="relative w-full max-w-lg transform rounded-3xl bg-surface border border-border text-left shadow-2xl transition-all duration-300 animate-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative p-5 sm:p-6 pb-4 border-b border-border">
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
                    ? isVietnamese ? 'Quét mã VietQR chuyển khoản tự động' : 'Scan VietQR to pay automatically'
                    : isVietnamese ? 'Mở khóa toàn bộ tính năng - học bứt phá không giới hạn' : 'Unlock everything - learn 10x faster'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto space-y-5">
            {step === 'SUCCESS' && (
              <UpgradeSuccessStep isVi={isVietnamese} />
            )}

            {step === 'SELECT_PLAN' && (
              <UpgradeSelectPlanStep
                plans={plans}
                selectedPlan={selectedPlan}
                onSelectPlan={setSelectedPlan}
                isPremium={isPremium}
                userPlan={user?.subscription_plan}
                remainingTimeText={remainingTimeText}
                formattedCurrentExp={formattedCurrentExp}
                calculatedNewExpiry={calculateNewExpiryDate()}
                isSubmitting={isSubmitting}
                onSubmitOrder={handleCreateOrder}
                errorMessage={errorMessage}
                isVi={isVietnamese}
              />
            )}

            {step === 'PAYMENT_QR' && order && (
              <UpgradePaymentQrStep
                order={order}
                formattedTime={formattedTime}
                copiedField={copiedField}
                onCopy={handleCopy}
                isCheckingStatus={isCheckingStatus}
                onManualCheck={handleManualCheck}
                isVi={isVietnamese}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
