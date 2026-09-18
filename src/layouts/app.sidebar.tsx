// Thanh điều hướng bên dành cho học viên hỗ trợ thu gọn và chuyển hướng.

'use client'

import { useTranslation } from 'react-i18next'
import { PanelLeftClose } from 'lucide-react'
import { useNavigate } from '@/lib/navigation'
import { useMounted } from '@/hooks/use.mounted'
import { SidebarNav } from '@/layouts/sidebar.nav'
import { NAV_GROUPS } from '@/config/navigation.config'
import { useApp } from '@/contexts/app.context'

interface SidebarProps {
  mobile?: boolean
}

export function Sidebar({ mobile = false }: SidebarProps) {
  const { t, i18n } = useTranslation()
  const mounted = useMounted()
  const navigate = useNavigate()
  const { sidebarCollapsed, toggleSidebarCollapsed, setMobileSidebarOpen } = useApp()

  const isVietnamese = mounted ? i18n.language === 'vi' : true

  const handleNavigate = (_id?: string) => {
    setMobileSidebarOpen(false)
  }

  const sidebarWidth = sidebarCollapsed ? 'w-[72px]' : 'w-[252px]'

  const content = (
    <div className="flex flex-col h-full select-none justify-between overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0">
        <button
          onClick={() => {
            handleNavigate('home')
            navigate('/home')
          }}
          type="button"
          title={isVietnamese ? 'Về trang Tổng quan' : 'Go to Dashboard'}
          className={`w-full shrink-0 flex items-center gap-3 pb-3.5 border-b border-border text-left cursor-pointer group transition-all ${
            sidebarCollapsed && !mobile ? 'justify-center' : 'px-1'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary/90 to-primary flex items-center justify-center shadow-md shadow-primary/25 shrink-0 ring-1 ring-black/5 dark:ring-white/20 group-hover:scale-105 group-hover:shadow-primary/40 transition-all duration-200 overflow-hidden p-1">
            <img
              alt="LingoSphere logo"
              className="h-full w-full object-contain rounded-lg"
              src="/assets/lingosphere-logo.png"
            />
          </div>
          {(!sidebarCollapsed || mobile) && (
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-sm text-text-primary truncate tracking-tight group-hover:text-primary transition-colors" suppressHydrationWarning>
                {t('common.appName')}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] text-primary font-bold uppercase tracking-wider truncate" suppressHydrationWarning>
                  {t('nav.englishLearning')}
                </p>
              </div>
            </div>
          )}
        </button>

        <SidebarNav
          groups={NAV_GROUPS}
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed && !mobile}
        />
      </div>

      <div className="pt-2 shrink-0 border-t border-border">
        {!mobile && (
          <button
            className={`w-full flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all cursor-pointer ${
              sidebarCollapsed ? 'px-0' : ''
            }`}
            onClick={toggleSidebarCollapsed}
            type="button"
            title={sidebarCollapsed ? (isVietnamese ? 'Mở rộng menu' : 'Expand menu') : (isVietnamese ? 'Thu gọn menu' : 'Collapse menu')}
          >
            <PanelLeftClose className={`w-4 h-4 shrink-0 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            {!sidebarCollapsed && (
              <span suppressHydrationWarning>
                {isVietnamese ? 'Thu gọn menu' : t('common.collapse')}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  )

  if (mobile) {
    return <aside className="flex h-full flex-col bg-surface p-4">{content}</aside>
  }

  return (
    <aside
      aria-label="Desktop sidebar"
      className={`fixed inset-y-0 left-0 z-20 hidden flex-col border-r border-border bg-surface transition-all duration-200 lg:flex ${sidebarWidth} ${
        sidebarCollapsed ? 'p-2.5' : 'p-4'
      }`}
    >
      {content}
    </aside>
  )
}

