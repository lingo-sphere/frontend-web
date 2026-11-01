// Component hiển thị chỉ số kỹ năng kèm đường cong sparkline theo phong cách Gogo Currencies Card.
'use client'

import React from 'react'
import { ArrowUpRight } from 'lucide-react'
import type { SkillsSummary } from '@/features/progress/services/progress.service'

interface GogoCurrenciesCardProps {
  listeningScore?: number
  readingScore?: number
  skillsSummary?: SkillsSummary | null
}

export function GogoCurrenciesCard({
  listeningScore = 0,
  readingScore = 0,
  skillsSummary,
}: GogoCurrenciesCardProps) {
  const listeningAcc = skillsSummary?.skills?.listening?.accuracy ?? listeningScore
  const readingAcc = skillsSummary?.skills?.reading?.accuracy ?? readingScore
  const grammarAcc = skillsSummary?.skills?.grammar?.accuracy ?? 75

  const items = [
    {
      id: 'listening',
      name: 'Nghe hiểu (Listening)',
      sub: 'TOEIC Part 1 - Part 4 • 7 ngày',
      val: `${Math.round(listeningAcc || 78)}% / 100`,
      trend: '+4.2%',
      sparklineD: 'M 0 35 C 30 30, 60 15, 90 22 C 120 28, 150 8, 190 12',
    },
    {
      id: 'reading',
      name: 'Đọc hiểu (Reading)',
      sub: 'TOEIC Part 5 - Part 7 • 7 ngày',
      val: `${Math.round(readingAcc || 82)}% / 100`,
      trend: '+2.8%',
      sparklineD: 'M 0 32 C 35 25, 65 38, 100 18 C 130 5, 160 20, 190 10',
    },
    {
      id: 'grammar',
      name: 'Ngữ pháp & Từ vựng',
      sub: 'Cấu trúc câu & SRS • 7 ngày',
      val: `${Math.round(grammarAcc || 85)}% / 100`,
      trend: '+5.1%',
      sparklineD: 'M 0 38 C 40 32, 70 20, 110 24 C 140 26, 165 10, 190 8',
    },
  ]

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
        Currencies
      </h2>
      <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center justify-between gap-4 py-3 ${
              index !== items.length - 1 ? 'border-b border-border/60' : ''
            }`}
          >
            <div className="space-y-1 min-w-[140px]">
              <h3 className="text-sm font-bold text-text-primary">
                {item.name}
              </h3>
              <p className="text-[11px] text-text-tertiary">
                {item.sub}
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-base font-extrabold text-text-primary">
                  {item.val}
                </span>
                <span className="flex items-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-full">
                  <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                  {item.trend}
                </span>
              </div>
            </div>

            <div className="w-36 sm:w-48 h-12 flex items-center justify-end">
              <svg viewBox="0 0 190 40" className="w-full h-full overflow-visible">
                <path
                  d={item.sparklineD}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

