'use client'

/**
 * @file CourseReviewsTab.tsx
 * @description Component giao diện React CourseReviewsTab cho học viên
 */

import { Star } from 'lucide-react'
import type { CourseReviewItem } from '@/types/course'

interface CourseReviewsTabProps {
  reviewsList: CourseReviewItem[]
  rating?: number
  ratingCount?: number
}

export function CourseReviewsTab({
  reviewsList,
  rating = 4.8,
  ratingCount = 1420,
}: CourseReviewsTabProps) {
  const ratingDistribution = [
    { stars: 5, percent: 82 },
    { stars: 4, percent: 14 },
    { stars: 3, percent: 3 },
    { stars: 2, percent: 1 },
    { stars: 1, percent: 0 },
  ]

  return (
    <div className="space-y-8 pt-2">
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center rounded-2xl border border-border bg-surface p-6">
        <div className="md:col-span-4 text-center md:border-r border-border md:pr-6 space-y-2">
          <div className="text-5xl font-black text-primary">{rating.toFixed(1)}</div>
          <div className="flex items-center justify-center gap-1 text-warning">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={18} fill="currentColor" />
            ))}
          </div>
          <div className="text-xs font-semibold text-text-tertiary">
            Đánh giá khóa học • {ratingCount.toLocaleString('en-US')} lượt đánh giá
          </div>
        </div>

        <div className="md:col-span-8 space-y-2.5">
          {ratingDistribution.map((row) => (
            <div key={row.stars} className="flex items-center gap-3 text-xs">
              <div className="w-12 text-text-secondary font-medium shrink-0 flex items-center gap-1">
                <span>{row.stars}</span>
                <Star size={12} fill="currentColor" className="text-warning" />
              </div>
              <div className="flex-1 h-2 rounded-full bg-surface-subtle overflow-hidden">
                <div
                  className="h-full bg-warning rounded-full transition-all duration-500"
                  style={{ width: `${row.percent}%` }}
                />
              </div>
              <div className="w-10 text-right text-text-tertiary font-mono">{row.percent}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Review items */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-text-primary">Đánh giá từ học viên nổi bật</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviewsList.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-border bg-surface p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary-soft flex items-center justify-center text-primary font-bold text-xs">
                    {rev.author.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-primary">{rev.author}</div>
                    <div className="flex items-center gap-1 text-warning mt-0.5">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} size={11} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-text-tertiary">{rev.date}</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{rev.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
