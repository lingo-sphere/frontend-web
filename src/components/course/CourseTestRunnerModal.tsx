'use client'

/**
 * @file CourseTestRunnerModal.tsx
 * @description Modal làm bài kiểm tra / trắc nghiệm chương sử dụng dữ liệu thực tế do giáo viên tạo
 */

import { useState, useMemo } from 'react'
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Trophy,
  ArrowRight,
  RotateCcw,
  FileQuestion,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Chapter } from '@/types/course'

export interface CourseTestQuestion {
  id?: string
  question_text?: string
  question?: string
  options?: string[]
  answers?: string[]
  correct_answer?: string | number
  correct_index?: number
  explanation?: string
  media_url?: string
}

interface CourseTestRunnerModalProps {
  isOpen: boolean
  chapter: Chapter
  testType: 'challenge' | 'exercise' | 'post-mini'
  onClose: () => void
  onComplete: (score: number, isPassed: boolean) => void
}

/**
 * Xác định chính xác vị trí đáp án đúng do giáo viên cài đặt
 * Hỗ trợ các định dạng: 'A' | 'B' | 'C' | 'D', index số 0..3, hoặc chuỗi văn bản khớp với options
 */
function getCorrectOptionIndex(q: CourseTestQuestion, options: string[]): number {
  if (typeof q.correct_index === 'number' && q.correct_index >= 0) {
    return q.correct_index
  }
  if (typeof q.correct_answer === 'number' && q.correct_answer >= 0) {
    return q.correct_answer
  }
  if (typeof q.correct_answer === 'string') {
    const trimmed = q.correct_answer.trim()
    const upper = trimmed.toUpperCase()
    if (upper === 'A') return 0
    if (upper === 'B') return 1
    if (upper === 'C') return 2
    if (upper === 'D') return 3

    const num = parseInt(trimmed, 10)
    if (!isNaN(num) && num >= 0 && num < options.length) {
      return num
    }

    const textMatchIdx = options.findIndex(
      (opt) => opt.trim().toLowerCase() === trimmed.toLowerCase()
    )
    if (textMatchIdx !== -1) return textMatchIdx
  }
  return 0
}

export function CourseTestRunnerModal({
  isOpen,
  chapter,
  testType,
  onClose,
  onComplete,
}: CourseTestRunnerModalProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [scoreResult, setScoreResult] = useState<{
    correctCount: number
    totalQuestions: number
    score: number
    isPassed: boolean
  } | null>(null)

  // Trích xuất CHÍNH XÁC danh sách câu hỏi do giáo viên đã tải lên từ cơ sở dữ liệu
  const rawQuestions: CourseTestQuestion[] = useMemo(() => {
    if (testType === 'challenge') {
      if (Array.isArray(chapter.challenge_questions) && chapter.challenge_questions.length > 0) {
        return chapter.challenge_questions as CourseTestQuestion[]
      }
      if (Array.isArray(chapter.test_questions) && chapter.test_questions.length > 0) {
        return chapter.test_questions as CourseTestQuestion[]
      }
    }
    if (testType === 'post-mini') {
      if (Array.isArray(chapter.post_mini_questions) && chapter.post_mini_questions.length > 0) {
        return chapter.post_mini_questions as CourseTestQuestion[]
      }
      if (Array.isArray(chapter.test_questions) && chapter.test_questions.length > 0) {
        return chapter.test_questions as CourseTestQuestion[]
      }
    }
    if (testType === 'exercise') {
      if (Array.isArray(chapter.test_questions) && chapter.test_questions.length > 0) {
        return chapter.test_questions as CourseTestQuestion[]
      }
      if (Array.isArray(chapter.post_mini_questions) && chapter.post_mini_questions.length > 0) {
        return chapter.post_mini_questions as CourseTestQuestion[]
      }
    }
    return []
  }, [chapter, testType])

  if (!isOpen) return null

  const passingScore =
    testType === 'challenge'
      ? chapter.challengeTest?.passingScore || 80
      : 70

  const testTitle =
    testType === 'challenge'
      ? `Bài kiểm tra đầu chương (Challenge Test)`
      : testType === 'post-mini'
      ? `Bài kiểm tra cuối chương (Post-Mini Test)`
      : `Bài tập trắc nghiệm thực hành`

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }))
  }

  const handleSubmitTest = () => {
    let correct = 0
    rawQuestions.forEach((q, idx) => {
      const chosen = selectedAnswers[idx]
      const options = q.options || q.answers || ['A', 'B', 'C', 'D']
      const correctIdx = getCorrectOptionIndex(q, options)

      if (chosen === correctIdx) {
        correct += 1
      }
    })

    const total = rawQuestions.length
    const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 100
    const isPassed = scorePercent >= passingScore

    setScoreResult({
      correctCount: correct,
      totalQuestions: total,
      score: scorePercent,
      isPassed,
    })
    setIsSubmitted(true)
    onComplete(scorePercent, isPassed)
  }

  const handleRetry = () => {
    setSelectedAnswers({})
    setIsSubmitted(false)
    setScoreResult(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-surface border border-border shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-surface-subtle/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Trophy size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">{testTitle}</h3>
              <p className="text-xs text-text-secondary">
                {chapter.title} • Điểm đạt:{' '}
                <span className="font-bold text-primary">{passingScore}%</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Test Body Questions */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {rawQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-subtle text-text-tertiary">
                <FileQuestion size={32} />
              </div>
              <h4 className="text-sm font-bold text-text-primary">
                Chưa có dữ liệu câu hỏi
              </h4>
              <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                Giáo viên chưa cập nhật danh sách câu hỏi cho phần này của khóa học.
              </p>
            </div>
          ) : (
            <>
              {/* Result Banner after submit */}
              {isSubmitted && scoreResult && (
                <div
                  className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300 ${
                    scoreResult.isPassed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                        scoreResult.isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {scoreResult.isPassed ? (
                        <CheckCircle2 size={24} />
                      ) : (
                        <AlertCircle size={24} />
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold">
                        {scoreResult.isPassed
                          ? '🎉 Chúc mừng! Bạn đã vượt qua bài test!'
                          : '⚡ Chưa đạt điểm chuẩn!'}
                      </h4>
                      <p className="text-xs opacity-90 mt-0.5">
                        Đúng {scoreResult.correctCount}/{scoreResult.totalQuestions} câu (
                        {scoreResult.score}%).{' '}
                        {scoreResult.isPassed
                          ? 'Tiến độ của bạn đã được ghi nhận vào hệ thống!'
                          : `Cần đạt tối thiểu ${passingScore}% để vượt qua.`}
                      </p>
                    </div>
                  </div>

                  {!scoreResult.isPassed && (
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 shrink-0 flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <RotateCcw size={14} />
                      <span>Làm lại</span>
                    </Button>
                  )}
                </div>
              )}

              {/* Question List */}
              {rawQuestions.map((q, qIdx) => {
                const chosen = selectedAnswers[qIdx]
                const options = q.options || q.answers || ['A', 'B', 'C', 'D']
                const correctIdx = getCorrectOptionIndex(q, options)

                return (
                  <div
                    key={qIdx}
                    className="p-5 rounded-2xl border border-border/80 bg-surface space-y-3.5 shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                        {qIdx + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-semibold text-text-primary leading-relaxed">
                        {q.question_text || q.question}
                      </h4>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {options.map((opt, optIdx) => {
                        const isSelected = chosen === optIdx
                        const isCorrect = optIdx === correctIdx

                        let optionClasses =
                          'border-border/80 bg-surface-subtle/40 hover:bg-surface-hover hover:border-primary/40 text-text-primary'

                        if (isSubmitted) {
                          if (isCorrect) {
                            optionClasses =
                              'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                          } else if (isSelected && !isCorrect) {
                            optionClasses =
                              'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold'
                          }
                        } else if (isSelected) {
                          optionClasses =
                            'border-primary bg-primary-soft/60 text-primary font-bold shadow-xs'
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectOption(qIdx, optIdx)}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${optionClasses}`}
                          >
                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                                isSelected
                                  ? 'bg-primary text-white border-primary'
                                  : 'border-border text-text-tertiary bg-surface'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            <span className="flex-1 leading-snug">{opt}</span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Explanation */}
                    {isSubmitted && q.explanation && (
                      <div className="p-3 rounded-xl bg-surface-subtle border border-border/60 text-[11px] text-text-secondary space-y-1">
                        <span className="font-bold text-primary block flex items-center gap-1">
                          <HelpCircle size={12} /> Giải thích chi tiết:
                        </span>
                        <p className="leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-surface-subtle/50 flex items-center justify-between shrink-0">
          <div className="text-xs text-text-tertiary flex items-center gap-1.5">
            <Clock size={14} />
            <span>
              Đã chọn: {Object.keys(selectedAnswers).length}/{rawQuestions.length} câu
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              onClick={onClose}
              className="rounded-xl text-xs font-semibold cursor-pointer"
            >
              {isSubmitted || rawQuestions.length === 0 ? 'Đóng' : 'Hủy bỏ'}
            </Button>

            {rawQuestions.length > 0 && !isSubmitted && (
              <Button
                onClick={handleSubmitTest}
                disabled={Object.keys(selectedAnswers).length === 0}
                className="rounded-xl bg-primary text-white hover:bg-primary-hover px-5 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Nộp bài & Chấm điểm</span>
              </Button>
            )}

            {rawQuestions.length > 0 && isSubmitted && (
              <Button
                onClick={onClose}
                className="rounded-xl bg-primary text-white hover:bg-primary-hover px-5 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
              >
                <span>Tiếp tục học</span>
                <ArrowRight size={14} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
