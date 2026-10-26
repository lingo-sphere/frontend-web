// Định nghĩa các kiểu dữ liệu cho Sổ tay câu sai (Mistake Vault), SRS và Luyện tập chuyên sâu theo chủ đề.

export enum MistakeStatus {
  NEED_PRACTICE = 'NEED_PRACTICE',
  PRACTICING = 'PRACTICING',
  MASTERED = 'MASTERED',
}

export interface UserMistakeItem {
  _id: string
  user_id: string
  question_id: string
  question_text: string
  options: string[]
  question_type?: 'MULTIPLE_CHOICE' | 'FILL_BLANK' | 'ORDERING' | string
  ordering_items?: string[]
  question_data?: Record<string, any>
  user_answer: string
  correct_answer: string
  explanation?: string
  topic_tags: string[]
  topic_name_vi?: string
  source_context?: string
  consecutive_correct: number
  status: MistakeStatus
  last_reviewed_at?: string | null
  next_due_at: string
  srs_schedule_id?: string
  created_at: string
  updated_at: string
  classification_snapshot?: {
    domain?: string
    exercise_type?: string
    question_type?: string
    context_id?: string
    grammar_knowledge_id?: string
    cefr_level?: string
    listening_exercise_id?: string
    context_path?: string[]
  }
}

export interface RecordMistakeItemPayload {
  question_id: string
  question_text: string
  options: string[]
  user_answer: string
  correct_answer: string
  explanation?: string
  topic_name_vi?: string
  source_context?: string
  source_type?: string
  source_id?: string
  source_title?: string
  // Taxonomy: Practice Context for mistake classification & remedial practice
  context_id?: string
}

export interface BatchRecordMistakesPayload {
  mistakes: RecordMistakeItemPayload[]
}

export interface QueryMistakesParams {
  status?: MistakeStatus
  topic?: string
  domain?: string  // 'LISTENING' | 'READING' | 'GRAMMAR' | 'SPEAKING' | 'WRITING'
  due_only?: boolean
  page?: number
  limit?: number
}

export interface TopicGroupStat {
  topic: string
  count: number
}

export interface MistakesResponse {
  items: UserMistakeItem[]
  pagination: {
    total: number
    page: number
    limit: number
    total_pages: number
  }
  summary: {
    total_all: number
    total_due_today: number
    total_need_practice: number
    total_practicing: number
    total_mastered: number
  }
  topic_groups: TopicGroupStat[]
}

export interface DueMistakesResponse {
  total_due: number
  items: UserMistakeItem[]
}

export interface ReviewMistakePayload {
  is_correct: boolean
  user_answer?: string
}

export interface ReviewMistakeResponse {
  message: string
  is_correct: boolean
  consecutive_correct: number
  status: MistakeStatus
  next_due_at: string
  mistake: UserMistakeItem
}

export interface TopicDrillQuestion {
  _id: string
  question_text: string
  question_text_vi?: string
  options: string[]
  correct_answer: string
  explanation?: string
  difficulty_level?: string
  domain?: string
}

export interface TopicDrillResponse {
  topic: string
  total_found: number
  questions: TopicDrillQuestion[]
}


export interface SpeakingSrsDueExercise {
  srs_id: string
  exercise_id: string
  title: string
  exercise_type: string
  difficulty_level: string
  cefr_level: string
  prompt_text_en: string
  image_url?: string
  due_at: string
  due_type: string
  interval_days: number
  repetitions: number
  last_score?: number | null
  last_pronunciation_score?: number | null
  last_practiced_at?: string | null
  is_due: boolean
}

export interface SpeakingMispronouncedWord {
  word: string
  phonetic_expected?: string
  phonetic_actual?: string
  error_type?: string
  count: number
  last_exercise_id?: string
  last_exercise_title?: string
  last_occurred_at: string
}

export interface SpeakingPhonemeError {
  phoneme: string
  mastery_score: number
  status: string
  top_substitution?: string
  speaking_error_count: number
  last_practiced_at?: string
}

export interface SpeakingGrammarError {
  error_category: string
  original_phrase: string
  corrected_phrase: string
  rule_violated_vi: string
  exercise_id?: string
  exercise_title?: string
  occurred_at: string
}

export interface SpeakingContextImprovement {
  context_id: string
  context_name: string
  attempts: number
  avg_score: number
  last_practiced_at?: string
}

export interface SpeakingMistakesResponse {
  summary: {
    total_due_today: number
    total_scheduled: number
    total_mispronounced_words: number
    total_phoneme_errors: number
    total_grammar_errors: number
    overall_speaking_score: number
  }
  due_exercises: SpeakingSrsDueExercise[]
  all_scheduled_exercises: SpeakingSrsDueExercise[]
  mispronounced_words: SpeakingMispronouncedWord[]
  phoneme_errors: SpeakingPhonemeError[]
  grammar_errors: SpeakingGrammarError[]
  context_improvements: SpeakingContextImprovement[]
  radar_skills?: {
    pronunciation: number
    fluency: number
    grammar: number
    vocabulary: number
    task_achievement: number
    naturalness: number
  }
}
