/**
 * @file settings.account.tsx
 * @description Component tab cài đặt tài khoản cá nhân và đổi mật khẩu bảo mật
 */

'use client'

import { useState } from 'react'
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { authService } from '@/features/auth/services/auth.service'
import { toast } from '@/store/toast.store'
import type { User } from '@/types/api.types'

interface SettingsAccountTabProps {
  fullName: string
  setFullName: (name: string) => void
  phoneNumber: string
  setPhoneNumber: (phone: string) => void
  authUser: User | null
  isVi: boolean
  initials: string
}

export function SettingsAccountTab({
  fullName,
  setFullName,
  phoneNumber,
  setPhoneNumber,
  authUser,
  isVi,
  initials,
}: SettingsAccountTabProps) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOldPass, setShowOldPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [isChangingPass, setIsChangingPass] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!oldPassword) {
      toast.warning(
        isVi ? 'Vui lòng nhập mật khẩu hiện tại.' : 'Please enter your current password.',
        isVi ? 'Thiếu thông tin' : 'Missing input'
      )
      return
    }
    if (!newPassword || newPassword.length < 6) {
      toast.warning(
        isVi ? 'Mật khẩu mới phải có tối thiểu 6 ký tự.' : 'New password must be at least 6 characters.',
        isVi ? 'Mật khẩu yếu' : 'Weak password'
      )
      return
    }
    if (newPassword !== confirmPassword) {
      toast.warning(
        isVi ? 'Mật khẩu xác nhận không trùng khớp.' : 'Confirmation password does not match.',
        isVi ? 'Không trùng khớp' : 'Mismatch'
      )
      return
    }
    if (!authUser?.id) {
      toast.error(
        isVi ? 'Vui lòng đăng nhập lại để đổi mật khẩu.' : 'Please re-login to change password.',
        isVi ? 'Lỗi xác thực' : 'Authentication error'
      )
      return
    }

    setIsChangingPass(true)
    try {
      await authService.changePassword(authUser.id, {
        old_password: oldPassword,
        new_password: newPassword,
      })
      toast.success(
        isVi ? 'Đổi mật khẩu thành công! Tài khoản của bạn đã được bảo vệ.' : 'Password updated successfully!',
        isVi ? 'Đổi mật khẩu' : 'Security'
      )
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        (isVi ? 'Mật khẩu hiện tại không đúng hoặc lỗi hệ thống.' : 'Current password incorrect.')
      toast.error(msg, isVi ? 'Lỗi đổi mật khẩu' : 'Error')
    } finally {
      setIsChangingPass(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-border bg-surface shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-border bg-surface-subtle/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-full bg-slate-900 text-white font-bold text-xl flex items-center justify-center overflow-hidden ring-4 ring-primary/20 shadow-md shrink-0">
              {authUser?.avatar_url ? (
                <img src={authUser.avatar_url} alt={authUser.full_name} className="h-full w-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-text-primary">
                  {authUser?.full_name || 'Học viên'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  <CheckCircle2 size={11} />
                  {isVi ? 'Đã xác thực' : 'Verified'}
                </span>
              </div>
              <p className="text-xs text-text-tertiary mt-0.5">{authUser?.email}</p>
              <p className="text-[11px] font-medium text-text-secondary mt-1">
                {isVi ? 'Vai trò: ' : 'Role: '}
                <span className="font-bold text-primary uppercase text-[10px] bg-primary/10 px-2 py-0.5 rounded-md">
                  {authUser?.role || 'Học viên'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">
                {isVi ? 'Họ và tên hiển thị' : 'Full Name'}
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={isVi ? 'Nhập họ và tên...' : 'Enter your name...'}
                className="h-10 rounded-xl bg-background border-border text-xs sm:text-sm font-medium focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">
                {isVi ? 'Số điện thoại' : 'Phone Number'}
              </label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={isVi ? '09xx xxx xxx' : '+84 xxx...'}
                className="h-10 rounded-xl bg-background border-border text-xs sm:text-sm font-medium focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5">
              {isVi ? 'Địa chỉ Email đăng nhập' : 'Login Email'}
            </label>
            <div className="relative">
              <Input
                value={authUser?.email || ''}
                disabled
                className="h-10 rounded-xl bg-surface-subtle border-border text-xs sm:text-sm font-medium text-text-tertiary cursor-not-allowed pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" title="Email chính thức">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <p className="text-[11px] text-text-tertiary mt-1">
              {isVi
                ? 'Email dùng để đăng nhập và nhận thông báo quan trọng. Không thể tự ý thay đổi vì lý do an toàn.'
                : 'Email is used for sign-in and recovery notices.'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border bg-surface shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-border bg-surface-subtle/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-text-primary">
                {isVi ? 'Đổi mật khẩu tài khoản' : 'Change Password'}
              </h3>
              <p className="text-xs text-text-tertiary">
                {isVi ? 'Cập nhật mật khẩu định kỳ để bảo vệ tài khoản tốt nhất' : 'Keep your account secure'}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-5 sm:p-6">
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">
                {isVi ? 'Mật khẩu hiện tại' : 'Current Password'}
              </label>
              <div className="relative">
                <Input
                  type={showOldPass ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 rounded-xl bg-background border-border text-xs sm:text-sm pr-10 focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPass(!showOldPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary cursor-pointer"
                >
                  {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">
                  {isVi ? 'Mật khẩu mới' : 'New Password'}
                </label>
                <div className="relative">
                  <Input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 rounded-xl bg-background border-border text-xs sm:text-sm pr-10 focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary cursor-pointer"
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">
                  {isVi ? 'Xác nhận mật khẩu mới' : 'Confirm New Password'}
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 rounded-xl bg-background border-border text-xs sm:text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isChangingPass}
              className="rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 h-10 transition-colors shadow-sm shadow-primary/20 cursor-pointer"
            >
              {isChangingPass ? (
                <>
                  <Loader2 size={15} className="animate-spin mr-2" />
                  <span>{isVi ? 'Đang cập nhật...' : 'Updating...'}</span>
                </>
              ) : (
                <span>{isVi ? 'Cập nhật mật khẩu' : 'Update Password'}</span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
