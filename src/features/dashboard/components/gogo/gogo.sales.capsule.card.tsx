// Component biểu đồ cột dạng viên nang hai khúc đặc trưng của Gogo Sales Bar Chart.
'use client'

import React, { useState } from 'react'

interface DailyBarData {
  dayLabel: string
  dateStr: string
  upperValue: number
  lowerValue: number
  totalValue: number
}

interface GogoSalesCapsuleCardProps {
  dailyBreakdown?: Array<{
    date: string
    attempts?: number
    questions_attempted?: number
    correct_count?: number
  }>
}

export function GogoSalesCapsuleCard({ dailyBreakdown = [] }: GogoSalesCapsuleCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const processedDays: DailyBarData[] = dayNames.map((name, index) => {
    const raw = dailyBreakdown[index]
    const questions = raw?.questions_attempted ?? (raw?.attempts ? raw.attempts * 5 : 0)
    const upper = Math.round(questions * 0.55)
    const lower = Math.round(questions * 0.45)
    return {
      dayLabel: name,
      dateStr: raw?.date || name,
      upperValue: upper,
      lowerValue: lower,
      totalValue: questions,
    }
  })

  const maxVal = Math.max(60, ...processedDays.map((d) => d.totalValue))
  const step = Math.ceil(maxVal / 3 / 10) * 10
  const yTicks = [step * 3, step * 2, step, 0]

  return (
    <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
            Sales
          </h2>
          <p className="text-xs text-text-tertiary mt-0.5">
            Tần suất câu hỏi & bài tập theo ngày trong tuần
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <span className="w-2.5 h-2.5 rounded-full border border-emerald-500 bg-emerald-500/30" />
            <span>Nghe & Đọc</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <span className="w-2.5 h-2.5 rounded-full border border-emerald-600 bg-emerald-500/15" />
            <span>Từ vựng & Ngữ pháp</span>
          </div>
        </div>
      </div>

      <div className="relative flex items-end gap-3 h-52 sm:h-56 pt-4 pb-2">
        <div className="flex flex-col justify-between h-full pr-2 text-[11px] text-text-tertiary select-none">
          {yTicks.map((val) => (
            <span key={val}>{val}</span>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7 gap-2 sm:gap-4 h-full items-end border-b border-border/80 pb-2">
          {processedDays.map((d, idx) => {
            const totalPercent = Math.min(100, Math.max(12, Math.round((d.totalValue / (yTicks[0] || 1)) * 100)))
            const isHovered = hoveredIndex === idx

            return (
              <div
                key={d.dayLabel}
                className="flex flex-col items-center justify-end h-full relative cursor-pointer group"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {isHovered && (
                  <div className="absolute -top-10 z-20 px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[11px] font-semibold whitespace-nowrap shadow-md pointer-events-none">
                    {d.dayLabel}: {d.totalValue} câu hỏi
                  </div>
                )}

                <div
                  className="w-5 sm:w-7 flex flex-col justify-end gap-1 transition-all duration-300"
                  style={{ height: `${totalPercent}%` }}
                >
                  <div
                    className={`w-full flex-1 rounded-t-full rounded-b-xl border-2 border-emerald-500/80 bg-emerald-500/20 transition-all ${
                      isHovered ? 'bg-emerald-500/40 border-emerald-600' : ''
                    }`}
                  />
                  <div
                    className={`w-full flex-1 rounded-t-xl rounded-b-full border-2 border-emerald-500/80 bg-emerald-500/10 transition-all ${
                      isHovered ? 'bg-emerald-500/30 border-emerald-600' : ''
                    }`}
                  />
                </div>

                <span className={`text-[12px] mt-2 font-medium transition-colors ${
                  isHovered ? 'text-primary font-bold' : 'text-text-secondary'
                }`}>
                  {d.dayLabel}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

