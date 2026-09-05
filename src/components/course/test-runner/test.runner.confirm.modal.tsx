/**
 * @file test.runner.confirm.modal.tsx
 * @description Modal dialog giao diện test.runner.confirm
 */

'use client'

import { AlertTriangle, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TestRunnerExitConfirmModalProps {
  isOpen: boolean
  onCancel: () => void
  onConfirmExit: () => void
}

export function TestRunnerExitConfirmModal({
  isOpen,
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
            <p className="text-xs text-text-secondary">Thời gian làm bài vẫn đang đếm ngược</p>
          </div>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          Bạn đang trong quá trình làm bài thi. Nếu bạn rời khỏi bây giờ, bài làm hiện tại sẽ không được lưu điểm và bạn sẽ phải bắt đầu lại từ đầu.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl px-4 text-xs font-bold cursor-pointer"
          >
            Tiếp tục làm bài
          </Button>
          <Button
            type="button"
            onClick={onConfirmExit}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 text-xs font-bold cursor-pointer shadow-md shadow-rose-600/20"
          >
            Xác nhận thoát
          </Button>
        </div>
      </div>
    </div>
  )
}

interface TestRunnerSubmitConfirmModalProps {
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
