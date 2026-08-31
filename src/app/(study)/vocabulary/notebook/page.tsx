'use client'

import { useState, useMemo, useEffect } from 'react'
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
import { vocabularyService } from '@/services/vocabulary.service'
import { VocabularyTab } from '@/components/vocabulary/NotebookWordManager'
import { DecksTab, CreateDeckModal } from '@/components/vocabulary/NotebookDeckList'

export default function NotebookAppPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const navigate = useNavigate()
  const { showAction } = useApp()
  const setActiveNavItem = useDashboardStore((state) => state.setActiveNavItem)
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'decks'>('vocabulary')

  const [savedVocabulary, setSavedVocabulary] = useState<SavedVocabulary[]>([])
  const [userDecks, setUserDecks] = useState<UserDeck[]>([])

  useEffect(() => {
    let isMounted = true
    const loadNotebookData = async () => {
      try {
        const enrollments = await vocabularyService.getMyEnrollments().catch(() => [])
        if (isMounted && Array.isArray(enrollments)) {
          const mappedDecks: UserDeck[] = enrollments.map((d: any, idx) => ({
            id: d.id || d._id || `deck-${idx}`,
            title: d.title || d.name || 'Personal Deck',
            cardCount: d.total_cards || d.card_count || 0,
            createdAt: d.created_at || new Date().toISOString(),
          }))
          setUserDecks(mappedDecks)
        }
      } catch (err) {
        console.error('Failed to load notebook enrollments:', err)
      }
    }
    loadNotebookData()
    return () => {
      isMounted = false
    }
  }, [])

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
          eyebrow={t('vocabulary.title')}
          title={isVietnamese ? 'Sổ tay từ vựng' : 'Vocabulary Notebook'}
          description={
            isVietnamese
              ? 'Quản lý từ vựng đã lưu và phân loại vào các bộ thẻ'
              : 'Manage saved vocabulary and organize them into decks'
          }
        />

        <div className="mt-6 flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-[14px] font-medium transition-colors ${
              activeTab === 'vocabulary'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Bookmark size={16} />
            {isVietnamese ? 'Danh sách từ vựng' : 'Vocabulary List'}
            <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-text-tertiary">
              {savedVocabulary.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('decks')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-[14px] font-medium transition-colors ${
              activeTab === 'decks'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Layers3 size={16} />
            {isVietnamese ? 'Bộ thẻ cá nhân' : 'Personal Decks'}
            <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-text-tertiary">
              {userDecks.length}
            </span>
          </button>
        </div>

        <div className="mt-6">
          {activeTab === 'vocabulary' ? (
            <VocabularyTab
              savedVocabulary={savedVocabulary}
              userDecks={userDecks}
              onAddToDeck={handleAddToDeck}
              onRemoveFromDeck={handleRemoveFromDeck}
              onDeleteWord={handleDeleteWord}
              onAction={showAction}
              isVietnamese={isVietnamese}
            />
          ) : (
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
        </div>

        <SelectDeckModal
          isOpen={selectDeckModal.isOpen}
          word={selectDeckModal.word?.lexical_item?.word || ''}
          existingDecks={userDecks}
          onClose={() => setSelectDeckModal({ isOpen: false, word: null })}
          onSelectDeck={handleSelectDeck}
        />

        <ConfirmDeleteModal
          isOpen={deleteWordModal.isOpen}
          title={isVietnamese ? 'Xóa từ vựng' : 'Delete Word'}
          message={
            isVietnamese
              ? `Bạn có chắc muốn xóa từ "${deleteWordModal.word?.lexical_item?.word || ''}"?`
              : `Are you sure you want to delete "${deleteWordModal.word?.lexical_item?.word || ''}"?`
          }
          onClose={() => setDeleteWordModal({ isOpen: false, word: null })}
          onConfirm={confirmDeleteWord}
        />

        <CreateDeckModal
          isOpen={createDeckModal}
          deckTitle={newDeckTitle}
          onClose={() => {
            setCreateDeckModal(false)
            setNewDeckTitle('')
          }}
          onDeckTitleChange={setNewDeckTitle}
          onCreate={handleCreateDeck}
          isVietnamese={isVietnamese}
        />
      </main>
    </Layout>
  )
}
