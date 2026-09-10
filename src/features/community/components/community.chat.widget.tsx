// Component giao diện hộp thoại chat cộng đồng mini dạng tab nổi bên phải màn hình
'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  MessageCircle,
  Pin,
  PinOff,
  Shield,
  Star,
  Trash2,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useCommunityChat } from '@/features/community/hooks/use.community.chat'
import { CommunityChatHeader } from '@/features/community/components/community.chat.header'
import { CommunityChatInputBar } from '@/features/community/components/community.chat.input.bar'

function formatRelativeTime(dateStr: string): string {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000))
  if (diff < 60) return 'vừa xong'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

interface CommunityChatWidgetProps {
  chatState: ReturnType<typeof useCommunityChat>
}

export function CommunityChatWidget({ chatState }: CommunityChatWidgetProps) {
  const {
    isOpen,
    setIsOpen,
    messages,
    room,
    eligibility,
    isLoading,
    onlineCount,
    typingUsers,
    replyTo,
    setReplyTo,
    errorBanner,
    refreshData,
    sendMessage,
    deleteMessage,
    pinMessage,
    unpinMessage,
    sendTyping,
    uploadChatImage,
  } = chatState

  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [showRoomInfo, setShowRoomInfo] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (!isOpen) return null

  const isRoomLocked = room ? !room.is_chat_enabled : false
  const isPrivileged = eligibility?.role === 'ADMIN' || eligibility?.role === 'MODERATOR'
  const canPin =
    eligibility?.role === 'ADMIN' ||
    (eligibility?.role === 'MODERATOR' && Boolean(eligibility?.member?.moderator_permissions?.can_pin_messages))

  const pinnedMessages = messages.filter((m) => m.is_pinned && !m.is_deleted)
  const activePinnedMsg = pinnedMessages[pinnedMessages.length - 1]

  return (
    <div className="fixed bottom-24 right-6 z-50 flex h-[580px] max-h-[calc(100vh-120px)] w-[380px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 dark:border-slate-800 dark:bg-slate-900">
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

      <div ref={scrollRef} className="flex-1 space-y-3.5 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
            <MessageCircle className="mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="text-xs">Chưa có tin nhắn nào trong phòng chat chung</p>
            <p className="mt-0.5 text-[11px] text-slate-400">Hãy là người đầu tiên mở lời chào nhé!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = user?.user_id === msg.sender_id
            const canDelete = isMe || isPrivileged

            return (
              <div key={msg._id} className="group flex items-start gap-2.5">
                <div className="relative shrink-0">
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-200 font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                    {msg.sender_avatar ? (
                      <Image
                        src={msg.sender_avatar}
                        alt={msg.sender_name}
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span>{msg.sender_name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 rounded-full border border-blue-200 bg-blue-50 px-1 py-0.2 text-[8px] font-bold text-blue-600 shadow-2xs dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    {msg.sender_badge === 'ADMIN'
                      ? 'ADMIN'
                      : msg.sender_badge === 'PRO'
                        ? 'PRO'
                        : `Lv.${msg.sender_level ?? 1}`}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                      @{msg.sender_name}
                    </span>
                    {msg.sender_role === 'ADMIN' && (
                      <span title="Quản trị viên">
                        <Shield className="h-3 w-3 text-amber-500 fill-amber-500" />
                      </span>
                    )}
                    {msg.sender_badge === 'PRO' && msg.sender_role !== 'ADMIN' && (
                      <span title="Thành viên PRO">
                        <Star className="h-3 w-3 text-emerald-500 fill-emerald-500" />
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {formatRelativeTime(msg.created_at)}
                    </span>

                    <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {canPin && !msg.is_deleted && (
                        <button
                          type="button"
                          title={msg.is_pinned ? 'Bỏ ghim tin nhắn' : 'Ghim tin nhắn'}
                          onClick={() => (msg.is_pinned ? unpinMessage(msg._id) : pinMessage(msg._id))}
                          className={`rounded p-1 transition-colors cursor-pointer ${
                            msg.is_pinned
                              ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                              : 'text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800'
                          }`}
                        >
                          {msg.is_pinned ? (
                            <PinOff className="h-3.5 w-3.5" />
                          ) : (
                            <Pin className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}

                      {canDelete && !msg.is_deleted && (
                        <button
                          type="button"
                          title="Xóa tin nhắn"
                          onClick={() => deleteMessage(msg._id)}
                          className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {msg.reply_to && !msg.is_deleted && (
                    <div className="mt-1 rounded-md border-l-2 border-slate-300 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        @{msg.reply_to.sender_name}:{' '}
                      </span>
                      <span>{msg.reply_to.content}</span>
                    </div>
                  )}

                  {msg.is_deleted ? (
                    <p className="mt-1 text-xs italic text-slate-400">
                      [Tin nhắn đã bị thu hồi]
                    </p>
                  ) : (
                    <div className="mt-0.5 text-xs text-slate-700 dark:text-slate-200 break-words leading-relaxed">
                      {msg.content}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {msg.attachments.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 hover:opacity-90"
                            >
                              <Image
                                src={url}
                                alt="attachment"
                                width={140}
                                height={100}
                                className="h-24 w-auto max-w-[180px] object-cover"
                                unoptimized
                              />
                            </a>
                          ))}
                        </div>
                      )}
                      {msg.is_pinned && !msg.is_deleted && (
                        <div className="mt-1 inline-flex items-center gap-1 rounded bg-amber-100/80 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
                          <Pin className="h-2.5 w-2.5 fill-amber-500 text-amber-600 dark:text-amber-400" />
                          <span>Đã ghim</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}

        {typingUsers.length > 0 && (
          <div className="text-[11px] italic text-slate-400 flex items-center gap-1.5 pt-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse"></span>
            <span>{typingUsers.join(', ')} đang soạn tin...</span>
          </div>
        )}
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
    </div>
  )
}
