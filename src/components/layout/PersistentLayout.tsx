'use client'

/**
 * @file PersistentLayout.tsx
 * @description Component giao diện React PersistentLayout cho học viên
 */

import { Suspense, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { useApp } from '@/contexts/AppContext'

function PersistentLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/'
  const { showAction } = useApp()

  const isStandalone =
    pathname === '/' ||
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/course/') ||
    pathname.startsWith('/toeic/exam/')

  if (isStandalone) {
    return <>{children}</>
  }

  return (
    <AppShell onAction={showAction}>
      {children}
    </AppShell>
  )
}

export function PersistentLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <PersistentLayoutContent>{children}</PersistentLayoutContent>
    </Suspense>
  )
}
