/**
 * @file course.reviews.tab.tsx
 * @description Thành phần Course Reviews Tab phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file CourseReviewsTab.tsx
 * @description Component giao diện React CourseReviewsTab cho học viên kèm form đánh giá trực tiếp
 */

import { useState } from 'react'
import { Star, Send, MessageSquarePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CourseReviewItem } from '@/types/course'

interface CourseReviewsTabProps {
  reviewsList: CourseReviewItem[]
  rating?: number
  ratingCount?: number
  isEnrolled?: boolean
  isAuthenticated?: boolean
  onAddReview?: (rating: number, content: string) => Promise<void>
}

export function CourseReviewsTab({
  reviewsList,
  rating = 5.0,
  ratingCount = 0,
  isEnrolled = true,
  isAuthenticated = true,
  onAddReview,
}: CourseReviewsTabProps) {
  const [selectedRating, setSelectedRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [reviewContent, setReviewContent] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false)

  const effectiveCount = Math.max(ratingCount, reviewsList.length)
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviewsList.filter((r) => Math.round(r.rating) === stars).length
    const percent = reviewsList.length > 0 ? Math.round((count / reviewsList.length) * 100) : stars === 5 ? 100 : 0
    return { stars, percent }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !onAddReview) return
    setIsSubmitting(true)
    try {
      await onAddReview(selectedRating, reviewContent.trim())
      setReviewContent('')
      setShowReviewForm(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 pt-2">
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center rounded-2xl border border-border bg-surface p-6">
        <div className="md:col-span-4 text-center md:border-r border-border md:pr-6 space-y-2">
          <div className="text-5xl font-black text-primary">{rating.toFixed(1)}</div>
          <div className="flex items-center justify-center gap-1 text-warning">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={18}
                fill={i < Math.round(rating) ? 'currentColor' : 'none'}
                className={i < Math.round(rating) ? 'text-warning' : 'text-text-tertiary'}
              />
            ))}
          </div>
          <div className="text-xs font-semibold text-text-tertiary">
            Đánh giá khóa học • {effectiveCount.toLocaleString('en-US')} lượt đánh giá
          </div>
          {isEnrolled && isAuthenticated ? (
            onAddReview && !showReviewForm && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReviewForm(true)}
                  className="gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <MessageSquarePlus size={14} />
                  Viết đánh giá của bạn
                </Button>
              </div>
            )
          ) : (
            <div className="pt-2 text-[11px] text-text-tertiary">
              🔒 Đăng ký khóa học để gửi đánh giá
            </div>
          )}
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

      
      {showReviewForm && onAddReview && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-primary/20 bg-primary-soft/10 p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-text-primary">Đánh giá trải nghiệm học tập của bạn</h4>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="text-xs text-text-tertiary hover:text-text-primary cursor-pointer"
            >
              Hủy
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-text-secondary mr-1">Chấm điểm:</span>
            {Array.from({ length: 5 }).map((_, i) => {
              const starVal = i + 1
              return (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setSelectedRating(starVal)}
                  onMouseEnter={() => setHoverRating(starVal)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    size={22}
                    fill={(hoverRating || selectedRating) >= starVal ? 'currentColor' : 'none'}
                    className={(hoverRating || selectedRating) >= starVal ? 'text-warning' : 'text-text-tertiary'}
                  />
                </button>
              )
            })}
            <span className="text-xs font-bold text-warning ml-2 font-mono">{selectedRating} / 5 Sao</span>
          </div>

          <textarea
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
            placeholder="Chia sẻ nhận xét của bạn về chất lượng bài giảng, giảng viên hoặc kiến thức tiếp thu được..."
            rows={3}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-xs text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none resize-none"
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowReviewForm(false)}
              className="text-xs cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              size="sm"
              className="gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <Send size={13} />
              {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </div>
        </form>
      )}

      
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          Đánh giá từ học viên {reviewsList.length > 0 ? `(${reviewsList.length})` : ''}
        </h3>
        {reviewsList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-text-tertiary">
            Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ cảm nhận về khóa học này!
          </div>
        ) : (
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
                {rev.content && (
                  <p className="text-xs text-text-secondary leading-relaxed">{rev.content}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
