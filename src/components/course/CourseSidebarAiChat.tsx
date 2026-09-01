'use client'

/**
 * @file CourseSidebarAiChat.tsx
 * @description Component giao diện React CourseSidebarAiChat cho học viên
 */

import { useState } from 'react'
import { Bot, Send } from 'lucide-react'

interface CourseSidebarAiChatProps {
  currentLessonTitle: string
}

export function CourseSidebarAiChat({ currentLessonTitle }: CourseSidebarAiChatProps) {
  const [messages, setMessages] = useState<
    Array<{ sender: 'ai' | 'user'; text: string; time: string }>
  >([
    {
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ lý AI LingoSphere. Bạn có thắc mắc gì về bài học không? Hãy gửi câu hỏi cho tôi nhé!',
      time: 'Vừa xong',
    },
  ])
  const [inputMessage, setInputMessage] = useState('')

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userText = inputMessage
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: 'Vừa xong' },
    ])
    setInputMessage('')

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Dựa trên bài học "${currentLessonTitle}", điểm cốt lõi là bạn cần xác định từ khóa ngữ cảnh trước, sau đó áp dụng quy tắc đơn giản hóa. Bạn có muốn làm 1 câu hỏi bài tập trắc nghiệm mini để kiểm tra kiến thức này không?`,
          time: 'Vừa xong',
        },
      ])
    }, 700)
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-4 space-y-4 overflow-hidden">
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
              {msg.sender === 'user' ? 'U' : <Bot size={14} />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-primary text-white rounded-tr-none font-medium'
                  : 'bg-surface-subtle border border-border text-text-primary rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="relative pt-2 border-t border-border">
        <input
          type="text"
          placeholder="Hỏi AI về bài học hiện tại..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface pl-3.5 pr-10 py-2.5 text-xs text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
        />
        <button
          type="submit"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 mt-1 text-primary hover:text-primary-hover p-1"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  )
}
