'use client'

/**
 * @file PersistentLayout.tsx
 * @description Layout tổng thể bọc sidebar, header và nội dung chính của ứng dụng
 */

import { Suspense, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Sidebar } from '@/components/layout/Sidebar'
import { UtilityHeader } from '@/components/layout/UtilityHeader'
import { useDashboardStore } from '@/store/dashboard-store'
import { useApp } from '@/contexts/AppContext'

function PersistentLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/'
  const { showAction } = useApp()
  const mobileSidebarOpen = useDashboardStore((state) => state.mobileSidebarOpen)
  const setMobileSidebarOpen = useDashboardStore((state) => state.setMobileSidebarOpen)
  const sidebarCollapsed = useDashboardStore((state) => state.sidebarCollapsed)

  const isStandalone =
    pathname === '/' ||
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/course/') ||
    pathname.startsWith('/toeic/exam/')

  if (isStandalone) {
    return <>{children}</>
  }

  const sidebarMargin = sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[252px]'

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Sidebar />
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent className="w-[min(86vw,320px)] border-border bg-surface p-0" side="left">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>
      <div className={`min-h-screen ${sidebarMargin} transition-[margin] duration-200 ease-in-out`}>
        <UtilityHeader onAction={showAction} />
        {children}
      </div>
    </div>
  )
}

export function PersistentLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <PersistentLayoutContent>{children}</PersistentLayoutContent>
    </Suspense>
  )
}
