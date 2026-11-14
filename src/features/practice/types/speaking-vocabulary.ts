export interface SpeakingWordTarget {
  source_kind?: 'SPEAKING' | 'WRITING'
  attempt_id: string
  turn_number: number
  word: string
}
import type { SpeakingVocabularySource as SpeakingWordSource } from '@/features/vocabulary/types/vocabulary-source'
export type { SpeakingWordSource }
export interface SpeakingSavedWord {
  source_key: string
  lexical_item_id: string
  meaning_index: number
  word: string
}
export interface SaveSpeakingWordResult {
  success: boolean
  saved_id: string
  lexical_item_id: string
  meaning_index: number
  word: string
  source: SpeakingWordSource
}
export interface SpeakingWordDetail {
  id: string
  _id?: string
  word: string
  pronunciation?: string
  audio_url_us?: string
  audio_url_uk?: string
  meanings: Array<{
    part_of_speech: string
    definition_vi: string
    definition_en?: string
    examples?: Array<{ sentence_en: string; sentence_vi?: string }>
  }>
}
