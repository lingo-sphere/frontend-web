
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Layers3, Plus, Check } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { UserDeck } from '@/types/vocabulary'

interface SelectDeckModalProps {
  isOpen: boolean
  onClose: () => void
  word: string
  existingDecks: UserDeck[]
  onSelectDeck: (deckId: string | null, createNew: boolean, newDeckTitle?: string) => void
}

export function SelectDeckModal({
  isOpen,
  onClose,
  word,
  existingDecks,
  onSelectDeck,
}: SelectDeckModalProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newDeckTitle, setNewDeckTitle] = useState('')

  const handleSaveOnly = () => {
    onSelectDeck(null, false)
    handleClose()
  }

  const handleAddToDeck = () => {
    if (isCreatingNew) {
      if (newDeckTitle.trim()) {
        onSelectDeck(null, true, newDeckTitle.trim())
      }
    } else {
      onSelectDeck(selectedDeckId, false)
    }
    handleClose()
  }

  const handleClose = () => {
    setSelectedDeckId(null)
    setIsCreatingNew(false)
    setNewDeckTitle('')
    onClose()
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={isVietnamese ? `Lưu từ "${word}"` : `Save word "${word}"`}
      size="md"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveOnly}>
            {isVietnamese ? 'Chỉ lưu' : 'Save only'}
          </Button>
          <Button
            className="bg-primary hover:bg-primary-hover"
            onClick={handleAddToDeck}
            disabled={isCreatingNew ? !newDeckTitle.trim() : !selectedDeckId}
          >
            {isVietnamese ? 'Thêm vào deck' : 'Add to deck'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Existing decks */}
        <div>
          <h3 className="mb-2 text-[13px] font-medium text-text-secondary">
            {isVietnamese ? 'Chọn deck có sẵn' : 'Choose existing deck'}
          </h3>
          <div className="space-y-2">
            {existingDecks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => { setSelectedDeckId(deck.id); setIsCreatingNew(false) }}
                className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                  selectedDeckId === deck.id && !isCreatingNew
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers3 size={16} className="text-text-tertiary" />
                  <span className="text-[14px] text-text-primary">{deck.title}</span>
                </div>
                {selectedDeckId === deck.id && !isCreatingNew && (
                  <Check size={16} className="text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Create new deck */}
        <div className="border-t border-border pt-4">
          <button
            onClick={() => { setIsCreatingNew(true); setSelectedDeckId(null) }}
            className={`flex w-full items-center gap-2 rounded-lg border p-3 text-left transition-colors ${
              isCreatingNew
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Plus size={16} className="text-primary" />
            </div>
            <span className="text-[14px] text-text-primary">
              {isVietnamese ? 'Tạo deck mới' : 'Create new deck'}
            </span>
          </button>

          {isCreatingNew && (
            <div className="mt-3">
              <Input
                placeholder={isVietnamese ? 'Tên deck mới...' : 'New deck name...'}
                value={newDeckTitle}
                onChange={(e) => setNewDeckTitle(e.target.value)}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
