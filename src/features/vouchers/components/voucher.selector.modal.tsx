// Modal cho phép học viên xem và chọn thẻ ưu đãi giảm giá áp dụng vào đơn hàng
'use client'

import { Gift, Flame, Tag, Check, Calendar } from 'lucide-react'
import { Modal } from '@/components/modal'
import { useMyVouchers } from '@/features/vouchers/hooks/use.vouchers.query'
import type { UserVoucher } from '@/features/vouchers/types/voucher'

interface VoucherSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedVoucherCode: string | null
  orderType?: 'COURSE' | 'SUBSCRIPTION'
  isVi: boolean
  onSelectVoucher: (voucher: UserVoucher) => void
}

export function VoucherSelectorModal({
  open,
  onOpenChange,
  selectedVoucherCode,
  orderType = 'COURSE',
  isVi,
  onSelectVoucher,
}: VoucherSelectorModalProps) {
  const { data: vouchers, isLoading } = useMyVouchers(open)

  const availableVouchers = (vouchers || []).filter((v) => {
    if (v.status !== 'AVAILABLE') return false
    if (new Date(v.expires_at) < new Date()) return false
    if (Array.isArray(v.applicable_to) && v.applicable_to.length > 0 && !v.applicable_to.includes(orderType)) {
      return false
    }
    return true
  })

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString)
      return d.toLocaleDateString(isVi ? 'vi-VN' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isVi ? 'Kho thẻ ưu đãi của bạn' : 'Your Discount Vouchers'}
      size="lg"
    >
      <div className="space-y-3 pt-1">
        <p className="text-xs text-text-secondary">
          {isVi
            ? 'Chọn thẻ ưu đãi tích lũy từ chuỗi học tập để được giảm giá thanh toán.'
            : 'Select an earned voucher from your learning streak to get a discount.'}
        </p>

        <div className="max-h-[60vh] overflow-y-auto space-y-3 pt-2">
          {isLoading && (
            <div className="space-y-3 animate-pulse">
              <div className="h-20 bg-surface-subtle rounded-2xl" />
              <div className="h-20 bg-surface-subtle rounded-2xl" />
            </div>
          )}

          {!isLoading && availableVouchers.length === 0 && (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-surface-subtle text-text-tertiary flex items-center justify-center">
                <Tag size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-text-primary">
                  {isVi ? 'Chưa có thẻ ưu đãi khả dụng' : 'No available vouchers'}
                </p>
                <p className="text-xs text-text-secondary max-w-xs mx-auto">
                  {isVi
                    ? 'Duy trì chuỗi học tập 5, 10, 15 ngày để nhận thêm thẻ giảm giá lên đến 50%!'
                    : 'Maintain a 5, 10, 15-day study streak to unlock vouchers up to 50% off!'}
                </p>
              </div>
            </div>
          )}

          {!isLoading &&
            availableVouchers.map((voucher) => {
              const isSelected = selectedVoucherCode === voucher.code
              const isStreak = voucher.source === 'STREAK'

              return (
                <div
                  key={voucher._id || voucher.code}
                  onClick={() => {
                    onSelectVoucher(voucher)
                    onOpenChange(false)
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-purple-600 bg-purple-500/10 shadow-sm'
                      : 'border-border bg-surface-subtle/40 hover:bg-surface-hover hover:border-purple-300 dark:hover:border-purple-800'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-extrabold ${
                        isStreak
                          ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                          : 'bg-gradient-to-br from-purple-600 to-indigo-600'
                      }`}
                    >
                      {isStreak ? <Flame size={18} /> : <Gift size={18} />}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-text-primary">
                          {voucher.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-600/15 text-purple-600 dark:text-purple-400">
                          -{voucher.discount_percent}%
                        </span>
                      </div>

                      <p className="text-[11px] text-text-secondary line-clamp-1">
                        {voucher.description}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-text-tertiary font-medium">
                        <span className="font-mono font-bold text-text-secondary uppercase">
                          {voucher.code}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          <span>
                            {isVi
                              ? `Hạn dùng: ${formatDate(voucher.expires_at)}`
                              : `Expires: ${formatDate(voucher.expires_at)}`}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white flex items-center gap-1'
                        : 'bg-surface hover:bg-purple-600 hover:text-white border border-border text-text-primary'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check size={12} />
                        <span>{isVi ? 'Đang chọn' : 'Selected'}</span>
                      </>
                    ) : (
                      <span>{isVi ? 'Áp dụng' : 'Apply'}</span>
                    )}
                  </button>
                </div>
              )
            })}
        </div>
      </div>
    </Modal>
  )
}
