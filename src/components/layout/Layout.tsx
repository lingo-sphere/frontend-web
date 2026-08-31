'use client'

import type { ReactNode } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useApp } from '@/contexts/AppContext'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { showAction } = useApp()

  return (
    <AppShell onAction={showAction}>
      {children}
    </AppShell>
  )
}
