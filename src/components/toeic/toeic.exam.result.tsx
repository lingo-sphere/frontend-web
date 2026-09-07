/**
 * @file toeic.exam.result.tsx
 * @description Component giao diện React ToeicExamResult cho học viên
 */

import { useTranslation } from 'react-i18next'
import { CheckCircle2, Trophy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ToeicCourseRecommendations,
  type RecommendedCourseItem,
} from '@/components/toeic/toeic.course.recommendations'

import type { LearningRoadmap } from '@/types/api.types'

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

  const statEntries = Object.entries(results.partStats)
  const hasExplicitParts = statEntries.some(([key]) => {
    const n = Number(key)
    return !isNaN(n) && n >= 1 && n <= 7
  })

  return (
    <div className="min-h-screen bg-surface-secondary py-8">
      <div className="mx-auto max-w-4xl px-4">
        <Card className="dashboard-card overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 text-center sm:p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
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
                ? 'Hệ thống đã phân tích độ chính xác từng phần và ước lượng điểm TOEIC chuẩn.'
                : 'System evaluated sectional accuracy and estimated scaled TOEIC score.'}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-surface p-3 text-center shadow-xs">
                <p className="text-xs font-medium text-text-tertiary">
                  {isVietnamese ? 'Điểm TOEIC Ước Tính' : 'Estimated TOEIC'}
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
                  {results.listeningCorrect}/{results.listeningTotal || 100} câu
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3 text-center shadow-xs">
                <p className="text-xs font-medium text-text-tertiary">
                  {isVietnamese ? 'Điểm Reading' : 'Reading Score'}
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-600">{results.estimatedReading}</p>
                <p className="text-[11px] text-text-tertiary">
                  {results.readingCorrect}/{results.readingTotal || 100} câu
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3 text-center shadow-xs">
                <p className="text-xs font-medium text-text-tertiary">
                  {isVietnamese ? 'Độ Chính Xác' : 'Accuracy'}
                </p>
                <p className="mt-1 text-2xl font-black text-amber-600">{results.percentage}%</p>
                <p className="text-[11px] text-text-tertiary">
                  {results.correct}/{results.total} câu đúng
                </p>
              </div>

              {results.estimatedSpeaking !== undefined && (
                <div className="rounded-xl border border-border bg-surface p-3 text-center shadow-xs">
                  <p className="text-xs font-medium text-text-tertiary">
                    {isVietnamese ? 'Điểm Speaking' : 'Speaking Score'}
                  </p>
                  <p className="mt-1 text-2xl font-black text-amber-600">{results.estimatedSpeaking}</p>
                  <p className="text-[11px] text-text-tertiary">
                    / 200 điểm ({results.speakingCompleted || 0}/{results.speakingTotal || 0} bài)
                  </p>
                </div>
              )}

              {results.estimatedWriting !== undefined && (
                <div className="rounded-xl border border-border bg-surface p-3 text-center shadow-xs">
                  <p className="text-xs font-medium text-text-tertiary">
                    {isVietnamese ? 'Điểm Writing' : 'Writing Score'}
                  </p>
                  <p className="mt-1 text-2xl font-black text-purple-600">{results.estimatedWriting}</p>
                  <p className="text-[11px] text-text-tertiary">
                    / 200 điểm ({results.writingCompleted || 0}/{results.writingTotal || 0} bài)
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
                        ? 'border-red-200 bg-red-50/50'
                        : isGood
                          ? 'border-emerald-200 bg-emerald-50/50'
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
                          ? 'bg-red-100 text-red-700'
                          : isGood
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
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
