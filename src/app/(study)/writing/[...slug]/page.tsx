/**
 * @file page.tsx
 * @description Thành phần Page phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (study)/writing/[...slug]
 */

import WritingAppPage from '@/app/(study)/writing/page'

export default function WritingCatchAllPage() {
  return <WritingAppPage />
}
