/**
 * @file upgrade.success.view.tsx
 * @description Thành phần hiển thị thông báo và hiệu ứng kích hoạt VIP thành công sau khi chuyển khoản
 */

'use client'

import { CheckCircle2, Sparkles } from 'lucide-react'

interface UpgradeSuccessViewProps {
  isVietnamese: boolean
}

export function UpgradeSuccessView({ isVietnamese }: UpgradeSuccessViewProps) {
  return (
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
        <span>
          {isVietnamese ? 'Đang chuyển đến khóa học...' : 'Redirecting...'}
        </span>
      </div>
    </div>
  )
}
