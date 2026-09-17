// Hiển thị kết quả thi TOEIC, thống kê đúng sai và đáp án chi tiết.

'use client'

import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/card'
import {
  ToeicCourseRecommendations,
  type RecommendedCourseItem,
} from '@/features/toeic/components/toeic.course.recommendations'
import type { ToeicQuestion } from '@/features/toeic/types/toeic'
import { ToeicScoreOverview } from '@/features/toeic/components/toeic.score.overview'
import { ToeicPartBreakdown } from '@/features/toeic/components/toeic.part.breakdown'
import { ToeicQuestionsReview } from '@/features/toeic/components/toeic.questions.review'

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
  recommendedCourses: RecommendedCourseItem[]
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
  evaluatedAnswers = {},
  isEvaluatingAI = false,
  recommendedCourses,
  targetBand,
  levelLabel,
  isLoadingRecommendations = false,
  onRetry,
  onChooseAnother,
}: ToeicExamResultProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const statEntries = Object.entries(results.partStats)
  const hasExplicitParts = statEntries.some(([key]) => {
    const n = Number(key)
    return !isNaN(n) && n >= 1 && n <= 7
  })

  const incorrectCount = Math.max(0, results.total - results.correct)

  return (
    <main className="w-full min-h-screen bg-surface-secondary px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6 sm:space-y-8">
      <Card className="dashboard-card overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm bg-surface">
        <ToeicScoreOverview
          results={results}
          levelLabel={levelLabel}
          targetBand={targetBand}
          isVietnamese={isVietnamese}
        />

        <CardContent className="p-0">
          <ToeicPartBreakdown
            results={results}
            statEntries={statEntries}
            hasExplicitParts={hasExplicitParts}
            isVietnamese={isVietnamese}
            onRetry={onRetry}
            onChooseAnother={onChooseAnother}
          />
        </CardContent>
      </Card>

      <ToeicCourseRecommendations
        courses={recommendedCourses}
        targetBand={targetBand}
        levelLabel={levelLabel}
        isLoading={isLoadingRecommendations}
      />

      <ToeicQuestionsReview
        questions={questions}
        userAnswers={userAnswers}
        evaluatedAnswers={evaluatedAnswers}
        isEvaluatingAI={isEvaluatingAI}
        correctCount={results.correct}
        incorrectCount={incorrectCount}
        isVietnamese={isVietnamese}
      />
    </main>
  )
}
