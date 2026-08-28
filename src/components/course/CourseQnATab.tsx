'use client'

import { useState } from 'react'
import { MessageSquare, Search, ThumbsUp, Send, CheckCircle2, Bot, Sparkles, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { QnAItem } from '@/types/course'

interface CourseQnATabProps {
  qnaList: QnAItem[]
  currentLessonTitle?: string
}

export function CourseQnATab({ qnaList: initialQnA, currentLessonTitle }: CourseQnATabProps) {
  const [qna, setQna] = useState<QnAItem[]>(initialQnA)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAskForm, setShowAskForm] = useState(false)
  const [questionTitle, setQuestionTitle] = useState('')
  const [questionBody, setQuestionBody] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'current' | 'answered'>('all')

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionTitle.trim()) return

    const newQuestion: QnAItem = {
      id: `qna-${Date.now()}`,
      lessonTitle: currentLessonTitle || 'Bài học hiện tại',
      author: 'Bạn (Học viên)',
      title: questionTitle,
      body: questionBody,
      createdAt: 'Vừa xong',
      upvotes: 0,
      answersCount: 1,
      isAnswered: true,
      answers: [
        {
          id: `ans-${Date.now()}`,
          author: 'LingoSphere AI Tutor',
          authorRole: 'Gia sư AI',
          body: `Chào bạn! Cảm ơn câu hỏi về chủ đề "${questionTitle}". Dựa trên ngữ cảnh bài học hiện tại, bạn có thể áp dụng tư duy bóc tách cấu trúc để nhận diện nhanh trong bài thi. Trợ lý AI và giảng viên đã ghi nhận câu hỏi của bạn!`,
          createdAt: 'Vừa xong',
          upvotes: 0,
        },
      ],
    }

    setQna([newQuestion, ...qna])
    setQuestionTitle('')
    setQuestionBody('')
    setShowAskForm(false)
  }

  const handleUpvote = (id: string) => {
    setQna((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item
      )
    )
  }

  const filteredQnA = qna.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.body.toLowerCase().includes(searchQuery.toLowerCase())
    if (selectedFilter === 'answered') return matchesSearch && item.isAnswered
    return matchesSearch
  })

  return (
    <div className="space-y-6 pt-2">
      {/* Search & Actions Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi trong khóa học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <Button
          onClick={() => setShowAskForm(!showAskForm)}
          className="bg-primary text-white hover:bg-primary-hover shrink-0 gap-2 rounded-xl px-5"
        >
          <MessageSquare size={16} />
          {showAskForm ? 'Đóng form' : 'Đặt câu hỏi mới'}
        </Button>
      </div>

      {/* Ask Question Form */}
      {showAskForm && (
        <form onSubmit={handleAskQuestion} className="rounded-2xl border border-primary/20 bg-primary-soft/30 p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <Sparkles size={15} />
            Hỏi đáp cùng cộng đồng & Gia sư AI LingoSphere 24/7
          </div>
          <div>
            <label className="block text-xs font-bold text-text-primary mb-1.5">
              Tiêu đề câu hỏi hoặc thắc mắc:
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Cách phân biệt Part 5 khi gặp 2 tính từ đứng cạnh nhau?"
              value={questionTitle}
              onChange={(e) => setQuestionTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-primary mb-1.5">
              Chi tiết câu hỏi:
            </label>
            <textarea
              rows={3}
              placeholder="Mô tả cụ thể thắc mắc của bạn để giảng viên và AI hỗ trợ nhanh nhất..."
              value={questionBody}
              onChange={(e) => setQuestionBody(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAskForm(false)}
              className="text-xs text-text-secondary"
            >
              Hủy
            </Button>
            <Button type="submit" className="bg-primary text-white hover:bg-primary-hover text-xs gap-1.5 rounded-xl px-5">
              <Send size={13} />
              Gửi câu hỏi
            </Button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 text-xs font-semibold">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            selectedFilter === 'all'
              ? 'bg-surface-hover text-primary font-bold'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Tất cả ({qna.length})
        </button>
        <button
          onClick={() => setSelectedFilter('answered')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            selectedFilter === 'answered'
              ? 'bg-surface-hover text-primary font-bold'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Đã có câu trả lời ({qna.filter((q) => q.isAnswered).length})
        </button>
      </div>

      {/* Q&A List */}
      <div className="space-y-4">
        {filteredQnA.length === 0 ? (
          <div className="py-12 text-center text-sm text-text-tertiary">
            Chưa có câu hỏi nào khớp với tìm kiếm. Hãy đặt câu hỏi đầu tiên!
          </div>
        ) : (
          filteredQnA.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border bg-surface p-5 transition-all hover:border-border/80 hover:shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary-soft flex items-center justify-center text-primary font-bold text-xs">
                    {item.author.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-text-primary">{item.title}</div>
                    <div className="text-xs text-text-tertiary flex items-center gap-2 mt-0.5">
                      <span>{item.author}</span>
                      <span>•</span>
                      <span>{item.createdAt}</span>
                      {item.lessonTitle && (
                        <>
                          <span>•</span>
                          <span className="text-primary truncate max-w-[200px]">{item.lessonTitle}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleUpvote(item.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors shrink-0"
                >
                  <ThumbsUp size={13} />
                  <span>{item.upvotes}</span>
                </button>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed pl-12">
                {item.body}
              </p>

              {/* Answers */}
              {item.answers && item.answers.length > 0 && (
                <div className="pl-12 pt-2 space-y-2.5">
                  {item.answers.map((ans) => (
                    <div
                      key={ans.id}
                      className="rounded-xl border border-primary/20 bg-primary-soft/30 p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center gap-2">
                        {ans.authorRole === 'Gia sư AI' ? (
                          <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center">
                            <Bot size={13} />
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-surface text-primary flex items-center justify-center border border-border">
                            <User size={13} />
                          </div>
                        )}
                        <span className="text-xs font-bold text-text-primary">{ans.author}</span>
                        {ans.authorRole && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            <CheckCircle2 size={10} />
                            {ans.authorRole}
                          </span>
                        )}
                        <span className="text-[11px] text-text-tertiary ml-auto">{ans.createdAt}</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{ans.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
