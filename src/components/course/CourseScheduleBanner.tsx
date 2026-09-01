'use client'

/**
 * @file CourseScheduleBanner.tsx
 * @description Component giao diện React CourseScheduleBanner cho học viên
 */

import { useTranslation } from 'react-i18next'
import { Clock, X } from 'lucide-react'

interface CourseScheduleBannerProps {
  onOpenModal: () => void
  onDismiss: () => void
}

export function CourseScheduleBanner({
  onOpenModal,
  onDismiss,
}: CourseScheduleBannerProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary mt-0.5">
          <Clock size={22} />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-sm sm:text-base font-bold text-text-primary">
            {isVi ? 'Lên lịch học tập hàng ngày' : 'Schedule learning time'}
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-3xl">
            {isVi
              ? 'Học một chút mỗi ngày tạo nên sự khác biệt lớn. Nghiên cứu não bộ chỉ ra rằng học viên duy trì thói quen học ngắt quãng đạt điểm TOEIC cao hơn 68%. Hãy đặt lịch và nhận thông báo nhắc học thông minh.'
              : 'Learning a little each day adds up. Research shows that students who make learning a habit are more likely to reach their goals. Set time aside to learn and get reminders using your learning scheduler.'}
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onOpenModal}
              className="rounded-xl border border-border bg-surface px-5 py-2 text-xs font-bold text-text-primary hover:bg-surface-hover hover:border-primary transition-all cursor-pointer shadow-sm"
            >
              {isVi ? 'Bắt đầu lên lịch' : 'Get started'}
            </button>
            <button
              onClick={onDismiss}
              className="text-xs font-semibold text-text-tertiary hover:text-text-primary transition-colors cursor-pointer px-2 py-1"
            >
              {isVi ? 'Bỏ qua' : 'Dismiss'}
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors"
        title={isVi ? 'Đóng' : 'Close'}
      >
        <X size={16} />
      </button>
    </div>
  )
}
