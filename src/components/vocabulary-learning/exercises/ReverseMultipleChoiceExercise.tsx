// Updated: 2026-08-22
// Reverse Multiple Choice Exercise - English to Vietnamese

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { VocabularyItem } from '@/types/vocabulary-learn'
import { getRandomDistractors } from '@/data/vocabulary-learn-data'

interface ReverseMultipleChoiceExerciseProps {
  word: VocabularyItem
  isAnswered: boolean
  onAnswer: (isCorrect: boolean, userAnswer: string) => void
  onNext: () => void
  onSpeakWord: () => void
  onSpeakSentence: () => void
  allWords: VocabularyItem[]
}

export function ReverseMultipleChoiceExercise({
  word,
  isAnswered,
  onAnswer,
  onNext,
  onSpeakWord,
  allWords,
}: ReverseMultipleChoiceExerciseProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)

  const options = useMemo(() => {
    const correctOption = { ...word, tempMeaning: word.meaningVi }
    const distractors = getRandomDistractors(word, allWords, 3).map(d => ({ ...d, tempMeaning: d.meaningVi }))
    return [correctOption, ...distractors].sort(() => Math.random() - 0.5)
  }, [word, allWords])

  const handleSelect = (meaning: string, wordId: string) => {
    if (isAnswered) return
    const isCorrect = wordId === word.id
    setSelectedAnswer(meaning)
    onAnswer(isCorrect, meaning)
  }

  const isCorrect = selectedAnswer === word.meaningVi

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-center">
        <p className="mb-2 text-[14px] text-text-secondary">
          {isVietnamese ? 'Từ này có nghĩa là gì?' : 'What does this word mean?'}
        </p>
        <p className="text-[28px] font-bold text-text-primary">{word.word}</p>
        <button onClick={onSpeakWord}
          className="mt-3 flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-[14px] font-medium text-primary transition-colors hover:bg-primary/20">
          🔊 {isVietnamese ? 'Nghe' : 'Listen'}
        </button>
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        {options.map((option) => {
          const isSelected = selectedAnswer === option.tempMeaning
          const isCorrectOption = option.id === word.id
          const showCorrect = isAnswered && isCorrectOption
          const showWrong = isAnswered && isSelected && !isCorrectOption

          return (
            <button key={option.id} onClick={() => handleSelect(option.tempMeaning, option.id)} disabled={isAnswered}
              className={`relative rounded-xl border-2 p-4 text-center transition-all ${
                showCorrect ? 'border-success bg-success/10' : showWrong ? 'border-error bg-error/10'
                  : isSelected ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:border-primary/50'
              }`}>
              <span className="text-[14px] font-medium text-text-primary">{option.tempMeaning}</span>
              {showCorrect && (
                <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-success text-white">
                  <Check size={14} />
                </div>
              )}
              {showWrong && (
                <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-error text-white">
                  <X size={14} />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {isAnswered && (
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
        </div>
      )}

      {isAnswered && (
        <Button className="mt-4 bg-primary hover:bg-primary-hover" onClick={onNext}>
          {isVietnamese ? 'Tiếp theo' : 'Next'}
          <ChevronRight size={18} />
        </Button>
      )}
    </div>
  )
}
