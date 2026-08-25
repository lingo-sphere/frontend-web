
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, X, ChevronRight, Volume2, Rabbit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { speakWord } from '@/data/vocabulary-learn-data'

interface ListenTypeExerciseProps {
  word: any
  isAnswered: boolean
  onAnswer: (isCorrect: boolean, userAnswer: string) => void
  onNext: () => void
  onSpeakWord: () => void
  onSpeakSentence: () => void
}

export function ListenTypeExercise({ word, isAnswered, onAnswer, onNext, onSpeakWord }: ListenTypeExerciseProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [userInput, setUserInput] = useState('')
  const [isChecked, setIsChecked] = useState(false)

  const handlePlayNormal = () => speakWord(word.word, 1)
  const handlePlaySlow = () => speakWord(word.word, 0.6)

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
        <p className="text-[16px] text-text-secondary">
          {isVietnamese ? 'Nghe kỹ và đánh những gì bạn nghe được.' : 'Listen carefully and type what you hear.'}
        </p>
      </div>

      <div className="mb-8 flex gap-4">
        <button onClick={handlePlayNormal}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-4 text-white transition-colors hover:bg-primary-hover">
          <Volume2 size={24} />
          <span className="font-semibold">{isVietnamese ? 'Phát' : 'Play'}</span>
        </button>
        <button onClick={handlePlaySlow}
          className="flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-4 text-text-primary transition-colors hover:bg-surface-hover">
          <Rabbit size={24} />
          <span className="font-semibold">{isVietnamese ? 'Chậm' : 'Slow'}</span>
        </button>
      </div>

      <div className="mb-4 w-full">
        <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} disabled={isChecked}
          className={`w-full rounded-xl border-2 p-4 text-center text-[20px] font-semibold tracking-wide transition-colors focus:outline-none ${
            isChecked ? isCorrect ? 'border-success bg-success/10' : 'border-error bg-error/10'
              : 'border-border bg-surface focus:border-primary'
          }`}
          placeholder={isVietnamese ? 'Đánh những gì bạn nghe...' : 'Type what you hear...'}
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
          {!isCorrect && (
            <p className="text-[14px] text-text-secondary">
              {isVietnamese ? 'Đáp án đúng:' : 'Correct answer:'} <span className="font-semibold text-primary">{word.word}</span>
            </p>
          )}
          <Button className="mt-4 bg-primary hover:bg-primary-hover" onClick={onNext}>
            {isVietnamese ? 'Tiếp theo' : 'Next'}
            <ChevronRight size={18} />
          </Button>
        </div>
      )}
    </div>
  )
}
