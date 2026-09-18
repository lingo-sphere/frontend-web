// Thành phần hiển thị mã VietQR, đếm ngược và thông tin tài khoản chuyển khoản ngân hàng trong modal checkout
'use client'

import { useState } from 'react'
import { Clock, Copy, QrCode, Check, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react'
import type { PaymentOrderResponse } from '@/features/upgrade/services/subscription.service'
import type { CheckoutCourseItem } from '@/features/courses/components/course.checkout.modal'
import { CheckoutOrderSummary } from '@/features/courses/components/checkout.order.summary'
import { Button } from '@/components/button'

interface CheckoutQrCardProps {
  order: PaymentOrderResponse
  courses: CheckoutCourseItem[]
  formattedTime: string
  formattedTotal: string
  totalAmount: number
  isVi: boolean
  isCheckingStatus: boolean
  onCopy: (text: string, fieldName: string) => void
  onManualCheck: () => void
}

export function CheckoutQrCard({
  order,
  courses,
  formattedTime,
  formattedTotal,
  totalAmount,
  isVi,
  isCheckingStatus,
  onCopy,
  onManualCheck,
}: CheckoutQrCardProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleLocalCopy = (text: string, key: string, label: string) => {
    onCopy(text, label)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const bankName = order.bank_info?.bank_name || 'MB Bank (Ngân hàng Quân Đội)'
  const accountNumber = order.bank_info?.account_number || '0332271390'
  const accountName = order.bank_info?.account_name || 'NGUYEN TAN NGHI'
  const memoCode = order.order_code

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      <div className="md:col-span-5 space-y-4">
        <CheckoutOrderSummary
          courses={courses}
          formattedTotal={formattedTotal}
          isVi={isVi}
        />

        <div className="rounded-2xl border border-border/80 bg-surface p-4 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 text-xs text-amber-700 dark:text-amber-400">
            <div className="flex items-center gap-1.5 font-bold whitespace-nowrap">
              <Clock size={14} className="animate-pulse text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{isVi ? 'Mã QR hết hạn sau:' : 'QR expires in:'}</span>
            </div>
            <span className="font-mono font-black text-sm tracking-wider whitespace-nowrap">
              {formattedTime}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white p-4 shadow-sm">
            <div className="relative aspect-square w-48 sm:w-52 overflow-hidden rounded-xl bg-white p-1">
              <img
                src={order.qr_url}
                alt="VietQR Payment"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-slate-700 text-center">
              <QrCode size={14} className="text-purple-600 shrink-0" />
              <span>
                {isVi ? 'Quét bằng App Ngân hàng hoặc Ví điện tử' : 'Scan with Banking or E-Wallet App'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="md:col-span-7 space-y-4">
        <div className="rounded-2xl border border-border/80 bg-surface p-4 sm:p-5 space-y-3.5 shadow-xs">
          <div className="border-b border-border/60 pb-2.5">
            <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">
              {isVi ? 'Thông tin chuyển khoản thủ công' : 'Manual Transfer Details'}
            </h3>
            <p className="text-[11px] text-text-tertiary mt-0.5">
              {isVi
                ? 'Nếu không thể quét mã QR, vui lòng chuyển khoản theo thông tin dưới đây:'
                : 'If you cannot scan the QR, please transfer using the details below:'}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-subtle/40 divide-y divide-border/60 text-xs">
            <div className="flex items-center justify-between gap-2 p-3">
              <span className="text-text-secondary whitespace-nowrap shrink-0">{isVi ? 'Ngân hàng nhận' : 'Bank'}</span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-text-primary text-right truncate">{bankName}</span>
                <button
                  type="button"
                  onClick={() => handleLocalCopy(bankName, 'bank', 'Ngân hàng')}
                  className="p-1.5 rounded-lg text-text-tertiary hover:text-purple-600 hover:bg-surface transition-colors cursor-pointer shrink-0"
                  title={isVi ? 'Sao chép' : 'Copy'}
                >
                  {copiedKey === 'bank' ? (
                    <Check size={13} className="text-emerald-500" />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 p-3 bg-purple-500/5">
              <span className="text-text-secondary whitespace-nowrap shrink-0">{isVi ? 'Số tài khoản' : 'Account number'}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-purple-600 dark:text-purple-400 text-sm sm:text-base whitespace-nowrap">
                  {accountNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleLocalCopy(accountNumber, 'acc', 'Số tài khoản')}
                  className="whitespace-nowrap shrink-0 px-2.5 py-1 rounded-lg bg-purple-600/10 hover:bg-purple-600 text-purple-600 dark:text-purple-400 hover:text-white transition-colors cursor-pointer text-[11px] font-bold flex items-center gap-1"
                  title={isVi ? 'Sao chép số tài khoản' : 'Copy account number'}
                >
                  {copiedKey === 'acc' ? (
                    <>
                      <Check size={12} />
                      <span>{isVi ? 'Đã sao chép' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>{isVi ? 'Sao chép' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 p-3">
              <span className="text-text-secondary whitespace-nowrap shrink-0">{isVi ? 'Chủ tài khoản' : 'Account name'}</span>
              <span className="font-bold text-text-primary uppercase tracking-wide whitespace-nowrap">
                {accountName}
              </span>
            </div>

            <div className="p-3.5 bg-amber-500/10 border-y border-amber-500/20 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <span className="font-bold text-text-primary text-xs whitespace-nowrap">
                  {isVi ? 'Nội dung chuyển khoản' : 'Transfer Memo'}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold whitespace-nowrap">
                  {isVi ? '*Bắt buộc giữ nguyên để xác nhận tự động' : '*Must be exact'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 bg-surface px-3 py-2 rounded-xl border border-amber-500/30">
                <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-base sm:text-lg tracking-wider whitespace-nowrap">
                  {memoCode}
                </span>
                <button
                  type="button"
                  onClick={() => handleLocalCopy(memoCode, 'memo', 'Nội dung chuyển khoản')}
                  className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  title={isVi ? 'Sao chép nội dung' : 'Copy memo'}
                >
                  {copiedKey === 'memo' ? (
                    <>
                      <Check size={13} />
                      <span>{isVi ? 'Đã sao chép' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>{isVi ? 'Sao chép mã' : 'Copy code'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 p-3">
              <span className="text-text-secondary whitespace-nowrap shrink-0">{isVi ? 'Số tiền thanh toán' : 'Amount'}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base sm:text-lg whitespace-nowrap">
                  {formattedTotal}
                </span>
                <button
                  type="button"
                  onClick={() => handleLocalCopy(String(totalAmount), 'amount', 'Số tiền')}
                  className="p-1.5 rounded-lg text-text-tertiary hover:text-emerald-600 hover:bg-surface transition-colors cursor-pointer shrink-0"
                  title={isVi ? 'Sao chép số tiền' : 'Copy amount'}
                >
                  {copiedKey === 'amount' ? (
                    <Check size={13} className="text-emerald-500" />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-700 dark:text-purple-300">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <p className="text-xs leading-relaxed">
              {isVi
                ? 'Hệ thống tự động kích hoạt khóa học ngay sau khi hoàn tất chuyển khoản.'
                : 'System activates your course automatically within seconds of receipt.'}
            </p>
          </div>

          <div className="pt-1">
            <Button
              onClick={onManualCheck}
              disabled={isCheckingStatus}
              className="w-full h-12 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white cursor-pointer shadow-md shadow-purple-600/25 hover:shadow-lg hover:shadow-purple-600/35 flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
            >
              {isCheckingStatus ? (
                <>
                  <RefreshCw size={16} className="animate-spin shrink-0" />
                  <span>
                    {isVi
                      ? 'Đang kiểm tra giao dịch với ngân hàng...'
                      : 'Checking with Bank...'}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>
                    {isVi
                      ? 'Tôi Đã Chuyển Khoản - Kích Hoạt Ngay'
                      : 'I Have Transferred - Activate Now'}
                  </span>
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-text-tertiary pt-0.5">
            <span className="flex items-center gap-1 whitespace-nowrap">
              <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
              <span>{isVi ? 'Bảo mật chuẩn VietQR' : 'Secure VietQR Standard'}</span>
            </span>
            <span>•</span>
            <span className="whitespace-nowrap">{isVi ? 'Hỗ trợ 24/7' : '24/7 Support'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
