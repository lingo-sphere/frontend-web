'use client'

/**
 * @file Sidebar.tsx
 * @description Component giao diện React Sidebar cho học viên
 */

import { useTranslation } from 'react-i18next'
import { PanelLeftClose, PanelLeft } from 'lucide-react'
import { useNavigate } from '@/lib/navigation'
import { useMounted } from '@/hooks/use-mounted'
import { Button } from '@/components/ui/button'
import { SidebarNav } from '@/components/layout/SidebarNav'
import { NAV_GROUPS } from '@/config/navigation.config'
import { useDashboardStore } from '@/store/dashboard-store'

interface SidebarProps {
  mobile?: boolean
}

export function Sidebar({ mobile = false }: SidebarProps) {
  const { t, i18n } = useTranslation()
  const mounted = useMounted()
  const navigate = useNavigate()
  const activeNavItem = useDashboardStore((state) => state.activeNavItem)
  const setActiveNavItem = useDashboardStore((state) => state.setActiveNavItem)
  const setMobileSidebarOpen = useDashboardStore((state) => state.setMobileSidebarOpen)
  const sidebarCollapsed = useDashboardStore((state) => state.sidebarCollapsed)
  const toggleSidebarCollapsed = useDashboardStore((state) => state.toggleSidebarCollapsed)

  const isVietnamese = mounted ? i18n.language === 'vi' : true

  const handleNavigate = (id: string) => {
    setActiveNavItem(id)
    setMobileSidebarOpen(false)
  }

  const sidebarWidth = sidebarCollapsed ? 'w-[72px]' : 'w-[252px]'

  const content = (
    <>
      <div
        onClick={() => {
          handleNavigate('home')
          navigate('/home')
        }}
        className={`flex items-center gap-3 border-b border-border px-2 pb-5 cursor-pointer hover:opacity-90 transition-opacity ${
          sidebarCollapsed ? 'justify-center' : ''
        }`}
      >
        <img
          alt="LingoSphere logo"
          className="h-9 w-9 rounded-xl bg-primary-soft object-contain p-1"
          height="36"
          src="/assets/lingosphere-logo.png"
          width="36"
        />
        <div className={sidebarCollapsed ? 'hidden' : ''}>
          <p className="text-[16px] font-bold leading-5 text-text-primary" suppressHydrationWarning>
            {t('common.appName')}
          </p>
          <p
            className="mt-0.5 text-[11px] font-medium leading-4 text-text-tertiary"
            suppressHydrationWarning
          >
            {isVietnamese ? 'Học tiếng Anh' : 'English learning'}
          </p>
        </div>
      </div>
      <SidebarNav
        activeItem={activeNavItem}
        groups={NAV_GROUPS}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
      />
      {!mobile && (
        <Button
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`mt-auto h-8 w-full justify-center gap-2 rounded-lg py-1 text-text-tertiary hover:bg-surface-hover hover:text-text-primary ${
            sidebarCollapsed ? '!px-0' : ''
          }`}
          onClick={toggleSidebarCollapsed}
          variant="ghost"
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium" suppressHydrationWarning>
                {isVietnamese ? 'Thu gọn' : 'Collapse'}
              </span>
            </>
          )}
        </Button>
      )}
    </>
  )

  if (mobile) {
    return <aside className="flex h-full flex-col bg-surface p-4">{content}</aside>
  }

  return (
    <aside
      aria-label="Desktop sidebar"
      className={`fixed inset-y-0 left-0 z-20 hidden flex-col border-r border-border bg-surface p-4 transition-all duration-200 lg:flex ${sidebarWidth}`}
    >
      {content}
    </aside>
  )
}
