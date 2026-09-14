// Trang phiên học chi tiết bộ thẻ flashcard từ vựng theo ID.
'use client'

import { useState, useMemo } from 'react'
import { useNavigate, useParams } from '@/lib/navigation'
import { useApp } from '@/contexts/app.context'
import { useDeckDetailQuery } from '@/features/vocabulary/hooks/use.vocabulary.query'
import type { VocabularyDeck, LearningResult, VocabularyItem } from '@/features/vocabulary/types/vocabulary.learn'
import { VocabularyLearningSession } from '@/features/vocabulary/components/vocabulary.learning.session'
import { LearningResultView } from '@/features/vocabulary/components/learning.result.view'

export default function VocabularyDeckLearnAppPage() {
  const navigate = useNavigate()
  const { deckId } = useParams<{ deckId?: string }>()
  const { showAction } = useApp()
  const [learningResult, setLearningResult] = useState<LearningResult | null>(null)
  const [isFinished, setIsFinished] = useState(false)

  const { data: deck, isLoading } = useDeckDetailQuery(deckId || '', Boolean(deckId))

  const selectedDeck: VocabularyDeck | null = useMemo(() => {
    if (!deck) return null
    const cards = (deck as unknown as { cards?: Array<Record<string, unknown>> }).cards || []
    const mappedItems: VocabularyItem[] = cards.map((c, index) => {
      const item = (c.lexical_item_id as Record<string, unknown>) || {}
      return {
        id: String(c._id || `card-${index}`),
        word: String(item.word || c.front_text || 'Vocabulary'),
        pronunciation: String(item.pronunciation_us || ''),
        partOfSpeech: String(item.word_type || 'noun'),
        meanings: [
          {
            id: `m-${index}`,
            partOfSpeech: String(item.word_type || 'noun'),
            definitionVi: String(item.meaning_vi || c.back_text || ''),
            definitionEn: String(item.meaning_en || ''),
            examples: item.example_sentence
              ? [
                  {
                    id: `ex-${index}`,
                    sentence: String(item.example_sentence),
                    translationVi: String(item.example_meaning_vi || ''),
                  },
                ]
              : [],
          },
        ],
        audioUs: item.audio_url_us ? String(item.audio_url_us) : undefined,
        cefrLevel: String(item.cefr_level || 'B1'),
      }
    })

    return {
      id: deck._id || deckId || '',
      title: deck.name || 'Vocabulary Deck',
      description: deck.description || '',
      coverColor: '#6b5ce7',
      cardCount: mappedItems.length || deck.card_count || 10,
      creatorType: 'SYSTEM',
      visibility: 'PUBLIC',
      vocabularyItems: mappedItems,
    }
  }, [deck, deckId])

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
