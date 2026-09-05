/**
 * @file course.rating.modal.tsx
 * @description Modal đánh giá khóa học từ 1 đến 5 sao cho học viên
 */

'use client'

import { useState } from 'react'
import { Star, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CourseRatingModalProps {
  courseTitle?: string
  onClose: () => void
  onSubmit: (rating: number, review: string) => void
}

const RATING_LABELS: Record<number, string> = {
  1: 'Rất không hài lòng',
  2: 'Chưa hài lòng',
  3: 'Bình thường',
  4: 'Hài lòng',
  5: 'Cực kỳ hài lòng & Tuyệt vời! ✨',
}

export function CourseRatingModal({ courseTitle, onClose, onSubmit }: CourseRatingModalProps) {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [reviewText, setReviewText] = useState('')

  const activeRating = hoverRating !== null ? hoverRating : rating

  const handleSubmit = () => {
    onSubmit(rating, reviewText)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Star size={18} className="fill-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Đánh giá khóa học</h3>
              {courseTitle && (
                <p className="text-[11px] text-text-tertiary truncate max-w-[260px]">{courseTitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          Đánh giá của bạn giúp giảng viên hoàn thiện bài giảng và hỗ trợ các học viên khác lựa chọn khóa học phù hợp!
        </p>

        
        <div className="flex flex-col items-center justify-center py-3 bg-surface-subtle/50 rounded-2xl border border-border/50 space-y-2">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= activeRating
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setRating(star)}
                  className="p-1.5 transition-all duration-150 hover:scale-125 focus:outline-none cursor-pointer"
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      isFilled
                        ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                        : 'text-zinc-300 dark:text-zinc-600 fill-transparent'
                    }`}
                  />
                </button>
              )
            })}
          </div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
            {RATING_LABELS[activeRating] || `${activeRating} sao`}
          </span>
        </div>

        
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary">Nhận xét chi tiết (Tùy chọn):</label>
          <textarea
            rows={3}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Chia sẻ cảm nhận về chất lượng giảng dạy, bài tập hoặc kiến thức bạn thu nhận được..."
            className="w-full rounded-2xl border border-border bg-surface p-3.5 text-xs text-text-primary placeholder:text-text-disabled focus:border-primary focus:outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-1">
          <Button variant="ghost" onClick={onClose} className="text-xs font-semibold rounded-xl cursor-pointer">
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary text-white hover:bg-primary-hover text-xs font-bold rounded-xl px-5 flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Gửi đánh giá</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
