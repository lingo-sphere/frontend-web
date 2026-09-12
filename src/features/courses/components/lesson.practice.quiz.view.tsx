// Component giao dien lam bai trac nghiem on tap cung co kien thuc theo bai hoc danh cho hoc vien.

'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Award,
  Sparkles,
  BookOpen,
  Volume2,
} from 'lucide-react'
import type { LessonQuestion } from '@/features/courses/types/course'

interface LessonPracticeQuizViewProps {
  questions?: LessonQuestion[]
  lessonTitle?: string
}

export function LessonPracticeQuizView({
  questions = [],
  lessonTitle,
}: LessonPracticeQuizViewProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-surface border border-border text-center space-y-4 max-w-xl mx-auto my-6 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto ring-8 ring-amber-500/5">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-extrabold text-text-primary">
            Chưa có câu hỏi ôn tập
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Bài học này hiện chưa được cấu hình bộ câu hỏi trắc nghiệm ôn tập. Bạn có thể xem video và tham khảo tài liệu đính kèm ở các tab bên cạnh.
          </p>
        </div>
      </div>
    )
  }

  const handleSelectOption = (qIdx: number, optLetter: string) => {
    if (isSubmitted) return
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optLetter }))
  }

  const correctCount = questions.reduce((count, q, idx) => {
    const chosen = selectedAnswers[idx]
    const correct = (q.correct_answer || '').trim().toUpperCase()
    return chosen && chosen.toUpperCase() === correct ? count + 1 : count
  }, 0)

  const answeredCount = Object.keys(selectedAnswers).length
  const totalCount = questions.length
  const scorePercent = Math.round((correctCount / totalCount) * 100)

  const handleReset = () => {
    setSelectedAnswers({})
    setIsSubmitted(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
              Ôn Tập & Củng Cố
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-text-primary">
            {lessonTitle ? `Bài ôn tập: ${lessonTitle}` : 'Trắc nghiệm ôn tập bài học'}
          </h2>
          <p className="text-xs text-text-secondary">
            Gồm {totalCount} câu hỏi giúp ghi nhớ các từ vựng và ngữ pháp trọng tâm.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSubmitted ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border shadow-xs">
              <Award className="w-5 h-5 text-amber-500" />
              <div>
                <div className="text-[11px] text-text-tertiary font-medium">Kết quả đạt được</div>
                <div className="text-xs sm:text-sm font-black text-text-primary">
                  {correctCount} / {totalCount} câu ({scorePercent}%)
                </div>
              </div>
            </div>
          ) : (
            <div className="text-right">
              <span className="text-xs font-bold text-text-secondary">
                Đã trả lời: <strong className="text-primary">{answeredCount}</strong> / {totalCount}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const chosen = selectedAnswers[idx]
          const correct = (q.correct_answer || '').trim().toUpperCase()
          const isQuestionCorrect = isSubmitted && chosen && chosen.toUpperCase() === correct
          const isQuestionWrong = isSubmitted && chosen && chosen.toUpperCase() !== correct
          const isMissed = isSubmitted && !chosen

          return (
            <div
              key={q.id || `quiz-q-${idx}`}
              className={`p-5 sm:p-6 rounded-2xl border transition-all bg-surface ${
                isSubmitted
                  ? isQuestionCorrect
                    ? 'border-emerald-500/40 dark:border-emerald-500/30 ring-1 ring-emerald-500/10'
                    : 'border-rose-500/40 dark:border-rose-500/30 ring-1 ring-rose-500/10'
                  : 'border-border hover:border-primary/40 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-extrabold text-xs">
                    Câu {idx + 1}
                  </span>
                  {isSubmitted && (
                    <>
                      {isQuestionCorrect && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" /> Chính xác
                        </span>
                      )}
                      {isQuestionWrong && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                          <XCircle className="w-4 h-4" /> Chưa chính xác
                        </span>
                      )}
                      {isMissed && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                          <HelpCircle className="w-4 h-4" /> Chưa chọn đáp án
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm sm:text-base font-semibold text-text-primary leading-relaxed whitespace-pre-wrap">
                  {q.question_text}
                </p>

                {(q.audio_url || q.media_url) && (
                  <div className="p-3 rounded-xl bg-background border border-border flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-primary shrink-0" />
                    <audio
                      controls
                      src={q.audio_url || q.media_url || ''}
                      className="w-full h-8"
                    />
                  </div>
                )}

                {q.image_url && (
                  <div className="rounded-xl overflow-hidden border border-border max-w-md">
                    <img
                      src={q.image_url}
                      alt={`Minh họa câu ${idx + 1}`}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {(q.options || []).map((optText, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx)
                    const isChosen = chosen === letter
                    const isThisCorrect = letter === correct

                    let cardStyle =
                      'border-border hover:border-primary/50 hover:bg-primary/5 text-text-primary bg-background'

                    if (isSubmitted) {
                      if (isThisCorrect) {
                        cardStyle =
                          'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                      } else if (isChosen && !isThisCorrect) {
                        cardStyle =
                          'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 line-through'
                      } else {
                        cardStyle = 'border-border/50 text-text-tertiary bg-background/50'
                      }
                    } else if (isChosen) {
                      cardStyle =
                        'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                    }

                    return (
                      <button
                        key={`${q.id || idx}-opt-${letter}`}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => handleSelectOption(idx, letter)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs sm:text-sm transition-all cursor-pointer ${cardStyle}`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                            isSubmitted && isThisCorrect
                              ? 'bg-emerald-600 text-white'
                              : isSubmitted && isChosen && !isThisCorrect
                              ? 'bg-rose-600 text-white'
                              : isChosen
                              ? 'bg-primary text-white'
                              : 'bg-surface border border-border text-text-secondary'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="flex-1 leading-snug">{optText}</span>
                      </button>
                    )
                  })}
                </div>

                {isSubmitted && q.explanation && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs sm:text-sm text-text-secondary space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-primary">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Lời giải chi tiết:</span>
                    </div>
                    <p className="leading-relaxed pl-5 whitespace-pre-wrap">{q.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-surface border border-border">
        {isSubmitted ? (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-background hover:bg-surface-hover text-text-primary border border-border font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm lại bài ôn tập</span>
          </button>
        ) : (
          <div className="text-xs text-text-tertiary">
            Hãy trả lời các câu hỏi trước khi bấm kiểm tra đáp án.
          </div>
        )}

        {!isSubmitted && (
          <button
            type="button"
            onClick={() => setIsSubmitted(true)}
            disabled={answeredCount === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs shadow-md transition-all cursor-pointer ml-auto"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Kiểm tra đáp án</span>
          </button>
        )}
      </div>
    </div>
  )
}
