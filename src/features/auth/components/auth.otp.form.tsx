// Component nhập mã OTP 6 số để xác thực tài khoản Email.
'use client'

import React, { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, RefreshCw } from 'lucide-react'

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
    <div className="space-y-5 text-center py-2">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
        <Mail size={26} className="animate-bounce" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-white tracking-tight">{t('auth.verifyOtpTitle')}</h3>
        <p className="text-xs text-slate-400 leading-relaxed px-4">
          {t('auth.verifyOtpDesc', { email })}
        </p>
      </div>

      <div className="flex justify-center gap-2.5 py-2">
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

      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
        <span>{t('auth.didNotReceiveOtp')}</span>
        <button
          type="button"
          disabled={resendCooldown > 0 || isLoading}
          onClick={onResendOtp}
          className="inline-flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
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
