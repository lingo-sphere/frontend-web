// Modal xác nhận bắt đầu, rời khỏi hoặc nộp bài thi cho học viên.
'use client'

import { AlertTriangle, Send, Loader2, Trophy, Clock, HelpCircle } from 'lucide-react'
import { Button } from '@/components/button'

export interface TestRunnerStartConfirmModalProps {
  isOpen: boolean
  title: string
  skillsText?: string
  durationMinutes?: number
  totalQuestions?: number
  description?: string
  is4Skills?: boolean
  isLoading?: boolean
  onCancel: () => void
  onConfirmStart: () => void
}

export function TestRunnerStartConfirmModal({
  isOpen,
  title,
  skillsText,
  durationMinutes,
  totalQuestions,
  description,
  is4Skills = false,
  isLoading = false,
  onCancel,
  onConfirmStart,
}: TestRunnerStartConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-surface border border-border shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
            <Trophy size={24} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-text-primary">Xác nhận bắt đầu làm bài thi</h3>
            <p className="text-xs text-text-secondary truncate">{title}</p>
          </div>
        </div>

        {description && (
          <p className="text-xs text-text-secondary leading-relaxed bg-surface-subtle p-3 rounded-xl border border-border">
            {description}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          {durationMinutes !== undefined && durationMinutes > 0 && (
            <div className="p-3 rounded-2xl bg-surface-subtle border border-border space-y-1">
              <span className="text-[11px] text-text-tertiary block">Thời gian làm bài</span>
              <span className="font-bold text-text-primary flex items-center gap-1.5">
                <Clock size={13} className="text-primary" />
                {durationMinutes} phút
              </span>
            </div>
          )}

          {totalQuestions !== undefined && totalQuestions > 0 && (
            <div className="p-3 rounded-2xl bg-surface-subtle border border-border space-y-1">
              <span className="text-[11px] text-text-tertiary block">Số lượng câu hỏi</span>
              <span className="font-bold text-text-primary flex items-center gap-1.5">
                <HelpCircle size={13} className="text-primary" />
                {totalQuestions} câu hỏi
              </span>
            </div>
          )}

          <div className="p-3 rounded-2xl bg-surface-subtle border border-border space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-text-tertiary block">Cấu trúc kỹ năng</span>
            <span className="font-bold text-text-primary truncate block">
              {skillsText || (is4Skills ? '4 Kỹ năng' : '2 Kỹ năng')}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2 text-[11.5px] text-amber-900 dark:text-amber-200">
          <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
            <AlertTriangle size={14} />
            <span>Lưu ý quan trọng trước khi làm bài:</span>
          </div>
          <ul className="space-y-1 list-disc list-inside leading-relaxed text-text-secondary">
            <li>Đồng hồ đếm ngược sẽ bắt đầu chạy ngay khi bạn nhấn nút bên dưới.</li>
            <li>Hãy chuẩn bị tai nghe và micro hoạt động tốt đối với phần thi Nghe & Nói.</li>
            <li>Không tải lại trang hoặc tắt trình duyệt trong quá trình làm bài.</li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-1">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onCancel}
            className="rounded-xl px-4 text-xs font-bold cursor-pointer"
          >
            Để sau / Xem lại
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={onConfirmStart}
            className="rounded-xl bg-primary text-white hover:bg-primary-hover px-5 text-xs font-bold cursor-pointer shadow-md shadow-primary/20"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 size={14} className="animate-spin" />
                Đang vào bài...
              </span>
            ) : (
              'Tôi đã sẵn sàng - Bắt đầu làm bài'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export interface TestRunnerExitConfirmModalProps {
  isOpen: boolean
  isSaving?: boolean
  onCancel: () => void
  onConfirmExit: () => void
}

export function TestRunnerExitConfirmModal({
  isOpen,
  isSaving = false,
  onCancel,
  onConfirmExit,
}: TestRunnerExitConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-surface border border-border shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-text-primary">Xác nhận rời khỏi bài thi</h3>
            <p className="text-xs text-text-secondary">Lưu tiến độ và nộp bài</p>
          </div>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          Hệ thống sẽ lưu lại kết quả những câu bạn đã làm. Các câu hỏi chưa làm sẽ mặc định được tính là trả lời sai. Bạn có chắc chắn muốn nộp bài và rời khỏi bài thi?
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={onCancel}
            className="rounded-xl px-4 text-xs font-bold cursor-pointer"
          >
            Tiếp tục làm bài
          </Button>
          <Button
            type="button"
            disabled={isSaving}
            onClick={onConfirmExit}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 text-xs font-bold cursor-pointer shadow-md shadow-rose-600/20"
          >
            {isSaving ? (
              <span className="flex items-center gap-1.5">
                <Loader2 size={14} className="animate-spin" />
                Đang lưu & thoát...
              </span>
            ) : (
              'Lưu kết quả & Thoát'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export interface TestRunnerSubmitConfirmModalProps {
  isOpen: boolean
  totalQuestions: number
  answeredCount: number
  unansweredCount: number
  timeLeftFormatted: string
  isSaving: boolean
  onCancel: () => void
  onConfirmSubmit: () => void
}

export function TestRunnerSubmitConfirmModal({
  isOpen,
  totalQuestions,
  answeredCount,
  unansweredCount,
  timeLeftFormatted,
  isSaving,
  onCancel,
  onConfirmSubmit,
}: TestRunnerSubmitConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-surface border border-border shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
            <Send size={22} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-text-primary">Xác nhận nộp bài thi</h3>
            <p className="text-xs text-text-secondary">Kiểm tra lại trước khi gửi kết quả</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-subtle/80 border border-border space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-text-secondary">Tổng số câu hỏi:</span>
            <span className="font-bold text-text-primary">{totalQuestions} câu</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Số câu đã trả lời:</span>
            <span className="font-bold text-primary">{answeredCount} câu</span>
          </div>
          {unansweredCount > 0 && (
            <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold">
              <span>Số câu chưa làm (tính là sai):</span>
              <span>{unansweredCount} câu</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-text-secondary">Thời gian còn lại:</span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
              {timeLeftFormatted}
            </span>
          </div>
        </div>

        {unansweredCount > 0 && (
          <p className="text-[11.5px] text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl leading-relaxed">
            ⚠️ Bạn vẫn còn <strong>{unansweredCount} câu</strong> chưa làm. Nếu nộp bài ngay bây giờ, các câu chưa làm sẽ bị tính là sai (0 điểm).
          </p>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl px-4 text-xs font-bold cursor-pointer"
          >
            Kiểm tra lại
          </Button>
          <Button
            type="button"
            disabled={isSaving}
            onClick={onConfirmSubmit}
            className="rounded-xl bg-primary text-white hover:bg-primary-hover px-5 text-xs font-bold cursor-pointer shadow-md shadow-primary/20"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1.5" />
                <span>Đang nộp...</span>
              </>
            ) : (
              <span>Nộp bài ngay</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
