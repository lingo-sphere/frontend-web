// Thành phần gợi ý khóa học thông minh dựa trên điểm số đánh giá đầu vào.

'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  BookOpen,
  Users,
  Star,
  ArrowRight,
} from 'lucide-react'
import { useAllCoursesQuery } from '@/features/courses/hooks/use.courses.query'
import type { Course } from '@/types/api.types'

interface CourseItem {
  id: string
  title: string
  slug?: string
  description?: string
  thumbnail?: string
  target_score?: number
  min_score?: number
  max_score?: number
  level?: string
  price?: number
  students_count?: number
  rating?: number
  duration_hours?: number
  tags?: string[]
}

interface RecommendedCoursesSectionProps {
  currentScore?: number
  targetScore?: number
  courses?: CourseItem[]
}

function formatNumber(val?: number): string {
  if (val === undefined || val === null) return '0'
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function RecommendedCoursesSection({
  currentScore = 550,
  targetScore = 750,
  courses,
}: RecommendedCoursesSectionProps) {
  const shouldFetch = !courses || courses.length === 0
  const { data: rawCourses = [] } = useAllCoursesQuery(
    { limit: 10, is_published: true },
    shouldFetch
  )

  const fetchedCourses = useMemo<CourseItem[]>(() => {
    if (courses && courses.length > 0) return courses

    const list = Array.isArray(rawCourses) ? rawCourses : []
    return list.map((c: Course) => {
      const courseTarget = typeof c.target_score === 'number' ? c.target_score : undefined
      return {
        id: c.id || c._id || '',
        title: c.title,
        slug: c.slug,
        description: c.description,
        thumbnail: c.thumbnail_url || '',
        target_score: courseTarget,
        min_score: courseTarget ? Math.max(0, courseTarget - 150) : 0,
        max_score: courseTarget || 0,
        price: typeof c.price === 'number' ? c.price : (c.discount_price ?? 0),
        students_count: c.students_count ?? 0,
        rating: typeof c.rating === 'number' ? c.rating : undefined,
        duration_hours: c.total_duration_minutes ? Math.round(c.total_duration_minutes / 60) : undefined,
        tags: Array.isArray(c.skills) ? c.skills : [],
      }
    })
  }, [courses, rawCourses])

  const recommendedList = useMemo(() => {
    const listToProcess = courses || fetchedCourses
    return listToProcess
      .map((course) => {
        let matchRate = 80
        const min = course.min_score ?? 0
        const max = course.max_score ?? course.target_score ?? 0

        if (max > 0 && currentScore >= min && currentScore <= max) {
          matchRate = 98
        } else if (min > 0 && currentScore < min && currentScore >= min - 100) {
          matchRate = 90
        }

        return {
          ...course,
          matchRate,
        }
      })
      .sort((a, b) => b.matchRate - a.matchRate)
  }, [courses, fetchedCourses, currentScore])

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Gợi Ý Dành Riêng Cho Bạn</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Khóa Học Phù Hợp Với Trình Độ ({currentScore} Điểm)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dựa trên kết quả bài test đầu vào và mục tiêu {targetScore} điểm của bạn
          </p>
        </div>

        <Link
          href="/courses"
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Xem tất cả khóa học</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {recommendedList.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Chưa Có Khóa Học Nào Trong Hệ Thống
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Giảng viên và Quản trị viên đang cập nhật danh mục khóa học mới. Bạn có thể quay lại sau hoặc khám phá các nội dung luyện tập khác.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all shadow-xs"
          >
            <span>Khám phá danh mục</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendedList.slice(0, 3).map((course, idx) => (
            <div
              key={course.id || idx}
              className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
            >
              
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-extrabold border border-white/20 shadow-lg">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Phù hợp {course.matchRate}%</span>
                </div>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  Mục tiêu {course.target_score}+
                </div>
              </div>

              
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {course.tags?.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span suppressHydrationWarning>{formatNumber(course.students_count)} học viên</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{course.rating || 4.9}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div suppressHydrationWarning className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {course.price ? `${formatNumber(course.price)} đ` : 'Miễn phí'}
                    </div>

                    <Link
                      href={`/course/${course.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 dark:bg-slate-100 dark:hover:bg-indigo-500 text-white dark:text-slate-900 dark:hover:text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <span>Khám phá</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
