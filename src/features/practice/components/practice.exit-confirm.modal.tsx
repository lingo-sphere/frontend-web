'use client'

/**
 * @file practice.exit-confirm.modal.tsx
 * @description Hộp thoại xác nhận khi người dùng muốn thoát bài luyện tập dở dang.
 * Tự động thông báo trạng thái tạm dừng thời gian và bảo lưu tiến độ đã làm.
 */

import { useTranslation } from 'react-i18next'
import { AlertCircle, Pause, Play, LogOut } from 'lucide-react'
import { Button } from '@/components/button'

export interface PracticeExitConfirmModalProps {
  isOpen: boolean
  onClose: () => void // Tiếp tục làm bài (Resume)
  onConfirmExit: () => void // Thoát bài tập (Exit)
  title?: string
  description?: string
  savedNotice?: string
  confirmText?: string
  cancelText?: string
}

export function PracticeExitConfirmModal({
  isOpen,
  onClose,
  onConfirmExit,
  title,
  description,
  savedNotice,
  confirmText,
  cancelText,
}: PracticeExitConfirmModalProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex flex-col items-center text-center">
          {/* Icon Badge */}
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <Pause size={28} className="fill-amber-500/20" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-text-primary">
            {title || (isVietnamese ? 'Tạm dừng phiên luyện tập?' : 'Pause Practice Session?')}
          </h3>

          {/* Description */}
          <p className="mt-2 text-xs text-text-secondary leading-relaxed">
            {description ||
              (isVietnamese
                ? 'Đồng hồ tính giờ đang được tạm ngưng. Bạn có chắc chắn muốn dừng và thoát khỏi bài luyện tập này?'
                : 'The timer has been paused. Are you sure you want to exit this practice session?')}
          </p>

          {/* Info pill about saved progress */}
          <div className="mt-4 flex w-full items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3.5 py-2.5 text-left text-[11px] text-amber-600 dark:text-amber-400">
            <AlertCircle size={15} className="shrink-0" />
            <span>
              {savedNotice ||
                (isVietnamese
                  ? 'Các câu bạn đã hoàn thành vẫn được hệ thống ghi nhận và lưu kết quả.'
                  : 'Questions you have already completed are safely saved.')}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onConfirmExit}
              className="w-full gap-2 border-border text-rose-600 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-700 cursor-pointer text-xs font-semibold py-2.5"
            >
              <LogOut size={14} />
              <span>{confirmText || (isVietnamese ? 'Dừng & Thoát' : 'Exit Session')}</span>
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="w-full gap-2 bg-primary text-white hover:bg-primary-hover shadow-xs cursor-pointer text-xs font-semibold py-2.5"
            >
              <Play size={14} className="fill-white" />
              <span>{cancelText || (isVietnamese ? 'Tiếp tục làm bài' : 'Resume Practice')}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
