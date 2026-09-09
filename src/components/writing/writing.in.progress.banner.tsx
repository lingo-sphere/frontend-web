// Banner hiển thị bài viết đang làm dở cho học viên.
'use client'

import { TrendingUp, PenLine } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ContinueWriting } from '@/types/writing'

interface WritingInProgressBannerProps {
  continueWriting: ContinueWriting
  isVietnamese: boolean
  onContinue: (submissionId: string) => void
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

export function WritingInProgressBanner({
  continueWriting,
  isVietnamese,
  onContinue,
}: WritingInProgressBannerProps) {
  return (
    <section className="mb-6">
      <Card className="dashboard-card border-amber-200 bg-amber-50/50">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                  <PenLine className="w-3 h-3" />
                  <span>{isVietnamese ? 'Đang làm dở' : 'In Progress'}</span>
                </span>
                <span className="text-[12px] text-text-tertiary">
                  {continueWriting.exercise_type.replace('_', ' ')} • {continueWriting.writing_level}
                </span>
              </div>
              <h3 className="text-[16px] font-semibold text-text-primary">
                {continueWriting.exercise_title}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-[13px] text-text-secondary">
                <span className="flex items-center gap-1">
                  <TrendingUp size={14} />
                  {isVietnamese ? 'Tiến độ' : 'Progress'}: {continueWriting.progress_percent}%
                </span>
                <span>
                  {continueWriting.word_count} {isVietnamese ? 'từ' : 'words'}
                </span>
                <span className="text-text-tertiary">
                  {isVietnamese ? 'Lưu' : 'Saved'}: {formatTimeAgo(continueWriting.last_saved_at, isVietnamese)}
                </span>
              </div>

              <p className="mt-3 line-clamp-2 text-[13px] italic text-text-secondary">
                "{continueWriting.content}"
              </p>
            </div>
            <Button
              size="lg"
              className="gap-2 bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
              onClick={() => onContinue(continueWriting.submission_id)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              {isVietnamese ? 'Tiếp tục làm bài' : 'Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
