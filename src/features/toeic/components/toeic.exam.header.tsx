/**
 * @file toeic.exam.header.tsx
 * @description Header thanh điều hướng, đếm ngược thời gian và nộp bài thi TOEIC
 */

'use client'

import { ArrowLeft, Clock } from 'lucide-react'
import { Button } from '@/components/button'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

interface ToeicExamHeaderProps {
  title: string
  currentQuestionIndex: number
  totalQuestions: number
  timedMode: boolean
  timeRemaining: number
  isVietnamese: boolean
  onBackToModeSelect: () => void
  onSubmit: () => void
}

export function ToeicExamHeader({
  title,
  currentQuestionIndex,
  totalQuestions,
  timedMode,
  timeRemaining,
  isVietnamese,
  onBackToModeSelect,
  onSubmit,
}: ToeicExamHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-md shadow-xs">
      <div className="w-full flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBackToModeSelect} className="cursor-pointer">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-[14px] font-semibold text-text-primary">{title}</h1>
            <p className="text-[11px] text-text-tertiary">
              {isVietnamese ? 'Câu' : 'Question'} {currentQuestionIndex + 1} / {totalQuestions}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {timedMode && timeRemaining > 0 && (
            <div
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${
                timeRemaining < 300 ? 'bg-red-100 text-red-600' : 'bg-surface-subtle'
              }`}
            >
              <Clock size={16} />
              <span className="font-mono text-[14px] font-semibold">{formatTime(timeRemaining)}</span>
            </div>
          )}
          <Button size="sm" className="gap-1 bg-primary hover:bg-primary-hover cursor-pointer" onClick={onSubmit}>
            {isVietnamese ? 'Nộp bài' : 'Submit'}
          </Button>
        </div>
      </div>
    </header>
  )
}
