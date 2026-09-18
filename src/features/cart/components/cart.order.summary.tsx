// Component hiển thị khung tóm tắt đơn hàng, mã giảm giá và nút tiến hành thanh toán VietQR
'use client'

import { ShieldCheck, Award, QrCode, Tag, Check, ArrowRight, Lock } from 'lucide-react'
import { formatCurrency } from '@/lib/format'

interface CartOrderSummaryProps {
  originalTotal: number
  finalTotal: number
  savings: number
  appliedPromo: string | null
  promoCode: string
  itemCount: number
  isVi: boolean
  onPromoCodeChange: (code: string) => void
  onApplyPromo: (e: React.FormEvent) => void
  onQuickApplyPromo: (code: string) => void
  onCheckout: () => void
}

export function CartOrderSummary({
  originalTotal,
  finalTotal,
  savings,
  appliedPromo,
  promoCode,
  itemCount,
  isVi,
  onPromoCodeChange,
  onApplyPromo,
  onQuickApplyPromo,
  onCheckout,
}: CartOrderSummaryProps) {
  const effectiveTotal = appliedPromo ? Math.round(finalTotal * 0.5) : finalTotal
  const totalSavings = (originalTotal - effectiveTotal) > 0 ? originalTotal - effectiveTotal : 0

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

          {appliedPromo && (
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 font-semibold">
              <span className="flex items-center gap-1">
                <Tag size={12} />
                <span>{isVi ? `Mã ${appliedPromo} (-50%):` : `Code ${appliedPromo} (-50%):`}</span>
              </span>
              <span>-{formatCurrency(Math.round(finalTotal * 0.5))}</span>
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
          <form onSubmit={onApplyPromo} className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
              <span className="flex items-center gap-1">
                <Tag size={12} />
                <span>{isVi ? 'Mã ưu đãi (Coupon code)' : 'Promo Code'}</span>
              </span>
              {appliedPromo && (
                <span className="text-emerald-600 dark:text-emerald-400 lowercase font-medium flex items-center gap-1">
                  <Check size={12} />
                  <span>{isVi ? 'Đã áp dụng' : 'Applied'}</span>
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="LINGO50"
                value={promoCode}
                onChange={(e) => onPromoCodeChange(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-tertiary focus:border-purple-600 focus:outline-none uppercase font-mono font-bold"
              />
              <button
                type="submit"
                className="rounded-xl bg-surface-hover hover:bg-purple-600 hover:text-white border border-border px-4 py-2.5 text-xs font-bold text-text-primary transition-colors cursor-pointer"
              >
                {isVi ? 'Áp dụng' : 'Apply'}
              </button>
            </div>
          </form>

          {!appliedPromo && (
            <div
              onClick={() => onQuickApplyPromo('LINGO50')}
              className="group p-2.5 rounded-xl border border-dashed border-purple-300 dark:border-purple-800/60 bg-purple-500/5 hover:bg-purple-500/10 cursor-pointer transition-colors flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🔥</span>
                <div className="min-w-0">
                  <span className="font-extrabold text-purple-600 dark:text-purple-400">LINGO50</span>
                  <span className="text-text-secondary text-[11px] ml-1.5 font-medium">
                    {isVi ? 'Giảm ngay 50%' : 'Save 50% instantly'}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                {isVi ? 'Áp dụng' : 'Apply'}
                <ArrowRight size={12} />
              </span>
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
