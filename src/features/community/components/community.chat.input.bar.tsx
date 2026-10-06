// Component thanh nhập tin nhắn và trạng thái tương tác chat cộng đồng
'use client'

import { useRef, useState } from 'react'
import { Image } from 'antd'
import Link from 'next/link'
import { Image as ImageIcon, Loader2, Send, X } from 'lucide-react'
import { toast } from '@/store/toast.store'
import type { EligibilityResponse, ChatMessage } from '@/features/community/types/community.types'
import { resolveMediaUrl } from '@/utils/media.utils'

export interface CommunityChatInputBarProps {
  isAuthenticated: boolean
  eligibility: EligibilityResponse | null
  isRoomLocked: boolean
  isPrivileged: boolean
  replyTo: ChatMessage | null
  onSetReplyTo: (msg: ChatMessage | null) => void
  onSendTyping: (isTyping: boolean) => void
  onSendMessage: (content: string, attachments: string[]) => void
  onUploadImage: (file: File) => Promise<string | null>
}

export function CommunityChatInputBar({
  isAuthenticated,
  eligibility,
  isRoomLocked,
  isPrivileged,
  replyTo,
  onSetReplyTo,
  onSendTyping,
  onSendMessage,
  onUploadImage,
}: CommunityChatInputBarProps) {
  const [inputContent, setInputContent] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [attachedImage, setAttachedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (!inputContent.trim() && !attachedImage) return

    const attachments = attachedImage ? [attachedImage] : []
    onSendMessage(inputContent, attachments)
    setInputContent('')
    setAttachedImage(null)
    onSendTyping(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chỉ chọn tệp hình ảnh')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 10MB')
      return
    }

    setIsUploading(true)
    try {
      const url = await onUploadImage(file)
      if (url) {
        setAttachedImage(url)
      } else {
        toast.error('Tải ảnh lên không thành công')
      }
    } catch {
      toast.error('Lỗi khi tải ảnh lên máy chủ')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="border-t border-border/80 dark:border-white/10 bg-surface-subtle/80 dark:bg-[#162323]/95 p-3 backdrop-blur-md">
      {!isAuthenticated ? (
        <Link
          href="/login"
          className="flex w-full items-center justify-center rounded-full border border-border dark:border-white/15 bg-surface dark:bg-[#1c2b2b] py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary shadow-xs hover:bg-surface-hover dark:hover:bg-white/10 transition-colors"
        >
          Vui lòng đăng nhập để tham gia chat
        </Link>
      ) : eligibility?.status === 'BANNED' ? (
        <div className="rounded-full bg-rose-500/10 border border-rose-500/20 py-2 px-3 text-center text-xs font-medium text-rose-600 dark:text-rose-400">
          ⛔ Bạn đã bị cấm tham gia phòng chat
        </div>
      ) : eligibility?.status === 'KICKED' ? (
        <div className="rounded-full bg-orange-500/10 border border-orange-500/20 py-2 px-3 text-center text-xs font-medium text-orange-600 dark:text-orange-400">
          ⏱️ Bạn đang trong thời gian chờ sau khi bị kick
        </div>
      ) : eligibility?.muted_until && new Date(eligibility.muted_until) > new Date() ? (
        <div className="rounded-full bg-amber-500/10 border border-amber-500/20 py-2 px-3 text-center text-xs font-medium text-amber-600 dark:text-amber-400">
          🔇 Bạn đang bị tắt tiếng trong phòng chat
        </div>
      ) : isRoomLocked && !isPrivileged ? (
        <div className="rounded-full bg-surface-subtle dark:bg-[#1a2727] border border-border dark:border-white/10 py-2 text-center text-xs font-medium text-text-tertiary">
          🔒 Phòng chat đang ở chế độ chỉ đọc
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {replyTo && (
            <div className="flex items-center justify-between rounded-lg bg-surface-subtle dark:bg-[#1a2727] border border-border dark:border-white/10 px-2.5 py-1 text-[11px] text-text-secondary">
              <span className="truncate">
                Trả lời <b>@{replyTo.sender_name}</b>: {replyTo.content}
              </span>
              <button
                type="button"
                onClick={() => onSetReplyTo(null)}
                className="text-text-tertiary hover:text-text-primary ml-2 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {attachedImage && (
            <div className="relative inline-block w-fit">
              <div className="overflow-hidden rounded-lg border border-border dark:border-white/20 shadow-2xs bg-surface-subtle dark:bg-black/30">
                <Image
                  src={resolveMediaUrl(attachedImage)}
                  alt="preview"
                  style={{
                    maxHeight: 70,
                    maxWidth: 70,
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                  className="cursor-pointer"
                />
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="absolute -top-1.5 -right-1.5 rounded-full bg-rose-500 p-0.5 text-white shadow-xs cursor-pointer z-10"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              title="Gửi ảnh"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full p-2 text-text-tertiary transition-colors hover:bg-surface-hover dark:hover:bg-white/10 hover:text-text-primary cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-text-tertiary" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
            </button>

            <input
              type="text"
              value={inputContent}
              onChange={(e) => {
                setInputContent(e.target.value)
                onSendTyping(e.target.value.length > 0)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              className="flex-1 rounded-full border border-border/80 dark:border-white/20 bg-surface dark:bg-[#1a2828] px-3.5 py-2 text-xs text-text-primary outline-none transition-all placeholder:text-text-tertiary focus:border-primary dark:focus:border-teal-400 focus:ring-1 focus:ring-primary/30 dark:focus:ring-teal-400/30 shadow-inner"
            />

            <button
              type="button"
              title="Gửi"
              onClick={handleSend}
              disabled={!inputContent.trim() && !attachedImage}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary hover:bg-primary-hover dark:bg-teal-500 dark:hover:bg-teal-400 text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer shadow-md shadow-primary/20 dark:shadow-teal-500/20"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
