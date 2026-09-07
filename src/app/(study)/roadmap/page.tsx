// Trang lộ trình học tập cá nhân hóa và danh mục khóa học theo nấc thang điểm số.

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@/lib/navigation'
import {
  RotateCcw,
  Layers,
  Sparkles,
  BookOpen,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  Clock,
  Users,
  Target,
} from 'lucide-react'
import { progressService } from '@/services/progress.service'
import { courseService } from '@/services/course.service'
import { toast } from '@/store/toast.store'
import type { UserRoadmapProgress, LearningRoadmap, LearningRoadmapStage, Course } from '@/types/api.types'
import { RoadmapHeroBanner } from '@/components/roadmap/roadmap.hero.banner'
import { RoadmapPublicCard } from '@/components/roadmap/roadmap.public.card'
import { RoadmapActiveHeader } from '@/components/roadmap/roadmap.active.header'
import { RoadmapGrowthTracker } from '@/components/roadmap/roadmap.growth.tracker'
import { RoadmapStageCard } from '@/components/roadmap/roadmap.stage.card'
import { RoadmapCheckpointModal } from '@/components/roadmap/roadmap.checkpoint.modal'
import { useAuthStore } from '@/store/auth.store'

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
    const target = Number(progress.roadmap.target_score || 650)

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
    return [...courses].sort((a, b) => (a.target_score || 500) - (b.target_score || 500))
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
      <div className="min-h-screen bg-surface-secondary px-4 sm:px-6 lg:px-8 py-8">
        <div className="mx-auto max-w-7xl space-y-12">
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Hệ Thống Khóa Học Theo Nấc Thang Điểm Số</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                  Khóa Học Phù Hợp Từng Mục Tiêu Năng Lực
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                  Chọn ngay khóa học phù hợp với số điểm TOEIC mong muốn của bạn hoặc làm bài test để hệ thống gợi ý.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/courses')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface hover:bg-slate-100 dark:hover:bg-slate-800 border border-border text-xs font-bold text-text-primary hover:text-primary transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <span>Xem tất cả khóa học</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {sortedCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedCourses.map((c) => {
                  const courseId = c._id || c.id || c.slug
                  const isFree = !c.price || c.price === 0
                  const hasDiscount = typeof c.discount_price === 'number' && c.discount_price < c.price
                  const displayPrice = hasDiscount ? c.discount_price : c.price

                  return (
                    <div
                      key={courseId}
                      onClick={() => navigate(`/course/${c.slug || courseId}`)}
                      className="group rounded-2xl border border-border/90 bg-surface p-4 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg flex flex-col justify-between cursor-pointer space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-border/60">
                          {c.thumbnail_url ? (
                            <img
                              src={c.thumbnail_url}
                              alt={c.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/40 dark:to-slate-900 text-indigo-500">
                              <BookOpen className="w-8 h-8 mb-1 opacity-70" />
                              <span className="text-[11px] font-bold">LingoSphere Course</span>
                            </div>
                          )}
                          <div className="absolute top-2.5 left-2.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-600/90 text-white shadow-md backdrop-blur-xs">
                              <Target className="w-3 h-3 text-amber-300" />
                              <span>{c.target_score || 500}+</span>
                            </span>
                          </div>
                          {c.category && (
                            <div className="absolute top-2.5 right-2.5">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-900/90 text-text-primary shadow-xs border border-border/50">
                                {c.category === 'TOEIC_4_SKILLS' ? '4 Kỹ Năng' : '2 Kỹ Năng'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <h3 className="font-bold text-sm sm:text-base text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                            {c.title}
                          </h3>
                          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                            {c.description || 'Chương trình giảng dạy video chuẩn ETS kèm bài tập tương tác toàn diện.'}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-text-tertiary pt-1">
                          <div className="flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{c.total_lessons || 0} bài học</span>
                          </div>
                          {typeof c.students_count === 'number' && c.students_count > 0 && (
                            <>
                              <span>·</span>
                              <div className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-emerald-500" />
                                <span>{c.students_count} học viên</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/80 flex items-center justify-between">
                        <div>
                          {isFree ? (
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase">
                              Miễn phí
                            </span>
                          ) : (
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                {(displayPrice || 0).toLocaleString('vi-VN')} đ
                              </span>
                              {hasDiscount && (
                                <span className="text-[11px] text-text-tertiary line-through">
                                  {c.price.toLocaleString('vi-VN')} đ
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                          <span>Chi tiết</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-surface rounded-2xl border border-border">
                <BookOpen className="w-10 h-10 text-text-tertiary mx-auto mb-2" />
                <p className="text-sm font-semibold text-text-secondary">
                  Đang đồng bộ danh mục khóa học từ hệ thống...
                </p>
              </div>
            )}
          </section>

          <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/50 shadow-xl space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-indigo-300 border border-white/10">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>Phương Pháp Đột Phá Điểm Số</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Quy Trình Học Tập 3 Bước Tinh Gọn
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200/80">
                Tối ưu thời gian, học đúng trọng tâm trình độ và tự tin chinh phục mục tiêu TOEIC của bạn.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/40 transition-colors space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-base border border-emerald-500/30">
                  1
                </div>
                <h3 className="font-bold text-base text-white">Test Đánh Giá Đầu Vào</h3>
                <p className="text-xs text-indigo-200/80 leading-relaxed">
                  Làm bài thi rút gọn 40 hoặc 60 câu để hệ thống tính điểm TOEIC quy đổi chuẩn ETS và chẩn đoán kỹ năng yếu.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/40 transition-colors space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-black text-base border border-indigo-500/30">
                  2
                </div>
                <h3 className="font-bold text-base text-white">Học Khóa Học Đề Xuất</h3>
                <p className="text-xs text-indigo-200/80 leading-relaxed">
                  Bắt đầu học ngay với giáo trình đúng năng lực: video bài giảng, từ vựng thông minh SRS và nghe chép chính tả.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/40 transition-colors space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-base border border-amber-500/30">
                  3
                </div>
                <h3 className="font-bold text-base text-white">Thi Chặng Vượt Cấp</h3>
                <p className="text-xs text-indigo-200/80 leading-relaxed">
                  Hoàn thành bài kiểm tra cuối chương và tốt nghiệp khóa học để hệ thống tự động gợi ý và mở khóa khóa học tiếp theo.
                </p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">Chuẩn Đề Thi ETS</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Ngân hàng câu hỏi cập nhật theo format đề thi TOEIC mới nhất của IIG/ETS.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">Đo Lường Tăng Trưởng</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Theo dõi sự tiến bộ điểm số rõ ràng sau từng bài kiểm tra chặng và bài thi thử.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">Chấm Điểm AI 4 Kỹ Năng</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Nhận diện phát âm bằng Whisper AI và sửa lỗi ngữ pháp, chấm điểm bài viết tức thì.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">Học Linh Hoạt 24/7</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Tự do điều chỉnh tốc độ học tập trên máy tính và điện thoại mọi lúc mọi nơi.
              </p>
            </div>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-secondary px-4 sm:px-6 lg:px-8 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
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
                onNavigateCourse={(courseId) => navigate(`/course/${courseId}`)}
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
