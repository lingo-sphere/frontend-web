/**
 * @file auth.modal.tsx
 * @description Modal đăng nhập, đăng ký, xác thực OTP và khôi phục mật khẩu người dùng
 */

'use client'

import { motion, AnimatePresence } from 'motion/react'
import { GoogleLogin } from '@react-oauth/google'
import { Icon } from '@/components/icons/icon.map'
import { Button } from '@/components/ui/button'
import { useAuthModal, type AuthMode } from '@/hooks/use.auth.modal'
import { AuthCredentialForm } from './auth.credential.form'
import { AuthOtpForm } from './auth.otp.form'
import { AuthResetPasswordForm } from './auth.reset.password.form'

export type { AuthMode }

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const {
    mode,
    email,
    setEmail,
    password,
    setPassword,
    newPassword,
    setNewPassword,
    fullName,
    setFullName,
    phoneNumber,
    setPhoneNumber,
    showPassword,
    setShowPassword,
    successMessage,
    otpDigits,
    otpInputRefs,
    resendCooldown,
    isLoading,
    error,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    handleResendOtp,
    handleSubmit,
    handleGoogleSuccess,
    switchMode,
  } = useAuthModal({ isOpen, onClose, initialMode })

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-surface border border-surface-border shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary-focus text-white font-bold shadow-md">
                L
              </div>
              <span className="text-lg font-bold text-text-primary tracking-tight">
                Lingo<span className="text-primary">Sphere</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-tertiary hover:bg-surface-subtle hover:text-text-primary transition-colors cursor-pointer"
            >
              <Icon name="x" size={20} />
            </button>
          </div>

          {(mode === 'login' || mode === 'register') && (
            <div className="grid grid-cols-2 p-1.5 m-6 mb-2 bg-surface-subtle rounded-xl">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-surface text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-surface text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Đăng ký mới
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
            {error && (
              <div className="rounded-xl bg-error/10 border border-error/20 p-3 text-xs text-error flex items-start gap-2">
                <Icon name="alert-circle" size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl bg-success/10 border border-success/20 p-3 text-xs text-success flex items-start gap-2">
                <Icon name="check-circle" size={16} className="shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <AuthCredentialForm
                mode={mode}
                email={email}
                password={password}
                fullName={fullName}
                phoneNumber={phoneNumber}
                showPassword={showPassword}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onFullNameChange={setFullName}
                onPhoneNumberChange={setPhoneNumber}
                onToggleShowPassword={() => setShowPassword(!showPassword)}
                onForgotPasswordClick={() => switchMode('forgot_password')}
              />
            )}

            {mode === 'verify_email_otp' && (
              <AuthOtpForm
                email={email}
                otpDigits={otpDigits}
                otpInputRefs={otpInputRefs}
                resendCooldown={resendCooldown}
                isLoading={isLoading}
                onOtpChange={handleOtpChange}
                onOtpKeyDown={handleOtpKeyDown}
                onOtpPaste={handleOtpPaste}
                onResendOtp={handleResendOtp}
              />
            )}

            {(mode === 'forgot_password' || mode === 'reset_password') && (
              <AuthResetPasswordForm
                mode={mode}
                email={email}
                newPassword={newPassword}
                showPassword={showPassword}
                otpDigits={otpDigits}
                otpInputRefs={otpInputRefs}
                resendCooldown={resendCooldown}
                isLoading={isLoading}
                onEmailChange={setEmail}
                onNewPasswordChange={setNewPassword}
                onOtpChange={handleOtpChange}
                onOtpKeyDown={handleOtpKeyDown}
                onOtpPaste={handleOtpPaste}
                onResendOtp={handleResendOtp}
              />
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-xl shadow-md transition-all mt-4 cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang xử lý...</span>
                </div>
              ) : mode === 'login' ? (
                'Đăng nhập tài khoản'
              ) : mode === 'register' ? (
                'Tạo tài khoản & Nhận mã OTP'
              ) : mode === 'verify_email_otp' ? (
                'Xác nhận & Kích hoạt tài khoản'
              ) : mode === 'forgot_password' ? (
                'Gửi mã xác thực OTP'
              ) : (
                'Lưu mật khẩu mới'
              )}
            </Button>

            {(mode === 'login' || mode === 'register') && (
              <>
                <div className="relative my-3 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-surface-border" />
                  </div>
                  <span className="relative bg-surface px-3 text-xs text-text-tertiary">
                    Hoặc tiếp tục với
                  </span>
                </div>

                <div className="flex justify-center w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {}}
                    theme="outline"
                    size="large"
                    shape="pill"
                    text={mode === 'login' ? 'signin_with' : 'signup_with'}
                    width="100%"
                  />
                </div>
              </>
            )}

            {(mode === 'verify_email_otp' || mode === 'forgot_password' || mode === 'reset_password') && (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full text-center text-xs font-semibold text-text-secondary hover:text-primary transition-colors py-1 cursor-pointer"
              >
                ← Quay lại đăng nhập
              </button>
            )}
          </form>

          <div className="bg-surface-subtle px-6 py-4 text-center text-xs text-text-tertiary border-t border-surface-border">
            Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của LingoSphere.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
