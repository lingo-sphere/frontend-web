/**
 * @file checkout.success.view.tsx
 * @description Màn hình thông báo thanh toán và mở khóa khóa học thành công
 */

import { CheckCircle2, Sparkles } from 'lucide-react'

interface CheckoutSuccessViewProps {
  isVi: boolean
}

export function CheckoutSuccessView({ isVi }: CheckoutSuccessViewProps) {
  return (
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
  )
}
