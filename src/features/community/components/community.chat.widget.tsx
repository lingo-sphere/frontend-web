// Component giao diện hộp thoại chat cộng đồng mini dạng tab nổi bên phải màn hình
'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, MessageCircle } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useCommunityChat } from '@/features/community/hooks/use.community.chat'
import { CommunityChatHeader } from '@/features/community/components/community.chat.header'
import { CommunityChatInputBar } from '@/features/community/components/community.chat.input.bar'
import { CommunityChatReactionsModal } from '@/features/community/components/community.chat.reactions.modal'
import { CommunityChatMessageItem } from '@/features/community/components/community.chat.message.item'

interface CommunityChatWidgetProps {
  chatState: ReturnType<typeof useCommunityChat>
}

export function CommunityChatWidget({ chatState }: CommunityChatWidgetProps) {
  const {
    isOpen,
    setIsOpen,
    messages,
    pinnedMessages,
    room,
    eligibility,
    isLoading,
    onlineCount,
    typingUsers,
    replyTo,
    setReplyTo,
    errorBanner,
    hasMore,
    isLoadingMore,
    loadMoreMessages,
    refreshData,
    sendMessage,
    deleteMessage,
    pinMessage,
    unpinMessage,
    reactToMessage,
    sendTyping,
    uploadChatImage,
  } = chatState

  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [showRoomInfo, setShowRoomInfo] = useState(false)
  const [activeEmojiPicker, setActiveEmojiPicker] = useState<string | null>(null)
  const [selectedMsgIdForReactions, setSelectedMsgIdForReactions] = useState<string | null>(null)
  const [dismissedEmojiBarMsgId, setDismissedEmojiBarMsgId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const previousScrollHeightRef = useRef<number>(0)
  const isPrependingRef = useRef<boolean>(false)
  const lastMessageIdRef = useRef<string | null>(null)
  const initialScrollDoneRef = useRef<boolean>(false)

  const selectedMsgForReactions = messages.find((m) => m._id === selectedMsgIdForReactions) || null

  const handleScroll = () => {
    if (!scrollRef.current) return
    if (scrollRef.current.scrollTop <= 50 && hasMore && !isLoadingMore) {
      previousScrollHeightRef.current = scrollRef.current.scrollHeight
      isPrependingRef.current = true
      loadMoreMessages()
    }
  }

  useEffect(() => {
    if (!scrollRef.current) return

    if (isPrependingRef.current && previousScrollHeightRef.current > 0) {
      const heightDiff = scrollRef.current.scrollHeight - previousScrollHeightRef.current
      scrollRef.current.scrollTop = heightDiff
      previousScrollHeightRef.current = 0
      isPrependingRef.current = false
      return
    }

    if (!initialScrollDoneRef.current && messages.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      initialScrollDoneRef.current = true
      lastMessageIdRef.current = messages[messages.length - 1]._id
      return
    }

    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg && lastMsg._id !== lastMessageIdRef.current) {
        lastMessageIdRef.current = lastMsg._id
        const isNearBottom =
          scrollRef.current.scrollHeight - scrollRef.current.scrollTop - scrollRef.current.clientHeight < 160
        const isMe = user?.user_id === lastMsg.sender_id
        if (isNearBottom || isMe) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
      }
    }
  }, [messages, user?.user_id])

  useEffect(() => {
    if (isOpen && scrollRef.current && initialScrollDoneRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [isOpen])

  const isRoomLocked = room ? !room.is_chat_enabled : false
  const isPrivileged = eligibility?.role === 'ADMIN' || eligibility?.role === 'MODERATOR'
  const canPin =
    eligibility?.role === 'ADMIN' ||
    (eligibility?.role === 'MODERATOR' && Boolean(eligibility?.member?.moderator_permissions?.can_pin_messages))

  const activePinnedMsg = pinnedMessages.length > 0 ? pinnedMessages[pinnedMessages.length - 1] : undefined

  return (
    <div
      className={`fixed bottom-24 right-6 z-50 flex h-[580px] max-h-[calc(100vh-120px)] w-[380px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[28px] border-2 border-border/80 dark:border-teal-400/50 bg-surface/98 dark:bg-[#131e1e]/98 text-text-primary shadow-2xl shadow-slate-900/15 dark:shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(85,175,165,0.25)] ring-1 ring-black/5 dark:ring-white/15 backdrop-blur-xl transition-all duration-200 ease-out origin-bottom-right ${
        isOpen
          ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
      }`}
    >
      <CommunityChatHeader
        room={room}
        onlineCount={onlineCount}
        isLoading={isLoading}
        errorBanner={errorBanner}
        activePinnedMsg={activePinnedMsg}
        canPin={Boolean(canPin)}
        showRoomInfo={showRoomInfo}
        onToggleRoomInfo={() => setShowRoomInfo(!showRoomInfo)}
        onRefreshData={refreshData}
        onClose={() => setIsOpen(false)}
        onUnpinMessage={unpinMessage}
      />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 space-y-2 overflow-y-auto p-3.5 bg-surface/60 dark:bg-[#101818]/80"
      >
        {isLoadingMore && (
          <div className="flex items-center justify-center py-2 text-text-tertiary">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary mr-1.5" />
            <span className="text-[11px]">Đang tải tin nhắn cũ hơn...</span>
          </div>
        )}

        {!hasMore && messages.length >= 20 && (
          <div className="py-1.5 text-center text-[10px] text-text-tertiary/70">
            Đã hiển thị toàn bộ lịch sử tin nhắn
          </div>
        )}

        {isLoading && messages.length === 0 ? (
          <div className="space-y-4 p-2 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="h-9 w-9 rounded-full bg-surface-subtle dark:bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-surface-subtle dark:bg-white/10" />
                  <div className={`h-4 rounded bg-surface-subtle dark:bg-white/10 ${i === 2 ? 'w-4/5' : 'w-3/5'}`} />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-text-tertiary">
            <MessageCircle className="mb-2 h-8 w-8 text-text-tertiary" />
            <p className="text-xs">Chưa có tin nhắn nào trong phòng chat chung</p>
            <p className="mt-0.5 text-[11px] text-text-tertiary">Hãy là người đầu tiên mở lời chào nhé!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <CommunityChatMessageItem
              key={msg._id}
              msg={msg}
              currentUserId={user?.user_id}
              isAuthenticated={isAuthenticated}
              isPrivileged={isPrivileged}
              canPin={Boolean(canPin)}
              activeEmojiPicker={activeEmojiPicker}
              dismissedEmojiBarMsgId={dismissedEmojiBarMsgId}
              onSetActiveEmojiPicker={setActiveEmojiPicker}
              onSetDismissedEmojiBarMsgId={setDismissedEmojiBarMsgId}
              onReact={reactToMessage}
              onPin={pinMessage}
              onUnpin={unpinMessage}
              onDelete={deleteMessage}
              onSelectReactionsModal={setSelectedMsgIdForReactions}
            />
          ))
        )}

        {typingUsers.length > 0 && (
          <div className="text-[11px] italic text-text-tertiary flex items-center gap-1.5 pt-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
            <span>{typingUsers.join(', ')} đang soạn tin...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <CommunityChatInputBar
        isAuthenticated={isAuthenticated}
        eligibility={eligibility}
        isRoomLocked={isRoomLocked}
        isPrivileged={Boolean(isPrivileged)}
        replyTo={replyTo}
        onSetReplyTo={setReplyTo}
        onSendTyping={sendTyping}
        onSendMessage={sendMessage}
        onUploadImage={uploadChatImage}
      />

      <CommunityChatReactionsModal
        isOpen={Boolean(selectedMsgForReactions)}
        onClose={() => setSelectedMsgIdForReactions(null)}
        reactions={selectedMsgForReactions?.reactions || []}
        currentUserId={user?.user_id}
        onRemoveReaction={(emoji) => {
          if (selectedMsgForReactions) {
            reactToMessage(selectedMsgForReactions._id, emoji, 'remove')
          }
        }}
      />
    </div>
  )
}
