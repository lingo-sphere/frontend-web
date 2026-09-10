// Hook quản lý dữ liệu thẻ từ vựng công khai và cá nhân bằng TanStack Query.
'use client'

import { useState } from 'react'
import { useNavigate } from '@/lib/navigation'
import { useDashboardStore } from '@/features/dashboard/store/dashboard.store'
import { useApp } from '@/contexts/app.context'
import {
  usePublicDecksQuery,
  useMyVocabularyEnrollmentsQuery,
} from '@/features/vocabulary/hooks/use.vocabulary.query'
import type { Deck } from '@/features/vocabulary/schemas/vocabulary.schema'

const VOCABULARY_TAGS = ['all', 'TOEIC', 'General', 'Business', 'Communication', 'Basic']

export function useVocabularyPage() {
  const navigate = useNavigate()
  const { showAction } = useApp()
  const setActiveNavItem = useDashboardStore((state) => state.setActiveNavItem)

  const [activeTag, setActiveTag] = useState('all')

  const { data: publicDecks = [], isLoading: isPublicLoading } = usePublicDecksQuery()
  const { data: myDecks = [], isLoading: isMyLoading } = useMyVocabularyEnrollmentsQuery()
  const isLoading = isPublicLoading || isMyLoading

  const filteredPacks = publicDecks.filter((d: Deck) => {
    if (activeTag === 'all') return true
    const deckTags = d.tags || []
    return (
      deckTags.some((t: string) => t.toLowerCase() === activeTag.toLowerCase()) ||
      (d.category && d.category.toLowerCase() === activeTag.toLowerCase())
    )
  })

  const totalCards = publicDecks.reduce(
    (sum: number, d: Deck) => sum + (d.card_count || 0),
    0
  )

  const handleDeckClick = (deck: Deck) => {
    setActiveNavItem('vocabulary')
    navigate(`/vocabulary/learn/${deck._id}`)
    showAction(`Bắt đầu học bộ thẻ "${deck.name}"`)
  }

  return {
    publicDecks,
    myDecks,
    isLoading,
    activeTag,
    setActiveTag,
    tags: VOCABULARY_TAGS,
    filteredPacks,
    totalCards,
    handleDeckClick,
  }
}
