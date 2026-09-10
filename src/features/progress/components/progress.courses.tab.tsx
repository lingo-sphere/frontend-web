// Component hiển thị danh sách các khóa học đã ghi danh và tiến trình học tập

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

export function ProgressCoursesTab({
  enrolledCourseCards,
  onNavigate,
  formatDate,
}: ProgressCoursesTabProps) {
  if (enrolledCourseCards.length === 0) {
    return (
      <Card className="border-dashed p-8 sm:p-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
          <BookOpen size={28} />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-bold text-text-primary">Chưa có khóa học nào được ghi nhận</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Bạn chưa tham gia khóa học nào. Hãy đăng ký ngay các khóa học luyện thi TOEIC chuẩn đầu ra để bắt đầu học tập và theo dõi tiến trình nhé!
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Button
            onClick={() => onNavigate('/courses')}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Khám phá khóa học
          </Button>
          <Button
            onClick={() => onNavigate('/toeic/exam/placement_2skills')}
            variant="outline"
            className="text-xs font-semibold rounded-xl cursor-pointer"
          >
            Làm Test đầu vào
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
                      {c.category}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      {c.level}
                    </Badge>
                    {isCompleted && (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        <CheckCircle2 size={11} className="mr-1" /> Đã hoàn thành
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
                  <span className="font-semibold text-text-secondary">Tiến độ bài học:</span>
                  <span className="font-bold text-primary">{c.progress_percentage}%</span>
                </div>
                <Progress value={c.progress_percentage} className="h-2 bg-surface-subtle" />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-text-secondary">
                <div className="p-2.5 rounded-xl bg-surface-subtle/60 border border-border/50">
                  <span className="block text-[10px] text-text-tertiary">Bài học:</span>
                  <span className="font-bold text-text-primary">
                    {c.completed_lessons_count}/{c.total_lessons_count > 0 ? c.total_lessons_count : 1} bài
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-subtle/60 border border-border/50">
                  <span className="block text-[10px] text-text-tertiary">Chương học:</span>
                  <span className="font-bold text-text-primary">
                    {c.completed_modules_count}/{c.total_modules_count > 0 ? c.total_modules_count : 1} chương
                  </span>
                </div>
              </div>
            </CardContent>

            <div className="p-4 border-t border-border bg-surface-subtle/30 flex items-center justify-between gap-3">
              <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                <Calendar size={12} />
                <span>Tham gia: {formatDate(c.enrolled_at)}</span>
              </span>
              <Button
                onClick={() => onNavigate(`/course/${c.course_id}`)}
                size="sm"
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl gap-1.5 cursor-pointer"
              >
                <span>{isCompleted ? 'Xem lại bài học' : 'Tiếp tục học'}</span>
                <ArrowRight size={13} />
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
