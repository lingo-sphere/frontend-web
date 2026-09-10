// Component hiển thị danh sách các bài thi và kiểm tra đã hoàn thành.

import {
  Trophy,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  RotateCcw,
  FileQuestion,
} from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { UnifiedTestAttempt, ExamHistoryTab } from '@/features/toeic/hooks/use.exam.history'

interface ExamHistoryTableProps {
  filteredList: UnifiedTestAttempt[]
  activeTab: ExamHistoryTab
  onNavigateDetail: (item: UnifiedTestAttempt) => void
  onRetake: (item: UnifiedTestAttempt) => void
  onNavigateToeic: () => void
  onNavigatePlacement: () => void
  formatDate: (dateStr?: string) => string
  formatDuration: (seconds?: number) => string
}

export function ExamHistoryTable({
  filteredList,
  activeTab,
  onNavigateDetail,
  onRetake,
  onNavigateToeic,
  onNavigatePlacement,
  formatDate,
  formatDuration,
}: ExamHistoryTableProps) {
  if (filteredList.length === 0) {
    return (
      <div className="py-16 text-center rounded-2xl border border-dashed border-border bg-surface-subtle/50 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
          <FileQuestion size={24} />
        </div>
        <h3 className="text-base font-bold text-text-primary">
          {activeTab === 'PLACEMENT' ? 'Chưa có bài test đầu vào nào' : 'Chưa có bài kiểm tra nào'}
        </h3>
        <p className="text-xs text-text-secondary max-w-sm mx-auto">
          {activeTab === 'PLACEMENT'
            ? 'Bạn chưa hoàn thành bài test đánh giá năng lực đầu vào. Hãy làm bài test nhanh để hệ thống gợi ý lộ trình phù hợp nhất nhé!'
            : 'Bạn chưa hoàn thành bài thi nào trong mục này. Hãy thử sức với các đề thi TOEIC hoặc bài tập khóa học để ghi nhận kết quả nhé!'}
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          {activeTab === 'PLACEMENT' ? (
            <Button
              onClick={onNavigatePlacement}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Làm bài Test đầu vào ngay
            </Button>
          ) : (
            <>
              <Button
                onClick={onNavigateToeic}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Làm đề thi TOEIC
              </Button>
              <Button
                onClick={onNavigatePlacement}
                variant="outline"
                className="text-xs font-semibold rounded-xl cursor-pointer"
              >
                Test đầu vào
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {filteredList.map((item) => {
        const isToeic = item.sourceType === 'TOEIC'
        const isPlacement = item.testType === 'PLACEMENT'
        const isChallenge = item.testType === 'challenge'
        const isFinal = item.testType === 'final-test'

        let badgeClass = 'bg-indigo-600 text-white'
        let badgeText = 'Đề thi TOEIC'

        if (isPlacement) {
          badgeClass = 'bg-sky-600 text-white'
          badgeText = 'Test đầu vào'
        } else if (!isToeic) {
          if (isChallenge) {
            badgeClass = 'bg-amber-600 text-white'
            badgeText = 'Thử thách chương'
          } else if (isFinal) {
            badgeClass = 'bg-purple-600 text-white'
            badgeText = 'Tốt nghiệp Exit Test'
          } else {
            badgeClass = 'bg-emerald-600 text-white'
            badgeText = 'Kiểm tra chương'
          }
        }

        return (
          <Card
            key={item.id}
            onClick={() => onNavigateDetail(item)}
            className="dashboard-card group p-5 border-border hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
          >
            <CardContent className="p-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-2xl bg-surface-subtle border border-border/80 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-primary/30 transition-colors">
                  {isToeic ? (
                    <Trophy size={20} className={isPlacement ? 'text-sky-600' : 'text-primary'} />
                  ) : (
                    <BookOpen size={20} className="text-emerald-600" />
                  )}
                </div>

                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${badgeClass} text-[10px] font-bold px-2 py-0.5 rounded-md`}>
                      {badgeText}
                    </Badge>
                    <h3 className="text-sm sm:text-base font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                      {item.title}
                    </h3>
                  </div>

                  {item.subtitle && (
                    <p className="text-xs text-text-secondary font-medium truncate">
                      {item.subtitle}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-text-tertiary flex-wrap pt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      <span>{formatDate(item.submittedAt)}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      <span>{formatDuration(item.durationSeconds)}</span>
                    </span>
                    <span>•</span>
                    <span>
                      Tổng số câu: <strong>{item.totalQuestions}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-5 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-border/60">
                <div className="flex items-center gap-4 text-left">
                  <div>
                    <span className="text-[11px] font-semibold text-text-tertiary block">
                      Điểm số
                    </span>
                    <div className="text-base sm:text-lg font-black text-primary">
                      {item.scoreDisplay}
                    </div>
                  </div>

                  <div className="h-8 w-px bg-border/80" />

                  <div>
                    <span className="text-[11px] font-semibold text-text-tertiary block">
                      Kết quả
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold">
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 size={13} />
                        {item.correctCount}
                      </span>
                      <span className="text-text-tertiary">/</span>
                      <span className="text-rose-500 flex items-center gap-0.5">
                        <XCircle size={13} />
                        {item.incorrectCount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onNavigateDetail(item)
                    }}
                    className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Eye size={14} />
                    <span>Xem chi tiết</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRetake(item)
                    }}
                    className="rounded-xl gap-1.5 text-xs font-semibold cursor-pointer hover:border-primary/40"
                  >
                    <RotateCcw size={14} />
                    <span>{isToeic ? 'Làm lại' : 'Làm lại bài'}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
