// Component lưới 6 thẻ thống kê kỹ năng pastel theo phong cách Gogo Stats.
'use client'

import React from 'react'
import { BookOpen, Headphones, FileText, Layers, Mic, PenTool } from 'lucide-react'
import type { ProgressMetrics, VocabStatsSummary } from '@/features/progress/hooks/use.progress.data'
import type { SkillsSummary } from '@/features/progress/services/progress.service'

interface GogoStatsGridProps {
  metrics: ProgressMetrics
  vocabStats?: VocabStatsSummary | null
  skillsSummary?: SkillsSummary | null
  listeningScore?: number
  readingScore?: number
  speakingScore?: number
  writingScore?: number
}

export function GogoStatsGrid({
  vocabStats,
  skillsSummary,
  listeningScore = 0,
  readingScore = 0,
  speakingScore = 0,
  writingScore = 0,
}: GogoStatsGridProps) {
  const readingAcc = skillsSummary?.skills?.reading?.accuracy ?? readingScore
  const listeningAcc = skillsSummary?.skills?.listening?.accuracy ?? listeningScore
  const grammarAcc = skillsSummary?.skills?.grammar?.accuracy ?? 0
  const masteredVocab = vocabStats?.learned_words ?? 0
  const speakingPts = skillsSummary?.skills?.speaking?.accuracy ?? speakingScore
  const writingPts = skillsSummary?.skills?.writing?.accuracy ?? writingScore

  const statItems = [
    {
      id: 'reading',
      label: 'Đọc hiểu',
      value: readingAcc > 0 ? `${Math.round(readingAcc)}%` : '0%',
      icon: BookOpen,
      cardBg: 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-100/70 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'listening',
      label: 'Nghe hiểu',
      value: listeningAcc > 0 ? `${Math.round(listeningAcc)}%` : '0%',
      icon: Headphones,
      cardBg: 'bg-sky-50/70 dark:bg-sky-950/25 border-sky-100/70 dark:border-sky-800/30 text-sky-600 dark:text-sky-400',
    },
    {
      id: 'grammar',
      label: 'Ngữ pháp',
      value: grammarAcc > 0 ? `${Math.round(grammarAcc)}%` : '0%',
      icon: FileText,
      cardBg: 'bg-lime-50/70 dark:bg-lime-950/25 border-lime-100/70 dark:border-lime-800/30 text-lime-600 dark:text-lime-400',
    },
    {
      id: 'vocab',
      label: 'Từ vựng SRS',
      value: `${masteredVocab}`,
      icon: Layers,
      cardBg: 'bg-indigo-50/70 dark:bg-indigo-950/25 border-indigo-100/70 dark:border-indigo-800/30 text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'speaking',
      label: 'Luyện nói',
      value: speakingPts > 0 ? `${Math.round(speakingPts)}` : '0',
      icon: Mic,
      cardBg: 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-100/70 dark:border-amber-800/30 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'writing',
      label: 'Luyện viết',
      value: writingPts > 0 ? `${Math.round(writingPts)}` : '0',
      icon: PenTool,
      cardBg: 'bg-teal-50/70 dark:bg-teal-950/25 border-teal-100/70 dark:border-teal-800/30 text-teal-600 dark:text-teal-400',
    },
  ]

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
        Stats
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
        {statItems.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 sm:p-5 flex flex-col items-center justify-between text-center transition-transform hover:-translate-y-0.5 min-h-[130px] ${item.cardBg}`}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1">
                <Icon className="w-5 h-5 stroke-[1.8]" />
              </div>
              <span className="text-[12px] font-medium text-text-secondary">
                {item.label}
              </span>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-text-primary">
                {item.value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
