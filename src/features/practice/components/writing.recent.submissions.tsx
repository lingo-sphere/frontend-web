/**
 * @file writing.recent.submissions.tsx
 * @description Thành phần hiển thị danh sách các bài viết đã nộp gần đây kèm điểm số và trạng thái chấm bài
 */

'use client'

import { Calendar, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import type { WritingSubmission, WritingExercise } from '@/features/practice/types/writing'

interface WritingRecentSubmissionsProps {
  recentSubmissions: WritingSubmission[]
  exercises: WritingExercise[]
  isVietnamese: boolean
  onViewSubmission: (submission: WritingSubmission) => void
  onViewHistory: () => void
}

function formatTimeAgo(dateString: string, isVietnamese: boolean): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return isVietnamese ? 'Vừa xong' : 'Just now'
  if (diffMins < 60) return isVietnamese ? `${diffMins} phút trước` : `${diffMins} min ago`
  if (diffHours < 24) return isVietnamese ? `${diffHours} giờ trước` : `${diffHours} hours ago`
  if (diffDays < 7) return isVietnamese ? `${diffDays} ngày trước` : `${diffDays} days ago`
  return date.toLocaleDateString(isVietnamese ? 'vi-VN' : 'en-US')
}

export function WritingRecentSubmissions({
  recentSubmissions,
  exercises,
  isVietnamese,
  onViewSubmission,
  onViewHistory,
}: WritingRecentSubmissionsProps) {
  const getExercise = (exerciseId: string) => {
    return exercises.find((ex) => ex.id === exerciseId)
  }

  return (
    <section className="mb-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[16px] font-semibold text-text-primary">
          {isVietnamese ? 'Bài đã nộp gần đây' : 'Recent Submissions'}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary cursor-pointer"
          onClick={onViewHistory}
        >
          {isVietnamese ? 'Xem tất cả' : 'View All'}
          <ChevronRight size={16} />
        </Button>
      </div>
      <div className="space-y-3">
        {recentSubmissions.slice(0, 3).map((submission) => {
          const exercise = getExercise(submission.exercise_id)
          return (
            <Card
              key={submission.id}
              className="dashboard-card cursor-pointer transition-all hover:shadow-md"
              onClick={() => onViewSubmission(submission)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-medium text-text-primary">
                      {exercise?.title || submission.exercise_id}
                    </p>
                    {exercise?.cefr_level && (
                      <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                        {exercise.cefr_level}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[12px] text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {submission.submitted_at &&
                        formatTimeAgo(submission.submitted_at, isVietnamese)}
                    </span>
                    <span>
                      {submission.word_count} {isVietnamese ? 'từ' : 'words'}
                    </span>
                  </div>
                </div>
                {submission.overall_score !== undefined ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-bold text-primary">
                      {Math.max(0, Math.min(100, submission.overall_score)).toFixed(1)}
                    </span>
                    <span className="text-[12px] text-text-tertiary">/100</span>
                  </div>
                ) : submission.is_correct !== undefined ? (
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      submission.is_correct ? 'bg-emerald-100' : 'bg-red-100'
                    }`}
                  >
                    <span
                      className={`text-[14px] font-bold ${
                        submission.is_correct
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}
                    >
                      {submission.is_correct ? '✓' : '✗'}
                    </span>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
