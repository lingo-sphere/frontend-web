// Component nút tròn nổi ở góc dưới bên phải màn hình để đóng mở hộp thoại chat cộng đồng.
'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useCommunityChat } from '@/features/community/hooks/use.community.chat';
import { CommunityChatWidget } from '@/features/community/components/community.chat.widget';

const emptySubscribe = () => () => {};

export function CommunityChatFloatingButton() {
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const chatState = useCommunityChat();
  const { isOpen, setIsOpen } = chatState;

  useEffect(() => {
    const handleClose = () => setIsOpen(false);
    window.addEventListener('lingosphere:close-community-chat', handleClose);
    return () => {
      window.removeEventListener('lingosphere:close-community-chat', handleClose);
    };
  }, [setIsOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      window.dispatchEvent(new CustomEvent('lingosphere:close-ai-chat'));
    }
    setIsOpen(!isOpen);
  };

  if (!isMounted) return null;

  return (
    <>
      <CommunityChatWidget chatState={chatState} />

      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={handleToggle}
          aria-label="Mở kênh chat cộng đồng"
          className="group relative flex h-13 w-13 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-white/20 dark:border-teal-400/50 dark:shadow-[0_8px_30px_rgba(85,175,165,0.4)] cursor-pointer"
        >
          {isOpen && (
            <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-surface text-[10px] font-bold text-rose-500 shadow-sm transition-all">
              <X className="h-3 w-3 stroke-[2.5]" />
            </span>
          )}

          {!isOpen && chatState.unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md animate-pulse">
              {chatState.unreadCount > 99 ? '99+' : chatState.unreadCount}
            </span>
          )}

          <MessageSquare className="h-6 w-6 stroke-[1.8] transition-transform group-hover:rotate-6" />
        </button>
      </div>
    </>
  );
}
