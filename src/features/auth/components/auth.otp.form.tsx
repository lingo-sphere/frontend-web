// Component nhập mã OTP 6 số để xác thực tài khoản Email.

'use client'

import React, { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/icon.map'

interface AuthOtpFormProps {
  email: string
  otpDigits: string[]
  otpInputRefs: RefObject<(HTMLInputElement | null)[]>
  resendCooldown: number
  isLoading: boolean
  onOtpChange: (index: number, value: string) => void
  onOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void
  onOtpPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void
  onResendOtp: () => void
}

export function AuthOtpForm({
  email,
  otpDigits,
  otpInputRefs,
  resendCooldown,
  isLoading,
  onOtpChange,
  onOtpKeyDown,
  onOtpPaste,
  onResendOtp,
}: AuthOtpFormProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4 text-center py-2">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-1">
        <Icon name="mail" size={24} />
      </div>
      <div>
        <h3 className="text-base font-bold text-text-primary">{t('auth.verifyOtpTitle')}</h3>
        <p className="text-xs text-text-secondary mt-1">
          {t('auth.verifyOtpDesc', { email })}
        </p>
      </div>

      <div className="flex justify-center gap-2 py-2">
        {otpDigits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              if (otpInputRefs.current) {
                otpInputRefs.current[idx] = el
              }
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => onOtpChange(idx, e.target.value)}
            onKeyDown={(e) => onOtpKeyDown(idx, e)}
            onPaste={onOtpPaste}
            className="h-12 w-11 rounded-xl border border-surface-border bg-surface-subtle text-center text-xl font-bold text-text-primary shadow-sm focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-text-secondary">
        <span>{t('auth.didNotReceiveOtp')}</span>
        <button
          type="button"
          disabled={resendCooldown > 0 || isLoading}
          onClick={onResendOtp}
          className="font-semibold text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {resendCooldown > 0 ? t('auth.resendOtpCountdown', { seconds: resendCooldown }) : t('auth.resendOtp')}
        </button>
      </div>
    </div>
  )
}
