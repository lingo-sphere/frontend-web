// Trang hiển thị lịch sử làm bài kiểm tra và thi thử của học viên (Exam History Page).

'use client'

import { BookOpen, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/dashboard/section.heading'
import { useNavigate } from '@/lib/navigation'
import { useExamHistory, UnifiedTestAttempt } from '@/hooks/use.exam.history'
import { ExamHistoryKpi } from '@/components/exam-history/exam.history.kpi'
import { ExamHistoryFilters } from '@/components/exam-history/exam.history.filters'
import { ExamHistoryTable } from '@/components/exam-history/exam.history.table'

export default function ExamHistoryPage() {
  const navigate = useNavigate()
  const {
    isLoading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    stats,
    filteredList,
    unifiedList,
    courseAttempts,
    loadAllHistory,
    formatDate,
    formatDuration,
  } = useExamHistory()

  const handleNavigateDetail = (item: UnifiedTestAttempt) => {
    const query = new URLSearchParams()
    if (item.sourceType) query.set('sourceType', item.sourceType)
    if (item.testType) query.set('testType', item.testType)
    if (item.courseId) query.set('courseId', item.courseId)
    if (item.moduleId) query.set('moduleId', item.moduleId)
    if (item.examId) query.set('examId', item.examId)
    if (item.title) query.set('title', item.title)
    if (item.scoreDisplay) query.set('score', item.scoreDisplay)
    if (item.scoreValue !== undefined) query.set('scoreVal', String(item.scoreValue))
    if (item.correctCount !== undefined) query.set('correct', String(item.correctCount))
    if (item.totalQuestions !== undefined) query.set('total', String(item.totalQuestions))
    if (item.isPassed !== undefined) query.set('isPassed', String(item.isPassed))
    if (item.submittedAt) query.set('submittedAt', item.submittedAt)
    if (item.durationSeconds !== undefined) query.set('duration', String(item.durationSeconds))

    navigate(`/exam-history/${item.id}?${query.toString()}`)
  }

  const handleRetake = (item: UnifiedTestAttempt) => {
    if (item.sourceType === 'TOEIC') {
      navigate(item.examId ? `/toeic/exam/${item.examId}` : '/toeic/exam/placement_2skills')
    } else {
      navigate(
        `/course/${item.courseId}/exam?type=${item.testType}${
          item.moduleId ? `&chapterId=${item.moduleId}` : ''
        }`
      )
    }
  }

  const counts = {
    all: unifiedList.length,
    placement: unifiedList.filter((i) => i.testType === 'PLACEMENT').length,
    toeic: unifiedList.filter((i) => i.sourceType === 'TOEIC' && i.testType !== 'PLACEMENT').length,
    challenge: courseAttempts.filter((c) => c.test_type === 'challenge').length,
    postMini: courseAttempts.filter((c) => c.test_type === 'post-mini').length,
    finalTest: courseAttempts.filter((c) => c.test_type === 'final-test').length,
  }

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <SectionHeading
          eyebrow="Đánh Giá Năng Lực"
          title="Lịch Sử Bài Kiểm Tra & Thi Thử"
          description="Tổng hợp toàn diện kết quả các bài test đầu vào, bài thi thử TOEIC và bài kiểm tra tiến độ trong khóa học."
        />
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={() => navigate('/toeic')}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl gap-1.5 shadow-xs cursor-pointer"
          >
            <BookOpen size={14} />
            <span>Luyện đề TOEIC mới</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => loadAllHistory()}
            className="text-xs font-semibold rounded-xl cursor-pointer"
            title="Tải lại dữ liệu"
          >
            Làm mới
          </Button>
        </div>
      </div>

      <ExamHistoryKpi stats={stats} />

      <ExamHistoryFilters
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        counts={counts}
      />

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-text-secondary">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm font-semibold">Đang tổng hợp lịch sử làm bài...</p>
        </div>
      ) : (
        <ExamHistoryTable
          filteredList={filteredList}
          activeTab={activeTab}
          onNavigateDetail={handleNavigateDetail}
          onRetake={handleRetake}
          onNavigateToeic={() => navigate('/toeic')}
          onNavigatePlacement={() => navigate('/toeic/exam/placement_2skills')}
          formatDate={formatDate}
          formatDuration={formatDuration}
        />
      )}
    </main>
  )
}
