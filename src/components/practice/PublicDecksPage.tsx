// Updated: 2026-08-20
// Public Decks page - hiển thị tất cả bộ từ vựng public
// - Grid view với search và sort options
// - Deck cards với author info, stats

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bookmark, Eye, Search, Filter } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/dashboard/SectionHeading'
import { publicDecks } from '@/data/practice-data'
import type { PublicDeck } from '@/data/practice-data'

interface PublicDecksPageProps {
  onAction: (message: string) => void
}

type SortOption = 'views' | 'saves'

export function PublicDecksPage({ onAction }: PublicDecksPageProps) {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [sortBy, setSortBy] = useState<SortOption>('views')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter and sort decks
  const filteredDecks = publicDecks
    .filter((deck) =>
      deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.topic.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'views') return b.views - a.views
      return b.saves - a.saves
    })

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <SectionHeading
        eyebrow={t('publicDecks.title')}
        title={isVietnamese ? 'Bộ từ vựng công khai' : 'Public Decks'}
        description={isVietnamese ? 'Khám phá bộ từ vựng được chia sẻ từ cộng đồng' : 'Explore vocabulary decks shared by the community'}
      />

      {/* Search and Sort */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder={isVietnamese ? 'Tìm kiếm deck...' : 'Search decks...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-[13px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
        </div>

        {/* Sort options */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface p-1">
          <Filter className="ml-2 h-4 w-4 text-text-tertiary" />
          <button
            className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
              sortBy === 'views'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-surface-hover'
            }`}
            onClick={() => setSortBy('views')}
          >
            {isVietnamese ? 'Lượt xem' : 'Views'}
          </button>
          <button
            className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
              sortBy === 'saves'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-surface-hover'
            }`}
            onClick={() => setSortBy('saves')}
          >
            {isVietnamese ? 'Lượt lưu' : 'Saves'}
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="mt-4 text-[13px] text-text-secondary">
        {isVietnamese ? 'Tìm thấy' : 'Found'} <span className="font-semibold text-text-primary">{filteredDecks.length}</span> {isVietnamese ? 'bộ từ vựng' : 'vocabulary decks'}
      </p>

      {/* Decks Grid */}
      {filteredDecks.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDecks.map((deck: PublicDeck) => (
            <Card
              key={deck.id}
              className="dashboard-card cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg"
              onClick={() => onAction(`${isVietnamese ? 'Đã mở' : 'Opened'} "${deck.title}"`)}
            >
              <CardContent className="p-4">
                {/* Author row */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white"
                    style={{ backgroundColor: deck.authorAvatar }}
                  >
                    {deck.author.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[15px] font-semibold text-text-primary line-clamp-1">{deck.title}</h4>
                    <p className="text-[12px] text-text-secondary">{deck.author}</p>
                  </div>
                </div>

                {/* Topic and word count */}
                <div className="mt-3 flex items-center gap-3">
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-[11px] font-medium text-primary">
                    {deck.topic}
                  </span>
                  <span className="text-[12px] text-text-tertiary">{deck.wordCount} {isVietnamese ? 'từ' : 'words'}</span>
                </div>

                {/* Stats */}
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-4 text-[12px] text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {deck.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bookmark className="h-4 w-4" />
                      {deck.saves}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary-hover"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAction(`${isVietnamese ? 'Đã học' : 'Learning'} "${deck.title}"`)
                    }}
                  >
                    {isVietnamese ? 'Học ngay' : 'Learn Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-12 text-center">
          <p className="text-[14px] text-text-secondary">{isVietnamese ? 'Không tìm thấy bộ từ vựng nào' : 'No vocabulary decks found'}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setSearchQuery('')}
          >
            {isVietnamese ? 'Xóa tìm kiếm' : 'Clear search'}
          </Button>
        </div>
      )}
    </main>
  )
}
