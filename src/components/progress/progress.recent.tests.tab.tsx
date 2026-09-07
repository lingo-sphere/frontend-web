// Component hiển thị danh sách các bài kiểm tra và đề thi TOEIC hoàn thành gần đây

import { Award, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ProgressRecentActivity } from '@/hooks/use.progress.data'

interface ProgressRecentTestsTabProps {
  recentActivities: ProgressRecentActivity[]
  onNavigate: (path: string) => void
}

export function ProgressRecentTestsTab({
  recentActivities,
  onNavigate,
}: ProgressRecentTestsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-text-primary">5 bài kiểm tra hoàn thành gần đây</h4>
        <Button
          onClick={() => onNavigate('/exam-history')}
          variant="outline"
          size="sm"
          className="text-xs font-semibold rounded-xl gap-1.5 cursor-pointer"
        >
          <span>Xem toàn bộ lịch sử thi</span>
          <ArrowRight size={13} />
        </Button>
      </div>

      {recentActivities.length === 0 ? (
        <Card className="border-dashed p-8 text-center space-y-3">
          <Award size={28} className="mx-auto text-text-tertiary" />
          <p className="text-xs text-text-secondary">Chưa có bài kiểm tra nào được hoàn thành gần đây.</p>
          <Button
            onClick={() => onNavigate('/toeic')}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Làm đề thi thử ngay
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {recentActivities.map((item) => (
            <Card
              key={item.id}
              onClick={() => {
                if (item.type === 'TOEIC') {
                  onNavigate(`/exam-history/${item.id}`)
                } else if (item.courseId) {
                  onNavigate(`/course/${item.courseId}`)
                } else {
                  onNavigate('/exam-history')
                }
              }}
              className="dashboard-card hover:border-primary/50 transition-all p-4 flex items-center justify-between gap-4 cursor-pointer"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      item.type === 'TOEIC'
                        ? 'bg-indigo-600 text-white text-[10px]'
                        : 'bg-amber-600 text-white text-[10px]'
                    }
                  >
                    {item.type === 'TOEIC' ? 'Đề thi TOEIC' : 'Khóa học'}
                  </Badge>
                  <span className="text-xs font-bold text-text-primary truncate">
                    {item.title}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary truncate">{item.subtitle}</p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-black text-text-primary">{item.scoreText}</div>
                <span
                  className={`text-[10px] font-bold ${
                    item.isPassed ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {item.isPassed ? 'Đạt chuẩn' : 'Chưa đạt'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
