
import { useTranslation } from 'react-i18next'
import { ChevronDown, PanelLeftClose, PanelLeft } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { SidebarNav } from '@/components/layout/SidebarNav'
import { NAV_GROUPS } from '@/config/navigation.config'
import { useAuthStore } from '@/store/auth-store'
import { useDashboardStore } from '@/store/dashboard-store'

interface SidebarProps {
  mobile?: boolean
}

export function Sidebar({ mobile = false }: SidebarProps) {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const activeNavItem = useDashboardStore((state) => state.activeNavItem)
  const setActiveNavItem = useDashboardStore((state) => state.setActiveNavItem)
  const setMobileSidebarOpen = useDashboardStore((state) => state.setMobileSidebarOpen)
  const sidebarCollapsed = useDashboardStore((state) => state.sidebarCollapsed)
  const toggleSidebarCollapsed = useDashboardStore((state) => state.toggleSidebarCollapsed)
  const { user, isAuthenticated } = useAuthStore()

  const handleNavigate = (id: string) => {
    setActiveNavItem(id)
    setMobileSidebarOpen(false)
  }

  const handleProfileClick = () => {
    setActiveNavItem('profile')
    setMobileSidebarOpen(false)
    window.location.href = '/profile'
  }

  const sidebarWidth = sidebarCollapsed ? 'w-[72px]' : 'w-[252px]'
  const displayName = isAuthenticated && user?.full_name ? user.full_name : isVietnamese ? 'Khách / Học viên' : 'Guest Learner'
  const userLevel = user?.level || 'A1'

  const content = (
    <>
      <div className={`flex items-center gap-3 border-b border-border px-2 pb-5 ${sidebarCollapsed ? 'justify-center' : ''}`}>
        <img
          alt="LingoSphere logo"
          className="h-9 w-9 rounded-xl bg-primary-soft object-contain p-1"
          height="36"
          src="/assets/lingosphere-logo.png"
          width="36"
        />
        <div className={sidebarCollapsed ? 'hidden' : ''}>
          <p className="text-[16px] font-bold leading-5 text-text-primary" suppressHydrationWarning>{t('common.appName')}</p>
          <p className="mt-0.5 text-[11px] font-medium leading-4 text-text-tertiary" suppressHydrationWarning>{isVietnamese ? 'Học tiếng Anh' : 'English learning'}</p>
        </div>
      </div>
      <SidebarNav activeItem={activeNavItem} groups={NAV_GROUPS} onNavigate={handleNavigate} collapsed={sidebarCollapsed} />
      <Button
        aria-label="Open profile"
        className={`mt-4 h-auto w-full shrink-0 justify-start gap-3 rounded-2xl bg-surface-subtle p-3 text-left hover:bg-surface-hover ${sidebarCollapsed ? '!justify-center !px-0' : ''}`}
        onClick={handleProfileClick}
        variant="ghost"
      >
        <Avatar className="h-9 w-9 rounded-xl" size="default">
          <AvatarImage alt="User avatar" src={user?.avatar_url || ''} />
          <AvatarFallback className="rounded-xl bg-primary-soft text-primary">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className={`min-w-0 flex-1 ${sidebarCollapsed ? 'hidden' : ''}`}>
          <span className="block truncate text-[13px] font-semibold text-text-primary" suppressHydrationWarning>{displayName}</span>
          <span className="mt-0.5 block text-[11px] text-text-tertiary" suppressHydrationWarning>{t('dashboard.level')} {userLevel}</span>
        </span>
        <ChevronDown aria-hidden="true" className={`h-4 w-4 text-text-tertiary ${sidebarCollapsed ? 'hidden' : ''}`} />
      </Button>
      {!mobile && (
        <Button
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`mt-3 h-auto w-full justify-center gap-2 rounded-xl p-2 text-text-tertiary hover:bg-surface-hover hover:text-text-primary ${sidebarCollapsed ? '!px-0' : ''}`}
          onClick={toggleSidebarCollapsed}
          variant="ghost"
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="text-[12px] font-medium">{isVietnamese ? 'Thu gọn' : 'Collapse'}</span>
            </>
          )}
        </Button>
      )}
    </>
  )

  if (mobile) {
    return <div className="flex h-full w-full flex-col bg-surface px-4 py-5">{content}</div>
  }

  return (
    <aside className={`fixed inset-y-0 left-0 z-20 hidden h-screen flex-col overflow-hidden border-r border-border bg-surface px-4 py-5 transition-all duration-200 lg:flex ${sidebarWidth}`}>
      {content}
    </aside>
  )
}
