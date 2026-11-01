// Component thẻ phân bổ từ vựng SRS biểu đồ tròn theo phong cách Gogo Donut Chart.
'use client'

import React from 'react'
import Link from 'next/link'
import { Layers, ArrowRight, BookOpen, Clock, CheckCircle } from 'lucide-react'
import type { VocabStatsSummary } from '@/features/progress/hooks/use.progress.data'

interface GogoVocabularyDonutCardProps {
  vocabStats?: VocabStatsSummary | null
}

export function GogoVocabularyDonutCard({ vocabStats }: GogoVocabularyDonutCardProps) {
  const learned = vocabStats?.learned_words ?? 0
  const reviewDue = vocabStats?.review_due ?? 0
  const total = Math.max(learned + reviewDue, vocabStats?.total_cards ?? 100)
  const other = Math.max(0, total - learned - reviewDue)

  const learnedPercent = total > 0 ? Math.round((learned / total) * 100) : 0
  const reviewPercent = total > 0 ? Math.round((reviewDue / total) * 100) : 0
  const otherPercent = Math.max(0, 100 - learnedPercent - reviewPercent)

  const radius = 52
  const circumference = 2 * Math.PI * radius
  const learnedOffset = circumference - (learnedPercent / 100) * circumference
  const reviewOffset = circumference - (reviewPercent / 100) * circumference

  return (
    <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
            <Layers className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-text-primary">
              Kho Từ Vựng SRS
            </h3>
            <p className="text-xs text-text-secondary">
              Mức độ ghi nhớ theo thuật toán lặp lại ngắt quãng
            </p>
          </div>
        </div>

        <Link
          href="/vocabulary"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>Ôn tập</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex items-center justify-center my-4">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r={radius}
              className="text-surface-subtle"
              strokeWidth="12"
              stroke="currentColor"
              fill="none"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              className="text-cyan-500 transition-all duration-700 ease-out"
              strokeWidth="12"
              stroke="currentColor"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={learnedOffset}
              strokeLinecap="round"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              className="text-amber-500 transition-all duration-700 ease-out"
              strokeWidth="12"
              stroke="currentColor"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={reviewOffset}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-text-primary tracking-tight">
              {learnedPercent}%
            </span>
            <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">
              Thành thạo
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span className="text-text-secondary">Đã thuộc lòng</span>
          </div>
          <span className="font-bold text-text-primary">{learned.toLocaleString('vi-VN')} từ ({learnedPercent}%)</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-text-secondary">Cần ôn hôm nay</span>
          </div>
          <span className="font-bold text-amber-600 dark:text-amber-400">{reviewDue.toLocaleString('vi-VN')} thẻ ({reviewPercent}%)</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-surface-subtle" />
            <span className="text-text-secondary">Từ vựng mới</span>
          </div>
          <span className="font-bold text-text-tertiary">{other.toLocaleString('vi-VN')} từ ({otherPercent}%)</span>
        </div>
      </div>
    </div>
  )
}

