/**
 * @file grammar-practice.ts
 * @description Types cho tính năng Luyện tập Ngữ Pháp (Grammar Practice)
 */

export interface TargetVocabularyRef {
  vocabulary_id?: string
  word: string
  meaning_order?: number
  meaning_vi: string
  pos?: string
  ipa?: string
  us_audio?: string
}

export interface GrammarLevelSummary {
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  display_name: string
  meaning: string
  is_unlocked: boolean
  total_topics: number
  completed_topics: number
  accuracy_rate: number
  completion_rate: number
}

export interface GrammarTopicItem {
  _id: string
  code: string
  name_en: string
  name_vi?: string
  category: string
  cefr_level: string
  structure_pattern?: string
  description_vi?: string
  total_questions: number
  user_accuracy?: number
  user_attempts?: number
  is_completed: boolean
  is_unlocked: boolean
}

export interface GrammarQuestionOption {
  key: string
  text: string
}

export interface GrammarQuestionItem {
  question_index: number
  question_id: string
  question_type: 'MULTIPLE_CHOICE' | 'FILL_BLANK' | 'ORDERING' | 'SHORT_ANSWER'
  exercise_type: string
  question_text_en: string
  question_text_vi?: string
  instruction_en?: string
  instruction_vi?: string
  options?: GrammarQuestionOption[]
  ordering_items?: string[]
  target_vocabularies?: TargetVocabularyRef[]
}

export interface GrammarSession {
  session_id: string
  grammar_knowledge_id?: string
  topic_name_en: string
  topic_name_vi: string
  cefr_level: string
  total_questions: number
  questions: GrammarQuestionItem[]
}

export interface GrammarSessionResultDetail {
  question_index: number
  question_id: string
  user_answer: string
  correct_answer: string
  is_correct: boolean
  explanation?: string
  explanation_vi?: string
  target_vocabularies?: TargetVocabularyRef[]
}

export interface GrammarSessionResult {
  session_id: string
  total_questions: number
  correct_count: number
  incorrect_count: number
  skipped_count: number
  accuracy_rate: number
  total_time_seconds: number
  details: GrammarSessionResultDetail[]
}

export interface CreateGrammarSessionParams {
  grammar_knowledge_id?: string
  cefr_level?: string
  question_count?: number
  userId?: string
}

export interface SubmitGrammarAnswerParams {
  session_id: string
  question_index: number
  answer: string
  userId?: string
}

export interface SubmitGrammarSessionParams {
  session_id: string
  answers?: Record<string, string>
  total_time_seconds?: number
  skipped_indices?: number[]
  userId?: string
}
