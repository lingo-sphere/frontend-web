'use client'

/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (study)/speaking/[...slug]
 */

import SpeakingAppPage from '@/app/(study)/speaking/page'

export default function SpeakingCatchAllPage() {
  return <SpeakingAppPage />
}
