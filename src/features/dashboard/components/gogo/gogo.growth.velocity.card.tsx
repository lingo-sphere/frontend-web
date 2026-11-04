// Component biểu đồ cột phân tích tốc độ tăng trưởng và nhịp độ luyện tập 7 ngày gần nhất của học viên.
'use client'

import React, { useState } from 'react'
import { ArrowRight, HelpCircle, Activity, Clock, Award, CheckCircle2 } from 'lucide-react'
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
  const [hoveredDayIdx, setHoveredDayIdx] = useState<number | null>(null)

  const thisWeekTotal = timeGrowth?.this_week_total ?? activityOverview?.this_week_questions ?? 0
  const activityGrowthPct = timeGrowth?.activity_growth_pct ?? 0
  const studyVelocity = timeGrowth?.study_velocity ?? 0
  const deltaAccuracy = timeGrowth?.overall_delta_accuracy ?? 0
  const trendLabel = timeGrowth?.trend_label || (deltaAccuracy > 0 ? 'Tăng trưởng tốt' : deltaAccuracy < 0 ? 'Nhịp học chững lại' : 'Nhịp học ổn định')

  const dailyBreakdown = timeGrowth?.daily_breakdown_7d || []
  const maxDayQuestions = Math.max(20, ...dailyBreakdown.map((d) => d.questions_attempted || d.attempts || 0))

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
        <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-primary/10 text-primary">
              <Activity className="w-4 h-4" />
            </span>
            <div>
              <div className="text-sm font-extrabold text-text-primary">
                {thisWeekTotal} câu / 7 ngày
              </div>
              <span className="text-[10px] text-text-tertiary">
                Nhịp học: {studyVelocity} lượt/ngày
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border ${
                activityGrowthPct > 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : activityGrowthPct < 0
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                  : 'bg-surface-subtle text-text-tertiary border-border'
              }`}
            >
              {activityGrowthPct > 0 ? `+${activityGrowthPct}% số lượt` : `${activityGrowthPct}% số lượt`}
            </span>
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border ${
                deltaAccuracy > 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : deltaAccuracy < 0
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                  : 'bg-surface-subtle text-text-tertiary border-border'
              }`}
            >
              {deltaAccuracy > 0 ? `+${deltaAccuracy}% chính xác` : `${deltaAccuracy}% chính xác`}
            </span>
          </div>
        </div>

        <div className="relative pt-4 pb-1">
          <div className="flex items-center justify-between text-[11px] text-text-tertiary mb-3">
            <span>Biểu đồ cột tần suất câu hỏi 7 ngày:</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Đạt chuẩn ≥70%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500/60" />
                Luyện tập
              </span>
            </div>
          </div>

          <div className="h-36 flex items-end justify-between gap-2 sm:gap-4 pt-2 border-b border-border/80 pb-2">
            {dailyBreakdown.slice(-7).map((d, idx) => {
              const questions = d.questions_attempted || d.attempts || 0
              const acc = d.accuracy || 0
              const heightPct = Math.max(8, Math.round((questions / maxDayQuestions) * 100))
              const isHighAcc = acc >= 70 && questions > 0
              const isHovered = hoveredDayIdx === idx

              return (
                <div
                  key={d.date}
                  className="flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer group"
                  onMouseEnter={() => setHoveredDayIdx(idx)}
                  onMouseLeave={() => setHoveredDayIdx(null)}
                >
                  {isHovered && (
                    <div className="absolute -top-12 z-20 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-semibold whitespace-nowrap shadow-md pointer-events-none text-center">
                      <div>{d.day_name || d.date}: {questions} câu</div>
                      <div className="text-[10px] text-emerald-300">
                        {acc}% chính xác • {d.time_spent_formatted || '0m'}
                      </div>
                    </div>
                  )}

                  <div
                    className={`w-full max-w-[36px] rounded-t-xl transition-all duration-300 ${
                      questions === 0
                        ? 'bg-surface-subtle border border-border/80'
                        : isHighAcc
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-2xs'
                        : 'bg-gradient-to-t from-sky-600 to-sky-400 shadow-2xs'
                    } ${isHovered ? 'brightness-110 scale-x-105' : ''}`}
                    style={{ height: `${heightPct}%` }}
                  />

                  <span
                    className={`mt-2 text-[11px] font-bold transition-colors ${
                      isHovered ? 'text-primary' : 'text-text-tertiary'
                    }`}
                  >
                    {d.day_name || d.date.slice(5)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 text-center">
          <div className="p-2.5 rounded-2xl border border-border/60 bg-surface-subtle/40 flex flex-col items-center gap-1">
            <span className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-text-tertiary" />
              Thời gian học
            </span>
            <span className="text-sm font-extrabold text-text-primary">
              {totalTimeFormatted}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl border border-border/60 bg-surface-subtle/40 flex flex-col items-center gap-1">
            <span className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3 h-3 text-text-tertiary" />
              Bài hoàn thành
            </span>
            <span className="text-sm font-extrabold text-text-primary">
              {totalExercises} bài
            </span>
          </div>

          <div className="p-2.5 rounded-2xl border border-border/60 bg-surface-subtle/40 flex flex-col items-center gap-1">
            <span className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-text-tertiary" />
              Tỉ lệ chính xác
            </span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              {accuracyRate > 0 ? `${accuracyRate}%` : '0%'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
