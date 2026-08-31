'use client'

import { useState } from 'react'
import { Star, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CourseRatingModalProps {
  onClose: () => void
  onSubmit: (rating: number, review: string) => void
}

export function CourseRatingModal({ onClose, onSubmit }: CourseRatingModalProps) {
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')

  const handleSubmit = () => {
    onSubmit(rating, reviewText)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-text-primary">Đánh giá khóa học</h3>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-text-secondary">
          Bạn đánh giá chất lượng bài giảng và phương pháp tư duy của khóa học này như thế nào?
        </p>
        <div className="flex justify-center gap-2 py-3 text-warning">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="p-1 hover:scale-125 transition-transform"
            >
              <Star size={28} fill={star <= rating ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
        <textarea
          rows={3}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Chia sẻ thêm cảm nhận và tiến bộ của bạn..."
          className="w-full rounded-xl border border-border bg-surface p-3 text-xs text-text-primary resize-none"
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} className="text-xs">
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary text-white hover:bg-primary-hover text-xs rounded-xl px-5"
          >
            Gửi đánh giá
          </Button>
        </div>
      </div>
    </div>
  )
}
