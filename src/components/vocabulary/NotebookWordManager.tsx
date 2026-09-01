/**
 * @file NotebookWordManager.tsx
 * @description Component giao diện React NotebookWordManager cho học viên
 */

import { useState, useEffect } from 'react'
import { Bookmark, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VocabularyCard } from '@/components/vocabulary/VocabularyCard'
import type { SavedVocabulary, UserDeck } from '@/types/vocabulary'

interface VocabularyTabProps {
  savedVocabulary: SavedVocabulary[]
  userDecks: UserDeck[]
  onAddToDeck: (word: SavedVocabulary) => void
  onDeleteWord: (word: SavedVocabulary) => void
  onRemoveFromDeck: (word: SavedVocabulary) => void
  onAction: (message: string) => void
  isVietnamese: boolean
}

const ITEMS_PER_PAGE = 20

export function VocabularyTab({
  savedVocabulary,
  userDecks,
  onAddToDeck,
  onDeleteWord,
  onRemoveFromDeck,
  onAction,
  isVietnamese,
}: VocabularyTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDeck, setFilterDeck] = useState<string | 'all' | 'inbox'>('all')
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE)
  const [isLoading, setIsLoading] = useState(false)

  const filteredWords = savedVocabulary.filter((item) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const meanings =
        item.meanings || (item.primary_meaning ? [item.primary_meaning] : [])
      const matchesSearch =
        item.lexical_item.word.toLowerCase().includes(query) ||
        meanings.some(
          (m) =>
            m.definition_vi?.toLowerCase().includes(query) ||
            m.definition_en?.toLowerCase().includes(query)
        )
      if (!matchesSearch) return false
    }

    if (filterDeck === 'inbox') {
      return !item.deck_id
    } else if (filterDeck !== 'all' && item.deck_id !== filterDeck) {
      return false
    }

    return true
  })

  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE)
  }, [searchQuery, filterDeck])

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement
      const scrollPosition = scrollTop + clientHeight
      const scrollThreshold = scrollHeight * 0.8

      if (
        scrollPosition >= scrollThreshold &&
        displayCount < filteredWords.length &&
        !isLoading
      ) {
        setIsLoading(true)
        setTimeout(() => {
          setDisplayCount((prev) =>
            Math.min(prev + ITEMS_PER_PAGE, filteredWords.length)
          )
          setIsLoading(false)
        }, 300)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [displayCount, filteredWords.length, isLoading])

  const displayedWords = filteredWords.slice(0, displayCount)
  const hasMore = displayCount < filteredWords.length

  if (savedVocabulary.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-subtle">
          <Bookmark className="text-text-tertiary" size={40} />
        </div>
        <h3 className="text-[16px] font-semibold text-text-primary">
          {isVietnamese ? 'Chưa có từ nào đã lưu' : 'No saved words yet'}
        </h3>
        <p className="mt-2 max-w-sm text-[14px] text-text-secondary">
          {isVietnamese
            ? 'Bắt đầu lưu từ từ điển để xây dựng bộ sưu tập từ vựng cá nhân của bạn.'
            : 'Start saving words from the dictionary to build your personal vocabulary collection.'}
        </p>
        <Button
          className="mt-6 bg-primary hover:bg-primary-hover"
          onClick={() =>
            onAction(isVietnamese ? 'Đi đến Từ vựng' : 'Go to Vocabulary')
          }
        >
          {isVietnamese ? 'Khám phá Từ vựng' : 'Explore Vocabulary'}
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder={
              isVietnamese
                ? 'Tìm kiếm từ đã lưu...'
                : 'Search saved words...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-[13px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
        </div>

        <select
          value={filterDeck}
          onChange={(e) => setFilterDeck(e.target.value as typeof filterDeck)}
          className="h-10 rounded-xl border border-border bg-surface px-3 pr-8 text-[13px] text-text-primary focus:border-primary focus:outline-none"
        >
          <option value="all">{isVietnamese ? 'Tất cả' : 'All'}</option>
          <option value="inbox">
            📁 {isVietnamese ? 'Danh sách từ vựng' : 'Vocabulary list'} (
            {savedVocabulary.filter((w) => !w.deck_id).length})
          </option>
          {userDecks.map((deck) => (
            <option key={deck.id} value={deck.id}>
              📁 {deck.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 text-[12px] text-text-secondary">
        <span>
          {isVietnamese ? 'Đang hiển thị' : 'Showing'}: {displayedWords.length}/
          {filteredWords.length} {isVietnamese ? 'từ' : 'words'}
        </span>
        {hasMore && (
          <span className="text-primary">
            • {isVietnamese ? 'Cuộn xuống để xem thêm' : 'Scroll down for more'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {displayedWords.map((item) => (
          <VocabularyCard
            key={item.id}
            item={item}
            userDecks={userDecks}
            onAddToDeck={onAddToDeck}
            onRemoveFromDeck={onRemoveFromDeck}
            onDeleteWord={onDeleteWord}
            onAction={onAction}
          />
        ))}
      </div>

      {isLoading && (
        <div className="py-4 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {!hasMore && filteredWords.length > 0 && (
        <p className="py-4 text-center text-[12px] text-text-tertiary">
          {isVietnamese ? 'Đã hiển thị tất cả' : 'Showing all'}{' '}
          {filteredWords.length} {isVietnamese ? 'từ' : 'words'}
        </p>
      )}

      {filteredWords.length === 0 && searchQuery && (
        <div className="py-8 text-center">
          <p className="text-[14px] text-text-secondary">
            {isVietnamese
              ? 'Không tìm thấy từ nào phù hợp với'
              : 'No words found matching'}{' '}
            "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  )
}
