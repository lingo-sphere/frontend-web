/**
 * @file course.workspace.tabs.tsx
 * @description Quản lý hiển thị các tab nội dung bài học: Tổng quan, Tiến độ, Tài liệu, Hỏi đáp, Ghi chú và Đánh giá.
 */

'use client'

import { CourseOverviewTab } from '@/components/course/course.overview.tab'
import { CourseGrowthChart } from '@/components/course/course.growth.chart'
import { CourseResourcesTab } from '@/components/course/course.resources.tab'
import { CourseQnATab } from '@/components/course/course.qna.tab'
import { CourseNotesTab } from '@/components/course/course.notes.tab'
import { CourseReviewsTab } from '@/components/course/course.reviews.tab'
import type { Course, Lesson } from '@/types/course'

export type BottomTab = 'overview' | 'progress' | 'resources' | 'qna' | 'notes' | 'reviews'

interface CourseWorkspaceTabsProps {
  course: Course
  currentLesson: Lesson | null
  activeTab: BottomTab
  isEnrolled: boolean
  isAuthenticated: boolean
  currentUserId?: string
  currentUserRole?: string
  playerCurrentTime: number
  progressDetail: any
  onTabChange: (tab: BottomTab) => void
  onInitiateEnrollOrBuy: () => void
  onCreateQnA: (title: string, body: string, isAnonymous?: boolean) => void
  onAddQnAAnswer: (qnaId: string, body: string) => void
  onUpvoteQnA: (qnaId: string) => void
  onAddNote: (timestamp: number, content?: string) => void
  onDeleteNote: (noteId: string) => void
  onAddReview: (rating: number, content: string) => Promise<void>
}

export function CourseWorkspaceTabs({
  course,
  currentLesson,
  activeTab,
  isEnrolled,
  isAuthenticated,
  currentUserId,
  currentUserRole,
  playerCurrentTime,
  progressDetail,
  onTabChange,
  onInitiateEnrollOrBuy,
  onCreateQnA,
  onAddQnAAnswer,
  onUpvoteQnA,
  onAddNote,
  onDeleteNote,
  onAddReview,
}: CourseWorkspaceTabsProps) {
  const tabsList = [
    { id: 'overview' as const, label: 'Tổng quan (Overview)' },
    { id: 'progress' as const, label: 'Tiến độ & Tăng trưởng' },
    {
      id: 'resources' as const,
      label: `Tài liệu (Resources) ${
        (currentLesson?.resources?.length || 0) > 0 ? `(${currentLesson?.resources?.length})` : ''
      }`,
    },
    {
      id: 'qna' as const,
      label: `Hỏi & Đáp (Q&A) ${course.qna?.length ? `(${course.qna.length})` : ''}`,
    },
    {
      id: 'notes' as const,
      label: `Ghi chú (Notes) ${course.notes?.length ? `(${course.notes.length})` : ''}`,
    },
    { id: 'reviews' as const, label: 'Đánh giá (Reviews)' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full max-w-7xl">
      {isEnrolled && progressDetail && !progressDetail.course_progress?.is_baseline_established && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎯</span>
            <div className="text-xs">
              <p className="font-extrabold text-sm text-amber-900 dark:text-amber-100">
                Thiết lập mốc năng lực ban đầu (Baseline)
              </p>
              <p className="text-amber-800/90 dark:text-amber-200/80 mt-0.5">
                Bạn chưa có điểm mốc Baseline để so sánh mức độ cải thiện. Hệ thống sẽ tự động lấy kết quả Post-mini Test của Chương 1 làm mốc ban đầu, hoặc bạn có thể cập nhật trong Hồ sơ cá nhân!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-6 border-b border-border text-xs sm:text-sm font-bold tracking-wide overflow-x-auto no-scrollbar">
        {tabsList.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`pb-3 transition-all whitespace-nowrap relative cursor-pointer ${
                isActive
                  ? 'text-primary border-b-2 border-primary font-extrabold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'overview' && <CourseOverviewTab course={course} />}

      {activeTab === 'progress' && (
        <div className="space-y-6">
          <CourseGrowthChart
            growthData={progressDetail?.course_progress?.growth_chart_data}
            baselineScore={progressDetail?.course_progress?.baseline_score}
            baselineSource={progressDetail?.course_progress?.baseline_source}
            isBaselineEstablished={progressDetail?.course_progress?.is_baseline_established}
            totalScoreGrowth={progressDetail?.course_progress?.total_score_growth}
            totalGrowthPercentage={progressDetail?.course_progress?.total_growth_percentage}
            finalTestScore={progressDetail?.course_progress?.final_test_score}
          />
        </div>
      )}

      {activeTab === 'resources' && (
        <CourseResourcesTab
          currentLesson={currentLesson}
          course={course}
          isEnrolled={isEnrolled}
          onOpenCheckout={onInitiateEnrollOrBuy}
        />
      )}

      {activeTab === 'qna' && (
        <CourseQnATab
          qnaList={course.qna || []}
          currentLessonTitle={currentLesson?.title || ''}
          isEnrolled={isEnrolled}
          isAuthenticated={isAuthenticated}
          currentUserRole={currentUserRole}
          currentUserId={currentUserId}
          onCreateQuestion={onCreateQnA}
          onAddAnswer={onAddQnAAnswer}
          onUpvote={onUpvoteQnA}
        />
      )}

      {activeTab === 'notes' && (
        <CourseNotesTab
          notesList={course.notes || []}
          currentLessonId={currentLesson?.id || ''}
          currentLessonTitle={currentLesson?.title || ''}
          currentTime={playerCurrentTime}
          isEnrolled={isEnrolled}
          isAuthenticated={isAuthenticated}
          onSeekTo={() => {}}
          onAddNote={(content, timestamp) => onAddNote(timestamp, content)}
          onDeleteNote={onDeleteNote}
        />
      )}

      {activeTab === 'reviews' && (
        <CourseReviewsTab
          reviewsList={course.reviews || []}
          rating={course.rating}
          ratingCount={course.ratingCount}
          isEnrolled={isEnrolled}
          isAuthenticated={isAuthenticated}
          onAddReview={onAddReview}
        />
      )}
    </div>
  )
}
