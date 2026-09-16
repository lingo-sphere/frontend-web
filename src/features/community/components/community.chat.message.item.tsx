// Component hiển thị chi tiết một tin nhắn trong widget chat cộng đồng.
'use client'

import NextImage from 'next/image'
import { Image } from 'antd'
import {
  Pin,
  PinOff,
  Shield,
  Smile,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import type { ChatMessage } from '@/features/community/types/community.types'
import { formatRelativeTime } from '@/lib/format'

const QUICK_EMOJIS = ['👍', '❤️', '😆', '😲', '😭', '😡']

interface CommunityChatMessageItemProps {
  msg: ChatMessage
  currentUserId?: string
  isAuthenticated: boolean
  isPrivileged: boolean
  canPin: boolean
  activeEmojiPicker: string | null
  dismissedEmojiBarMsgId: string | null
  onSetActiveEmojiPicker: (msgId: string | null) => void
  onSetDismissedEmojiBarMsgId: (msgId: string | null) => void
  onReact: (messageId: string, emoji: string, action: 'add' | 'remove') => void
  onPin: (messageId: string) => void
  onUnpin: (messageId: string) => void
  onDelete: (messageId: string) => void
  onSelectReactionsModal: (messageId: string) => void
}

export function CommunityChatMessageItem({
  msg,
  currentUserId,
  isAuthenticated,
  isPrivileged,
  canPin,
  activeEmojiPicker,
  dismissedEmojiBarMsgId,
  onSetActiveEmojiPicker,
  onSetDismissedEmojiBarMsgId,
  onReact,
  onPin,
  onUnpin,
  onDelete,
  onSelectReactionsModal,
}: CommunityChatMessageItemProps) {
  const isMe = currentUserId === msg.sender_id
  const canDelete = isMe || isPrivileged

  return (
    <div
      onMouseLeave={() => {
        if (dismissedEmojiBarMsgId === msg._id) {
          onSetDismissedEmojiBarMsgId(null)
        }
      }}
      className="group relative flex items-start gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04] animate-in fade-in slide-in-from-bottom-1 duration-200"
    >
      <div className="relative shrink-0">
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-surface-subtle font-bold text-text-primary border border-border dark:border-white/20">
          {msg.sender_avatar ? (
            <NextImage
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
          <span className="truncate text-xs font-bold text-text-primary">
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
          <span className="text-[10px] text-text-tertiary">
            {formatRelativeTime(msg.created_at)}
          </span>

          <div className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            {!msg.is_deleted && isAuthenticated && (
              <div
                className="relative group/emoji"
                onMouseLeave={() => {
                  if (dismissedEmojiBarMsgId === msg._id) {
                    onSetDismissedEmojiBarMsgId(null)
                  }
                }}
              >
                <button
                  type="button"
                  title="Thả cảm xúc"
                  onClick={() =>
                    onSetActiveEmojiPicker(activeEmojiPicker === msg._id ? null : msg._id)
                  }
                  className="rounded p-1 text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors cursor-pointer"
                >
                  <Smile className="h-3.5 w-3.5" />
                </button>

                {dismissedEmojiBarMsgId !== msg._id && (
                  <div
                    className={`absolute right-0 bottom-full mb-1 z-30 items-center gap-1 rounded-full border border-border/90 dark:border-white/20 bg-surface/98 dark:bg-[#1a2626]/98 px-2 py-0.5 shadow-lg shadow-black/10 dark:shadow-black/40 backdrop-blur-md transition-all duration-150 animate-in fade-in zoom-in-95 ${
                      activeEmojiPicker === msg._id ? 'flex' : 'hidden group-hover/emoji:flex'
                    }`}
                  >
                    {QUICK_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onReact(msg._id, emoji, 'add')
                          onSetActiveEmojiPicker(null)
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-sm hover:scale-135 hover:bg-surface-hover dark:hover:bg-white/10 transition-transform cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                    <div className="mx-0.5 h-3 w-[1px] bg-border dark:bg-white/20" />
                    <button
                      type="button"
                      title="Đóng"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSetActiveEmojiPicker(null)
                        onSetDismissedEmojiBarMsgId(msg._id)
                      }}
                      className="flex h-5 w-5 items-center justify-center rounded-full text-text-tertiary hover:bg-surface-hover hover:text-text-primary dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {canPin && !msg.is_deleted && (
              <button
                type="button"
                title={msg.is_pinned ? 'Bỏ ghim tin nhắn' : 'Ghim tin nhắn'}
                onClick={() => (msg.is_pinned ? onUnpin(msg._id) : onPin(msg._id))}
                className={`rounded p-1 transition-colors cursor-pointer ${
                  msg.is_pinned
                    ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                    : 'text-text-tertiary hover:bg-surface-hover hover:text-primary'
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
                onClick={() => onDelete(msg._id)}
                className="rounded p-1 text-text-tertiary hover:bg-rose-500/10 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {msg.reply_to && !msg.is_deleted && (
          <div className="mt-1 rounded-lg border-l-2 border-primary bg-surface-subtle/80 dark:bg-black/25 px-2.5 py-1 text-[11px] text-text-secondary border-t border-r border-b border-border/40 dark:border-white/5">
            <span className="font-semibold text-text-primary">
              @{msg.reply_to.sender_name}:{' '}
            </span>
            <span>{msg.reply_to.content}</span>
          </div>
        )}

        {msg.is_deleted ? (
          <p className="mt-1 text-xs italic text-text-tertiary">
            [Tin nhắn đã bị thu hồi]
          </p>
        ) : (
          <div className="mt-0.5 text-xs text-text-primary break-words leading-relaxed">
            {msg.content}
            {msg.attachments && msg.attachments.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <Image.PreviewGroup>
                  {msg.attachments.map((url, i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-xl border border-border dark:border-white/15 shadow-2xs inline-block bg-surface-subtle dark:bg-black/40"
                    >
                      <Image
                        src={url}
                        alt="attachment"
                        style={{
                          maxHeight: 135,
                          maxWidth: 150,
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                          display: 'block',
                        }}
                        className="cursor-pointer hover:opacity-95 transition-opacity"
                      />
                    </div>
                  ))}
                </Image.PreviewGroup>
              </div>
            )}

            {(() => {
              const validReactions = (msg.reactions || []).filter((r) => r.count > 0)
              const totalReactionCount = validReactions.reduce((sum, r) => sum + r.count, 0)
              if (totalReactionCount === 0) return null

              const topReactions = [...validReactions].sort((a, b) => b.count - a.count).slice(0, 3)
              const userReactions = validReactions.filter((r) =>
                currentUserId ? r.user_ids?.includes(currentUserId) : false
              )

              return (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    title="Xem danh sách người thả biểu cảm"
                    onClick={() => onSelectReactionsModal(msg._id)}
                    className="inline-flex items-center gap-1 rounded-full border border-border/80 dark:border-white/15 bg-surface dark:bg-[#1a2626] px-2 py-0.5 shadow-2xs hover:bg-surface-hover dark:hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center -space-x-1 text-xs">
                      {topReactions.map((r) => (
                        <span key={r.emoji} className="inline-block hover:scale-125 transition-transform">
                          {r.emoji}
                        </span>
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-text-secondary dark:text-text-primary ml-0.5">
                      {totalReactionCount}
                    </span>
                  </button>

                  {userReactions.map((ur) => (
                    <button
                      key={ur.emoji}
                      type="button"
                      title={`Thả thêm ${ur.emoji}`}
                      onClick={() => onReact(msg._id, ur.emoji, 'add')}
                      className="flex h-5 w-5 items-center justify-center rounded-full border border-rose-200 dark:border-rose-400/40 bg-rose-50/80 dark:bg-rose-950/40 text-xs shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                    >
                      {ur.emoji}
                    </button>
                  ))}
                </div>
              )
            })()}

            {msg.is_pinned && (
              <div className="mt-1 inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-300 border border-amber-500/20">
                <Pin className="h-2.5 w-2.5 fill-amber-500 text-amber-600 dark:text-amber-400" />
                <span>Đã ghim</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
