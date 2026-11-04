// Component lưới 6 thẻ trực quan hóa năng lực kỹ năng học viên dạng biểu đồ vòng đo tiến độ tròn mini theo phong cách Cuba Admin.
'use client'

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

function MiniCircularGauge({
  value,
  max = 100,
  color,
  textColor,
  size = 56,
  strokeWidth = 5.5,
  displayValue,
}: {
  value: number
  max?: number
  color: string
  textColor: string
  size?: number
  strokeWidth?: number
  displayValue?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0))
  const strokeDashoffset = circumference - (pct / 100) * circumference

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border/40"
        />
        {pct > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        )}
      </svg>
      <span className={`absolute text-[11px] font-black tracking-tight ${textColor}`}>
        {displayValue !== undefined ? displayValue : `${Math.round(value)}%`}
      </span>
    </div>
  )
}

function getCefrBadge(score: number): { label: string; bg: string } {
  if (score >= 85) return { label: 'C1', bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' }
  if (score >= 70) return { label: 'B2', bg: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30' }
  if (score >= 50) return { label: 'B1', bg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' }
  if (score >= 30) return { label: 'A2', bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' }
  if (score > 0) return { label: 'A1', bg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' }
  return { label: '--', bg: 'bg-surface-subtle text-text-tertiary border-border' }
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
  const totalCards = vocabStats?.total_cards ?? 0
  const vocabPct = totalCards > 0 ? Math.round((masteredVocab / totalCards) * 100) : 0
  const speakingPts = skillsSummary?.skills?.speaking?.accuracy ?? speakingScore
  const writingPts = skillsSummary?.skills?.writing?.accuracy ?? writingScore

  const statItems = [
    {
      id: 'reading',
      label: 'Đọc hiểu',
      value: readingAcc,
      displayValue: readingAcc > 0 ? `${Math.round(readingAcc)}%` : '0%',
      icon: BookOpen,
      color: '#10b981',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      badge: getCefrBadge(readingAcc),
      sub: `${skillsSummary?.skills?.reading?.total_questions ?? 0} câu đã làm`,
      cardHover: 'hover:border-emerald-400/60 dark:hover:border-emerald-600/60',
    },
    {
      id: 'listening',
      label: 'Nghe hiểu',
      value: listeningAcc,
      displayValue: listeningAcc > 0 ? `${Math.round(listeningAcc)}%` : '0%',
      icon: Headphones,
      color: '#0284c7',
      textColor: 'text-sky-600 dark:text-sky-400',
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      badge: getCefrBadge(listeningAcc),
      sub: `${skillsSummary?.skills?.listening?.total_questions ?? 0} câu đã làm`,
      cardHover: 'hover:border-sky-400/60 dark:hover:border-sky-600/60',
    },
    {
      id: 'grammar',
      label: 'Ngữ pháp',
      value: grammarAcc,
      displayValue: grammarAcc > 0 ? `${Math.round(grammarAcc)}%` : '0%',
      icon: FileText,
      color: '#84cc16',
      textColor: 'text-lime-600 dark:text-lime-400',
      iconBg: 'bg-lime-500/10 text-lime-600 dark:text-lime-400',
      badge: getCefrBadge(grammarAcc),
      sub: `${skillsSummary?.skills?.grammar?.total_questions ?? 0} câu đã làm`,
      cardHover: 'hover:border-lime-400/60 dark:hover:border-lime-600/60',
    },
    {
      id: 'vocab',
      label: 'Từ vựng SRS',
      value: vocabPct,
      displayValue: `${masteredVocab}`,
      icon: Layers,
      color: '#6366f1',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      badge: { label: `${masteredVocab}/${totalCards}`, bg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' },
      sub: `${masteredVocab} từ đã thuộc`,
      cardHover: 'hover:border-indigo-400/60 dark:hover:border-indigo-600/60',
    },
    {
      id: 'speaking',
      label: 'Luyện nói',
      value: speakingPts,
      displayValue: speakingPts > 0 ? `${Math.round(speakingPts)}` : '0',
      icon: Mic,
      color: '#f59e0b',
      textColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      badge: getCefrBadge(speakingPts),
      sub: `${skillsSummary?.skills?.speaking?.total_attempts ?? 0} bài ghi âm`,
      cardHover: 'hover:border-amber-400/60 dark:hover:border-amber-600/60',
    },
    {
      id: 'writing',
      label: 'Luyện viết',
      value: writingPts,
      displayValue: writingPts > 0 ? `${Math.round(writingPts)}` : '0',
      icon: PenTool,
      color: '#0d9488',
      textColor: 'text-teal-600 dark:text-teal-400',
      iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
      badge: getCefrBadge(writingPts),
      sub: `${skillsSummary?.skills?.writing?.total_attempts ?? 0} bài luận`,
      cardHover: 'hover:border-teal-400/60 dark:hover:border-teal-600/60',
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
          Chỉ Số Năng Lực Trọng Tâm
        </h2>
        <span className="text-xs text-text-tertiary">
          Khung năng lực CEFR & Tỉ lệ chính xác
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
        {statItems.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.id}
              className={`rounded-2xl border border-border p-3.5 sm:p-4 flex flex-col items-center justify-between text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md min-h-[160px] bg-surface ${item.cardHover}`}
            >
              <div className="w-full flex items-center justify-between pb-1">
                <span className={`p-1.5 rounded-xl flex items-center justify-center ${item.iconBg}`}>
                  <Icon className="w-4 h-4 stroke-[2]" />
                </span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${item.badge.bg}`}>
                  {item.badge.label}
                </span>
              </div>

              <div className="my-1">
                <MiniCircularGauge
                  value={item.value}
                  color={item.color}
                  textColor={item.textColor}
                  displayValue={item.displayValue}
                />
              </div>

              <div className="w-full space-y-0.5">
                <span className="text-xs font-bold text-text-primary block truncate">
                  {item.label}
                </span>
                <span className="text-[10px] text-text-tertiary block truncate">
                  {item.sub}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
