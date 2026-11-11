// Hook ngăn chặn cuộn lan truyền ra màn hình nền khi tương tác với dropdown hoặc modal.
'use client'

import { useEffect, type RefObject } from 'react'

export function usePreventScrollChain(
  containerRef: RefObject<HTMLElement | null>,
  isOpen: boolean
) {
  useEffect(() => {
    if (!isOpen) return
    const container = containerRef.current
    if (!container) return

    const handleWheel = (event: WheelEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return

      let scrollable: HTMLElement | null = null
      let curr: HTMLElement | null = target

      while (curr && curr !== container) {
        const style = window.getComputedStyle(curr)
        const overflowY = style.overflowY
        if (
          (overflowY === 'auto' || overflowY === 'scroll') &&
          curr.scrollHeight > curr.clientHeight
        ) {
          scrollable = curr
          break
        }
        curr = curr.parentElement
      }

      if (scrollable) {
        const { scrollTop, scrollHeight, clientHeight } = scrollable
        const delta = event.deltaY
        const isUp = delta < 0
        const isDown = delta > 0

        const isAtTop = scrollTop <= 0
        const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - 1

        if ((isUp && isAtTop) || (isDown && isAtBottom)) {
          event.preventDefault()
        }
      } else {
        event.preventDefault()
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [containerRef, isOpen])
}

