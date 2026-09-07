// Hiển thị kết quả thi TOEIC, thống kê đúng sai và đáp án chi tiết.

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Trophy,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Headphones,
  BookOpen,
  Mic,
  PenTool,
  Sparkles,
  Award,
  RotateCcw,
  Compass,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  recommendedRoadmap?: (LearningRoadmap & { stages?: unknown[] }) | null
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

  const listeningPercentage =
    results.listeningTotal > 0 ? Math.round((results.listeningCorrect / results.listeningTotal) * 100) : 0
  const readingPercentage =
    results.readingTotal > 0 ? Math.round((results.readingCorrect / results.readingTotal) * 100) : 0

  return (
    <div className="min-h-screen bg-surface-secondary py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <Card className="dashboard-card overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm bg-surface">
          <div className="bg-gradient-to-b from-primary/10 via-primary/5 to-transparent p-6 sm:p-10 text-center border-b border-border/80">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isVietnamese ? 'KẾT QUẢ ĐÁNH GIÁ NĂNG LỰC TOEIC' : 'TOEIC PLACEMENT RESULT'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary tracking-tight">
              {levelLabel
                ? isVietnamese
                  ? `Trình Độ Hiện Tại: ${levelLabel}`
                  : `Current Proficiency: ${levelLabel}`
                : isVietnamese
                  ? 'Hoàn Thành Bài Kiểm Tra Đánh Giá Năng Lực'
                  : 'Exam Assessment Completed'}
            </h1>

            <p className="mx-auto mt-2 max-w-2xl text-xs sm:text-sm text-text-secondary leading-relaxed">
              {isVietnamese
                ? 'Hệ thống LingoSphere đã phân tích kết quả bài làm và quy đổi sang thang điểm TOEIC chuẩn ETS (10 - 990 điểm) để định vị lộ trình học tập phù hợp nhất.'
                : 'LingoSphere system analyzed your submission and calculated your official ETS TOEIC scaled score (10 - 990) to match suitable learning pathways.'}
            </p>

            <div className="mt-8 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-stretch">
                <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-5 flex flex-col justify-between text-left shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        <Headphones className="w-4 h-4" />
                        <span>{isVietnamese ? 'KỸ NĂNG NGHE' : 'LISTENING'}</span>
                      </span>
                      <span className="text-[11px] font-semibold text-text-tertiary">Thang điểm 495</span>
                    </div>

                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                        {results.estimatedListening}
                      </span>
                      <span className="text-xs font-bold text-text-tertiary">/ 495</span>
                    </div>

                    <p className="mt-1 text-xs text-text-secondary">
                      {isVietnamese ? 'Số câu trả lời đúng:' : 'Correct answers:'}{' '}
                      <strong className="text-text-primary font-bold">
                        {results.listeningCorrect} / {results.listeningTotal}
                      </strong>
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] font-medium text-text-tertiary mb-1">
                      <span>{isVietnamese ? 'Độ chính xác' : 'Accuracy'}</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{listeningPercentage}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                        style={{ width: `${listeningPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-primary/40 bg-surface p-6 flex flex-col justify-between items-center text-center shadow-md relative overflow-hidden group">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-primary to-emerald-500" />

                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <Trophy className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-text-tertiary block">
                      {isVietnamese ? 'TỔNG ĐIỂM TOEIC QUY ĐỔI' : 'TOTAL ESTIMATED TOEIC'}
                    </span>

                    <div className="my-2 flex items-baseline justify-center gap-1.5">
                      <span className="text-5xl sm:text-6xl font-black text-primary tracking-tight">
                        {results.estimatedTotal}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-text-tertiary">/ 990</span>
                    </div>

                    {targetBand && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                        <Award className="w-3.5 h-3.5" />
                        <span>Mục tiêu: {targetBand}</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 w-full text-center">
                    <span className="text-[11px] font-medium text-text-tertiary">
                      {isVietnamese
                        ? `Quy đổi ETS chuẩn (${results.percentage}% độ chính xác toàn bài)`
                        : `ETS Scaled (${results.percentage}% overall accuracy)`}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 flex flex-col justify-between text-left shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        <BookOpen className="w-4 h-4" />
                        <span>{isVietnamese ? 'KỸ NĂNG ĐỌC' : 'READING'}</span>
                      </span>
                      <span className="text-[11px] font-semibold text-text-tertiary">Thang điểm 495</span>
                    </div>

                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                        {results.estimatedReading}
                      </span>
                      <span className="text-xs font-bold text-text-tertiary">/ 495</span>
                    </div>

                    <p className="mt-1 text-xs text-text-secondary">
                      {isVietnamese ? 'Số câu trả lời đúng:' : 'Correct answers:'}{' '}
                      <strong className="text-text-primary font-bold">
                        {results.readingCorrect} / {results.readingTotal}
                      </strong>
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] font-medium text-text-tertiary mb-1">
                      <span>{isVietnamese ? 'Độ chính xác' : 'Accuracy'}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{readingPercentage}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-500"
                        style={{ width: `${readingPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {(results.estimatedSpeaking !== undefined || results.estimatedWriting !== undefined) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-left">
                  {results.estimatedSpeaking !== undefined && (
                    <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                          <Mic className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                            {isVietnamese ? 'Kỹ Năng Nói (Speaking)' : 'Speaking Skill'}
                          </p>
                          <p className="text-[11px] text-text-secondary">
                            {results.speakingCompleted ?? 0}/{results.speakingTotal ?? 0} bài đã nộp
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                          {results.estimatedSpeaking}
                        </span>
                        <span className="text-xs font-semibold text-text-tertiary"> / 200</span>
                      </div>
                    </div>
                  )}

                  {results.estimatedWriting !== undefined && (
                    <div className="p-4 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                          <PenTool className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-purple-800 dark:text-purple-300">
                            {isVietnamese ? 'Kỹ Năng Viết (Writing)' : 'Writing Skill'}
                          </p>
                          <p className="text-[11px] text-text-secondary">
                            {results.writingCompleted ?? 0}/{results.writingTotal ?? 0} bài đã nộp
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                          {results.estimatedWriting}
                        </span>
                        <span className="text-xs font-semibold text-text-tertiary"> / 200</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20">
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block">
                  {isVietnamese ? 'Số câu đúng' : 'Correct'}
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {results.correct}
                  <span className="text-xs font-medium text-text-tertiary"> / {results.total}</span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/20">
                <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 block">
                  {isVietnamese ? 'Số câu sai' : 'Incorrect'}
                </span>
                <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5 block">
                  {incorrectCount}
                  <span className="text-xs font-medium text-text-tertiary"> / {results.total}</span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20">
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 block">
                  {isVietnamese ? 'Độ chính xác' : 'Accuracy'}
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
                  {results.percentage}%
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-surface-subtle">
                <span className="text-[11px] font-semibold text-text-tertiary block">
                  {isVietnamese ? 'Xếp loại' : 'Rating'}
                </span>
                <span className="text-sm sm:text-base font-bold text-text-primary mt-1 block truncate">
                  {levelLabel || (results.percentage >= 70 ? 'Khá' : results.percentage >= 50 ? 'Trung bình' : 'Cần cố gắng')}
                </span>
              </div>
            </div>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-bold text-text-primary">
                {hasExplicitParts
                  ? isVietnamese
                    ? 'Phân Tích Chi Tiết Từng Part (Thang Điểm & Độ Chính Xác)'
                    : 'Sectional Accuracy (Part 1 - Part 7)'
                  : isVietnamese
                    ? 'Phân Tích Chi Tiết Từng Kỹ Năng'
                    : 'Skill Performance Breakdown'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
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
                      className={`flex flex-col items-center rounded-2xl border p-3 text-center transition-all ${
                        isWeak
                          ? 'border-red-200/80 bg-red-50/40 dark:border-red-900/40 dark:bg-red-950/20'
                          : isGood
                            ? 'border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                            : 'border-slate-200/80 bg-surface-subtle dark:border-slate-800'
                      }`}
                    >
                      <span className="text-xs font-bold text-text-primary">{label}</span>
                      <span
                        className={`my-1 text-lg font-black ${
                          isWeak ? 'text-red-600' : isGood ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {acc}%
                      </span>
                      <span className="text-[11px] text-text-tertiary font-medium">
                        {stat.correct}/{stat.total} câu
                      </span>
                      <span
                        className={`mt-1.5 rounded-full px-2 py-0.5 text-[9px] font-bold ${
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
            </div>

            <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <Button variant="outline" className="gap-2 font-bold text-xs h-10 px-4 rounded-xl" onClick={onRetry}>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isVietnamese ? 'Làm Lại Bài Thi' : 'Try Again'}</span>
                </Button>
                <Button variant="outline" className="gap-2 font-bold text-xs h-10 px-4 rounded-xl" onClick={onChooseAnother}>
                  <Compass className="w-3.5 h-3.5" />
                  <span>{isVietnamese ? 'Chọn Đề Thi Khác' : 'Choose Another'}</span>
                </Button>
              </div>

              <div className="text-xs text-text-tertiary font-medium">
                {isVietnamese ? 'Điểm thi đã được cập nhật vào hồ sơ năng lực của bạn' : 'Score saved to your learning profile'}
              </div>
            </div>
          </CardContent>
        </Card>

        <ToeicCourseRecommendations
          recommendedRoadmap={recommendedRoadmap}
          courses={recommendedCourses}
          targetBand={targetBand}
          levelLabel={levelLabel}
          isLoading={isLoadingRecommendations}
          baselineScore={results.estimatedTotal}
        />

        {questions && questions.length > 0 && (
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
                            {q.questionNumber}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
                                Part {q.partNumber || 1}
                              </span>
                              {q.skillType && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-subtle text-text-tertiary">
                                  {q.skillType}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-text-primary font-medium">
                              {q.questionTextEn || q.questionTextVi || ''}
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
                            onClick={() => toggleQuestionExpand(q.questionNumber)}
                            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
                          >
                            {expandedQuestions[q.questionNumber] ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      {q.options && q.options.length > 0 && (
                        <div className="mt-3.5 space-y-2 pl-9">
                          {q.options.map((opt) => {
                            const isCorrectOption = opt.key.trim().toUpperCase() === q.correctOption.trim().toUpperCase()
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
      </div>
    </div>
  )
}
