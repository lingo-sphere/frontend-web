/**
 * @file upgrade.modal.tsx
 * @description Modal nâng cấp LingoSphere Premium VIP điều phối các bước thanh toán và gia hạn
 */

'use client'

import { X, ArrowLeft, Crown } from 'lucide-react'
import { UpgradeSelectPlanStep } from '@/components/upgrade/upgrade.plan'
import { UpgradePaymentQrStep } from '@/components/upgrade/upgrade.qr'
import { UpgradeSuccessView } from './upgrade.success.view'
import { useUpgradePayment } from '@/hooks/use.upgrade.payment'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const {
    isVietnamese,
    selectedPlan,
    setSelectedPlan,
    step,
    setStep,
    isSubmitting,
    isCheckingStatus,
    order,
    copiedField,
    errorMessage,
    plans,
    user,
    isPremium,
    remainingTimeText,
    formattedCurrentExp,
    calculateNewExpiryDate,
    stopAllTimers,
    handleCreateOrder,
    handleManualCheck,
    handleCopy,
    formattedTime,
  } = useUpgradePayment({ open, onOpenChange })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          stopAllTimers()
          onOpenChange(false)
        }}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div
          className="relative w-full max-w-lg transform rounded-3xl bg-surface border border-border text-left shadow-2xl transition-all duration-300 animate-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative p-5 sm:p-6 pb-4 border-b border-border">
            {step === 'PAYMENT_QR' && (
              <button
                onClick={() => {
                  stopAllTimers()
                  setStep('SELECT_PLAN')
                }}
                className="absolute left-5 top-5 rounded-full p-2 text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
                title={isVietnamese ? 'Quay lại' : 'Back'}
              >
                <ArrowLeft size={18} />
              </button>
            )}

            <button
              onClick={() => {
                stopAllTimers()
                onOpenChange(false)
              }}
              className="absolute right-5 top-5 rounded-full p-2 text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
              title={isVietnamese ? 'Đóng' : 'Close'}
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3.5 pr-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 ring-4 ring-amber-500/10">
                <Crown className="h-6 w-6 fill-white text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold tracking-tight text-text-primary">
                    LingoSphere Premium VIP
                  </h2>
                </div>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed truncate">
                  {step === 'PAYMENT_QR'
                    ? isVietnamese
                      ? 'Quét mã VietQR chuyển khoản tự động'
                      : 'Scan VietQR to pay automatically'
                    : isVietnamese
                    ? 'Mở khóa toàn bộ tính năng - học bứt phá không giới hạn'
                    : 'Unlock everything - learn 10x faster'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto space-y-5">
            {step === 'SUCCESS' && (
              <UpgradeSuccessView isVietnamese={isVietnamese} />
            )}

            {step === 'SELECT_PLAN' && (
              <UpgradeSelectPlanStep
                plans={plans}
                selectedPlan={selectedPlan}
                onSelectPlan={setSelectedPlan}
                isPremium={isPremium}
                userPlan={user?.subscription_plan}
                remainingTimeText={remainingTimeText}
                formattedCurrentExp={formattedCurrentExp}
                calculatedNewExpiry={calculateNewExpiryDate()}
                isSubmitting={isSubmitting}
                onSubmitOrder={handleCreateOrder}
                errorMessage={errorMessage}
                isVi={isVietnamese}
              />
            )}

            {step === 'PAYMENT_QR' && order && (
              <UpgradePaymentQrStep
                order={order}
                formattedTime={formattedTime}
                copiedField={copiedField}
                onCopy={handleCopy}
                isCheckingStatus={isCheckingStatus}
                onManualCheck={handleManualCheck}
                isVi={isVietnamese}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
