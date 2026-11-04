// Component hiển thị thước đo phong độ gần đây và chuỗi câu trả lời dạng sparkline.
'use client'

import React, { useState } from 'react'
import { Sparkles, ArrowRight, HelpCircle } from 'lucide-react'
import type { RollingPerformance } from '@/features/progress/services/progress.service'

interface GogoRollingPerformanceCardProps {
  rolling?: RollingPerformance | null
  onViewDetails?: () => void
}

export function GogoRollingPerformanceCard({
  rolling,
  onViewDetails,
}: GogoRollingPerformanceCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const sparkline = rolling?.recent_scores_sparkline || []
  const details = rolling?.sparkline_details || []
  const windowSize = rolling?.window_size || sparkline.length || 0
  const recentAcc = rolling?.recent_accuracy
  const lifetimeAcc = rolling?.lifetime_accuracy
  const momentum = rolling?.momentum_delta ?? 0
  const statusLabel = rolling?.status_label || (momentum > 0 ? 'Đang bứt phá' : momentum < 0 ? 'Nhịp học chững lại' : 'Phong độ ổn định')
  const correctCount = sparkline.filter((s) => s === 100).length

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
            Thước đo Phong độ (Rolling Performance)
          </h2>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
              momentum > 0
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : momentum < 0
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
            }`}
          >
            {statusLabel}
          </span>
        </div>
        {onViewDetails && (
          <button
            type="button"
            onClick={onViewDetails}
            className="text-xs font-semibold text-text-tertiary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Chi tiết</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs flex-1 flex flex-col justify-between space-y-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="p-3 rounded-2xl border border-border/80 bg-surface-subtle/50 text-center">
            <span className="text-[10px] text-text-tertiary block font-semibold uppercase tracking-wider">
              Gần đây ({windowSize} câu)
            </span>
            <span className="text-xl sm:text-2xl font-black text-text-primary tracking-tight mt-0.5 block">
              {recentAcc !== undefined ? `${Math.round(recentAcc)}%` : '--'}
            </span>
            <span className="text-[11px] text-text-secondary block mt-0.5">
              Độ chính xác
            </span>
          </div>

          <div className="p-3 rounded-2xl border border-border/80 bg-surface-subtle/50 text-center">
            <span className="text-[10px] text-text-tertiary block font-semibold uppercase tracking-wider">
              Toàn thời gian
            </span>
            <span className="text-xl sm:text-2xl font-black text-text-secondary tracking-tight mt-0.5 block">
              {lifetimeAcc !== undefined ? `${Math.round(lifetimeAcc)}%` : '--'}
            </span>
            <span className="text-[11px] text-text-secondary block mt-0.5">
              Trung bình lịch sử
            </span>
          </div>

          <div className="p-3 rounded-2xl border border-border/80 bg-surface-subtle/50 text-center">
            <span className="text-[10px] text-text-tertiary block font-semibold uppercase tracking-wider">
              Chỉ số Momentum
            </span>
            <span
              className={`text-xl sm:text-2xl font-black tracking-tight mt-0.5 block ${
                momentum > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : momentum < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-text-secondary'
              }`}
            >
              {momentum > 0 ? `+${momentum}%` : `${momentum}%`}
            </span>
            <span className="text-[11px] text-text-secondary block mt-0.5">
              {momentum >= 0 ? 'Bứt phá' : 'Chững lại'}
            </span>
          </div>
        </div>

        {sparkline.length > 0 ? (
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-surface-subtle/40 border border-border/70">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-tertiary font-medium">
                Chuỗi câu trả lời gần nhất:
              </span>
              <span className="text-text-primary font-bold">
                {correctCount}/{sparkline.length} đúng
              </span>
            </div>

            <div className="flex items-center gap-1.5 h-4 py-0.5">
              {sparkline.map((val, idx) => {
                const isHovered = hoveredIndex === idx
                const isCorrect = val === 100
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`flex-1 h-3.5 rounded-xs transition-all cursor-pointer ${
                      isHovered ? 'scale-y-125 brightness-125 ring-1 ring-primary z-10' : ''
                    } ${
                      isCorrect
                        ? 'bg-emerald-500 hover:brightness-110'
                        : 'bg-rose-400 dark:bg-rose-500 hover:brightness-110'
                    }`}
                    title={`Câu ${idx + 1}: ${isCorrect ? 'Đúng' : 'Sai'}`}
                  />
                )
              })}
            </div>

            {hoveredIndex === null ? (
              <p className="text-[11px] text-text-tertiary text-center pt-0.5 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Rê chuột vào từng vạch để xem chi tiết câu hỏi & kỹ năng</span>
              </p>
            ) : (
              <div className="p-2.5 rounded-xl bg-surface border border-border shadow-xs space-y-1 animate-in fade-in duration-150 text-xs">
                {(() => {
                  const detail = details[hoveredIndex]
                  const isCorrect = sparkline[hoveredIndex] === 100 || detail?.is_correct
                  const rawTopic = detail?.topic || ''
                  const isIdLike =
                    /^[0-9a-fA-F]{24}$/.test(rawTopic) ||
                    rawTopic.startsWith('gk_') ||
                    rawTopic.startsWith('ctx_') ||
                    rawTopic.includes('_id')
                  const displayTopic = isIdLike ? '' : rawTopic

                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-text-primary">
                            Câu {hoveredIndex + 1}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              isCorrect
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {isCorrect ? '✓ Chính xác' : '✕ Chưa chính xác'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-text-tertiary font-medium">
                          {detail?.time_spent_formatted && (
                            <span>⏱️ {detail.time_spent_formatted}</span>
                          )}
                          {detail?.time_ago && <span>• {detail.time_ago}</span>}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/50">
                        <span className="text-text-secondary truncate max-w-[75%] font-medium">
                          <span className="mr-1">{detail?.skill_label || '📚 Bài luyện'}</span>
                          {displayTopic ? `• ${displayTopic}` : ''}
                        </span>
                        {detail?.cefr_level && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            {detail.cefr_level}
                          </span>
                        )}
                      </div>
                    </>
                  )
                })()}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-surface-subtle/30 border border-border/60 text-center text-xs text-text-tertiary flex flex-col items-center justify-center gap-1.5 py-6">
            <HelpCircle className="w-5 h-5 text-text-tertiary" />
            <p className="font-medium text-text-secondary">Chưa có đủ lượt làm bài gần đây</p>
            <p className="text-[11px]">Hoàn thành các bài luyện đề hoặc bài tập kỹ năng để hệ thống bắt đầu vẽ chuỗi phong độ của bạn.</p>
          </div>
        )}
      </div>
    </div>
  )
}

