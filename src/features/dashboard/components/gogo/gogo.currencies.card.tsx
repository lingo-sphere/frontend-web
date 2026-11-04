// Component hiển thị chỉ số chính xác và xu hướng phát triển của các kỹ năng trọng tâm.
'use client'

import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import type { SkillsSummary, TimeGrowth } from '@/features/progress/services/progress.service'

interface GogoCurrenciesCardProps {
  listeningScore?: number
  readingScore?: number
  speakingScore?: number
  writingScore?: number
  skillsSummary?: SkillsSummary | null
  skillsDelta?: TimeGrowth['skills_delta']
}

export function GogoCurrenciesCard({
  listeningScore = 0,
  readingScore = 0,
  speakingScore = 0,
  writingScore = 0,
  skillsSummary,
  skillsDelta,
}: GogoCurrenciesCardProps) {
  const listeningAcc = skillsSummary?.skills?.listening?.accuracy ?? listeningScore
  const readingAcc = skillsSummary?.skills?.reading?.accuracy ?? readingScore
  const grammarAcc = skillsSummary?.skills?.grammar?.accuracy ?? 0
  const speakingAcc = skillsSummary?.skills?.speaking?.accuracy ?? speakingScore
  const writingAcc = skillsSummary?.skills?.writing?.accuracy ?? writingScore

  const items = [
    {
      id: 'listening',
      name: 'Nghe hiểu (Listening)',
      sub: 'TOEIC Part 1 - Part 4',
      val: Math.round(listeningAcc),
      attempts: skillsSummary?.skills?.listening?.total_attempts ?? 0,
      delta: skillsDelta?.listening,
      trend: skillsSummary?.skills?.listening?.trend,
    },
    {
      id: 'reading',
      name: 'Đọc hiểu (Reading)',
      sub: 'TOEIC Part 5 - Part 7',
      val: Math.round(readingAcc),
      attempts: skillsSummary?.skills?.reading?.total_attempts ?? 0,
      delta: skillsDelta?.reading,
      trend: skillsSummary?.skills?.reading?.trend,
    },
    {
      id: 'grammar',
      name: 'Ngữ pháp & Cấu trúc',
      sub: 'Ngữ pháp thực hành & Nhận diện lỗi',
      val: Math.round(grammarAcc),
      attempts: skillsSummary?.skills?.grammar?.total_attempts ?? 0,
      delta: skillsDelta?.grammar,
      trend: skillsSummary?.skills?.grammar?.trend,
    },
    {
      id: 'speaking',
      name: 'Luyện nói & Phát âm AI',
      sub: 'Fluency, Pronunciation & Intonation',
      val: Math.round(speakingAcc),
      attempts: skillsSummary?.skills?.speaking?.total_attempts ?? 0,
      delta: skillsDelta?.speaking,
      trend: skillsSummary?.skills?.speaking?.trend,
    },
    {
      id: 'writing',
      name: 'Luyện viết câu & Đoạn văn',
      sub: 'Grammar Accuracy & Coherence',
      val: Math.round(writingAcc),
      attempts: skillsSummary?.skills?.writing?.total_attempts ?? 0,
      delta: skillsDelta?.writing,
      trend: skillsSummary?.skills?.writing?.trend,
    },
  ]

  return (
    <div className="space-y-3 h-full flex flex-col">
      <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
        Năng lực 4 Kỹ năng & Ngữ pháp
      </h2>
      <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs flex-1 flex flex-col justify-between space-y-3">
        {items.map((item, index) => {
          const deltaVal = item.delta
          const hasDelta = deltaVal !== undefined && deltaVal !== 0
          const isImproving = (deltaVal && deltaVal > 0) || item.trend === 'IMPROVING'

          return (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-4 py-2.5 ${
                index !== items.length - 1 ? 'border-b border-border/50' : ''
              }`}
            >
              <div className="space-y-0.5 min-w-[140px] flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-text-primary">
                    {item.name}
                  </h3>
                  {hasDelta ? (
                    <span
                      className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isImproving
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                          : 'text-rose-600 dark:text-rose-400 bg-rose-500/10'
                      }`}
                    >
                      {isImproving ? (
                        <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                      )}
                      {deltaVal > 0 ? `+${deltaVal}%` : `${deltaVal}%`}
                    </span>
                  ) : item.trend ? (
                    <span className="flex items-center text-[10px] font-medium text-text-tertiary">
                      <Minus className="w-3 h-3 mr-0.5" />
                      <span>Ổn định</span>
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] text-text-tertiary">
                  {item.sub}
                </p>
              </div>

              <div className="w-36 sm:w-44 flex flex-col items-end gap-1.5 shrink-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-extrabold text-text-primary">
                    {item.val > 0 ? `${item.val}%` : '--'}
                  </span>
                  <span className="text-[10px] text-text-tertiary">/ 100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-subtle border border-border/80 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.val >= 75
                        ? 'bg-emerald-500'
                        : item.val >= 50
                        ? 'bg-teal-500'
                        : item.val > 0
                        ? 'bg-amber-400 dark:bg-amber-500'
                        : 'bg-transparent'
                    }`}
                    style={{ width: `${Math.min(100, item.val)}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
