import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icons/icon-map'
import {
  getLastAttempt,
  formatDuration,
  getDifficultyColor,
  getExerciseTypeLabel,
  getTopicById,
} from '@/data/listening-data'
import type { ListeningExercise, ListeningAttempt } from '@/types/listening'

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
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
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
  const lastAttempt = getLastAttempt(exercise.id)
  const topic = getTopicById(exercise.topicId)
  const diffClass = getDifficultyColor(exercise.difficultyLevel)

  return (
    <Card
      className="dashboard-card cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
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
            <span className={`text-xs px-2 py-0.5 rounded-full ${diffClass}`}>
              {exercise.cefrLevel}
            </span>
          </div>
          <span className="text-xs px-2 py-1 bg-surface-subtle rounded text-text-secondary">
            {getExerciseTypeLabel(exercise.exerciseType)}
          </span>
        </div>

        <h4 className="font-semibold text-text-primary mb-1 line-clamp-1">
          {exercise.title}
        </h4>
        <p className="text-xs text-text-secondary mb-3 line-clamp-2">
          {exercise.description}
        </p>

        <div className="flex items-center gap-3 text-xs text-text-tertiary mb-3">
          <span className="flex items-center gap-1">
            <Icon name="clock" size={12} />
            {formatDuration(exercise.durationSeconds)}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="list" size={12} />
            {exercise.segments.length} {isVietnamese ? 'câu' : 'sentences'}
          </span>
          {topic && (
            <span className="flex items-center gap-1">
              <Icon name="tag" size={12} />
              {topic.name}
            </span>
          )}
        </div>

        {lastAttempt && (
          <div className="flex items-center gap-2 p-2 bg-surface-subtle rounded-lg mb-3">
            <div className="flex-1">
              <div className="text-xs text-text-tertiary">
                {isVietnamese ? 'Lần trước' : 'Last attempt'}
              </div>
              <div className="text-sm font-medium text-text-primary">
                {lastAttempt.accuracy}% {isVietnamese ? 'đúng' : 'correct'}
              </div>
            </div>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                (lastAttempt.accuracy || 0) >= 80
                  ? 'bg-success-soft text-success'
                  : (lastAttempt.accuracy || 0) >= 50
                    ? 'bg-warning-soft text-warning'
                    : 'bg-error-soft text-error'
              }`}
            >
              {lastAttempt.accuracy || 0}%
            </div>
          </div>
        )}

        <Button
          className={`w-full ${
            lastAttempt
              ? 'bg-surface-hover hover:bg-surface-subtle text-text-primary'
              : 'bg-primary hover:bg-primary-hover text-white'
          }`}
        >
          {lastAttempt
            ? isVietnamese
              ? 'Luyện lại'
              : 'Retry'
            : isVietnamese
              ? 'Bắt đầu'
              : 'Start'}
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
  const progress = attempt.segmentAnswers.length
  const total = exercise.segments.length

  return (
    <Card
      className="dashboard-card cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg bg-primary-5 border-primary"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="play-circle" className="text-primary" size={18} />
          <span className="text-xs font-medium text-primary">
            {isVietnamese ? 'Đang dở' : 'In Progress'}
          </span>
        </div>
        <h4 className="font-semibold text-text-primary mb-1">
          {exercise.title}
        </h4>
        <p className="text-sm text-text-secondary mb-3">
          {isVietnamese ? 'Câu' : 'Question'} {progress + 1} / {total}
        </p>
        <div className="h-1.5 bg-primary-20 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${(progress / total) * 100}%` }}
          />
        </div>
        <Button className="w-full bg-primary hover:bg-primary-hover text-white">
          <Icon name="play" size={16} />
          {isVietnamese ? 'Tiếp tục' : 'Continue'}
        </Button>
      </CardContent>
    </Card>
  )
}
