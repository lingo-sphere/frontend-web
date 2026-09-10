// Component nút tròn nổi ở góc dưới bên phải màn hình để đóng mở hộp thoại chat cộng đồng.
'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useCommunityChat } from '@/features/community/hooks/use.community.chat';
import { CommunityChatWidget } from '@/features/community/components/community.chat.widget';

export function CommunityChatFloatingButton() {
  const [isMounted, setIsMounted] = useState(false);
  const chatState = useCommunityChat();
  const { isOpen, setIsOpen } = chatState;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <CommunityChatWidget chatState={chatState} />

      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Mở kênh chat cộng đồng"
          className="group relative flex h-13 w-13 items-center justify-center rounded-full bg-[#1E293B] text-white shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 dark:bg-slate-800 dark:border dark:border-slate-700"
        >
          {isOpen && (
            <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-bold text-rose-500 shadow-sm transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-rose-400">
              <X className="h-3 w-3 stroke-[2.5]" />
            </span>
          )}

          <MessageSquare className="h-6 w-6 stroke-[1.8] transition-transform group-hover:rotate-6" />
        </button>
      </div>
    </>
  );
}
