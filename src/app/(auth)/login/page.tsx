// Trang xác thực đăng nhập và đăng ký toàn màn hình dành cho học viên LingoSphere.
'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useGoogleLogin } from '@react-oauth/google'
import { useTranslation } from 'react-i18next'
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Award,
} from 'lucide-react'
import { Button } from '@/components/button'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useAuthModal } from '@/features/auth/hooks/use.auth.modal'
import { AuthCredentialForm } from '@/features/auth/components/auth.credential.form'
import { AuthOtpForm } from '@/features/auth/components/auth.otp.form'
import { AuthResetPasswordForm } from '@/features/auth/components/auth.reset.password.form'

function LoginPageContent() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login'

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/home')
    }
  }, [isAuthenticated, router])

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
    handleGoogleToken,
    switchMode,
  } = useAuthModal({
    onClose: () => router.push('/home'),
    initialMode,
  })

  const isCredentialMode = mode === 'login' || mode === 'register'

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (tokenResponse.access_token) {
        handleGoogleToken(tokenResponse.access_token)
      }
    },
    onError: () => {},
  })

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-emerald-500/20 blur-[150px]" />
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-teal-500/20 blur-[150px]" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-emerald-400/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
      </div>

      <div className="lg:w-1/2 xl:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative z-10 border-b lg:border-b-0 lg:border-r border-slate-800/80">
        <div>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors py-1.5 px-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 mb-8"
          >
            <ArrowLeft size={14} />
            <span>{t('nav.home')}</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-300 text-slate-950 font-black text-2xl shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-300/40">
              L
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tight">
                Lingo<span className="text-emerald-400">Sphere</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-emerald-300/80">
                Next-Gen Language AI
              </span>
            </div>
          </div>
        </div>

        <div className="py-10 lg:py-16 space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles size={15} className="text-emerald-400" />
            <span>Nền tảng học ngoại ngữ thế hệ mới</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.2]">
            Bứt phá trình độ, <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Chinh phục ngoại ngữ cùng AI
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Học tiếng Anh thông minh hơn với lộ trình cá nhân hóa cho từng mục tiêu TOEIC, IELTS và giao tiếp thực chiến. Hệ thống AI theo sát từng bước tiến bộ của bạn.
          </p>

          <div className="space-y-3.5 pt-2">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
              <div className="h-7 w-7 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <span>Luyện phát âm chuẩn với AI nhận diện âm vị thời gian thực</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
              <div className="h-7 w-7 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <span>Lộ trình tối ưu hóa mục tiêu TOEIC 800+ và IELTS 7.5+</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
              <div className="h-7 w-7 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <span>Lưu trữ tiến độ và đồng bộ bài học trên mọi thiết bị</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-xl">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <span className="inline-flex h-8 w-8 rounded-full ring-2 ring-slate-950 bg-gradient-to-tr from-amber-400 to-orange-400 items-center justify-center text-[10px] font-bold text-slate-950">
                TN
              </span>
              <span className="inline-flex h-8 w-8 rounded-full ring-2 ring-slate-950 bg-gradient-to-tr from-blue-400 to-indigo-400 items-center justify-center text-[10px] font-bold text-white">
                HL
              </span>
              <span className="inline-flex h-8 w-8 rounded-full ring-2 ring-slate-950 bg-gradient-to-tr from-emerald-400 to-teal-400 items-center justify-center text-[10px] font-bold text-slate-950">
                AN
              </span>
              <span className="inline-flex h-8 w-8 rounded-full ring-2 ring-slate-950 bg-slate-800 text-emerald-300 items-center justify-center text-[10px] font-bold">
                +50k
              </span>
            </div>
            <div>
              <span className="block text-xs font-bold text-white">50,000+ Học viên tin tưởng</span>
              <span className="block text-[11px] text-slate-400">Đánh giá 4.9 / 5.0 ⭐ trên toàn quốc</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold">
            <Award size={15} />
            <span>Cam kết chuẩn đầu ra</span>
          </div>
        </div>
      </div>

      <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-10 lg:p-16 flex items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-md bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl shadow-emerald-950/40 text-slate-100 relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400" />

          <div className="space-y-1.5 mb-6">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {mode === 'login'
                ? 'Đăng nhập tài khoản'
                : mode === 'register'
                ? 'Tạo tài khoản học viên'
                : mode === 'verify_email_otp'
                ? 'Xác thực tài khoản'
                : 'Khôi phục mật khẩu'}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'login'
                ? 'Chào mừng bạn quay lại hành trình rèn luyện tiếng Anh!'
                : mode === 'register'
                ? 'Bắt đầu trải nghiệm học tập cùng trợ lý AI cá nhân hóa.'
                : 'Vui lòng hoàn tất bước xác thực để tiếp tục.'}
            </p>
          </div>

          {isCredentialMode && (
            <div className="grid grid-cols-2 p-1 mb-6 bg-slate-950/80 rounded-2xl border border-slate-800/90">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('auth.login')}
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('auth.register')}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-950/40 border border-red-900/50 p-3 text-xs text-red-300 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl bg-emerald-950/40 border border-emerald-900/50 p-3 text-xs text-emerald-300 flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />
                <span className="font-medium leading-relaxed">{successMessage}</span>
              </div>
            )}

            {isCredentialMode && (
              <AuthCredentialForm
                mode={mode}
                email={email}
                password={password}
                fullName={fullName}
                phoneNumber={phoneNumber}
                showPassword={showPassword}
                rememberMe={rememberMe}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onFullNameChange={setFullName}
                onPhoneNumberChange={setPhoneNumber}
                onToggleShowPassword={() => setShowPassword(!showPassword)}
                onForgotPasswordClick={() => switchMode('forgot_password')}
                onRememberMeChange={setRememberMe}
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
                onToggleShowPassword={() => setShowPassword(!showPassword)}
              />
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  <span>{t('common.loading')}</span>
                </div>
              ) : (
                <>
                  <span>
                    {mode === 'login'
                      ? t('auth.login')
                      : mode === 'register'
                      ? t('auth.registerSubmit')
                      : mode === 'verify_email_otp'
                      ? t('auth.verifyAndContinue')
                      : mode === 'forgot_password'
                      ? t('auth.sendOtp')
                      : t('auth.saveNewPassword')}
                  </span>
                  <ArrowRight size={15} />
                </>
              )}
            </Button>

            {isCredentialMode && (
              <>
                <div className="relative my-4 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <span className="relative bg-slate-900 px-3 text-[11px] font-medium text-slate-400">
                    {t('auth.orContinueWith')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  disabled={isLoading}
                  className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 active:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-medium text-xs tracking-wide transition-all duration-200 cursor-pointer shadow-sm group"
                >
                  <svg className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.18 3.665-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>
                    {mode === 'login' ? 'Đăng nhập bằng Google' : 'Đăng ký bằng Google'}
                  </span>
                </button>
              </>
            )}

            {!isCredentialMode && (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full text-center text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors py-2 cursor-pointer"
              >
                ← {t('auth.backToLogin')}
              </button>
            )}
          </form>

          <div className="pt-5 mt-5 border-t border-slate-800/80 text-center space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>Bảo mật SSL 256-bit • Dữ liệu mã hóa an toàn</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              {t('auth.agreeTerms')}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <LoginPageContent />
    </Suspense>
  )
}
