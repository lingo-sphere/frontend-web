// Component nút tròn nổi ở góc dưới bên phải màn hình để đóng mở hộp thoại chat cộng đồng.
'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { X, MessageCircle } from 'lucide-react'
import { useCommunityChat } from '@/features/community/hooks/use.community.chat'
import { CommunityChatWidget } from '@/features/community/components/community.chat.widget'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip'

const emptySubscribe = () => () => {}

interface CommunityChatFloatingButtonProps {
  embedded?: boolean
}

export function CommunityChatFloatingButton({ embedded = false }: CommunityChatFloatingButtonProps) {
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false)
  const chatState = useCommunityChat()
  const { isOpen, setIsOpen } = chatState

  useEffect(() => {
    const handleClose = () => setIsOpen(false)
    window.addEventListener('lingosphere:close-community-chat', handleClose)
    return () => {
      window.removeEventListener('lingosphere:close-community-chat', handleClose)
    }
  }, [setIsOpen])

  const handleToggle = () => {
    if (!isOpen) {
      window.dispatchEvent(new CustomEvent('lingosphere:close-ai-chat'))
    }
    setIsOpen(!isOpen)
  }

  if (!isMounted) return null

  const buttonTrigger = (
    <>
      <style>{`
        @keyframes chatBubbleHop {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          10% {
            transform: translateY(-8px) scale(1.08, 0.92);
          }
          20% {
            transform: translateY(-13px) scale(0.96, 1.06) rotate(6deg);
          }
          30% {
            transform: translateY(-4px) scale(1.03) rotate(-6deg);
          }
          40% {
            transform: translateY(-8px) scale(0.98) rotate(3deg);
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

        @keyframes chatAuraPulse {
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

        .animate-chat-hop {
          animation: chatBubbleHop 3.5s ease-in-out infinite 1.75s;
        }

        .animate-chat-aura {
          animation: chatAuraPulse 3.5s cubic-bezier(0, 0, 0.2, 1) infinite 1.75s;
        }
      `}</style>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleToggle}
            aria-label="Mở kênh chat cộng đồng"
            className={`group relative flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-teal-600 via-primary to-emerald-500 text-white shadow-2xl transition-transform duration-200 hover:scale-110 active:scale-95 border-2 border-white/30 dark:border-teal-400/50 dark:shadow-[0_8px_30px_rgba(85,175,165,0.4)] cursor-pointer select-none ${
              isOpen ? '' : 'animate-chat-hop'
            }`}
          >
            {!isOpen && (
              <span className="absolute inset-0 rounded-full bg-teal-400/40 animate-chat-aura pointer-events-none" />
            )}

            {!isOpen && chatState.unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md animate-pulse z-10 border-2 border-white dark:border-emerald-950">
                {chatState.unreadCount > 99 ? '99+' : chatState.unreadCount}
              </span>
            ) : !isOpen ? (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 pointer-events-none z-10">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-teal-400 border-2 border-emerald-600 dark:border-emerald-950" />
              </span>
            ) : null}

            {isOpen ? (
              <X className="h-6 w-6 stroke-[2.5] text-white transition-transform group-hover:rotate-90" />
            ) : (
              <img
                src="/assets/community-chat-icon.png"
                alt="Chat cộng đồng"
                className="h-8.5 w-8.5 object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.2)] transition-transform duration-300 group-hover:scale-115 pointer-events-none select-none"
              />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" sideOffset={10}>
          <span className="text-xs font-bold flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-teal-300" />
            Chat cộng đồng LingoSphere
          </span>
        </TooltipContent>
      </Tooltip>
    </>
  )

  return (
    <>
      <CommunityChatWidget chatState={chatState} />
      {embedded ? buttonTrigger : <div className="fixed bottom-6 right-6 z-50">{buttonTrigger}</div>}
    </>
  )
}
