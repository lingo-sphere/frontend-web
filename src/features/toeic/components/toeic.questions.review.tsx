// Quản lý bộ lọc và danh sách câu hỏi xem lại sau khi hoàn thành bài thi TOEIC.

'use client'

import { useState, useMemo } from 'react'
import { FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import type { ToeicQuestion } from '@/features/toeic/types/toeic'
import { ToeicReviewQuestionCard } from '@/features/toeic/components/toeic.review.question.card'

interface ToeicQuestionsReviewProps {
  questions: ToeicQuestion[]
  userAnswers: Record<number, string>
  correctCount: number
  incorrectCount: number
  isVietnamese: boolean
}

export function ToeicQuestionsReview({
  questions,
  userAnswers,
  correctCount,
  incorrectCount,
  isVietnamese,
}: ToeicQuestionsReviewProps) {
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'CORRECT' | 'WRONG'>('ALL')
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({})

  const toggleQuestionExpand = (qNum: number) => {
    setExpandedQuestions((prev) => ({ ...prev, [qNum]: !prev[qNum] }))
  }

  const filteredQuestions = useMemo(() => {
    if (!questions || questions.length === 0) return []
    return questions.filter((q) => {
      const isWriting =
        q.questionType === 'WRITING' ||
        q.skillType === 'WRITING' ||
        String(q.partNumber).toLowerCase().includes('writ')
      const isSpeaking =
        !isWriting &&
        (q.questionType === 'SPEAKING' ||
          q.skillType === 'SPEAKING' ||
          String(q.partNumber).toLowerCase().includes('speak'))

      const selected = userAnswers[q.questionNumber]
      const isAnswered = selected !== undefined && selected !== ''

      if (isWriting || isSpeaking) {
        if (reviewFilter === 'CORRECT') return isAnswered
        if (reviewFilter === 'WRONG') return false
        return true
      }

      const isCorrect = isAnswered && selected.trim().toUpperCase() === q.correctOption.trim().toUpperCase()
      const isWrong = isAnswered && !isCorrect

      if (reviewFilter === 'CORRECT') return isCorrect
      if (reviewFilter === 'WRONG') return isWrong
      return true
    })
  }, [questions, userAnswers, reviewFilter])

  if (!questions || questions.length === 0) return null

  return (
    <Card className="dashboard-card overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-surface shadow-sm">
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <FileText size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-text-primary">
                {isVietnamese ? 'Đáp Án Chi Tiết Của Từng Câu Hỏi' : 'Detailed Question Review'}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {isVietnamese
                  ? 'Xem lại câu trả lời của bạn, đối chiếu đáp án chuẩn và đọc lời giải thích chi tiết.'
                  : 'Review your chosen answers, check correct keys, and study detailed explanations.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setReviewFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                reviewFilter === 'ALL'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
              }`}
            >
              Tất cả ({questions.length})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('CORRECT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                reviewFilter === 'CORRECT'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              Làm đúng ({correctCount})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('WRONG')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                reviewFilter === 'WRONG'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
              }`}
            >
              Làm sai ({incorrectCount})
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredQuestions.map((q) => (
            <ToeicReviewQuestionCard
              key={q.id || q.questionNumber}
              question={q}
              userAnswer={userAnswers[q.questionNumber]}
              isExpanded={Boolean(expandedQuestions[q.questionNumber])}
              onToggleExpand={() => toggleQuestionExpand(q.questionNumber)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
