/**
 * @file vocabulary.learning.session.tsx
 * @description Component giao diện React VocabularyLearningSession cho học viên
 */

import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { X, ChevronDown, Brain, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { VocabularyDeck, ExerciseMode, VocabularyItem, ExerciseAnswer, LearningResult } from '@/types/vocabulary.learn'
import { shuffleArray, speakWord, speakSentence } from '@/lib/audio.utils'
import { FlashcardExercise } from '@/components/vocabulary-learning/exercises/flashcard.exercise'
import { MultipleChoiceExercise } from '@/components/vocabulary-learning/exercises/multiple.choice.exercise'
import { ReverseMultipleChoiceExercise } from '@/components/vocabulary-learning/exercises/reverse.multiple.choice.exercise'
import { TypeWordExercise } from '@/components/vocabulary-learning/exercises/type.word.exercise'
import { ImageWordExercise } from '@/components/vocabulary-learning/exercises/image.word.exercise'
import { ListenTypeExercise } from '@/components/vocabulary-learning/exercises/listen.type.exercise'
import { PronunciationExercise } from '@/components/vocabulary-learning/exercises/pronunciation.exercise'
import { ContextExercise } from '@/components/vocabulary-learning/exercises/context.exercise'

interface VocabularyLearningSessionProps {
  deck: VocabularyDeck
  onComplete: (result: LearningResult) => void
  onExit: () => void
  onAction: (message: string) => void
}

const getExerciseModes = (isVietnamese: boolean) => [
  { mode: 'flashcard' as ExerciseMode, label: isVietnamese ? 'Flashcard' : 'Flashcard', icon: '📇' },
  { mode: 'multiple-choice' as ExerciseMode, label: isVietnamese ? 'Chọn đáp án' : 'Multiple Choice', icon: '🔤' },
  { mode: 'reverse-multiple-choice' as ExerciseMode, label: isVietnamese ? 'Đảo ngược' : 'Reverse MC', icon: '🔄' },
  { mode: 'type-word' as ExerciseMode, label: isVietnamese ? 'Đánh từ' : 'Type Word', icon: '⌨️' },
  { mode: 'image-word' as ExerciseMode, label: isVietnamese ? 'Hình → Từ' : 'Image → Word', icon: '🖼️' },
  { mode: 'listen-type' as ExerciseMode, label: isVietnamese ? 'Nghe & Đánh' : 'Listen & Type', icon: '🎧' },
  { mode: 'pronunciation' as ExerciseMode, label: isVietnamese ? 'Phát âm' : 'Pronunciation', icon: '🎤' },
  { mode: 'context' as ExerciseMode, label: isVietnamese ? 'Ngữ cảnh' : 'Context', icon: '📝' },
]

const practiceModes: ExerciseMode[] = [
  'multiple-choice', 'reverse-multiple-choice', 'type-word',
  'image-word', 'listen-type', 'pronunciation', 'context'
]

const allModes: ExerciseMode[] = [
  'flashcard', 'multiple-choice', 'reverse-multiple-choice', 'type-word',
  'image-word', 'listen-type', 'pronunciation', 'context'
]

export function VocabularyLearningSession({ deck, onComplete, onExit, onAction }: VocabularyLearningSessionProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [shuffledWords] = useState(() => shuffleArray(deck.vocabularyItems))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentMode, setCurrentMode] = useState<ExerciseMode>('flashcard')
  const [isSmartMode, setIsSmartMode] = useState(true)
  const [answers, setAnswers] = useState<ExerciseAnswer[]>([])
  const [isAnswered, setIsAnswered] = useState(false)
  const [showModeMenu, setShowModeMenu] = useState(false)
  const [modeHistory, setModeHistory] = useState<ExerciseMode[]>([])

  const currentWord = shuffledWords[currentIndex]
  const progress = ((currentIndex + 1) / shuffledWords.length) * 100
  const isLastWord = currentIndex === shuffledWords.length - 1
  const exerciseModes = getExerciseModes(isVietnamese)

  const score = useMemo(() => answers.filter(a => a.isCorrect).length, [answers])

  const hasUsedFlashcard = modeHistory.includes('flashcard')

  const getSmartModes = (): ExerciseMode[] => {
    if (hasUsedFlashcard || currentIndex > 0) return practiceModes
    return allModes
  }

  const handleAnswer = useCallback((isCorrect: boolean, userAnswer: string) => {
    const newAnswer: ExerciseAnswer = {
      wordId: currentWord.id,
      mode: currentMode,
      isCorrect,
      userAnswer,
      timestamp: Date.now(),
    }
    setAnswers(prev => [...prev, newAnswer])
    setIsAnswered(true)
    if (!modeHistory.includes(currentMode)) {
      setModeHistory(prev => [...prev, currentMode])
    }
  }, [currentWord.id, currentMode, modeHistory])

  const handleNext = useCallback(() => {
    if (isLastWord) {
      const correctCount = answers.filter(a => a.isCorrect).length + (isAnswered ? 1 : 0)
      const totalCount = shuffledWords.length
      const accuracy = Math.round((correctCount / totalCount) * 100)

      const modeStats: Record<ExerciseMode, { correct: number; total: number }> = {
        'flashcard': { correct: 0, total: 0 },
        'multiple-choice': { correct: 0, total: 0 },
        'reverse-multiple-choice': { correct: 0, total: 0 },
        'type-word': { correct: 0, total: 0 },
        'image-word': { correct: 0, total: 0 },
        'listen-type': { correct: 0, total: 0 },
        'pronunciation': { correct: 0, total: 0 },
        'context': { correct: 0, total: 0 },
      }

      answers.forEach(a => {
        modeStats[a.mode].total++
        if (a.isCorrect) modeStats[a.mode].correct++
      })

      const skillBreakdown = {
        meaning: Math.round(modeStats['multiple-choice'].total > 0
          ? (modeStats['multiple-choice'].correct / modeStats['multiple-choice'].total) * 100 : 85),
        spelling: Math.round(modeStats['type-word'].total > 0
          ? (modeStats['type-word'].correct / modeStats['type-word'].total) * 100 : 80),
        listening: Math.round(modeStats['listen-type'].total > 0
          ? (modeStats['listen-type'].correct / modeStats['listen-type'].total) * 100 : 75),
        pronunciation: Math.round(modeStats['pronunciation'].total > 0
          ? (modeStats['pronunciation'].correct / modeStats['pronunciation'].total) * 100 : 78),
        context: Math.round(modeStats['context'].total > 0
          ? (modeStats['context'].correct / modeStats['context'].total) * 100 : 82),
      }

      const weakWords = shuffledWords.filter(word =>
        answers.some(a => a.wordId === word.id && !a.isCorrect)
      )

      const result: LearningResult = { totalWords: totalCount, correctAnswers: correctCount, accuracy, skillBreakdown, weakWords }
      onComplete(result)
    } else {
      setCurrentIndex(prev => prev + 1)
      setIsAnswered(false)
      if (isSmartMode) {
        const availableModes = getSmartModes()
        const currentModeIndex = availableModes.indexOf(currentMode)
        const nextModeIndex = (currentModeIndex + 1) % availableModes.length
        setCurrentMode(availableModes[nextModeIndex])
      }
    }
  }, [isLastWord, answers, shuffledWords, isAnswered, isSmartMode, currentIndex, onComplete, currentMode, hasUsedFlashcard])

  const handleModeChange = (mode: ExerciseMode) => {
    setCurrentMode(mode)
    setIsSmartMode(false)
    setShowModeMenu(false)
    setIsAnswered(false)
  }

  const handleSmartModeToggle = () => {
    if (isSmartMode) {
      setIsSmartMode(false)
    } else {
      setIsSmartMode(true)
      if (currentMode === 'flashcard') setCurrentMode(practiceModes[0])
    }
    setShowModeMenu(false)
    setIsAnswered(false)
  }

  const renderExercise = () => {
    if (!currentWord) return null
    const commonProps = {
      word: currentWord,
      isAnswered,
      onAnswer: handleAnswer,
      onNext: handleNext,
      onSpeakWord: () => speakWord(currentWord.word),
      onSpeakSentence: () => speakSentence(currentWord.example ? currentWord.example : ''),
    }

    switch (currentMode) {
      case 'flashcard':
        return (
          <FlashcardExercise
            {...commonProps}
            onMarkMastered={() => onAction(`${isVietnamese ? 'Đánh dấu' : 'Marked'} "${currentWord.word}" ${isVietnamese ? 'đã thành thạo' : 'as mastered'}`)}
            onSaveWord={() => onAction(`${isVietnamese ? 'Lưu' : 'Saved'} "${currentWord.word}" ${isVietnamese ? 'vào sổ tay' : 'to notebook'}`)}
          />
        )
      case 'multiple-choice':
        return <MultipleChoiceExercise {...commonProps} allWords={deck.vocabularyItems} />
      case 'reverse-multiple-choice':
        return <ReverseMultipleChoiceExercise {...commonProps} allWords={deck.vocabularyItems} />
      case 'type-word':
        return <TypeWordExercise {...commonProps} />
      case 'image-word':
        return <ImageWordExercise {...commonProps} />
      case 'listen-type':
        return <ListenTypeExercise {...commonProps} />
      case 'pronunciation':
        return <PronunciationExercise {...commonProps} />
      case 'context':
        return <ContextExercise {...commonProps} />
      default:
        return <MultipleChoiceExercise {...commonProps} allWords={deck.vocabularyItems} />
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-7">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onExit}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary hover:bg-surface-hover">
          <X size={20} />
        </button>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="text-[14px] font-semibold text-text-primary">
              {currentIndex + 1} / {shuffledWords.length}
            </span>
          </div>

          <div className="relative">
            <button onClick={() => setShowModeMenu(!showModeMenu)}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-[13px] font-medium text-text-primary hover:bg-surface-hover">
              {isSmartMode ? (
                <><Brain size={16} className="text-primary" />{isVietnamese ? 'Thông minh' : 'Smart'}</>
              ) : (
                <><span>{exerciseModes.find(m => m.mode === currentMode)?.icon}</span>
                  {exerciseModes.find(m => m.mode === currentMode)?.label}</>
              )}
              <ChevronDown size={16} />
            </button>

            {showModeMenu && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-surface p-2 shadow-xl">
                <p className="mb-2 px-3 py-1 text-[11px] font-semibold uppercase text-text-tertiary">
                  {isVietnamese ? 'Chế độ luyện tập' : 'Practice Mode'}
                </p>

                <button onClick={handleSmartModeToggle}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] ${
                    isSmartMode ? 'bg-primary/10 text-primary' : 'text-text-primary hover:bg-surface-hover'
                  }`}>
                  <Brain size={16} />
                  {isVietnamese ? 'Học thông minh' : 'Smart Review'}
                  {isSmartMode && <Check size={14} className="ml-auto" />}
                </button>

                <div className="my-2 border-t border-border" />

                {exerciseModes.map(({ mode, label, icon }) => (
                  <button key={mode} onClick={() => handleModeChange(mode)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] ${
                      !isSmartMode && currentMode === mode ? 'bg-primary/10 text-primary' : 'text-text-primary hover:bg-surface-hover'
                    }`}>
                    <span>{icon}</span>
                    {label}
                    {!isSmartMode && currentMode === mode && <Check size={14} className="ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2">
          <span className="text-[14px] font-semibold text-success">{score}</span>
        </div>
      </div>

      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <Card className="dashboard-card">
        <CardContent className="p-6">{renderExercise()}</CardContent>
      </Card>
    </div>
  )
}
