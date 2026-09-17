// Quản lý danh sách từ vựng trong sổ từ.

import { useState, useEffect, useMemo, useRef } from 'react'
import { Bookmark, Search } from 'lucide-react'
import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual'
import { Button } from '@/components/button'
import { VocabularyCard } from '@/features/vocabulary/components/vocabulary.card'
import type { SavedVocabulary, UserDeck } from '@/features/vocabulary/types/vocabulary.learn'

interface VocabularyTabProps {
  savedVocabulary: SavedVocabulary[]
  userDecks: UserDeck[]
  onAddToDeck: (word: SavedVocabulary) => void
  onDeleteWord: (word: SavedVocabulary) => void
  onRemoveFromDeck: (word: SavedVocabulary) => void
  onAction: (message: string) => void
  isVietnamese: boolean
}

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
  const [columns, setColumns] = useState(4)
  const parentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width >= 1280) setColumns(5)
      else if (width >= 1024) setColumns(4)
      else if (width >= 768) setColumns(3)
      else if (width >= 640) setColumns(2)
      else setColumns(1)
    }
    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  const filteredWords = useMemo(() => {
    return savedVocabulary.filter((item) => {
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
  }, [savedVocabulary, searchQuery, filterDeck])

  const rows = useMemo(() => {
    const chunks: SavedVocabulary[][] = []
    for (let i = 0; i < filteredWords.length; i += columns) {
      chunks.push(filteredWords.slice(i, i + columns))
    }
    return chunks
  }, [filteredWords, columns])

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 240,
    overscan: 2,
  })

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
            {isVietnamese ? 'Danh sách từ vựng' : 'Vocabulary list'} (
            {savedVocabulary.filter((w) => !w.deck_id).length})
          </option>
          {userDecks.map((deck) => (
            <option key={deck.id} value={deck.id}>
              {deck.name || 'Bộ thẻ'}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 text-[12px] text-text-secondary">
        <span>
          {isVietnamese ? 'Đang hiển thị' : 'Showing'}: {filteredWords.length}{' '}
          {isVietnamese ? 'từ' : 'words'}
        </span>
      </div>

      {filteredWords.length === 0 && searchQuery ? (
        <div className="py-8 text-center">
          <p className="text-[14px] text-text-secondary">
            {isVietnamese
              ? 'Không tìm thấy từ nào phù hợp với'
              : 'No words found matching'}{' '}
            "{searchQuery}"
          </p>
        </div>
      ) : (
        <div ref={parentRef} className="max-h-[720px] overflow-y-auto pr-1">
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
              const rowItems = rows[virtualRow.index]
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pb-4">
                    {rowItems.map((item) => (
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
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
