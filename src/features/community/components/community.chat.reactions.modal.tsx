// Component modal hiển thị chi tiết danh sách học viên đã thả biểu cảm theo từng emoji
'use client'

import { useState } from 'react'
import NextImage from 'next/image'
import { X } from 'lucide-react'
import type { MessageReaction, ReactionUser } from '@/features/community/types/community.types'

interface CommunityChatReactionsModalProps {
  isOpen: boolean
  onClose: () => void
  reactions: MessageReaction[]
  currentUserId?: string
  onRemoveReaction?: (emoji: string) => void
}

export function CommunityChatReactionsModal({
  isOpen,
  onClose,
  reactions,
  currentUserId,
  onRemoveReaction,
}: CommunityChatReactionsModalProps) {
  const [selectedTab, setSelectedTab] = useState<string>('ALL')

  if (!isOpen) return null

  const totalCount = reactions.reduce((sum, r) => sum + r.count, 0)

  const userMap = new Map<string, { user: ReactionUser; emojis: string[]; totalCount: number }>()
  for (const reaction of reactions) {
    for (const u of reaction.users || []) {
      const uCount = u.count ?? 1
      if (!userMap.has(u.user_id)) {
        userMap.set(u.user_id, { user: u, emojis: [reaction.emoji], totalCount: uCount })
      } else {
        const existing = userMap.get(u.user_id)!
        if (!existing.emojis.includes(reaction.emoji)) {
          existing.emojis.push(reaction.emoji)
        }
        existing.totalCount += uCount
      }
    }
  }
  const allUsersList = Array.from(userMap.values())

  const displayedList =
    selectedTab === 'ALL'
      ? allUsersList.map((item) => ({
          user: item.user,
          emojis: item.emojis,
          userCount: item.totalCount,
        }))
      : (() => {
          const currentReaction = reactions.find((r) => r.emoji === selectedTab)
          return (currentReaction?.users || []).map((u) => ({
            user: u,
            emojis: [selectedTab],
            userCount: u.count ?? 1,
          }))
        })()

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="relative flex h-[390px] w-[480px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-border dark:border-white/15 bg-surface dark:bg-[#141e1e] text-text-primary shadow-2xl animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-border dark:border-white/10 px-5 py-3.5">
          <h3 className="text-base font-bold text-text-primary">Biểu cảm</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-text-tertiary hover:bg-surface-hover hover:text-text-primary dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-[110px] shrink-0 overflow-y-auto border-r border-border dark:border-white/10 bg-surface-subtle/50 dark:bg-black/20 py-2">
            <button
              type="button"
              onClick={() => setSelectedTab('ALL')}
              className={`flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                selectedTab === 'ALL'
                  ? 'bg-surface dark:bg-[#1c2c2c] text-primary dark:text-teal-300 border-l-3 border-primary dark:border-teal-400 shadow-xs'
                  : 'text-text-secondary dark:text-slate-400 hover:bg-surface-hover dark:hover:bg-white/5 hover:text-text-primary dark:hover:text-white'
              }`}
            >
              <span>Tất cả</span>
              <span className="rounded-full bg-surface-subtle dark:bg-white/10 px-1.5 py-0.2 text-[10px] text-text-tertiary dark:text-slate-400">
                {totalCount}
              </span>
            </button>

            {reactions.map((r) => (
              <button
                key={r.emoji}
                type="button"
                onClick={() => setSelectedTab(r.emoji)}
                className={`flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                  selectedTab === r.emoji
                    ? 'bg-surface dark:bg-[#1c2c2c] text-primary dark:text-teal-300 border-l-3 border-primary dark:border-teal-400 shadow-xs'
                    : 'text-text-secondary dark:text-slate-400 hover:bg-surface-hover dark:hover:bg-white/5 hover:text-text-primary dark:hover:text-white'
                }`}
              >
                <span className="text-base">{r.emoji}</span>
                <span className="rounded-full bg-surface-subtle dark:bg-white/10 px-1.5 py-0.2 text-[10px] text-text-tertiary dark:text-slate-400">
                  {r.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {displayedList.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-text-tertiary">
                Chưa có dữ liệu người thả biểu cảm
              </div>
            ) : (
              <div className="space-y-3">
                {displayedList.map(({ user, emojis, userCount }) => {
                  const isMe = Boolean(currentUserId && user.user_id === currentUserId)
                  return (
                    <div key={user.user_id} className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border dark:border-white/15 bg-surface-subtle dark:bg-white/10 text-xs font-bold text-text-primary">
                          {user.user_avatar ? (
                            <NextImage
                              src={user.user_avatar}
                              alt={user.user_name || ''}
                              width={36}
                              height={36}
                              className="h-full w-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <span>{(user.user_name || '').charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span className="truncate text-xs font-semibold text-text-primary">
                            {user.user_name}
                          </span>
                          {isMe && (
                            <span className="shrink-0 rounded bg-primary/10 dark:bg-teal-400/15 px-1 py-0.2 text-[9px] font-medium text-primary dark:text-teal-300">
                              Bạn
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {emojis.map((emoji) => (
                          <div
                            key={emoji}
                            className="inline-flex items-center gap-0.5 rounded-full border border-border/70 dark:border-white/10 bg-surface-subtle/80 dark:bg-white/5 pl-1.5 pr-1 py-0.5"
                          >
                            <span className="text-xs">{emoji}</span>
                            {isMe && onRemoveReaction && (
                              <button
                                type="button"
                                title={`Gỡ toàn bộ biểu cảm ${emoji}`}
                                onClick={() => onRemoveReaction(emoji)}
                                className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-text-tertiary hover:bg-rose-500/20 hover:text-rose-500 transition-colors cursor-pointer"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        {userCount > 1 && (
                          <span className="text-[11px] font-semibold text-text-tertiary ml-0.5">
                            {userCount}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}