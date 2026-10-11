// Component dropdown hover thông tin tài khoản người dùng và điều hướng các trang cá nhân.

'use client'

import { useTranslation } from 'react-i18next'
import { Globe, Crown } from 'lucide-react'
import { useNavigate } from '@/lib/navigation'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useCartQuery } from '@/features/cart/hooks/use.cart.query'
import { useWishlistQuery } from '@/features/cart/hooks/use.wishlist.query'
import { Icon } from '@/components/icon.map'
import { getRemainingSubscriptionText } from '@/layouts/app.header'
import { resolveMediaUrl } from '@/utils/media.utils'

interface HeaderUserHoverProps {
  isOpen: boolean
  onClose?: () => void
  onLanguageToggle?: () => void
  currentLanguage?: 'VI' | 'EN'
  onOpenUpgrade?: () => void
}

export function HeaderUserHover({
  isOpen,
  onClose,
  onLanguageToggle,
  currentLanguage = 'VI',
  onOpenUpgrade,
}: HeaderUserHoverProps) {
  const { i18n } = useTranslation()
  const isVi = currentLanguage === 'VI' || i18n.language === 'vi'
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { data: cart } = useCartQuery(Boolean(user))
  const { data: wishlist } = useWishlistQuery(Boolean(user))
  const cartItemCount = cart?.total_items || cart?.items?.length || 0
  const wishlistCount = wishlist?.total_items || wishlist?.items?.length || 0

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
    <div
      className={`absolute right-0 top-full pt-2 z-50 transition-all duration-200 ease-out origin-top-right ${
        isOpen
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto visible'
          : 'opacity-0 -translate-y-2 scale-[0.98] pointer-events-none invisible duration-150 ease-in'
      }`}
    >
      <div className="w-72 sm:w-80 max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl text-left divide-y divide-border scrollbar-thin">
        
        <div
          onClick={() => handleItemClick('/profile')}
          className="p-4 flex items-center gap-3.5 cursor-pointer hover:bg-surface-subtle transition-colors group"
        >
          <div className="relative shrink-0">
            <div className="h-13 w-13 rounded-full bg-slate-900 dark:bg-slate-800 text-white font-bold text-base flex items-center justify-center shadow-md overflow-hidden ring-2 ring-primary/20">
              {user.avatar_url ? (
                <img src={resolveMediaUrl(user.avatar_url)} alt={user.full_name} className="h-full w-full object-cover" />
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
                {user.full_name}
              </h3>
              {isPremium && (
                <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[9px] font-extrabold text-white">
                  VIP
                </span>
              )}
            </div>
            <p className="text-xs text-text-tertiary truncate">{user.email}</p>
            {isPremium ? (
              <p className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 truncate mt-0.5">
                <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                <span>{remainingSubText}</span>
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
            onClick={() => handleItemClick('/notes')}
            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-surface-subtle hover:text-text-primary transition-colors cursor-pointer"
          >
            <span>{isVi ? 'Sổ tay ghi chú' : 'Lesson notes'}</span>
          </button>
          <button
            onClick={() => handleItemClick('/exam-history')}
            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-surface-subtle hover:text-text-primary transition-colors cursor-pointer"
          >
            <span>{isVi ? 'Lịch sử làm bài' : 'Exam history'}</span>
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
