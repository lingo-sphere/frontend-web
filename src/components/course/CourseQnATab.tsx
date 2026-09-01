'use client'

/**
 * @file CourseQnATab.tsx
 * @description Component giao diện Hỏi & Đáp (Q&A) liên kết trực tiếp cơ sở dữ liệu
 */

import { useState, useEffect } from 'react'
import {
  MessageSquare,
  Search,
  ThumbsUp,
  Send,
  CheckCircle2,
  Bot,
  Sparkles,
  User,
  CornerDownRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { QnAItem } from '@/types/course'

interface CourseQnATabProps {
  qnaList: QnAItem[]
  currentLessonTitle?: string
  onCreateQuestion?: (title: string, body: string) => Promise<void> | void
  onAddAnswer?: (qnaId: string, answerText: string) => Promise<void> | void
  onUpvote?: (qnaId: string) => Promise<void> | void
}

export function CourseQnATab({
  qnaList,
  currentLessonTitle,
  onCreateQuestion,
  onAddAnswer,
  onUpvote,
}: CourseQnATabProps) {
  const [qna, setQna] = useState<QnAItem[]>(qnaList)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAskForm, setShowAskForm] = useState(false)
  const [questionTitle, setQuestionTitle] = useState('')
  const [questionBody, setQuestionBody] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'answered'>('all')
  const [replyingQnaId, setReplyingQnaId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setQna(qnaList)
  }, [qnaList])

  const handleAskQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionTitle.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      if (onCreateQuestion) {
        await onCreateQuestion(questionTitle.trim(), questionBody.trim())
      } else {
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
              body: `Chào bạn! Cảm ơn câu hỏi về "${questionTitle}". Thắc mắc của bạn đã được ghi nhận vào hệ thống!`,
              createdAt: 'Vừa xong',
              upvotes: 0,
            },
          ],
        }
        setQna([newQuestion, ...qna])
      }
      setQuestionTitle('')
      setQuestionBody('')
      setShowAskForm(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendAnswer = async (qnaId: string) => {
    if (!replyText.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      if (onAddAnswer) {
        await onAddAnswer(qnaId, replyText.trim())
      }
      setReplyText('')
      setReplyingQnaId(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpvoteClick = async (id: string) => {
    if (onUpvote) {
      await onUpvote(id)
    }
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
    <div className="space-y-6 pt-2 animate-in fade-in duration-150">
      {/* Search & Actions Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi trong khóa học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
          />
        </div>
        <Button
          onClick={() => setShowAskForm(!showAskForm)}
          className="bg-primary text-white hover:bg-primary-hover shrink-0 gap-2 rounded-xl px-5 cursor-pointer font-bold"
        >
          <MessageSquare size={16} />
          {showAskForm ? 'Đóng form' : 'Đặt câu hỏi mới'}
        </Button>
      </div>

      {/* Ask Question Form */}
      {showAskForm && (
        <form onSubmit={handleAskQuestionSubmit} className="rounded-2xl border border-primary/20 bg-primary-soft/30 p-5 space-y-4 shadow-sm animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <Sparkles size={14} />
            <span>Đặt câu hỏi cho Giảng viên & Cộng đồng học viên (Lưu vào DB)</span>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Tiêu đề câu hỏi ngắn gọn, rõ ràng..."
              value={questionTitle}
              onChange={(e) => setQuestionTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary focus:border-primary focus:outline-none"
              required
            />
            <textarea
              rows={3}
              placeholder="Mô tả chi tiết thắc mắc, bối cảnh bài học, câu hỏi ngữ pháp hoặc từ vựng..."
              value={questionBody}
              onChange={(e) => setQuestionBody(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-text-tertiary">
              Bài học liên quan: <strong className="text-text-secondary">{currentLessonTitle || 'Tổng quan'}</strong>
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAskForm(false)}
                className="text-xs text-text-secondary cursor-pointer"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !questionTitle.trim()}
                className="bg-primary text-white hover:bg-primary-hover text-xs rounded-xl px-5 cursor-pointer font-bold"
              >
                {isSubmitting ? 'Đang gửi...' : 'Đăng câu hỏi'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Questions list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-text-primary border-b border-border pb-2">
          <span>Tất cả câu hỏi ({filteredQnA.length})</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedFilter('answered')}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                selectedFilter === 'answered'
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
            >
              Đã có trả lời
            </button>
          </div>
        </div>

        {filteredQnA.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-border p-6 bg-surface-subtle/30 space-y-2">
            <MessageSquare size={24} className="text-text-tertiary" />
            <div className="text-xs font-bold text-text-primary">Chưa có câu hỏi nào</div>
            <p className="text-[11px] text-text-secondary max-w-xs">
              Hãy là người đầu tiên đặt câu hỏi cho bài học này để nhận giải đáp từ giáo viên và cộng đồng!
            </p>
          </div>
        ) : (
          filteredQnA.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-xs"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {item.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary leading-snug">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-text-tertiary mt-0.5">
                      <span className="font-semibold text-text-secondary">{item.author}</span>
                      <span>•</span>
                      <span>{item.lessonTitle}</span>
                      <span>•</span>
                      <span>{item.createdAt}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleUpvoteClick(item.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-surface-subtle/50 hover:border-primary/50 hover:text-primary transition-colors text-xs font-semibold text-text-secondary cursor-pointer shrink-0"
                >
                  <ThumbsUp size={13} />
                  <span>{item.upvotes}</span>
                </button>
              </div>

              {item.body && (
                <p className="text-xs text-text-secondary leading-relaxed pl-12">
                  {item.body}
                </p>
              )}

              {/* Answers section */}
              {item.answers && item.answers.length > 0 && (
                <div className="space-y-3 pl-6 sm:pl-12 pt-2 border-t border-border/60">
                  {item.answers.map((ans) => (
                    <div
                      key={ans.id}
                      className="p-3.5 rounded-xl bg-surface-subtle/50 border border-border/60 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          {ans.authorRole === 'Gia sư AI' ? (
                            <span className="inline-flex items-center gap-1 font-bold text-primary bg-primary-soft/80 px-2 py-0.5 rounded-md text-[10px]">
                              <Bot size={11} /> {ans.authorRole}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md text-[10px]">
                              <CheckCircle2 size={11} /> {ans.authorRole || 'Giảng viên'}
                            </span>
                          )}
                          <span className="font-bold text-text-primary text-[11px]">{ans.author}</span>
                        </div>
                        <span className="text-[10px] text-text-tertiary">{ans.createdAt}</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed pt-0.5">
                        {ans.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Box */}
              <div className="pl-6 sm:pl-12 pt-1">
                {replyingQnaId === item.id ? (
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      placeholder="Nhập câu trả lời hoặc thảo luận..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingQnaId(null)
                          setReplyText('')
                        }}
                        className="text-xs"
                      >
                        Hủy
                      </Button>
                      <Button
                        size="sm"
                        disabled={isSubmitting || !replyText.trim()}
                        onClick={() => handleSendAnswer(item.id)}
                        className="bg-primary text-white hover:bg-primary-hover text-xs font-bold gap-1 rounded-xl"
                      >
                        <Send size={12} />
                        <span>Gửi câu trả lời</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingQnaId(item.id)}
                    className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-primary transition-colors font-medium cursor-pointer"
                  >
                    <CornerDownRight size={13} />
                    <span>Trả lời câu hỏi này</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
