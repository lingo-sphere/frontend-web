/**
 * @file ContextExercise.tsx
 * @description Component giao diện React ContextExercise cho học viên
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { VocabularyItem } from '@/types/vocabulary-learn'

interface ContextExerciseProps {
  word: VocabularyItem
  isAnswered: boolean
  onAnswer: (isCorrect: boolean, userAnswer: string) => void
  onNext: () => void
  onSpeakWord: () => void
  onSpeakSentence: () => void
}

export function ContextExercise({ word, isAnswered, onAnswer, onNext, onSpeakSentence }: ContextExerciseProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [userInput, setUserInput] = useState('')
  const [isChecked, setIsChecked] = useState(false)

  const getSentenceWithBlank = () => {
    const sentence = word.example ? word.example : ''
    const regex = new RegExp(word.word, 'gi')
    return sentence.replace(regex, '______')
  }

  const handleCheck = () => {
    const trimmedInput = userInput.trim().toLowerCase()
    const correctAnswer = word.word.toLowerCase()
    setIsChecked(true)
    onAnswer(trimmedInput === correctAnswer, userInput)
  }

  const isCorrect = userInput.trim().toLowerCase() === word.word.toLowerCase()

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-center">
        <p className="mb-2 text-[14px] text-text-secondary">
          {isVietnamese ? 'Điền vào chỗ trống:' : 'Fill in the blank:'}
        </p>
        <div className="rounded-xl bg-surface-subtle p-6">
          <p className="text-[18px] leading-relaxed text-text-primary">{getSentenceWithBlank()}</p>
        </div>
      </div>

      <p className="mb-4 text-[12px] text-text-tertiary">
        {isVietnamese ? 'Nghĩa:' : 'Meaning:'} <span className="text-text-secondary">{word.meaningVi}</span>
      </p>

      <div className="mb-4 w-full">
        <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} disabled={isChecked}
          className={`w-full rounded-xl border-2 p-4 text-center text-[20px] font-semibold tracking-wide transition-colors focus:outline-none ${
            isChecked ? isCorrect ? 'border-success bg-success/10' : 'border-error bg-error/10'
              : 'border-border bg-surface focus:border-primary'
          }`}
          placeholder={isVietnamese ? 'Nhập từ còn thiếu...' : 'Type the missing word...'}
          autoFocus />
      </div>

      {!isChecked && (
        <Button className="bg-primary hover:bg-primary-hover" onClick={handleCheck} disabled={!userInput.trim()}>
          {isVietnamese ? 'Kiểm tra' : 'Check Answer'}
        </Button>
      )}

      {isChecked && (
        <div className="mt-6 w-full text-center">
          <div className={`mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 ${
            isCorrect ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
          }`}>
            {isCorrect ? (
              <><Check size={18} /><span className="font-semibold">{isVietnamese ? 'Đúng!' : 'Correct!'}</span></>
            ) : (
              <><X size={18} /><span className="font-semibold">{isVietnamese ? 'Chưa đúng' : 'Not quite'}</span></>
            )}
          </div>

          <div className="mt-4 rounded-xl bg-surface-subtle p-4">
            <p className="text-[16px] italic text-text-primary">{word.example}</p>
            <p className="mt-2 text-[14px] text-text-secondary">{word.exampleMeaningVi}</p>
          </div>

          <Button className="mt-4 bg-primary hover:bg-primary-hover" onClick={onNext}>
            {isVietnamese ? 'Tiếp theo' : 'Next'}
            <ChevronRight size={18} />
          </Button>
        </div>
      )}
    </div>
  )
}
