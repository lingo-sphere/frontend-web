// Thẻ hiển thị câu hỏi trong Sổ tay lỗi sai theo phong cách hình học góc cạnh cao cấp và bố cục dạng lưới 3 thẻ mỗi hàng.
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
  X,
  Loader2,
  Calendar,
  Compass,
} from 'lucide-react'
import { Button } from '@/components/button'
import type { UserMistakeItem } from '@/features/practice/types/mistake'
import { MistakeStatus } from '@/features/practice/types/mistake'

interface MistakeVaultCardProps {
  mistake: UserMistakeItem
  onReview: (mistake: UserMistakeItem) => void
  onDrillTopic: (topicTag: string) => void
  onPracticeTopic?: (mistake: UserMistakeItem) => void
  onDelete?: (mistake: UserMistakeItem) => void
  isDeleting?: boolean
}

function isMatchingAnswer(opt: string, optIndex: number, targetAnswer: string): boolean {
  if (!targetAnswer) return false
  const trimmedTarget = targetAnswer.trim()
  const upperTarget = trimmedTarget.toUpperCase()
  const letter = String.fromCharCode(65 + optIndex)

  if (upperTarget === letter) return true
  return opt.trim().toLowerCase() === trimmedTarget.toLowerCase()
}

export function MistakeVaultCard({
  mistake,
  onReview,
  onDrillTopic,
  onPracticeTopic,
  onDelete,
  isDeleting,
}: MistakeVaultCardProps) {
  const [showAnswers, setShowAnswers] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const isDueToday = new Date(mistake.next_due_at).getTime() <= Date.now()
  const displayTopic = mistake.topic_name_vi || mistake.topic_tags[0] || 'Tổng hợp'
  const hasOptions = Array.isArray(mistake.options) && mistake.options.length > 0

  const userOptionIndex = hasOptions
    ? mistake.options.findIndex((opt, idx) => isMatchingAnswer(opt, idx, mistake.user_answer))
    : -1

  const statusLabel =
    mistake.status === MistakeStatus.MASTERED
      ? 'Đã làm chủ kiến thức'
      : mistake.status === MistakeStatus.PRACTICING
      ? `Đang rèn luyện (${mistake.consecutive_correct}/3)`
      : 'Cần ôn tập lặp lại'

  const nextDueFormatted = isDueToday
    ? 'Hôm nay (Cần ôn)'
    : new Date(mistake.next_due_at).toLocaleDateString('vi-VN')

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-border/80 bg-surface dark:bg-card p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 min-h-[380px]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05] [background-image:repeating-linear-gradient(45deg,#000,#000_1px,transparent_1px,transparent_8px)] dark:[background-image:repeating-linear-gradient(45deg,#fff,#fff_1px,transparent_1px,transparent_8px)]" />

      <div className="pointer-events-none absolute top-8 right-0 h-20 w-2 rounded-l-md bg-gradient-to-b from-emerald-500 to-teal-600 shadow-xs" />

      <div className="relative z-10 space-y-3.5">
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              <Target size={10} />
              <span className="max-w-[110px] truncate">{displayTopic}</span>
            </span>

            {mistake.status === MistakeStatus.MASTERED ? (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                <Award size={10} />
                <span>ĐÃ LÀM CHỦ</span>
              </span>
            ) : mistake.status === MistakeStatus.PRACTICING ? (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                <Flame size={10} />
                <span>RÈN LUYỆN ({mistake.consecutive_correct}/3)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
                <RotateCcw size={10} />
                <span>CẦN ÔN TẬP</span>
              </span>
            )}

            {isDueToday && mistake.status !== MistakeStatus.MASTERED && (
              <span className="inline-flex items-center rounded-full bg-rose-600 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-white shadow-xs animate-pulse">
                ĐẾN HẠN
              </span>
            )}
          </div>

          {mistake.status === MistakeStatus.MASTERED && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(mistake)}
              disabled={isDeleting}
              title="Xóa câu hỏi này khỏi sổ tay"
              aria-label="Xóa câu hỏi này khỏi sổ tay"
              className="flex h-6 w-6 items-center justify-center rounded-lg border border-border/80 text-text-tertiary transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:border-rose-800 dark:hover:bg-rose-950/60 disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? <Loader2 size={12} className="animate-spin text-rose-600" /> : <X size={12} />}
            </button>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-[14px] sm:text-[14.5px] font-black tracking-tight text-slate-900 dark:text-white leading-snug line-clamp-2 min-h-[40px]">
            {mistake.question_text}
          </h3>
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate">
            <span className="truncate">{displayTopic}</span>
            <span className="opacity-40">•</span>
            <span className="truncate">{mistake.source_context || 'LUYỆN TẬP SRS'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-0.5">
          <div className="h-[2.5px] w-20 rounded-l-full bg-slate-900 dark:bg-slate-700" />
          <div className="h-[2.5px] w-6 -skew-x-25 rounded-xs bg-emerald-500" />
          <div className="h-[1px] flex-1 bg-border/40" />
        </div>

        <div className="flex items-center justify-between gap-3 pt-0.5">
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-700/60 dark:border-slate-300/60 text-slate-800 dark:text-slate-200 shrink-0">
                <Target size={11} strokeWidth={2} />
              </div>
              <div className="flex items-baseline gap-1 text-[11px] truncate">
                <span className="font-semibold text-text-secondary whitespace-nowrap">Chủ điểm:</span>
                <span className="font-extrabold text-text-primary truncate">{displayTopic}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-700/60 dark:border-slate-300/60 text-slate-800 dark:text-slate-200 shrink-0">
                <RotateCcw size={11} strokeWidth={2} />
              </div>
              <div className="flex items-baseline gap-1 text-[11px] truncate">
                <span className="font-semibold text-text-secondary whitespace-nowrap">Chu kỳ:</span>
                <span className="font-extrabold text-text-primary truncate">{statusLabel}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-700/60 dark:border-slate-300/60 text-slate-800 dark:text-slate-200 shrink-0">
                <Calendar size={11} strokeWidth={2} />
              </div>
              <div className="flex items-baseline gap-1 text-[11px] truncate">
                <span className="font-semibold text-text-secondary whitespace-nowrap">Lần ôn:</span>
                <span
                  className={`font-extrabold truncate ${
                    isDueToday ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-text-primary'
                  }`}
                >
                  {nextDueFormatted}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-700/60 dark:border-slate-300/60 text-slate-800 dark:text-slate-200 shrink-0">
                <Compass size={11} strokeWidth={2} />
              </div>
              <div className="flex items-baseline gap-1 text-[11px] truncate">
                <span className="font-semibold text-text-secondary whitespace-nowrap">Nguồn:</span>
                <span className="font-extrabold text-text-primary truncate">
                  {mistake.source_context || 'Khảo thí LingoSphere'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between shrink-0 pl-3 border-l border-border/40 gap-2">
            <div className="flex flex-col items-center justify-center text-center">
              <svg
                viewBox="0 0 64 52"
                className="h-7 w-9 text-emerald-500 fill-current drop-shadow-xs"
                aria-hidden="true"
              >
                <path d="M 8 6 L 56 6 L 40 18 L 52 18 L 18 46 L 56 46 L 46 54 L 8 54 L 28 34 L 14 34 Z" />
              </svg>
              <span className="mt-0.5 text-[8.5px] font-black tracking-widest uppercase text-slate-900 dark:text-white">
                LINGOSPHERE
              </span>
              <span className="text-[7px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                SRS VAULT
              </span>
            </div>

            <div className="flex items-center justify-center rounded-md bg-surface border border-border/60 px-1.5 py-0.5 shadow-2xs">
              <span className="text-[7.5px] font-mono font-bold text-text-tertiary uppercase">
                #{mistake._id.slice(-4).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => setShowAnswers(!showAnswers)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer py-0.5"
          >
            {showAnswers ? (
              <>
                <EyeOff size={13} />
                <span>Ẩn đáp án đối chiếu</span>
              </>
            ) : (
              <>
                <Eye size={13} />
                <span>Xem đáp án & kết quả</span>
              </>
            )}
          </button>
        </div>

        {showAnswers && (
          <div className="space-y-2.5 pt-1 border-t border-border/40 animate-in fade-in duration-150">
            {hasOptions ? (
              <div className="space-y-1.5">
                <div className="grid grid-cols-1 gap-1.5">
                  {mistake.options.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx)
                    const isCorrect = isMatchingAnswer(opt, idx, mistake.correct_answer)
                    const isUserChoice = isMatchingAnswer(opt, idx, mistake.user_answer)

                    let containerClass =
                      'flex items-center justify-between p-2 rounded-lg border text-[11px] transition-colors bg-surface border-border/80 text-text-primary'
                    let badgeClass =
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded bg-surface-hover text-[10px] font-bold text-text-secondary'

                    if (isCorrect) {
                      containerClass =
                        'flex items-center justify-between p-2 rounded-lg border-2 border-emerald-500/60 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 font-semibold shadow-xs'
                      badgeClass =
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-600 text-white text-[10px] font-bold'
                    } else if (isUserChoice) {
                      containerClass =
                        'flex items-center justify-between p-2 rounded-lg border-2 border-rose-500/60 bg-rose-500/10 text-rose-950 dark:text-rose-200 font-medium'
                      badgeClass =
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded bg-rose-600 text-white text-[10px] font-bold'
                    }

                    return (
                      <div key={idx} className={containerClass}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={badgeClass}>{letter}</span>
                          <span className="leading-snug truncate">{opt}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-1.5">
                          {isCorrect && (
                            <span className="flex items-center gap-0.5 text-[9.5px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 px-1.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle size={10} className="text-emerald-600" />
                              <span>Đúng</span>
                            </span>
                          )}
                          {isUserChoice && !isCorrect && (
                            <span className="flex items-center gap-0.5 text-[9.5px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/70 px-1.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-800">
                              <XCircle size={10} className="text-rose-600" />
                              <span>Đã chọn</span>
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {userOptionIndex === -1 && mistake.user_answer && (
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-700 dark:text-rose-300 font-medium">
                    <XCircle size={12} className="shrink-0 text-rose-600" />
                    <span>
                      Đã chọn: <strong>{mistake.user_answer}</strong>
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                <div className="p-2 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40 text-rose-800 dark:text-rose-200">
                  <div className="flex items-center gap-1 font-bold text-rose-700 dark:text-rose-300 text-[10px]">
                    <XCircle size={11} className="shrink-0" />
                    <span>Lần trước chọn:</span>
                  </div>
                  <p className="pl-3.5 font-medium">{mistake.user_answer}</p>
                </div>

                <div className="p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200">
                  <div className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 text-[10px]">
                    <CheckCircle size={11} className="shrink-0" />
                    <span>Đáp án chính xác:</span>
                  </div>
                  <p className="pl-3.5 font-medium">{mistake.correct_answer}</p>
                </div>
              </div>
            )}

            {mistake.explanation && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{showExplanation ? 'Ẩn lời giải' : 'Xem giải thích chi tiết'}</span>
                  {showExplanation ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                {showExplanation && (
                  <div className="mt-1.5 p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-emerald-950 dark:text-emerald-200 leading-relaxed animate-in fade-in duration-150">
                    <div className="flex items-center gap-1 font-bold mb-0.5">
                      <Sparkles size={11} className="text-emerald-600 dark:text-emerald-400" />
                      <span>Ghi nhớ:</span>
                    </div>
                    <p>{mistake.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-3 mt-auto space-y-2.5">
        <div className="flex items-center gap-1.5">
          <div className="h-[2px] w-16 rounded-l-full bg-slate-900 dark:bg-slate-700" />
          <div className="h-[2px] w-5 -skew-x-25 rounded-xs bg-emerald-500" />
          <div className="h-[1px] flex-1 bg-border/40" />
        </div>

        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            onClick={() => {
              if (onPracticeTopic) {
                onPracticeTopic(mistake)
              } else {
                onDrillTopic(displayTopic)
              }
            }}
            variant="outline"
            size="sm"
            className="w-full text-[11px] font-bold border-border/80 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-text-primary h-8.5 rounded-xl truncate cursor-pointer transition-all"
          >
            <Target size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">Luyện đề</span>
          </Button>

          <Button
            onClick={() => onReview(mistake)}
            size="sm"
            className="w-full text-[11px] font-black bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white h-8.5 rounded-xl shadow-md shadow-emerald-900/20 truncate cursor-pointer transition-all hover:scale-102 active:scale-98"
          >
            <RotateCcw size={12} className="shrink-0" />
            <span className="truncate">{mistake.status === MistakeStatus.MASTERED ? 'Ôn lại' : 'Làm lại (SRS)'}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
