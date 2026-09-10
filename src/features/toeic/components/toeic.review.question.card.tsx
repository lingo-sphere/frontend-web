// Thẻ hiển thị chi tiết câu hỏi, đáp án học viên chọn và lời giải thích đáp án TOEIC.

'use client'

import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import type { ToeicQuestion } from '@/features/toeic/types/toeic'

interface ToeicReviewQuestionCardProps {
  question: ToeicQuestion
  userAnswer?: string
  isExpanded: boolean
  onToggleExpand: () => void
}

export function ToeicReviewQuestionCard({
  question,
  userAnswer,
  isExpanded,
  onToggleExpand,
}: ToeicReviewQuestionCardProps) {
  const isWriting =
    question.questionType === 'WRITING' ||
    question.skillType === 'WRITING' ||
    String(question.partNumber).toLowerCase().includes('writ')
  const isSpeaking =
    !isWriting &&
    (question.questionType === 'SPEAKING' ||
      question.skillType === 'SPEAKING' ||
      String(question.partNumber).toLowerCase().includes('speak'))

  const selected = userAnswer
  const isAnswered = selected !== undefined && selected !== ''
  const isCorrect = isAnswered && selected.trim().toUpperCase() === question.correctOption.trim().toUpperCase()

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        isWriting || isSpeaking
          ? 'border-border bg-surface'
          : isCorrect
          ? 'border-emerald-500/30 bg-emerald-50/5 dark:bg-emerald-950/10'
          : isAnswered
          ? 'border-rose-500/30 bg-rose-50/5 dark:bg-rose-950/10'
          : 'border-amber-500/30 bg-amber-50/5 dark:bg-amber-950/10'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
              isWriting || isSpeaking
                ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                : isCorrect
                ? 'bg-emerald-600 text-white'
                : isAnswered
                ? 'bg-rose-600 text-white'
                : 'bg-amber-500 text-white'
            }`}
          >
            {question.questionNumber}
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
                Part {question.partNumber || 1}
              </span>
              {question.skillType && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-subtle text-text-tertiary">
                  {question.skillType}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-text-primary font-medium">
              {question.questionTextEn || question.questionTextVi || ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isWriting || isSpeaking ? (
            <span className="text-xs font-semibold text-text-secondary">Tự luận</span>
          ) : isCorrect ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="hidden sm:inline">Chính xác</span>
            </span>
          ) : isAnswered ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
              <XCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Chưa đúng</span>
            </span>
          ) : (
            <span className="text-xs font-semibold text-amber-600">Bỏ qua</span>
          )}

          <button
            type="button"
            onClick={onToggleExpand}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {question.options && question.options.length > 0 && (
        <div className="mt-3.5 space-y-2 pl-9">
          {question.options.map((opt) => {
            const isCorrectOption = opt.key.trim().toUpperCase() === question.correctOption.trim().toUpperCase()
            const isUserSelected = selected && selected.trim().toUpperCase() === opt.key.trim().toUpperCase()

            return (
              <div
                key={opt.key}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                  isCorrectOption
                    ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-950 dark:text-emerald-200 font-bold'
                    : isUserSelected
                    ? 'bg-rose-500/15 border border-rose-500/40 text-rose-950 dark:text-rose-200 font-semibold'
                    : 'bg-surface-subtle text-text-secondary border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      isCorrectOption
                        ? 'bg-emerald-600 text-white'
                        : isUserSelected
                        ? 'bg-rose-600 text-white'
                        : 'bg-surface text-text-tertiary border border-border'
                    }`}
                  >
                    {opt.key}
                  </span>
                  <span className="truncate">{opt.textEn}</span>
                </div>

                <div className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold">
                  {isCorrectOption && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                      Đáp án đúng
                    </span>
                  )}
                  {isUserSelected && !isCorrectOption && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                      Bạn đã chọn
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {(question.explanationEn || question.explanationVi) && (
        <div className="ml-9 mt-3.5 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200 space-y-1">
          <span className="font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Giải thích đáp án chi tiết:</span>
          </span>
          {question.explanationEn && (
            <p className="text-[11.5px] leading-relaxed pl-4 font-medium">
              {question.explanationEn}
            </p>
          )}
          {question.explanationVi && (
            <p className="text-[11.5px] leading-relaxed pl-4 font-medium italic">
              {question.explanationVi}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
