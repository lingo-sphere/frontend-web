/** Private provenance, retained separately from public flashcard content. */
export interface SpeakingVocabularySource {
  source_kind?: 'SPEAKING' | 'WRITING'
  source_key: string
  attempt_id: string
  exercise_id: string
  exercise_title: string
  turn_number: number
  original_word: string
  transcript: string
  recorded_at: string
  accuracy: number | null
  offset_seconds: number | null
  duration_seconds: number | null
  requires_confirmation: boolean
  confirmed_word?: string
}
