'use client'

import { useTranslation } from 'react-i18next'
import { useNavigate } from '@/lib/navigation'
import { Sparkles, GraduationCap, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Course } from '@/types/api.types'

export interface RecommendedCourseItem extends Course {
  recommendation_reason?: string
  match_score?: number
}

interface ToeicCourseRecommendationsProps {
  courses: RecommendedCourseItem[]
  targetBand?: string
  levelLabel?: string
  isLoading?: boolean
}

export function ToeicCourseRecommendations({
  courses,
  targetBand,
  levelLabel,
  isLoading = false,
}: ToeicCourseRecommendationsProps) {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const isVietnamese = i18n.language === 'vi'

  return (
    <Card className="dashboard-card border-indigo-200/80 bg-gradient-to-b from-indigo-50/40 via-surface to-surface p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary sm:text-lg">
              {isVietnamese ? 'Khóa Học & Lộ Trình Đề Xuất Dành Cho Bạn' : 'Recommended Courses & Learning Path'}
            </h3>
            <p className="text-xs text-text-secondary">
              {levelLabel ? `${levelLabel} • Mục tiêu đề xuất: ${targetBand}` : 'Dựa trên kết quả bài thi vừa hoàn thành'}
            </p>
          </div>
        </div>
        <Badge className="bg-indigo-600 px-3 py-1 font-semibold text-white">
          {targetBand ? `Mục tiêu ${targetBand}` : 'Đề xuất tối ưu'}
        </Badge>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-text-tertiary">
          {isVietnamese ? 'Đang tìm kiếm khóa học phù hợp nhất với điểm thi của bạn...' : 'Finding the best matching courses...'}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <GraduationCap className="h-10 w-10 text-indigo-400" />
          <p className="mt-2 text-sm font-semibold text-text-primary">
            {isVietnamese ? 'Khám phá thêm các khóa học TOEIC chuẩn quốc tế' : 'Explore more TOEIC courses'}
          </p>
          <Button className="mt-3 gap-2 bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => navigate('/courses')}>
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
                  <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
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

                  <h4 className="line-clamp-2 text-sm font-bold text-text-primary group-hover:text-indigo-600">
                    {course.title}
                  </h4>

                  <div className="mt-2 rounded-lg bg-indigo-50/60 p-2 text-[11px] leading-relaxed text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
                    💡 {course.recommendation_reason || 'Khóa học được tối ưu cho khung điểm của bạn'}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-xs font-semibold text-emerald-600">
                    {course.price && course.price > 0 ? `${course.price.toLocaleString('vi-VN')} đ` : (isVietnamese ? 'Miễn phí' : 'Free')}
                  </span>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700"
                    onClick={() => navigate('/courses')}
                  >
                    {isVietnamese ? 'Vào học' : 'Enroll'}
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
