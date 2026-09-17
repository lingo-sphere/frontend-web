// Component hiển thị danh sách các khóa học đã ghi danh và tiến trình học tập.
import { useTranslation } from 'react-i18next'
import { BookOpen, CheckCircle2, Calendar, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { Progress } from '@/components/progress'
import type { UnifiedCourseCardItem } from '@/features/progress/hooks/use.progress.data'

interface ProgressCoursesTabProps {
  enrolledCourseCards: UnifiedCourseCardItem[]
  onNavigate: (path: string) => void
  formatDate: (iso?: string) => string
}

function formatCategory(category?: string, isVietnamese = true): string {
  if (!category) return ''
  const upper = category.toUpperCase()
  if (upper.includes('4_SKILLS') || upper.includes('4SKILLS')) {
    return isVietnamese ? 'TOEIC 4 Kỹ Năng' : 'TOEIC 4 Skills'
  }
  if (upper.includes('2_SKILLS') || upper.includes('2SKILLS')) {
    return isVietnamese ? 'TOEIC 2 Kỹ Năng' : 'TOEIC 2 Skills'
  }
  return category
}

export function ProgressCoursesTab({
  enrolledCourseCards,
  onNavigate,
  formatDate,
}: ProgressCoursesTabProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  if (enrolledCourseCards.length === 0) {
    return (
      <Card className="border-dashed p-8 sm:p-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
          <BookOpen size={28} />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-bold text-text-primary">
            {isVietnamese ? 'Chưa có khóa học nào được ghi nhận' : 'No courses recorded yet'}
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            {isVietnamese
              ? 'Bạn chưa tham gia khóa học nào. Hãy đăng ký ngay các khóa học luyện thi TOEIC chuẩn đầu ra để bắt đầu học tập và theo dõi tiến trình nhé!'
              : 'You have not enrolled in any course yet. Explore our TOEIC courses to start learning and tracking your progress!'}
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Button
            onClick={() => onNavigate('/courses')}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            {isVietnamese ? 'Khám phá khóa học' : 'Explore Courses'}
          </Button>
          <Button
            onClick={() => onNavigate('/toeic/exam/placement_2skills')}
            variant="outline"
            className="text-xs font-semibold rounded-xl cursor-pointer"
          >
            {isVietnamese ? 'Làm Test đầu vào' : 'Take Placement Test'}
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {enrolledCourseCards.map((c) => {
        const isCompleted = c.status === 'COMPLETED' || c.progress_percentage >= 100
        return (
          <Card
            key={c.course_id}
            className="dashboard-card hover:border-primary/50 transition-all flex flex-col justify-between overflow-hidden"
          >
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {formatCategory(c.category, isVietnamese)}
                    </Badge>
                    {c.target_score ? (
                      <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded-md border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-500/10">
                        🎯 {isVietnamese ? 'Mục tiêu' : 'Target'} {c.target_score}+
                      </Badge>
                    ) : null}
                    {isCompleted && (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        <CheckCircle2 size={11} className="mr-1" /> {isVietnamese ? 'Đã hoàn thành' : 'Completed'}
                      </Badge>
                    )}
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-text-primary line-clamp-2 pt-1">
                    {c.title}
                  </h4>
                </div>
                {c.thumbnail_url && (
                  <img
                    src={c.thumbnail_url}
                    alt={c.title}
                    className="w-14 h-14 rounded-xl object-cover border border-border shrink-0"
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-secondary">{isVietnamese ? 'Tiến độ bài học:' : 'Lesson progress:'}</span>
                  <span className="font-bold text-primary">{c.progress_percentage}%</span>
                </div>
                <Progress value={c.progress_percentage} className="h-2 bg-surface-subtle" />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-text-secondary">
                <div className="p-2.5 rounded-xl bg-surface-subtle/60 border border-border/50">
                  <span className="block text-[10px] text-text-tertiary">{isVietnamese ? 'Bài học:' : 'Lessons:'}</span>
                  <span className="font-bold text-text-primary">
                    {c.completed_lessons_count}/{c.total_lessons_count > 0 ? c.total_lessons_count : 1} {isVietnamese ? 'bài' : 'lessons'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-subtle/60 border border-border/50">
                  <span className="block text-[10px] text-text-tertiary">{isVietnamese ? 'Chương học:' : 'Modules:'}</span>
                  <span className="font-bold text-text-primary">
                    {c.completed_modules_count}/{c.total_modules_count > 0 ? c.total_modules_count : 1} {isVietnamese ? 'chương' : 'modules'}
                  </span>
                </div>
              </div>
            </CardContent>

            <div className="p-4 border-t border-border bg-surface-subtle/30 flex items-center justify-between gap-3">
              <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                <Calendar size={12} />
                <span>{isVietnamese ? 'Tham gia:' : 'Enrolled:'} {formatDate(c.enrolled_at)}</span>
              </span>
              <Button
                onClick={() => onNavigate(`/course/${c.course_id}`)}
                size="sm"
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl gap-1.5 cursor-pointer"
              >
                <span>{isCompleted ? (isVietnamese ? 'Xem lại bài học' : 'Review course') : (isVietnamese ? 'Tiếp tục học' : 'Continue learning')}</span>
                <ArrowRight size={13} />
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
