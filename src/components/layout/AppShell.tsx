
'use client'

import type { ReactNode } from 'react'

import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Sidebar } from '@/components/layout/Sidebar'
import { UtilityHeader } from '@/components/layout/UtilityHeader'
import { useDashboardStore } from '@/store/dashboard-store'

interface AppShellProps {
  children: ReactNode
  onAction: (message: string) => void
}

export function AppShell({ children, onAction }: AppShellProps) {
  const mobileSidebarOpen = useDashboardStore((state) => state.mobileSidebarOpen)
  const setMobileSidebarOpen = useDashboardStore((state) => state.setMobileSidebarOpen)
  const sidebarCollapsed = useDashboardStore((state) => state.sidebarCollapsed)

  const sidebarMargin = sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[252px]'

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Sidebar />
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent className="w-[min(86vw,320px)] border-border bg-surface p-0" side="left">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>
      <div className={`min-h-screen ${sidebarMargin} transition-all duration-200`}>
        <UtilityHeader onAction={onAction} />
        {children}
      </div>
    </div>
  )
}
