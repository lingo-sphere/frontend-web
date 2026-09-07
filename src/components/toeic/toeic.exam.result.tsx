// Hiển thị kết quả thi TOEIC, thống kê đúng sai và đáp án chi tiết.

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Trophy, XCircle, AlertCircle, CheckCircle, HelpCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ToeicCourseRecommendations,
  type RecommendedCourseItem,
} from '@/components/toeic/toeic.course.recommendations'

import type { LearningRoadmap } from '@/types/api.types'
import type { ToeicQuestion } from '@/types/toeic'

export interface ExamResultMetrics {
  correct: number
  total: number
  percentage: number
  listeningCorrect: number
  listeningTotal: number
  readingCorrect: number
  readingTotal: number
  estimatedListening: number
  estimatedReading: number
  estimatedTotal: number
  partStats: Record<string | number, { correct: number; total: number }>
  speakingTotal?: number
  speakingCompleted?: number
  estimatedSpeaking?: number
  writingTotal?: number
  writingCompleted?: number
  estimatedWriting?: number
}

interface ToeicExamResultProps {
  results: ExamResultMetrics
  questions?: ToeicQuestion[]
  userAnswers?: Record<number, string>
  recommendedCourses: RecommendedCourseItem[]
  recommendedRoadmap?: (LearningRoadmap & { stages?: any[] }) | null
  targetBand?: string
  levelLabel?: string
  isLoadingRecommendations?: boolean
  onRetry: () => void
  onChooseAnother: () => void
}

export function ToeicExamResult({
  results,
  questions = [],
  userAnswers = {},
  recommendedCourses,
  recommendedRoadmap,
  targetBand,
  levelLabel,
  isLoadingRecommendations = false,
  onRetry,
  onChooseAnother,
}: ToeicExamResultProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'UNANSWERED'>('ALL')
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({})

  const statEntries = Object.entries(results.partStats)
  const hasExplicitParts = statEntries.some(([key]) => {
    const n = Number(key)
    return !isNaN(n) && n >= 1 && n <= 7
  })

  const incorrectCount = Math.max(0, results.total - results.correct)

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
        if (reviewFilter === 'UNANSWERED') return !isAnswered
        return true
      }

      const isCorrect = isAnswered && selected.trim().toUpperCase() === q.correctOption.trim().toUpperCase()
      const isWrong = isAnswered && !isCorrect

      if (reviewFilter === 'CORRECT') return isCorrect
      if (reviewFilter === 'WRONG') return isWrong
      if (reviewFilter === 'UNANSWERED') return !isAnswered
      return true
    })
  }, [questions, userAnswers, reviewFilter])

  return (
    <div className="min-h-screen bg-surface-secondary py-8">
      <div className="mx-auto max-w-4xl px-4 space-y-6">
        <Card className="dashboard-card overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 text-center sm:p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
              <Trophy size={32} />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              {levelLabel
                ? isVietnamese
                  ? `Đánh Giá Năng Lực: ${levelLabel}`
                  : `Proficiency Level: ${levelLabel}`
                : isVietnamese
                  ? 'Hoàn Thành Bài Thi!'
                  : 'Exam Completed!'}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
              {isVietnamese
                ? 'Hệ thống đã phân tích độ chính xác từng phần, thống kê câu đúng sai và ước lượng điểm chuẩn.'
                : 'System evaluated sectional accuracy, correct/incorrect metrics, and estimated scaled score.'}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-xl border border-border bg-surface p-3 text-center shadow-xs">
                <p className="text-xs font-medium text-text-tertiary">
                  {isVietnamese ? 'Điểm TOEIC' : 'Estimated TOEIC'}
                </p>
                <p className="mt-1 text-2xl font-black text-primary">{results.estimatedTotal}</p>
                <p className="text-[11px] text-text-tertiary">/ 990 điểm</p>
              </div>

              <div className="rounded-xl border border-border bg-surface p-3 text-center shadow-xs">
                <p className="text-xs font-medium text-text-tertiary">
                  {isVietnamese ? 'Điểm Listening' : 'Listening Score'}
                </p>
                <p className="mt-1 text-2xl font-black text-indigo-600">{results.estimatedListening}</p>
                <p className="text-[11px] text-text-tertiary">
                  {results.listeningCorrect}/{results.listeningTotal} câu
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface p-3 text-center shadow-xs">
                <p className="text-xs font-medium text-text-tertiary">
                  {isVietnamese ? 'Điểm Reading' : 'Reading Score'}
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-600">{results.estimatedReading}</p>
                <p className="text-[11px] text-text-tertiary">
                  {results.readingCorrect}/{results.readingTotal} câu
                </p>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 p-3 text-center shadow-xs">
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  {isVietnamese ? 'Số câu đúng' : 'Correct'}
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {results.correct}
                </p>
                <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  / {results.total} câu
                </p>
              </div>

              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/20 p-3 text-center shadow-xs">
                <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
                  {isVietnamese ? 'Số câu sai' : 'Incorrect'}
                </p>
                <p className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">
                  {incorrectCount}
                </p>
                <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                  / {results.total} câu
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface p-3 text-center shadow-xs">
                <p className="text-xs font-medium text-text-tertiary">
                  {isVietnamese ? 'Độ Chính Xác' : 'Accuracy'}
                </p>
                <p className="mt-1 text-2xl font-black text-amber-600">{results.percentage}%</p>
                <p className="text-[11px] text-text-tertiary">tỷ lệ đạt</p>
              </div>

              {results.estimatedSpeaking !== undefined && (
                <div className="rounded-xl border border-border bg-surface p-3 text-center shadow-xs col-span-1 sm:col-span-3 lg:col-span-3">
                  <p className="text-xs font-medium text-text-tertiary">
                    {isVietnamese ? 'Điểm Speaking' : 'Speaking Score'}
                  </p>
                  <p className="mt-1 text-2xl font-black text-amber-600">{results.estimatedSpeaking}</p>
                  <p className="text-[11px] text-text-tertiary">
                    / 200 điểm ({results.speakingCompleted ?? 0}/{results.speakingTotal ?? 0} bài)
                  </p>
                </div>
              )}

              {results.estimatedWriting !== undefined && (
                <div className="rounded-xl border border-border bg-surface p-3 text-center shadow-xs col-span-1 sm:col-span-3 lg:col-span-3">
                  <p className="text-xs font-medium text-text-tertiary">
                    {isVietnamese ? 'Điểm Writing' : 'Writing Score'}
                  </p>
                  <p className="mt-1 text-2xl font-black text-purple-600">{results.estimatedWriting}</p>
                  <p className="text-[11px] text-text-tertiary">
                    / 200 điểm ({results.writingCompleted ?? 0}/{results.writingTotal ?? 0} bài)
                  </p>
                </div>
              )}
            </div>
          </div>

          <CardContent className="p-6">
            <h3 className="mb-3 text-sm font-bold text-text-primary">
              {hasExplicitParts
                ? isVietnamese
                  ? 'Phân Tích Chi Tiết Từng Part'
                  : 'Part-by-Part Performance'
                : isVietnamese
                  ? 'Phân Tích Chi Tiết Từng Kỹ Năng'
                  : 'Skill-by-Skill Performance'}
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {statEntries.map(([partStr, stat]) => {
                let label = partStr
                const num = Number(partStr)
                if (!isNaN(num) && num >= 1 && num <= 7) {
                  label = `Part ${num}`
                } else if (partStr.toLowerCase() === 'listening') {
                  label = isVietnamese ? 'Kỹ năng Nghe' : 'Listening'
                } else if (partStr.toLowerCase() === 'reading') {
                  label = isVietnamese ? 'Kỹ năng Đọc' : 'Reading'
                } else if (partStr.toLowerCase() === 'speaking') {
                  label = isVietnamese ? 'Kỹ năng Nói' : 'Speaking'
                } else if (partStr.toLowerCase() === 'writing') {
                  label = isVietnamese ? 'Kỹ năng Viết' : 'Writing'
                }

                const acc = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0
                const isGood = acc >= 70
                const isWeak = acc < 50

                return (
                  <div
                    key={partStr}
                    className={`flex flex-col items-center rounded-xl border p-2.5 text-center transition-all ${
                      isWeak
                        ? 'border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20'
                        : isGood
                          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                          : 'border-border bg-surface-subtle'
                    }`}
                  >
                    <span className="text-xs font-bold text-text-primary">{label}</span>
                    <span
                      className={`my-1 text-base font-extrabold ${
                        isWeak ? 'text-red-600' : isGood ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {acc}%
                    </span>
                    <span className="text-[11px] text-text-tertiary">
                      {stat.correct}/{stat.total}
                    </span>
                    <span
                      className={`mt-1 rounded px-1 py-0.5 text-[9px] font-semibold ${
                        isWeak
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300'
                          : isGood
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                      }`}
                    >
                      {isWeak
                        ? isVietnamese
                          ? 'Yếu'
                          : 'Weak'
                        : isGood
                          ? isVietnamese
                            ? 'Tốt'
                            : 'Good'
                          : isVietnamese
                            ? 'Trung bình'
                            : 'Average'}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="outline" className="flex-1 font-semibold" onClick={onRetry}>
                {isVietnamese ? 'Làm Lại Bài Thi' : 'Try Again'}
              </Button>
              <Button
                className="flex-1 gap-2 bg-primary font-semibold text-white hover:bg-primary-hover"
                onClick={onChooseAnother}
              >
                {isVietnamese ? 'Chọn Đề Khác' : 'Choose Another'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {questions && questions.length > 0 && (
          <Card className="dashboard-card overflow-hidden">
            <CardContent className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-text-primary">
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
                    Làm đúng ({results.correct})
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
                {filteredQuestions.map((q) => {
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
                  const isCorrect = isAnswered && selected.trim().toUpperCase() === q.correctOption.trim().toUpperCase()

                  return (
                    <div
                      key={q.id || q.questionNumber}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isWriting || isSpeaking
                          ? 'border-border bg-surface'
                          : isCorrect
                          ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10'
                          : isAnswered
                          ? 'border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/10'
                          : 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-xs">
                            {q.questionNumber}
                          </span>
                          {q.partNumber && (
                            <Badge variant="outline" className="text-[11px] font-semibold">
                              {typeof q.partNumber === 'number' ? `Part ${q.partNumber}` : String(q.partNumber)}
                            </Badge>
                          )}
                          {q.skillType && (
                            <Badge variant="secondary" className="text-[11px]">
                              {q.skillType}
                            </Badge>
                          )}
                        </div>

                        <div>
                          {isWriting || isSpeaking ? (
                            <Badge className="bg-purple-600 text-white text-xs">
                              {isWriting ? 'Bài viết luận' : 'Bài ghi âm nói'}
                            </Badge>
                          ) : isCorrect ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
                              <CheckCircle size={13} /> Làm đúng
                            </span>
                          ) : isAnswered ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-500/15 px-2.5 py-1 rounded-full border border-rose-500/30">
                              <XCircle size={13} /> Làm sai
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/30">
                              <AlertCircle size={13} /> Chưa làm
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-sm font-semibold text-text-primary leading-relaxed pl-9 mb-3">
                        {q.questionTextEn}
                      </p>

                      {q.imageMediaId && (
                        <div className="ml-9 my-3 max-w-md overflow-hidden rounded-xl border border-border">
                          <img
                            src={q.imageMediaId}
                            alt={`Question ${q.questionNumber}`}
                            className="w-full object-contain max-h-60"
                          />
                        </div>
                      )}

                      {q.audioMediaId && (
                        <div className="ml-9 my-3 max-w-md overflow-hidden rounded-xl border border-border bg-surface-subtle p-2">
                          <audio controls src={q.audioMediaId} className="w-full h-9" />
                        </div>
                      )}

                      {isWriting ? (
                        <div className="ml-9 mt-3 p-3.5 rounded-xl border border-border bg-surface space-y-1.5">
                          <span className="text-xs font-bold text-text-primary block">
                            Bài làm của bạn:
                          </span>
                          <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                            {selected || 'Bạn chưa nộp nội dung bài viết.'}
                          </p>
                        </div>
                      ) : isSpeaking ? (
                        <div className="ml-9 mt-3 p-3.5 rounded-xl border border-border bg-surface space-y-2">
                          <span className="text-xs font-bold text-text-primary block">
                            Bản thu âm của bạn:
                          </span>
                          {selected && (selected.startsWith('data:audio') || selected.startsWith('http')) ? (
                            <audio controls src={selected} className="w-full max-w-sm h-9" />
                          ) : (
                            <p className="text-xs text-text-secondary">
                              {selected || 'Chưa có bản ghi âm cho câu này.'}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="ml-9 space-y-2">
                          {q.options?.map((opt) => {
                            const isCorrectOption = opt.key.trim().toUpperCase() === q.correctOption.trim().toUpperCase()
                            const isUserSelected = isAnswered && selected.trim().toUpperCase() === opt.key.trim().toUpperCase()

                            return (
                              <div
                                key={opt.key}
                                className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 transition-colors ${
                                  isCorrectOption
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-bold'
                                    : isUserSelected && !isCorrectOption
                                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 line-through'
                                    : 'border-border bg-surface text-text-secondary'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                      isCorrectOption
                                        ? 'bg-emerald-500 text-white'
                                        : isUserSelected
                                        ? 'bg-rose-500 text-white'
                                        : 'bg-surface-subtle text-text-tertiary'
                                    }`}
                                  >
                                    {opt.key}
                                  </span>
                                  <span>{opt.textEn}</span>
                                </div>

                                <div className="shrink-0 flex items-center gap-2">
                                  {isCorrectOption && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                                      Đáp án đúng
                                    </span>
                                  )}
                                  {isUserSelected && !isCorrectOption && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                                      Bạn đã chọn
                                    </span>
                                  )}
                                  {isUserSelected && isCorrectOption && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                                      Bạn chọn chính xác
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {(q.explanationEn || q.explanationVi) && (
                        <div className="ml-9 mt-3.5 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                          <span className="font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                            💡 Giải thích đáp án chi tiết:
                          </span>
                          {q.explanationEn && (
                            <p className="text-[11.5px] leading-relaxed pl-4 font-medium">
                              {q.explanationEn}
                            </p>
                          )}
                          {q.explanationVi && (
                            <p className="text-[11.5px] leading-relaxed pl-4 font-medium italic">
                              {q.explanationVi}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <ToeicCourseRecommendations
          recommendedRoadmap={recommendedRoadmap}
          courses={recommendedCourses}
          targetBand={targetBand}
          levelLabel={levelLabel}
          isLoading={isLoadingRecommendations}
          baselineScore={results.estimatedTotal}
        />
      </div>
    </div>
  )
}
