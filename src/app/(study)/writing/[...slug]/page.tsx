/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (study)/writing/[...slug]
 */

'use client'

import WritingAppPage from '@/app/(study)/writing/page'

export default function WritingCatchAllPage() {
  return <WritingAppPage />
}
