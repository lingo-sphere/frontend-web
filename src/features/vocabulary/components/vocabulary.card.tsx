// Thẻ hiển thị từ vựng đã lưu trong sổ từ.
import { useTranslation } from 'react-i18next'
import { Volume2, Plus, Trash2, Folder } from 'lucide-react'
import type { SavedVocabulary, UserDeck, Meaning } from '@/features/vocabulary/types/vocabulary.learn'

interface VocabularyCardProps {
  item: SavedVocabulary
  userDecks: UserDeck[]
  onAddToDeck: (item: SavedVocabulary) => void
  onRemoveFromDeck: (item: SavedVocabulary) => void
  onDeleteWord: (item: SavedVocabulary) => void
  onAction: (message: string) => void
}

export function VocabularyCard({
  item,
  userDecks,
  onAddToDeck,
  onRemoveFromDeck,
  onDeleteWord,
  onAction,
}: VocabularyCardProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const word = item.lexical_item
  const meanings = item.meanings || (item.primary_meaning ? [item.primary_meaning] : [])
  const deckName = item.deck_id
    ? userDecks.find((d) => d.id === item.deck_id)?.title
    : null

  const partOfSpeechMap: Record<string, { en: string; vi: string }> = {
    NOUN: { en: 'Noun', vi: 'Danh từ' },
    VERB: { en: 'Verb', vi: 'Động từ' },
    ADJ: { en: 'Adjective', vi: 'Tính từ' },
    ADV: { en: 'Adverb', vi: 'Phó từ' },
    PREP: { en: 'Preposition', vi: 'Giới từ' },
    CONJ: { en: 'Conjunction', vi: 'Liên từ' },
    PRON: { en: 'Pronoun', vi: 'Đại từ' },
    PHRASE: { en: 'Phrase', vi: 'Cụm từ' },
    PHRASAL_VERB: { en: 'Phrasal Verb', vi: 'Cụm động từ' },
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 transition-all hover:shadow-md hover:-translate-y-0.5">

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="truncate text-[20px] font-bold text-text-primary">{word.word}</h4>
          {word.cefr_level && (
            <span className="mt-1.5 inline-block rounded-full bg-surface-subtle px-2 py-0.5 text-[10px] font-medium text-text-secondary">
              {word.cefr_level}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover hover:text-primary"
            onClick={() => onAddToDeck(item)}
            title={item.deck_id ? (isVietnamese ? 'Đổi deck' : 'Change deck') : (isVietnamese ? 'Thêm vào deck' : 'Add to deck')}
          >
            <Plus size={16} />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-red-50 hover:text-red-500"
            onClick={() => onDeleteWord(item)}
            title={isVietnamese ? 'Xóa từ' : 'Delete word'}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {word.pronunciation_uk && (
          <button
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[12px] font-medium text-text-secondary hover:border-primary hover:text-primary"
            onClick={() => onAction(`Phát âm UK: ${word.word} ${word.pronunciation_uk}`)}
          >
            <Volume2 size={14} />
            UK
          </button>
        )}
        {word.pronunciation_us && (
          <button
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[12px] font-medium text-text-secondary hover:border-primary hover:text-primary"
            onClick={() => onAction(`Phát âm US: ${word.word} ${word.pronunciation_us}`)}
          >
            <Volume2 size={14} />
            US
          </button>
        )}
      </div>

      {(word.pronunciation_uk || word.pronunciation_us) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-text-tertiary">
          {word.pronunciation_uk && (
            <span>
              UK <span className="text-text-secondary">{word.pronunciation_uk}</span>
            </span>
          )}
          {word.pronunciation_us && (
            <span>
              US <span className="text-text-secondary">{word.pronunciation_us}</span>
            </span>
          )}
        </div>
      )}

      <div className="mt-3 space-y-3">
        {meanings.map((meaning, index) => (
          <MeaningItem key={meaning.id || index} meaning={meaning} index={index} isVietnamese={isVietnamese} partOfSpeechMap={partOfSpeechMap} />
        ))}
      </div>

      {deckName && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-text-tertiary">
          <Folder className="w-3.5 h-3.5" />
          <span>{deckName}</span>
        </div>
      )}
    </div>
  )
}

interface MeaningItemProps {
  meaning: Meaning
  index: number
  isVietnamese: boolean
  partOfSpeechMap: Record<string, { en: string; vi: string }>
}

function MeaningItem({ meaning, index, isVietnamese, partOfSpeechMap }: MeaningItemProps) {
  const posLabel = partOfSpeechMap[meaning.part_of_speech]?.[isVietnamese ? 'vi' : 'en'] || meaning.part_of_speech

  return (
    <div className="space-y-1">
      <span className="inline-block rounded-full border border-border bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-text-secondary">
        {posLabel}
      </span>

      <p className="text-[14px] font-medium text-text-primary">
        {meaning.short_meaning_vi || meaning.definition_vi}
      </p>

      {meaning.definition_en && (
        <p className="text-[12px] leading-relaxed text-text-secondary">{meaning.definition_en}</p>
      )}

      {meaning.examples && meaning.examples.length > 0 && (
        <p className="text-[12px] italic text-text-tertiary">"{meaning.examples[0].sentence_en}"</p>
      )}
    </div>
  )
}
