// Bố cục tổng thể bọc sidebar, header và nội dung chính của ứng dụng

'use client'

import { Suspense, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent } from '@/components/sheet'
import { Sidebar } from '@/layouts/app.sidebar'
import { UtilityHeader } from '@/layouts/app.header'
import { useDashboardStore } from '@/features/dashboard/store/dashboard.store'
import { useApp } from '@/contexts/app.context'
import { CommunityChatFloatingButton } from '@/features/community/components/community.chat.floating.button'

function PersistentLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/'
  const { showAction } = useApp()
  const mobileSidebarOpen = useDashboardStore((state) => state.mobileSidebarOpen)
  const setMobileSidebarOpen = useDashboardStore((state) => state.setMobileSidebarOpen)
  const sidebarCollapsed = useDashboardStore((state) => state.sidebarCollapsed)

  const isStandalone =
    pathname === '/' ||
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/course/')

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
      <CommunityChatFloatingButton />
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
