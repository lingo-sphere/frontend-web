/**
 * @file use.vocabulary.page.ts
 * @description Hook tải dữ liệu bộ thẻ từ vựng công khai và cá nhân, lọc theo danh mục
 */

'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from '@/lib/navigation'
import { useDashboardStore } from '@/store/dashboard.store'
import { useApp } from '@/contexts/app.context'
import { vocabularyService } from '@/services/vocabulary.service'
import type { Deck } from '@/types/api.types'

const VOCABULARY_TAGS = ['all', 'TOEIC', 'General', 'Business', 'Communication', 'Basic']

export function useVocabularyPage() {
  const navigate = useNavigate()
  const { showAction } = useApp()
  const setActiveNavItem = useDashboardStore((state) => state.setActiveNavItem)

  const [activeTag, setActiveTag] = useState('all')
  const [publicDecks, setPublicDecks] = useState<Deck[]>([])
  const [myDecks, setMyDecks] = useState<Deck[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchVocabularyData = async () => {
      try {
        setIsLoading(true)
        const [pubDecks, myEnrollments] = await Promise.all([
          vocabularyService.getPublicDecks(),
          vocabularyService.getMyEnrollments().catch(() => []),
        ])
        if (isMounted) {
          if (Array.isArray(pubDecks)) setPublicDecks(pubDecks)
          if (Array.isArray(myEnrollments)) setMyDecks(myEnrollments)
        }
      } catch (err) {
        console.error('Error loading vocabulary data:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchVocabularyData()
    return () => {
      isMounted = false
    }
  }, [])

  const filteredPacks = publicDecks.filter((d: any) => {
    if (activeTag === 'all') return true
    const deckTags = d.tags || []
    return (
      deckTags.some((t: string) => t.toLowerCase() === activeTag.toLowerCase()) ||
      (d.category && d.category.toLowerCase() === activeTag.toLowerCase())
    )
  })

  const totalCards = publicDecks.reduce(
    (sum: number, d: any) => sum + (d.card_count || d.total_cards || 0),
    0
  )

  const handleDeckClick = (deck: Deck) => {
    setActiveNavItem('vocabulary')
    navigate(`/vocabulary/learn/${deck.id || deck._id}`)
    showAction(`Bắt đầu học bộ thẻ "${deck.title || (deck as any).name}"`)
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
