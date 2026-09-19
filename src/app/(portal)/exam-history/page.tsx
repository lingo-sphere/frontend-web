// Trang hiển thị lịch sử làm bài kiểm tra và biểu đồ miền phát triển năng lực của học viên
'use client'

import { useState, useMemo } from 'react'
import { BookOpen, Loader2, ListFilter, TrendingUp } from 'lucide-react'
import { Button } from '@/components/button'
import { SectionHeading } from '@/features/dashboard/components/section.heading'
import { useNavigate } from '@/lib/navigation'
import { useExamHistory, UnifiedTestAttempt } from '@/features/toeic/hooks/use.exam.history'
import { ExamHistoryKpi } from '@/features/toeic/components/exam.history.kpi'
import { ExamHistoryFilters } from '@/features/toeic/components/exam.history.filters'
import { ExamHistoryTable } from '@/features/toeic/components/exam.history.table'
import { ProgressGrowthAnalyticsTab } from '@/features/progress/components/progress.growth.analytics.tab'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useCoursesProgressQuery } from '@/features/progress/hooks/use.progress.query'
import type { ProgressRecentActivity, UnifiedCourseCardItem } from '@/features/progress/hooks/use.progress.data'

export default function ExamHistoryPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [viewMode, setViewMode] = useState<'LIST' | 'CHART'>('LIST')

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
    courseTitleMap,
    allCourses,
    loadAllHistory,
    formatDate,
    formatDuration,
  } = useExamHistory()

  const { data: coursesProgress = [] } = useCoursesProgressQuery(Boolean(user))

  const baselineScore = Number(user?.placement_test_score) || 0
  const targetScore = Number(user?.target_toeic_score) || 0
  const listeningScore = Number(user?.placement_listening_score) || 0
  const readingScore = Number(user?.placement_reading_score) || 0

  const recentActivities = useMemo<ProgressRecentActivity[]>(() => {
    return unifiedList.map((item) => ({
      id: item.id,
      courseId: item.courseId,
      moduleId: item.moduleId,
      type: item.sourceType,
      examType: item.testType,
      title: item.title,
      subtitle: item.subtitle || '',
      scoreText: item.scoreDisplay,
      scoreValue: Number(item.scoreValue || 0),
      maxScore: item.sourceType === 'TOEIC' ? 990 : 100,
      scorePercentage: item.totalQuestions
        ? Math.round(((item.correctCount || 0) / item.totalQuestions) * 100)
        : 0,
      correctCount: item.correctCount || 0,
      totalQuestions: item.totalQuestions || 0,
      listeningScore: item.listeningScore,
      readingScore: item.readingScore,
      durationSeconds: item.durationSeconds,
      isPassed: Boolean(item.isPassed),
      isBestAttempt: item.isBestAttempt,
      submittedAt: item.submittedAt || new Date().toISOString(),
    }))
  }, [unifiedList])

  const enrolledCourseCards = useMemo<UnifiedCourseCardItem[]>(() => {
    return coursesProgress.map((cp) => {
      const matched = allCourses.find(
        (c) => String(c._id) === String(cp.course_id) || String(c.id) === String(cp.course_id)
      )
      const courseTitle = matched?.title || courseTitleMap[cp.course_id] || 'Khóa học'

      return {
        course_id: cp.course_id,
        title: courseTitle,
        target_score: matched?.target_score,
        category: matched?.category || 'TOEIC',
        progress_percentage: cp.progress_percentage || 0,
        completed_lessons_count: cp.completed_lessons_count || 0,
        total_lessons_count: cp.total_lessons_count || matched?.total_lessons || 1,
        completed_modules_count: cp.completed_modules_count || 0,
        total_modules_count: cp.total_modules_count || matched?.total_modules || 1,
        status: (cp.progress_percentage || 0) >= 100 ? 'COMPLETED' : 'STUDYING',
        enrolled_at: new Date().toISOString(),
      }
    })
  }, [coursesProgress, allCourses, courseTitleMap])

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
        }&retry=true`
      )
    }
  }

  const counts = {
    all: unifiedList.length,
    placement: unifiedList.filter((i) => i.testType === 'PLACEMENT').length,
    toeic: unifiedList.filter((i) => i.sourceType === 'TOEIC' && i.testType !== 'PLACEMENT').length,
    chapterTest: courseAttempts.filter((c) => c.test_type === 'challenge' || c.test_type === 'post-mini').length,
    finalTest: courseAttempts.filter((c) => c.test_type === 'final-test').length,
  }

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <SectionHeading
          eyebrow="Đánh Giá Năng Lực"
          title="Lịch Sử Bài Kiểm Tra & Thi Thử"
          description="Tổng hợp toàn diện kết quả các bài test đầu vào, bài thi thử TOEIC và biểu đồ miền tăng trưởng năng lực."
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

      {!isAuthenticated && (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center flex flex-col items-center justify-center gap-3">
          <BookOpen size={40} className="text-text-tertiary" />
          <h3 className="text-base font-bold text-text-primary">Đăng nhập để theo dõi lịch sử làm bài thi</h3>
          <p className="text-xs text-text-secondary max-w-md">
            Lưu lại toàn bộ kết quả thi thử, điểm Listening/Reading, và biểu đồ phát triển năng lực chuẩn xác nhất.
          </p>
          <Button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('lingosphere:open-auth-modal'))
              }
            }}
            className="mt-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs cursor-pointer"
          >
            Đăng nhập ngay
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setViewMode('LIST')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            viewMode === 'LIST'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
          }`}
        >
          <ListFilter size={14} />
          <span>Danh sách bài thi ({counts.all})</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('CHART')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            viewMode === 'CHART'
              ? 'bg-gradient-to-r from-indigo-600 to-primary text-white shadow-xs'
              : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
          }`}
        >
          <TrendingUp size={14} />
          <span>Biểu đồ miền phát triển năng lực</span>
        </button>
      </div>

      {viewMode === 'CHART' ? (
        <ProgressGrowthAnalyticsTab
          recentActivities={recentActivities}
          enrolledCourseCards={enrolledCourseCards}
          targetScore={targetScore}
          baselineScore={baselineScore}
          listeningScore={listeningScore}
          readingScore={readingScore}
          onNavigate={navigate}
        />
      ) : (
        <>
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
        </>
      )}
    </main>
  )
}
