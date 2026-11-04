// Component trực quan hóa nhật ký luyện tập ngày của học viên với biểu đồ vòng tròn mục tiêu và các thanh đo chỉ số.
'use client'

import React from 'react'
import { Calendar, ArrowRight, CheckCircle2, Clock, CheckSquare, Target, Flame } from 'lucide-react'
import type { TimeGrowth } from '@/features/progress/services/progress.service'

interface GogoDailyPracticeCardProps {
  dailyBreakdown?: TimeGrowth['daily_breakdown_7d']
  onViewAll?: () => void
}

function DailyGoalRadial({
  percent,
  size = 96,
  strokeWidth = 8,
}: {
  percent: number
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, percent))
  const strokeDashoffset = circumference - (clamped / 100) * circumference

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border/40"
        />
        {clamped > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#dailyGoalGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        )}
        <defs>
          <linearGradient id="dailyGoalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-base font-black text-text-primary tracking-tight">
          {clamped}%
        </span>
        <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-wider">
          Mục tiêu
        </span>
      </div>
    </div>
  )
}

export function GogoDailyPracticeCard({
  dailyBreakdown = [],
  onViewAll,
}: GogoDailyPracticeCardProps) {
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayData = dailyBreakdown.find((d) => d.date === todayStr) || dailyBreakdown[dailyBreakdown.length - 1]

  const timeSpent = todayData?.time_spent_formatted || '0m'
  const timeMinutes = todayData?.time_spent_seconds ? Math.round(todayData.time_spent_seconds / 60) : 0
  const exercises = todayData?.exercises_count ?? 0
  const attempts = todayData?.questions_attempted ?? todayData?.attempts ?? 0
  const accuracy = todayData?.accuracy !== undefined && attempts > 0 ? Math.round(todayData.accuracy) : null
  const hasPracticed = attempts > 0

  const TARGET_MINUTES = 30
  const TARGET_EXERCISES = 3

  const timePct = Math.min(100, Math.round((timeMinutes / TARGET_MINUTES) * 100))
  const exercisePct = Math.min(100, Math.round((exercises / TARGET_EXERCISES) * 100))
  const accuracyPct = accuracy !== null ? accuracy : 0

  const overallDailyGoal = Math.round((timePct * 0.4) + (exercisePct * 0.4) + (accuracyPct * 0.2))

  const todayDateFormatted = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
  }).format(new Date())

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
          Nhật ký luyện tập hôm nay
        </h2>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-text-tertiary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Báo cáo kỹ năng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs flex-1 flex flex-col justify-between space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-text-primary capitalize">
                  {todayDateFormatted}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
                  Hôm nay
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    hasPracticed
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  }`}
                >
                  {hasPracticed ? 'Đã rèn luyện' : 'Chưa luyện tập'}
                </span>
              </div>
              <p className="text-[11px] text-text-tertiary mt-0.5">
                {hasPracticed
                  ? 'Tuyệt vời! Bạn đã duy trì nhịp độ học tập hàng ngày.'
                  : 'Hãy làm ít nhất 1 bài tập hoặc ôn từ vựng để giữ chuỗi phong độ.'}
              </p>
            </div>
          </div>

          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>Xem danh sách bài ngày này</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-2xl bg-surface-subtle/50 border border-border/70">
          <div className="flex flex-col items-center justify-center gap-2 shrink-0 pr-0 md:pr-4 md:border-r md:border-border/60">
            <DailyGoalRadial percent={overallDailyGoal} />
            <span className="text-[11px] font-bold text-text-secondary">
              Hoàn thành chỉ tiêu ngày
            </span>
          </div>

          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 p-3 rounded-xl bg-surface border border-border/60">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-text-secondary font-semibold">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Thời gian học</span>
                </div>
                <span className="font-extrabold text-text-primary">
                  {timeSpent} <span className="text-[10px] text-text-tertiary font-normal">/ {TARGET_MINUTES}m</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-subtle overflow-hidden border border-border/40">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-700"
                  style={{ width: `${timePct}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-surface border border-border/60">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-text-secondary font-semibold">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Bài hoàn thành</span>
                </div>
                <span className="font-extrabold text-text-primary">
                  {exercises} <span className="text-[10px] text-text-tertiary font-normal">/ {TARGET_EXERCISES} bài</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-subtle overflow-hidden border border-border/40">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${exercisePct}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-surface border border-border/60">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-text-secondary font-semibold">
                  <Target className="w-3.5 h-3.5 text-teal-500" />
                  <span>Độ chính xác</span>
                </div>
                <span className="font-extrabold text-text-primary">
                  {accuracy !== null ? `${accuracy}%` : '--'}
                  <span className="text-[10px] text-text-tertiary font-normal"> (chuẩn ≥80%)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-subtle overflow-hidden border border-border/40">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    accuracyPct >= 80 ? 'bg-emerald-500' : accuracyPct >= 50 ? 'bg-teal-500' : accuracyPct > 0 ? 'bg-amber-500' : 'bg-transparent'
                  }`}
                  style={{ width: `${accuracyPct}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-surface border border-border/60">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-text-secondary font-semibold">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span>Lượt làm & Ôn lỗi</span>
                </div>
                <span className="font-extrabold text-text-primary">
                  {attempts} <span className="text-[10px] text-text-tertiary font-normal">lượt</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-subtle overflow-hidden border border-border/40">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all duration-700"
                  style={{ width: `${Math.min(100, attempts * 5)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {todayData?.skills_practiced && todayData.skills_practiced.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
            <span className="text-text-tertiary text-[11px] font-medium">Kỹ năng đã luyện:</span>
            {todayData.skills_practiced.map((s, idx) => (
              <span
                key={`${s.skill}-${idx}`}
                className="px-2.5 py-1 rounded-xl bg-surface-subtle border border-border text-[11px] font-semibold text-text-secondary flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>{s.skill_name || s.skill}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
