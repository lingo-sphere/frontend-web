
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, X, ChevronRight, Volume2, Eye, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { VocabularyItem } from '@/types/vocabulary-learn'

interface ImageWordExerciseProps {
  word: VocabularyItem
  isAnswered: boolean
  onAnswer: (isCorrect: boolean, userAnswer: string) => void
  onNext: () => void
  onSpeakWord: () => void
  onSpeakSentence: () => void
}

function getImageUrl(word: string): { url: string; fallback: string } {
  const imageMap: Record<string, { url: string; fallback: string }> = {
    adventure: { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop', fallback: '🏔️' },
    suggestion: { url: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=400&h=300&fit=crop', fallback: '💡' },
    sharing: { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop', fallback: '🤝' },
    shooting: { url: 'https://images.unsplash.com/photo-1503006429536-1726add21a66?w=400&h=300&fit=crop', fallback: '🎯' },
    musician: { url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=300&fit=crop', fallback: '🎵' },
    english: { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop', fallback: '📚' },
    chatting: { url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop', fallback: '💬' },
    watch: { url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=300&fit=crop', fallback: '⌚' },
    negotiate: { url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=400&h=300&fit=crop', fallback: '🤝' },
    employee: { url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&h=300&fit=crop', fallback: '💼' },
  }
  const data = imageMap[word.toLowerCase()]
  return data || { url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop', fallback: '📖' }
}

export function ImageWordExercise({ word, isAnswered, onAnswer, onNext, onSpeakWord }: ImageWordExerciseProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [userGuess, setUserGuess] = useState('')
  const [isChecked, setIsChecked] = useState(false)
  const [hintIndex, setHintIndex] = useState(0)
  const [reviewCount, setReviewCount] = useState(2)
  const [imageError, setImageError] = useState(false)

  const imageData = getImageUrl(word.word)
  const correctAnswer = word.word.toLowerCase()
  const wordLength = word.word.length

  const handleCheck = () => {
    const trimmedInput = userGuess.trim().toLowerCase()
    setIsChecked(true)
    onAnswer(trimmedInput === correctAnswer, userGuess)
  }

  const handleDontKnow = () => {
    setUserGuess('')
    setIsChecked(true)
    setReviewCount(reviewCount + 1)
    onAnswer(false, '')
  }

  const handleHint = () => {
    if (hintIndex < wordLength) setHintIndex(hintIndex + 1)
  }

  const isCorrect = isChecked && userGuess.trim().toLowerCase() === correctAnswer
  const allHintsRevealed = hintIndex >= wordLength

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex w-full items-center justify-between">
        <AlertTriangle className="text-warning" size={20} />
        <span className="rounded-full bg-info/10 px-3 py-1 text-[12px] font-semibold text-info">
          {isVietnamese ? `Đã xem ${reviewCount} lần` : `Reviewed ${reviewCount} times`}
        </span>
      </div>

      <div className="relative mb-6 w-full overflow-hidden rounded-2xl bg-surface-subtle">
        {imageError ? (
          <div className="flex h-48 items-center justify-center sm:h-56">
            <span className="text-[80px]">{imageData.fallback}</span>
          </div>
        ) : (
          <img src={imageData.url} alt="Hint image" className="h-48 w-full object-cover sm:h-56" onError={() => setImageError(true)} />
        )}
      </div>

      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-[32px] font-bold text-primary">{word.meaningVi}</h2>
          <span className="rounded-full bg-surface-subtle px-3 py-1 text-[12px] font-medium text-text-secondary">
            {word.partOfSpeech}
          </span>
        </div>
      </div>

      <div className="mb-4 w-full rounded-xl bg-surface-subtle p-4 text-center">
        <p className="mb-1 text-[12px] font-medium text-text-tertiary">
          {isVietnamese ? 'Định nghĩa tiếng Anh:' : 'English Definition:'}
        </p>
        <p className="text-[14px] italic text-text-primary">{word.example}</p>
      </div>

      <div className="mb-6 w-full text-center">
        <p className="mb-2 text-[12px] font-medium text-text-tertiary">{isVietnamese ? 'Ví dụ:' : 'Example:'}</p>
        <p className="text-[16px] italic leading-relaxed text-text-primary">
          {word.example ? word.example.replace(/\b\w+\b/, (m: string) => m === word.word ? `*****` : m) : ''}
        </p>
        <p className="mt-2 text-[14px] text-text-secondary">{word.exampleMeaningVi}</p>
      </div>

      <div className="mb-4 flex w-full flex-col items-center gap-3">
        <div className="flex items-center justify-center gap-2">
          {word.word.split('').map((char: string, idx: number) => (
            <span key={idx}
              className={`flex h-10 w-8 items-center justify-center rounded-lg border-b-2 text-[20px] font-bold font-mono ${
                idx < hintIndex ? 'border-primary text-primary' : 'border-border text-text-tertiary'
              }`}>
              {idx < hintIndex ? char : '_'}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-text-tertiary">
            {hintIndex}/{wordLength} {isVietnamese ? 'chữ cái đã hiện' : 'letters revealed'}
          </span>
          <Button variant="outline" className="gap-1 bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-[12px] h-8"
            onClick={handleHint} disabled={allHintsRevealed}>
            <Volume2 size={12} />
            {isVietnamese ? 'Hiện chữ' : 'Show Letter'}
          </Button>
        </div>
      </div>

      <div className="mb-4 w-full">
        <input type="text" value={userGuess} onChange={(e) => setUserGuess(e.target.value)} disabled={isChecked}
          className="w-full rounded-xl border-2 p-4 text-center text-[18px] font-semibold transition-colors focus:outline-none border-primary/40 bg-surface focus:border-primary"
          placeholder={isVietnamese ? 'Nhập từ tiếng Anh...' : 'Enter English word...'}
          autoFocus />
      </div>

      {isChecked && !isCorrect && (
        <div className="mb-4 rounded-xl bg-error/10 p-3 text-center">
          <p className="text-[12px] text-error">{isVietnamese ? 'Đáp án đúng:' : 'Correct answer:'}</p>
          <p className="text-[20px] font-bold text-primary">{word.word}</p>
        </div>
      )}

      {!isChecked ? (
        <div className="grid w-full grid-cols-2 gap-3">
          <Button variant="outline" className="h-12 gap-2 bg-error text-white hover:bg-error-hover border-error" onClick={handleDontKnow}>
            <Eye size={16} />
            {isVietnamese ? 'KHÔNG BIẾT' : "DON'T KNOW"}
          </Button>
          <Button className="h-12 gap-2 bg-success hover:bg-success-hover" onClick={handleCheck} disabled={!userGuess.trim()}>
            <Check size={16} />
            {isVietnamese ? 'KIỂM TRA' : 'CHECK ANSWER'}
          </Button>
        </div>
      ) : (
        <Button className="w-full bg-primary hover:bg-primary-hover" onClick={onNext}>
          {isCorrect ? (isVietnamese ? 'Từ tiếp theo' : 'Next Word') : (isVietnamese ? 'Tiếp tục' : 'Continue')}
          <ChevronRight size={18} />
        </Button>
      )}
    </div>
  )
}
