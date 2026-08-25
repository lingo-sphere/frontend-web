// Updated: 2026-08-17
// Layout chung cho tất cả routes:
// - AppShell: sidebar + header
// - Kiểm tra activeNavItem để hiển thị Profile khi cần
// Props:
// - children: page content

import type { ReactNode } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { UserProfileContent } from '@/components/user/UserProfileContent'
import { useApp } from '@/contexts/AppContext'
import { useDashboardStore } from '@/store/dashboard-store'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { showAction } = useApp()
  const activeNavItem = useDashboardStore((state) => state.activeNavItem)

  // Nếu active nav là profile, hiển thị profile content
  if (activeNavItem === 'profile') {
    return (
      <AppShell onAction={showAction}>
        <UserProfileContent />
      </AppShell>
    )
  }

  return (
    <AppShell onAction={showAction}>
      {children}
    </AppShell>
  )
}
