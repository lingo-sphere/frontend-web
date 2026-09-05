/**
 * @file course.growth.chart.tsx
 * @description Thành phần hiển thị biểu đồ và phân tích tăng trưởng năng lực học viên xuyên suốt khóa học (từ Baseline -> các Chương -> Final Test).
 */

'use client'

import { useMemo } from 'react'
import { TrendingUp, Award, Target, CheckCircle2, Sparkles, BarChart2 } from 'lucide-react'

export interface GrowthPoint {
  stage: string
  score: number
  timestamp?: string | Date
}

interface CourseGrowthChartProps {
  growthData?: GrowthPoint[]
  baselineScore?: number
  baselineSource?: string
  isBaselineEstablished?: boolean
  totalScoreGrowth?: number
  totalGrowthPercentage?: number
  finalTestScore?: number
}

export function CourseGrowthChart({
  growthData = [],
  baselineScore = 0,
  baselineSource,
  isBaselineEstablished = false,
  totalScoreGrowth = 0,
  totalGrowthPercentage = 0,
  finalTestScore,
}: CourseGrowthChartProps) {

  const points = useMemo(() => {
    if (!growthData || growthData.length === 0) {
      if (isBaselineEstablished && baselineScore > 0) {
        return [{ stage: 'Baseline', score: baselineScore }]
      }
      return []
    }
    return growthData
  }, [growthData, isBaselineEstablished, baselineScore])

  const maxScore = useMemo(() => {
    if (points.length === 0) return 100
    const highest = Math.max(...points.map((p) => p.score), 100)
    return Math.ceil(highest / 10) * 10
  }, [points])

  if (points.length === 0) {
    return (
      <div className="p-6 rounded-3xl bg-surface border border-border text-center space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
          <BarChart2 size={24} />
        </div>
        <h4 className="text-sm font-bold text-text-primary">Chưa có dữ liệu để thống kê tiến độ</h4>
        <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
          Hãy hoàn thành bài kiểm tra đầu vào (Pre-test) hoặc bài kiểm tra cuối chương (Post-mini Test) của Chương 1 để hệ thống bắt đầu vẽ biểu đồ tăng trưởng năng lực của bạn!
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-primary text-white shadow-md shadow-primary/20 shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-text-primary flex items-center gap-1.5">
              Biểu đồ tăng trưởng năng lực học tập
              <Sparkles size={14} className="text-primary animate-pulse" />
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Theo dõi sự tiến bộ xuyên suốt từ mốc khởi đầu đến hiện tại
            </p>
          </div>
        </div>

        {isBaselineEstablished && totalScoreGrowth !== undefined && (
          <div className="flex items-center gap-3 bg-surface-subtle/80 px-4 py-2 rounded-2xl border border-border/80">
            <div>
              <span className="text-[10px] text-text-tertiary font-semibold uppercase block">
                Mức độ cải thiện
              </span>
              <span
                className={`text-sm font-black flex items-center gap-1 ${
                  totalScoreGrowth >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {totalScoreGrowth >= 0 ? `+${totalScoreGrowth}` : totalScoreGrowth} điểm
                {totalGrowthPercentage !== undefined && (
                  <span className="text-xs font-bold">
                    ({totalGrowthPercentage >= 0 ? `+${totalGrowthPercentage}` : totalGrowthPercentage}%)
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      
      <div className="space-y-2">
        <div className="h-44 flex items-end justify-between gap-2.5 sm:gap-4 pt-6 px-2">
          {points.map((pt, idx) => {
            const heightPercent = Math.max(12, Math.round((pt.score / maxScore) * 100))
            const isBaseline = pt.stage.toLowerCase().includes('baseline')
            const isFinal = pt.stage.toLowerCase().includes('final')

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                
                <span className="text-[11px] font-black text-text-primary px-2 py-0.5 rounded-lg bg-surface border border-border shadow-xs group-hover:scale-110 transition-transform">
                  {pt.score}
                </span>

                
                <div className="w-full max-w-[48px] bg-surface-subtle rounded-xl overflow-hidden p-1 flex items-end h-full">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-lg transition-all duration-700 ${
                      isFinal
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-sm shadow-emerald-500/20'
                        : isBaseline
                        ? 'bg-gradient-to-t from-slate-400 to-slate-300 dark:from-slate-700 dark:to-slate-600'
                        : 'bg-gradient-to-t from-primary to-indigo-400 shadow-sm shadow-primary/20'
                    }`}
                  />
                </div>

                
                <span className="text-[11px] font-bold text-text-secondary text-center truncate max-w-[64px] sm:max-w-none">
                  {pt.stage}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3.5 rounded-2xl bg-surface-subtle/60 border border-border/70 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-300">
            <Target size={18} />
          </div>
          <div>
            <span className="text-[10px] text-text-tertiary font-bold uppercase block">
              Mốc bắt đầu (Baseline)
            </span>
            <p className="text-xs font-black text-text-primary">
              {isBaselineEstablished ? `${baselineScore} điểm` : 'Chưa có'}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-subtle/60 border border-border/70 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span className="text-[10px] text-text-tertiary font-bold uppercase block">
              Số chặng đã hoàn thành
            </span>
            <p className="text-xs font-black text-text-primary">
              {points.length} chặng đánh giá
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-subtle/60 border border-border/70 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Award size={18} />
          </div>
          <div>
            <span className="text-[10px] text-text-tertiary font-bold uppercase block">
              Điểm số cao nhất
            </span>
            <p className="text-xs font-black text-text-primary">
              {Math.max(...points.map((p) => p.score))} điểm
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
