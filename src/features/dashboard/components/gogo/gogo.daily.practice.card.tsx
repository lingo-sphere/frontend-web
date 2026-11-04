// Component hiển thị nhật ký tiến độ luyện tập chi tiết trong ngày hôm nay.
'use client'

import React from 'react'
import { Calendar, ArrowRight, CheckCircle2 } from 'lucide-react'
import type { TimeGrowth } from '@/features/progress/services/progress.service'

interface GogoDailyPracticeCardProps {
  dailyBreakdown?: TimeGrowth['daily_breakdown_7d']
  onViewAll?: () => void
}

export function GogoDailyPracticeCard({
  dailyBreakdown = [],
  onViewAll,
}: GogoDailyPracticeCardProps) {
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayData = dailyBreakdown.find((d) => d.date === todayStr) || dailyBreakdown[dailyBreakdown.length - 1]

  const timeSpent = todayData?.time_spent_formatted || '0m'
  const exercises = todayData?.exercises_count ?? 0
  const attempts = todayData?.questions_attempted ?? todayData?.attempts ?? 0
  const accuracy = todayData?.accuracy !== undefined && attempts > 0 ? `${Math.round(todayData.accuracy)}%` : '--'
  const hasPracticed = attempts > 0

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

      <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs flex-1 flex flex-col justify-between space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl border border-border/80 bg-surface-subtle/50 text-center">
            <span className="text-[10px] text-text-tertiary block font-semibold uppercase tracking-wider">
              Thời gian học
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight mt-0.5 block">
              {timeSpent}
            </span>
          </div>

          <div className="p-3 rounded-2xl border border-border/80 bg-surface-subtle/50 text-center">
            <span className="text-[10px] text-text-tertiary block font-semibold uppercase tracking-wider">
              Bài hoàn thành
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight mt-0.5 block">
              {exercises} bài
            </span>
          </div>

          <div className="p-3 rounded-2xl border border-border/80 bg-surface-subtle/50 text-center">
            <span className="text-[10px] text-text-tertiary block font-semibold uppercase tracking-wider">
              Lượt làm & Ôn lỗi
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight mt-0.5 block">
              {attempts} lượt
            </span>
          </div>

          <div className="p-3 rounded-2xl border border-border/80 bg-surface-subtle/50 text-center">
            <span className="text-[10px] text-text-tertiary block font-semibold uppercase tracking-wider">
              Độ chính xác
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight mt-0.5 block">
              {accuracy}
            </span>
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

