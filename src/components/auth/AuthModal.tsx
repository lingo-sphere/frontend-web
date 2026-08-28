import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Icon } from '@/components/icons/icon-map'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/auth-store'

type AuthMode = 'login' | 'register' | 'verify_email_otp' | 'forgot_password' | 'reset_password'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [resendCooldown, setResendCooldown] = useState<number>(0)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const {
    login,
    register,
    verifyEmailOtp,
    resendVerificationOtp,
    forgotPassword,
    resetPassword,
    isLoading,
    error,
    clearError,
  } = useAuthStore()

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose()
    }
  }, [isAuthenticated, isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      clearError()
      setSuccessMessage(null)
      setOtpDigits(['', '', '', '', '', ''])
    }
  }, [isOpen, initialMode, clearError])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otpDigits]
    newOtp[index] = value.slice(-1)
    setOtpDigits(newOtp)

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('')
      setOtpDigits(digits)
      otpInputRefs.current[5]?.focus()
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !email) return
    try {
      clearError()
      if (mode === 'verify_email_otp') {
        await resendVerificationOtp({ email })
        setSuccessMessage('Đã gửi lại mã OTP kích hoạt tài khoản qua email của bạn!')
      } else {
        await forgotPassword({ email })
        setSuccessMessage('Đã gửi lại mã OTP đặt lại mật khẩu qua email!')
      }
      setResendCooldown(60)
    } catch {
      // Handled by store
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setSuccessMessage(null)

    try {
      if (mode === 'login') {
        await login({ email, password })
        onClose()
      } else if (mode === 'register') {
        await register({ email, password, full_name: fullName, phone_number: phoneNumber })
        setSuccessMessage(`Mã OTP 6 số đã được gửi tới ${email}. Vui lòng kiểm tra hộp thư!`)
        setMode('verify_email_otp')
        setResendCooldown(60)
      } else if (mode === 'verify_email_otp') {
        const fullOtp = otpDigits.join('')
        if (fullOtp.length < 6) {
          return
        }
        await verifyEmailOtp({ email, otp: fullOtp })
        onClose()
      } else if (mode === 'forgot_password') {
        await forgotPassword({ email })
        setSuccessMessage(`Mã xác thực đặt lại mật khẩu đã được gửi tới ${email}!`)
        setMode('reset_password')
        setResendCooldown(60)
      } else if (mode === 'reset_password') {
        const fullOtp = otpDigits.join('')
        if (fullOtp.length < 6) {
          return
        }
        await resetPassword({ email, otp: fullOtp, new_password: newPassword })
        setSuccessMessage('Đã đổi mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.')
        setMode('login')
      }
    } catch {
      // Error handled by store
    }
  }

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
              className="rounded-lg p-1.5 text-text-tertiary hover:bg-surface-subtle hover:text-text-primary transition-colors"
            >
              <Icon name="x" size={20} />
            </button>
          </div>

          {(mode === 'login' || mode === 'register') && (
            <div className="grid grid-cols-2 p-1.5 m-6 mb-2 bg-surface-subtle rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  clearError()
                  setSuccessMessage(null)
                }}
                className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-surface text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  clearError()
                  setSuccessMessage(null)
                }}
                className={`py-2 text-sm font-semibold rounded-lg transition-all ${
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
                      onChange={(e) => setFullName(e.target.value)}
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
                    onChange={(e) => setEmail(e.target.value)}
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
                      onChange={(e) => setPhoneNumber(e.target.value)}
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
                        onClick={() => {
                          setMode('forgot_password')
                          clearError()
                          setSuccessMessage(null)
                        }}
                        className="text-xs font-semibold text-primary hover:underline"
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
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="bg-surface-subtle pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                    >
                      <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}

            {mode === 'verify_email_otp' && (
              <div className="space-y-4 text-center py-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-1">
                  <Icon name="mail" size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">Xác thực tài khoản Email</h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Nhập mã xác thực 6 số đã được gửi tới email <br />
                    <span className="font-semibold text-text-primary">{email}</span>
                  </p>
                </div>

                <div className="flex justify-center gap-2 py-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="h-12 w-11 rounded-xl border border-surface-border bg-surface-subtle text-center text-xl font-bold text-text-primary shadow-sm focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-text-secondary">
                  <span>Chưa nhận được mã?</span>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isLoading}
                    onClick={handleResendOtp}
                    className="font-semibold text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? `Gửi lại mã (${resendCooldown}s)` : 'Gửi lại mã OTP'}
                  </button>
                </div>
              </div>
            )}

            {mode === 'forgot_password' && (
              <div className="space-y-4">
                <div className="text-center py-1">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10 text-warning mb-1">
                    <Icon name="key" size={24} />
                  </div>
                  <h3 className="text-base font-bold text-text-primary">Khôi phục mật khẩu</h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Nhập địa chỉ email đăng ký để nhận mã xác thực đặt lại mật khẩu.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Địa chỉ Email <span className="text-error">*</span>
                  </label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nguyennamtinh9999@gmail.com"
                    className="bg-surface-subtle"
                  />
                </div>
              </div>
            )}

            {mode === 'reset_password' && (
              <div className="space-y-4">
                <div className="text-center py-1">
                  <h3 className="text-base font-bold text-text-primary">Đặt lại mật khẩu mới</h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Nhập mã OTP 6 số và thiết lập mật khẩu mới cho tài khoản của bạn.
                  </p>
                </div>

                <div className="flex justify-center gap-2 py-1">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="h-12 w-11 rounded-xl border border-surface-border bg-surface-subtle text-center text-xl font-bold text-text-primary shadow-sm focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Mật khẩu mới <span className="text-error">*</span>
                  </label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="bg-surface-subtle"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>Chưa nhận được mã?</span>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isLoading}
                    onClick={handleResendOtp}
                    className="font-semibold text-primary hover:underline disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : 'Gửi lại OTP'}
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-xl shadow-md transition-all mt-4"
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

            {(mode === 'verify_email_otp' || mode === 'forgot_password' || mode === 'reset_password') && (
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  clearError()
                  setSuccessMessage(null)
                }}
                className="w-full text-center text-xs font-semibold text-text-secondary hover:text-primary transition-colors py-1"
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
