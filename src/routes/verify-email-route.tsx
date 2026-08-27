import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Icon } from '@/components/icons/icon-map'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth-store'

type VerifyState = 'VERIFYING' | 'SUCCESS' | 'ERROR'

export function VerifyEmailRoute() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [state, setState] = useState<VerifyState>('VERIFYING')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [countdown, setCountdown] = useState<number>(3)

  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    let isMounted = true

    const doVerify = async () => {
      if (!token || !email) {
        setState('ERROR')
        setErrorMessage('Đường liên kết kích hoạt không hợp lệ hoặc thiếu thông tin xác thực.')
        return
      }

      try {
        const res = await authService.verifyEmailToken({ email, token })
        if (!isMounted) return

        if (res && res.user) {
          setUser(res.user)
          try {
            const channel = new BroadcastChannel('lingo_auth_channel')
            channel.postMessage({ type: 'EMAIL_VERIFIED_SUCCESS', user: res.user })
            channel.close()
          } catch {
            // BroadcastChannel fallback
          }
        }
        setState('SUCCESS')
      } catch (err: unknown) {
        if (!isMounted) return
        setState('ERROR')
        const msg = err instanceof Error ? err.message : 'Mã xác thực email đã hết hạn hoặc không tồn tại.'
        setErrorMessage(msg)
      }
    }

    doVerify()

    return () => {
      isMounted = false
    }
  }, [token, email, setUser])

  // Tự động chuyển hướng khi thành công
  useEffect(() => {
    if (state !== 'SUCCESS') return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [state, navigate])

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-surface border border-surface-border p-8 shadow-2xl backdrop-blur-xl z-10 text-center space-y-6"
      >
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-primary-focus text-white font-black text-xl shadow-lg shadow-primary/30">
            L
          </div>
          <span className="text-2xl font-black text-text-primary tracking-tight">
            Lingo<span className="text-primary">Sphere</span>
          </span>
        </div>

        {/* 1. STATE: VERIFYING */}
        {state === 'VERIFYING' && (
          <div className="py-8 space-y-4">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-text-primary">Đang kích hoạt tài khoản...</h3>
              <p className="text-xs text-text-secondary">
                Vui lòng đợi giây lát, hệ thống đang xác thực email <span className="font-semibold text-text-primary">{email}</span>
              </p>
            </div>
          </div>
        )}

        {/* 2. STATE: SUCCESS */}
        {state === 'SUCCESS' && (
          <div className="py-4 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-success/15 text-success flex items-center justify-center shadow-lg shadow-success/20">
              <Icon name="check-circle" size={36} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold text-text-primary">Xác Thực Email Thành Công!</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Chào mừng bạn đến với hệ sinh thái học tiếng Anh LingoSphere. Tài khoản của bạn đã được kích hoạt hoàn tất.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-subtle border border-surface-border text-xs text-text-secondary">
              Tự động chuyển về trang học tập trong <span className="font-bold text-primary">{countdown}s</span>...
            </div>

            <Button
              onClick={() => navigate('/')}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl shadow-lg shadow-primary/25 cursor-pointer"
            >
              Bắt Đầu Học Ngay Bây Giờ
            </Button>
          </div>
        )}

        {/* 3. STATE: ERROR */}
        {state === 'ERROR' && (
          <div className="py-4 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-error/15 text-error flex items-center justify-center shadow-lg shadow-error/20">
              <Icon name="alert-circle" size={36} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold text-text-primary">Kích Hoạt Không Thành Công</h3>
              <p className="text-xs text-error font-medium leading-relaxed bg-error/10 border border-error/20 p-3 rounded-xl">
                {errorMessage}
              </p>
            </div>

            <p className="text-xs text-text-tertiary">
              Đường link có thể đã được sử dụng hoặc quá hạn. Bạn có thể đăng nhập hoặc yêu cầu gửi lại mã xác thực mới.
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Trang Chủ
              </Button>
              <Button
                onClick={() => navigate('/')}
                className="flex-1 bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl text-xs font-semibold shadow-md cursor-pointer"
              >
                Đăng Nhập
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
