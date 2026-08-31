'use client'

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from '@/lib/navigation'
import { useApp } from '@/contexts/AppContext'
import { mockDecks, allVocabularyWords } from '@/data/vocabulary-learn-data'
import { vocabularyService } from '@/services/vocabulary.service'
import type { VocabularyDeck, LearningResult } from '@/types/vocabulary-learn'
import { VocabularyLearningSession } from '@/components/vocabulary-learning/VocabularyLearningSession'
import { LearningResultView } from '@/components/vocabulary-learning/LearningResultView'

export default function VocabularyDeckLearnAppPage() {
  const navigate = useNavigate()
  const { deckId } = useParams<{ deckId?: string }>()
  const { showAction } = useApp()
  const [selectedDeck, setSelectedDeck] = useState<VocabularyDeck | null>(null)
  const [learningResult, setLearningResult] = useState<LearningResult | null>(null)
  const [isFinished, setIsFinished] = useState(false)

  useEffect(() => {
    if (!deckId) return
    const localDeck = mockDecks.find((d) => d.id === deckId)
    if (localDeck) {
      setSelectedDeck(localDeck)
      return
    }

    vocabularyService
      .getDeckById(deckId)
      .then((deck) => {
        if (deck) {
          setSelectedDeck({
            id: deck.id || deck._id || deckId,
            title: deck.title,
            description: deck.description || '',
            coverColor: '#6b5ce7',
            cardCount: deck.total_cards || 20,
            creatorType: 'SYSTEM',
            visibility: 'PUBLIC',
            vocabularyItems: allVocabularyWords,
          })
        }
      })
      .catch(() => {
        setSelectedDeck({
          id: deckId,
          title: 'Vocabulary Deck',
          description: '',
          coverColor: '#6b5ce7',
          cardCount: allVocabularyWords.length,
          creatorType: 'SYSTEM',
          visibility: 'PUBLIC',
          vocabularyItems: allVocabularyWords,
        })
      })
  }, [deckId])

  const handleSessionComplete = (result: LearningResult) => {
    setLearningResult(result)
    setIsFinished(true)
  }

  const handleBackToVocabulary = () => {
    navigate('/vocabulary')
  }

  const handleRetrySession = () => {
    setIsFinished(false)
    setLearningResult(null)
  }

  if (isFinished && learningResult) {
    return (
      <LearningResultView
        result={learningResult}
        onRetry={handleRetrySession}
        onBackToHome={handleBackToVocabulary}
        onAction={showAction}
      />
    )
  }

  if (!selectedDeck) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <VocabularyLearningSession
      deck={selectedDeck}
      onComplete={handleSessionComplete}
      onExit={handleBackToVocabulary}
      onAction={showAction}
    />
  )
}
