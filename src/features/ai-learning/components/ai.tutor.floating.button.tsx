// Nút tròn nổi ở góc dưới bên phải màn hình để đóng mở hộp thoại chat Gia sư AI.
'use client'

import { useState, useEffect } from 'react'
import type React from 'react'
import { Sparkles, X } from 'lucide-react'
import { AiTutorWidget } from '@/features/ai-learning/components/ai.tutor.widget'
import { useMounted } from '@/hooks/use.mounted'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip'

interface AiTutorFloatingButtonProps {
  embedded?: boolean
}

export function AiTutorFloatingButton({ embedded = false }: AiTutorFloatingButtonProps) {
  const isMounted = useMounted()
  const [isOpen, setIsOpen] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

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

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsOpen(false)
    setIsDismissed(true)
  }

  if (!isMounted || isDismissed) return null

  const buttonTrigger = (
    <div className="relative group/btn">
      {!isOpen && (
        <button
          type="button"
          onClick={handleDismiss}
          title="Đóng (F5 sẽ hiện lại)"
          aria-label="Đóng nút Gia sư AI"
          className="absolute -top-1.5 -left-1.5 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-800/90 hover:bg-rose-600 text-white shadow-md transition-all hover:scale-110 cursor-pointer border border-white/60 dark:border-white/30"
        >
          <X className="h-3 w-3 stroke-[2.5]" />
        </button>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleToggle}
            aria-label="Mở Gia sư AI LingoSphere"
            className="group relative flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 via-primary to-teal-400 text-white shadow-2xl transition-transform duration-200 hover:scale-105 active:scale-95 border-2 border-white/30 dark:border-teal-400/50 dark:shadow-[0_8px_30px_rgba(85,175,165,0.4)] cursor-pointer select-none"
          >
            {!isOpen && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 pointer-events-none z-10">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400 border-2 border-emerald-600 dark:border-emerald-950" />
              </span>
            )}

            {isOpen ? (
              <X className="h-6 w-6 stroke-[2.5] text-white transition-transform group-hover:rotate-90" />
            ) : (
              <img
                src="/assets/ai-bot-mascot.png"
                alt="Gia sư AI LingoSphere"
                className="h-8 w-8 object-contain brightness-0 invert drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:scale-110 pointer-events-none select-none"
              />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" sideOffset={10}>
          <span className="text-xs font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Hỏi Gia sư AI LingoSphere
          </span>
        </TooltipContent>
      </Tooltip>
    </div>
  )

  return (
    <>
      <AiTutorWidget isOpen={isOpen} onClose={() => setIsOpen(false)} />
      {embedded ? buttonTrigger : <div className="fixed bottom-[88px] right-6 z-50">{buttonTrigger}</div>}
    </>
  )
}
