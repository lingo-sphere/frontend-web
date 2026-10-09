// Giao diện diễn đàn Hỏi & Đáp khóa học.
'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Lock, MessageSquare } from 'lucide-react'
import type { QnAItem } from '@/features/courses/types/course'
import { CourseQnAAskForm } from '@/features/courses/components/course.qna.ask.form'
import { CourseQnAFiltersBar } from '@/features/courses/components/course.qna.filters.bar'
import { CourseQnAThreadItem } from '@/features/courses/components/course.qna.thread.item'

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

  const isTeacher = currentUserRole === 'INSTRUCTOR'

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
      prev.map((item) => (item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item))
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
          <span>
            Chỉ học viên đã đăng ký khóa học mới có thể đặt câu hỏi hoặc gửi thắc mắc tới Giảng
            viên.
          </span>
        </div>
      )}

      <CourseQnAFiltersBar
        searchQuery={searchQuery}
        selectedFilter={selectedFilter}
        totalCount={qna.length}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        showAskForm={showAskForm}
        isEnrolled={isEnrolled}
        isAuthenticated={isAuthenticated}
        onSearchChange={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
        onFilterChange={setSelectedFilter}
        onToggleAskForm={handleToggleAskForm}
      />

      <CourseQnAAskForm
        ref={formRef}
        showAskForm={showAskForm}
        currentLessonTitle={currentLessonTitle}
        questionTitle={questionTitle}
        questionBody={questionBody}
        isAnonymous={isAnonymous}
        isSubmitting={isSubmitting}
        titleInputRef={titleInputRef}
        onTitleChange={setQuestionTitle}
        onBodyChange={setQuestionBody}
        onToggleAnonymous={() => setIsAnonymous(!isAnonymous)}
        onClose={handleCloseForm}
        onSubmit={handleAskQuestionSubmit}
      />

      <div className="space-y-4">
        {filteredQnA.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center rounded-3xl border border-dashed border-border bg-surface p-8 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageSquare size={22} />
            </div>
            <div className="text-sm font-bold text-text-primary">
              Chưa có câu hỏi nào trong danh mục này
            </div>
            <p className="text-xs text-text-secondary max-w-sm leading-relaxed">
              Bạn có thắc mắc về bài học? Hãy đặt câu hỏi ngay để nhận giải đáp trực tiếp từ Giảng
              viên.
            </p>
          </div>
        ) : (
          filteredQnA.map((item) => (
            <CourseQnAThreadItem
              key={item.id}
              item={item}
              currentUserId={currentUserId}
              isTeacher={isTeacher}
              replyingQnaId={replyingQnaId}
              replyText={replyText}
              isSubmitting={isSubmitting}
              onUpvote={handleUpvoteClick}
              onStartReply={setReplyingQnaId}
              onCancelReply={() => {
                setReplyingQnaId(null)
                setReplyText('')
              }}
              onReplyTextChange={setReplyText}
              onSendReply={handleSendAnswer}
            />
          ))
        )}
      </div>
    </div>
  )
}
