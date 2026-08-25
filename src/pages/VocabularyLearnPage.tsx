// Updated: 2026-08-17
// Vocabulary Learning Page - Main entry point
// Flow: Vocabulary -> Start Learning -> Learning Session -> Result

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/dashboard/SectionHeading'
import { vocabularyService } from '@/services/vocabulary.service'
import { mockDecks, allVocabularyWords } from '@/data/vocabulary-learn-data'
import type { VocabularyDeck, LearningResult } from '@/types/vocabulary-learn'
import type { Deck, LexicalItem } from '@/types/api.types'
import { VocabularyLearningSession } from '@/components/vocabulary-learning/VocabularyLearningSession'
import { LearningResultView } from '@/components/vocabulary-learning/LearningResultView'

interface VocabularyLearnPageProps {
  onAction: (message: string) => void
  selectedDeckId?: string
}

type ViewMode = 'home' | 'session' | 'result'

export function VocabularyLearnPage({ onAction, selectedDeckId }: VocabularyLearnPageProps) {
  const navigate = useNavigate()
  const { deckId } = useParams<{ deckId?: string }>()
  const [viewMode, setViewMode] = useState<ViewMode>('home')
  const [decks, setDecks] = useState<VocabularyDeck[]>(mockDecks)
  const [selectedDeck, setSelectedDeck] = useState<VocabularyDeck | null>(null)
  const [learningResult, setLearningResult] = useState<LearningResult | null>(null)

  // Fetch live decks from Backend API
  useEffect(() => {
    let isMounted = true
    const fetchDecks = async () => {
      try {
        const liveDecks: Deck[] = await vocabularyService.getPublicDecks()
        if (isMounted && Array.isArray(liveDecks) && liveDecks.length > 0) {
          const mapped: VocabularyDeck[] = liveDecks.map((d, index) => ({
            id: d.id || d._id || `deck-${index}`,
            title: d.title,
            description: d.description || '',
            coverColor: ['#6b5ce7', '#00b894', '#0984e3', '#fdcb6e', '#e17055'][index % 5],
            cardCount: d.total_cards || d.cards?.length || 20,
            creatorType: 'SYSTEM',
            visibility: 'PUBLIC',
            vocabularyItems: allVocabularyWords,
          }))
          setDecks(mapped)
        }
      } catch {
        // Fallback to mockDecks
      }
    }
    fetchDecks()
    return () => {
      isMounted = false
    }
  }, [])

  // Auto-start learning if deckId is provided
  useEffect(() => {
    const activeDeckId = deckId || selectedDeckId
    if (activeDeckId) {
      const deck = mockDecks.find(d => d.id === activeDeckId)
      if (deck) {
        setSelectedDeck(deck)
        setViewMode('session')
      }
    }
  }, [deckId, selectedDeckId])

  const handleSelectDeck = (deck: VocabularyDeck) => {
    setSelectedDeck(deck)
    setViewMode('session')
  }

  const handleStartQuickLearn = () => {
    // Create a deck with all words
    const quickDeck: VocabularyDeck = {
      id: 'quick-learn',
      title: 'Quick Learn',
      description: 'All vocabulary',
      coverColor: '#6b5ce7',
      cardCount: allVocabularyWords.length,
      creatorType: 'SYSTEM',
      visibility: 'PUBLIC',
      vocabularyItems: allVocabularyWords,
    }
    setSelectedDeck(quickDeck)
    setViewMode('session')
  }

  const handleSessionComplete = (result: LearningResult) => {
    setLearningResult(result)
    setViewMode('result')
  }

  const handleBackToVocabulary = () => {
    setViewMode('home')
    setSelectedDeck(null)
    setLearningResult(null)
    navigate('/vocabulary')
  }

  const handleRetrySession = () => {
    if (selectedDeck) {
      setViewMode('session')
    }
  }

  // Learning Session View
  if (viewMode === 'session' && selectedDeck) {
    return (
      <VocabularyLearningSession
        deck={selectedDeck}
        onComplete={handleSessionComplete}
        onExit={handleBackToVocabulary}
        onAction={onAction}
      />
    )
  }

  // Result View
  if (viewMode === 'result' && learningResult) {
    return (
      <LearningResultView
        result={learningResult}
        onRetry={handleRetrySession}
        onBackToHome={handleBackToVocabulary}
        onAction={onAction}
      />
    )
  }

  // Home View - Deck Selection
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <SectionHeading
        eyebrow="Vocabulary"
        title="Learn Vocabulary"
        description="Choose a deck to start learning"
      />

      {/* Quick Learn Button */}
      <section className="mt-6">
        <Card
          className="dashboard-card cursor-pointer overflow-hidden transition-all hover:shadow-lg"
          onClick={handleStartQuickLearn}
        >
          <div className="flex items-center justify-between bg-gradient-to-r from-primary to-primary/80 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                <GraduationCap className="text-white" size={32} />
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-white">Quick Learn</h3>
                <p className="mt-1 text-[14px] text-white/80">
                  {allVocabularyWords.length} words · All exercises
                </p>
              </div>
            </div>
            <Button className="bg-white text-primary hover:bg-white/90">
              Start Learning
            </Button>
          </div>
        </Card>
      </section>

      {/* Browse Decks */}
      <section className="mt-8">
        <h3 className="mb-4 text-[16px] font-semibold text-text-primary">
          Choose a Deck
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <Card
              key={deck.id}
              className="dashboard-card cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
              onClick={() => handleSelectDeck(deck)}
            >
              <div
                className="flex h-24 w-full items-center justify-center"
                style={{ backgroundColor: deck.coverColor }}
              >
                <GraduationCap className="text-white/60" size={40} />
              </div>
              <CardContent className="p-4">
                <h4 className="text-[15px] font-semibold text-text-primary">{deck.title}</h4>
                <p className="mt-1 text-[12px] text-text-secondary line-clamp-2">
                  {deck.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[12px] text-text-tertiary">{deck.cardCount} words</span>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary-hover"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectDeck(deck)
                    }}
                  >
                    Learn
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
