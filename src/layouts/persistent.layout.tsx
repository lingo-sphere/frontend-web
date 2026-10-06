// Bố cục tổng thể bọc sidebar, header và nội dung chính của ứng dụng
'use client'

import { Suspense, useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sheet, SheetContent } from '@/components/sheet'
import { Sidebar } from '@/layouts/app.sidebar'
import { UtilityHeader } from '@/layouts/app.header'
import { useApp } from '@/contexts/app.context'
import { CommunityChatFloatingButton } from '@/features/community/components/community.chat.floating.button'
import { ScrollToTopButton } from '@/components/scroll.to.top.button'

function PersistentLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const { showAction, mobileSidebarOpen, setMobileSidebarOpen, sidebarCollapsed } = useApp()

  useEffect(() => {
    const handleOpenAuth = () => {
      router.push('/login')
    }
    window.addEventListener('lingosphere:open-auth-modal', handleOpenAuth)
    return () => {
      window.removeEventListener('lingosphere:open-auth-modal', handleOpenAuth)
    }
  }, [router])

  const isStandalone =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/course/')

  const sidebarMargin = sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[252px]'

  return (
    <>
      {isStandalone ? (
        children
      ) : (
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
      )}
      <ScrollToTopButton />
    </>
  )
}

export function PersistentLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <PersistentLayoutContent>{children}</PersistentLayoutContent>
    </Suspense>
  )
}
