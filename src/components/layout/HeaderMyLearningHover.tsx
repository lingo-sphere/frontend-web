'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, Loader2 } from 'lucide-react'
import { useNavigate } from '@/lib/navigation'
import { courseService } from '@/services/course.service'
import { useAuthStore } from '@/store/auth-store'
import type { Course } from '@/types/api.types'

interface LearningCourseItem {
  id: string
  title: string
  thumbnail: string
  progress: number
}

export function HeaderMyLearningHover() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [courses, setCourses] = useState<LearningCourseItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    let isMounted = true
    const loadMyLearning = async () => {
      if (!isAuthenticated) {
        setCourses([])
        return
      }
      setLoading(true)
      try {
        const [enrollments, allCourses] = await Promise.all([
          courseService.getMyEnrolledCourses().catch(() => []),
          courseService.getAllCourses().catch(() => []),
        ])

        if (isMounted) {
          const courseMap = new Map<string, Course>()
          if (Array.isArray(allCourses)) {
            allCourses.forEach((c) => {
              const cId = (c.id || c._id || '') as string
              if (cId) courseMap.set(cId, c)
            })
          }

          if (Array.isArray(enrollments) && enrollments.length > 0) {
            const mapped: LearningCourseItem[] = enrollments.map((en) => {
              const matchedCourse = courseMap.get(en.course_id)
              return {
                id: en.course_id,
                title: matchedCourse?.title || 'Khóa học tiếng Anh',
                thumbnail:
                  matchedCourse?.thumbnail_url ||
                  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
                progress: en.progress_percent || 0,
              }
            })
            setCourses(mapped)
          } else {
            setCourses([])
          }
        }
      } catch {
        if (isMounted) setCourses([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadMyLearning()
    return () => {
      isMounted = false
    }
  }, [isAuthenticated])

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-[340px] rounded-2xl border border-border bg-surface shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-left">
      {loading ? (
        <div className="p-8 text-center flex items-center justify-center gap-2 text-xs text-text-secondary">
          <Loader2 size={16} className="animate-spin text-purple-600" />
          <span>{isVi ? 'Đang tải khóa học...' : 'Loading courses...'}</span>
        </div>
      ) : courses.length === 0 ? (
        <div className="p-6 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
            <BookOpen size={22} />
          </div>
          <p className="text-xs text-text-secondary">
            {isVi
              ? 'Bạn chưa tham gia khóa học nào.'
              : 'You have not enrolled in any courses yet.'}
          </p>
          <button
            onClick={() => navigate('/courses')}
            className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 transition-colors cursor-pointer"
          >
            {isVi ? 'Khám phá khóa học ngay' : 'Explore Courses'}
          </button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border/60 max-h-[360px] overflow-y-auto">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/course/${course.id}`)}
                className="flex items-start gap-3 p-3.5 hover:bg-surface-subtle transition-colors cursor-pointer group"
              >
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-12 w-12 rounded-xl object-cover shrink-0 border border-border/60"
                />
                <div className="flex-1 space-y-1.5 min-w-0">
                  <h4 className="text-xs font-bold text-text-primary line-clamp-2 leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {course.title}
                  </h4>
                  {course.progress > 0 ? (
                    <div className="space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-purple-100 dark:bg-purple-950/40 overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 block">
                      {isVi ? 'Bắt đầu học' : 'Start learning'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-border bg-surface-subtle/30">
            <button
              onClick={() => navigate('/courses')}
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 transition-colors shadow-sm cursor-pointer"
            >
              {isVi ? 'Đến Khóa học của tôi' : 'Go to My learning'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
