// Thanh danh mục câu hỏi bài thi, trạng thái đã trả lời và điều hướng câu hỏi.

'use client'

import { Send, RotateCcw } from 'lucide-react'
import { Button } from '@/components/button'
import { CourseTestQuestion, getCorrectOptionIndex } from '@/features/courses/types/test.runner.types'

interface TestRunnerSidebarProps {
  questions: CourseTestQuestion[]
  selectedAnswers: Record<number, number>
  isSubmitted: boolean
  isSaving: boolean
  correctCount?: number
  wrongCount?: number
  onQuestionClick: (index: number) => void
  onSubmitClick: () => void
  onRetryClick: () => void
}

export function TestRunnerSidebar({
  questions,
  selectedAnswers,
  isSubmitted,
  isSaving,
  correctCount = 0,
  wrongCount = 0,
  onQuestionClick,
  onSubmitClick,
  onRetryClick,
}: TestRunnerSidebarProps) {
  const answeredCount = Object.keys(selectedAnswers).length
  const unansweredCount = Math.max(0, questions.length - answeredCount)
  const totalQuestions = questions.length || 1

  return (
    <aside className="w-full rounded-2xl border border-border bg-surface shadow-xs shrink-0 flex flex-col max-h-[35vh] lg:max-h-[calc(100vh-8.5rem)] sticky top-20 overflow-hidden">
      <div className="p-4 border-b border-border bg-surface-subtle/50 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider">
            Bảng câu hỏi
          </h3>
          <p className="text-[11px] text-text-secondary mt-0.5">
            Đã làm: <strong className="text-primary">{answeredCount}</strong> / {questions.length} câu
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-primary">
            {Math.round((answeredCount / totalQuestions) * 100)}%
          </span>
        </div>
      </div>

      
      <div className="w-full bg-border h-1.5">
        <div
          className="bg-primary h-1.5 transition-all duration-300"
          style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
        />
      </div>

      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, idx) => {
            const isAnswered = selectedAnswers[idx] !== undefined
            const options = q.options ?? []
            const correctIdx = getCorrectOptionIndex(q, options)
            const chosenIdx = selectedAnswers[idx]
            const isCorrect = isSubmitted && chosenIdx === correctIdx
            const isWrong = isSubmitted && isAnswered && chosenIdx !== correctIdx

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onQuestionClick(idx)}
                className={`h-10 rounded-xl text-xs font-extrabold flex flex-col items-center justify-center transition-all cursor-pointer ${
                  !isSubmitted
                    ? isAnswered
                      ? 'bg-primary text-white shadow-xs scale-102 hover:bg-primary-hover'
                      : 'bg-surface border border-border text-text-secondary hover:border-primary/60 hover:text-text-primary'
                    : isCorrect
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : isWrong
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-rose-500/10 border border-rose-500/40 text-rose-600 dark:text-rose-400'
                }`}
              >
                <span>{idx + 1}</span>
                {isAnswered && !isSubmitted && (
                  <span className="text-[9px] opacity-80">
                    {String.fromCharCode(65 + (chosenIdx ?? 0))}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        
        <div className="mt-5 pt-4 border-t border-border space-y-2 text-[11px] text-text-secondary">
          {!isSubmitted ? (
            <>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-primary shrink-0" />
                <span>Đã chọn đáp án ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-surface border border-border shrink-0" />
                <span>Chưa chọn đáp án ({unansweredCount})</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-emerald-500 shrink-0" />
                <span>Đúng ({correctCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-rose-500 shrink-0" />
                <span>Sai ({wrongCount})</span>
              </div>
            </>
          )}
        </div>
      </div>

      
      <div className="p-4 border-t border-border bg-surface-subtle/40">
        {!isSubmitted ? (
          <Button
            type="button"
            onClick={onSubmitClick}
            disabled={isSaving}
            className="w-full rounded-xl bg-primary text-white hover:bg-primary-hover py-2.5 text-xs font-bold shadow-md shadow-primary/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <Send size={13} />
            <span>Nộp bài ngay</span>
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onRetryClick}
            variant="outline"
            className="w-full rounded-xl border-border hover:bg-surface py-2.5 text-xs font-bold cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw size={13} />
            <span>Làm lại bài thi</span>
          </Button>
        )}
      </div>
    </aside>
  )
}
