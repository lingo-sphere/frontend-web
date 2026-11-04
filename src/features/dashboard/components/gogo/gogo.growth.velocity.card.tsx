// Component hiển thị tốc độ tăng trưởng nhịp học và biểu đồ thanh hoạt động 7 ngày gần nhất.
'use client'

import React from 'react'
import { ArrowRight, HelpCircle } from 'lucide-react'
import type { TimeGrowth, ActivityOverview } from '@/features/progress/services/progress.service'

interface GogoGrowthVelocityCardProps {
  timeGrowth?: TimeGrowth | null
  activityOverview?: ActivityOverview | null
  onViewDetails?: () => void
}

export function GogoGrowthVelocityCard({
  timeGrowth,
  activityOverview,
  onViewDetails,
}: GogoGrowthVelocityCardProps) {
  const thisWeekTotal = timeGrowth?.this_week_total ?? activityOverview?.this_week_questions ?? 0
  const activityGrowthPct = timeGrowth?.activity_growth_pct ?? 0
  const studyVelocity = timeGrowth?.study_velocity ?? 0
  const deltaAccuracy = timeGrowth?.overall_delta_accuracy ?? 0
  const trendLabel = timeGrowth?.trend_label || (deltaAccuracy > 0 ? 'Tăng trưởng tốt' : deltaAccuracy < 0 ? 'Nhịp học chững lại' : 'Nhịp học ổn định')

  const dailyBreakdown = timeGrowth?.daily_breakdown_7d || []

  const totalTimeFormatted = activityOverview?.this_week_time_formatted || '0m'
  const totalExercises = activityOverview?.this_week_exercises ?? 0
  const accuracyRate = activityOverview?.this_week_accuracy !== undefined ? Math.round(activityOverview.this_week_accuracy) : 0

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
            Tốc độ Tăng trưởng & Nhịp học (Growth Velocity)
          </h2>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
              deltaAccuracy > 0
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : deltaAccuracy < 0
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
            }`}
          >
            {trendLabel}
          </span>
        </div>
        {onViewDetails && (
          <button
            type="button"
            onClick={onViewDetails}
            className="text-xs font-semibold text-text-tertiary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Chi tiết</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs flex-1 flex flex-col justify-between space-y-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="p-3 rounded-2xl border border-border/80 bg-surface-subtle/50 text-center">
            <span className="text-[10px] text-text-tertiary block font-semibold uppercase tracking-wider">
              Luyện 7 ngày qua
            </span>
            <div className="flex items-baseline justify-center gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                {thisWeekTotal}
              </span>
              <span className="text-[11px] text-text-tertiary">lượt</span>
            </div>
            <span
              className={`text-[10px] font-bold block mt-0.5 ${
                activityGrowthPct > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : activityGrowthPct < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-text-tertiary'
              }`}
            >
              {activityGrowthPct > 0 ? `+${activityGrowthPct}%` : `${activityGrowthPct}%`}
            </span>
          </div>

          <div className="p-3 rounded-2xl border border-border/80 bg-surface-subtle/50 text-center">
            <span className="text-[10px] text-text-tertiary block font-semibold uppercase tracking-wider">
              Nhịp độ học tập
            </span>
            <div className="flex items-baseline justify-center gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                {studyVelocity}
              </span>
            </div>
            <span className="text-[10px] text-text-secondary block mt-0.5">
              lượt / ngày
            </span>
          </div>

          <div className="p-3 rounded-2xl border border-border/80 bg-surface-subtle/50 text-center">
            <span className="text-[10px] text-text-tertiary block font-semibold uppercase tracking-wider">
              Δ Độ chính xác
            </span>
            <div className="flex items-baseline justify-center gap-1 mt-0.5">
              <span
                className={`text-xl sm:text-2xl font-black tracking-tight ${
                  deltaAccuracy > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : deltaAccuracy < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-text-secondary'
                }`}
              >
                {deltaAccuracy > 0 ? `+${deltaAccuracy}%` : `${deltaAccuracy}%`}
              </span>
            </div>
            <span className="text-[10px] text-text-secondary block mt-0.5">
              so với 7 ngày trước
            </span>
          </div>
        </div>

        {dailyBreakdown.length > 0 ? (
          <div className="space-y-3 p-3.5 rounded-2xl bg-surface-subtle/40 border border-border/70">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-tertiary font-medium">
                Nhịp độ luyện tập 7 ngày qua:
              </span>
              <span className="text-[11px] text-text-tertiary font-medium">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />
                Đạt độ chính xác ≥ 70%
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {dailyBreakdown.slice(-7).map((d) => {
                const questions = d.questions_attempted || d.attempts || 0
                const acc = d.accuracy || 0
                const isHighAcc = acc >= 70 && questions > 0
                const hasActivity = questions > 0

                return (
                  <div key={d.date} className="flex flex-col items-center gap-1.5 text-center group cursor-pointer">
                    <span className="text-[11px] font-semibold text-text-tertiary group-hover:text-text-primary transition-colors">
                      {d.day_name || d.date.slice(5)}
                    </span>
                    <div className="w-full h-1.5 rounded-full bg-surface border border-border overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          !hasActivity
                            ? 'bg-transparent'
                            : isHighAcc
                            ? 'bg-emerald-500'
                            : 'bg-amber-400 dark:bg-amber-500'
                        }`}
                        style={{ width: hasActivity ? '100%' : '0%' }}
                      />
                    </div>
                    <span className="text-[10px] text-text-tertiary font-medium group-hover:text-text-secondary">
                      {questions > 0 ? `${questions}` : '-'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-surface-subtle/30 border border-border/60 text-center text-xs text-text-tertiary flex flex-col items-center justify-center gap-1 py-4">
            <HelpCircle className="w-4 h-4 text-text-tertiary" />
            <p>Chưa có dữ liệu nhịp độ luyện tập trong 7 ngày qua.</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/60 text-center">
          <div className="space-y-0.5">
            <span className="text-[10px] text-text-tertiary block font-medium">
              Thời gian học
            </span>
            <span className="text-sm font-bold text-text-primary">
              {totalTimeFormatted}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-text-tertiary block font-medium">
              Bài tập đã làm
            </span>
            <span className="text-sm font-bold text-text-primary">
              {totalExercises} bài
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-text-tertiary block font-medium">
              Tỉ lệ chính xác
            </span>
            <span className="text-sm font-bold text-text-primary">
              {accuracyRate > 0 ? `${accuracyRate}%` : '0%'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

