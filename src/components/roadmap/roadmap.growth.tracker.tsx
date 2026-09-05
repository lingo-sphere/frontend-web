/**
 * @file roadmap.growth.tracker.tsx
 * @description Thành phần Roadmap Growth Tracker phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file roadmap.growth.tracker.tsx
 * @description Thành phần mã nguồn roadmap.growth.tracker.tsx
 */

import { Compass, TrendingUp, Target } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { UserRoadmapProgress } from '@/types/api.types'

interface RoadmapGrowthTrackerProps {
  progress: UserRoadmapProgress
  roadmapStats: {
    baseline: number
    current: number
    growth: number
    target: number
  } | null
}

export function RoadmapGrowthTracker({ progress, roadmapStats }: RoadmapGrowthTrackerProps) {
  return (
    <div className="space-y-4">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-1">
          <div className="text-xs font-bold text-text-tertiary flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-indigo-500" />
            <span>Vạch Xuất Phát (Placement Score)</span>
          </div>
          <div className="text-3xl font-black text-text-primary">
            {roadmapStats?.baseline} <span className="text-xs font-normal text-text-tertiary">/ 990</span>
          </div>
          <p className="text-[11px] text-text-secondary">Điểm khảo sát năng lực khi mới vào</p>
        </div>

        
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-surface to-surface border border-emerald-500/30 shadow-xs space-y-1">
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Điểm Ước Tính Hiện Tại</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {roadmapStats?.current}
            </span>
            {(roadmapStats?.growth || 0) > 0 && (
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                +{roadmapStats?.growth} điểm
              </span>
            )}
          </div>
          <p className="text-[11px] text-text-secondary">Ghi nhận liên tục qua các bài kiểm tra chặng</p>
        </div>

        
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-1">
          <div className="text-xs font-bold text-text-tertiary flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-teal-500" />
            <span>Mục Tiêu Vạch Đích (Target Band)</span>
          </div>
          <div className="text-3xl font-black text-teal-600 dark:text-teal-400">
            {roadmapStats?.target}+ <span className="text-xs font-normal text-text-tertiary">TOEIC</span>
          </div>
          <p className="text-[11px] text-text-secondary">Cam kết hoàn thành trọn bộ lộ trình</p>
        </div>
      </div>

      
      <Card className="dashboard-card p-6 border-border bg-surface shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Biểu Đồ Tăng Trưởng Năng Lực (Score Growth Progression)
              </h3>
              <p className="text-xs text-text-secondary">
                Đo lường độ tiến bộ từ điểm xuất phát qua từng cột mốc chặng
              </p>
            </div>
          </div>
          {(roadmapStats?.growth || 0) > 0 && (
            <Badge className="bg-emerald-600 text-white font-bold">
              📈 Bứt Phá +{roadmapStats?.growth} Điểm
            </Badge>
          )}
        </div>

        
        <div className="relative pt-4 pb-2">
          <div className="h-44 w-full flex items-end justify-between px-4 sm:px-12 relative border-b border-dashed border-border/80 pb-6">
            {(progress.growth_chart_data || []).map((pt, idx, arr) => {
              const heightPercent = Math.min(100, Math.max(20, Math.round((pt.score / 990) * 100)))
              const isFirst = idx === 0
              const isLast = idx === arr.length - 1
              return (
                <div key={idx} className="flex flex-col items-center gap-2 z-10">
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
                    {pt.score}đ
                  </span>
                  <div
                    className="w-4 sm:w-8 rounded-t-xl bg-gradient-to-t from-indigo-600 to-teal-400 shadow-md transition-all duration-700 hover:brightness-110"
                    style={{ height: `${heightPercent * 1.1}px` }}
                  />
                  <div className="text-center">
                    <span className="text-xs font-bold text-text-primary block whitespace-nowrap">
                      {pt.milestone_name}
                    </span>
                    <span className="text-[10px] text-text-tertiary block">
                      {isFirst ? 'Vạch xuất phát' : isLast ? 'Mốc hiện tại' : 'Đã đạt'}
                    </span>
                  </div>
                </div>
              )
            })}

            
            <div className="flex flex-col items-center gap-2 z-10 opacity-70">
              <span className="text-xs font-black text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
                {roadmapStats?.target}+đ
              </span>
              <div
                className="w-4 sm:w-8 rounded-t-xl border-2 border-dashed border-teal-500 bg-teal-500/10"
                style={{
                  height: `${
                    Math.min(100, Math.round(((roadmapStats?.target || 650) / 990) * 100)) * 1.1
                  }px`,
                }}
              />
              <div className="text-center">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 block whitespace-nowrap">
                  Vạch Đích
                </span>
                <span className="text-[10px] text-text-tertiary block">Mục tiêu cam kết</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
