/**
 * @file auth.credential.form.tsx
 * @description Thành phần Auth Credential Form phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file auth.credential.form.tsx
 * @description Component nhập thông tin đăng nhập và đăng ký tài khoản
 */

import { Icon } from '@/components/icons/icon.map'
import { Input } from '@/components/ui/input'

interface AuthCredentialFormProps {
  mode: 'login' | 'register'
  email: string
  password: string
  fullName: string
  phoneNumber: string
  showPassword: boolean
  onEmailChange: (v: string) => void
  onPasswordChange: (v: string) => void
  onFullNameChange: (v: string) => void
  onPhoneNumberChange: (v: string) => void
  onToggleShowPassword: () => void
  onForgotPasswordClick: () => void
}

export function AuthCredentialForm({
  mode,
  email,
  password,
  fullName,
  phoneNumber,
  showPassword,
  onEmailChange,
  onPasswordChange,
  onFullNameChange,
  onPhoneNumberChange,
  onToggleShowPassword,
  onForgotPasswordClick,
}: AuthCredentialFormProps) {
  return (
    <>
      {mode === 'register' && (
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">
            Họ và tên <span className="text-error">*</span>
          </label>
          <Input
            type="text"
            required
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            placeholder="Ví dụ: Nguyễn Nam Tính"
            className="bg-surface-subtle"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">
          Địa chỉ Email <span className="text-error">*</span>
        </label>
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="nguyennamtinh9999@gmail.com"
          className="bg-surface-subtle"
        />
      </div>

      {mode === 'register' && (
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">
            Số điện thoại
          </label>
          <Input
            type="tel"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            placeholder="0987654321"
            className="bg-surface-subtle"
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-text-secondary">
            Mật khẩu <span className="text-error">*</span>
          </label>
          {mode === 'login' && (
            <button
              type="button"
              onClick={onForgotPasswordClick}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Quên mật khẩu?
            </button>
          )}
        </div>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Tối thiểu 6 ký tự"
            className="bg-surface-subtle pr-10"
          />
          <button
            type="button"
            onClick={onToggleShowPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary cursor-pointer"
          >
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
          </button>
        </div>
      </div>
    </>
  )
}
