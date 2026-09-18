// Component danh sach bo the tu vung (Decks) va modal tao bo the moi cho hoc vien.

import { useState } from 'react'
import { Plus, Layers3, BookOpen, X } from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import type { SavedVocabulary, UserDeck } from '@/features/vocabulary/types/vocabulary.learn'

interface DecksTabProps {
  decks: UserDeck[]
  deckWordCounts: Record<string, number>
  wordsInDeck: (deckId: string) => SavedVocabulary[]
  onDeckClick: (deckId: string) => void
  onDeleteDeck: (deck: UserDeck) => void
  onCreateDeck: () => void
  onAction: (message: string) => void
  isVietnamese: boolean
}

export function DecksTab({
  decks,
  deckWordCounts,
  wordsInDeck,
  onDeckClick,
  onDeleteDeck,
  onCreateDeck,
  isVietnamese,
}: DecksTabProps) {
  const [expandedDeck, setExpandedDeck] = useState<string | null>(null)

  return (
    <div>
      <div className="mt-6">
        <Button
          className="gap-2 bg-primary hover:bg-primary-hover"
          onClick={onCreateDeck}
        >
          <Plus size={16} />
          {isVietnamese ? 'Tạo Deck Mới' : 'Create New Deck'}
        </Button>
      </div>

      {decks.length > 0 ? (
        <div className="mt-4 space-y-4">
          {decks.map((deck) => {
            const wordCount = deckWordCounts[deck.id] || 0
            const deckWords = wordsInDeck(deck.id)
            const isExpanded = expandedDeck === deck.id

            return (
              <Card key={deck.id} className="dashboard-card overflow-hidden">
                <CardContent className="p-0">
                  <div
                    className="flex cursor-pointer items-center justify-between p-4 hover:bg-surface-subtle/50"
                    onClick={() => setExpandedDeck(isExpanded ? null : deck.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 to-primary">
                        <Layers3 className="text-white/60" size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-[15px] font-semibold text-text-primary">
                            {deck.name || 'Bộ thẻ'}
                          </h4>
                          {deck.cefrLevel && (
                            <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                              {deck.cefrLevel}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-[12px] text-text-secondary">
                          <span className="flex items-center gap-1">
                            <BookOpen size={12} />
                            {wordCount} {isVietnamese ? 'từ' : 'words'}
                          </span>
                          {deck.totalStudied !== undefined && (
                            <span>
                              {isVietnamese ? 'Đã học' : 'Studied'}:{' '}
                              {deck.totalStudied}{' '}
                              {isVietnamese ? 'lần' : 'times'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary-hover"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeckClick(deck.id)
                        }}
                      >
                        {isVietnamese ? 'Học Ngay' : 'Learn Now'}
                      </Button>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-red-50 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteDeck(deck)
                        }}
                        title={isVietnamese ? 'Xóa deck' : 'Delete deck'}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && deckWords.length > 0 && (
                    <div className="border-t border-border bg-surface-subtle/30 p-4">
                      <p className="mb-3 text-[12px] font-medium text-text-secondary">
                        {isVietnamese ? 'Từ trong deck này' : 'Words in this deck'}:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {deckWords.map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[12px] text-primary"
                          >
                            {item.lexical_item.word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {isExpanded && deckWords.length === 0 && (
                    <div className="border-t border-border bg-surface-subtle/30 p-4">
                      <p className="text-[12px] text-text-tertiary">
                        {isVietnamese
                          ? 'Deck này chưa có từ nào. Thêm từ từ tab Vocabulary.'
                          : 'This deck has no words yet. Add words from the Vocabulary tab.'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-subtle">
            <Layers3 className="text-text-tertiary" size={40} />
          </div>
          <h3 className="text-[16px] font-semibold text-text-primary">
            {isVietnamese ? 'Chưa có Deck nào' : 'No Decks Yet'}
          </h3>
          <p className="mt-2 max-w-sm text-[14px] text-text-secondary">
            {isVietnamese
              ? 'Tạo deck đầu tiên để bắt đầu sắp xếp từ vựng của bạn.'
              : 'Create your first deck to start organizing your vocabulary.'}
          </p>
        </div>
      )}
    </div>
  )
}

interface CreateDeckModalProps {
  isOpen: boolean
  onClose: () => void
  deckTitle: string
  onDeckTitleChange: (value: string) => void
  onCreate: () => void
  isVietnamese: boolean
}

export function CreateDeckModal({
  isOpen,
  onClose,
  deckTitle,
  onDeckTitleChange,
  onCreate,
  isVietnamese,
}: CreateDeckModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-text-primary">
            {isVietnamese ? 'Tạo Deck Mới' : 'Create New Deck'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4">
          <label className="text-[13px] font-medium text-text-secondary">
            {isVietnamese ? 'Tên deck' : 'Deck name'}
          </label>
          <input
            type="text"
            value={deckTitle}
            onChange={(e) => onDeckTitleChange(e.target.value)}
            placeholder={
              isVietnamese
                ? 'VD: Business English, TOEIC 500...'
                : 'E.g., Business English, TOEIC 500...'
            }
            className="mt-1 h-10 w-full rounded-xl border border-border bg-surface px-4 text-[14px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && deckTitle.trim()) {
                onCreate()
              }
            }}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {isVietnamese ? 'Hủy' : 'Cancel'}
          </Button>
          <Button onClick={onCreate} disabled={!deckTitle.trim()}>
            {isVietnamese ? 'Tạo Deck' : 'Create Deck'}
          </Button>
        </div>
      </div>
    </div>
  )
}
