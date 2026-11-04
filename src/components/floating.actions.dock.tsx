// Khung dock nổi chứa các nút tác vụ nhanh, hỗ trợ người dùng kéo thả tùy chỉnh vị trí theo trục dọc.
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { GripHorizontal } from 'lucide-react'
import { ScrollToTopButton } from '@/components/scroll.to.top.button'
import { AiTutorFloatingButton } from '@/features/ai-learning/components/ai.tutor.floating.button'
import { CommunityChatFloatingButton } from '@/features/community/components/community.chat.floating.button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip'

export function FloatingActionsDock() {
  const [bottomPx, setBottomPx] = useState(24)
  const [isDragging, setIsDragging] = useState(false)

  const dragStartYRef = useRef(0)
  const dragStartBottomRef = useRef(24)
  const dockRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      setBottomPx((prev) => {
        const dockHeight = dockRef.current?.offsetHeight || 180
        const minBottom = 20
        const maxBottom = Math.max(minBottom, window.innerHeight - dockHeight - 76)
        return Math.min(prev, maxBottom)
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    dragStartYRef.current = e.clientY
    dragStartBottomRef.current = bottomPx
    setIsDragging(true)
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const deltaY = dragStartYRef.current - e.clientY
    const dockHeight = dockRef.current?.offsetHeight || 180
    const minBottom = 20
    const maxBottom = Math.max(minBottom, window.innerHeight - dockHeight - 76)
    const nextBottom = Math.max(minBottom, Math.min(maxBottom, dragStartBottomRef.current + deltaY))
    setBottomPx(nextBottom)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setIsDragging(false)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}
  }

  return (
    <div
      ref={dockRef}
      style={{ bottom: `${bottomPx}px` }}
      className={`fixed right-6 z-50 flex flex-col items-center gap-2.5 ${
        isDragging ? 'transition-none select-none' : 'transition-[bottom] duration-200 ease-out'
      }`}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="flex h-5.5 w-9 items-center justify-center rounded-full border border-border/80 bg-surface/95 text-text-tertiary shadow-sm backdrop-blur-md transition-all hover:border-emerald-500/50 hover:text-emerald-600 hover:shadow-md dark:bg-card/95 dark:hover:text-emerald-400 cursor-grab active:cursor-grabbing touch-none select-none"
            aria-label="Kéo thả để chỉnh vị trí hiển thị"
          >
            <GripHorizontal className="h-3.5 w-3.5 stroke-[2.2]" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" sideOffset={10}>
          <span className="text-xs font-medium">Kéo lên/xuống để chỉnh vị trí</span>
        </TooltipContent>
      </Tooltip>

      <ScrollToTopButton embedded />
      <AiTutorFloatingButton embedded />
      <CommunityChatFloatingButton embedded />
    </div>
  )
}
