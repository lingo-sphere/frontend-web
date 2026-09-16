// Component hiển thị các thẻ KPI tổng quan chỉ số học tập tại trang Tiến độ

import { Trophy, BookOpen, Flame, Target } from 'lucide-react'
import { Progress } from '@/components/progress'
import type { ProgressMetrics } from '@/features/progress/hooks/use.progress.data'

interface ProgressMetricsHeaderProps {
  metrics: ProgressMetrics
}

export function ProgressMetricsHeader({ metrics }: ProgressMetricsHeaderProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Điểm số mục tiêu</span>
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Trophy size={18} />
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-700 dark:text-amber-300">
              {metrics.currentScore > 0 ? metrics.currentScore : '--'}
            </span>
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-400">
              Mục tiêu: {metrics.targetScore > 0 ? metrics.targetScore : 'Chưa đặt'}
            </span>
          </div>
          <Progress value={metrics.scoreProgressPercent} className="h-2 bg-amber-500/20" />
          <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
            {metrics.targetScore > 0 ? `Đạt ${metrics.scoreProgressPercent}% chặng đường TOEIC` : 'Chưa thiết lập mục tiêu'}
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl border border-primary/30 bg-primary/10 dark:bg-primary/5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-primary">Tiến độ khóa học</span>
          <div className="p-2 rounded-xl bg-primary/20 text-primary">
            <BookOpen size={18} />
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-text-primary">
              {metrics.avgProgress}%
            </span>
            <span className="text-xs font-semibold text-text-secondary">
              {metrics.completedCourses}/{metrics.totalCourses} khóa hoàn thành
            </span>
          </div>
          <Progress value={metrics.avgProgress} className="h-2 bg-primary/20" />
          <p className="text-[11px] font-semibold text-text-tertiary">
            Đã hoàn thành {metrics.totalLessons} bài học
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl border border-orange-500/30 bg-orange-500/10 dark:bg-orange-950/20 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-orange-800 dark:text-orange-300">Chuyên cần & Streak</span>
          <div className="p-2 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400">
            <Flame size={18} />
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-orange-600 dark:text-orange-400">
              {metrics.streak}
            </span>
            <span className="text-xs font-bold text-text-secondary">ngày liên tiếp</span>
          </div>
          <p className="text-[11px] font-semibold text-text-tertiary">
            Tích lũy: <strong className="text-orange-600">{metrics.xp} XP</strong> • Cấp độ {metrics.level}
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 dark:bg-indigo-950/20 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300">Khảo thí & Đánh giá</span>
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <Target size={18} />
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {metrics.totalAttemptsCount}
            </span>
            <span className="text-xs font-bold text-text-secondary">lần làm bài kiểm tra</span>
          </div>
          <p className="text-[11px] font-semibold text-text-tertiary">
            Tỷ lệ đạt chuẩn: <strong className="text-indigo-600">{metrics.passRate}%</strong> bài thi
          </p>
        </div>
      </div>
    </div>
  )
}
