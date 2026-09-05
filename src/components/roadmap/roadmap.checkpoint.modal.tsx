/**
 * @file roadmap.checkpoint.modal.tsx
 * @description Modal dialog giao diện roadmap.checkpoint
 */

'use client'

import { FileCheck2, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RoadmapCheckpointModalProps {
  activeCheckpointStage: number | null
  checkpointScoreInput: number
  isSubmittingCheckpoint: boolean
  onScoreChange: (score: number) => void
  onClose: () => void
  onSubmitCheckpoint: () => void
}

export function RoadmapCheckpointModal({
  activeCheckpointStage,
  checkpointScoreInput,
  isSubmittingCheckpoint,
  onScoreChange,
  onClose,
  onSubmitCheckpoint,
}: RoadmapCheckpointModalProps) {
  if (activeCheckpointStage === null) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-surface border border-border p-6 sm:p-7 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-3 border-b border-border pb-3.5">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-text-primary">
                Đánh Giá / Thi Vượt Cấp Chặng {activeCheckpointStage}
              </h4>
              <p className="text-xs text-text-tertiary">
                Xác nhận kết quả bài kiểm tra để mở khóa chặng tiếp theo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary p-1 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Cơ Chế Thi Vượt Cấp Chuẩn Sư Phạm</span>
          </div>
          <p className="text-[11.5px] text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed">
            Nếu đạt từ <strong>70%</strong> trở lên, bạn được công nhận đã nắm vững kiến thức Chặng{' '}
            {activeCheckpointStage}. Hệ thống sẽ tự động mở khóa chặng tiếp theo và ghi nhận điểm
            tăng trưởng vào Biểu đồ hành trình!
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-text-primary">
            Điểm bài kiểm tra (% đúng hoặc thang điểm 100):
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={checkpointScoreInput}
            onChange={(e) =>
              onScoreChange(Math.min(100, Math.max(0, Number(e.target.value))))
            }
            className="w-full px-3.5 py-2.5 bg-surface-subtle border border-border rounded-xl text-sm font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex items-center justify-between text-[11px] text-text-tertiary pt-0.5">
            <span>
              Ngưỡng tối thiểu: <strong>70%</strong>
            </span>
            <span
              className={
                checkpointScoreInput >= 70
                  ? 'text-emerald-600 font-bold'
                  : 'text-amber-600 font-bold'
              }
            >
              {checkpointScoreInput >= 70
                ? '✓ Đủ điều kiện vượt cấp'
                : '⚠ Chưa đủ điều kiện'}
            </span>
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold cursor-pointer"
          >
            Hủy bỏ
          </Button>
          <Button
            size="sm"
            disabled={isSubmittingCheckpoint}
            onClick={onSubmitCheckpoint}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {isSubmittingCheckpoint
                ? 'Đang Ghi Nhận...'
                : 'Xác Nhận & Mở Khóa Chặng'}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
