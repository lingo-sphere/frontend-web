// Component nút tròn nổi ở góc dưới bên phải màn hình để đóng mở hộp thoại chat Gia sư AI.
'use client'

import { useState, useEffect } from 'react'
import { Sparkles, X } from 'lucide-react'
import { AiTutorWidget } from '@/features/ai-learning/components/ai.tutor.widget'
import { useMounted } from '@/hooks/use.mounted'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip'

export function AiTutorFloatingButton() {
  const isMounted = useMounted()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleClose = () => setIsOpen(false)
    window.addEventListener('lingosphere:close-ai-chat', handleClose)
    return () => {
      window.removeEventListener('lingosphere:close-ai-chat', handleClose)
    }
  }, [])

  const handleToggle = () => {
    if (!isOpen) {
      window.dispatchEvent(new CustomEvent('lingosphere:close-community-chat'))
    }
    setIsOpen(!isOpen)
  }

  if (!isMounted) return null

  return (
    <>
      <AiTutorWidget isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <div className="fixed bottom-[88px] right-6 z-50">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleToggle}
              aria-label="Mở Gia sư AI LingoSphere"
              className="group relative flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 via-primary to-teal-400 text-white shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-white/25 dark:border-teal-400/50 dark:shadow-[0_8px_30px_rgba(85,175,165,0.4)] cursor-pointer"
            >
              {isOpen && (
                <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-surface text-[10px] font-bold text-rose-500 shadow-sm transition-all">
                  <X className="h-3 w-3 stroke-[2.5]" />
                </span>
              )}

              <Sparkles className="h-6 w-6 stroke-[1.8] transition-transform group-hover:rotate-12" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={10}>
            <span className="text-xs font-medium">Hỏi Gia sư AI</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  )
}
