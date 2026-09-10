/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (study)/vocabulary/learn
 */

'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from '@/lib/navigation'
import { GraduationCap } from 'lucide-react'

import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { SectionHeading } from '@/features/dashboard/components/section.heading'
import { useApp } from '@/contexts/app.context'
import { vocabularyService } from '@/features/vocabulary/services/vocabulary.service'
import type { VocabularyDeck, LearningResult } from '@/features/vocabulary/types/vocabulary.learn'
import type { Deck } from '@/types/api.types'
import { VocabularyLearningSession } from '@/features/vocabulary/components/vocabulary.learning.session'
import { LearningResultView } from '@/features/vocabulary/components/learning.result.view'

type ViewMode = 'home' | 'session' | 'result'

export default function VocabularyLearnAppPage() {
  const navigate = useNavigate()
  const { showAction } = useApp()
  const [viewMode, setViewMode] = useState<ViewMode>('home')
  const [decks, setDecks] = useState<VocabularyDeck[]>([])
  const [selectedDeck, setSelectedDeck] = useState<VocabularyDeck | null>(null)
  const [learningResult, setLearningResult] = useState<LearningResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchDecks = async () => {
      try {
        setIsLoading(true)
        const liveDecks: Deck[] = await vocabularyService.getPublicDecks()
        if (isMounted && Array.isArray(liveDecks)) {
          const mapped: VocabularyDeck[] = liveDecks.map((d: Deck, index: number) => ({
            id: d._id || `deck-${index}`,
            title: d.name || 'Flashcard Deck',
            description: d.description || '',
            coverColor: ['#6b5ce7', '#00b894', '#0984e3', '#fdcb6e', '#e17055'][index % 5],
            cardCount: d.card_count || 0,
            creatorType: 'SYSTEM',
            visibility: 'PUBLIC',
            vocabularyItems: [],
          }))
          setDecks(mapped)
        }
      } catch (err) {
        console.error('Failed to fetch public decks:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchDecks()
    return () => {
      isMounted = false
    }
  }, [])

  const handleSelectDeck = (deck: VocabularyDeck) => {
    navigate(`/vocabulary/learn/${deck.id}`)
  }

  const handleStartQuickLearn = () => {
    if (decks.length > 0) {
      navigate(`/vocabulary/learn/${decks[0].id}`)
    } else {
      showAction('Chưa có bộ thẻ nào khả dụng')
    }
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

  if (viewMode === 'session' && selectedDeck) {
    return (
      <VocabularyLearningSession
        deck={selectedDeck}
        onComplete={handleSessionComplete}
        onExit={handleBackToVocabulary}
        onAction={showAction}
      />
    )
  }

  if (viewMode === 'result' && learningResult) {
    return (
      <LearningResultView
        result={learningResult}
        onRetry={handleRetrySession}
        onBackToHome={handleBackToVocabulary}
        onAction={showAction}
      />
    )
  }

  return (
    <>
      <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <SectionHeading
          eyebrow="Vocabulary"
          title="Learn Vocabulary"
          description="Choose a deck to start learning"
        />

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
                    {decks.length > 0 ? `${decks.reduce((acc, d) => acc + d.cardCount, 0)} words · Start Review` : 'Explore decks'}
                  </p>
                </div>
              </div>
              <Button className="bg-white text-primary hover:bg-white/90">
                Start Learning
              </Button>
            </div>
          </Card>
        </section>

        <section className="mt-8">
          <h3 className="mb-4 text-[16px] font-semibold text-text-primary">
            Choose a Deck
          </h3>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : decks.length > 0 ? (
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
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-text-tertiary">
              No flashcard decks found.
            </div>
          )}
        </section>
      </main>
    </>
  )
}
