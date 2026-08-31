'use client'

import { useState, useMemo } from 'react'
import { useNavigate } from '@/lib/navigation'
import { useTranslation } from 'react-i18next'
import { Layers3, Bookmark } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { SectionHeading } from '@/components/dashboard/SectionHeading'
import { useDashboardStore } from '@/store/dashboard-store'
import { useApp } from '@/contexts/AppContext'
import { SelectDeckModal } from '@/components/vocabulary/SelectDeckModal'
import { ConfirmDeleteModal } from '@/components/vocabulary/ConfirmDeleteModal'
import type { SavedVocabulary, UserDeck } from '@/types/vocabulary'
import {
  savedVocabulary as initialSavedVocabulary,
  userDecks as initialUserDecks,
} from '@/data/vocabulary-data'
import { VocabularyTab } from '@/components/vocabulary/NotebookWordManager'
import { DecksTab, CreateDeckModal } from '@/components/vocabulary/NotebookDeckList'

export default function NotebookAppPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const navigate = useNavigate()
  const { showAction } = useApp()
  const setActiveNavItem = useDashboardStore((state) => state.setActiveNavItem)
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'decks'>('vocabulary')

  const [savedVocabulary, setSavedVocabulary] = useState<SavedVocabulary[]>(
    initialSavedVocabulary
  )
  const [userDecks, setUserDecks] = useState<UserDeck[]>(initialUserDecks)

  const [selectDeckModal, setSelectDeckModal] = useState<{
    isOpen: boolean
    word: SavedVocabulary | null
  }>({ isOpen: false, word: null })

  const [deleteWordModal, setDeleteWordModal] = useState<{
    isOpen: boolean
    word: SavedVocabulary | null
  }>({ isOpen: false, word: null })

  const [createDeckModal, setCreateDeckModal] = useState<boolean>(false)
  const [newDeckTitle, setNewDeckTitle] = useState('')

  const deckWordCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    savedVocabulary.forEach((item) => {
      if (item.deck_id) {
        counts[item.deck_id] = (counts[item.deck_id] || 0) + 1
      }
    })
    return counts
  }, [savedVocabulary])

  const wordsInDeck = (deckId: string) => {
    return savedVocabulary.filter((item) => item.deck_id === deckId)
  }

  const handleDeckClick = (deckId: string) => {
    setActiveNavItem('vocabulary')
    navigate(`/vocabulary/learn/${deckId}`)
    showAction(isVietnamese ? 'Bắt đầu học deck' : 'Starting deck learning')
  }

  const handleAddToDeck = (word: SavedVocabulary) => {
    setSelectDeckModal({ isOpen: true, word })
  }

  const handleSelectDeck = (
    deckId: string | null,
    createNew: boolean,
    newDeckTitle?: string
  ) => {
    const word = selectDeckModal.word
    if (!word) return

    if (createNew && newDeckTitle) {
      const newDeck: UserDeck = {
        id: `deck-${Date.now()}`,
        title: newDeckTitle,
        cardCount: 1,
        createdAt: new Date().toISOString(),
      }
      setUserDecks((prev) => [...prev, newDeck])

      setSavedVocabulary((prev) =>
        prev.map((item) =>
          item.id === word.id ? { ...item, deck_id: newDeck.id } : item
        )
      )

      showAction(
        isVietnamese
          ? `Đã tạo deck "${newDeckTitle}" và thêm từ`
          : `Created deck "${newDeckTitle}" and added word`
      )
    } else if (deckId) {
      setSavedVocabulary((prev) =>
        prev.map((item) =>
          item.id === word.id ? { ...item, deck_id: deckId } : item
        )
      )

      const targetDeck = userDecks.find((d) => d.id === deckId)
      showAction(
        isVietnamese
          ? `Đã thêm từ vào deck "${targetDeck?.title || ''}"`
          : `Added word to deck "${targetDeck?.title || ''}"`
      )
    }

    setSelectDeckModal({ isOpen: false, word: null })
  }

  const handleDeleteWord = (word: SavedVocabulary) => {
    setDeleteWordModal({ isOpen: true, word })
  }

  const confirmDeleteWord = () => {
    const word = deleteWordModal.word
    if (!word) return

    setSavedVocabulary((prev) => prev.filter((item) => item.id !== word.id))
    showAction(
      isVietnamese
        ? `Đã xóa từ "${word.lexical_item.word}" khỏi sổ tay`
        : `Deleted word "${word.lexical_item.word}" from notebook`
    )
    setDeleteWordModal({ isOpen: false, word: null })
  }

  const handleRemoveFromDeck = (word: SavedVocabulary) => {
    setSavedVocabulary((prev) =>
      prev.map((item) =>
        item.id === word.id ? { ...item, deck_id: undefined } : item
      )
    )
    showAction(
      isVietnamese
        ? `Đã chuyển từ "${word.lexical_item.word}" về danh sách từ vựng`
        : `Moved word "${word.lexical_item.word}" back to general list`
    )
  }

  const handleCreateDeck = () => {
    if (!newDeckTitle.trim()) return

    const newDeck: UserDeck = {
      id: `deck-${Date.now()}`,
      title: newDeckTitle.trim(),
      cardCount: 0,
      createdAt: new Date().toISOString(),
    }

    setUserDecks((prev) => [...prev, newDeck])
    showAction(
      isVietnamese
        ? `Đã tạo deck "${newDeckTitle.trim()}"`
        : `Created deck "${newDeckTitle.trim()}"`
    )
    setNewDeckTitle('')
    setCreateDeckModal(false)
  }

  const handleDeleteDeck = (deck: UserDeck) => {
    setSavedVocabulary((prev) =>
      prev.map((item) =>
        item.deck_id === deck.id ? { ...item, deck_id: undefined } : item
      )
    )
    setUserDecks((prev) => prev.filter((d) => d.id !== deck.id))
    showAction(
      isVietnamese
        ? `Đã xóa deck "${deck.title}". Các từ đã được chuyển về Danh sách từ vựng.`
        : `Deleted deck "${deck.title}". Words moved back to General Vocabulary.`
    )
  }

  return (
    <Layout>
      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <SectionHeading
          eyebrow={t('notebook.title') || 'Sổ tay cá nhân'}
          title={isVietnamese ? 'Sổ tay Từ vựng & Flashcards' : 'Vocabulary Notebook & Decks'}
          description={
            isVietnamese
              ? 'Quản lý các từ vựng đã lưu, sắp xếp theo bộ thẻ (Decks) và ôn tập ngắt quãng'
              : 'Manage saved vocabulary, organize into decks and review with spaced repetition'
          }
        />

        <div className="mt-4 flex gap-2 border-b border-border pb-3">
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-all ${
              activeTab === 'vocabulary'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Bookmark size={16} />
            {isVietnamese ? 'Từ vựng' : 'Vocabulary'} ({savedVocabulary.length})
          </button>
          <button
            onClick={() => setActiveTab('decks')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-all ${
              activeTab === 'decks'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Layers3 size={16} />
            {isVietnamese ? 'Bộ thẻ' : 'Decks'} ({userDecks.length})
          </button>
        </div>

        {activeTab === 'vocabulary' && (
          <VocabularyTab
            savedVocabulary={savedVocabulary}
            userDecks={userDecks}
            onAddToDeck={handleAddToDeck}
            onDeleteWord={handleDeleteWord}
            onRemoveFromDeck={handleRemoveFromDeck}
            onAction={showAction}
            isVietnamese={isVietnamese}
          />
        )}

        {activeTab === 'decks' && (
          <DecksTab
            decks={userDecks}
            deckWordCounts={deckWordCounts}
            wordsInDeck={wordsInDeck}
            onDeckClick={handleDeckClick}
            onDeleteDeck={handleDeleteDeck}
            onCreateDeck={() => setCreateDeckModal(true)}
            onAction={showAction}
            isVietnamese={isVietnamese}
          />
        )}

        <SelectDeckModal
          isOpen={selectDeckModal.isOpen}
          onClose={() => setSelectDeckModal({ isOpen: false, word: null })}
          word={selectDeckModal.word?.lexical_item.word || ''}
          existingDecks={userDecks}
          onSelectDeck={handleSelectDeck}
        />

        <ConfirmDeleteModal
          isOpen={deleteWordModal.isOpen}
          onClose={() => setDeleteWordModal({ isOpen: false, word: null })}
          title={isVietnamese ? 'Xóa từ đã lưu' : 'Delete Saved Word'}
          message={
            isVietnamese
              ? `Bạn có chắc muốn xóa từ "${deleteWordModal.word?.lexical_item.word}" khỏi danh sách đã lưu không?`
              : `Are you sure you want to delete the word "${deleteWordModal.word?.lexical_item.word}" from your saved list?`
          }
          confirmText={isVietnamese ? 'Xóa' : 'Delete'}
          onConfirm={confirmDeleteWord}
        />

        <CreateDeckModal
          isOpen={createDeckModal}
          onClose={() => {
            setCreateDeckModal(false)
            setNewDeckTitle('')
          }}
          deckTitle={newDeckTitle}
          onDeckTitleChange={setNewDeckTitle}
          onCreate={handleCreateDeck}
          isVietnamese={isVietnamese}
        />
      </main>
    </Layout>
  )
}
