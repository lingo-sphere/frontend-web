import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icon } from '@/components/icons/icon-map'
import { aiService, type AiChatMessage } from '@/services/ai.service'
import { useAuthStore } from '@/store/auth-store'

const SUGGESTED_PROMPTS = [
  { icon: 'bookOpen', label: 'Giải thích ngữ pháp', text: 'Hãy giải thích cho tôi cấu trúc câu điều kiện loại 3 kèm 3 ví dụ dễ hiểu.' },
  { icon: 'messageSquare', label: 'Luyện giao tiếp', text: 'Hãy đóng vai người phỏng vấn tuyển dụng bằng tiếng Anh và đặt câu hỏi đầu tiên cho tôi.' },
  { icon: 'helpCircle', label: 'Phân biệt từ vựng', text: 'Giải thích sự khác biệt giữa "Affect" và "Effect" khi nào nên dùng từ nào?' },
  { icon: 'pencil', label: 'Sửa lỗi câu', text: 'Câu này của tôi có đúng ngữ pháp không: "If I was you, I will buy this car"?' },
]

export function AiLearningRoute() {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là Gia sư AI LingoSphere (chạy trên mô hình Gemma 2b). Bạn cần tôi giải đáp thắc mắc ngữ pháp, luyện giao tiếp, hay sửa lỗi bài viết tiếng Anh nào hôm nay?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim() || isLoading) return

    const userMsg: AiChatMessage = { role: 'user', content: query }
    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput('')
    setIsLoading(true)

    try {
      const res = await aiService.chatWithAiTutor(query, messages)
      const aiReply = res?.response || 'Xin lỗi, tôi gặp trục trặc khi kết nối với máy chủ AI. Vui lòng thử lại sau.'
      setMessages((prev) => [...prev, { role: 'assistant', content: aiReply }])
    } catch (err) {
      console.error('AI chat error:', err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Hệ thống AI đang bận hoặc gặp sự cố kết nối. Vui lòng thử lại sau giây lát nhé.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <main className="mx-auto flex h-[calc(100vh-4rem)] max-w-5xl flex-col px-4 py-4 sm:px-6">

        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-accent text-white shadow-md">
              <Icon name="sparkles" size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold text-text-primary flex items-center gap-2">
                Gia Sư AI LingoSphere
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  Groq Cloud LPU
                </span>
              </h1>
              <p className="text-xs text-text-tertiary">
                Trợ lý học tiếng Anh thông minh 24/7
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setMessages([
                {
                  role: 'assistant',
                  content: 'Cuộc trò chuyện mới đã được bắt đầu! Bạn muốn hỏi gì nào?',
                },
              ])
            }
            className="text-xs gap-1.5 h-8 rounded-xl"
          >
            <Icon name="rotateCcw" size={13} />
            Làm mới hội thoại
          </Button>
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
                <span className="text-xs text-text-tertiary ml-2">AI đang phân tích câu trả lời...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            {SUGGESTED_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p.text)}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-surface p-2.5 text-left text-xs text-text-secondary hover:border-primary hover:text-primary transition-all hover:bg-surface-subtle group"
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
            placeholder="Hỏi bất kỳ câu hỏi ngữ pháp, từ vựng hoặc giao tiếp..."
            disabled={isLoading}
            className="flex-1 rounded-xl bg-surface border-border focus-visible:ring-primary h-11 text-sm"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-11 px-5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-md shrink-0"
          >
            <Icon name="send" size={16} className="mr-1.5" />
            Gửi
          </Button>
        </form>
      </main>
    </Layout>
  )
}
