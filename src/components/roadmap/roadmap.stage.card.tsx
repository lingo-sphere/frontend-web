/**
 * @file roadmap.stage.card.tsx
 * @description Card thành phần hiển thị roadmap.stage.card.tsx
 */

'use client'

import {
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Play,
  FileCheck2,
  Lock,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { LearningRoadmapStage, UserRoadmapProgress } from '@/types/api.types'

interface RoadmapStageCardProps {
  stage: LearningRoadmapStage
  index: number
  progress: UserRoadmapProgress
  onNavigateCourse: (courseId: string) => void
  onOpenCheckpoint: (stageOrder: number) => void
}

export function RoadmapStageCard({
  stage,
  index,
  progress,
  onNavigateCourse,
  onOpenCheckpoint,
}: RoadmapStageCardProps) {
  const stageOrder = stage.stage_order || index + 1
  const milestone = (progress.stage_milestones || []).find((m) => m.stage_order === stageOrder)
  const status = milestone?.status || (stageOrder === 1 ? 'IN_PROGRESS' : 'LOCKED')

  const isCompleted = status === 'COMPLETED'
  const isInProgress = status === 'IN_PROGRESS'
  const isLocked = status === 'LOCKED'

  return (
    <div
      className={`rounded-2xl border p-5 transition-all relative overflow-hidden ${
        isCompleted
          ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-950/20'
          : isInProgress
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-surface shadow-md'
          : 'border-border bg-surface-subtle opacity-70'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm shadow-xs ${
              isCompleted
                ? 'bg-emerald-500 text-white'
                : isInProgress
                ? 'bg-indigo-600 text-white animate-pulse'
                : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : stageOrder}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Chặng {stageOrder}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : isInProgress
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {isCompleted ? 'Đã Hoàn Thành' : isInProgress ? 'Đang Học' : 'Chưa Mở Khóa'}
              </span>
              {stage.target_band && (
                <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
                  🎯 Mục tiêu: {stage.target_band}
                </span>
              )}
            </div>

            <h4 className="text-base font-bold text-text-primary">
              {stage.stage_title || `Chặng ${stageOrder}`}
            </h4>
            <p className="text-xs text-text-secondary max-w-xl leading-relaxed">
              {stage.stage_description ||
                'Hoàn thành các bài giảng cốt lõi và làm bài kiểm tra chặng.'}
            </p>

            {isCompleted && milestone?.score_growth !== undefined && (
              <div className="pt-1 text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>
                  Điểm thi chặng đạt: {milestone.checkpoint_score}% (Tăng trưởng +
                  {milestone.score_growth} điểm)
                </span>
              </div>
            )}
          </div>
        </div>

        
        <div className="flex items-center gap-2 sm:self-center">
          {isCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => stage.course_id && onNavigateCourse(stage.course_id)}
              className="gap-1.5 text-xs font-semibold"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Xem Lại Khóa Học</span>
            </Button>
          )}

          {isInProgress && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={() => stage.course_id && onNavigateCourse(stage.course_id)}
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Vào Học Chặng Này</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenCheckpoint(stageOrder)}
                className="gap-1.5 border-emerald-500 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-xs font-bold cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Thi Checkpoint Chặng</span>
              </Button>
            </div>
          )}

          {isLocked && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-text-tertiary font-medium">
                <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Điều kiện: Đạt bài test Chặng {stageOrder - 1}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenCheckpoint(stageOrder - 1)}
                className="gap-1.5 border-indigo-400/50 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300 text-xs font-bold cursor-pointer transition-all shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>⚡ Thi Vượt Cấp Chặng {stageOrder - 1}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
