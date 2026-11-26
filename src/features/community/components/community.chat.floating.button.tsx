// Nút tròn nổi ở góc dưới bên phải màn hình để đóng mở hộp thoại chat cộng đồng.
'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import type React from 'react'
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
  const [isDismissed, setIsDismissed] = useState(false)

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
          aria-label="Đóng nút Chat cộng đồng"
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
            aria-label="Mở kênh chat cộng đồng"
            className="group relative flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-teal-600 via-primary to-emerald-500 text-white shadow-2xl transition-transform duration-200 hover:scale-105 active:scale-95 border-2 border-white/30 dark:border-teal-400/50 dark:shadow-[0_8px_30px_rgba(85,175,165,0.4)] cursor-pointer select-none"
          >
            {!isOpen && chatState.unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md z-10 border-2 border-white dark:border-emerald-950">
                {chatState.unreadCount > 99 ? '99+' : chatState.unreadCount}
              </span>
            ) : !isOpen ? (
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 pointer-events-none z-10">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-400 border-2 border-emerald-600 dark:border-emerald-950" />
              </span>
            ) : null}

            {isOpen ? (
              <X className="h-6 w-6 stroke-[2.5] text-white transition-transform group-hover:rotate-90" />
            ) : (
              <img
                src="/assets/community-chat-icon.png"
                alt="Chat cộng đồng"
                className="h-8.5 w-8.5 object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.2)] transition-transform duration-300 group-hover:scale-110 pointer-events-none select-none"
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
    </div>
  )

  return (
    <>
      <CommunityChatWidget chatState={chatState} />
      {embedded ? buttonTrigger : <div className="fixed bottom-6 right-6 z-50">{buttonTrigger}</div>}
    </>
  )
}
