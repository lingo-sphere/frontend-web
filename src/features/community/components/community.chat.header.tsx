// Component thanh tiêu đề và thông tin phòng chat cộng đồng
'use client'

import { FileText, RefreshCw, X, Pin, PinOff } from 'lucide-react'
import type { ChatRoom, ChatMessage } from '@/features/community/types/community.types'

export interface CommunityChatHeaderProps {
  room: ChatRoom | null
  onlineCount: number
  isLoading: boolean
  errorBanner: string | null
  activePinnedMsg?: ChatMessage
  canPin: boolean
  showRoomInfo: boolean
  onToggleRoomInfo: () => void
  onRefreshData: () => void
  onClose: () => void
  onUnpinMessage: (messageId: string) => void
}

export function CommunityChatHeader({
  room,
  onlineCount,
  isLoading,
  errorBanner,
  activePinnedMsg,
  canPin,
  showRoomInfo,
  onToggleRoomInfo,
  onRefreshData,
  onClose,
  onUnpinMessage,
}: CommunityChatHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-border/80 dark:border-white/10 bg-surface-subtle/80 dark:bg-[#162424]/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1.5 rounded-full bg-primary/10 dark:bg-primary/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary dark:text-teal-300 border border-primary/25 dark:border-teal-400/40 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Chat Cộng Đồng
          </span>
        </div>

        <div className="flex items-center gap-1 text-text-secondary dark:text-text-tertiary">
          <button
            type="button"
            title="Thông tin phòng"
            onClick={onToggleRoomInfo}
            className="rounded-full p-1.5 transition-colors hover:bg-surface-hover dark:hover:bg-white/10 hover:text-text-primary cursor-pointer"
          >
            <FileText className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Làm mới"
            onClick={onRefreshData}
            disabled={isLoading}
            className="rounded-full p-1.5 transition-colors hover:bg-surface-hover dark:hover:bg-white/10 hover:text-text-primary cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            title="Đóng"
            onClick={onClose}
            className="rounded-full p-1.5 transition-colors hover:bg-surface-hover dark:hover:bg-white/10 hover:text-text-primary cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {errorBanner && (
        <div className="bg-rose-500/10 px-4 py-1.5 text-center text-xs font-medium text-rose-600 dark:text-rose-400">
          {errorBanner}
        </div>
      )}

      {showRoomInfo && (
        <div className="border-b border-border/80 dark:border-white/10 bg-surface-subtle/90 dark:bg-[#162323] p-3 text-xs text-text-secondary">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-text-primary">{room?.title || 'Kênh thảo luận chung'}</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              {onlineCount} đang online
            </span>
          </div>
          {room && room.slow_mode_seconds > 0 && (
            <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
              ⚡ Đang bật Slow Mode: {room.slow_mode_seconds}s giữa mỗi tin nhắn.
            </p>
          )}
          {room && !room.is_chat_enabled && (
            <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
              🔒 Phòng chat hiện đang khóa tin nhắn từ thành viên thường.
            </p>
          )}
        </div>
      )}

      {activePinnedMsg && (
        <div className="flex items-center justify-between gap-2 border-b border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs text-amber-600 dark:text-amber-300 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Pin className="h-3.5 w-3.5 shrink-0 fill-amber-500 text-amber-600 dark:text-amber-400" />
            <div className="min-w-0 flex-1 truncate">
              <span className="font-bold mr-1">@{activePinnedMsg.sender_name}:</span>
              <span className="text-text-secondary truncate">{activePinnedMsg.content}</span>
            </div>
          </div>
          {canPin && (
            <button
              type="button"
              title="Bỏ ghim tin nhắn này"
              onClick={() => onUnpinMessage(activePinnedMsg._id)}
              className="shrink-0 p-1 text-amber-600 hover:text-rose-600 dark:text-amber-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              <PinOff className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </>
  )
}
