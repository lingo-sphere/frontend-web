// Hook quản lý trạng thái form xác thực, chế độ đăng nhập/đăng ký/OTP và đếm ngược
'use client'

import { useState, useEffect, useRef } from 'react'
import type { CredentialResponse } from '@react-oauth/google'
import { useAuthStore } from '@/features/auth/store/auth.store'

export type AuthMode = 'login' | 'register' | 'verify_email_otp' | 'forgot_password' | 'reset_password'

interface UseAuthModalOptions {
  isOpen?: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
}

export function useAuthModal({ onClose, initialMode = 'login' }: UseAuthModalOptions) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [email, setEmail] = useState('nguyennamtinh9999@gmail.com')
  const [password, setPassword] = useState('12345678')
  const [newPassword, setNewPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [resendCooldown, setResendCooldown] = useState<number>(0)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const {
    login,
    socialLogin,
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
    if (isAuthenticated) {
      onClose()
    }
  }, [isAuthenticated, onClose])

  useEffect(() => {
    clearError()
  }, [clearError])

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
    } catch {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setSuccessMessage(null)

    try {
      if (mode === 'login') {
        await login({ email, password, rememberMe })
        onClose()
      } else if (mode === 'register') {
        await register({ email, password, full_name: fullName, phone_number: phoneNumber })
        setSuccessMessage(`Mã OTP 6 số đã được gửi tới ${email}. Vui lòng kiểm tra hộp thư!`)
        setMode('verify_email_otp')
        setResendCooldown(60)
      } else if (mode === 'verify_email_otp') {
        const fullOtp = otpDigits.join('')
        if (fullOtp.length < 6) return
        await verifyEmailOtp({ email, otp: fullOtp })
        onClose()
      } else if (mode === 'forgot_password') {
        await forgotPassword({ email })
        setSuccessMessage(`Mã xác thực đặt lại mật khẩu đã được gửi tới ${email}!`)
        setMode('reset_password')
        setResendCooldown(60)
      } else if (mode === 'reset_password') {
        const fullOtp = otpDigits.join('')
        if (fullOtp.length < 6) return
        await resetPassword({ email, otp: fullOtp, new_password: newPassword })
        setSuccessMessage('Đã đổi mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.')
        setMode('login')
      }
    } catch {}
  }

  const handleGoogleToken = async (token: string) => {
    if (!token) return
    try {
      clearError()
      await socialLogin({
        provider: 'GOOGLE',
        token,
        rememberMe,
      })
      onClose()
    } catch {}
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return
    await handleGoogleToken(credentialResponse.credential)
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    clearError()
    setSuccessMessage(null)
  }

  return {
    mode,
    setMode,
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
    rememberMe,
    setRememberMe,
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
    handleGoogleToken,
    switchMode,
  }
}
