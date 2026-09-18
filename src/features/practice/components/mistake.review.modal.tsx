// Modal thực hiện ôn tập lặp lại ngắt quãng (SRS SM-2) cho câu hỏi trong Sổ tay lỗi sai.

'use client'

import { useState } from 'react'
import {
  X,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Calendar,
  Flame,
  Award,
} from 'lucide-react'
import { Button } from '@/components/button'
import { useReviewMistakeMutation } from '@/features/practice/hooks/use.mistake.query'
import type { UserMistakeItem } from '@/features/practice/types/mistake'
import { MistakeStatus } from '@/features/practice/types/mistake'

interface MistakeReviewModalProps {
  open: boolean
  onClose: () => void
  mistake: UserMistakeItem | null
  onSuccess?: () => void
}

export function MistakeReviewModal({ open, onClose, mistake, onSuccess }: MistakeReviewModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)
  const [reviewResult, setReviewResult] = useState<{
    is_correct: boolean
    message: string
    consecutive_correct: number
    status: MistakeStatus
  } | null>(null)

  const reviewMutation = useReviewMistakeMutation()

  if (!open || !mistake) return null

  const handleSelectOption = (opt: string) => {
    if (isAnswerRevealed) return
    setSelectedOption(opt)
  }

  const handleSubmitReview = async () => {
    if (!selectedOption || !mistake) return
    const isCorrect = selectedOption.trim().toLowerCase() === mistake.correct_answer.trim().toLowerCase()

    try {
      const res = await reviewMutation.mutateAsync({
        mistakeId: mistake._id,
        payload: {
          is_correct: isCorrect,
          user_answer: selectedOption,
        },
      })
      setReviewResult({
        is_correct: isCorrect,
        message: res.message,
        consecutive_correct: res.consecutive_correct,
        status: res.status,
      })
      setIsAnswerRevealed(true)
      onSuccess?.()
    } catch {
      setReviewResult({
        is_correct: isCorrect,
        message: isCorrect ? 'Chính xác!' : 'Chưa chính xác!',
        consecutive_correct: isCorrect ? mistake.consecutive_correct + 1 : 0,
        status: isCorrect && mistake.consecutive_correct + 1 >= 3 ? MistakeStatus.MASTERED : MistakeStatus.PRACTICING,
      })
      setIsAnswerRevealed(true)
    }
  }

  const handleResetAndClose = () => {
    setSelectedOption(null)
    setIsAnswerRevealed(false)
    setReviewResult(null)
    onClose()
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-surface border border-border shadow-2xl transition-all flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
              <RotateCcw size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <span>Ôn tập ngắt quãng (SRS)</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                  Chuỗi đúng: {mistake.consecutive_correct}/3
                </span>
              </h3>
              <p className="text-[11px] text-text-secondary">
                {mistake.topic_name_vi || mistake.topic_tags[0] || 'Câu hỏi cần ôn tập'}
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="rounded-xl p-1.5 text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-4 rounded-2xl bg-surface-secondary border border-border space-y-2">
            <div className="flex items-center justify-between text-[11px] text-text-secondary">
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                Lần làm trước: Bạn đã chọn &ldquo;{mistake.user_answer}&rdquo; (Chưa đúng)
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                <span>Cần ôn</span>
              </span>
            </div>
            <p className="text-sm font-bold text-text-primary leading-relaxed">
              {mistake.question_text}
            </p>
          </div>

          <div className="space-y-2.5">
            {mistake.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx)
              const isSelected = selectedOption === opt
              const isCorrectAnswer = opt.trim().toLowerCase() === mistake.correct_answer.trim().toLowerCase()

              let optionStyle = 'bg-surface border-border hover:border-rose-300 dark:hover:border-rose-700'
              if (isSelected && !isAnswerRevealed) {
                optionStyle = 'bg-rose-500/10 border-rose-600 text-rose-700 dark:text-rose-300 font-semibold'
              } else if (isAnswerRevealed) {
                if (isCorrectAnswer) {
                  optionStyle = 'bg-emerald-500/15 border-emerald-600 text-emerald-700 dark:text-emerald-300 font-semibold'
                } else if (isSelected && !isCorrectAnswer) {
                  optionStyle = 'bg-rose-500/15 border-rose-600 text-rose-700 dark:text-rose-300 line-through'
                } else {
                  optionStyle = 'opacity-60 bg-surface border-border'
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswerRevealed || reviewMutation.isPending}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-xs text-left transition-all cursor-pointer ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface-hover text-[11px] font-bold text-text-secondary">
                      {letter}
                    </span>
                    <span className="text-text-primary">{opt}</span>
                  </div>
                  {isAnswerRevealed && isCorrectAnswer && (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  )}
                  {isAnswerRevealed && isSelected && !isCorrectAnswer && (
                    <XCircle size={16} className="text-rose-600 shrink-0" />
                  )}
                </button>
              )
            })}
          </div>

          {isAnswerRevealed && reviewResult && (
            <div
              className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in duration-200 ${
                reviewResult.is_correct
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200'
                  : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-950 dark:text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <div className="flex items-center gap-1.5">
                  {reviewResult.is_correct ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle size={16} className="text-rose-600 shrink-0" />
                  )}
                  <span>{reviewResult.message}</span>
                </div>
                {reviewResult.status === MistakeStatus.MASTERED ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                    <Award size={12} />
                    <span>Đã làm chủ hoàn toàn!</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-text-secondary">
                    <Flame size={12} className="text-amber-500" />
                    <span>Tiến độ: {reviewResult.consecutive_correct}/3</span>
                  </span>
                )}
              </div>

              {mistake.explanation && (
                <div className="pt-2 border-t border-border/50 text-[11px] leading-relaxed">
                  <strong>Giải thích: </strong>
                  <span>{mistake.explanation}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-secondary/50">
          <span className="text-xs text-text-tertiary">
            {isAnswerRevealed ? 'Đã lưu kết quả ôn tập' : 'Chọn đáp án đúng'}
          </span>

          <div className="flex items-center gap-2">
            {!isAnswerRevealed ? (
              <Button
                onClick={handleSubmitReview}
                disabled={!selectedOption || reviewMutation.isPending}
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white cursor-pointer px-4 gap-1.5"
              >
                <Sparkles size={14} />
                <span>{reviewMutation.isPending ? 'Đang lưu...' : 'Xác nhận đáp án'}</span>
              </Button>
            ) : (
              <Button
                onClick={handleResetAndClose}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer px-4"
              >
                Đóng
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
