// Khung trò chuyện với Gia sư AI trong thanh bên bài giảng khóa học.
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Bot, Send, Sparkles, AlertCircle } from 'lucide-react'
import { aiService, type AiChatMessage, type UserAiQuotaSummary } from '@/features/ai-learning/services/ai.service'
import { useAiQuotaQuery } from '@/features/ai-learning/hooks/use.ai.query'
import { useAuthStore } from '@/features/auth/store/auth.store'

interface CourseSidebarAiChatProps {
  currentLessonTitle: string
}

export function CourseSidebarAiChat({ currentLessonTitle }: CourseSidebarAiChatProps) {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<
    Array<{ sender: 'ai' | 'user'; text: string; time: string }>
  >([
    {
      sender: 'ai',
      text: `Xin chào! Tôi là Gia sư AI LingoSphere. Bạn có thắc mắc gì về bài học "${currentLessonTitle}" hoặc ngữ pháp tiếng Anh không? Hãy hỏi tôi nhé!`,
      time: 'Vừa xong',
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [quota, setQuota] = useState<UserAiQuotaSummary | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const isPremiumUser = Boolean(user?.is_premium || quota?.is_premium)
  const chatRemaining = quota ? (isPremiumUser ? 999999 : quota.chat.remaining) : 5
  const isOutOfQuota = !isPremiumUser && chatRemaining <= 0

  const { data: serverQuota, refetch: refetchQuota } = useAiQuotaQuery(Boolean(user))

  useEffect(() => {
    if (serverQuota) setQuota(serverQuota)
  }, [serverQuota])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    if (isOutOfQuota) {
      setErrorMsg('Bạn đã dùng hết 5 câu hỏi miễn phí. Hãy nâng cấp VIP để hỏi không giới hạn!')
      return
    }

    const userText = inputMessage.trim()
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: 'Vừa xong' },
    ])
    setInputMessage('')
    setIsLoading(true)
    setErrorMsg(null)

    const historyPayload: AiChatMessage[] = messages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }))

    const contextualPrompt = `[Ngữ cảnh bài học: "${currentLessonTitle}"] ${userText}`

    try {
      const res = await aiService.chatWithAiTutor(contextualPrompt, historyPayload)
      const aiReply = res?.response || 'Xin lỗi, tôi gặp trục trặc khi kết nối với máy chủ AI. Vui lòng thử lại sau.'
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: aiReply, time: 'Vừa xong' },
      ])
      if (res?.quota) {
        setQuota((prev) =>
          prev
            ? {
                ...prev,
                is_premium: res.quota!.is_premium,
                chat: {
                  ...prev.chat,
                  remaining: res.quota!.remaining,
                  used: (prev.chat.used || 0) + 1,
                },
              }
            : null
        )
      } else {
        refetchQuota()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err || '')
      if (msg.includes('hết') || msg.includes('Premium') || msg.includes('hạn ngạch')) {
        setErrorMsg(msg)
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: 'Gia sư AI đang bận hoặc gặp sự cố kết nối. Vui lòng thử lại sau ít phút.',
            time: 'Vừa xong',
          },
        ])
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-3.5 space-y-3 overflow-hidden bg-background">
      <div className="flex items-center justify-between pb-2 border-b border-border/80 text-[11px]">
        <div className="flex items-center gap-1.5 text-text-secondary font-medium">
          <Sparkles size={13} className="text-primary" />
          <span>Gia sư Tiếng Anh AI</span>
        </div>
        {isPremiumUser ? (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/20 text-[10px]">
            👑 VIP Không giới hạn
          </span>
        ) : (
          <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] ${
            chatRemaining > 1
              ? 'bg-primary/10 text-primary border-primary/20'
              : 'bg-destructive/10 text-destructive border-destructive/20'
          }`}>
            Miễn phí: {Math.max(0, chatRemaining)}/5 câu
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-surface border border-border text-text-primary font-bold'
                  : 'bg-primary text-white shadow-sm'
              }`}
            >
              {msg.sender === 'user' ? (user?.full_name?.charAt(0) || 'U') : <Bot size={14} />}
            </div>
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-primary text-white rounded-tr-none font-medium'
                  : 'bg-surface border border-border text-text-primary rounded-tl-none shadow-2xs'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs shrink-0 bg-primary text-white shadow-sm">
              <Bot size={14} />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-surface border border-border p-3 text-xs text-text-tertiary flex items-center gap-1.5 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
              <span className="ml-1">Đang soạn câu trả lời...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 text-[11px] text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-1.5 truncate">
            <AlertCircle size={14} className="text-amber-500 shrink-0" />
            <span className="truncate">{errorMsg}</span>
          </div>
          <Link href="/settings" className="shrink-0 font-bold text-amber-600 underline">
            Nâng cấp VIP
          </Link>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="relative pt-2 border-t border-border">
        <input
          type="text"
          placeholder={
            isOutOfQuota
              ? 'Đã hết 5 câu miễn phí. Hãy nâng cấp VIP...'
              : 'Hỏi Gia sư AI về bài học hoặc ngữ pháp...'
          }
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isLoading || isOutOfQuota}
          className="w-full rounded-xl border border-border bg-surface pl-3 pr-9 py-2.5 text-xs text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-xs disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading || isOutOfQuota}
          className="absolute right-2 top-1/2 -translate-y-1/2 mt-1 text-primary hover:text-primary/80 p-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  )
}
