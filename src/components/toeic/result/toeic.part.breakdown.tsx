// Hiển thị thống kê chi tiết tỷ lệ đúng sai theo từng Part 1 đến Part 7 trong bài thi TOEIC.

'use client'

import { RotateCcw, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ExamResultMetrics } from '@/components/toeic/toeic.exam.result'

interface ToeicPartBreakdownProps {
  results: ExamResultMetrics
  statEntries: [string, { correct: number; total: number }][]
  hasExplicitParts: boolean
  isVietnamese: boolean
  onRetry: () => void
  onChooseAnother: () => void
}

export function ToeicPartBreakdown({
  results,
  statEntries,
  hasExplicitParts,
  isVietnamese,
  onRetry,
  onChooseAnother,
}: ToeicPartBreakdownProps) {
  const incorrectCount = Math.max(0, results.total - results.correct)

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
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

        <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-950/20">
          <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 block">
            {isVietnamese ? 'Tổng câu hỏi' : 'Total Questions'}
          </span>
          <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block">
            {results.total}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto pt-4 border-t border-border">
        <h3 className="text-sm font-bold text-text-primary mb-3">
          {isVietnamese ? 'Phân Tích Chi Tiết Từng Phần (Part Breakdown)' : 'Part Accuracy Breakdown'}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {(hasExplicitParts
            ? statEntries.filter(([p]) => !isNaN(Number(p)) && Number(p) >= 1 && Number(p) <= 7)
            : statEntries
          ).map(([partStr, stat]) => {
            const acc = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0
            const isWeak = acc < 50
            const isGood = acc >= 75
            const label = !isNaN(Number(partStr)) ? `Part ${partStr}` : String(partStr)

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
          <Button variant="outline" className="gap-2 font-bold text-xs h-10 px-4 rounded-xl cursor-pointer" onClick={onRetry}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isVietnamese ? 'Làm Lại Bài Thi' : 'Try Again'}</span>
          </Button>
          <Button variant="outline" className="gap-2 font-bold text-xs h-10 px-4 rounded-xl cursor-pointer" onClick={onChooseAnother}>
            <Compass className="w-3.5 h-3.5" />
            <span>{isVietnamese ? 'Chọn Đề Thi Khác' : 'Choose Another'}</span>
          </Button>
        </div>

        <div className="text-xs text-text-tertiary font-medium">
          {isVietnamese ? 'Điểm thi đã được cập nhật vào hồ sơ năng lực của bạn' : 'Score saved to your learning profile'}
        </div>
      </div>
    </div>
  )
}
