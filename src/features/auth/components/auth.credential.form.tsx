// Component nhập thông tin tài khoản đăng nhập và đăng ký hỗ trợ đa ngôn ngữ
'use client'

import { useTranslation } from 'react-i18next'
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react'

interface AuthCredentialFormProps {
  mode: 'login' | 'register'
  email: string
  password: string
  fullName: string
  phoneNumber: string
  showPassword: boolean
  rememberMe?: boolean
  onEmailChange: (v: string) => void
  onPasswordChange: (v: string) => void
  onFullNameChange: (v: string) => void
  onPhoneNumberChange: (v: string) => void
  onToggleShowPassword: () => void
  onForgotPasswordClick: () => void
  onRememberMeChange?: (v: boolean) => void
}

export function AuthCredentialForm({
  mode,
  email,
  password,
  fullName,
  phoneNumber,
  showPassword,
  rememberMe = true,
  onEmailChange,
  onPasswordChange,
  onFullNameChange,
  onPhoneNumberChange,
  onToggleShowPassword,
  onForgotPasswordClick,
  onRememberMeChange,
}: AuthCredentialFormProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      {mode === 'register' && (
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            {t('auth.fullName')} <span className="text-red-400">*</span>
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              placeholder={t('auth.fullNamePlaceholder')}
              className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-800 bg-slate-950/70 text-white text-sm placeholder:text-slate-500 focus:bg-slate-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>
        </div>
      )}

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

      {mode === 'register' && (
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            {t('auth.phoneNumber')}
          </label>
          <div className="relative flex items-center">
            <Phone className="absolute left-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => onPhoneNumberChange(e.target.value)}
              placeholder={t('auth.phoneNumberPlaceholder')}
              className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-800 bg-slate-950/70 text-white text-sm placeholder:text-slate-500 focus:bg-slate-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            {t('auth.password')} <span className="text-red-400">*</span>
          </label>
          {mode === 'login' && (
            <button
              type="button"
              onClick={onForgotPasswordClick}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              {t('auth.forgotPassword')}
            </button>
          )}
        </div>
        <div className="relative flex items-center">
          <Lock className="absolute left-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder={t('auth.passwordPlaceholder')}
            className="w-full h-11 pl-10 pr-11 rounded-xl border border-slate-800 bg-slate-950/70 text-white text-sm placeholder:text-slate-500 focus:bg-slate-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
          />
          <button
            type="button"
            onClick={onToggleShowPassword}
            title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      {mode === 'login' && (
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => onRememberMeChange?.(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/30 accent-emerald-500 cursor-pointer transition-all"
            />
            <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
              {t('auth.rememberMe')}
            </span>
          </label>
        </div>
      )}
    </div>
  )
}
