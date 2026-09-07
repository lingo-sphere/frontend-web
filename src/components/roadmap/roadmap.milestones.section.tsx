// Hiển thị danh sách các chặng mốc học tập và kiểm tra vượt chặng của lộ trình cá nhân hóa.

'use client'

import { Layers } from 'lucide-react'
import type { LearningRoadmapStage, UserRoadmapProgress } from '@/types/api.types'
import { RoadmapStageCard } from '@/components/roadmap/roadmap.stage.card'

interface RoadmapMilestonesSectionProps {
  stages: LearningRoadmapStage[]
  progress: UserRoadmapProgress
  onNavigateCourse: (courseId: string) => void
  onOpenCheckpoint: (stageOrder: number) => void
}

export function RoadmapMilestonesSection({
  stages,
  progress,
  onNavigateCourse,
  onOpenCheckpoint,
}: RoadmapMilestonesSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Các Chặng Học Tập Cụ Thể (Stage Milestones)</span>
          </h3>
          <p className="text-xs text-text-secondary">
            Hoàn thành bài học của từng chặng và vượt qua bài thi Checkpoint để mở khóa chặng tiếp theo
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {stages.map((stage: LearningRoadmapStage, idx: number) => (
          <RoadmapStageCard
            key={idx}
            stage={stage}
            index={idx}
            progress={progress}
            onNavigateCourse={onNavigateCourse}
            onOpenCheckpoint={onOpenCheckpoint}
          />
        ))}
      </div>
    </div>
  )
}
