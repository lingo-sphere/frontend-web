// Component nút tròn nổi ở góc dưới bên phải màn hình để đóng mở hộp thoại chat Gia sư AI.
'use client'

import { useState, useEffect } from 'react'
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

  const buttonTrigger = (
    <>
      <style>{`
        @keyframes aiBotHop {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          10% {
            transform: translateY(-8px) scale(1.08, 0.92);
          }
          20% {
            transform: translateY(-13px) scale(0.96, 1.06) rotate(-7deg);
          }
          30% {
            transform: translateY(-4px) scale(1.03) rotate(7deg);
          }
          40% {
            transform: translateY(-8px) scale(0.98) rotate(-3deg);
          }
          50% {
            transform: translateY(0) scale(1) rotate(0deg);
          }
          58% {
            transform: translateY(-3px) scale(1.02);
          }
          66% {
            transform: translateY(0) scale(1);
          }
        }

        @keyframes aiAuraPulse {
          0% {
            transform: scale(0.95);
            opacity: 0.75;
          }
          55% {
            transform: scale(1.35);
            opacity: 0;
          }
          100% {
            transform: scale(0.95);
            opacity: 0;
          }
        }

        .animate-ai-bot-hop {
          animation: aiBotHop 3.5s ease-in-out infinite;
        }

        .animate-ai-aura {
          animation: aiAuraPulse 3.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleToggle}
            aria-label="Mở Gia sư AI LingoSphere"
            className={`group relative flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 via-primary to-teal-400 text-white shadow-2xl transition-transform duration-200 hover:scale-110 active:scale-95 border-2 border-white/30 dark:border-teal-400/50 dark:shadow-[0_8px_30px_rgba(85,175,165,0.4)] cursor-pointer select-none ${
              isOpen ? '' : 'animate-ai-bot-hop'
            }`}
          >
            {!isOpen && (
              <span className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ai-aura pointer-events-none" />
            )}

            {!isOpen && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 pointer-events-none z-10">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border-2 border-emerald-600 dark:border-emerald-950" />
              </span>
            )}

            {isOpen ? (
              <X className="h-6 w-6 stroke-[2.5] text-white transition-transform group-hover:rotate-90" />
            ) : (
              <img
                src="/assets/ai-bot-mascot.png"
                alt="Gia sư AI LingoSphere"
                className="h-8 w-8 object-contain brightness-0 invert drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:scale-115 pointer-events-none select-none"
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
    </>
  )

  return (
    <>
      <AiTutorWidget isOpen={isOpen} onClose={() => setIsOpen(false)} />
      {embedded ? buttonTrigger : <div className="fixed bottom-[88px] right-6 z-50">{buttonTrigger}</div>}
    </>
  )
}
