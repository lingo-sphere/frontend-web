// Component thanh nhập tin nhắn và trạng thái tương tác chat cộng đồng
'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Image as ImageIcon, Loader2, Send, X } from 'lucide-react'
import type { EligibilityResponse, ChatMessage } from '@/features/community/types/community.types'

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

    setIsUploading(true)
    try {
      const url = await onUploadImage(file)
      if (url) {
        setAttachedImage(url)
      }
    } catch {
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="border-t border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      {!isAuthenticated ? (
        <Link
          href="/login"
          className="flex w-full items-center justify-center rounded-full border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          Vui lòng đăng nhập để tham gia chat
        </Link>
      ) : eligibility?.status === 'BANNED' ? (
        <div className="rounded-full bg-rose-50 border border-rose-200 py-2 px-3 text-center text-xs font-medium text-rose-600 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
          ⛔ Bạn đã bị cấm tham gia phòng chat
        </div>
      ) : eligibility?.status === 'KICKED' ? (
        <div className="rounded-full bg-orange-50 border border-orange-200 py-2 px-3 text-center text-xs font-medium text-orange-600 dark:bg-orange-950/40 dark:border-orange-900 dark:text-orange-300">
          ⏱️ Bạn đang trong thời gian chờ sau khi bị kick
        </div>
      ) : eligibility?.muted_until && new Date(eligibility.muted_until) > new Date() ? (
        <div className="rounded-full bg-amber-50 border border-amber-200 py-2 px-3 text-center text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300">
          🔇 Bạn đang bị tắt tiếng trong phòng chat
        </div>
      ) : isRoomLocked && !isPrivileged ? (
        <div className="rounded-full bg-slate-100 py-2 text-center text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          🔒 Phòng chat đang ở chế độ chỉ đọc
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {replyTo && (
            <div className="flex items-center justify-between rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <span className="truncate">
                Trả lời <b>@{replyTo.sender_name}</b>: {replyTo.content}
              </span>
              <button
                type="button"
                onClick={() => onSetReplyTo(null)}
                className="text-slate-400 hover:text-slate-700 ml-2 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {attachedImage && (
            <div className="relative inline-block w-fit">
              <Image
                src={attachedImage}
                alt="preview"
                width={60}
                height={60}
                className="h-14 w-14 rounded-lg object-cover border border-slate-200"
                unoptimized
              />
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="absolute -top-1.5 -right-1.5 rounded-full bg-rose-500 p-0.5 text-white shadow-xs cursor-pointer"
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
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
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
              className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-500"
            />

            <button
              type="button"
              title="Gửi"
              onClick={handleSend}
              disabled={!inputContent.trim() && !attachedImage}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition-all hover:bg-slate-800 disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
