// Component hiển thị thông tin lộ trình học tập cá nhân hóa và các mốc chặng

import { Compass, Layers } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { UserRoadmapProgress } from '@/services/progress.service'

interface ProgressRoadmapTabProps {
  roadmapProgress: UserRoadmapProgress | null
  currentScore: number
  targetScore: number
  baselineScore?: number | null
  onNavigate: (path: string) => void
}

export function ProgressRoadmapTab({
  roadmapProgress,
  currentScore,
  targetScore,
  baselineScore,
  onNavigate,
}: ProgressRoadmapTabProps) {
  if (!roadmapProgress) {
    return (
      <Card className="border-dashed p-8 sm:p-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 mx-auto flex items-center justify-center">
          <Compass size={28} />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-bold text-text-primary">
            {currentScore > 0
              ? `Đã ghi nhận điểm đầu vào TOEIC: ${currentScore} điểm`
              : 'Chưa kích hoạt lộ trình cá nhân'}
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            {currentScore > 0
              ? `Bạn đã hoàn thành bài thi test đầu vào và đạt ${currentScore} điểm (Mục tiêu: ${targetScore} điểm). Hãy vào giao diện Lộ Trình để bắt đầu các chặng học tối ưu riêng cho bạn!`
              : 'Hãy làm bài test đánh giá năng lực đầu vào hoặc thiết lập mục tiêu điểm số để hệ thống tạo lộ trình học chuẩn xác nhất cho bạn!'}
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Button
            onClick={() => onNavigate('/roadmap')}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl gap-1.5 cursor-pointer"
          >
            <Compass size={14} />
            <span>Xem lộ trình học tập</span>
          </Button>
          <Button
            onClick={() => onNavigate('/toeic/exam/placement_2skills')}
            variant="outline"
            className="text-xs font-semibold rounded-xl cursor-pointer"
          >
            {currentScore > 0 ? 'Làm lại test đầu vào' : 'Làm Test đầu vào ngay'}
          </Button>
        </div>
      </Card>
    )
  }

  const extractScore = (score: unknown): number | null => {
    if (typeof score === 'number') return score
    if (score && typeof score === 'object' && 'total' in score) {
      const totalVal = (score as { total: unknown }).total
      if (typeof totalVal === 'number') return totalVal
    }
    return null
  }

  const baselineVal = extractScore(roadmapProgress.baseline_score) ?? baselineScore ?? null
  const targetVal = roadmapProgress.roadmap?.target_score ?? targetScore ?? 800

  const roadmapStages = roadmapProgress.roadmap?.stages ?? []
  const stageMilestones = roadmapProgress.stage_milestones ?? []
  const displayStages =
    roadmapStages.length > 0
      ? roadmapStages.map((st, idx) => {
          const ms = stageMilestones.find((m) => m.stage_order === st.stage_order)
          const isDone = ms?.status === 'COMPLETED' || ms?.is_completed
          const isCurrent =
            ms?.status === 'IN_PROGRESS' ||
            (!ms && st.stage_order === (roadmapProgress.current_stage_order ?? 1))
          return {
            id: `stage-${st.stage_order || idx}`,
            order: st.stage_order || idx + 1,
            title: st.stage_title || `Chặng mục tiêu ${st.target_band || ''}`,
            isDone,
            isCurrent,
            checkpointScore: ms?.checkpoint_score,
          }
        })
      : stageMilestones.map((ms, idx) => ({
          id: `milestone-${ms.stage_order || idx}`,
          order: ms.stage_order || idx + 1,
          title: ms.course_title || `Chặng ${ms.stage_order || idx + 1}`,
          isDone: ms.status === 'COMPLETED' || ms.is_completed,
          isCurrent: ms.status === 'IN_PROGRESS',
          checkpointScore: ms.checkpoint_score,
        }))

  return (
    <div className="space-y-6">
      <Card className="dashboard-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-md">
                Lộ trình TOEIC Cá Nhân Hóa
              </Badge>
              <span className="text-xs text-text-secondary font-medium">
                Chặng hiện tại: <strong>Stage {roadmapProgress.current_stage_order || 1}</strong>
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-text-primary">
              {roadmapProgress.roadmap_title ||
                roadmapProgress.roadmap?.title ||
                'Lộ trình luyện thi TOEIC chuẩn đầu ra'}
            </h3>
          </div>
          <Button
            onClick={() => onNavigate('/roadmap')}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Compass size={14} />
            <span>Vào giao diện Lộ Trình</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl border border-border bg-surface-subtle/50">
            <span className="text-[11px] font-semibold text-text-tertiary block">Điểm xuất phát:</span>
            <span className="text-lg font-black text-text-primary">
              {baselineVal !== null ? `${baselineVal} điểm` : 'Chưa test'}
            </span>
          </div>
          <div className="p-3.5 rounded-xl border border-border bg-surface-subtle/50">
            <span className="text-[11px] font-semibold text-text-tertiary block">Điểm mục tiêu:</span>
            <span className="text-lg font-black text-primary">
              {targetVal} điểm
            </span>
          </div>
          <div className="p-3.5 rounded-xl border border-border bg-surface-subtle/50">
            <span className="text-[11px] font-semibold text-text-tertiary block">Số chặng học:</span>
            <span className="text-lg font-black text-indigo-600">
              {displayStages.length} chặng
            </span>
          </div>
        </div>
      </Card>

      {displayStages.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Layers size={16} className="text-primary" />
            <span>Chi tiết các chặng trong lộ trình</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {displayStages.map((stage) => (
              <Card
                key={stage.id}
                className={`p-4 rounded-2xl border transition-all ${
                  stage.isDone
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : stage.isCurrent
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border bg-surface opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-text-tertiary">
                      Chặng {stage.order}
                    </span>
                    <h5 className="text-sm font-bold text-text-primary">
                      {stage.title}
                    </h5>
                  </div>
                  {stage.isDone ? (
                    <Badge className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Hoàn thành
                    </Badge>
                  ) : stage.isCurrent ? (
                    <Badge className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Đang học
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      Chưa mở
                    </Badge>
                  )}
                </div>

                {typeof stage.checkpointScore === 'number' && (
                  <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-text-secondary">Điểm bài kiểm tra chặng:</span>
                    <strong className="text-primary">{stage.checkpointScore} điểm</strong>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
