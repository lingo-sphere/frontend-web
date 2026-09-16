// Hiển thị danh mục khóa học theo nấc thang điểm số năng lực TOEIC.

'use client'

import {
  GraduationCap,
  ArrowRight,
  BookOpen,
  Target,
  Layers,
  Users,
} from 'lucide-react'
import type { Course } from '@/types/api.types'

interface RoadmapCoursesSectionProps {
  courses: Course[]
  onNavigateCourse: (slugOrId: string) => void
  onNavigateAllCourses: () => void
}

export function RoadmapCoursesSection({
  courses,
  onNavigateCourse,
  onNavigateAllCourses,
}: RoadmapCoursesSectionProps) {
  return (
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
          onClick={onNavigateAllCourses}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface hover:bg-slate-100 dark:hover:bg-slate-800 border border-border text-xs font-bold text-text-primary hover:text-primary transition-colors cursor-pointer shrink-0 shadow-2xs"
        >
          <span>Xem tất cả khóa học</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
          {courses.map((c) => {
            const courseId = c._id || c.id || c.slug
            const isFree = !c.price || c.price === 0
            const hasDiscount = typeof c.discount_price === 'number' && c.discount_price < c.price
            const displayPrice = hasDiscount ? c.discount_price : c.price

            return (
              <div
                key={courseId}
                onClick={() => onNavigateCourse(c.slug || courseId)}
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
                        <span>{c.target_score ? `${c.target_score}+` : '-'}</span>
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
  )
}
