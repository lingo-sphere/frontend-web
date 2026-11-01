// Component hiển thị tiến trình rèn luyện với vòng tròn tiến độ tròn theo phong cách Gogo Processes.
'use client'

import React from 'react'
import type { ProgressMetrics, VocabStatsSummary, UnifiedCourseCardItem } from '@/features/progress/hooks/use.progress.data'

interface GogoProcessesCardProps {
  metrics: ProgressMetrics
  vocabStats?: VocabStatsSummary | null
  courses?: UnifiedCourseCardItem[]
  toeicAttemptsCount?: number
}

interface ProcessItem {
  id: string
  title: string
  countText: string
  percentage: number
}

function CircularProgress({ percentage }: { percentage: number }) {
  const radius = 18
  const stroke = 3
  const normalizedRadius = radius - stroke * 0.5
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="text-border/60"
        />
        <circle
          stroke="#10b981"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-text-primary">
        {percentage}%
      </span>
    </div>
  )
}

export function GogoLearningProcessesCard({
  metrics,
  vocabStats,
  courses = [],
  toeicAttemptsCount = 0,
}: GogoProcessesCardProps) {
  const masteredVocab = vocabStats?.learned_words ?? 18
  const totalVocab = vocabStats?.total_cards ?? 24
  const vocabPct = totalVocab > 0 ? Math.round((masteredVocab / totalVocab) * 100) : 75

  const totalCourses = metrics.totalCourses || 2
  const completedCourses = metrics.completedCourses || 1
  const coursePct = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 50

  const toeicDone = toeicAttemptsCount || 7
  const toeicTarget = 20
  const toeicPct = Math.round((toeicDone / toeicTarget) * 100)

  const items: ProcessItem[] = [
    {
      id: 'vocab',
      title: 'Từ vựng SRS',
      countText: `${masteredVocab} / ${totalVocab}`,
      percentage: Math.min(100, vocabPct),
    },
    {
      id: 'courses',
      title: 'Khóa học',
      countText: `${completedCourses} / ${totalCourses}`,
      percentage: Math.min(100, coursePct),
    },
    {
      id: 'toeic',
      title: 'Đề thi TOEIC',
      countText: `${toeicDone} / ${toeicTarget}`,
      percentage: Math.min(100, toeicPct),
    },
    {
      id: 'listening',
      title: 'Luyện nghe',
      countText: '26 / 30',
      percentage: 87,
    },
    {
      id: 'speaking',
      title: 'Luyện phát âm AI',
      countText: '5 / 20',
      percentage: 25,
    },
    {
      id: 'writing',
      title: 'Luyện viết luận',
      countText: '4 / 18',
      percentage: 22,
    },
  ]

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
        Processes
      </h2>
      <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs grid grid-cols-2 gap-4 sm:gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-surface-subtle/50 border border-border/50"
          >
            <div>
              <p className="text-xs font-semibold text-text-secondary">
                {item.title}
              </p>
              <p className="text-sm sm:text-base font-extrabold text-text-primary mt-0.5">
                {item.countText}
              </p>
            </div>
            <CircularProgress percentage={item.percentage} />
          </div>
        ))}
      </div>
    </div>
  )
}
