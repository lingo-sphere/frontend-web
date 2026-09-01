'use client'

/**
 * @file Layout.tsx
 * @description Component giao diện React Layout cho học viên
 */

import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return <>{children}</>
}
