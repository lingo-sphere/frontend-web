/**
 * @file FlashcardExercise.tsx
 * @description Component giao diện React FlashcardExercise cho học viên
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Volume2, Bookmark, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { VocabularyItem } from '@/types/vocabulary-learn'

interface FlashcardExerciseProps {
  word: VocabularyItem
  isAnswered: boolean
  onAnswer: (isCorrect: boolean, userAnswer: string) => void
  onNext: () => void
  onSpeakWord: () => void
  onSpeakSentence: () => void
  onMarkMastered?: () => void
  onSaveWord?: () => void
}

export function FlashcardExercise({
  word,
  isAnswered,
  onAnswer,
  onNext,
  onSpeakWord,
  onMarkMastered,
  onSaveWord,
}: FlashcardExerciseProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [isFlipped, setIsFlipped] = useState(false)
  const [isMastered, setIsMastered] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleFlip = () => setIsFlipped(!isFlipped)

  const handleResponse = (quality: 'again' | 'hard' | 'good' | 'easy') => {
    onAnswer(true, quality)
  }

  const handleMarkMastered = () => {
    setIsMastered(true)
    onMarkMastered?.()
  }

  const handleSaveWord = () => {
    setIsSaved(true)
    onSaveWord?.()
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-8 h-[280px] w-full cursor-pointer perspective-1000 sm:h-[320px]"
        onClick={handleFlip}>
        <div className={`relative h-full w-full transition-transform duration-500 ${
          isFlipped ? 'rotate-y-180' : ''
        }`} style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-lg"
            style={{ backfaceVisibility: 'hidden' }}>
            <span className="mb-2 rounded-full bg-primary/10 px-3 py-1 text-[12px] font-medium text-primary">
              {word.partOfSpeech}
            </span>
            <h2 className="text-[36px] font-bold text-text-primary sm:text-[42px]">{word.word}</h2>
            <p className="mt-3 font-mono text-[16px] text-text-secondary">{word.pronunciation}</p>
            <button onClick={(e) => { e.stopPropagation(); onSpeakWord() }}
              className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-hover">
              <Volume2 size={18} />
              {isVietnamese ? 'Nghe' : 'Listen'}
            </button>
            <p className="mt-6 text-[12px] text-text-tertiary">{isVietnamese ? 'Nhấn để lật' : 'Tap to flip'}</p>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-primary bg-surface p-6 shadow-lg"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <span className="mb-2 text-[14px] font-medium text-text-secondary">
              {isVietnamese ? 'Nghĩa tiếng Việt' : 'Vietnamese meaning'}
            </span>
            <h2 className="text-[28px] font-bold text-primary sm:text-[32px]">{word.meaningVi}</h2>
            <div className="mt-6 max-w-full text-center">
              <p className="text-[14px] italic leading-relaxed text-text-primary">{word.example}</p>
              <p className="mt-2 text-[13px] text-text-secondary">{word.exampleMeaningVi}</p>
            </div>
          </div>
        </div>
      </div>

      {isFlipped && (
        <div className="space-y-3">
          <div className="grid w-full grid-cols-4 gap-2">
            <Button variant="outline" className="h-auto flex-col py-3 text-[12px]" onClick={() => handleResponse('again')}>
              <span className="text-[18px]">😓</span>
              <span className="mt-1">{isVietnamese ? 'Lại' : 'Again'}</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-3 text-[12px]" onClick={() => handleResponse('hard')}>
              <span className="text-[18px]">😐</span>
              <span className="mt-1">{isVietnamese ? 'Khó' : 'Hard'}</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-3 text-[12px]" onClick={() => handleResponse('good')}>
              <span className="text-[18px]">😊</span>
              <span className="mt-1">{isVietnamese ? 'Tốt' : 'Good'}</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-3 text-[12px]" onClick={() => handleResponse('easy')}>
              <span className="text-[18px]">🤩</span>
              <span className="mt-1">{isVietnamese ? 'Dễ' : 'Easy'}</span>
            </Button>
          </div>

          <div className="flex w-full gap-2">
            <button onClick={handleMarkMastered} disabled={isMastered}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-medium transition-all ${
                isMastered ? 'bg-success/20 text-success cursor-default' : 'bg-success/10 text-success hover:bg-success/20'
              }`}>
              <CheckCircle size={16} />
              {isMastered ? (isVietnamese ? 'Đã thành thạo ✓' : 'Mastered ✓') : (isVietnamese ? 'Đã thành thạo' : 'Mastered')}
            </button>
            <button onClick={handleSaveWord} disabled={isSaved}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-medium transition-all ${
                isSaved ? 'bg-primary/20 text-primary cursor-default' : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}>
              <Bookmark size={16} />
              {isSaved ? (isVietnamese ? 'Đã lưu ✓' : 'Saved ✓') : (isVietnamese ? 'Lưu' : 'Save')}
            </button>
          </div>
        </div>
      )}

      {!isFlipped && (
        <p className="text-[13px] text-text-tertiary">{isVietnamese ? 'Nhấn vào thẻ để xem nghĩa' : 'Tap the card to see the meaning'}</p>
      )}
    </div>
  )
}
