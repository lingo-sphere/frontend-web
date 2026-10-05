// Component nhập thông tin tài khoản đăng nhập và đăng ký hỗ trợ đa ngôn ngữ
'use client'

import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/icon.map'
import { Input } from '@/components/input'

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
    <>
      {mode === 'register' && (
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">
            {t('auth.fullName')} <span className="text-error">*</span>
          </label>
          <Input
            type="text"
            required
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            placeholder={t('auth.fullNamePlaceholder')}
            className="bg-surface-subtle"
          />
        </div>
      )}

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

      {mode === 'register' && (
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">
            {t('auth.phoneNumber')}
          </label>
          <Input
            type="tel"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            placeholder={t('auth.phoneNumberPlaceholder')}
            className="bg-surface-subtle"
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-text-secondary">
            {t('auth.password')} <span className="text-error">*</span>
          </label>
          {mode === 'login' && (
            <button
              type="button"
              onClick={onForgotPasswordClick}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              {t('auth.forgotPassword')}
            </button>
          )}
        </div>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder={t('auth.passwordPlaceholder')}
            className="bg-surface-subtle pr-10"
          />
          <button
            type="button"
            onClick={onToggleShowPassword}
            title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary cursor-pointer"
          >
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
          </button>
        </div>
      </div>

      {mode === 'login' && (
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => onRememberMeChange?.(e.target.checked)}
              className="w-4 h-4 rounded border-surface-border text-primary focus:ring-primary/30 accent-primary cursor-pointer"
            />
            <span className="text-xs font-medium text-text-secondary">{t('auth.rememberMe')}</span>
          </label>
        </div>
      )}
    </>
  )
}
