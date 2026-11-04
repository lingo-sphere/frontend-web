// Component biểu đồ đồng hồ bán nguyệt đo phong độ học tập kết hợp chuỗi sóng trả lời tương tác.
'use client'

import React, { useState } from 'react'
import { Sparkles, ArrowRight, HelpCircle, TrendingUp, TrendingDown, Target, History } from 'lucide-react'
import type { RollingPerformance } from '@/features/progress/services/progress.service'

interface GogoRollingPerformanceCardProps {
  rolling?: RollingPerformance | null
  onViewDetails?: () => void
}

function SemiCircleGauge({
  recentAcc,
  lifetimeAcc,
}: {
  recentAcc: number
  lifetimeAcc: number
}) {
  const width = 220
  const height = 115
  const cx = 110
  const cy = 105
  const radius = 80
  const strokeWidth = 12

  const safeRecent = Math.min(100, Math.max(0, recentAcc))
  const safeLifetime = Math.min(100, Math.max(0, lifetimeAcc))

  const polarToCartesian = (angleDeg: number) => {
    const angleRad = (angleDeg * Math.PI) / 180
    return {
      x: cx + radius * Math.cos(angleRad),
      y: cy - radius * Math.sin(angleRad),
    }
  }

  const startPt = polarToCartesian(180)
  const endPt = polarToCartesian(0)
  const bgPath = `M ${startPt.x} ${startPt.y} A ${radius} ${radius} 0 0 1 ${endPt.x} ${endPt.y}`

  const recentAngle = 180 - (safeRecent / 100) * 180
  const recentPt = polarToCartesian(recentAngle)
  const largeArcFlag = safeRecent > 50 ? 1 : 0
  const progressPath = safeRecent > 0
    ? `M ${startPt.x} ${startPt.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${recentPt.x} ${recentPt.y}`
    : ''

  const lifetimeAngle = 180 - (safeLifetime / 100) * 180
  const lifeMarkerStart = {
    x: cx + (radius - 10) * Math.cos((lifetimeAngle * Math.PI) / 180),
    y: cy - (radius - 10) * Math.sin((lifetimeAngle * Math.PI) / 180),
  }
  const lifeMarkerEnd = {
    x: cx + (radius + 10) * Math.cos((lifetimeAngle * Math.PI) / 180),
    y: cy - (radius + 10) * Math.sin((lifetimeAngle * Math.PI) / 180),
  }

  const gaugeColor = safeRecent >= 75 ? '#10b981' : safeRecent >= 50 ? '#06b6d4' : safeRecent >= 30 ? '#f59e0b' : '#f43f5e'

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        <path
          d={bgPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-border/40"
        />

        {safeRecent > 0 && (
          <path
            d={progressPath}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        )}

        {safeLifetime > 0 && (
          <line
            x1={lifeMarkerStart.x}
            y1={lifeMarkerStart.y}
            x2={lifeMarkerEnd.x}
            y2={lifeMarkerEnd.y}
            stroke="#64748b"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="opacity-90"
          />
        )}

        <circle cx={cx} cy={cy} r="6" fill={gaugeColor} />
      </svg>

      <div className="absolute bottom-1 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-black text-text-primary tracking-tight">
          {Math.round(safeRecent)}%
        </span>
        <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
          Độ chính xác gần đây
        </span>
      </div>
    </div>
  )
}

export function GogoRollingPerformanceCard({
  rolling,
  onViewDetails,
}: GogoRollingPerformanceCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const sparkline = rolling?.recent_scores_sparkline || []
  const details = rolling?.sparkline_details || []
  const windowSize = rolling?.window_size || sparkline.length || 0
  const recentAcc = rolling?.recent_accuracy ?? 0
  const lifetimeAcc = rolling?.lifetime_accuracy ?? 0
  const momentum = rolling?.momentum_delta ?? 0
  const statusLabel = rolling?.status_label || (momentum > 0 ? 'Đang bứt phá' : momentum < 0 ? 'Cần phục hồi' : 'Phong độ ổn định')
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-1">
          <div className="flex-1 flex justify-center py-1">
            <SemiCircleGauge recentAcc={recentAcc} lifetimeAcc={lifetimeAcc} />
          </div>

          <div className="w-full sm:w-56 space-y-3 shrink-0">
            <div className="p-3 rounded-2xl border border-border/80 bg-surface-subtle/50 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-tertiary flex items-center gap-1 font-medium">
                  <Target className="w-3.5 h-3.5 text-primary" />
                  Gần đây ({windowSize} câu)
                </span>
                <span className="font-extrabold text-text-primary">{Math.round(recentAcc)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-border/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, recentAcc)}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl border border-border/80 bg-surface-subtle/50 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-tertiary flex items-center gap-1 font-medium">
                  <History className="w-3.5 h-3.5 text-text-tertiary" />
                  Trung bình lịch sử
                </span>
                <span className="font-extrabold text-text-secondary">{Math.round(lifetimeAcc)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-border/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-slate-400 dark:bg-slate-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, lifetimeAcc)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-subtle/40 border border-border/60 text-xs">
              <span className="text-text-tertiary font-medium">Chỉ số Momentum:</span>
              <span
                className={`font-black flex items-center gap-1 ${
                  momentum > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : momentum < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-text-secondary'
                }`}
              >
                {momentum > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : momentum < 0 ? (
                  <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : null}
                {momentum > 0 ? `+${momentum}%` : `${momentum}%`}
              </span>
            </div>
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
            <p className="text-[11px]">Luyện tập đề thi hoặc bài tập kỹ năng để hệ thống bắt đầu vẽ chuỗi phong độ.</p>
          </div>
        )}
      </div>
    </div>
  )
}
