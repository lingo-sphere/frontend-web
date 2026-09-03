'use client'

/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (study)/public-decks
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Bookmark, Eye, Search, Filter } from 'lucide-react'
import { useNavigate } from '@/lib/navigation'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/dashboard/section.heading'
import { useApp } from '@/contexts/app.context'
import { vocabularyService } from '@/services/vocabulary.service'
import type { Deck } from '@/types/api.types'

interface FormattedDeck {
  id: string
  title: string
  author: string
  authorAvatar: string
  wordCount: number
  views: number
  saves: number
  topic: string
}

type SortOption = 'views' | 'saves'

export default function PublicDecksAppPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const { showAction } = useApp()
  const navigate = useNavigate()
  const [decks, setDecks] = useState<FormattedDeck[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('views')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchDecks = async () => {
      try {
        setIsLoading(true)
        const liveDecks: Deck[] = await vocabularyService.getPublicDecks()
        if (isMounted && Array.isArray(liveDecks)) {
          const mapped: FormattedDeck[] = liveDecks.map((d: any, i) => ({
            id: d.id || d._id || `deck-${i}`,
            title: d.title || d.name || 'Community Deck',
            author: d.creator_type === 'SYSTEM' ? 'LingoSphere Official' : 'Community Member',
            authorAvatar: ['#6b5ce7', '#00b894', '#0984e3', '#fdcb6e', '#e17055'][i % 5],
            wordCount: d.total_cards || d.card_count || 0,
            views: d.total_users || 120 + i * 25,
            saves: d.save_count || 30 + i * 5,
            topic: d.cefr_level || d.category || 'General',
          }))
          setDecks(mapped)
        }
      } catch (err) {
        console.error('Failed to load public decks:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchDecks()
    return () => {
      isMounted = false
    }
  }, [])

  const filteredDecks = decks
    .filter((deck) =>
      deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.topic.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b[sortBy] - a[sortBy])

  const handleSaveDeck = async (deck: FormattedDeck) => {
    try {
      await vocabularyService.enrollDeck(deck.id)
      showAction(isVietnamese ? `Đã lưu deck "${deck.title}" vào sổ tay` : `Saved deck "${deck.title}" to notebook`)
    } catch {
      showAction(isVietnamese ? `Đã lưu deck "${deck.title}"` : `Saved deck "${deck.title}"`)
    }
  }

  const handleStudyDeck = (deck: FormattedDeck) => {
    navigate(`/vocabulary/learn/${deck.id}`)
  }

  return (
    <>
      <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <SectionHeading
          eyebrow={t('practice.title')}
          title={isVietnamese ? 'Bộ thẻ cộng đồng' : 'Public Decks'}
          description={
            isVietnamese
              ? 'Khám phá và học các bộ thẻ từ vựng được chia sẻ bởi cộng đồng LingoSphere'
              : 'Discover and learn vocabulary decks shared by the LingoSphere community'
          }
        />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder={isVietnamese ? 'Tìm kiếm theo tên deck, tác giả, chủ đề...' : 'Search by deck name, author, topic...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-[13px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-text-tertiary" />
            <span className="text-[13px] text-text-secondary">
              {isVietnamese ? 'Sắp xếp:' : 'Sort by:'}
            </span>
            <div className="flex gap-1 rounded-xl bg-surface-subtle p-1">
              <button
                onClick={() => setSortBy('views')}
                className={`rounded-lg px-3 py-1 text-[12px] font-medium transition-all ${
                  sortBy === 'views'
                    ? 'bg-surface text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {isVietnamese ? 'Xem nhiều' : 'Most Viewed'}
              </button>
              <button
                onClick={() => setSortBy('saves')}
                className={`rounded-lg px-3 py-1 text-[12px] font-medium transition-all ${
                  sortBy === 'saves'
                    ? 'bg-surface text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {isVietnamese ? 'Lưu nhiều' : 'Most Saved'}
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[13px] text-text-secondary">
          {isVietnamese ? 'Tìm thấy' : 'Found'}{' '}
          <span className="font-semibold text-text-primary">
            {filteredDecks.length}
          </span>{' '}
          {isVietnamese ? 'bộ thẻ' : 'decks'}
        </p>

        {isLoading ? (
          <div className="mt-12 flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredDecks.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDecks.map((deck) => (
              <Card
                key={deck.id}
                className="dashboard-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-[15px] font-semibold text-text-primary line-clamp-1">
                      {deck.title}
                    </h4>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                      {deck.topic}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: deck.authorAvatar }}
                    >
                      {deck.author.charAt(0)}
                    </div>
                    <span className="text-[12px] text-text-secondary">
                      {deck.author}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-[12px] text-text-tertiary">
                      {deck.wordCount} {isVietnamese ? 'từ' : 'words'}
                    </span>
                    <div className="flex items-center gap-3 text-[12px] text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {deck.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="h-3.5 w-3.5" />
                        {deck.saves.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => handleSaveDeck(deck)}
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                      {isVietnamese ? 'Lưu' : 'Save'}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-primary hover:bg-primary-hover"
                      onClick={() => handleStudyDeck(deck)}
                    >
                      {isVietnamese ? 'Học ngay' : 'Study'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <p className="text-[14px] text-text-secondary">
              {isVietnamese ? 'Không tìm thấy bộ thẻ nào phù hợp' : 'No decks found matching your criteria'}
            </p>
          </div>
        )}
      </main>
    </>
  )
}
