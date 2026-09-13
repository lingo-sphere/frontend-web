// Trang lộ trình học tập cá nhân hóa và danh mục khóa học theo nấc thang điểm số.

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@/lib/navigation'
import { RotateCcw } from 'lucide-react'
import { progressService } from '@/features/progress/services/progress.service'
import { courseService } from '@/features/courses/services/course.service'
import { toast } from '@/store/toast.store'
import type { UserRoadmapProgress, LearningRoadmap, Course } from '@/types/api.types'
import { RoadmapHeroBanner } from '@/features/roadmap/components/roadmap.hero.banner'
import { RoadmapPublicCard } from '@/features/roadmap/components/roadmap.public.card'
import { RoadmapActiveHeader } from '@/features/roadmap/components/roadmap.active.header'
import { RoadmapGrowthTracker } from '@/features/roadmap/components/roadmap.growth.tracker'
import { RoadmapCheckpointModal } from '@/features/roadmap/components/roadmap.checkpoint.modal'
import { RoadmapCoursesSection } from '@/features/roadmap/components/roadmap.courses.section'
import { RoadmapMethodologySection } from '@/features/roadmap/components/roadmap.methodology.section'
import { RoadmapMilestonesSection } from '@/features/roadmap/components/roadmap.milestones.section'
import { useAuthStore } from '@/features/auth/store/auth.store'

export default function RoadmapAppPage() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isVi = i18n.language === 'vi'

  const [progress, setProgress] = useState<UserRoadmapProgress | null>(null)
  const [availableRoadmaps, setAvailableRoadmaps] = useState<LearningRoadmap[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeCheckpointStage, setActiveCheckpointStage] = useState<number | null>(null)
  const [checkpointScoreInput, setCheckpointScoreInput] = useState<number>(80)
  const [isSubmittingCheckpoint, setIsSubmittingCheckpoint] = useState<boolean>(false)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [myProgress, roadmapsList, coursesList] = await Promise.all([
        progressService.getMyRoadmapProgress(),
        courseService.getAllRoadmaps({ is_published: true }),
        courseService.getAllCourses({ is_published: true, limit: 12 }),
      ])

      if (myProgress && !myProgress.roadmap && myProgress.roadmap_id) {
        try {
          const rm = await courseService.getRoadmapById(myProgress.roadmap_id)
          if (rm) {
            myProgress.roadmap = rm
          }
        } catch {}
      }

      setProgress(myProgress)
      setAvailableRoadmaps(Array.isArray(roadmapsList) ? roadmapsList : [])
      setCourses(Array.isArray(coursesList) ? coursesList : [])
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
      const userBaseline =
        user?.placement_test_score ??
        user?.current_estimated_score ??
        0
      const result = await progressService.enrollRoadmap({
        roadmap_id: roadmapId,
        baseline_score: userBaseline,
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

    let baseline = 0
    if (typeof progress.baseline_score === 'number') {
      baseline = progress.baseline_score
    } else if (typeof progress.baseline_score === 'object' && progress.baseline_score !== null) {
      const obj = progress.baseline_score as { total?: number; overall?: number }
      baseline = obj.total ?? obj.overall ?? 0
    }

    let current = baseline
    if (typeof progress.current_estimated_score === 'number') {
      current = progress.current_estimated_score
    } else if (typeof progress.current_estimated_score === 'object' && progress.current_estimated_score !== null) {
      const obj = progress.current_estimated_score as { total?: number; overall?: number }
      current = obj.total ?? obj.overall ?? baseline
    }

    const growth = Number(current) - Number(baseline)
    const target = Number(progress.roadmap.target_score ?? 0)

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

  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => (a.target_score ?? 0) - (b.target_score ?? 0))
  }, [courses])

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
      <div className="min-h-screen bg-surface-secondary text-text-primary">
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10">
          <RoadmapHeroBanner
            onNavigatePlacement2Skills={() => navigate('/toeic/exam/placement_2skills')}
            onNavigatePlacement4Skills={() => navigate('/toeic/exam/placement_4skills')}
          />

          {availableRoadmaps.length > 0 && (
            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-text-primary">
                    {isVi ? 'Lộ Trình Đào Tạo Tiêu Biểu' : 'Featured Learning Paths'}
                  </h2>
                  <p className="text-xs sm:text-sm text-text-secondary mt-1">
                    Được thiết kế bài bản theo từng chặng bởi các chuyên gia học thuật hàng đầu LingoSphere
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {availableRoadmaps.map((rm) => (
                  <RoadmapPublicCard
                    key={rm._id}
                    roadmap={rm}
                    onEnroll={handleEnrollRoadmap}
                  />
                ))}
              </div>
            </section>
          )}

          <RoadmapCoursesSection
            courses={sortedCourses}
            onNavigateCourse={(slugOrId) => navigate(`/course/${slugOrId}`)}
            onNavigateAllCourses={() => navigate('/courses')}
          />

          <RoadmapMethodologySection />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-secondary text-text-primary">
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        <RoadmapActiveHeader progress={progress} roadmapStats={roadmapStats} />

        <RoadmapGrowthTracker progress={progress} roadmapStats={roadmapStats} />

        <RoadmapMilestonesSection
          stages={roadmapStats?.stages || []}
          progress={progress}
          onNavigateCourse={(courseId) => navigate(`/course/${courseId}`)}
          onOpenCheckpoint={(stageOrder) => {
            setActiveCheckpointStage(stageOrder)
            setCheckpointScoreInput(80)
          }}
        />
      </main>

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
