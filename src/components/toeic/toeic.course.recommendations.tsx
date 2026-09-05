'use client'

/**
 * @file ToeicCourseRecommendations.tsx
 * @description Giao diện đề xuất Lộ trình học tập cá nhân hóa và các khóa học lẻ cho học viên sau khi thi đánh giá
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@/lib/navigation'
import {
  Sparkles,
  GraduationCap,
  ArrowRight,
  Compass,
  CheckCircle2,
  Lock,
  Layers,
  TrendingUp,
  Tag,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { progressService } from '@/services/progress.service'
import type { Course, LearningRoadmap } from '@/types/api.types'

export interface RecommendedCourseItem extends Course {
  recommendation_reason?: string
  match_score?: number
}

interface ToeicCourseRecommendationsProps {
  recommendedRoadmap?: (LearningRoadmap & { stages?: any[] }) | null
  courses: RecommendedCourseItem[]
  targetBand?: string
  levelLabel?: string
  isLoading?: boolean
  baselineScore?: number
}

export function ToeicCourseRecommendations({
  recommendedRoadmap,
  courses,
  targetBand,
  levelLabel,
  isLoading = false,
  baselineScore = 0,
}: ToeicCourseRecommendationsProps) {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const isVietnamese = i18n.language === 'vi'

  const [isEnrollingRoadmap, setIsEnrollingRoadmap] = useState(false)

  const handleEnrollRoadmap = async () => {
    if (!recommendedRoadmap?._id) {
      navigate('/roadmap')
      return
    }

    setIsEnrollingRoadmap(true)
    try {
      await progressService.enrollRoadmap({
        roadmap_id: recommendedRoadmap._id,
        baseline_score: baselineScore,
      })
      navigate('/roadmap')
    } catch {
      // Navigate to roadmap anyway
      navigate('/roadmap')
    } finally {
      setIsEnrollingRoadmap(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 🌟 Option 1: Đề Xuất Lộ Trình Toàn Diện (Recommended Roadmap) */}
      {recommendedRoadmap && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />

          <div className="relative z-10 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/20 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-bold text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ĐỀ XUẤT LỘ TRÌNH DÀNH RIÊNG CHO BẠN</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {recommendedRoadmap.title || 'Lộ Trình Bứt Phá TOEIC Mục Tiêu'}
                </h3>
                <p className="text-xs sm:text-sm text-indigo-200/80 max-w-2xl">
                  {recommendedRoadmap.description ||
                    'Hệ thống AI đã phân tích điểm thi và thiết kế lộ trình theo từng chặng nối tiếp, giúp bạn chạm mốc điểm số mục tiêu nhanh nhất.'}
                </p>
              </div>

              {/* Target Badge */}
              <div className="flex flex-col items-end">
                <div className="text-[11px] uppercase tracking-wider text-indigo-300 font-bold">Cam Kết Đầu Ra</div>
                <div className="text-2xl font-black text-teal-400">
                  {recommendedRoadmap.target_score || 650}+
                </div>
              </div>
            </div>

            {/* Stages Stepper Flow */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Hành Trình Chinh Phục {recommendedRoadmap.stages?.length || 3} Chặng:</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(recommendedRoadmap.stages || []).map((stage: any, idx: number) => {
                  const isFirst = idx === 0
                  const courseTitle = stage.course?.title || stage.stage_title || `Chặng ${idx + 1}`
                  return (
                    <div
                      key={idx}
                      className="relative rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm flex flex-col justify-between space-y-3 transition-all hover:bg-white/10 hover:border-indigo-400/40"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black">
                            {idx + 1}
                          </span>
                          <span className="text-[11px] font-bold text-teal-300 px-2 py-0.5 rounded-full bg-teal-950/60 border border-teal-800/60">
                            Mục tiêu: {stage.target_band || `${450 + idx * 150}+`}
                          </span>
                        </div>
                        <h5 className="font-bold text-sm text-white line-clamp-2">
                          {courseTitle}
                        </h5>
                        <p className="text-[11px] text-indigo-200/70 line-clamp-2 leading-relaxed">
                          {stage.stage_description || 'Hoàn thành kiến thức trọng tâm và làm bài thi checkpoint chặng.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-indigo-300">
                        <span>Checkpoint: <strong>{stage.passing_score || 70}%</strong></span>
                        <span className="text-[10px] text-indigo-400 font-semibold">
                          {isFirst ? 'Chặng Bắt Đầu' : 'Tiếp Theo'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Pricing & CTA Banner */}
            <div className="rounded-2xl bg-indigo-950/80 border border-indigo-500/30 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs text-indigo-300">Đăng ký trọn gói Lộ Trình:</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    <span>Tiết Kiệm 25% Combo</span>
                  </span>
                </div>
                <div className="flex items-baseline justify-center sm:justify-start gap-2">
                  <span className="text-2xl font-black text-emerald-400">
                    {(recommendedRoadmap.bundle_price || 1200000).toLocaleString('vi-VN')} đ
                  </span>
                  {recommendedRoadmap.original_price && (
                    <span className="text-xs text-indigo-300/60 line-through">
                      {recommendedRoadmap.original_price.toLocaleString('vi-VN')} đ
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-indigo-300/80">
                  Bao gồm toàn bộ các khóa học trong lộ trình, ghi nhận tiến độ & biểu đồ tăng trưởng điểm số.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Button
                  onClick={handleEnrollRoadmap}
                  disabled={isEnrollingRoadmap}
                  className="w-full sm:w-auto px-6 py-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm shadow-xl shadow-emerald-500/20 gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>{isEnrollingRoadmap ? 'Đang Kích Hoạt...' : 'ĐĂNG KÝ HỌC THEO LỘ TRÌNH NÀY'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 Option 2: Học Tự Do - Chọn Mua Từng Khóa Lẻ (Individual Courses) */}
      <Card className="dashboard-card border-slate-200/80 dark:border-slate-800 bg-surface p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-text-primary">
                {isVietnamese ? 'Hoặc Tự Chọn Học Từng Khóa Học Riêng Lẻ' : 'Or Choose Individual Courses'}
              </h4>
              <p className="text-xs text-text-secondary">
                Nếu bạn muốn tự do học từng kỹ năng hoặc từng phần cụ thể theo nhu cầu
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-semibold">
            {courses.length} Khóa Phù Hợp
          </Badge>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-text-tertiary">
            {isVietnamese ? 'Đang tìm kiếm khóa học...' : 'Finding matching courses...'}
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <GraduationCap className="h-10 w-10 text-indigo-400" />
            <p className="mt-2 text-sm font-semibold text-text-primary">
              {isVietnamese ? 'Khám phá thêm các khóa học TOEIC khác' : 'Explore more courses'}
            </p>
            <Button
              className="mt-3 gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={() => navigate('/courses')}
            >
              {isVietnamese ? 'Xem Tất Cả Khóa Học' : 'View All Courses'}
              <ArrowRight size={16} />
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const courseId = (course as { _id?: string })._id || course.id || ''
              return (
                <div
                  key={courseId}
                  className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 shadow-xs transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md"
                >
                  <div>
                    <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600">
                          <GraduationCap className="h-10 w-10" />
                        </div>
                      )}
                      <span className="absolute top-2 right-2 rounded-lg bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                        {course.target_score ? `🎯 ${course.target_score}+` : 'TOEIC'}
                      </span>
                    </div>

                    <h5 className="line-clamp-2 text-sm font-bold text-text-primary group-hover:text-indigo-600">
                      {course.title}
                    </h5>

                    <div className="mt-2 rounded-lg bg-indigo-50/60 p-2 text-[11px] leading-relaxed text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
                      💡 {course.recommendation_reason || 'Khóa học được tối ưu cho khung điểm của bạn'}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {course.price && course.price > 0
                        ? `${course.price.toLocaleString('vi-VN')} đ`
                        : isVietnamese
                          ? 'Miễn phí'
                          : 'Free'}
                    </span>
                    <Button
                      size="sm"
                      className="gap-1.5 bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                      onClick={() => navigate(`/courses/${courseId}`)}
                    >
                      {isVietnamese ? 'Mua lẻ / Vào học' : 'Enroll'}
                      <ArrowRight size={14} />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
