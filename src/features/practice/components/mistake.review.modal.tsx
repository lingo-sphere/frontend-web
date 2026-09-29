// Modal thực hiện ôn tập lặp lại ngắt quãng (SRS SM-2) cho câu hỏi trong Sổ tay lỗi sai.
// Hỗ trợ trắc nghiệm (MULTIPLE_CHOICE), điền vào chỗ trống (FILL_BLANK) và ghép câu (ORDERING).

'use client'

import { useState, useEffect, useMemo } from 'react'
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

function normalizeString(val: string): string {
  return (val || '').trim().toLowerCase()
}

function normalizePunctuation(val: string): string {
  return normalizeString(val)
    .replace(/[.,!?;:'"()]/g, '')
    .replace(/\s+/g, ' ')
}

function isMatchingAnswer(opt: string, optIndex: number, targetAnswer: string): boolean {
  if (!targetAnswer) return false
  const trimmedTarget = targetAnswer.trim()
  const upperTarget = trimmedTarget.toUpperCase()
  const letter = String.fromCharCode(65 + optIndex)

  if (upperTarget === letter) return true
  return opt.trim().toLowerCase() === trimmedTarget.toLowerCase()
}

export function MistakeReviewModal({ open, onClose, mistake, onSuccess }: MistakeReviewModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [fillBlankInput, setFillBlankInput] = useState<string>('')
  const [reorderSelectedWords, setReorderSelectedWords] = useState<string[]>([])
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)
  const [reviewResult, setReviewResult] = useState<{
    is_correct: boolean
    message: string
    consecutive_correct: number
    status: MistakeStatus
  } | null>(null)

  const reviewMutation = useReviewMistakeMutation()

  // Reset state when modal opens or mistake changes
  useEffect(() => {
    setSelectedOption(null)
    setFillBlankInput('')
    setReorderSelectedWords([])
    setIsAnswerRevealed(false)
    setReviewResult(null)
  }, [mistake?._id, open])

  // Determine question type
  const questionType: 'MULTIPLE_CHOICE' | 'FILL_BLANK' | 'ORDERING' = useMemo(() => {
    if (!mistake) return 'MULTIPLE_CHOICE'

    const explicitType =
      mistake.question_type ||
      mistake.classification_snapshot?.question_type

    if (explicitType === 'ORDERING') return 'ORDERING'
    if (explicitType === 'FILL_BLANK' || explicitType === 'SHORT_ANSWER') return 'FILL_BLANK'
    if (explicitType === 'MULTIPLE_CHOICE') return 'MULTIPLE_CHOICE'

    if (mistake.ordering_items && mistake.ordering_items.length > 0) return 'ORDERING'
    if (mistake.options && mistake.options.length > 0) return 'MULTIPLE_CHOICE'

    // Fallback detection based on question structure
    if (mistake.question_text?.includes('/') && !mistake.question_text.includes('(')) {
      return 'ORDERING'
    }

    return 'FILL_BLANK'
  }, [mistake])

  // Derived ordering items (support existing records without ordering_items populated)
  const orderingItems: string[] = useMemo(() => {
    if (!mistake) return []
    if (mistake.ordering_items && mistake.ordering_items.length > 0) {
      return mistake.ordering_items
    }
    if (questionType === 'ORDERING' && mistake.question_text?.includes('/')) {
      return mistake.question_text
        .split('/')
        .map((w) => w.trim())
        .filter(Boolean)
    }
    return []
  }, [mistake, questionType])

  if (!open || !mistake) return null

  // Ordering handlers
  const handleSelectWord = (word: string) => {
    if (isAnswerRevealed) return
    setReorderSelectedWords((prev) => [...prev, word])
  }

  const handleRemoveWord = (wordIndex: number) => {
    if (isAnswerRevealed) return
    setReorderSelectedWords((prev) => prev.filter((_, idx) => idx !== wordIndex))
  }

  const handleResetReorder = () => {
    if (isAnswerRevealed) return
    setReorderSelectedWords([])
  }

  // MC handler
  const handleSelectOption = (opt: string) => {
    if (isAnswerRevealed) return
    setSelectedOption(opt)
  }

  // Can user submit?
  const canSubmit = useMemo(() => {
    if (reviewMutation.isPending) return false
    if (questionType === 'MULTIPLE_CHOICE') return selectedOption !== null
    if (questionType === 'FILL_BLANK') return fillBlankInput.trim().length > 0
    if (questionType === 'ORDERING') return reorderSelectedWords.length > 0
    return false
  }, [questionType, selectedOption, fillBlankInput, reorderSelectedWords, reviewMutation.isPending])

  const handleSubmitReview = async () => {
    if (!canSubmit || !mistake) return

    let isCorrect = false
    let submittedAnswer = ''

    if (questionType === 'MULTIPLE_CHOICE') {
      if (!selectedOption) return
      submittedAnswer = selectedOption
      const selectedIdx = mistake.options.findIndex((o) => o === selectedOption)
      isCorrect = isMatchingAnswer(selectedOption, selectedIdx, mistake.correct_answer)
    } else if (questionType === 'FILL_BLANK') {
      submittedAnswer = fillBlankInput.trim()
      const normInput = normalizeString(submittedAnswer)
      const normCorrect = normalizeString(mistake.correct_answer)
      const normPunctInput = normalizePunctuation(submittedAnswer)
      const normPunctCorrect = normalizePunctuation(mistake.correct_answer)

      const alts: string[] = Array.isArray(mistake.question_data?.alternative_answers)
        ? mistake.question_data.alternative_answers
        : []

      isCorrect =
        normInput === normCorrect ||
        normPunctInput === normPunctCorrect ||
        alts.some((a) => normalizeString(a) === normInput || normalizePunctuation(a) === normPunctInput)
    } else if (questionType === 'ORDERING') {
      submittedAnswer = reorderSelectedWords.join(' ')
      const normConstructed = normalizePunctuation(submittedAnswer)
      const normExpected = normalizePunctuation(mistake.correct_answer)
      isCorrect = normConstructed === normExpected
    }

    try {
      const res = await reviewMutation.mutateAsync({
        mistakeId: mistake._id,
        payload: {
          is_correct: isCorrect,
          user_answer: submittedAnswer,
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
    setFillBlankInput('')
    setReorderSelectedWords([])
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
        {/* Header */}
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
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-hover text-text-secondary border border-border">
                  {questionType === 'MULTIPLE_CHOICE' && 'Trắc nghiệm'}
                  {questionType === 'FILL_BLANK' && 'Điền từ'}
                  {questionType === 'ORDERING' && 'Ghép câu'}
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Previous Attempt Summary & Question */}
          <div className="p-4 rounded-2xl bg-surface-secondary border border-border space-y-2">
            <div className="flex items-center justify-between text-[11px] text-text-secondary">
              <span className="font-semibold text-rose-600 dark:text-rose-400 line-clamp-1">
                Lần làm trước: Bạn đã chọn &ldquo;{mistake.user_answer || 'Chưa có'}&rdquo; (Chưa đúng)
              </span>
              <span className="flex items-center gap-1 shrink-0">
                <Calendar size={12} />
                <span>Cần ôn</span>
              </span>
            </div>
            <p className="text-sm font-bold text-text-primary leading-relaxed">
              {mistake.question_text}
            </p>
          </div>

          {/* 1. MULTIPLE CHOICE */}
          {questionType === 'MULTIPLE_CHOICE' && (
            <div className="space-y-2.5">
              {mistake.options.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx)
                const isSelected = selectedOption === opt
                const isCorrectAnswer = isMatchingAnswer(opt, idx, mistake.correct_answer)

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
          )}

          {/* 2. FILL IN THE BLANK */}
          {questionType === 'FILL_BLANK' && (
            <div className="space-y-3 pt-1">
              <label className="text-xs font-semibold text-text-secondary">
                Nhập từ hoặc cụm từ chính xác:
              </label>
              <input
                type="text"
                autoFocus
                disabled={isAnswerRevealed || reviewMutation.isPending}
                value={fillBlankInput}
                onChange={(e) => setFillBlankInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isAnswerRevealed && fillBlankInput.trim()) {
                    handleSubmitReview()
                  }
                }}
                placeholder="Nhập câu trả lời của bạn..."
                className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium text-text-primary placeholder:text-text-tertiary transition-all ${
                  isAnswerRevealed
                    ? reviewResult?.is_correct
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-rose-500 bg-rose-500/10'
                    : 'border-border bg-surface focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20'
                }`}
              />

              {isAnswerRevealed && !reviewResult?.is_correct && (
                <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 p-3 text-xs text-rose-950 dark:text-rose-200">
                  <span className="font-semibold text-rose-600 dark:text-rose-400">Đáp án chính xác: </span>
                  <span className="font-bold">{mistake.correct_answer}</span>
                </div>
              )}
            </div>
          )}

          {/* 3. SENTENCE REORDERING */}
          {questionType === 'ORDERING' && (
            <div className="space-y-4 pt-1">
              {/* Drop area / Constructed sentence */}
              <div className="min-h-[64px] rounded-2xl border-2 border-dashed border-rose-400/40 bg-surface-secondary/40 p-3 flex flex-wrap items-center gap-2">
                {reorderSelectedWords.length === 0 ? (
                  <span className="text-xs text-text-tertiary select-none">
                    Nhấp vào các khối từ bên dưới để ghép thành câu hoàn chỉnh...
                  </span>
                ) : (
                  reorderSelectedWords.map((word, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswerRevealed || reviewMutation.isPending}
                      onClick={() => handleRemoveWord(idx)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
                    >
                      <span>{word}</span>
                      {!isAnswerRevealed && <X size={12} className="opacity-80" />}
                    </button>
                  ))
                )}
              </div>

              {/* Word Bank */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-text-tertiary font-semibold uppercase tracking-wider">
                  <span>Ngân hàng từ:</span>
                  {reorderSelectedWords.length > 0 && !isAnswerRevealed && (
                    <button
                      type="button"
                      onClick={handleResetReorder}
                      className="text-text-secondary hover:text-rose-600 dark:hover:text-rose-400 transition-colors lowercase font-normal cursor-pointer"
                    >
                      Đặt lại
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {orderingItems.map((word, idx) => {
                    const timesUsed = reorderSelectedWords.filter((w) => w === word).length
                    const timesInSource = orderingItems.filter((w) => w === word).length
                    const isExhausted = timesUsed >= timesInSource

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isExhausted || isAnswerRevealed || reviewMutation.isPending}
                        onClick={() => handleSelectWord(word)}
                        className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                          isExhausted
                            ? 'border-border bg-surface-secondary text-text-tertiary opacity-30 cursor-not-allowed'
                            : 'border-border bg-surface hover:border-rose-400 hover:bg-surface-secondary text-text-primary active:scale-95 cursor-pointer shadow-2xs'
                        }`}
                      >
                        {word}
                      </button>
                    )
                  })}
                </div>
              </div>

              {isAnswerRevealed && !reviewResult?.is_correct && (
                <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 p-3 text-xs text-rose-950 dark:text-rose-200">
                  <span className="font-semibold text-rose-600 dark:text-rose-400">Đáp án chính xác: </span>
                  <span className="font-bold">{mistake.correct_answer}</span>
                </div>
              )}
            </div>
          )}

          {/* Feedback Banner */}
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

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-secondary/50">
          <span className="text-xs text-text-tertiary">
            {isAnswerRevealed ? 'Đã lưu kết quả ôn tập' : 'Nhập hoặc chọn đáp án đúng'}
          </span>

          <div className="flex items-center gap-2">
            {!isAnswerRevealed ? (
              <Button
                onClick={handleSubmitReview}
                disabled={!canSubmit}
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
