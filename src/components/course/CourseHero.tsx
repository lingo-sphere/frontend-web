/**
 * @file CourseHero.tsx
 * @description Component giao diện React CourseHero cho học viên
 */

import { Trophy, BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Course } from '@/types/course'

interface CourseHeroProps {
  course: Course
  progressPercent: number
  completedLessons: number
  totalLessons: number
  onStartPreTest: () => void
  onStartFinalTest: () => void
}

export function CourseHero({
  course,
  progressPercent,
  completedLessons,
  totalLessons,
  onStartPreTest,
  onStartFinalTest,
}: CourseHeroProps) {
  return (
    <div className="space-y-6">
      <Card className="dashboard-card overflow-hidden bg-surface">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-bold px-2.5 py-1 bg-primary/10 text-primary rounded-full uppercase">
                {course.level}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary mt-2">
                {course.title}
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
                {course.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-black text-primary">
                {progressPercent}%
              </span>
              <p className="text-xs text-text-tertiary">
                {completedLessons}/{totalLessons} bài hoàn thành
              </p>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="dashboard-card border-indigo-200/60 bg-indigo-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <BookOpen size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">
                  Pre-Test (Kiểm tra đầu vào)
                </h4>
                <p className="text-xs text-text-secondary">
                  {course.preTest?.status === 'completed'
                    ? `Đã hoàn thành (${course.preTest.result?.score || 0} điểm)`
                    : 'Kiểm tra trình độ đầu vào'}
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={onStartPreTest}>
              {course.preTest?.status === 'completed' ? 'Xem lại' : 'Làm bài'}
            </Button>
          </CardContent>
        </Card>

        <Card className="dashboard-card border-amber-200/60 bg-amber-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
                <Trophy size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">
                  Final Test (Đánh giá đầu ra)
                </h4>
                <p className="text-xs text-text-secondary">
                  {course.finalTest?.status === 'locked'
                    ? 'Mở khóa khi học xong tất cả các chương'
                    : 'Đánh giá năng lực 4 kỹ năng'}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={course.finalTest?.status === 'locked'}
              onClick={onStartFinalTest}
            >
              Làm bài
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
