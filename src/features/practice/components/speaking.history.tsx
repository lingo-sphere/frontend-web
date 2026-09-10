/**
 * @file speaking.history.tsx
 * @description Component giao diện React SpeakingHistory cho học viên
 */

import { useTranslation } from 'react-i18next'
import { ArrowLeft, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import type { SpeakingAttempt, SpeakingExercise } from '@/features/practice/types/speaking'

interface SpeakingHistoryProps {
  attempts: SpeakingAttempt[]
  exercises: SpeakingExercise[]
  onBack: () => void
  onViewAttempt: (attempt: SpeakingAttempt) => void
}

export function SpeakingHistory({
  attempts,
  exercises,
  onBack,
  onViewAttempt,
}: SpeakingHistoryProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const groupedAttempts = attempts.reduce((acc, attempt) => {
    if (!acc[attempt.exercise_id]) {
      acc[attempt.exercise_id] = []
    }
    acc[attempt.exercise_id].push(attempt)
    return acc
  }, {} as Record<string, SpeakingAttempt[]>)

  const getScoreBg = (value: number | undefined) => {
    if (!value) return 'bg-surface-subtle text-text-secondary'
    if (value >= 8) return 'bg-emerald-100 text-emerald-700'
    if (value >= 6) return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

      <div className="mb-6">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-[14px] text-text-secondary hover:text-primary"
        >
          <ArrowLeft size={18} />
          {isVietnamese ? 'Quay lại' : 'Back'}
        </button>
        <h1 className="text-[24px] font-bold text-text-primary">
          {isVietnamese ? 'Lịch sử luyện tập' : 'Practice History'}
        </h1>
        <p className="mt-1 text-[14px] text-text-secondary">
          {attempts.length} {isVietnamese ? 'lần luyện' : 'attempts'}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-surface-subtle p-4 text-center">
          <p className="text-[12px] text-text-secondary">{isVietnamese ? 'TB điểm' : 'Avg score'}</p>
          <p className="text-[20px] font-bold text-text-primary">
            {attempts.length > 0
              ? (attempts.reduce((sum, a) => sum + (a.overall_score || 0), 0) / attempts.length).toFixed(1)
              : '-'}
          </p>
        </div>
        <div className="rounded-xl bg-surface-subtle p-4 text-center">
          <p className="text-[12px] text-text-secondary">{isVietnamese ? 'Điểm cao nhất' : 'Best score'}</p>
          <p className="text-[20px] font-bold text-emerald-600">
            {attempts.length > 0
              ? Math.max(...attempts.map(a => a.overall_score || 0)).toFixed(1)
              : '-'}
          </p>
        </div>
        <div className="rounded-xl bg-surface-subtle p-4 text-center">
          <p className="text-[12px] text-text-secondary">{isVietnamese ? 'Tổng thời gian' : 'Total time'}</p>
          <p className="text-[20px] font-bold text-text-primary">
            {attempts.length > 0
              ? Math.round(attempts.reduce((sum, a) => sum + (a.speaking_time_seconds || 0), 0) / 60)
              : 0} {isVietnamese ? 'phút' : 'min'}
          </p>
        </div>
      </div>

      {Object.keys(groupedAttempts).length === 0 ? (
        <div className="py-12 text-center">
          <Clock className="mx-auto mb-4 h-12 w-12 text-text-tertiary" />
          <p className="text-[14px] text-text-secondary">
            {isVietnamese ? 'Chưa có lịch sử luyện tập' : 'No practice history yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedAttempts).map(([exerciseId, exerciseAttempts]) => {
            const exercise = exercises.find(e => e.id === exerciseId)

            return (
              <Card key={exerciseId} className="dashboard-card">
                <CardContent className="p-4">

                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="text-[15px] font-semibold text-text-primary">
                        {exercise?.title || (isVietnamese ? 'Bài tập không xác định' : 'Unknown Exercise')}
                      </h3>
                      <p className="text-[12px] text-text-secondary">
                        {exercise?.title_vi}
                      </p>
                    </div>
                    <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] text-text-secondary">
                      {exerciseAttempts.length} {isVietnamese ? 'lần' : 'times'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {exerciseAttempts.map((attempt) => {
                      const isBest = attempt.is_best_attempt
                      return (
                        <button
                          key={attempt.id}
                          onClick={() => onViewAttempt(attempt)}
                          className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors ${
                            isBest
                              ? 'border-amber-200 bg-amber-50/50'
                              : 'border-border bg-surface-subtle hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`rounded-full px-2.5 py-1 text-[13px] font-semibold ${getScoreBg(attempt.overall_score)}`}>
                              {attempt.overall_score?.toFixed(1) || '-'}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-medium text-text-primary">
                                  {isVietnamese ? 'Lần' : 'Attempt'} {attempt.attempt_number}
                                </span>
                                {isBest && (
                                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                                    {isVietnamese ? 'Tốt nhất' : 'Best'}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-text-tertiary">
                                {new Date(attempt.created_at).toLocaleDateString(isVietnamese ? 'vi-VN' : 'en-US')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">

                            <div className="hidden gap-2 sm:flex">
                              <MiniScore label="PA" value={attempt.pronunciation_score} />
                              <MiniScore label="FL" value={attempt.fluency_score} />
                              <MiniScore label="GR" value={attempt.grammar_score} />
                            </div>
                            <TrendingUp size={16} className="text-text-tertiary" />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </main>
  )
}

function MiniScore({ label, value }: { label: string; value: number | undefined }) {
  if (!value) return null
  const color = value >= 8 ? 'text-emerald-600' : value >= 6 ? 'text-amber-600' : 'text-red-600'
  return (
    <span className={`text-[11px] font-medium ${color}`}>
      {label}: {value.toFixed(1)}
    </span>
  )
}
