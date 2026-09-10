/**
 * @file speaking.prompt.card.tsx
 * @description Card hiển thị đề bài, hướng dẫn, nội dung cần nói và thông số thời gian của bài tập Speaking
 */

import { Volume2 } from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import type { SpeakingExercise, SpeakingExerciseType } from '@/features/practice/types/speaking'

interface SpeakingPromptCardProps {
  exercise: SpeakingExercise
  isVietnamese: boolean
  typeLabels: Record<SpeakingExerciseType, string>
}

export function SpeakingPromptCard({
  exercise,
  isVietnamese,
  typeLabels,
}: SpeakingPromptCardProps) {
  return (
    <Card className="mb-6 dashboard-card">
      <CardContent className="p-4">
        <div className="mb-4">
          <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
            {isVietnamese ? 'Hướng dẫn' : 'Instructions'}
          </h2>
          <p className="text-[13px] text-text-secondary">
            {isVietnamese ? exercise.prompt_text_vi : exercise.prompt_text_en}
          </p>
        </div>

        {(exercise.exercise_type === 'TOPIC' ||
          exercise.exercise_type === 'RESPOND_SITUATION') && (
          <div className="mb-4 rounded-xl bg-surface-subtle p-4">
            <h3 className="mb-2 text-[13px] font-medium text-text-primary">
              {isVietnamese ? 'Nội dung' : 'Content'}
            </h3>
            <p className="text-[14px] leading-relaxed text-text-primary">
              {exercise.prompt_text_en}
            </p>
          </div>
        )}

        {(exercise.exercise_type === 'PRONUNCIATION' ||
          exercise.exercise_type === 'READ_ALOUD') &&
          exercise.source_text && (
            <div className="mb-4 rounded-xl bg-surface-subtle p-4">
              <h3 className="mb-2 flex items-center gap-2 text-[13px] font-medium text-text-primary">
                <Volume2 size={16} />
                {isVietnamese ? 'Văn bản để đọc' : 'Text to read'}
              </h3>
              <p className="text-[15px] leading-relaxed text-text-primary">
                {exercise.source_text}
              </p>
            </div>
          )}

        <div className="flex flex-wrap gap-3 text-[12px]">
          <span className="rounded-full bg-surface-subtle px-3 py-1 text-text-secondary">
            {isVietnamese ? 'Loại:' : 'Type:'} {typeLabels[exercise.exercise_type]}
          </span>
          <span className="rounded-full bg-surface-subtle px-3 py-1 text-text-secondary">
            {isVietnamese ? 'Chuẩn bị:' : 'Prep:'}{' '}
            {exercise.preparation_time_seconds || 0}s
          </span>
          <span className="rounded-full bg-surface-subtle px-3 py-1 text-text-secondary">
            {isVietnamese ? 'Thời gian:' : 'Time:'}{' '}
            {exercise.response_time_seconds || 60}s
          </span>
          {exercise.cefr_level && (
            <span className="rounded-full bg-surface-subtle px-3 py-1 text-text-secondary">
              CEFR: {exercise.cefr_level}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
