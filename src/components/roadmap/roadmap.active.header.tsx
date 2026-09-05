/**
 * @file roadmap.active.header.tsx
 * @description Thành phần Roadmap Active Header phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file roadmap.active.header.tsx
 * @description Thành phần mã nguồn roadmap.active.header.tsx
 */

import type { UserRoadmapProgress } from '@/types/api.types'

interface RoadmapActiveHeaderProps {
  progress: UserRoadmapProgress
  roadmapStats: {
    completedStages: number
    totalStages: number
    progressPercent: number
  } | null
}

export function RoadmapActiveHeader({ progress, roadmapStats }: RoadmapActiveHeaderProps) {
  if (!progress.roadmap) return null

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-500/20">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Đang Theo Học Lộ Trình</span>
            </span>
            <span className="text-xs text-indigo-300">
              {progress.roadmap?.skills_focus === '4SKILLS'
                ? 'TOEIC 4 Kỹ Năng'
                : 'TOEIC 2 Kỹ Năng (LR)'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {progress.roadmap?.title}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/80 max-w-2xl">
            {progress.roadmap?.description ||
              'Chặng đường chinh phục mục tiêu được cá nhân hóa riêng cho bạn.'}
          </p>
        </div>

        
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0">
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-400">
              {roadmapStats?.completedStages} / {roadmapStats?.totalStages}
            </div>
            <div className="text-[11px] text-indigo-200 font-semibold uppercase tracking-wider">
              Chặng Đã Xong
            </div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-black text-teal-300">
              {roadmapStats?.progressPercent}%
            </div>
            <div className="text-[11px] text-indigo-200 font-semibold uppercase tracking-wider">
              Tiến Độ Tổng
            </div>
          </div>
        </div>
      </div>

      
      <div className="mt-6 pt-4 border-t border-indigo-500/20">
        <div className="flex items-center justify-between text-xs text-indigo-200 mb-1.5 font-semibold">
          <span>Tiến trình hoàn thành toàn lộ trình:</span>
          <span>{roadmapStats?.progressPercent}%</span>
        </div>
        <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-700"
            style={{ width: `${roadmapStats?.progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
