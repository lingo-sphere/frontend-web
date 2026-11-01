// Component thẻ tiến trình học tập từng khóa học mô phỏng theo Gogo Processes Card.
'use client'

import React from 'react'
import Link from 'next/link'
import { BookOpen, ChevronRight, PlayCircle, CheckCircle2, Clock } from 'lucide-react'
import { resolveMediaUrl } from '@/utils/media.utils'
import type { UnifiedCourseCardItem } from '@/features/progress/hooks/use.progress.data'

interface GogoLearningProcessesCardProps {
  courses: UnifiedCourseCardItem[]
  onNavigate?: (path: string) => void
}

export function GogoLearningProcessesCard({ courses, onNavigate }: GogoLearningProcessesCardProps) {
  return (
    <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400">
            <BookOpen className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-text-primary">
              Tiến Trình Khóa Học
            </h3>
            <p className="text-xs text-text-secondary">
              Theo dõi lộ trình các bài học và chương đào tạo
            </p>
          </div>
        </div>

        <Link
          href="/courses?tab=my-courses"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>Khóa của tôi</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-4 my-auto">
        {courses.length === 0 ? (
          <div className="py-8 text-center text-text-secondary text-xs">
            Bạn chưa đăng ký khóa học nào. Hãy khám phá ngay các khóa TOEIC chuẩn!
          </div>
        ) : (
          courses.map((course) => {
            const isCompleted = course.progress_percentage >= 100
            const resolvedImg = course.thumbnail_url ? resolveMediaUrl(course.thumbnail_url) : ''

            return (
              <div
                key={course.course_id}
                className="p-3.5 rounded-2xl bg-surface-subtle/50 hover:bg-surface-subtle border border-border/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-border shrink-0 bg-surface flex items-center justify-center">
                    {resolvedImg ? (
                      <img
                        src={resolvedImg}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <BookOpen className="w-5 h-5 text-text-tertiary" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                      {course.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-tertiary">
                      <span className="font-semibold text-text-secondary">
                        {course.category === 'TOEIC_4_SKILLS' ? 'TOEIC 4 Kỹ Năng' : 'TOEIC 2 Kỹ Năng'}
                      </span>
                      <span>•</span>
                      <span>
                        {course.completed_lessons_count} / {course.total_lessons_count} bài học
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="w-28 sm:w-32 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-text-secondary">{course.progress_percentage}%</span>
                      {isCompleted ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Đạt</span>
                        </span>
                      ) : (
                        <span className="text-text-tertiary font-normal">Đang học</span>
                      )}
                    </div>
                    <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-primary'
                        }`}
                        style={{ width: `${course.progress_percentage}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/courses/${course.course_id}`}
                    className="p-2 rounded-xl bg-surface hover:bg-primary hover:text-white border border-border text-text-secondary transition-all shadow-xs shrink-0 flex items-center justify-center"
                    title="Vào học tiếp"
                  >
                    <PlayCircle className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

