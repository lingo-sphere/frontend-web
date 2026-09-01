/**
 * @file writing.ts
 * @description Định nghĩa kiểu dữ liệu TypeScript cho hệ thống giao diện Web
 */

export type WritingLevel = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED'
export type ExerciseType = 'SENTENCE_ARRANGEMENT' | 'SENTENCE_COMPLETION' | 'PARAPHRASING' | 'KEYWORD_WRITING' | 'TOPIC_WRITING' | 'DIARY'
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD'
export type SubmissionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED'

export interface WritingExercise {
  id: string
  title: string
  title_vi?: string
  description?: string
  description_vi?: string
  domain: 'WRITING'
  toeic_part?: number
  exercise_type: ExerciseType
  writing_level: WritingLevel

  prompt?: string
  prompt_en?: string
  prompt_vi?: string
  instructions?: string

  reference_media_id?: string

  target_lexical_item_ids?: string[]
  target_grammar_point_ids?: string[]

  expected_answer?: string
  alternative_answers?: string[]

  keywords?: string[]
  optional_keywords?: string[]

  rubric?: WritingRubric
  ai_hints?: string[]

  min_words?: number
  max_words?: number

  topic_id?: string
  topic_name?: string
  difficulty_level?: DifficultyLevel
  cefr_level?: string
  estimated_minutes?: number

  total_attempts?: number
  avg_score?: number

  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED'
  created_at: string
  updated_at: string
}

export interface WritingRubric {
  task_achievement?: {
    weight: number
    max_score: number
    criteria: string[]
  }
  coherence?: {
    weight: number
    max_score: number
    criteria: string[]
  }
  lexical_resource?: {
    weight: number
    max_score: number
    criteria: string[]
  }
  grammatical_accuracy?: {
    weight: number
    max_score: number
    criteria: string[]
  }
}

export interface WritingDraft {
  content: string
  word_count: number
  timestamp: string
  version_number: number
}

export interface WritingSubmission {
  id: string
  user_id: string
  exercise_id: string
  session_id?: string

  content: string
  word_count: number

  version_number: number
  drafts: WritingDraft[]
  is_draft: boolean

  ai_evaluation?: AIEvaluation

  overall_score?: number
  task_achievement_score?: number
  coherence_score?: number
  lexical_resource_score?: number
  grammatical_accuracy_score?: number

  keywords_included?: string[]
  keywords_missing?: string[]
  keyword_score?: number

  is_correct?: boolean
  correct_answer?: string

  writing_time_seconds?: number
  time_score?: number

  estimated_cefr?: string

  domain: 'WRITING'
  status: SubmissionStatus
  submitted_at?: string
  created_at: string

  exercise?: WritingExercise
}

export interface AIEvaluation {

  overall_feedback: string
  overall_strengths?: string
  overall_weaknesses?: string
  strengths?: string[]
  weaknesses?: string[]
  recommended_level?: string
  estimated_cefr?: string
  grammar_feedback?: string
  vocabulary_feedback?: string

  scores?: {
    task_achievement?: ScoreDetail
    coherence?: ScoreDetail
    lexical_resource?: ScoreDetail
    grammatical_accuracy?: ScoreDetail
    overall?: ScoreDetail
  }

  task_achievement_feedback?: string
  coherence_feedback?: string
  lexical_resource_feedback?: string
  grammatical_accuracy_feedback?: string

  errors: GrammarError[]

  vocabulary_analysis?: VocabularyAnalysis

  grammar_analysis?: GrammarAnalysis

  sentence_analysis?: SentenceAnalysis

  suggested_version?: string
  improvement_tips?: string[]
  alternative_phrases?: string[]

  paraphrase_analysis?: ParaphraseAnalysis

  ai_model?: string
  ai_version?: string
  processing_time_ms?: number
}

export interface ScoreDetail {
  score: number
  max_score: number
  weight?: number
}

export interface GrammarError {
  type: 'GRAMMAR' | 'SPELLING' | 'PUNCTUATION' | 'VOCABULARY' | 'STYLE' | 'FORMAT'
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  position: {
    start: number
    end: number
  }
  original: string
  correction: string
  explanation: string
  grammar_point_id?: string
}

export interface VocabularyAnalysis {
  keywords_used: {
    word: string
    is_correct: boolean
    context: string
  }[]
  keywords_missing: string[]
  advanced_vocabulary: string[]
  inappropriate_words: {
    word: string
    suggestion: string
  }[]
  collocation_issues: {
    phrase: string
    suggestion: string
  }[]
}

export interface GrammarAnalysis {
  correct_structures: string[]
  incorrect_structures: {
    original: string
    correction: string
    grammar_point_id?: string
  }[]
  suggested_improvements: string[]
}

export interface SentenceAnalysis {
  sentence_count: number
  avg_sentence_length: number
  complex_sentences: number
  simple_sentences: number
  sentence_variety_score: number
}

export interface ParaphraseAnalysis {
  is_meaning_preserved: boolean
  similarity_score: number
  key_differences: string[]
  suggested_paraphrases: string[]
}

export interface WritingStats {
  total_submissions: number
  average_score: number
  total_words_written: number
  average_grammar_accuracy: number
  average_vocabulary_usage: number
  average_writing_time_minutes: number
  score_breakdown: {
    task_achievement: number
    coherence: number
    vocabulary: number
    grammar: number
  }
}

export interface WritingProgress {
  grammar: number
  vocabulary: number
  coherence: number
  weakest_area: string
  recommended_topics: string[]
}

export interface ContinueWriting {
  submission_id: string
  exercise_id: string
  exercise_title: string
  exercise_type: ExerciseType
  writing_level: WritingLevel
  progress_percent: number
  last_saved_at: string
  version_number: number
  content: string
  word_count: number
}
