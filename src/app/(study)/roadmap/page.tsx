'use client'

/**
 * @file page.tsx
 * @description Trang Lộ Trình Học Tập Cá Nhân Hóa (Personalized Learning Roadmap Dashboard)
 * Trực quan hóa hành trình các chặng (Stages), theo dõi tiến độ và biểu đồ tăng trưởng điểm số (Growth Chart)
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@/lib/navigation'
import {
  Compass,
  TrendingUp,
  Award,
  CheckCircle2,
  Lock,
  Play,
  ArrowRight,
  BookOpen,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
  Clock,
  RotateCcw,
  Target,
  FileCheck2,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { progressService } from '@/services/progress.service'
import { courseService } from '@/services/course.service'
import type { UserRoadmapProgress, LearningRoadmap, LearningRoadmapStage } from '@/types/api.types'

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
    } catch (err) {
      console.error('Lỗi khi đăng ký lộ trình:', err)
    }
  }

  const handleRecordCheckpoint = async () => {
    if (!progress || !activeCheckpointStage) return

    setIsSubmittingCheckpoint(true)
    try {
      const updated = await progressService.recordCheckpointResult({
        roadmap_id: progress.roadmap_id,
        stage_order: activeCheckpointStage,
        exam_id: `exam-stage-${activeCheckpointStage}`,
        score: checkpointScoreInput,
      })
      setProgress(updated)
      setActiveCheckpointStage(null)
    } catch (err) {
      console.error('Lỗi khi cập nhật bài kiểm tra chặng:', err)
    } finally {
      setIsSubmittingCheckpoint(false)
    }
  }

  // Calculate Overall Roadmap Stats
  const roadmapStats = useMemo(() => {
    if (!progress || !progress.roadmap) return null

    const stages = progress.roadmap.stages || []
    const totalStages = stages.length || 3
    const currentStageOrder = progress.current_stage_order || 1
    const completedStages = (progress.stage_milestones || []).filter((m) => m.status === 'COMPLETED').length
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

  // 🌟 View 1: Chưa đăng ký lộ trình nào -> Gợi ý làm Test hoặc Chọn lộ trình
  if (!progress || !progress.roadmap) {
    return (
      <div className="min-h-screen bg-surface-secondary px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-8 sm:p-12 text-white shadow-2xl">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-indigo-200 border border-white/10">
                <Compass className="w-3.5 h-3.5" />
                <span>Hệ Thống Lộ Trình Học Tập Cá Nhân Hóa</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Xác Định Trình Độ & Chinh Phục Lộ Trình TOEIC Riêng Cho Bạn
              </h1>
              <p className="text-sm sm:text-base text-indigo-200/90 leading-relaxed">
                Làm bài kiểm tra đánh giá năng lực rút gọn để hệ thống AI định vị chính xác điểm mạnh, điểm yếu và xây dựng lộ trình đo lường sự tăng trưởng qua từng chặng học.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => navigate('/toeic/exam/placement_2skills')}
                  className="px-6 py-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Test Đầu Vào 2 Kỹ Năng (LR)</span>
                </Button>
                <Button
                  onClick={() => navigate('/toeic/exam/placement_4skills')}
                  className="px-6 py-6 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-sm border border-white/20 flex items-center gap-2 cursor-pointer"
                >
                  <Target className="w-4 h-4" />
                  <span>Test Toàn Diện 4 Kỹ Năng (LRSW)</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Available Public Roadmaps */}
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
                <div
                  key={rm._id}
                  className="group rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          rm.skills_focus === '4SKILLS'
                            ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                            : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        }`}
                      >
                        {rm.skills_focus === '4SKILLS' ? '4 Kỹ Năng' : '2 Kỹ Năng (LR)'}
                      </span>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                        🎯 Mục tiêu {rm.target_score}+
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-text-primary group-hover:text-indigo-600 transition-colors">
                      {rm.title}
                    </h3>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {rm.description || 'Lộ trình từng bước giúp bứt phá điểm số bền vững.'}
                    </p>

                    <div className="pt-2 flex items-center gap-2 text-xs text-text-tertiary">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{rm.stages?.length || 3} Chặng nối tiếp</span>
                      <span>•</span>
                      <span>Đầu vào: {rm.min_entry_score} - {rm.max_entry_score}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {(rm.bundle_price || 1200000).toLocaleString('vi-VN')} đ
                      </div>
                      {rm.original_price && (
                        <div className="text-[11px] text-text-tertiary line-through">
                          {rm.original_price.toLocaleString('vi-VN')} đ
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleEnrollRoadmap(rm._id)}
                      className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
                    >
                      <span>Bắt Đầu Ngay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 🌟 View 2: Đã kích hoạt Lộ Trình -> Dashboard Theo Dõi Tiến Độ & Biểu Đồ Tăng Trưởng
  return (
    <div className="min-h-screen bg-surface-secondary px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Active Roadmap Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-500/20">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Đang Theo Học Lộ Trình</span>
                </span>
                <span className="text-xs text-indigo-300">
                  {progress.roadmap.skills_focus === '4SKILLS' ? 'TOEIC 4 Kỹ Năng' : 'TOEIC 2 Kỹ Năng (LR)'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {progress.roadmap.title}
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/80 max-w-2xl">
                {progress.roadmap.description || 'Chặng đường chinh phục mục tiêu được cá nhân hóa riêng cho bạn.'}
              </p>
            </div>

            {/* Overall Progress Circle / Stats */}
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

          {/* Progress Bar */}
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

        {/* 📈 Score Growth & Continuous Improvement Tracker */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Điểm Xuất Phát */}
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

          {/* Card 2: Điểm Ước Tính Hiện Tại & Mức Tăng Trưởng */}
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

          {/* Card 3: Mục Tiêu Cam Kết */}
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

        {/* 📊 Visual Score Growth Chart (SVG Progression Curve) */}
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

          {/* SVG Score Line Chart */}
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

              {/* Target Milestone Marker */}
              <div className="flex flex-col items-center gap-2 z-10 opacity-70">
                <span className="text-xs font-black text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
                  {roadmapStats?.target}+đ
                </span>
                <div
                  className="w-4 sm:w-8 rounded-t-xl border-2 border-dashed border-teal-500 bg-teal-500/10"
                  style={{ height: `${Math.min(100, Math.round(((roadmapStats?.target || 650) / 990) * 100)) * 1.1}px` }}
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

        {/* 🗺️ Interactive Stage Stepper Flow */}
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
            {(roadmapStats?.stages || []).map((stage: LearningRoadmapStage, idx: number) => {
              const stageOrder = stage.stage_order || idx + 1
              const milestone = (progress.stage_milestones || []).find((m) => m.stage_order === stageOrder)
              const status = milestone?.status || (stageOrder === 1 ? 'IN_PROGRESS' : 'LOCKED')

              const isCompleted = status === 'COMPLETED'
              const isInProgress = status === 'IN_PROGRESS'
              const isLocked = status === 'LOCKED'

              return (
                <div
                  key={idx}
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
                      {/* Step Circle Badge */}
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
                          {stage.stage_description || 'Hoàn thành các bài giảng cốt lõi và làm bài kiểm tra chặng.'}
                        </p>

                        {isCompleted && milestone?.score_growth !== undefined && (
                          <div className="pt-1 text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Điểm thi chặng đạt: {milestone.checkpoint_score}% (Tăng trưởng +{milestone.score_growth} điểm)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stage Actions */}
                    <div className="flex items-center gap-2 sm:self-center">
                      {isCompleted && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => stage.course_id && navigate(`/courses/${stage.course_id}`)}
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
                            onClick={() => stage.course_id && navigate(`/courses/${stage.course_id}`)}
                            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Vào Học Chặng Này</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveCheckpointStage(stageOrder)
                              setCheckpointScoreInput(80)
                            }}
                            className="gap-1.5 border-emerald-500 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-xs font-bold cursor-pointer"
                          >
                            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Thi Checkpoint Chặng</span>
                          </Button>
                        </div>
                      )}

                      {isLocked && (
                        <div className="flex items-center gap-1.5 text-xs text-text-tertiary font-medium">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Mở khóa khi xong Chặng {stageOrder - 1}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Checkpoint Submission Modal */}
      {activeCheckpointStage !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <FileCheck2 className="w-6 h-6" />
              <h4 className="text-base font-bold text-text-primary">
                Ghi Nhận Kết Quả Checkpoint Chặng {activeCheckpointStage}
              </h4>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Nhập kết quả bài kiểm tra chặng của bạn. Nếu đạt từ 70% trở lên, hệ thống sẽ mở khóa chặng tiếp theo và ghi nhận số điểm tăng trưởng vào biểu đồ hành trình!
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-text-primary">
                Điểm bài kiểm tra (% đúng hoặc thang điểm 100):
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={checkpointScoreInput}
                onChange={(e) => setCheckpointScoreInput(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-surface-subtle border border-border rounded-xl text-sm font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveCheckpointStage(null)}
                className="text-xs font-semibold"
              >
                Hủy
              </Button>
              <Button
                size="sm"
                disabled={isSubmittingCheckpoint}
                onClick={handleRecordCheckpoint}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                {isSubmittingCheckpoint ? 'Đang Ghi Nhận...' : 'Xác Nhận Qua Chặng'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
