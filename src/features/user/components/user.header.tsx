/**
 * @file user.header.tsx
 * @description Component giao diện React UserStatsHeader cho học viên
 */

import { Icon } from '@/components/icon.map'
import { Button } from '@/components/button'
import type { User } from '@/features/user/types/user'

interface UserAvatarProps {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  editable?: boolean
  onClick?: () => void
}

export function UserAvatar({
  src,
  name,
  size = 'md',
  editable = false,
  onClick,
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  }

  const initials = name
    ? name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : ''

  return (
    <div className="relative group">
      {src ? (
        <img
          src={src}
          alt="Avatar"
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-surface-subtle`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-slate-900 dark:bg-slate-800 text-white font-bold flex items-center justify-center shadow-md ring-2 ring-primary/20`}
        >
          {initials ? (
            <span
              suppressHydrationWarning
              className={size === 'xl' ? 'text-2xl font-bold' : size === 'lg' ? 'text-lg font-bold' : 'text-xs font-semibold'}
            >
              {initials}
            </span>
          ) : (
            <Icon
              name="user"
              size={size === 'xl' ? 40 : size === 'lg' ? 24 : 16}
            />
          )}
        </div>
      )}
      {editable && (
        <button
          onClick={onClick}
          className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Icon name="camera" size={20} className="text-white" />
        </button>
      )}
    </div>
  )
}

interface UserStatsHeaderProps {
  user: User
  onEditClick: () => void
}

function formatSubscriptionRemaining(expiresAt?: string | null, plan?: string | null): { text: string; detail: string; isExpired: boolean } {
  if (plan === 'LIFETIME') {
    return {
      text: 'Gói Trọn Đời (Vĩnh Viễn)',
      detail: 'Không giới hạn thời gian sử dụng',
      isExpired: false,
    }
  }

  if (!expiresAt) {
    return {
      text: 'Gói Premium VIP',
      detail: 'Tài khoản đặc quyền VIP',
      isExpired: false,
    }
  }

  const expDate = new Date(expiresAt)
  const diffMs = expDate.getTime() - Date.now()
  const formattedExpDate = expDate.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  if (diffMs <= 0) {
    return {
      text: 'Gói VIP đã hết hạn',
      detail: `Đã hết hạn vào ngày ${formattedExpDate}`,
      isExpired: true,
    }
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  let remainingText = ''
  if (days > 30) {
    const months = Math.floor(days / 30)
    const remDays = days % 30
    remainingText = `Còn ${months} tháng ${remDays > 0 ? `${remDays} ngày` : ''}`
  } else if (days > 0) {
    remainingText = `Còn ${days} ngày ${hours > 0 ? `${hours} giờ` : ''}`
  } else if (hours > 0) {
    remainingText = `Còn ${hours} giờ ${mins} phút`
  } else {
    remainingText = `Còn ${mins} phút`
  }

  return {
    text: remainingText,
    detail: `Hết hạn vào: ${formattedExpDate}`,
    isExpired: false,
  }
}

export function UserStatsHeader({ user, onEditClick }: UserStatsHeaderProps) {
  const isPremium = Boolean(user.is_premium || user.subscription_expires_at)
  const subInfo = formatSubscriptionRemaining(user.subscription_expires_at, user.subscription_plan)

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
      <div className="relative">
        <UserAvatar src={user.avatar_url} name={user.full_name} size="xl" />
        {isPremium && (
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md ring-2 ring-background">
            <Icon name="crown" size={15} className="fill-white" />
          </div>
        )}
      </div>

      <div className="flex-1 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
          <h2 suppressHydrationWarning className="text-xl font-bold text-text-primary">
            {user.full_name}
          </h2>
          <span className="text-xs px-2.5 py-0.5 bg-primary-10 text-primary font-semibold rounded-full w-fit mx-auto sm:mx-0">
            Level {user.stats?.level || 1}
          </span>
          {isPremium && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/30 w-fit mx-auto sm:mx-0">
              <Icon name="crown" size={13} className="fill-amber-500 text-amber-500" />
              Premium VIP
            </span>
          )}
        </div>
        <p suppressHydrationWarning className="text-sm text-text-secondary mb-2">{user.email}</p>
        
        
        {isPremium && (
          <div className="mb-3 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-3 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Icon name="crown" size={20} className="fill-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      Gói {user.subscription_plan === 'YEARLY' ? '1 Năm' : user.subscription_plan === 'LIFETIME' ? 'Trọn Đời' : 'VIP Cao Cấp'}
                    </span>
                    <span className={`inline-flex items-center px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                      subInfo.isExpired ? 'bg-error/10 text-error' : 'bg-success/15 text-success'
                    }`}>
                      {subInfo.isExpired ? 'Hết hạn' : 'Đang hoạt động'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-text-primary mt-0.5">
                    Thời gian còn lại: <span className="text-amber-600 dark:text-amber-400">{subInfo.text}</span>
                  </p>
                </div>
              </div>
              <div className="text-right sm:border-l sm:border-amber-500/20 sm:pl-3">
                <p className="text-[11px] text-text-tertiary">
                  {subInfo.detail}
                </p>
              </div>
            </div>
          </div>
        )}

        {user.bio && (
          <p className="text-xs text-text-tertiary max-w-lg mb-3">
            {user.bio}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onEditClick}
            className="text-xs"
          >
            <Icon name="edit" size={14} />
            Chỉnh sửa hồ sơ
          </Button>
        </div>
      </div>
    </div>
  )
}
