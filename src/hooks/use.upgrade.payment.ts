// Custom hook quản lý luồng chọn gói đăng ký, tạo đơn thanh toán VietQR và kiểm tra thanh toán
import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/auth.store'
import {
  subscriptionService,
  type PaymentOrderResponse,
} from '@/services/subscription.service'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { toast } from '@/store/toast.store'
import { getRemainingSubscriptionText } from '@/components/layout/header.utils'
import { getPlans, type Plan } from '@/components/upgrade/upgrade.data'

interface UseUpgradePaymentOptions {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function useUpgradePayment({ open, onOpenChange }: UseUpgradePaymentOptions) {
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
  const [plans, setPlans] = useState<Plan[]>(getPlans())

  useEffect(() => {
    let isMounted = true
    subscriptionService
      .getPlans()
      .then((raw: any) => {
        if (!isMounted) return
        const dbPlans = Array.isArray(raw) ? raw : raw?.data || []
        if (!Array.isArray(dbPlans) || dbPlans.length === 0) return

        const activePaidPlans = dbPlans
          .filter(
            (dp: any) =>
              dp.slug !== 'free' &&
              dp.plan_type !== 'FREE' &&
              dp.tier > 0 &&
              dp.is_active !== false
          )
          .sort((a: any, b: any) => (a.tier || 0) - (b.tier || 0))

        if (activePaidPlans.length === 0) return

        const mappedPlans: Plan[] = activePaidPlans.map((dp: any) => {
          const isMonthly = dp.slug === 'vip-1-month' || dp.billing_cycle === 'MONTHLY'
          const isQuarterly = dp.slug === 'vip-3-month' || dp.billing_cycle === 'QUARTERLY'
          const isYearly = dp.slug === 'vip-1-year' || dp.billing_cycle === 'YEARLY'
          const isLifetime = dp.slug === 'vip-lifetime' || dp.billing_cycle === 'LIFETIME'

          const id = isMonthly
            ? '1-month'
            : isQuarterly
            ? '3-month'
            : isYearly
            ? '12-month'
            : isLifetime
            ? 'lifetime'
            : dp.slug

          const cycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'LIFETIME' = isMonthly
            ? 'MONTHLY'
            : isQuarterly
            ? 'QUARTERLY'
            : isYearly
            ? 'YEARLY'
            : 'LIFETIME'

          const duration =
            isLifetime || dp.duration_days >= 36500
              ? { en: 'Lifetime', vi: 'Vĩnh viễn' }
              : isYearly || dp.duration_days >= 365
              ? { en: '1 Year', vi: '1 năm' }
              : isQuarterly || dp.duration_days >= 90
              ? { en: '3 Months', vi: '3 tháng' }
              : { en: '1 Month', vi: '1 tháng' }

          const formattedPerMonth = isMonthly
            ? `${new Intl.NumberFormat('vi-VN').format(dp.price)}đ/tháng`
            : isQuarterly
            ? `~${new Intl.NumberFormat('vi-VN').format(Math.round(dp.price / 3))}đ/tháng`
            : isYearly
            ? `~${new Intl.NumberFormat('vi-VN').format(Math.round(dp.price / 12))}đ/tháng`
            : 'Trọn đời'

          return {
            id,
            cycle,
            duration,
            price: Number(dp.price),
            originalPrice:
              dp.original_price && Number(dp.original_price) > Number(dp.price)
                ? Number(dp.original_price)
                : undefined,
            perMonth: {
              en: formattedPerMonth,
              vi: formattedPerMonth,
            },
            discount:
              dp.discount ||
              (dp.original_price && Number(dp.original_price) > Number(dp.price)
                ? `-${Math.round(((dp.original_price - dp.price) / dp.original_price) * 100)}%`
                : undefined),
            recommended: Boolean(dp.is_popular),
          }
        })

        setPlans(mappedPlans)

        setSelectedPlan((curr) => {
          const stillExists = mappedPlans.some((p) => p.id === curr)
          if (stillExists) return curr
          const popular = mappedPlans.find((p) => p.recommended)
          return popular ? popular.id : mappedPlans[0]?.id || '12-month'
        })
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [])

  const isPremium = Boolean(user?.is_premium || user?.subscription_expires_at)
  const remainingTimeText = isPremium
    ? getRemainingSubscriptionText(
        user?.subscription_expires_at,
        user?.subscription_plan,
        isVietnamese
      )
    : ''

  const currentExpDate = user?.subscription_expires_at
    ? new Date(user.subscription_expires_at)
    : null
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
    const daysToAdd =
      selectedPlan === '1-month' ? 30 : selectedPlan === '3-month' ? 90 : 365
    const now = Date.now()
    const baseTime =
      currentExpDate && currentExpDate.getTime() > now
        ? currentExpDate.getTime()
        : now
    const newDate = new Date(baseTime + daysToAdd * 24 * 60 * 60 * 1000)
    const formatted = newDate.toLocaleDateString(
      isVietnamese ? 'vi-VN' : 'en-US',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    )
    const planName =
      selectedPlan === '1-month'
        ? '+30 ngày'
        : selectedPlan === '3-month'
        ? '+90 ngày'
        : '+1 năm'
    return isVietnamese
      ? `Đến ngày ${formatted} (${planName})`
      : `Until ${formatted} (${planName})`
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
      storage.set(STORAGE_KEYS.USER, updatedUser)
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
      const res = await subscriptionService.getPaymentOrderStatus(
        currentOrder.order_code
      )
      const status =
        res?.status ||
        (res as unknown as { data?: { status?: string } })?.data?.status
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

  const handleCreateOrder = async () => {
    if (!isAuthenticated || !user) {
      toast.warning(
        isVietnamese
          ? 'Vui lòng đăng nhập để nâng cấp gói Premium!'
          : 'Please log in to upgrade to Premium!',
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
      const res = await subscriptionService.getPaymentOrderStatus(
        order.order_code
      )
      const status =
        res?.status ||
        (res as unknown as { data?: { status?: string } })?.data?.status
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
        isVietnamese
          ? 'Không thể kiểm tra trạng thái lúc này. Vui lòng thử lại.'
          : 'Failed to check status. Please try again.',
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
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(
    seconds
  ).padStart(2, '0')}`

  return {
    isVietnamese,
    selectedPlan,
    setSelectedPlan,
    step,
    setStep,
    isSubmitting,
    isCheckingStatus,
    order,
    copiedField,
    errorMessage,
    plans,
    user,
    isPremium,
    remainingTimeText,
    formattedCurrentExp,
    calculateNewExpiryDate,
    stopAllTimers,
    handleCreateOrder,
    handleManualCheck,
    handleCopy,
    formattedTime,
  }
}
