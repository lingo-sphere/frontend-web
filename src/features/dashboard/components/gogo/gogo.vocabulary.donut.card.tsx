// Component biểu đồ tròn phân bổ từ vựng theo phong cách Gogo Categories Donut Chart.
'use client'

import React from 'react'
import type { VocabStatsSummary } from '@/features/progress/hooks/use.progress.data'

interface GogoVocabularyDonutCardProps {
  vocabStats?: VocabStatsSummary | null
}

export function GogoVocabularyDonutCard({ vocabStats }: GogoVocabularyDonutCardProps) {
  const learned = vocabStats?.learned_words ?? 45
  const due = vocabStats?.review_due ?? 28
  const total = vocabStats?.total_cards ?? 100
  const remaining = Math.max(0, total - learned - due)

  return (
    <div className="space-y-3 h-full flex flex-col">
      <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
        Categories
      </h2>
      <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs flex-1 flex flex-col items-center justify-between">
        <div className="w-full flex items-center justify-center py-3">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="#10b981"
                strokeWidth="7"
                strokeDasharray="260 120"
                strokeLinecap="round"
                className="opacity-90"
              />
              <circle
                cx="80"
                cy="80"
                r="46"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="7"
                strokeDasharray="200 90"
                strokeLinecap="round"
                className="opacity-90"
              />
              <circle
                cx="80"
                cy="80"
                r="32"
                fill="none"
                stroke="#6366f1"
                strokeWidth="6"
                strokeDasharray="120 80"
                strokeLinecap="round"
                className="opacity-90"
              />
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-text-secondary pt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Đã học ({learned})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span>Cần ôn ({due})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Chưa học ({remaining})</span>
          </div>
        </div>
      </div>
    </div>
  )
}
