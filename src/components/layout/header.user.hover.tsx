/**
 * @file header.user.hover.tsx
 * @description Thành phần Header User Hover phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file HeaderUserHover.tsx
 * @description Component dropdown hover thông tin tài khoản người dùng phong cách Udemy
 */

import { useTranslation } from 'react-i18next'
import { ExternalLink, Globe } from 'lucide-react'
import { useNavigate } from '@/lib/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { Icon } from '@/components/icons/icon.map'
import { getRemainingSubscriptionText } from '@/components/layout/app.header'

interface HeaderUserHoverProps {
  onClose?: () => void
  onLanguageToggle?: () => void
  currentLanguage?: 'VI' | 'EN'
  onOpenUpgrade?: () => void
}

export function HeaderUserHover({
  onClose,
  onLanguageToggle,
  currentLanguage = 'VI',
  onOpenUpgrade,
}: HeaderUserHoverProps) {
  const { i18n } = useTranslation()
  const isVi = currentLanguage === 'VI' || i18n.language === 'vi'
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { getTotalItems } = useCartStore()
  const { items: wishlistItems } = useWishlistStore()
  const cartItemCount = getTotalItems ? getTotalItems() : 0
  const wishlistCount = wishlistItems ? wishlistItems.length : 0

  if (!user) return null

  const initials = (user.full_name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const isPremium = Boolean(user.is_premium || user.subscription_expires_at)
  const remainingSubText = isPremium
    ? getRemainingSubscriptionText(user.subscription_expires_at, user.subscription_plan, isVi)
    : ''

  const handleItemClick = (path?: string, action?: () => void) => {
    if (onClose) onClose()
    if (action) {
      action()
    } else if (path) {
      navigate(path)
    }
  }

  return (
    <div className="absolute right-0 top-full pt-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
      <div className="w-72 sm:w-80 max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl text-left divide-y divide-border scrollbar-thin">
        
        <div
          onClick={() => handleItemClick('/profile')}
          className="p-4 flex items-center gap-3.5 cursor-pointer hover:bg-surface-subtle transition-colors group"
        >
          <div className="relative shrink-0">
            <div className="h-13 w-13 rounded-full bg-slate-900 dark:bg-slate-800 text-white font-bold text-base flex items-center justify-center shadow-md overflow-hidden ring-2 ring-primary/20">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            {isPremium && (
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xs">
                <Icon name="crown" size={11} className="fill-white" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-text-primary truncate group-hover:text-primary transition-colors">
                {user.full_name || (isVi ? 'Học viên' : 'Learner')}
              </h3>
              {isPremium && (
                <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[9px] font-extrabold text-white">
                  VIP
                </span>
              )}
            </div>
            <p className="text-xs text-text-tertiary truncate">{user.email}</p>
            {isPremium ? (
              <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 truncate mt-0.5">
                👑 {remainingSubText}
              </p>
            ) : (
              <p className="text-[11px] text-text-tertiary truncate mt-0.5">
                {isVi ? 'Tài khoản tiêu chuẩn' : 'Standard Member'}
              </p>
            )}
          </div>
        </div>

        
        <div className="py-1.5 text-xs text-text-secondary font-medium">
          <button
            onClick={() => handleItemClick('/courses?tab=my-courses')}
            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-surface-subtle hover:text-text-primary transition-colors cursor-pointer"
          >
            <span>{isVi ? 'Khóa học của tôi' : 'My learning'}</span>
          </button>
          <button
            onClick={() => handleItemClick('/cart')}
            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-surface-subtle hover:text-text-primary transition-colors cursor-pointer"
          >
            <span>{isVi ? 'Giỏ hàng của tôi' : 'My cart'}</span>
            {cartItemCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-xs">
                {cartItemCount}
              </span>
            )}
          </button>
          <button
            onClick={() => handleItemClick('/courses?tab=wishlist')}
            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-surface-subtle hover:text-text-primary transition-colors cursor-pointer"
          >
            <span>{isVi ? 'Danh sách yêu thích' : 'Wishlist'}</span>
            {wishlistCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs">
                {wishlistCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              if (onOpenUpgrade) {
                if (onClose) onClose()
                onOpenUpgrade()
              } else {
                handleItemClick('/profile')
              }
            }}
            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-surface-subtle hover:text-text-primary transition-colors cursor-pointer"
          >
            <span>{isVi ? 'Gói thành viên VIP' : 'VIP Membership'}</span>
            {isPremium ? (
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                {isVi ? 'Đang hoạt động' : 'Active'}
              </span>
            ) : (
              <span className="text-[10px] font-bold text-primary">
                {isVi ? 'Nâng cấp' : 'Upgrade'}
              </span>
            )}
          </button>
        </div>

        
        <div className="py-1.5 text-xs text-text-secondary font-medium">
          <button
            onClick={() => handleItemClick('/progress')}
            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-surface-subtle hover:text-text-primary transition-colors cursor-pointer"
          >
            <span>{isVi ? 'Tiến độ học tập' : 'Learning progress'}</span>
          </button>
          <button
            onClick={() => handleItemClick('/notifications')}
            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-surface-subtle hover:text-text-primary transition-colors cursor-pointer"
          >
            <span>{isVi ? 'Thông báo' : 'Notifications'}</span>
          </button>
        </div>

        
        <div className="py-1.5 text-xs text-text-secondary font-medium">
          <button
            onClick={() => handleItemClick('/profile')}
            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-surface-subtle hover:text-text-primary transition-colors cursor-pointer"
          >
            <span>{isVi ? 'Hồ sơ cá nhân' : 'My profile'}</span>
          </button>
          <button
            onClick={() => handleItemClick('/settings')}
            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-surface-subtle hover:text-text-primary transition-colors cursor-pointer"
          >
            <span>{isVi ? 'Cài đặt tài khoản' : 'Account settings'}</span>
          </button>
        </div>

        
        <div className="py-1.5 text-xs text-text-secondary font-medium">
          <button
            onClick={() => {
              if (onLanguageToggle) onLanguageToggle()
            }}
            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-surface-subtle hover:text-text-primary transition-colors cursor-pointer"
          >
            <span>{isVi ? 'Ngôn ngữ' : 'Language'}</span>
            <span className="flex items-center gap-1.5 font-bold text-text-primary">
              <span>{isVi ? 'Tiếng Việt' : 'English'}</span>
              <Globe size={14} className="text-text-tertiary" />
            </span>
          </button>
        </div>

        
        <div className="py-1.5 text-xs text-text-secondary font-medium">
          <button
            onClick={() => handleItemClick(undefined, () => logout())}
            className="w-full px-4 py-2.5 flex items-center justify-between text-error hover:bg-error/10 transition-colors cursor-pointer font-bold"
          >
            <span>{isVi ? 'Đăng xuất' : 'Log out'}</span>
            <Icon name="logOut" size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
