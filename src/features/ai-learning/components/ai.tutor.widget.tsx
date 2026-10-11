// Component widget hộp thoại chat nổi hỗ trợ Markdown và phóng to với Gia sư AI LingoSphere.
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Bot, RotateCcw, X, Send, Award, Zap, AlertCircle, Maximize2, Minimize2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { aiService, type AiChatMessage, type UserAiQuotaSummary } from '@/features/ai-learning/services/ai.service'
import { useAiQuotaQuery } from '@/features/ai-learning/hooks/use.ai.query'
import { aiKeys } from '@/features/ai-learning/keys/ai.keys'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useMounted } from '@/hooks/use.mounted'

const SUGGESTED_PROMPTS = [
  { label: 'Giải thích ngữ pháp', text: 'Hãy giải thích cho tôi cấu trúc câu điều kiện loại 3 kèm 3 ví dụ dễ hiểu.' },
  { label: 'Luyện giao tiếp', text: 'Hãy đóng vai người phỏng vấn tuyển dụng bằng tiếng Anh và đặt câu hỏi đầu tiên cho tôi.' },
  { label: 'Phân biệt từ vựng', text: 'Giải thích sự khác biệt giữa "Affect" và "Effect" khi nào nên dùng từ nào?' },
  { label: 'Sửa lỗi câu', text: 'Câu này của tôi có đúng ngữ pháp không: "If I was you, I will buy this car"?' },
]

interface AiTutorWidgetProps {
  isOpen: boolean
  onClose: () => void
}

export function AiTutorWidget({ isOpen, onClose }: AiTutorWidgetProps) {
  const queryClient = useQueryClient()
  const isMounted = useMounted()
  const { user, isAuthenticated } = useAuthStore()
  const { data: quota } = useAiQuotaQuery(Boolean(user))

  const [isExpanded, setIsExpanded] = useState(false)
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
  const chatRemaining = quota ? (isPremiumUser ? 999999 : quota.chat.remaining) : (isAuthenticated ? 5 : 0)
  const isOutOfQuota = isMounted && isAuthenticated && !isPremiumUser && chatRemaining <= 0

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isOpen, messages, isLoading, isExpanded])

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim() || isLoading) return

    if (!isAuthenticated) {
      setErrorBanner('Vui lòng đăng nhập để trò chuyện và học tập cùng Gia sư AI.')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lingosphere:open-auth-modal'))
      }
      return
    }

    if (isOutOfQuota) {
      setErrorBanner('Bạn đã sử dụng hết 5 câu hỏi miễn phí trong ngày của Gia sư AI. Vui lòng quay lại vào ngày mai hoặc nâng cấp VIP để tiếp tục học tập không giới hạn!')
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

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Cuộc trò chuyện mới đã bắt đầu! Hãy gửi cho tôi câu hỏi về ngữ pháp, từ vựng hoặc bài thi tiếng Anh nhé.',
      },
    ])
    setErrorBanner(null)
  }

  const containerSizeClasses = isExpanded
    ? 'w-[780px] max-w-[calc(100vw-110px)] h-[84vh] max-h-[820px]'
    : 'w-[390px] max-w-[calc(100vw-32px)] sm:max-w-[calc(100vw-110px)] h-[580px] max-h-[calc(100vh-108px)]'

  return (
    <div
      className={`fixed bottom-[88px] right-4 sm:right-[88px] z-50 flex flex-col overflow-hidden rounded-[28px] border-2 border-border/80 dark:border-teal-400/50 bg-surface/98 dark:bg-[#131e1e]/98 text-text-primary shadow-2xl shadow-slate-900/15 dark:shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(85,175,165,0.25)] ring-1 ring-black/5 dark:ring-white/15 backdrop-blur-xl transition-all duration-300 ease-out origin-bottom-right ${containerSizeClasses} ${
        isOpen
          ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-between border-b border-border/80 bg-surface/90 px-4 py-3 dark:bg-[#101818]/90 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-emerald-400 text-white shadow-sm shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-primary">Gia Sư AI LingoSphere</span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                24/7
              </span>
            </div>
            <div className="text-[10px] text-text-tertiary">Trợ lý giải đáp tiếng Anh thông minh</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleReset}
            title="Bắt đầu lại cuộc trò chuyện"
            aria-label="Làm mới trò chuyện"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-subtle hover:text-text-primary transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Thu nhỏ hộp thoại' : 'Phóng to hộp thoại'}
            aria-label={isExpanded ? 'Thu nhỏ hộp thoại' : 'Phóng to hộp thoại'}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-subtle hover:text-text-primary transition-colors cursor-pointer"
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại Gia sư AI"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-subtle hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-3.5 py-2 border-b border-border/60 bg-surface-subtle/50 shrink-0 flex items-center justify-between gap-2">
        {!isMounted ? (
          <div className="h-5 w-36 rounded-md bg-surface-subtle animate-pulse" />
        ) : isPremiumUser ? (
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
            <Award className="h-3.5 w-3.5 text-amber-500" />
            <span>VIP Premium • Không giới hạn</span>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-text-secondary">
              <Zap className={`h-3 w-3 ${chatRemaining > 1 ? 'text-primary' : 'text-destructive'}`} />
              <span>Gói Miễn phí: Còn {Math.max(0, chatRemaining)}/5 câu hôm nay</span>
            </div>
            <Link href="/settings" onClick={onClose} className="text-[10px] font-bold text-amber-600 hover:underline">
              Nâng cấp VIP
            </Link>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3.5 sm:p-4 bg-surface/60 dark:bg-[#101818]/80 text-xs">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-xs mt-0.5">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed shadow-xs ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-none whitespace-pre-wrap'
                  : 'bg-surface border border-border text-text-primary rounded-bl-none'
              }`}
            >
              {msg.role === 'user' ? (
                msg.content
              ) : (
                <div className="prose prose-sm max-w-none text-[12px] leading-relaxed text-text-primary">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 leading-relaxed last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="font-bold text-text-primary dark:text-emerald-300">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      h1: ({ children }) => <h1 className="text-sm font-extrabold text-primary mt-2.5 mb-1">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-[13px] font-bold text-primary mt-2 mb-1">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-xs font-bold text-primary mt-2 mb-1">{children}</h3>,
                      ul: ({ children }) => <ul className="my-1.5 ml-4 list-disc space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="my-1.5 ml-4 list-decimal space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="leading-relaxed pl-0.5">{children}</li>,
                      blockquote: ({ children }) => (
                        <blockquote className="my-2 border-l-2 border-primary bg-surface-subtle/80 pl-2.5 py-1 rounded-r-lg text-text-secondary italic">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="rounded bg-surface-subtle px-1.5 py-0.5 font-mono text-[11px] text-primary border border-border/60">
                          {children}
                        </code>
                      ),
                      hr: () => <hr className="my-2 border-border/60" />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-primary font-bold text-[10px] border border-border mt-0.5">
                {isMounted ? (user?.full_name?.charAt(0)?.toUpperCase() || 'U') : 'U'}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 items-start">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-xs mt-0.5">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-bl-none bg-surface border border-border px-3 py-2 text-[11px] shadow-xs flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
              <span className="text-text-tertiary ml-1.5">Gia sư AI đang soạn câu trả lời...</span>
            </div>
          </div>
        )}

        {messages.length === 1 && !isOutOfQuota && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2">
            <div className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-0.5 sm:col-span-2">Gợi ý câu hỏi nhanh:</div>
            {SUGGESTED_PROMPTS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(p.text)}
                className="flex flex-col rounded-xl border border-border/80 bg-surface/90 p-2 text-left hover:border-primary hover:bg-surface-subtle transition-all cursor-pointer group"
              >
                <span className="font-semibold text-text-primary text-[11px] group-hover:text-primary">{p.label}</span>
                <span className="text-[10px] text-text-tertiary truncate">{p.text}</span>
              </button>
            ))}
          </div>
        )}

        {errorBanner && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 text-[11px] text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>{errorBanner}</span>
            </div>
            <Link href="/settings" onClick={onClose} className="shrink-0 font-bold text-amber-600 underline">
              VIP
            </Link>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="flex items-center gap-2 border-t border-border/80 bg-surface/95 p-3 shrink-0"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isOutOfQuota
              ? 'Hết 5 câu hỏi hôm nay. Nâng cấp VIP hoặc quay lại vào ngày mai...'
              : 'Hỏi Gia sư AI về từ vựng, ngữ pháp...'
          }
          disabled={isLoading || isOutOfQuota}
          className="flex-1 rounded-xl bg-surface border-border focus-visible:ring-primary h-9 text-xs disabled:opacity-60"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!input.trim() || isLoading || isOutOfQuota}
          className="h-9 px-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-xs shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  )
}
