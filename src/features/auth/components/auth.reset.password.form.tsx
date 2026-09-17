// Component yêu cầu khôi phục và đặt lại mật khẩu mới.

'use client'

import React, { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/icon.map'
import { Input } from '@/components/input'

interface AuthResetPasswordFormProps {
  mode: 'forgot_password' | 'reset_password'
  email: string
  newPassword: string
  showPassword: boolean
  otpDigits: string[]
  otpInputRefs: RefObject<(HTMLInputElement | null)[]>
  resendCooldown: number
  isLoading: boolean
  onEmailChange: (v: string) => void
  onNewPasswordChange: (v: string) => void
  onOtpChange: (index: number, value: string) => void
  onOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void
  onOtpPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void
  onResendOtp: () => void
}

export function AuthResetPasswordForm({
  mode,
  email,
  newPassword,
  showPassword,
  otpDigits,
  otpInputRefs,
  resendCooldown,
  isLoading,
  onEmailChange,
  onNewPasswordChange,
  onOtpChange,
  onOtpKeyDown,
  onOtpPaste,
  onResendOtp,
}: AuthResetPasswordFormProps) {
  const { t } = useTranslation()

  if (mode === 'forgot_password') {
    return (
      <div className="space-y-4">
        <div className="text-center py-1">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10 text-warning mb-1">
            <Icon name="key" size={24} />
          </div>
          <h3 className="text-base font-bold text-text-primary">{t('auth.forgotPasswordTitle')}</h3>
          <p className="text-xs text-text-secondary mt-1">
            {t('auth.forgotPasswordDesc')}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">
            {t('auth.email')} <span className="text-error">*</span>
          </label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder={t('auth.emailPlaceholder')}
            className="bg-surface-subtle"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center py-1">
        <h3 className="text-base font-bold text-text-primary">{t('auth.resetPasswordTitle')}</h3>
        <p className="text-xs text-text-secondary mt-1">
          {t('auth.resetPasswordDesc')}
        </p>
      </div>

      <div className="flex justify-center gap-2 py-1">
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

      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">
          {t('auth.newPassword')} <span className="text-error">*</span>
        </label>
        <Input
          type={showPassword ? 'text' : 'password'}
          required
          value={newPassword}
          onChange={(e) => onNewPasswordChange(e.target.value)}
          placeholder={t('auth.passwordPlaceholder')}
          className="bg-surface-subtle"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>{t('auth.didNotReceiveOtp')}</span>
        <button
          type="button"
          disabled={resendCooldown > 0 || isLoading}
          onClick={onResendOtp}
          className="font-semibold text-primary hover:underline disabled:opacity-50 cursor-pointer"
        >
          {resendCooldown > 0 ? t('auth.resendOtpCountdown', { seconds: resendCooldown }) : t('auth.resendOtp')}
        </button>
      </div>
    </div>
  )
}
