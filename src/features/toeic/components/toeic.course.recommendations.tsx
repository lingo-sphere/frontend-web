// Giao diện đề xuất các khóa học phù hợp cho học viên sau khi thi đánh giá.

'use client'

import { useTranslation } from 'react-i18next'
import { useNavigate } from '@/lib/navigation'
import {
  GraduationCap,
  ArrowRight,
  Target,
  Lightbulb,
  Users,
} from 'lucide-react'
import { Card } from '@/components/card'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { buildCourseUrl } from '@/features/courses/lib/course.url'
import { resolveMediaUrl } from '@/utils/media.utils'
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
  isLoading = false,
}: ToeicCourseRecommendationsProps) {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const isVietnamese = i18n.language === 'vi'

  return (
    <div className="space-y-6">
      <Card className="dashboard-card border-slate-200/80 dark:border-slate-800 bg-surface p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-text-primary">
                {isVietnamese ? 'Khóa Học Đề Xuất Phù Hợp Cho Bạn' : 'Recommended Courses For You'}
              </h4>
              <p className="text-xs text-text-secondary">
                {isVietnamese ? 'Dựa trên kết quả bài thi đánh giá năng lực của bạn' : 'Based on your placement assessment result'}
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course) => {
              const courseUrl = buildCourseUrl(course)
              const courseKey = course._id
              return (
                <div
                  key={courseKey}
                  onClick={() => navigate(courseUrl)}
                  className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 shadow-xs transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md cursor-pointer"
                >
                  <div>
                    <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                      {course.thumbnail_url ? (
                        <img
                          src={resolveMediaUrl(course.thumbnail_url)}
                          alt={course.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600">
                          <GraduationCap className="h-10 w-10" />
                        </div>
                      )}
                      <span className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                        {course.target_score ? (
                          <>
                            <Target className="w-3 h-3 text-teal-400" />
                            <span>{course.target_score}+</span>
                          </>
                        ) : (
                          'TOEIC'
                        )}
                      </span>
                    </div>

                    <h5 className="line-clamp-2 text-sm font-bold text-text-primary group-hover:text-indigo-600">
                      {course.title}
                    </h5>

                    <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-indigo-50/60 p-2 text-[11px] leading-relaxed text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
                      <Lightbulb className="w-3.5 h-3.5 shrink-0 text-indigo-500 mt-0.5" />
                      <span>{course.recommendation_reason || 'Khóa học được tối ưu cho khung điểm của bạn'}</span>
                    </div>

                    <div className="flex items-center gap-1 mt-2 text-[10px] text-text-tertiary">
                      <Users size={11} className="text-indigo-500 shrink-0" />
                      <span>{Number(course.students_count || 0).toLocaleString('vi-VN')} {isVietnamese ? 'học viên' : 'students'}</span>
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
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(courseUrl)
                      }}
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
    </div>
  )
}
