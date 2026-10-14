// Component yêu cầu khôi phục và đặt lại mật khẩu mới.
'use client'

import React, { useState, RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyRound, Mail, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react'

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
  onToggleShowPassword?: () => void
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
  onToggleShowPassword,
}: AuthResetPasswordFormProps) {
  const { t } = useTranslation()
  const [localShowPassword, setLocalShowPassword] = useState(false)

  const isPasswordVisible = onToggleShowPassword ? showPassword : localShowPassword
  const handleTogglePassword = onToggleShowPassword ?? (() => setLocalShowPassword((prev) => !prev))

  if (mode === 'forgot_password') {
    return (
      <div className="space-y-4">
        <div className="text-center py-2 space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-md">
            <KeyRound size={26} />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">{t('auth.forgotPasswordTitle')}</h3>
          <p className="text-xs text-slate-400 leading-relaxed px-4">
            {t('auth.forgotPasswordDesc')}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            {t('auth.email')} <span className="text-red-400">*</span>
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-800 bg-slate-950/70 text-white text-sm placeholder:text-slate-500 focus:bg-slate-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center py-2 space-y-1">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md">
          <KeyRound size={26} />
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">{t('auth.resetPasswordTitle')}</h3>
        <p className="text-xs text-slate-400 leading-relaxed px-2">
          {t('auth.resetPasswordDesc')}
        </p>
      </div>

      <div className="flex justify-center gap-2.5 py-1">
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
            className="h-12 w-11 sm:h-13 sm:w-12 rounded-xl border border-slate-800 bg-slate-950/70 text-center text-xl font-extrabold text-white shadow-sm focus:border-emerald-500 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        ))}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          {t('auth.newPassword')} <span className="text-red-400">*</span>
        </label>
        <div className="relative flex items-center">
          <Lock className="absolute left-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
          <input
            type={isPasswordVisible ? 'text' : 'password'}
            required
            value={newPassword}
            onChange={(e) => onNewPasswordChange(e.target.value)}
            placeholder={t('auth.passwordPlaceholder')}
            className="w-full h-11 pl-10 pr-11 rounded-xl border border-slate-800 bg-slate-950/70 text-white text-sm placeholder:text-slate-500 focus:bg-slate-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
          />
          <button
            type="button"
            onClick={handleTogglePassword}
            className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {isPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <span>{t('auth.didNotReceiveOtp')}</span>
        <button
          type="button"
          disabled={resendCooldown > 0 || isLoading}
          onClick={onResendOtp}
          className="inline-flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 hover:underline disabled:opacity-50 cursor-pointer transition-colors"
        >
          {resendCooldown > 0 ? (
            t('auth.resendOtpCountdown', { seconds: resendCooldown })
          ) : (
            <>
              <RefreshCw size={12} />
              <span>{t('auth.resendOtp')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
