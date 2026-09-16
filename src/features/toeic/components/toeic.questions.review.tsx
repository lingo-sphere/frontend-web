// Quản lý bộ lọc và danh sách câu hỏi xem lại sau khi hoàn thành bài thi TOEIC.

'use client'

import { useState, useMemo, useRef } from 'react'
import { FileText } from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Card, CardContent } from '@/components/card'
import type { ToeicQuestion } from '@/features/toeic/types/toeic'
import { ToeicReviewQuestionCard } from '@/features/toeic/components/toeic.review.question.card'

interface ToeicQuestionsReviewProps {
  questions: ToeicQuestion[]
  userAnswers: Record<number, string>
  evaluatedAnswers?: Record<number, {
    whisper_transcript?: string
    ai_score?: number
    ai_feedback?: {
      pronunciation_score?: number
      fluency_score?: number
      grammar_score?: number
      vocabulary_score?: number
      detailed_comment?: string
      improvement_tips?: string[]
    }
    is_correct?: boolean
  }>
  isEvaluatingAI?: boolean
  correctCount: number
  incorrectCount: number
  isVietnamese: boolean
}

export function ToeicQuestionsReview({
  questions,
  userAnswers,
  evaluatedAnswers = {},
  isEvaluatingAI = false,
  isVietnamese,
}: ToeicQuestionsReviewProps) {
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'CORRECT' | 'WRONG'>('ALL')
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({})
  const parentRef = useRef<HTMLDivElement>(null)

  const toggleQuestionExpand = (qNum: number) => {
    setExpandedQuestions((prev) => ({ ...prev, [qNum]: !prev[qNum] }))
  }

  const { correctList, incorrectList } = useMemo(() => {
    if (!questions || questions.length === 0) {
      return { correctList: [], incorrectList: [] }
    }

    const correct: ToeicQuestion[] = []
    const incorrect: ToeicQuestion[] = []

    questions.forEach((q) => {
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
        const evalInfo = evaluatedAnswers[q.questionNumber]
        const isPass = evalInfo
          ? (evalInfo.is_correct ?? (evalInfo.ai_score !== undefined ? evalInfo.ai_score >= 50 : false))
          : false

        if (isPass) {
          correct.push(q)
        } else {
          incorrect.push(q)
        }
        return
      }

      const isCorrect = isAnswered && selected.trim().toUpperCase() === q.correctOption.trim().toUpperCase()
      if (isCorrect) {
        correct.push(q)
      } else {
        incorrect.push(q)
      }
    })

    return { correctList: correct, incorrectList: incorrect }
  }, [questions, userAnswers, evaluatedAnswers])

  const filteredQuestions = useMemo(() => {
    if (reviewFilter === 'CORRECT') return correctList
    if (reviewFilter === 'WRONG') return incorrectList
    return questions || []
  }, [reviewFilter, correctList, incorrectList, questions])

  const rowVirtualizer = useVirtualizer({
    count: filteredQuestions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180,
    overscan: 5,
  })

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
              Làm đúng ({correctList.length})
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
              Làm sai ({incorrectList.length})
            </button>
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-tertiary">
            {isVietnamese
              ? 'Không có câu hỏi nào phù hợp với bộ lọc.'
              : 'No questions match the selected filter.'}
          </div>
        ) : (
          <div ref={parentRef} className="max-h-[750px] overflow-y-auto pr-1">
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const q = filteredQuestions[virtualRow.index]
                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div className="pb-4">
                      <ToeicReviewQuestionCard
                        question={q}
                        userAnswer={userAnswers[q.questionNumber]}
                        isExpanded={Boolean(expandedQuestions[q.questionNumber])}
                        onToggleExpand={() => toggleQuestionExpand(q.questionNumber)}
                        whisperTranscript={evaluatedAnswers[q.questionNumber]?.whisper_transcript}
                        aiScore={evaluatedAnswers[q.questionNumber]?.ai_score}
                        aiFeedback={evaluatedAnswers[q.questionNumber]?.ai_feedback}
                        isEvaluatingAI={isEvaluatingAI}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
