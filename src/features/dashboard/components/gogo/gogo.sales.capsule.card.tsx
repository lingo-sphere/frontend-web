// Component biểu đồ cột viên nang thể hiện tần suất và tỷ lệ đúng của bài tập theo từng ngày trong tuần.
'use client'

import { useState } from 'react'

interface DailyBarData {
  dayLabel: string
  dateStr: string
  correctValue: number
  incorrectValue: number
  totalValue: number
  accuracy: number
}

interface GogoSalesCapsuleCardProps {
  dailyBreakdown?: Array<{
    date: string
    day_name?: string
    attempts?: number
    questions_attempted?: number
    correct_count?: number
    questions_correct?: number
    correct?: number
    accuracy?: number
  }>
}

export function GogoSalesCapsuleCard({ dailyBreakdown = [] }: GogoSalesCapsuleCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const processedDays: DailyBarData[] = dayNames.map((name, index) => {
    const raw = dailyBreakdown[index]
    const total = raw?.questions_attempted ?? raw?.attempts ?? 0
    const correct = raw?.questions_correct ?? raw?.correct_count ?? raw?.correct ?? 0
    const incorrect = Math.max(0, total - correct)
    const accuracy = raw?.accuracy ?? (total > 0 ? Math.round((correct / total) * 100) : 0)

    return {
      dayLabel: raw?.day_name || name,
      dateStr: raw?.date || name,
      correctValue: correct,
      incorrectValue: incorrect,
      totalValue: total,
      accuracy,
    }
  })

  const maxVal = Math.max(20, ...processedDays.map((d) => d.totalValue))
  const step = Math.ceil(maxVal / 3 / 5) * 5
  const yTicks = [step * 3, step * 2, step, 0]

  return (
    <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
            Hoạt động Luyện tập Theo Ngày
          </h2>
          <p className="text-xs text-text-tertiary mt-0.5">
            Tần suất câu hỏi & bài tập theo ngày trong tuần
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <span className="w-2.5 h-2.5 rounded-full border border-emerald-500 bg-emerald-500/80" />
            <span>Câu đúng</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <span className="w-2.5 h-2.5 rounded-full border border-teal-500 bg-teal-500/25" />
            <span>Chưa chính xác / Cần ôn</span>
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
            const hasData = d.totalValue > 0
            const totalPercent = hasData
              ? Math.min(100, Math.max(16, Math.round((d.totalValue / (yTicks[0] || 1)) * 100)))
              : 0
            const correctPercent = d.totalValue > 0
              ? Math.round((d.correctValue / d.totalValue) * 100)
              : 0
            const isHovered = hoveredIndex === idx

            return (
              <div
                key={`${d.dayLabel}-${idx}`}
                className="flex flex-col items-center justify-end h-full relative cursor-pointer group"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {isHovered && (
                  <div className="absolute -top-12 z-20 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-semibold whitespace-nowrap shadow-md pointer-events-none text-center">
                    <div>{d.dayLabel}: {d.totalValue} câu hỏi</div>
                    <div className="text-[10px] text-emerald-300">
                      {d.correctValue} đúng • {d.accuracy}% chính xác
                    </div>
                  </div>
                )}

                {hasData ? (
                  <div
                    className="w-5 sm:w-7 flex flex-col justify-end gap-0.5 transition-all duration-300"
                    style={{ height: `${totalPercent}%` }}
                  >
                    {d.incorrectValue > 0 && (
                      <div
                        className={`w-full rounded-t-full border border-teal-500/50 bg-teal-500/25 transition-all ${
                          isHovered ? 'bg-teal-500/40' : ''
                        }`}
                        style={{ height: `${100 - correctPercent}%` }}
                      />
                    )}
                    <div
                      className={`w-full ${d.incorrectValue > 0 ? 'rounded-b-full' : 'rounded-full'} border border-emerald-500 bg-emerald-500/80 transition-all ${
                        isHovered ? 'brightness-110' : ''
                      }`}
                      style={{ height: `${d.incorrectValue > 0 ? correctPercent : 100}%` }}
                    />
                  </div>
                ) : (
                  <div className="w-5 sm:w-7 h-16 rounded-2xl bg-surface-subtle/30 border border-dashed border-border/50 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-border" />
                  </div>
                )}

                <span
                  className={`mt-2 text-[11px] font-bold transition-colors ${
                    isHovered
                      ? 'text-primary'
                      : 'text-text-tertiary group-hover:text-text-secondary'
                  }`}
                >
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
