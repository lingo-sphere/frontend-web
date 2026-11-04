// Component hiển thị tiến trình hoàn thành khóa học, từ vựng và bài thi TOEIC kèm vòng tròn tiến độ.
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
  subText: string
  countText: string
  percentage: number
}

function CircularProgress({ percentage }: { percentage: number }) {
  const radius = 18
  const stroke = 3
  const normalizedRadius = radius - stroke * 0.5
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference

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
        {percentage > 0 && (
          <circle
            stroke="#10b981"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-500"
          />
        )}
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
  toeicAttemptsCount = 0,
}: GogoProcessesCardProps) {
  const masteredVocab = vocabStats?.learned_words ?? 0
  const totalVocab = vocabStats?.total_cards ?? 0
  const vocabPct = totalVocab > 0 ? Math.round((masteredVocab / totalVocab) * 100) : 0

  const totalCourses = metrics.totalCourses ?? 0
  const completedCourses = metrics.completedCourses ?? 0
  const coursePct = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0

  const toeicDone = toeicAttemptsCount
  const passRate = metrics.passRate !== undefined ? Math.round(metrics.passRate) : 0
  const totalTests = metrics.totalAttemptsCount ?? 0

  const items: ProcessItem[] = [
    {
      id: 'courses',
      title: 'Khóa học chính khóa',
      subText: 'Tiến độ hoàn thành bài học',
      countText: `${completedCourses} / ${totalCourses} khóa`,
      percentage: Math.min(100, coursePct),
    },
    {
      id: 'vocab',
      title: 'Từ vựng ghi nhớ SRS',
      subText: 'Từ đã đạt cấp độ thành thạo',
      countText: `${masteredVocab} / ${totalVocab} từ`,
      percentage: Math.min(100, vocabPct),
    },
    {
      id: 'toeic',
      title: 'Đề thi TOEIC đã làm',
      subText: 'Bài thi thử Full Test & Mini Test',
      countText: `${toeicDone} đề hoàn thành`,
      percentage: Math.min(100, toeicDone > 0 ? Math.min(100, toeicDone * 10) : 0),
    },
    {
      id: 'tests',
      title: 'Tỷ lệ đạt bài kiểm tra',
      subText: `${totalTests} lượt thi chương & tốt nghiệp`,
      countText: `${passRate}% tỷ lệ đỗ`,
      percentage: Math.min(100, passRate),
    },
  ]

  return (
    <div className="space-y-3 h-full flex flex-col">
      <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
        Tiến độ Rèn luyện & Khóa học
      </h2>
      <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs flex-1 flex flex-col justify-between space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center justify-between gap-4 py-2.5 ${
              index !== items.length - 1 ? 'border-b border-border/50' : ''
            }`}
          >
            <div className="space-y-0.5 min-w-[140px]">
              <h3 className="text-sm font-bold text-text-primary">
                {item.title}
              </h3>
              <p className="text-[11px] text-text-tertiary">
                {item.subText}
              </p>
              <span className="text-xs font-semibold text-text-secondary block pt-0.5">
                {item.countText}
              </span>
            </div>

            <CircularProgress percentage={item.percentage} />
          </div>
        ))}
      </div>
    </div>
  )
}
