/**
 * @file page.tsx
 * @description Trang Lộ Trình Học Tập Cá Nhân Hóa (Personalized Learning Roadmap Dashboard)
 */

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@/lib/navigation'
import { RotateCcw, Layers } from 'lucide-react'
import { progressService } from '@/services/progress.service'
import { courseService } from '@/services/course.service'
import { toast } from '@/store/toast.store'
import type { UserRoadmapProgress, LearningRoadmap, LearningRoadmapStage } from '@/types/api.types'
import { RoadmapHeroBanner } from '@/components/roadmap/roadmap.hero.banner'
import { RoadmapPublicCard } from '@/components/roadmap/roadmap.public.card'
import { RoadmapActiveHeader } from '@/components/roadmap/roadmap.active.header'
import { RoadmapGrowthTracker } from '@/components/roadmap/roadmap.growth.tracker'
import { RoadmapStageCard } from '@/components/roadmap/roadmap.stage.card'
import { RoadmapCheckpointModal } from '@/components/roadmap/roadmap.checkpoint.modal'

export default function RoadmapAppPage() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const isVi = i18n.language === 'vi'

  const [progress, setProgress] = useState<UserRoadmapProgress | null>(null)
  const [availableRoadmaps, setAvailableRoadmaps] = useState<LearningRoadmap[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeCheckpointStage, setActiveCheckpointStage] = useState<number | null>(null)
  const [checkpointScoreInput, setCheckpointScoreInput] = useState<number>(80)
  const [isSubmittingCheckpoint, setIsSubmittingCheckpoint] = useState<boolean>(false)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [myProgress, roadmapsList] = await Promise.all([
        progressService.getMyRoadmapProgress(),
        courseService.getAllRoadmaps({ is_published: true }),
      ])

      setProgress(myProgress)
      setAvailableRoadmaps(Array.isArray(roadmapsList) ? roadmapsList : [])
    } catch (err) {
      console.warn('Lỗi khi tải dữ liệu lộ trình:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleEnrollRoadmap = async (roadmapId: string) => {
    try {
      const result = await progressService.enrollRoadmap({
        roadmap_id: roadmapId,
        baseline_score: 350,
      })
      setProgress(result)
      toast.success('Đã kích hoạt Lộ trình học tập thành công!')
    } catch (err) {
      console.error('Lỗi khi đăng ký lộ trình:', err)
      toast.error('Không thể kích hoạt lộ trình lúc này.')
    }
  }

  const handleRecordCheckpoint = async () => {
    if (!progress || activeCheckpointStage === null) return

    if (checkpointScoreInput < 70) {
      toast.warning(
        `Điểm thi đạt ${checkpointScoreInput}% (chưa đạt ngưỡng tối thiểu 70% để vượt cấp). Hãy ôn luyện kỹ các bài học của Chặng ${activeCheckpointStage} để nắm chắc kiến thức trước nhé!`,
        'Chưa Đạt Ngưỡng Vượt Cấp'
      )
      return
    }

    setIsSubmittingCheckpoint(true)
    try {
      const updated = await progressService.recordCheckpointResult({
        roadmap_id: progress.roadmap_id,
        stage_order: activeCheckpointStage,
        course_id: `course-stage-${activeCheckpointStage}`,
        checkpoint_score: checkpointScoreInput,
      })
      setProgress(updated)
      setActiveCheckpointStage(null)
      toast.success(
        `🎉 Chúc mừng bạn đã hoàn thành bài thi Chặng ${activeCheckpointStage} xuất sắc (${checkpointScoreInput}%)! Chặng tiếp theo đã được mở khóa.`,
        'Vượt Cấp Thành Công'
      )
      loadData()
    } catch (err) {
      console.error('Lỗi khi cập nhật bài kiểm tra chặng:', err)
      toast.error('Không thể ghi nhận kết quả bài thi lúc này. Vui lòng thử lại sau.')
    } finally {
      setIsSubmittingCheckpoint(false)
    }
  }

  const roadmapStats = useMemo(() => {
    if (!progress || !progress.roadmap) return null

    const stages = progress.roadmap.stages || []
    const totalStages = stages.length || 3
    const currentStageOrder = progress.current_stage_order || 1
    const completedStages = (progress.stage_milestones || []).filter(
      (m) => m.status === 'COMPLETED'
    ).length
    const progressPercent = Math.min(100, Math.round((completedStages / totalStages) * 100))

    const baseline = progress.baseline_score || 0
    const current = progress.current_estimated_score || baseline
    const growth = current - baseline
    const target = progress.roadmap.target_score || 650

    return {
      stages,
      totalStages,
      currentStageOrder,
      completedStages,
      progressPercent,
      baseline,
      current,
      growth,
      target,
    }
  }, [progress])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-text-secondary">
          <RotateCcw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-semibold">Đang tải hành trình học tập cá nhân hóa của bạn...</p>
        </div>
      </div>
    )
  }

  if (!progress || !progress.roadmap) {
    return (
      <div className="min-h-screen bg-surface-secondary px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <RoadmapHeroBanner
            onNavigatePlacement2Skills={() => navigate('/toeic/exam/placement_2skills')}
            onNavigatePlacement4Skills={() => navigate('/toeic/exam/placement_4skills')}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  {isVi ? 'Hoặc Khám Phá Các Lộ Trình Tiêu Biểu' : 'Or Explore Featured Roadmaps'}
                </h2>
                <p className="text-xs text-text-secondary">
                  Được thiết kế bởi các chuyên gia học thuật hàng đầu LingoSphere
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {availableRoadmaps.map((rm) => (
                <RoadmapPublicCard
                  key={rm._id}
                  roadmap={rm}
                  onEnroll={handleEnrollRoadmap}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-secondary px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <RoadmapActiveHeader progress={progress} roadmapStats={roadmapStats} />

        <RoadmapGrowthTracker progress={progress} roadmapStats={roadmapStats} />

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
            {(roadmapStats?.stages || []).map((stage: LearningRoadmapStage, idx: number) => (
              <RoadmapStageCard
                key={idx}
                stage={stage}
                index={idx}
                progress={progress}
                onNavigateCourse={(courseId) => navigate(`/courses/${courseId}`)}
                onOpenCheckpoint={(stageOrder) => {
                  setActiveCheckpointStage(stageOrder)
                  setCheckpointScoreInput(80)
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <RoadmapCheckpointModal
        activeCheckpointStage={activeCheckpointStage}
        checkpointScoreInput={checkpointScoreInput}
        isSubmittingCheckpoint={isSubmittingCheckpoint}
        onScoreChange={setCheckpointScoreInput}
        onClose={() => setActiveCheckpointStage(null)}
        onSubmitCheckpoint={handleRecordCheckpoint}
      />
    </div>
  )
}
