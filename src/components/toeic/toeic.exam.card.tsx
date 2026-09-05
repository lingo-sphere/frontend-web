/**
 * @file toeic.exam.card.tsx
 * @description Component giao diện React ToeicExamCard cho học viên
 */

import { Trophy, Clock, Users, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { ToeicExam } from '@/types/toeic'

export function FilterChip({
  label,
  active,
  count,
  onClick,
}: {
  label: string
  active: boolean
  count?: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
        active
          ? 'bg-primary text-white'
          : 'bg-surface-subtle text-text-secondary hover:bg-surface-hover hover:text-text-primary'
      }`}
    >
      {label}
      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] ${
            active ? 'bg-white/20' : 'bg-surface-hover'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  )
}

interface ExamCardProps {
  exam: ToeicExam
  onClick: () => void
  isVietnamese: boolean
}

export function ExamCard({ exam, onClick, isVietnamese }: ExamCardProps) {
  const difficultyColors = {
    EASY: 'bg-emerald-100 text-emerald-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    HARD: 'bg-red-100 text-red-700',
  }

  const difficultyLabels = {
    EASY: isVietnamese ? 'Dễ' : 'Easy',
    MEDIUM: isVietnamese ? 'TB' : 'Medium',
    HARD: isVietnamese ? 'Khó' : 'Hard',
  }

  const isOfficial = exam.isOfficial
  const difficulty = exam.difficultyLevel || 'MEDIUM'

  return (
    <Card
      className="dashboard-card cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            {isOfficial ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <Trophy className="h-5 w-5 text-amber-600" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-soft">
                <FileText className="h-5 w-5 text-info" />
              </div>
            )}
            <div>
              <h3 className="text-[15px] font-semibold text-text-primary line-clamp-1">
                {exam.title}
              </h3>
              <p className="text-[11px] text-text-tertiary">
                {exam.examSeries} {exam.releaseYear}
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              difficultyColors[difficulty as keyof typeof difficultyColors]
            }`}
          >
            {difficultyLabels[difficulty as keyof typeof difficultyLabels]}
          </span>
        </div>

        <p className="mb-3 text-[12px] text-text-secondary line-clamp-2">
          {exam.description}
        </p>

        <div className="flex items-center justify-between border-t border-border pt-3 text-[11px] text-text-tertiary">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {exam.avgTimeMinutes || 120} {isVietnamese ? 'phút' : 'min'}
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} />
              {(exam.totalAttempts || 0).toLocaleString()}
            </span>
          </div>
          {exam.avgScore && (
            <span className="font-semibold text-primary">
              {exam.avgScore} pts
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
