// Component hiển thị các thẻ KPI thống kê lịch sử làm bài kiểm tra.

import { Trophy, CheckCircle2, Sparkles } from 'lucide-react'

interface ExamHistoryKpiProps {
  stats: {
    total: number
    passed: number
    passRate: number
    avgScore: number
    totalCorrect: number
  }
}

export function ExamHistoryKpi({ stats }: ExamHistoryKpiProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      <div className="p-4 rounded-2xl border border-border bg-surface shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-text-secondary">Tổng số lượt làm bài</span>
          <div className="p-1.5 rounded-xl bg-primary/10 text-primary">
            <Trophy size={16} />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-text-primary">
            {stats.total}
          </div>
          <p className="text-[11px] font-semibold text-text-tertiary mt-0.5">lần hoàn thành bài test</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Tỷ lệ đạt chuẩn</span>
          <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={16} />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
            {stats.passRate}%
          </div>
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {stats.passed} / {stats.total} bài đạt
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-border bg-surface shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-text-secondary">Tổng câu đúng</span>
          <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-600">
            <Sparkles size={16} />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {stats.totalCorrect}
          </div>
          <p className="text-[11px] font-semibold text-text-tertiary mt-0.5">câu trả lời chuẩn xác</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Mức điểm trung bình</span>
          <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Trophy size={16} />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-amber-700 dark:text-amber-300">
            {stats.avgScore}
          </div>
          <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mt-0.5">điểm trung bình</p>
        </div>
      </div>
    </div>
  )
}
