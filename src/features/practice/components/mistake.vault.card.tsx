// Thẻ hiển thị chi tiết câu sai trong Sổ tay lỗi sai, hỗ trợ ẩn/hiện đáp án đối chiếu và ôn tập lặp lại ngắt quãng.
'use client'

import { useState } from 'react'
import {
  RotateCcw,
  Target,
  CheckCircle,
  XCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Flame,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Button } from '@/components/button'
import type { UserMistakeItem } from '@/features/practice/types/mistake'
import { MistakeStatus } from '@/features/practice/types/mistake'

interface MistakeVaultCardProps {
  mistake: UserMistakeItem
  onReview: (mistake: UserMistakeItem) => void
  onDrillTopic: (topicTag: string) => void
}

function isMatchingAnswer(opt: string, optIndex: number, targetAnswer: string): boolean {
  if (!targetAnswer) return false
  const trimmedTarget = targetAnswer.trim()
  const upperTarget = trimmedTarget.toUpperCase()
  const letter = String.fromCharCode(65 + optIndex)

  if (upperTarget === letter) return true
  return opt.trim().toLowerCase() === trimmedTarget.toLowerCase()
}

export function MistakeVaultCard({ mistake, onReview, onDrillTopic }: MistakeVaultCardProps) {
  const [showAnswers, setShowAnswers] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const isDueToday = new Date(mistake.next_due_at).getTime() <= Date.now()
  const displayTopic = mistake.topic_name_vi || mistake.topic_tags[0] || 'Tổng hợp'
  const hasOptions = Array.isArray(mistake.options) && mistake.options.length > 0

  const userOptionIndex = hasOptions
    ? mistake.options.findIndex((opt, idx) => isMatchingAnswer(opt, idx, mistake.user_answer))
    : -1

  return (
    <div className="p-5 rounded-2xl bg-surface border border-border transition-all hover:border-purple-300 dark:hover:border-purple-800 space-y-3.5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
            <Target size={12} />
            <span>{displayTopic}</span>
          </span>

          {mistake.status === MistakeStatus.MASTERED ? (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <Award size={12} />
              <span>Đã khắc phục hoàn toàn</span>
            </span>
          ) : mistake.status === MistakeStatus.PRACTICING ? (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
              <Flame size={12} />
              <span>Đang rèn luyện ({mistake.consecutive_correct}/3 lần đúng)</span>
            </span>
          ) : (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
              <RotateCcw size={12} />
              <span>Cần ôn tập</span>
            </span>
          )}

          {isDueToday && mistake.status !== MistakeStatus.MASTERED && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
              Đến hạn hôm nay
            </span>
          )}
        </div>

        {mistake.source_context && (
          <span className="text-[11px] text-text-tertiary">
            Nguồn: {mistake.source_context}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-text-primary leading-relaxed">
          {mistake.question_text}
        </p>
      </div>

      <div className="pt-0.5">
        <button
          type="button"
          onClick={() => setShowAnswers(!showAnswers)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors cursor-pointer"
        >
          {showAnswers ? (
            <>
              <EyeOff size={14} />
              <span>Ẩn đáp án & đối chiếu</span>
            </>
          ) : (
            <>
              <Eye size={14} />
              <span>Xem đáp án & kết quả lần trước</span>
            </>
          )}
        </button>
      </div>

      {showAnswers && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {hasOptions ? (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">
                Các đáp án lựa chọn:
              </div>
              <div className="grid grid-cols-1 gap-2">
                {mistake.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx)
                  const isCorrect = isMatchingAnswer(opt, idx, mistake.correct_answer)
                  const isUserChoice = isMatchingAnswer(opt, idx, mistake.user_answer)

                  let containerClass =
                    'flex items-center justify-between p-3 rounded-xl border text-xs transition-colors bg-surface border-border/80 text-text-primary'
                  let badgeClass =
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-[11px] font-bold text-text-secondary'

                  if (isCorrect) {
                    containerClass =
                      'flex items-center justify-between p-3 rounded-xl border-2 border-emerald-500/60 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 font-semibold shadow-xs'
                    badgeClass =
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white text-[11px] font-bold'
                  } else if (isUserChoice) {
                    containerClass =
                      'flex items-center justify-between p-3 rounded-xl border-2 border-rose-500/60 bg-rose-500/10 text-rose-950 dark:text-rose-200 font-medium'
                    badgeClass =
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white text-[11px] font-bold'
                  }

                  return (
                    <div key={idx} className={containerClass}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={badgeClass}>{letter}</span>
                        <span className="leading-relaxed">{opt}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isCorrect && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle size={12} className="text-emerald-600 dark:text-emerald-400" />
                            <span>Đáp án đúng</span>
                          </span>
                        )}
                        {isUserChoice && !isCorrect && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/70 px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-800">
                            <XCircle size={12} className="text-rose-600 dark:text-rose-400" />
                            <span>Bạn đã chọn</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {userOptionIndex === -1 && mistake.user_answer && (
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 font-medium">
                  <XCircle size={13} className="shrink-0 text-rose-600" />
                  <span>
                    Lần làm trước bạn chọn: <strong>{mistake.user_answer}</strong>
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40 text-rose-800 dark:text-rose-200 space-y-0.5">
                <div className="flex items-center gap-1 font-bold text-rose-700 dark:text-rose-300 text-[11px]">
                  <XCircle size={13} className="shrink-0" />
                  <span>Lần trước bạn chọn:</span>
                </div>
                <p className="pl-4 font-medium">{mistake.user_answer}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200 space-y-0.5">
                <div className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 text-[11px]">
                  <CheckCircle size={13} className="shrink-0" />
                  <span>Đáp án chính xác:</span>
                </div>
                <p className="pl-4 font-medium">{mistake.correct_answer}</p>
              </div>
            </div>
          )}

          {mistake.explanation && (
            <div>
              <button
                type="button"
                onClick={() => setShowExplanation(!showExplanation)}
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{showExplanation ? 'Ẩn lời giải & hướng dẫn' : 'Xem giải thích chi tiết'}</span>
                {showExplanation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showExplanation && (
                <div className="mt-2 p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40 text-xs text-purple-950 dark:text-purple-200 leading-relaxed animate-in fade-in duration-150">
                  <div className="flex items-center gap-1 font-bold mb-1">
                    <Sparkles size={13} className="text-purple-600 dark:text-purple-400" />
                    <span>Gợi ý ghi nhớ:</span>
                  </div>
                  <p>{mistake.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
        <span className="text-[11px] text-text-tertiary">
          Lần ôn kế tiếp:{' '}
          <strong className="text-text-secondary">
            {isDueToday
              ? 'Hôm nay'
              : new Date(mistake.next_due_at).toLocaleDateString('vi-VN')}
          </strong>
        </span>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => onDrillTopic(displayTopic)}
            variant="outline"
            size="sm"
            className="text-xs border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 cursor-pointer h-8 gap-1"
          >
            <Target size={13} />
            <span>Luyện đề chủ đề này</span>
          </Button>

          <Button
            onClick={() => onReview(mistake)}
            size="sm"
            className="text-xs bg-rose-600 hover:bg-rose-700 text-white cursor-pointer h-8 gap-1"
          >
            <RotateCcw size={13} />
            <span>Làm lại câu này (SRS)</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

