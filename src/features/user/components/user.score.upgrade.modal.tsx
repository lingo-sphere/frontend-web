// Modal xác nhận cập nhật điểm số mới cao hơn vào hồ sơ năng lực học viên
'use client'

import { useState } from 'react'
import {
  Trophy,
  Sparkles,
  ArrowUpRight,
  Headphones,
  BookOpen,
  Mic,
  FileEdit,
  X,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/button'

export interface UpgradeScoreBreakdown {
  total: number
  listening?: number
  reading?: number
  speaking?: number
  writing?: number
  skillsType?: '2SKILLS' | '4SKILLS'
}

interface UserScoreUpgradeModalProps {
  open: boolean
  onClose: () => void
  examTitle: string
  currentScores: UpgradeScoreBreakdown
  newScores: UpgradeScoreBreakdown
  currentTargetScore?: number
  onConfirm: () => Promise<void> | void
}

export function UserScoreUpgradeModal({
  open,
  onClose,
  examTitle,
  currentScores,
  newScores,
  currentTargetScore,
  onConfirm,
}: UserScoreUpgradeModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  if (!open) return null

  const is4Skills =
    newScores.skillsType === '4SKILLS' ||
    Boolean(
      (newScores.speaking && newScores.speaking > 0) ||
      (newScores.writing && newScores.writing > 0) ||
      (currentScores.speaking && currentScores.speaking > 0) ||
      (currentScores.writing && currentScores.writing > 0)
    )

  const diff = newScores.total - currentScores.total
  const maxScore = is4Skills ? 1390 : 990
  const willNeedTargetBump =
    currentTargetScore &&
    currentTargetScore > 0 &&
    newScores.total >= currentTargetScore &&
    newScores.total < maxScore

  const suggestedTarget = willNeedTargetBump
    ? Math.min(maxScore, Math.max(newScores.total + 25, Math.ceil((newScores.total + 50) / 10) * 10))
    : currentTargetScore

  const handleConfirmUpdate = async () => {
    setIsUpdating(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-surface border border-border/80 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-xs">
            <Trophy size={24} />
          </div>
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                <Sparkles size={11} /> Kỷ lục mới
              </span>
            </div>
            <h3 className="text-lg font-black text-text-primary tracking-tight">
              Cập nhật điểm mới vào hồ sơ?
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Bạn vừa hoàn thành xuất sắc <strong className="text-text-primary">{examTitle}</strong> với điểm số vượt trội so với hồ sơ hiện tại.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-surface-subtle/70 border border-border/60 space-y-2">
            <span className="text-[11px] font-bold text-text-tertiary block">
              Điểm hồ sơ hiện tại
            </span>
            <div className="text-2xl font-black text-text-secondary">
              {currentScores.total > 0 ? `${currentScores.total}đ` : '--'}
            </div>
            <div className="space-y-1 pt-1 border-t border-border/40 text-[11px] text-text-tertiary">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Headphones size={11} className="text-indigo-500" /> Nghe:
                </span>
                <span className="font-bold text-text-primary">
                  {currentScores.listening ?? 0}đ
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <BookOpen size={11} className="text-rose-500" /> Đọc:
                </span>
                <span className="font-bold text-text-primary">
                  {currentScores.reading ?? 0}đ
                </span>
              </div>
              {is4Skills && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Mic size={11} className="text-teal-500" /> Nói:
                    </span>
                    <span className="font-bold text-text-primary">
                      {currentScores.speaking ?? 0}đ
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <FileEdit size={11} className="text-amber-500" /> Viết:
                    </span>
                    <span className="font-bold text-text-primary">
                      {currentScores.writing ?? 0}đ
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-primary block">
                Điểm bài thi mới
              </span>
              {diff > 0 && (
                <span className="inline-flex items-center text-[10px] font-black text-emerald-600 bg-emerald-500/10 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md">
                  <ArrowUpRight size={11} />+{diff}đ
                </span>
              )}
            </div>
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">
              {newScores.total}đ
            </div>
            <div className="space-y-1 pt-1 border-t border-primary/10 text-[11px] text-text-tertiary">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-text-secondary">
                  <Headphones size={11} className="text-indigo-500" /> Nghe:
                </span>
                <span className="font-black text-indigo-600 dark:text-indigo-400">
                  {newScores.listening ?? 0}đ
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-text-secondary">
                  <BookOpen size={11} className="text-rose-500" /> Đọc:
                </span>
                <span className="font-black text-rose-600 dark:text-rose-400">
                  {newScores.reading ?? 0}đ
                </span>
              </div>
              {is4Skills && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-text-secondary">
                      <Mic size={11} className="text-teal-500" /> Nói:
                    </span>
                    <span className="font-black text-teal-600 dark:text-teal-400">
                      {newScores.speaking ?? 0}đ
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-text-secondary">
                      <FileEdit size={11} className="text-amber-500" /> Viết:
                    </span>
                    <span className="font-black text-amber-600 dark:text-amber-400">
                      {newScores.writing ?? 0}đ
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {willNeedTargetBump && (
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
            <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <span>
              Điểm mới đã chạm mốc mục tiêu cũ ({currentTargetScore}đ). Khi cập nhật, mục tiêu sẽ tự động được nâng lên <strong>{suggestedTarget}đ</strong> để bạn tiếp tục bứt phá.
            </span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isUpdating}
            className="rounded-xl text-xs font-bold cursor-pointer"
          >
            Để sau (Giữ điểm cũ)
          </Button>
          <Button
            type="button"
            onClick={handleConfirmUpdate}
            disabled={isUpdating}
            className="rounded-xl text-xs font-bold bg-gradient-to-r from-primary to-indigo-600 text-white cursor-pointer shadow-md hover:shadow-lg transition-all"
          >
            {isUpdating ? 'Đang cập nhật...' : 'Xác nhận cập nhật hồ sơ'}
          </Button>
        </div>
      </div>
    </div>
  )
}
