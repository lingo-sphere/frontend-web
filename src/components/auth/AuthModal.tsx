import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Icon } from '@/components/icons/icon-map'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/auth-store'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { login, register, isLoading, error, clearError } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      if (mode === 'login') {
        await login({ email, password })
      } else {
        await register({ email, password, full_name: fullName, phone_number: phoneNumber })
      }
      onClose()
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
          {/* Header */}
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

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 m-6 mb-2 bg-surface-subtle rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                clearError()
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

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
            {error && (
              <div className="rounded-xl bg-error/10 border border-error/20 p-3 text-xs text-error flex items-start gap-2">
                <Icon name="alert-circle" size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

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
                  placeholder="Ví dụ: Nguyễn Văn An"
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
                placeholder="name@example.com"
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
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Mật khẩu <span className="text-error">*</span>
              </label>
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
              ) : (
                'Tạo tài khoản học viên'
              )}
            </Button>
          </form>

          {/* Footer Note */}
          <div className="bg-surface-subtle px-6 py-4 text-center text-xs text-text-tertiary border-t border-surface-border">
            Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của LingoSphere.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
