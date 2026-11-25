// Header thanh điều hướng, đếm ngược thời gian hoạt họa và nộp bài thi TOEIC.
'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/button'
import { AnimatedTimer } from '@/components/animated.timer'

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
            <AnimatedTimer seconds={timeRemaining} size="md" isWarningThreshold={300} />
          )}
          <Button size="sm" className="gap-1 bg-primary hover:bg-primary-hover cursor-pointer" onClick={onSubmit}>
            {isVietnamese ? 'Nộp bài' : 'Submit'}
          </Button>
        </div>
      </div>
    </header>
  )
}
