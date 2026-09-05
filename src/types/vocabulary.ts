/**
 * @file vocabulary.ts
 * @description Định nghĩa kiểu dữ liệu TypeScript cho hệ thống giao diện Web
 */

export interface VocabularyStats {
  totalCards: number
  due: number
  weak: number
  totalReviews: number
  accuracy: number
}

export interface VocabularyStatus {
  learning: number
  reviewing: number
  mastered: number
  totalCards: number
}

export interface UserDeck {
  id: string
  name: string
  title?: string
  cardCount: number
  createdAt: string
  description?: string
  cefrLevel?: string
  totalStudied?: number
  lastStudied?: string
}

export interface VocabularyPack {
  id: string
  title: string
  coverColor: string
  wordCount: number
  studentCount: number
  tags: string[]
  cefrLevel?: string
}

export type LearningStatus = 'NEW' | 'LEARNING' | 'MASTERED'

export interface SavedVocabulary {
  id: string
  lexical_item_id: string
  user_id: string
  added_at: string
  deck_id?: string 
  lexical_item: LexicalItem

  meanings?: Meaning[]

  primary_meaning?: Meaning
  learning_status?: LearningStatus
  review_count?: number
  accuracy_percent?: number
  last_reviewed_at?: string
}

export interface LexicalItem {
  id: string
  word: string
  word_lowercase: string
  word_type: string
  pronunciation_us?: string
  pronunciation_uk?: string
  syllables?: number
  cefr_level?: string
  is_common?: boolean
  audio_url_us?: string
  audio_url_uk?: string
  source?: string
  created_at: string
  updated_at: string
}

export interface Meaning {
  id: string
  lexical_item_id: string
  meaning_order: number
  part_of_speech: string
  definition_en: string
  definition_vi: string
  short_meaning_vi?: string
  examples?: ExampleSentence[]
  synonyms?: string[]
  antonyms?: string[]
  cefr_level?: string
  domain?: string
  is_primary?: boolean
}

export interface ExampleSentence {
  id: string
  lexical_item_id: string
  meaning_id?: string
  sentence_en: string
  sentence_vi?: string
  audio_url?: string
  difficulty_level?: string
}

export interface DeckCard {
  id: string
  deck_id: string
  lexical_item_id: string
  user_notes?: string
  order_index?: number
  created_at: string

  saved_vocabulary?: SavedVocabulary
  lexical_item?: LexicalItem
}

export interface SelectDeckModalProps {
  isOpen: boolean
  onClose: () => void
  word: string
  existingDecks: UserDeck[]
  onSelectDeck: (deckId: string | null, createNew?: boolean) => void
}

export interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
}
