// Giao diện chọn gói thời hạn nâng cấp tài khoản VIP.
'use client'

import {
  AlertCircle,
  Crown,
  Sparkles,
  Check,
  Loader2,
  QrCode,
  Shield,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getBenefits, type Plan } from '@/components/upgrade/upgrade.data'

interface UpgradeSelectPlanStepProps {
  plans: Plan[]
  selectedPlan: string
  onSelectPlan: (id: string) => void
  isPremium: boolean
  userPlan?: string | null
  remainingTimeText: string
  formattedCurrentExp: string | null
  calculatedNewExpiry: string
  isSubmitting: boolean
  onSubmitOrder: () => void
  errorMessage: string | null
  isVi: boolean
}

export function UpgradeSelectPlanStep({
  plans,
  selectedPlan,
  onSelectPlan,
  isPremium,
  userPlan,
  remainingTimeText,
  formattedCurrentExp,
  calculatedNewExpiry,
  isSubmitting,
  onSubmitOrder,
  errorMessage,
  isVi,
}: UpgradeSelectPlanStepProps) {
  const benefits = getBenefits(isVi)

  return (
    <>
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-600 border border-rose-500/20">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isPremium && (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-4 text-left shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xs">
                <Crown size={20} className="fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    {isVi ? 'Gói VIP hiện tại của bạn' : 'Your Current VIP Plan'}
                  </span>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                    {userPlan === 'LIFETIME'
                      ? isVi ? 'Vĩnh viễn' : 'Lifetime'
                      : userPlan === 'YEARLY'
                      ? isVi ? 'Gói 1 Năm' : '1 Year'
                      : userPlan === 'QUARTERLY'
                      ? isVi ? 'Gói 3 Tháng' : '3 Months'
                      : isVi ? 'Gói 1 Tháng' : '1 Month'}
                  </span>
                </div>
                <div className="text-sm font-extrabold text-text-primary mt-0.5">
                  {remainingTimeText}
                </div>
              </div>
            </div>

            {formattedCurrentExp && userPlan !== 'LIFETIME' && (
              <div className="text-right shrink-0">
                <span className="text-[10px] text-text-tertiary block">
                  {isVi ? 'Hết hạn vào' : 'Expires on'}
                </span>
                <span className="text-xs font-bold text-text-secondary">
                  {formattedCurrentExp}
                </span>
              </div>
            )}
          </div>

          {userPlan !== 'LIFETIME' && (
            <div className="mt-3 pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
              <span className="text-text-secondary flex items-center gap-1.5 text-[11px]">
                <Sparkles size={13} className="text-amber-500 shrink-0" />
                <span>{isVi ? 'Tự động cộng dồn sau khi gia hạn:' : 'Accumulated after renewal:'}</span>
              </span>
              <span className="font-bold text-primary text-[11px] sm:text-xs">
                {calculatedNewExpiry}
              </span>
            </div>
          )}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            {isVi ? '1. Chọn gói thời hạn' : '1. Select Plan'}
          </h3>
          <span className="text-[11px] text-text-tertiary">
            {isVi ? 'Bảo lưu & nâng cấp linh hoạt' : 'Flexible upgrade'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id
            return (
              <label
                key={plan.id}
                className={`relative flex flex-col justify-between cursor-pointer rounded-2xl p-3.5 transition-colors duration-150 select-none border-2 ${
                  isSelected
                    ? 'border-primary bg-primary-soft/30 shadow-sm'
                    : 'border-border bg-surface hover:border-primary/40 hover:bg-surface-hover/50'
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={plan.id}
                  checked={isSelected}
                  onChange={() => onSelectPlan(plan.id)}
                  className="sr-only"
                />

                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-4 w-4 shrink-0 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-primary text-white'
                            : 'border border-border bg-surface'
                        }`}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-bold text-text-primary">
                        {isVi ? plan.duration.vi : plan.duration.en}
                      </span>
                    </div>

                    {plan.discount && (
                      <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400">
                        {plan.discount}
                      </span>
                    )}
                  </div>

                  <div className="mt-1">
                    <p className="text-base font-extrabold text-text-primary tracking-tight">
                      {plan.price.toLocaleString(isVi ? 'vi-VN' : 'en-US')} đ
                    </p>
                    {plan.originalPrice && (
                      <p className="text-[10px] text-text-tertiary line-through">
                        {plan.originalPrice.toLocaleString(isVi ? 'vi-VN' : 'en-US')} đ
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-[11px] font-medium text-text-secondary mt-2 pt-2 border-t border-border/40">
                  {isVi ? plan.perMonth.vi : plan.perMonth.en}
                </p>

                {plan.recommended && (
                  <div className="absolute -top-2.5 left-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[9px] font-bold text-white shadow-sm flex items-center gap-1">
                    <Sparkles size={10} />
                    <span>{isVi ? 'PHỔ BIẾN NHẤT' : 'BEST VALUE'}</span>
                  </div>
                )}
              </label>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Button
          disabled={isSubmitting}
          className="h-11 w-full rounded-xl bg-gradient-to-r from-primary via-[#286f68] to-[#1f5d58] text-sm font-bold text-white shadow-lg shadow-primary/20 hover:brightness-105 transition-all cursor-pointer"
          onClick={onSubmitOrder}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {isVi ? 'Đang tạo mã VietQR...' : 'Generating QR...'}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <QrCode size={18} />
              {isPremium
                ? isVi ? 'Gia hạn gói VIP qua VietQR Tự Động' : 'Renew VIP via Automatic VietQR'
                : isVi ? 'Thanh toán qua VietQR Tự Động' : 'Proceed to VietQR Payment'}
            </span>
          )}
        </Button>

        <div className="flex items-center justify-center gap-5 text-xs text-text-secondary">
          <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
            <Shield className="h-3.5 w-3.5" />
            {isVi ? 'Tự động 100%' : '100% Automated'}
          </span>
          <span className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
            <Clock className="h-3.5 w-3.5" />
            {isVi ? 'Nhận VIP tức thì sau 2 giây' : 'Instant activation'}
          </span>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="mb-3 text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={13} className="text-amber-500" />
          <span>{isVi ? 'Quyền lợi học viên VIP LingoSphere' : 'Premium VIP Benefits'}</span>
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {benefits.map((b, i) => {
            const IconComponent = b.icon
            return (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-xl bg-surface-subtle/60 p-2.5 border border-border/50 hover:bg-surface-hover/70 transition-colors"
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${b.color}`}>
                  <IconComponent size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-text-primary">{b.title}</p>
                  <p className="truncate text-[10px] text-text-secondary leading-tight">{b.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
