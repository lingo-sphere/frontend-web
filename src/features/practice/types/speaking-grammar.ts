export interface SpeakingGrammarSource {
  source_kind?: 'SPEAKING' | 'WRITING'
  attempt_id: string
  exercise_id: string
  exercise_title: string
  issue_id: string
  turn_number: number
  original: string
  corrected: string
  category: string
  explanation: string
  recorded_at: string
  mapping_version: string
  rule_code: string
  topic_code: string
  theory_slug: string | null
}
export interface SpeakingGrammarIssue {
  issue_id: string
  turn_number: number
  original: string
  corrected: string
  category: string
  explanation: string
  mapping_status: 'MATCHED' | 'UNMAPPED' | 'UNVERIFIED'
  target: { rule_code: string; topic_code: string; theory_slug: string | null; practice_scope: 'TOPIC' } | null
  topic: { _id: string; code: string; name_en: string; name_vi?: string; cefr_level: string; total_questions: number; is_unlocked: boolean } | null
  theory_available: boolean
  availability: 'READY' | 'LOCKED' | 'CONTENT_UNAVAILABLE' | 'THEORY_UNAVAILABLE' | 'INSUFFICIENT_QUESTIONS' | 'UNMAPPED' | 'UNVERIFIED'
}
export interface SpeakingGrammarRemediation {
  vocabulary_targets?: Array<{ index: number; word: string; original: string; corrected: string }>
  source_kind?: 'SPEAKING' | 'WRITING'
  attempt_id: string
  exercise_id: string
  exercise_title: string
  recorded_at: string
  mapping_version: string
  issues: SpeakingGrammarIssue[]
}
