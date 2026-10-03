/**
 * @file reading.ts
 * @description Type definitions for Reading Practice (TOEIC Part 6, Part 7, Real-world Task, Info Matching)
 */

export type ReadingType = 'PART_6' | 'PART_7' | 'REAL_WORLD_TASK' | 'INFO_MATCHING'

export type TimerPresetMode = 'QUICK' | 'STANDARD' | 'INTENSIVE'

export interface QuestionOption {
  key: string
  text: string
  is_correct?: boolean
}

export interface ReadingQuestion {
  _id: string
  id?: string
  passage_id: string
  question_number: number
  question_type: string
  exercise_type: string // skill_type: MAIN_IDEA, SPECIFIC_DETAIL, VOCABULARY_IN_CONTEXT, INFERENCE, SENTENCE_INSERTION, PARTS_OF_SPEECH, VERB_TENSE, TASK_CONSTRAINTS
  line_start?: number
  line_end?: number
  paragraph_index?: number
  question_text_en: string
  question_text_vi?: string
  instruction_en?: string
  instruction_vi?: string
  question_data?: {
    options?: QuestionOption[]
    correct_answer?: string
    alternative_answers?: string[]
    explanation?: string
    explanation_vi?: string
  }
  options?: QuestionOption[]
  correct_answer?: string
  explanation?: string
  explanation_vi?: string
  context_id?: string
  difficulty_level?: string
  cefr_level?: string
}

export interface TaskRequirement {
  id: string
  label: string
  fulfilled?: boolean
}

export interface DataCardItem {
  id: string
  title: string
  subtitle?: string
  tags?: string[]
  details: Record<string, string>
}

export interface PassageMetadata {
  scenario_title?: string
  scenario_description?: string
  requirements?: TaskRequirement[]
  data_cards?: DataCardItem[]
  info_paragraphs?: Array<{ key: string; title: string; text: string }>
}

export interface ReadingPassage {
  _id: string
  id?: string
  title: string
  title_vi?: string
  content: string
  content_summary?: string
  source?: string
  word_count: number
  estimated_reading_time_minutes: number
  context_id?: string
  reading_type?: ReadingType
  passage_metadata?: PassageMetadata
  difficulty_level?: 'EASY' | 'MEDIUM' | 'HARD'
  cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  questions?: ReadingQuestion[]
  total_attempts?: number
}

export interface SubmitAnswerPayload {
  question_id: string
  user_answer: string
  time_spent_seconds: number
}

export interface SubmitReadingAttemptPayload {
  passage_id: string
  session_id?: string
  answers: SubmitAnswerPayload[]
}

export interface ReadingAttemptResult {
  _id: string
  user_id: string
  passage_id: string
  domain: string
  answers: Array<{
    question_id: string
    user_answer: string
    correct_answer: string
    is_correct: boolean
    time_spent_seconds: number
  }>
  skill_scores: Record<string, { correct: number; total: number }>
  total_questions: number
  correct_count: number
  score_percent: number
  time_spent_seconds: number
  classification_snapshot: {
    context_id?: string
    cefr_level?: string
    passage_difficulty?: string
  }
  status: string
  completed_at: string
}

// ============================================================================
// Enhanced Reading Result Types (from AI + Context integration)
// ============================================================================

export interface ContextInfo {
  id: string
  code: string
  name_en: string
  name_vi?: string
  path_string?: string
  cefr_level?: string
}

export interface SkillBreakdownItem {
  exercise_type: string
  label_en: string
  label_vi: string
  correct: number
  total: number
  percent: number
  status: 'excellent' | 'good' | 'needs_improvement'
}

export interface WrongAnswerItem {
  question_number: number
  question_text: string
  exercise_type: string
  user_answer: string
  correct_answer: string
  explanation?: string
  explanation_vi?: string
  // AI enhancement fields (populated async)
  why_wrong?: string
  why_correct?: string
  recommended_topic?: string
  study_focus?: string
  trap_identified?: string
}

export interface AIReadingExplanation {
  summary?: string
  overall_advice?: string
  explanations?: WrongAnswerItem[]
}

export interface ReadingAttemptResultEnhanced {
  // Basic stats
  attempt_id: string
  score_percent: number
  correct_count: number
  total_questions: number
  time_spent_seconds: number

  // Passage info
  passage_id: string
  passage_title: string
  passage_title_vi?: string
  reading_type?: string
  cefr_level?: string
  difficulty_level?: string

  // Context info
  context?: ContextInfo

  // Skill breakdown
  skill_breakdown: SkillBreakdownItem[]

  // Wrong answers
  wrong_answers: WrongAnswerItem[]
  wrong_count: number

  // AI explanation status
  ai_explanation_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | null

  // Weakest area
  weakest_skill?: string
  weakest_skill_vi?: string

  // Profile update status
  profile_updated: boolean
}

// ============================================================================
// Reading Skill Profile Types
// ============================================================================

export interface ReadingSkillProfile {
  // Overview
  total_attempts: number
  total_questions: number
  overall_accuracy: number
  avg_score_percent: number
  estimated_cefr: string

  // Weekly trend
  weekly_accuracy: number[]
  weekly_trend: 'IMPROVING' | 'STABLE' | 'DECLINING'

  // By passage type
  by_passage_type: Record<string, {
    total: number
    correct: number
    accuracy: number
  }>

  // By CEFR level
  by_level: Record<string, {
    total: number
    correct: number
    accuracy: number
  }>

  // By reading skill
  by_skill: Record<string, {
    correct: number
    total: number
    accuracy: number
  }>

  // By context (NEW)
  by_context: Record<string, {
    context_name: string
    context_name_vi?: string
    context_code: string
    total_passages: number
    total_attempts: number
    correct: number
    accuracy: number
    last_practiced_at?: Date
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING'
  }>

  // Weaknesses
  weakest_skill?: string
  weakest_skill_vi?: string
  weakest_contexts: Array<{
    context_id: string
    context_name: string
    context_name_vi?: string
    accuracy: number
    total_attempts: number
    recommended_action: string
  }>
}
