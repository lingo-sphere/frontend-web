/**
 * @file header.search.tsx
 * @description Component nút menu mobile và thanh tìm kiếm từ điển nhanh trên Header
 */

'use client'

import { Button } from '@/components/button'
import { Icon } from '@/components/icon.map'

interface HeaderSearchDictionaryProps {
  onOpenMobileSidebar: () => void
  onOpenDictionary: () => void
  isVi: boolean
}

export function HeaderSearchDictionary({
  onOpenMobileSidebar,
  onOpenDictionary,
  isVi,
}: HeaderSearchDictionaryProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <Button
        aria-label="Open navigation"
        className="lg:hidden"
        onClick={onOpenMobileSidebar}
        size="icon"
        variant="outline"
      >
        <Icon name="menu" size={17} />
      </Button>
      <button
        onClick={onOpenDictionary}
        className="group relative flex h-10 min-w-0 max-w-[330px] flex-1 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-3.5 text-left transition-colors hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/15"
      >
        <Icon className="shrink-0 text-text-tertiary" name="search" size={18} />
        <span suppressHydrationWarning className="flex-1 truncate text-[13px] text-text-tertiary">
          {isVi ? 'Tra từ điển...' : 'Search dictionary...'}
        </span>
      </button>
    </div>
  )
}
