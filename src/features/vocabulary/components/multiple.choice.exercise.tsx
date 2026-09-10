// Component giao diện React MultipleChoiceExercise cho học viên
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/button'
import type { VocabularyItem } from '@/features/vocabulary/types/vocabulary.learn'
import { getRandomDistractors } from '@/features/practice/lib/audio.utils'

interface MultipleChoiceExerciseProps {
  word: VocabularyItem
  isAnswered: boolean
  onAnswer: (isCorrect: boolean, userAnswer: string) => void
  onNext: () => void
  onSpeakWord: () => void
  onSpeakSentence: () => void
  allWords: VocabularyItem[]
}

export function MultipleChoiceExercise({
  word,
  isAnswered,
  onAnswer,
  onNext,
  onSpeakWord,
  allWords,
}: MultipleChoiceExerciseProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)

  const options = useMemo(() => {
    const distractors = getRandomDistractors(word, allWords, 3)
    const allOptions = [word, ...distractors].sort(() => Math.random() - 0.5)
    return allOptions
  }, [word, allWords])

  const handleSelect = (optionWord: string) => {
    if (isAnswered) return
    setSelectedAnswer(optionWord)
    onAnswer(optionWord === word.word, optionWord)
  }

  const isCorrect = selectedAnswer === word.word

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-center">
        <p className="mb-2 text-[14px] text-text-secondary">
          {isVietnamese ? 'Từ tiếng Anh tương ứng với:' : 'What is the English word for:'}
        </p>
        <p className="text-[24px] font-bold text-text-primary">{word.meaningVi}</p>
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        {options.map((option) => {
          const isSelected = selectedAnswer === option.word
          const isCorrectOption = option.word === word.word
          const showCorrect = isAnswered && isCorrectOption
          const showWrong = isAnswered && isSelected && !isCorrectOption

          return (
            <button key={option.id} onClick={() => handleSelect(option.word)} disabled={isAnswered}
              className={`relative rounded-xl border-2 p-4 text-center transition-all ${
                showCorrect ? 'border-success bg-success/10' : showWrong ? 'border-error bg-error/10'
                  : isSelected ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:border-primary/50'
              }`}>
              <span className="text-[16px] font-semibold text-text-primary">{option.word}</span>
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
          {!isCorrect && (
            <p className="text-[14px] text-text-secondary">
              {isVietnamese ? 'Đáp án đúng là:' : 'The correct answer is:'} <span className="font-semibold text-primary">{word.word}</span>
            </p>
          )}
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
