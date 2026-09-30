// Component hiển thị thông tin học viên, nút nâng cấp và đăng nhập/đăng xuất trên Header.
'use client'

import { Button } from '@/components/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip'
import { Icon } from '@/components/icon.map'
import { useNavigate } from '@/lib/navigation'
import { HeaderUserHover } from '@/layouts/header.user.hover'
import { getRemainingSubscriptionText } from '@/layouts/header.utils'
import type { User } from '@/types/api.types'
import { resolveMediaUrl } from '@/utils/media.utils'

interface HeaderUserSectionProps {
  mounted: boolean
  isAuthenticated: boolean
  user: User | null
  isVi: boolean
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onCloseHover: () => void
  onLanguageToggle: () => void
  currentLanguage: 'VI' | 'EN'
  onOpenAuth: () => void
  onOpenUpgrade: () => void
  onLogout: () => void
}

export function HeaderUserSection({
  mounted,
  isAuthenticated,
  user,
  isVi,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onCloseHover,
  onLanguageToggle,
  currentLanguage,
  onOpenAuth,
  onOpenUpgrade,
  onLogout,
}: HeaderUserSectionProps) {
  const navigate = useNavigate()

  if (!mounted) {
    return (
      <div className="h-9 w-20 rounded-xl bg-surface-subtle animate-pulse" />
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <Button
        onClick={onOpenAuth}
        className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs h-9 cursor-pointer"
      >
        <Icon name="logIn" size={15} className="mr-1.5" />
        <span suppressHydrationWarning>{isVi ? 'Đăng nhập' : 'Sign in'}</span>
      </Button>
    )
  }

  return (
    <div
      className="relative flex items-center gap-2 border-l border-border pl-3"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        onClick={() => navigate('/profile')}
        className="flex items-center gap-2 rounded-xl p-1 hover:bg-surface-subtle transition-colors text-left cursor-pointer group"
      >
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs ring-2 ring-primary/20 overflow-hidden shrink-0 shadow-xs">
          {user.avatar_url ? (
            <img src={resolveMediaUrl(user.avatar_url)} alt={user.full_name} className="h-full w-full object-cover" />
          ) : (
            user.full_name?.charAt(0)?.toUpperCase() || 'U'
          )}
          {user.is_premium && (
            <div className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white">
              <Icon name="crown" size={8} className="fill-white text-white" />
            </div>
          )}
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-text-primary leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {user.full_name || 'Học viên'}
            </span>
            {user.is_premium && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[9px] font-extrabold text-white shadow-xs">
                <Icon name="crown" size={9} className="fill-white text-white" />
                VIP
              </span>
            )}
          </div>
          <div className="text-[10px] text-text-tertiary">
            {user.is_premium ? (
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {getRemainingSubscriptionText(user.subscription_expires_at, user.subscription_plan, isVi)}
              </span>
            ) : (
              user.email
            )}
          </div>
        </div>
      </button>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-text-tertiary hover:text-error rounded-lg cursor-pointer"
            onClick={onLogout}
          >
            <Icon name="logOut" size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isVi ? 'Đăng xuất' : 'Log out'}</TooltipContent>
      </Tooltip>

      {isHovered && (
        <HeaderUserHover
          onClose={onCloseHover}
          onLanguageToggle={onLanguageToggle}
          currentLanguage={currentLanguage}
          onOpenUpgrade={onOpenUpgrade}
        />
      )}
    </div>
  )
}
