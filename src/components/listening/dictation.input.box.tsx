/**
 * @file dictation.input.box.tsx
 * @description Component hiển thị câu văn và các ô điền từ (blanks) tương tác cho bài nghe chép chính tả
 */

'use client'

import React from 'react'
import type { TranscriptSegment, Blank } from '@/types/listening'

export interface CheckedBlankResult {
  blankId: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
}

export interface CheckedResults {
  [blankId: string]: CheckedBlankResult
}

export interface UserAnswers {
  [blankId: string]: string
}

export interface HintRevealedCount {
  [blankId: string]: number
}

interface DictationInputBoxProps {
  currentSegment: TranscriptSegment
  answers: UserAnswers
  hintRevealedCount: HintRevealedCount
  checkedResults: CheckedResults
  completedSegments: Set<string>
  correctedAnswers: Record<string, string>
  onAnswerChange: (blankId: string, value: string) => void
}

export function DictationInputBox({
  currentSegment,
  answers,
  hintRevealedCount,
  checkedResults,
  completedSegments,
  correctedAnswers,
  onAnswerChange,
}: DictationInputBoxProps) {
  const renderBlank = (blank: Blank, segmentId: string) => {
    const userAnswer = answers[blank.id] || ''
    const hintCount = hintRevealedCount[blank.id] || 0
    const checkedResult = checkedResults[blank.id]
    const isChecked = Boolean(checkedResult)
    const isCorrect = checkedResult?.isCorrect
    const isSegmentCompleted = completedSegments.has(segmentId)
    const hasCorrectedAnswer = Boolean(correctedAnswers[blank.id])

    const answerLength = blank.answer.length
    const userInputLength = userAnswer.length
    const totalShown = Math.max(userInputLength, hintCount)
    const remainingStars = Math.max(0, answerLength - totalShown)

    const hintPrefix = blank.answer.slice(0, hintCount)
    const userTypedPart = userAnswer.slice(hintCount)
    let displayText = hintPrefix + userTypedPart
    if (remainingStars > 0 && !isChecked && !isSegmentCompleted) {
      displayText += '*'.repeat(remainingStars)
    }

    let finalText = displayText
    let textColor = 'text-text-tertiary'
    let hasLineThrough = false

    if (isSegmentCompleted) {
      if (isCorrect) {
        textColor = 'text-success'
      } else if (hasCorrectedAnswer) {
        finalText = correctedAnswers[blank.id]
        textColor = 'text-warning font-medium'
      }
    } else if (isChecked) {
      if (isCorrect) {
        textColor = 'text-success'
      } else {
        textColor = 'text-error'
        hasLineThrough = true
      }
    } else if (userInputLength > hintCount) {
      textColor = 'text-primary'
    } else if (hintCount > 0) {
      textColor = 'text-warning'
    }

    return (
      <span
        key={blank.id}
        className="relative inline-block mx-0.5"
        onClick={() => {
          if (!isSegmentCompleted && !isChecked) {
            const input = document.getElementById(`blank-input-${blank.id}`) as HTMLInputElement
            if (input) input.focus()
          }
        }}
      >
        <span
          className={`
            inline-flex items-center justify-center min-w-[40px] max-w-[200px] h-8 px-2 text-center
            transition-all
            ${hasLineThrough ? 'line-through decoration-2' : ''}
            ${textColor}
          `}
        >
          {finalText}
        </span>

        <input
          id={`blank-input-${blank.id}`}
          type="text"
          maxLength={answerLength}
          disabled={isSegmentCompleted}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          value={userAnswer}
          onChange={(e) => {
            if (isSegmentCompleted) return
            const newValue = e.target.value
            const hintPart = blank.answer.slice(0, hintCount)
            if (newValue.length < hintCount) {
              onAnswerChange(blank.id, hintPart)
            } else {
              const userTyped = newValue.slice(hintCount)
              onAnswerChange(blank.id, hintPart + userTyped)
            }
          }}
          onKeyDown={(e) => {
            if (isSegmentCompleted) return
            if (e.key === 'Enter') {
              e.currentTarget.blur()
            }
            if (e.key === 'Backspace' && userAnswer.length <= hintCount) {
              e.preventDefault()
            }
          }}
          autoComplete="off"
          autoCapitalize="off"
        />
      </span>
    )
  }

  const words = currentSegment.textEn.split(' ')

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg leading-relaxed text-text-primary mb-4 font-medium">
      {words.map((word, index) => {
        const blank = currentSegment.blanks.find((b) => b.wordIndex === index)

        if (!blank) {
          return <span key={index}>{word}</span>
        }

        return (
          <span key={blank.id}>
            {renderBlank(blank, currentSegment.id)}
            <span> </span>
          </span>
        )
      })}
    </div>
  )
}
