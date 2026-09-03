'use client'

/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (study)/vocabulary/learn/[deckId]
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from '@/lib/navigation'
import { useApp } from '@/contexts/AppContext'
import { vocabularyService } from '@/services/vocabulary.service'
import type { VocabularyDeck, LearningResult, VocabularyItem } from '@/types/vocabulary-learn'
import { VocabularyLearningSession } from '@/components/vocabulary-learning/vocabulary.learning.session'
import { LearningResultView } from '@/components/vocabulary-learning/learning.result.view'

export default function VocabularyDeckLearnAppPage() {
  const navigate = useNavigate()
  const { deckId } = useParams<{ deckId?: string }>()
  const { showAction } = useApp()
  const [selectedDeck, setSelectedDeck] = useState<VocabularyDeck | null>(null)
  const [learningResult, setLearningResult] = useState<LearningResult | null>(null)
  const [isFinished, setIsFinished] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!deckId) return
    setIsLoading(true)

    vocabularyService
      .getDeckById(deckId)
      .then((deck) => {
        if (deck) {
          const cards = (deck as any).cards || []
          const mappedItems: VocabularyItem[] = cards.map((c: any, index: number) => {
            const item = c.lexical_item_id || {}
            return {
              id: c._id || `card-${index}`,
              word: item.word || c.front_text || 'Vocabulary',
              pronunciation: item.pronunciation_us || '',
              partOfSpeech: item.word_type || 'noun',
              meanings: [
                {
                  id: `m-${index}`,
                  partOfSpeech: item.word_type || 'noun',
                  definitionVi: item.meaning_vi || c.back_text || '',
                  definitionEn: item.meaning_en || '',
                  examples: item.example_sentence
                    ? [{ id: `ex-${index}`, sentence: item.example_sentence, translationVi: item.example_meaning_vi || '' }]
                    : [],
                },
              ],
              audioUs: item.audio_url_us,
              cefrLevel: item.cefr_level || 'B1',
            }
          })

          setSelectedDeck({
            id: deck.id || deck._id || deckId,
            title: deck.title || (deck as any).name || 'Vocabulary Deck',
            description: deck.description || (deck as any).description_vi || '',
            coverColor: '#6b5ce7',
            cardCount: mappedItems.length || deck.total_cards || (deck as any).card_count || 10,
            creatorType: 'SYSTEM',
            visibility: 'PUBLIC',
            vocabularyItems: mappedItems,
          })
        }
      })
      .catch((err) => {
        console.error('Error fetching deck by ID:', err)
      })
      .finally(() => {
        setIsLoading(false)
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

  if (isLoading || !selectedDeck) {
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
