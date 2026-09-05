/**
 * @file listening.cards.tsx
 * @description Component giao diện React ListeningCards cho học viên
 */

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icons/icon.map'
import type { ListeningExercise, ListeningAttempt } from '@/types/listening'

function formatDuration(seconds?: number): string {
  if (!seconds) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

function getDifficultyColor(diff?: string): string {
  switch (diff) {
    case 'EASY':
      return 'bg-success-soft text-success'
    case 'MEDIUM':
      return 'bg-warning-soft text-warning'
    case 'HARD':
      return 'bg-error-soft text-error'
    default:
      return 'bg-surface-subtle text-text-secondary'
  }
}

export function FilterChip({
  children,
  active,
  onClick,
  color,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  color?: 'success' | 'warning' | 'error'
}) {
  const colorClass = color
    ? color === 'success'
      ? 'text-success'
      : color === 'warning'
        ? 'text-warning'
        : 'text-error'
    : ''

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all
        ${
          active
            ? 'bg-primary text-white'
            : 'bg-surface-subtle text-text-secondary hover:bg-surface-hover'
        }
        ${colorClass}
      `}
    >
      {children}
    </button>
  )
}

export function ExerciseCard({
  exercise,
  onClick,
  isVietnamese,
}: {
  exercise: ListeningExercise
  onClick: () => void
  isVietnamese: boolean
}) {
  const diffClass = getDifficultyColor(exercise.difficultyLevel)

  return (
    <Card
      className="dashboard-card cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                exercise.mediaType === 'VIDEO'
                  ? 'bg-info-soft text-info'
                  : 'bg-primary-soft text-primary'
              }`}
            >
              <Icon
                name={exercise.mediaType === 'VIDEO' ? 'video' : 'headphones'}
                size={20}
              />
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs ${diffClass}`}>
              {exercise.cefrLevel || 'B1'}
            </span>
          </div>
          <span className="rounded bg-surface-subtle px-2 py-1 text-xs text-text-secondary">
            Dictation
          </span>
        </div>

        <h4 className="mb-1 font-semibold text-text-primary line-clamp-1">
          {exercise.title}
        </h4>
        <p className="mb-3 text-xs text-text-secondary line-clamp-2">
          {exercise.description}
        </p>

        <div className="mb-3 flex items-center gap-3 text-xs text-text-tertiary">
          <span className="flex items-center gap-1">
            <Icon name="clock" size={12} />
            {formatDuration(exercise.durationSeconds)}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="list" size={12} />
            {exercise.segments?.length || 1} {isVietnamese ? 'đoạn' : 'segments'}
          </span>
        </div>

        <Button className="w-full bg-primary text-white hover:bg-primary-hover">
          {isVietnamese ? 'Bắt đầu' : 'Start'}
          <Icon name="arrow-right" size={16} />
        </Button>
      </CardContent>
    </Card>
  )
}

export function ContinueCard({
  exercise,
  attempt,
  onClick,
  isVietnamese,
}: {
  exercise: ListeningExercise
  attempt: ListeningAttempt
  onClick: () => void
  isVietnamese: boolean
}) {
  const progress = attempt.segmentAnswers?.length || 0
  const total = exercise.segments?.length || 1

  return (
    <Card
      className="dashboard-card cursor-pointer border-primary bg-primary-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Icon name="play-circle" className="text-primary" size={18} />
          <span className="text-xs font-medium text-primary">
            {isVietnamese ? 'Đang dở' : 'In Progress'}
          </span>
        </div>
        <h4 className="mb-1 font-semibold text-text-primary">
          {exercise.title}
        </h4>
        <p className="mb-3 text-sm text-text-secondary">
          {isVietnamese ? 'Câu' : 'Question'} {progress + 1} / {total}
        </p>
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-primary-20">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min((progress / total) * 100, 100)}%` }}
          />
        </div>
        <Button className="w-full bg-primary text-white hover:bg-primary-hover">
          <Icon name="play" size={16} />
          {isVietnamese ? 'Tiếp tục' : 'Continue'}
        </Button>
      </CardContent>
    </Card>
  )
}
