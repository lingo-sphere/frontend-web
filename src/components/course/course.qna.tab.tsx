'use client'

/**
 * @file CourseQnATab.tsx
 * @description Giao diện diễn đàn Hỏi & Đáp (Q&A) khóa học phong cách thảo luận hiện đại, hỗ trợ ẩn danh và mô hình phản hồi 2 cấp phẳng từ Giảng viên
 */

import { useState, useEffect, useMemo, useRef } from 'react'
import {
  MessageSquare,
  Search,
  ThumbsUp,
  Send,
  CheckCircle2,
  Bot,
  User,
  EyeOff,
  ShieldCheck,
  GraduationCap,
  Clock,
  BookOpen,
  Plus,
  X,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { QnAItem } from '@/types/course'

interface CourseQnATabProps {
  qnaList: QnAItem[]
  currentLessonTitle?: string
  isEnrolled?: boolean
  isAuthenticated?: boolean
  currentUserRole?: string
  currentUserId?: string
  onCreateQuestion?: (title: string, body: string, isAnonymous?: boolean) => Promise<void> | void
  onAddAnswer?: (qnaId: string, answerText: string) => Promise<void> | void
  onUpvote?: (qnaId: string) => Promise<void> | void
}

export function CourseQnATab({
  qnaList,
  currentLessonTitle,
  isEnrolled = true,
  isAuthenticated = true,
  currentUserRole,
  currentUserId,
  onCreateQuestion,
  onAddAnswer,
  onUpvote,
}: CourseQnATabProps) {
  const [qna, setQna] = useState<QnAItem[]>(qnaList)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAskForm, setShowAskForm] = useState(false)
  const [questionTitle, setQuestionTitle] = useState('')
  const [questionBody, setQuestionBody] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'answered' | 'unanswered'>('all')
  const [replyingQnaId, setReplyingQnaId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const topContainerRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const isTeacherOrAdmin = currentUserRole === 'INSTRUCTOR' || currentUserRole === 'ADMIN'

  useEffect(() => {
    setQna(qnaList)
  }, [qnaList])

  const scrollToElementSmoothly = (element: HTMLElement, offset = 24) => {
    const scrollContainer = element.closest('.overflow-y-auto') as HTMLElement | null
    if (scrollContainer) {
      const containerRect = scrollContainer.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      const targetY = scrollContainer.scrollTop + (elementRect.top - containerRect.top) - offset
      scrollContainer.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'smooth',
      })
    } else {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleCloseForm = () => {
    setShowAskForm(false)
    setIsAnonymous(false)
    setTimeout(() => {
      setQuestionTitle('')
      setQuestionBody('')
    }, 300)
  }

  const handleToggleAskForm = () => {
    if (!showAskForm) {
      setShowAskForm(true)
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (formRef.current) {
            scrollToElementSmoothly(formRef.current, 24)
          }
          titleInputRef.current?.focus({ preventScroll: true })
        }, 80)
      })
    } else {
      handleCloseForm()
    }
  }

  const handleAskQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionTitle.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      if (onCreateQuestion) {
        await onCreateQuestion(questionTitle.trim(), questionBody.trim(), isAnonymous)
      } else {
        const newQuestion: QnAItem = {
          id: `qna-${Date.now()}`,
          lessonTitle: currentLessonTitle || 'Bài học hiện tại',
          author: isAnonymous ? 'Bạn (Ẩn danh)' : 'Bạn (Học viên)',
          isAnonymous,
          userId: currentUserId,
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
      handleCloseForm()
      setTimeout(() => {
        if (topContainerRef.current) {
          scrollToElementSmoothly(topContainerRef.current, 16)
        }
      }, 120)
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

  const answeredCount = useMemo(() => qna.filter((q) => q.isAnswered).length, [qna])
  const unansweredCount = useMemo(() => qna.filter((q) => !q.isAnswered).length, [qna])

  const filteredQnA = useMemo(() => {
    return qna.filter((item) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q)

      if (selectedFilter === 'answered') return matchesSearch && item.isAnswered
      if (selectedFilter === 'unanswered') return matchesSearch && !item.isAnswered
      return matchesSearch
    })
  }, [qna, searchQuery, selectedFilter])

  return (
    <div ref={topContainerRef} className="space-y-6 pt-2 animate-in fade-in duration-150">
      {!isEnrolled && (
        <div className="rounded-2xl border border-warning/30 bg-warning-soft/20 p-4 text-xs text-warning flex items-center gap-2.5">
          <Lock size={15} className="shrink-0" />
          <span>Chỉ học viên đã đăng ký khóa học mới có thể đặt câu hỏi hoặc gửi thắc mắc tới Giảng viên.</span>
        </div>
      )}

      {/* Top Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm thắc mắc, chủ đề thảo luận..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-hidden transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {isEnrolled && isAuthenticated && (
          <Button
            onClick={handleToggleAskForm}
            className={`rounded-2xl px-5 py-2.5 font-bold text-xs gap-2 shrink-0 transition-all cursor-pointer shadow-xs ${
              showAskForm
                ? 'bg-surface border border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                : 'bg-primary text-white hover:bg-primary-hover shadow-primary/20'
            }`}
          >
            {showAskForm ? (
              <>
                <X size={15} />
                <span>Đóng form</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>Đặt câu hỏi</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Refined Question Composer with Smooth Expand / Collapse Animation */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          showAskForm
            ? 'grid-rows-[1fr] opacity-100 mb-6'
            : 'grid-rows-[0fr] opacity-0 mb-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden">
          <form
            ref={formRef}
            onSubmit={handleAskQuestionSubmit}
            className="rounded-3xl border border-border bg-surface p-5 sm:p-6 shadow-xl space-y-4 scroll-mt-6"
          >
            <div className="flex items-center justify-between border-b border-border/70 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">Đặt câu hỏi mới</h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
                    <BookOpen size={12} />
                    <span>Bài học: <strong className="text-text-secondary font-semibold">{currentLessonTitle || 'Tổng quan'}</strong></span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-xl p-1.5 text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <input
                ref={titleInputRef}
                type="text"
                placeholder="Bạn đang có thắc mắc gì về bài học này?"
                value={questionTitle}
                onChange={(e) => setQuestionTitle(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm sm:text-base font-bold text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-hidden transition-colors"
                required
              />
              <textarea
                rows={3}
                placeholder="Mô tả chi tiết ngữ cảnh bài học, câu thoại hoặc ngữ pháp cần giảng viên giải thích thêm..."
                value={questionBody}
                onChange={(e) => setQuestionBody(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-hidden resize-none transition-colors"
              />
            </div>

            {/* Composer Footer: Sleek Anonymous Toggle + Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-border/70">
              <button
                type="button"
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer self-start ${
                  isAnonymous
                    ? 'border border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold shadow-xs'
                    : 'border border-border bg-surface text-text-secondary hover:border-border-hover hover:bg-surface-hover'
                }`}
              >
                {isAnonymous ? (
                  <>
                    <EyeOff size={15} className="text-purple-600 dark:text-purple-400" />
                    <span>Đang đăng ẩn danh</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-500/20 font-bold">Bật</span>
                  </>
                ) : (
                  <>
                    <User size={15} className="text-text-tertiary" />
                    <span>Đăng công khai (Bấm để ẩn danh)</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCloseForm}
                  className="text-xs font-bold text-text-secondary hover:text-text-primary cursor-pointer rounded-xl px-4"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !questionTitle.trim()}
                  className="bg-primary text-white hover:bg-primary-hover text-xs font-bold rounded-xl px-6 py-2.5 cursor-pointer shadow-sm shadow-primary/25 disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang đăng...' : 'Đăng câu hỏi'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-primary/10 text-primary shadow-2xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            Tất cả ({qna.length})
          </button>
          <button
            onClick={() => setSelectedFilter('answered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === 'answered'
                ? 'bg-primary/10 text-primary shadow-2xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            Đã giải đáp ({answeredCount})
          </button>
          <button
            onClick={() => setSelectedFilter('unanswered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === 'unanswered'
                ? 'bg-primary/10 text-primary shadow-2xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            Chờ giải đáp ({unansweredCount})
          </button>
        </div>
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {filteredQnA.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center rounded-3xl border border-dashed border-border bg-surface p-8 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageSquare size={22} />
            </div>
            <div className="text-sm font-bold text-text-primary">Chưa có câu hỏi nào trong danh mục này</div>
            <p className="text-xs text-text-secondary max-w-sm leading-relaxed">
              Bạn có thắc mắc về bài học? Hãy đặt câu hỏi ngay để nhận giải đáp trực tiếp từ Giảng viên.
            </p>
          </div>
        ) : (
          filteredQnA.map((item) => {
            const isAuthorCurrent = Boolean(currentUserId && item.userId && item.userId === currentUserId)
            const authorDisplayName = item.isAnonymous
              ? (isAuthorCurrent ? 'Bạn (Ẩn danh)' : 'Học viên ẩn danh')
              : (isAuthorCurrent ? `${item.author || 'Bạn'} (Bạn)` : (item.author || 'Học viên'))

            return (
              <div
                key={item.id}
                className="rounded-3xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-4 hover:border-border-hover transition-all"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {item.isAnonymous ? (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-xs">
                        <EyeOff size={18} />
                      </div>
                    ) : item.authorAvatar ? (
                      <img
                        src={item.authorAvatar}
                        alt={authorDisplayName}
                        className="h-10 w-10 shrink-0 rounded-2xl object-cover border border-border/60 shadow-xs"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-sm shadow-xs">
                        {(item.author || 'H').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 space-y-1">
                      <h4 className="text-sm sm:text-base font-bold text-text-primary leading-snug">
                        {item.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-tertiary">
                        <span className="font-semibold text-text-secondary flex items-center gap-1.5">
                          {authorDisplayName}
                          {item.isAnonymous && (
                            <span className="inline-flex items-center gap-0.5 rounded-md bg-purple-500/10 px-1.5 py-0.2 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                              <ShieldCheck size={11} /> Ẩn danh
                            </span>
                          )}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-text-tertiary">
                          <BookOpen size={11} />
                          {item.lessonTitle}
                        </span>
                        <span>•</span>
                        <span>{item.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUpvoteClick(item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface-hover/50 hover:border-primary hover:text-primary transition-all text-xs font-bold text-text-secondary cursor-pointer shrink-0 shadow-2xs"
                  >
                    <ThumbsUp size={13} />
                    <span>{item.upvotes}</span>
                  </button>
                </div>

                {item.body && (
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed pl-0 sm:pl-13">
                    {item.body}
                  </p>
                )}

                {/* Answers Section (Mô hình 2 cấp phẳng - Phản hồi từ Giảng viên / AI) */}
                {item.answers && item.answers.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-border/60 pl-0 sm:pl-13">
                    {item.answers.map((ans) => {
                      const isAI = ans.authorRole === 'Gia sư AI'
                      return (
                        <div
                          key={ans.id}
                          className={`rounded-2xl p-4 border space-y-2 ${
                            isAI
                              ? 'border-indigo-500/20 bg-indigo-500/[0.03]'
                              : 'border-emerald-500/30 bg-emerald-500/[0.03] border-l-4 border-l-emerald-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs">
                              {isAI ? (
                                <span className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg text-[10px]">
                                  <Bot size={12} /> Trợ lý AI
                                </span>
                              ) : ans.authorAvatar ? (
                                <img
                                  src={ans.authorAvatar}
                                  alt={ans.author}
                                  className="h-5 w-5 rounded-full object-cover border border-border/60"
                                />
                              ) : (
                                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg text-[10px]">
                                  <CheckCircle2 size={12} /> {ans.authorRole || 'Giảng viên'}
                                </span>
                              )}
                              <span className="font-bold text-text-primary text-xs">{ans.author}</span>
                            </div>
                            <span className="text-[10px] text-text-tertiary">{ans.createdAt}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                            {ans.body}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Footer status / Teacher reply trigger */}
                <div className="pl-0 sm:pl-13 pt-1">
                  {isTeacherOrAdmin ? (
                    replyingQnaId === item.id ? (
                      <div className="space-y-3 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.03] animate-in fade-in duration-200">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <GraduationCap size={15} />
                          <span>Giải đáp thắc mắc với tư cách Giảng viên</span>
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Nhập nội dung giải đáp chuyên môn cho học viên..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-text-primary placeholder:text-text-tertiary focus:border-emerald-500 focus:outline-hidden resize-none"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setReplyingQnaId(null)
                              setReplyText('')
                            }}
                            className="text-xs font-bold text-text-secondary cursor-pointer"
                          >
                            Hủy
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            disabled={isSubmitting || !replyText.trim()}
                            onClick={() => handleSendAnswer(item.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 rounded-xl cursor-pointer shadow-xs"
                          >
                            <Send size={13} />
                            <span>Gửi giải đáp</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setReplyingQnaId(item.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                      >
                        <GraduationCap size={14} />
                        <span>Phản hồi với tư cách Giảng viên</span>
                      </button>
                    )
                  ) : (
                    (!item.answers || item.answers.length === 0) && (
                      <div className="inline-flex items-center gap-1.5 text-[11px] text-text-tertiary bg-surface-hover/50 px-2.5 py-1 rounded-lg">
                        <Clock size={12} />
                        <span>Đang chờ Giảng viên giải đáp</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
