/**
 * @file use.course.checkout.ts
 * @description Hook quản lý tiến trình thanh toán đơn hàng khóa học qua VietQR, đồng hồ đếm ngược và kiểm tra đối soát
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import { useEnrollmentStore } from '@/store/enrollment.store'
import { courseService } from '@/services/course.service'
import { subscriptionService, type PaymentOrderResponse } from '@/services/subscription.service'
import { toast } from '@/store/toast.store'

export interface CheckoutCourseItem {
  id: string
  title: string
  price: number
  thumbnail?: string
}

interface UseCourseCheckoutOptions {
  open: boolean
  courses: CheckoutCourseItem[]
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  isVi: boolean
}

export function useCourseCheckout({
  open,
  courses,
  onOpenChange,
  onSuccess,
  isVi,
}: UseCourseCheckoutOptions) {
  const { user, isAuthenticated } = useAuthStore()

  const [step, setStep] = useState<'PAYMENT_QR' | 'SUCCESS'>('PAYMENT_QR')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [order, setOrder] = useState<PaymentOrderResponse | null>(null)
  const [, setCopiedField] = useState<string | null>(null)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(900)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const orderRef = useRef<PaymentOrderResponse | null>(null)
  orderRef.current = order

  const totalAmount = courses.reduce((acc, c) => acc + (c.price || 0), 0)
  const formattedTotal =
    totalAmount > 0 ? `₫${totalAmount.toLocaleString('vi-VN')}` : 'Miễn phí'

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
      await Promise.all(courses.map((c) => courseService.enrollCourse(c.id).catch(() => null)))
      courses.forEach((c) => useEnrollmentStore.getState().addEnrolledCourse(c.id))
      await useEnrollmentStore.getState().fetchMyEnrollments()
      await useCartStore.getState().clearCart().catch(() => null)
    } catch {}

    toast.success(
      isVi
        ? 'Đã kích hoạt khóa học thành công! Chúc bạn học tốt!'
        : 'Course enrolled successfully!',
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
      const status =
        res?.status || (res as unknown as { data?: { status?: string } })?.data?.status
      if (status === 'PAID') {
        handlePaymentSuccess()
        return true
      }
    } catch {}
    return false
  }, [handlePaymentSuccess])

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
  }, [
    open,
    courses.length,
    totalAmount,
    isAuthenticated,
    user,
    isVi,
    onOpenChange,
    stopAllTimers,
  ])

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

  const handleManualCheck = async () => {
    if (!order?.order_code) return
    setIsCheckingStatus(true)
    try {
      const res = await subscriptionService.getPaymentOrderStatus(order.order_code)
      const status =
        res?.status || (res as unknown as { data?: { status?: string } })?.data?.status
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
        isVi
          ? 'Không thể kiểm tra trạng thái lúc này. Vui lòng thử lại.'
          : 'Failed to check status. Please try again.',
        isVi ? 'Lỗi kết nối' : 'Connection Error'
      )
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const minutes = Math.floor(timeLeftSeconds / 60)
  const seconds = timeLeftSeconds % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return {
    step,
    isSubmitting,
    isCheckingStatus,
    order,
    timeLeftSeconds,
    errorMessage,
    formattedTotal,
    totalAmount,
    formattedTime,
    handleCopy,
    handleManualCheck,
    stopAllTimers,
  }
}
