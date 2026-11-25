// Component hiển thị khung tóm tắt đơn hàng, thẻ ưu đãi giảm giá và nút tiến hành thanh toán VietQR
'use client'

import { QrCode, Tag, Check, ArrowRight, Lock, Gift, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import type { UserVoucher } from '@/features/vouchers/types/voucher'

interface CartOrderSummaryProps {
  originalTotal: number
  finalTotal: number
  savings: number
  appliedVoucher: UserVoucher | null
  voucherCodeInput: string
  itemCount: number
  isVi: boolean
  onVoucherCodeChange: (code: string) => void
  onApplyVoucherCode: (e: React.FormEvent) => void
  onRemoveVoucher: () => void
  onOpenVoucherModal: () => void
  onCheckout: () => void
}

export function CartOrderSummary({
  originalTotal,
  finalTotal,
  savings,
  appliedVoucher,
  voucherCodeInput,
  itemCount,
  isVi,
  onVoucherCodeChange,
  onApplyVoucherCode,
  onRemoveVoucher,
  onOpenVoucherModal,
  onCheckout,
}: CartOrderSummaryProps) {
  const voucherDiscount = appliedVoucher
    ? Math.round(finalTotal * (appliedVoucher.discount_percent / 100))
    : 0
  const effectiveTotal = Math.max(0, finalTotal - voucherDiscount)
  const totalSavings = Math.max(0, originalTotal - effectiveTotal)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-base font-extrabold text-text-primary flex items-center gap-2">
            <Lock size={16} className="text-purple-600 dark:text-purple-400" />
            <span>{isVi ? 'Tóm tắt đơn hàng' : 'Order Summary'}</span>
          </h2>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-subtle text-text-secondary border border-border">
            {itemCount} {isVi ? 'khóa học' : 'items'}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between text-text-secondary">
            <span>{isVi ? 'Tổng giá gốc:' : 'Original Price:'}</span>
            <span className="font-semibold">{formatCurrency(originalTotal)}</span>
          </div>

          {savings > 0 && (
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>{isVi ? 'Giảm giá ưu đãi:' : 'Direct Discount:'}</span>
              <span>-{formatCurrency(savings)}</span>
            </div>
          )}

          {appliedVoucher && (
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 font-semibold">
              <span className="flex items-center gap-1">
                <Tag size={12} />
                <span>
                  {isVi
                    ? `Thẻ ${appliedVoucher.code} (-${appliedVoucher.discount_percent}%):`
                    : `Voucher ${appliedVoucher.code} (-${appliedVoucher.discount_percent}%):`}
                </span>
              </span>
              <span>-{formatCurrency(voucherDiscount)}</span>
            </div>
          )}

          {totalSavings > 0 && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center justify-between">
              <span>{isVi ? 'Tổng bạn đã tiết kiệm:' : 'Total Savings:'}</span>
              <span>{formatCurrency(totalSavings)}</span>
            </div>
          )}

          <div className="border-t border-border pt-4 flex items-baseline justify-between">
            <div>
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                {isVi ? 'Tổng thanh toán' : 'Total Amount'}
              </span>
              <span className="text-[11px] text-text-tertiary">
                {isVi ? '(Đã bao gồm VAT nếu có)' : '(VAT included)'}
              </span>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
              {formatCurrency(effectiveTotal)}
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
            <span className="flex items-center gap-1">
              <Tag size={12} />
              <span>{isVi ? 'Thẻ ưu đãi học tập (Voucher)' : 'Learning Voucher'}</span>
            </span>
            {appliedVoucher && (
              <span className="text-emerald-600 dark:text-emerald-400 lowercase font-medium flex items-center gap-1">
                <Check size={12} />
                <span>{isVi ? 'Đã áp dụng' : 'Applied'}</span>
              </span>
            )}
          </div>

          {appliedVoucher ? (
            <div className="p-3 rounded-2xl border border-purple-500/30 bg-purple-500/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Tag size={14} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-xs text-purple-600 dark:text-purple-400">
                      {appliedVoucher.code}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-purple-600 text-white">
                      -{appliedVoucher.discount_percent}%
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary truncate">{appliedVoucher.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onRemoveVoucher}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                title={isVi ? 'Gỡ bỏ mã' : 'Remove voucher'}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={onOpenVoucherModal}
                className="w-full p-2.5 rounded-xl border border-dashed border-purple-400 dark:border-purple-800/80 bg-purple-500/5 hover:bg-purple-500/15 cursor-pointer transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 font-bold text-purple-600 dark:text-purple-400">
                  <Gift size={14} />
                  <span>{isVi ? 'Chọn từ kho thẻ ưu đãi của bạn' : 'Select from your vouchers'}</span>
                </div>
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-0.5">
                  {isVi ? 'Xem thẻ' : 'View'}
                  <ArrowRight size={12} />
                </span>
              </button>

              <form onSubmit={onApplyVoucherCode} className="flex gap-2">
                <input
                  type="text"
                  placeholder={isVi ? 'Nhập mã thẻ nếu có...' : 'Enter voucher code...'}
                  value={voucherCodeInput}
                  onChange={(e) => onVoucherCodeChange(e.target.value)}
                  className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:border-purple-600 focus:outline-none uppercase font-mono font-bold"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-surface-hover hover:bg-purple-600 hover:text-white border border-border px-3.5 py-2 text-xs font-bold text-text-primary transition-colors cursor-pointer"
                >
                  {isVi ? 'Áp dụng' : 'Apply'}
                </button>
              </form>
            </div>
          )}
        </div>

        <button
          onClick={onCheckout}
          disabled={itemCount === 0}
          className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm py-4 transition-all shadow-md shadow-purple-600/25 hover:shadow-lg hover:shadow-purple-600/35 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <QrCode size={18} className="group-hover:scale-110 transition-transform" />
          <span>{isVi ? 'Thanh toán chuyển khoản VietQR' : 'Proceed to VietQR Checkout'}</span>
        </button>

        <p className="text-center text-[11px] text-text-tertiary">
          {isVi
            ? 'Hỗ trợ chuyển khoản ngân hàng 24/7 qua mã VietQR, xác nhận tự động.'
            : 'Supports 24/7 bank transfer via VietQR with automated verification.'}
        </p>
      </div>
    </div>
  )
}
