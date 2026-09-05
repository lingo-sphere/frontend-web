'use client'

/**
 * @file test.runner.history.modal.tsx
 * @description Modal dialog giao diện test.runner.history
 */

import { X, History, Crown, RotateCcw, CheckCircle2, FileQuestion, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TestAttemptItem } from './test.runner.types'

interface TestRunnerHistoryModalProps {
  isOpen: boolean
  testTitle: string
  attemptsList: TestAttemptItem[]
  bestScore: number
  passingScore: number
  totalQuestionsCount: number
  onClose: () => void
}

export function TestRunnerHistoryModal({
  isOpen,
  testTitle,
  attemptsList,
  bestScore,
  passingScore,
  totalQuestionsCount,
  onClose,
}: TestRunnerHistoryModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="flex flex-col w-full max-w-xl max-h-[85vh] rounded-3xl bg-surface border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border bg-surface-subtle/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-xs">
              <History size={20} />
            </div>
            <div>
              <h4 className="text-base font-bold text-text-primary">Lịch sử làm bài kiểm tra</h4>
              <p className="text-xs text-text-secondary">
                {testTitle} • Tổng cộng {attemptsList.length} lượt nộp bài
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5 p-4 sm:p-5 bg-surface-subtle/30 border-b border-border">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 mb-0.5">
              <Crown size={13} className="text-amber-500 shrink-0" />
              <span>Điểm cao nhất</span>
            </div>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">
              {bestScore > 0 ? `${bestScore}%` : '--'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-[11px] font-bold text-primary mb-0.5">
              <RotateCcw size={13} className="shrink-0" />
              <span>Số lần làm</span>
            </div>
            <span className="text-xl font-black text-primary">{attemptsList.length}</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mb-0.5">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              <span>Lượt đạt chuẩn</span>
            </div>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {attemptsList.filter((a) => a.is_passed || a.score >= passingScore).length}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {attemptsList.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-surface-subtle border border-border mx-auto flex items-center justify-center text-text-tertiary">
                <FileQuestion size={28} />
              </div>
              <div>
                <h5 className="text-sm font-bold text-text-primary">Chưa có lượt làm bài nào</h5>
                <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto">
                  Hãy hoàn thành bài kiểm tra lần đầu tiên để hệ thống tự động ghi nhận điểm và xây dựng lịch sử của bạn nhé.
                </p>
              </div>
            </div>
          ) : (
            attemptsList
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
              )
              .map((att, idx) => {
                const isPassedAttempt = att.is_passed || att.score >= passingScore
                const isRecord = bestScore > 0 && att.score === bestScore
                const attemptDate = new Date(att.submitted_at)
                const formattedDate = !isNaN(attemptDate.getTime())
                  ? attemptDate.toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Vừa xong'

                return (
                  <div
                    key={att.attempt_id || idx}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isRecord
                        ? 'bg-amber-500/5 border-amber-500/40 shadow-xs'
                        : 'bg-surface border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black text-xs shadow-xs ${
                          isRecord
                            ? 'bg-amber-500 text-white shadow-amber-500/30'
                            : isPassedAttempt
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isRecord ? <Crown size={18} /> : `#${attemptsList.length - idx}`}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-text-primary">
                            Lần thi #{attemptsList.length - idx}
                          </span>
                          {isRecord && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                              <Crown size={10} className="text-amber-500" />
                              Kỷ lục cao nhất
                            </span>
                          )}
                          {isPassedAttempt ? (
                            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                              Đạt chuẩn
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400">
                              Chưa đạt
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {formattedDate}
                          </span>
                          {typeof att.correct_count === 'number' && att.correct_count >= 0 && (
                            <span>
                              • Đúng {att.correct_count}/{att.total_questions || totalQuestionsCount} câu
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-lg font-black ${
                          isRecord
                            ? 'text-amber-600 dark:text-amber-400'
                            : isPassedAttempt
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-text-secondary'
                        }`}
                      >
                        {att.score}%
                      </span>
                    </div>
                  </div>
                )
              })
          )}
        </div>

        <div className="border-t border-border bg-surface-subtle/50 px-6 py-3.5 flex justify-end">
          <Button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 text-xs font-bold cursor-pointer"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}
