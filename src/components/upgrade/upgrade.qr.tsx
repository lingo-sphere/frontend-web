'use client'

/**
 * @file UpgradePaymentQrStep.tsx
 * @description Màn hình bước 2 hiển thị mã QR VietQR, thông tin tài khoản ngân hàng và kiểm tra trạng thái
 */

import {
  Clock,
  Copy,
  Check,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PaymentOrderResponse } from '@/services/subscription.service'

interface UpgradePaymentQrStepProps {
  order: PaymentOrderResponse
  formattedTime: string
  copiedField: string | null
  onCopy: (text: string, field: string) => void
  isCheckingStatus: boolean
  onManualCheck: () => void
  isVi: boolean
}

export function UpgradePaymentQrStep({
  order,
  formattedTime,
  copiedField,
  onCopy,
  isCheckingStatus,
  onManualCheck,
  isVi,
}: UpgradePaymentQrStepProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center justify-between w-full rounded-xl bg-amber-500/10 px-4 py-2.5 border border-amber-500/20 text-xs">
        <div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300">
          <Clock size={15} />
          <span>{isVi ? 'Mã QR hết hạn sau:' : 'QR expires in:'}</span>
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
          <span className="text-text-secondary font-medium">{isVi ? 'Ngân hàng:' : 'Bank:'}</span>
          <span className="font-bold text-text-primary">{order.bank_info.bank_name}</span>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-3.5 py-2.5 border border-border/60">
          <span className="text-text-secondary font-medium">{isVi ? 'Số tài khoản:' : 'Account No:'}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-extrabold text-primary text-sm tracking-wide">
              {order.bank_info.account_number}
            </span>
            <button
              onClick={() => onCopy(order.bank_info.account_number, 'stk')}
              className="rounded-lg p-1.5 text-text-secondary hover:bg-surface hover:text-text-primary transition-colors cursor-pointer"
              title={isVi ? 'Sao chép STK' : 'Copy account number'}
            >
              {copiedField === 'stk' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-3.5 py-2.5 border border-border/60">
          <span className="text-text-secondary font-medium">{isVi ? 'Chủ tài khoản:' : 'Account Name:'}</span>
          <span className="font-bold text-text-primary">{order.bank_info.account_name}</span>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-3.5 py-2.5 border border-border/60">
          <span className="text-text-secondary font-medium">{isVi ? 'Số tiền:' : 'Amount:'}</span>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-text-primary text-sm">
              {order.amount.toLocaleString(isVi ? 'vi-VN' : 'en-US')} đ
            </span>
            <button
              onClick={() => onCopy(String(order.amount), 'amount')}
              className="rounded-lg p-1.5 text-text-secondary hover:bg-surface hover:text-text-primary transition-colors cursor-pointer"
              title={isVi ? 'Sao chép số tiền' : 'Copy amount'}
            >
              {copiedField === 'amount' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-amber-500/10 px-3.5 py-2.5 border border-amber-500/30">
          <div>
            <span className="text-amber-900 dark:text-amber-300 font-bold block">
              {isVi ? 'Nội dung chuyển khoản:' : 'Transfer code:'}
            </span>
            <span className="text-[10px] text-amber-700/90 dark:text-amber-400">
              {isVi ? '(Bắt buộc để tự động kích hoạt)' : '(Required for auto activation)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-extrabold text-amber-900 dark:text-amber-200 text-sm tracking-wider bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
              {order.order_code}
            </span>
            <button
              onClick={() => onCopy(order.order_code, 'code')}
              className="rounded-lg p-1.5 bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-sm cursor-pointer"
              title={isVi ? 'Sao chép nội dung' : 'Copy code'}
            >
              {copiedField === 'code' ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs font-medium text-text-secondary">
        <Loader2 size={15} className="animate-spin text-primary" />
        <span>{isVi ? 'Đang chờ xác nhận chuyển khoản từ ngân hàng...' : 'Waiting for bank confirmation...'}</span>
      </div>

      <div className="w-full border-t border-border pt-3">
        <Button
          size="sm"
          disabled={isCheckingStatus}
          onClick={onManualCheck}
          className="w-full h-11 text-xs font-bold rounded-xl bg-primary hover:bg-primary-hover text-white cursor-pointer shadow-lg shadow-primary/25 hover:shadow-primary/40 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isCheckingStatus ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {isVi ? 'Đang đối soát chuyển khoản...' : 'Checking with Bank...'}
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={15} />
              {isVi ? 'Tôi Đã Chuyển Khoản - Kiểm Tra Ngay' : 'I Have Transferred - Verify Payment'}
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
