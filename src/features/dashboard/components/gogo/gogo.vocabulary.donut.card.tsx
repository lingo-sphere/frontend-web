// Component phân tích trí nhớ và phân bổ các cấp độ từ vựng theo thuật toán ngắt quãng SRS.
'use client'

import React from 'react'
import { Brain, ArrowRight, BookOpen, RotateCcw } from 'lucide-react'
import type { VocabStatsSummary } from '@/features/progress/hooks/use.progress.data'
import type { VocabularyDashboardOverview } from '@/features/vocabulary/types/vocabulary.dashboard'

interface GogoVocabularyDonutCardProps {
  vocabStats?: VocabStatsSummary | null
  dashboardData?: VocabularyDashboardOverview | null
  onNavigate?: (path: string) => void
}

export function GogoVocabularyDonutCard({
  vocabStats,
  dashboardData,
  onNavigate,
}: GogoVocabularyDonutCardProps) {
  const summary = dashboardData?.summary
  const memory = dashboardData?.memory_strength

  const totalWords = summary?.total_words ?? vocabStats?.total_cards ?? 0
  const masteredWords = summary?.mastered_count ?? vocabStats?.learned_words ?? 0
  const learningWords = summary?.learning_count ?? (totalWords > masteredWords ? totalWords - masteredWords : 0)
  const dueToday = summary?.due_today_count ?? vocabStats?.review_due ?? 0
  const retentionRate = summary?.retention_rate_30d !== undefined ? Math.round(summary.retention_rate_30d) : 0

  const deepMemCount = memory?.deep_memory?.count ?? masteredWords
  const stableCount = memory?.stable?.count ?? 0
  const learningCount = memory?.learning?.count ?? learningWords
  const fragileCount = memory?.fragile?.count ?? 0

  const deepPct = totalWords > 0 ? Math.round((deepMemCount / totalWords) * 100) : 0
  const stablePct = totalWords > 0 ? Math.round((stableCount / totalWords) * 100) : 0
  const learningPct = totalWords > 0 ? Math.round((learningCount / totalWords) * 100) : 0
  const fragilePct = totalWords > 0 ? Math.max(0, 100 - deepPct - stablePct - learningPct) : 0

  const radius = 56
  const circumference = 2 * Math.PI * radius

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
          Trí nhớ & Phân bổ Từ vựng SRS
        </h2>
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('/vocabulary')}
            className="text-xs font-semibold text-text-tertiary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Sổ từ vựng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs flex-1 flex flex-col justify-between space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-border/40"
              />
              {totalWords > 0 && deepPct > 0 && (
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="10"
                  strokeDasharray={`${(deepPct / 100) * circumference} ${circumference}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              )}
              {totalWords > 0 && stablePct > 0 && (
                <circle
                  cx="70"
                  cy="70"
                  r={radius - 12}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="8"
                  strokeDasharray={`${(stablePct / 100) * (2 * Math.PI * (radius - 12))} ${2 * Math.PI * (radius - 12)}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              )}
              {totalWords > 0 && learningPct > 0 && (
                <circle
                  cx="70"
                  cy="70"
                  r={radius - 22}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="6"
                  strokeDasharray={`${(learningPct / 100) * (2 * Math.PI * (radius - 22))} ${2 * Math.PI * (radius - 22)}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                {totalWords}
              </span>
              <span className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wider">
                Tổng từ
              </span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-semibold text-text-primary">Trí nhớ sâu (≥30d)</span>
              </div>
              <span className="font-bold text-text-secondary">{deepMemCount} từ ({deepPct}%)</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
                <span className="font-semibold text-text-primary">Vững vàng (7-30d)</span>
              </div>
              <span className="font-bold text-text-secondary">{stableCount} từ ({stablePct}%)</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                <span className="font-semibold text-text-primary">Đang ghi nhớ (1-7d)</span>
              </div>
              <span className="font-bold text-text-secondary">{learningCount} từ ({learningPct}%)</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <span className="font-semibold text-text-primary">Mới học / Cần ôn</span>
              </div>
              <span className="font-bold text-text-secondary">{fragileCount} từ ({fragilePct}%)</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/60">
          <div className="flex items-center gap-3 text-xs w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Brain className="w-4 h-4 text-emerald-500" />
              <span>Duy trì 30 ngày: <strong className="text-text-primary">{retentionRate > 0 ? `${retentionRate}%` : '--'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-text-secondary">
              <RotateCcw className="w-3.5 h-3.5 text-cyan-500" />
              <span>Cần ôn hôm nay: <strong className="text-text-primary">{dueToday}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {dueToday > 0 ? (
              <button
                type="button"
                onClick={() => onNavigate?.('/vocabulary/review')}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ôn tập ngay ({dueToday})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate?.('/vocabulary')}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl border border-primary/40 text-primary text-xs font-bold hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Học từ mới</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
