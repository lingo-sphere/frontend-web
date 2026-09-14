// Trang trò chuyện học tập cùng gia sư AI thông minh tích hợp TanStack Query.
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Icon } from '@/components/icon.map'
import { aiService, type AiChatMessage, type UserAiQuotaSummary } from '@/features/ai-learning/services/ai.service'
import { useAiQuotaQuery } from '@/features/ai-learning/hooks/use.ai.query'
import { aiKeys } from '@/features/ai-learning/keys/ai.keys'
import { useAuthStore } from '@/features/auth/store/auth.store'

const SUGGESTED_PROMPTS = [
  { icon: 'bookOpen', label: 'Giải thích ngữ pháp', text: 'Hãy giải thích cho tôi cấu trúc câu điều kiện loại 3 kèm 3 ví dụ dễ hiểu.' },
  { icon: 'messageSquare', label: 'Luyện giao tiếp', text: 'Hãy đóng vai người phỏng vấn tuyển dụng bằng tiếng Anh và đặt câu hỏi đầu tiên cho tôi.' },
  { icon: 'helpCircle', label: 'Phân biệt từ vựng', text: 'Giải thích sự khác biệt giữa "Affect" và "Effect" khi nào nên dùng từ nào?' },
  { icon: 'pencil', label: 'Sửa lỗi câu', text: 'Câu này của tôi có đúng ngữ pháp không: "If I was you, I will buy this car"?' },
]

export default function AiLearningAppPage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { data: quota } = useAiQuotaQuery()
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là Gia sư AI LingoSphere. Tôi chuyên hỗ trợ giải đáp ngữ pháp, tra cứu từ vựng, sửa lỗi câu và luyện thi TOEIC/IELTS bằng tiếng Anh. Bạn có câu hỏi nào hôm nay không?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorBanner, setErrorBanner] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const isPremiumUser = Boolean(user?.is_premium || quota?.is_premium)
  const chatRemaining = quota ? (isPremiumUser ? 999999 : quota.chat.remaining) : 5
  const isOutOfQuota = !isPremiumUser && chatRemaining <= 0

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim() || isLoading) return

    if (isOutOfQuota) {
      setErrorBanner('Bạn đã sử dụng hết 5 câu hỏi miễn phí của Gia sư AI. Vui lòng nâng cấp gói Premium để tiếp tục học tập không giới hạn!')
      return
    }

    const userMsg: AiChatMessage = { role: 'user', content: query }
    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput('')
    setIsLoading(true)
    setErrorBanner(null)

    try {
      const res = await aiService.chatWithAiTutor(query, messages)
      const aiReply = res?.response || 'Xin lỗi, tôi gặp trục trặc khi kết nối với máy chủ AI. Vui lòng thử lại sau.'
      setMessages((prev) => [...prev, { role: 'assistant', content: aiReply }])
      if (res?.quota) {
        queryClient.setQueryData(aiKeys.quota(), (prev: UserAiQuotaSummary | undefined) =>
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
            : prev
        )
      } else {
        queryClient.invalidateQueries({ queryKey: aiKeys.quota() })
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err || '')
      if (errMsg.includes('hết') || errMsg.includes('Premium') || errMsg.includes('hạn ngạch')) {
        setErrorBanner(errMsg)
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Hệ thống AI đang bận hoặc gặp sự cố kết nối. Vui lòng thử lại sau giây lát nhé.',
          },
        ])
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <main className="flex h-[calc(100vh-72px)] w-full flex-col px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between border-b border-border pb-5 gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-accent text-white shadow-md shrink-0">
              <Icon name="sparkles" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-tertiary">
                  AI TUTOR & CHAT
                </span>
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  Trực tuyến 24/7
                </span>
              </div>
              <h1 className="mt-0.5 text-[20px] font-bold text-text-primary">
                Gia Sư AI LingoSphere
              </h1>
              <p className="mt-0.5 text-[13px] text-text-secondary">
                Giải đáp ngữ pháp, tra cứu từ vựng và luyện tập tiếng Anh thông minh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {isPremiumUser ? (
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-bold shadow-xs">
                <Icon name="award" size={14} className="text-amber-500" />
                <span>VIP Premium • Không giới hạn câu hỏi</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold shadow-xs ${
                  chatRemaining > 1
                    ? 'bg-surface-subtle border-border text-text-secondary'
                    : 'bg-destructive/10 border-destructive/30 text-destructive'
                }`}>
                  <Icon name="zap" size={13} className={chatRemaining > 1 ? 'text-primary' : 'text-destructive'} />
                  <span>Gói Miễn phí: Còn {Math.max(0, chatRemaining)}/5 câu (1k context)</span>
                </div>
                <Link href="/settings">
                  <Button size="sm" variant="default" className="h-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs gap-1 shadow-xs cursor-pointer">
                    <Icon name="sparkles" size={13} />
                    Nâng cấp VIP
                  </Button>
                </Link>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMessages([
                  {
                    role: 'assistant',
                    content: 'Cuộc trò chuyện mới đã được bắt đầu! Hãy hỏi tôi về từ vựng, ngữ pháp hoặc đề thi tiếng Anh nào.',
                  },
                ])
                setErrorBanner(null)
              }}
              className="text-xs gap-1.5 h-8 rounded-xl cursor-pointer"
            >
              <Icon name="rotateCcw" size={13} />
              Làm mới
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm mt-0.5">
                  <Icon name="bot" size={16} />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-none shadow-sm'
                    : 'bg-surface border border-border text-text-primary rounded-bl-none shadow-sm whitespace-pre-wrap'
                }`}
              >
                {msg.content}
              </div>

              {msg.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-subtle text-primary font-bold text-xs border border-border mt-0.5">
                  {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 items-start"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm mt-0.5">
                <Icon name="bot" size={16} />
              </div>
              <div className="rounded-2xl rounded-bl-none bg-surface border border-border px-4 py-3 text-sm shadow-sm flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                <span className="text-xs text-text-tertiary ml-2">Gia sư AI đang soạn câu trả lời...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {errorBanner && (
          <div className="mb-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <Icon name="alertCircle" size={16} className="text-amber-500 shrink-0" />
              <span>{errorBanner}</span>
            </div>
            <Link href="/settings" className="shrink-0">
              <Button size="sm" className="h-7 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px]">
                Nâng cấp VIP ngay
              </Button>
            </Link>
          </div>
        )}

        {messages.length === 1 && !isOutOfQuota && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            {SUGGESTED_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p.text)}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-surface p-2.5 text-left text-xs text-text-secondary hover:border-primary hover:text-primary transition-all hover:bg-surface-subtle group cursor-pointer"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-surface-subtle group-hover:bg-primary/10 text-primary">
                  <Icon name={p.icon} size={14} />
                </div>
                <div className="truncate">
                  <div className="font-semibold text-text-primary">{p.label}</div>
                  <div className="text-[11px] text-text-tertiary truncate">{p.text}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2 border-t border-border pt-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isOutOfQuota
                ? 'Bạn đã hết 5 câu hỏi miễn phí. Nâng cấp VIP để tiếp tục hỏi không giới hạn...'
                : 'Hỏi Gia sư AI về từ vựng, ngữ pháp, đề thi hoặc giao tiếp tiếng Anh...'
            }
            disabled={isLoading || isOutOfQuota}
            className="flex-1 rounded-xl bg-surface border-border focus-visible:ring-primary h-11 text-sm disabled:opacity-60"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading || isOutOfQuota}
            className="h-11 px-5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-md shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <Icon name="send" size={16} className="mr-1.5" />
            Gửi
          </Button>
        </form>
      </main>
    </>
  )
}
