/**
 * @file checkout.qr.card.tsx
 * @description Card hiển thị mã VietQR, đồng hồ đếm ngược và thông tin tài khoản chuyển khoản ngân hàng
 */

import { Clock, Copy, QrCode } from 'lucide-react'
import type { PaymentOrderResponse } from '@/services/subscription.service'

interface CheckoutQrCardProps {
  order: PaymentOrderResponse
  formattedTime: string
  formattedTotal: string
  totalAmount: number
  isVi: boolean
  onCopy: (text: string, fieldName: string) => void
}

export function CheckoutQrCard({
  order,
  formattedTime,
  formattedTotal,
  totalAmount,
  isVi,
  onCopy,
}: CheckoutQrCardProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 text-xs text-amber-700 dark:text-amber-400">
        <div className="flex items-center gap-2 font-medium">
          <Clock size={14} className="animate-pulse text-amber-600 dark:text-amber-400" />
          <span>{isVi ? 'Mã QR hết hạn sau:' : 'QR expires in:'}</span>
        </div>
        <span className="font-mono font-extrabold text-sm tracking-wider">
          {formattedTime}
        </span>
      </div>

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
          <span>
            {isVi ? 'Mở App Ngân hàng bất kỳ để quét mã' : 'Open any Banking App to scan'}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface divide-y divide-border text-xs">
        <div className="flex items-center justify-between p-3">
          <span className="text-text-secondary">{isVi ? 'Ngân hàng' : 'Bank'}</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-text-primary">
              {order.bank_info?.bank_name || 'MB Bank'}
            </span>
            <button
              type="button"
              onClick={() => onCopy(order.bank_info?.bank_name || 'MB Bank', 'bank')}
              className="p-1 text-text-tertiary hover:text-primary transition-colors cursor-pointer"
              title="Sao chép"
            >
              <Copy size={13} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-surface-subtle/30">
          <span className="text-text-secondary">{isVi ? 'Số tài khoản' : 'Account number'}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-extrabold text-primary text-sm">
              {order.bank_info?.account_number || '0987654321'}
            </span>
            <button
              type="button"
              onClick={() => onCopy(order.bank_info?.account_number || '0987654321', 'acc')}
              className="p-1 text-primary hover:scale-110 transition-transform cursor-pointer"
              title="Sao chép"
            >
              <Copy size={13} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3">
          <span className="text-text-secondary">{isVi ? 'Chủ tài khoản' : 'Account name'}</span>
          <span className="font-bold text-text-primary uppercase">
            {order.bank_info?.account_name || 'LINGOSPHERE EDUCATION'}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-amber-500/5">
          <div>
            <span className="text-text-secondary block">
              {isVi ? 'Nội dung chuyển khoản' : 'Transfer Memo'}
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
              {isVi ? '*Bắt buộc giữ nguyên' : '*Must be exact'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400 text-sm tracking-wide bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {order.order_code}
            </span>
            <button
              type="button"
              onClick={() => onCopy(order.order_code, 'memo')}
              className="p-1 text-amber-600 hover:scale-110 transition-transform cursor-pointer"
              title="Sao chép nội dung"
            >
              <Copy size={13} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3">
          <span className="text-text-secondary">{isVi ? 'Số tiền' : 'Amount'}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
              {formattedTotal}
            </span>
            <button
              type="button"
              onClick={() => onCopy(String(totalAmount), 'amount')}
              className="p-1 text-text-tertiary hover:text-emerald-600 transition-colors cursor-pointer"
              title="Sao chép số tiền"
            >
              <Copy size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
