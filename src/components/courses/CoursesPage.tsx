// Updated: 2026-08-20
// Courses page với tabs All Courses / My Learning

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Play, BookOpen, Users, Trophy } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeading } from '@/components/dashboard/SectionHeading'
import { ComingSoon } from '@/components/common/ComingSoon'
import { allCourses } from '@/data/courses-data'
import type { CourseCardData } from '@/data/courses-data'

interface CoursesPageProps {
  onAction: (message: string) => void
}

const myCourses = allCourses.filter((c: CourseCardData) => c.progress > 0)

export function CoursesPage({ onAction: _onAction }: CoursesPageProps) {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const navigate = useNavigate()

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <Tabs defaultValue="all">
        <TabsList className="mb-6 h-auto gap-1 rounded-xl border border-border bg-surface p-1">
          <TabsTrigger
            className="data-[state=active]:bg-primary-soft data-[state=active]:text-primary"
            value="all"
          >
            {isVietnamese ? 'Tất cả khóa học' : 'All Courses'}
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-primary-soft data-[state=active]:text-primary"
            value="my"
          >
            {isVietnamese ? 'Khóa của tôi' : 'My Learning'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <SectionHeading
            eyebrow={t('course.title')}
            title={isVietnamese ? 'Tất cả khóa học' : 'All Courses'}
            description={isVietnamese ? 'Duyệt và đăng ký khóa học' : 'Browse and enroll in courses'}
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allCourses.map((course: CourseCardData) => (
              <CourseCard key={course.id} course={course} onSelect={() => navigate(`/course/${course.id}`)} isVietnamese={isVietnamese} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my">
          <SectionHeading
            eyebrow={t('course.myCourses')}
            title={isVietnamese ? 'Khóa học của tôi' : 'My Courses'}
            description={isVietnamese ? 'Tiếp tục hành trình học tập' : 'Continue your learning journey'}
          />
          {myCourses.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myCourses.map((course: CourseCardData) => (
                <CourseCard key={course.id} course={course} onSelect={() => navigate(`/course/${course.id}`)} isVietnamese={isVietnamese} />
              ))}
            </div>
          ) : (
            <ComingSoon title={isVietnamese ? 'Chưa có khóa học nào' : 'No courses enrolled yet'} />
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}

interface CourseCardProps {
  course: CourseCardData
  onSelect: () => void
  isVietnamese: boolean
}

function CourseCard({ course, onSelect, isVietnamese }: CourseCardProps) {
  return (
    <Card
      className="dashboard-card cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
      onClick={onSelect}
    >
      {/* Course header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 p-4">
        <div className="flex items-center justify-between">
          <span className="rounded-lg bg-white/20 px-2 py-1 text-[11px] font-semibold text-white">
            {course.level}
          </span>
          {course.progress > 0 && (
            <span className="rounded-lg bg-white/20 px-2 py-1 text-[11px] font-semibold text-white">
              {course.progress}%
            </span>
          )}
        </div>
        <h3 className="mt-3 text-[16px] font-bold text-white">{course.title}</h3>
      </div>

      <CardContent className="p-4">
        <p className="line-clamp-2 text-[13px] text-text-secondary">{course.description}</p>

        {/* Course stats */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1 text-[12px] text-text-secondary">
            <BookOpen className="h-4 w-4" />
            <span>{course.lessons} {isVietnamese ? 'bài' : 'lessons'}</span>
          </div>
          <div className="flex items-center gap-1 text-[12px] text-text-secondary">
            <Trophy className="h-4 w-4" />
            <span>{course.chapters} {isVietnamese ? 'chương' : 'chapters'}</span>
          </div>
          <div className="flex items-center gap-1 text-[12px] text-text-secondary">
            <Users className="h-4 w-4" />
            <span>{course.students.toLocaleString()} {isVietnamese ? 'học viên' : 'students'}</span>
          </div>
          <div className="flex items-center gap-1 text-[12px] text-text-secondary">
            <Trophy className="h-4 w-4" />
            <span>{course.duration}</span>
          </div>
        </div>

        {/* Progress bar */}
        {course.progress > 0 && (
          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
              <div
                className="h-full bg-primary"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action */}
        <div className="mt-4">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
          >
            <Play className="h-4 w-4" />
            {course.progress > 0 ? (isVietnamese ? 'Tiếp tục' : 'Continue Learning') : (isVietnamese ? 'Học ngay' : 'Learn Now')}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
