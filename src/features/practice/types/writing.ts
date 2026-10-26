/**
 * @file writing.ts
 * @description Định nghĩa kiểu dữ liệu TypeScript cho hệ thống giao diện Web
 */

export type WritingLevel = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED'
export type ExerciseType = 'DESCRIBE_PICTURE' | 'WRITE_EMAIL' | 'EXPRESS_OPINION' | 'SENTENCE_ARRANGEMENT' | 'SENTENCE_COMPLETION' | 'PARAPHRASING' | 'KEYWORD_WRITING' | 'TOPIC_WRITING' | 'DIARY'
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD'
export type SubmissionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED'

// Time mode cho luyện writing
export type TimeMode = 'fast' | 'normal' | 'slow'

export interface TimeModeConfig {
  mode: TimeMode
  label: string
  labelVi: string
  description: string
  descriptionVi: string
  seconds: number
}

// Config thời gian theo exercise type (seconds)
export const WRITING_TIME_CONFIGS: Record<ExerciseType, { fast: number; normal: number; slow: number }> = {
  DESCRIBE_PICTURE: { fast: 5 * 60, normal: 8 * 60, slow: 12 * 60 },     // 5/8/12 phút
  WRITE_EMAIL: { fast: 7 * 60, normal: 10 * 60, slow: 15 * 60 },           // 7/10/15 phút
  EXPRESS_OPINION: { fast: 12 * 60, normal: 15 * 60, slow: 20 * 60 },       // 12/15/20 phút
  SENTENCE_ARRANGEMENT: { fast: 5 * 60, normal: 8 * 60, slow: 10 * 60 },    // 5/8/10 phút
  SENTENCE_COMPLETION: { fast: 5 * 60, normal: 8 * 60, slow: 10 * 60 },     // 5/8/10 phút
  PARAPHRASING: { fast: 5 * 60, normal: 8 * 60, slow: 12 * 60 },            // 5/8/12 phút
  KEYWORD_WRITING: { fast: 8 * 60, normal: 10 * 60, slow: 15 * 60 },       // 8/10/15 phút
  TOPIC_WRITING: { fast: 12 * 60, normal: 15 * 60, slow: 20 * 60 },        // 12/15/20 phút
  DIARY: { fast: 10 * 60, normal: 15 * 60, slow: 20 * 60 },                // 10/15/20 phút
}

export const TIME_MODE_OPTIONS: TimeModeConfig[] = [
  {
    mode: 'fast',
    label: 'Nhanh',
    labelVi: 'Nhanh',
    description: 'Luyện tốc độ',
    descriptionVi: 'Luyện tốc độ',
    seconds: 0, // Sẽ được set theo exercise type
  },
  {
    mode: 'normal',
    label: 'Bình thường',
    labelVi: 'Bình thường',
    description: 'Tiêu chuẩn',
    descriptionVi: 'Tiêu chuẩn',
    seconds: 0,
  },
  {
    mode: 'slow',
    label: 'Chậm',
    labelVi: 'Chậm',
    description: 'Tập trung chất lượng',
    descriptionVi: 'Tập trung chất lượng',
    seconds: 0,
  },
]

export interface WritingExercise {
  grading_standard?: 'PRACTICAL' | 'TOEIC'
  task_requirements?: string[]
  image_description?: string
  id: string
  code?: string
  title: string
  title_vi?: string
  description?: string
  description_vi?: string
  domain: 'WRITING'
  toeic_part?: number
  exercise_type: ExerciseType
  writing_level: WritingLevel

  prompt?: string
  source_text?: string
  source_text_vi?: string
  prompt_en?: string
  prompt_vi?: string
  instructions?: string

  prompt_image_id?: string
  media_id?: string
  reference_media_id?: string
  directions?: string[]
  directions_vi?: string[]
  incoming_email?: { from?: string; to?: string; subject?: string; date?: string; body?: string }
  background_context?: string
  background_context_vi?: string
  guiding_questions?: string[]
  guiding_questions_vi?: string[]

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

export interface ScaffoldBlock {
  key: string
  title: string
  title_vi?: string
  prompt: string
  prompt_vi?: string
  guiding_questions?: string[]
  sentence_starters?: string[]
  target_words?: string[]
  min_words?: number
}

export interface ScaffoldTemplate {
  template_type: string
  title: string
  title_vi?: string
  instruction?: string
  instruction_vi?: string
  blocks: ScaffoldBlock[]
}

export interface SubmissionComparison {
  has_comparison: boolean
  message?: string
  v1?: WritingSubmission
  v2?: WritingSubmission
  delta?: {
    overall_score?: number
    task_achievement_score?: number | null
    grammatical_accuracy_score?: number | null
    lexical_resource_score?: number | null
    coherence_score?: number | null
    naturalness_score?: number | null
    register_score?: number | null
    word_count?: number
  }
  summary?: string
}

export interface WritingSubmission {
  writing_srs_version?: number
  writing_srs_summary?: Array<{ key: string; outcome: string; credited: boolean; reason: string }>
  grading_standard?: 'PRACTICAL' | 'TOEIC'
  grading_version?: string
  raw_score?: number
  max_score?: number
  grading_model?: string
  naturalness_score?: number | null
  register_score?: number | null
  parent_submission_id?: string
  scaffold_blocks?: Array<{ block_id: string; title: string; content: string }>
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
  task_achievement_score?: number | null
  coherence_score?: number | null
  lexical_resource_score?: number | null
  grammatical_accuracy_score?: number | null

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
  rubric_snapshot?: { standard: string; max_score: number; bands: string[]; weights: Record<string, number>; version: string }
  score_reason?: string
  grading_version?: string
  grading_standard?: 'PRACTICAL' | 'TOEIC'
  criteria_feedback?: Record<string, { comment: string; evidence: string[] }>


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

  criteria_scores?: {
    task_achievement?: number | null
    grammatical_accuracy?: number | null
    lexical_resource?: number | null
    coherence?: number | null
    naturalness?: number | null
    register?: number | null
  }
  scaffold_template?: ScaffoldTemplate
  naturalness_feedback?: string
  register_feedback?: string
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
  practical_submissions?: number
  score_groups?: Array<{ _id: { standard: string; type: string; version: string; max_score: number }; count: number; average: number }>

  total_submissions: number
  /** Average overall score on a 0-100 scale (matches backend AI evaluation scale). */
  average_score: number | null
  total_words_written: number
  /** Average grammar accuracy on a 0-100 scale. */
  average_grammar_accuracy: number | null
  /** Average vocabulary usage on a 0-100 scale. */
  average_vocabulary_usage: number | null
  average_writing_time_minutes: number
  /** All AI sub-scores on a 0-100 scale. */
  score_breakdown: {
    task_achievement: number | null
    coherence: number | null
    vocabulary: number | null
    grammar: number | null
    naturalness: number | null
    register: number | null
  }
}

// ============================================================================
// WRITING RECOMMENDATION TYPES (Option B)
// ============================================================================

/** All possible writing skill types */
export type WritingSkillType =
  | 'task_achievement'
  | 'coherence'
  | 'lexical_resource'
  | 'grammatical_accuracy'
  | 'naturalness'
  | 'register'

/** Reason for recommending an exercise */
export type RecommendationReason =
  | 'weakest_skill'
  | 'weakest_context'
  | 'same_skill_context'
  | 'diversify_skill'
  | 'diversify_context'
  | 'skill_improvement'
  | 'new_user'

/** Reason labels for display */
export const REASON_LABELS: Record<RecommendationReason, { vi: string; en: string }> = {
  weakest_skill: { vi: 'Luyện điểm yếu', en: 'Practice weakest skill' },
  weakest_context: { vi: 'Cải thiện ngữ cảnh', en: 'Improve weak context' },
  same_skill_context: { vi: 'Rèn luyện chuyên sâu', en: 'Deep practice' },
  diversify_skill: { vi: 'Đa dạng kỹ năng', en: 'Skill diversity' },
  diversify_context: { vi: 'Mở rộng ngữ cảnh', en: 'New context' },
  skill_improvement: { vi: 'Nâng cao kỹ năng', en: 'Skill improvement' },
  new_user: { vi: 'Bắt đầu luyện tập', en: 'Get started' },
}

/** Skill labels for display */
export const SKILL_LABELS: Record<WritingSkillType, { vi: string; en: string }> = {
  task_achievement: { vi: 'Hoàn thành nhiệm vụ', en: 'Task Achievement' },
  coherence: { vi: 'Mạch lạc', en: 'Coherence' },
  lexical_resource: { vi: 'Từ vựng', en: 'Vocabulary' },
  grammatical_accuracy: { vi: 'Ngữ pháp', en: 'Grammar' },
  naturalness: { vi: 'Tự nhiên', en: 'Naturalness' },
  register: { vi: 'Phong cách', en: 'Register' },
}

/** A single writing recommendation */
export interface WritingRecommendation {
  exercise_id: string
  title: string
  title_vi?: string
  exercise_type: string
  context_id?: string
  context_name?: string
  cefr_level: string
  difficulty_level?: string
  prompt_text?: string
  min_words?: number
  max_words?: number

  // Recommendation metadata
  reason: RecommendationReason
  target_skill?: WritingSkillType
  confidence_score: number
  expected_score?: number
  user_attempts: number
  user_best_score?: number
}

/** Analysis of user's writing performance */
export interface WritingRecommendationAnalysis {
  sub_scores: {
    task_achievement: number
    coherence: number
    lexical_resource: number
    grammatical_accuracy: number
    naturalness: number
    register: number
    overall: number
    weakest_skill: WritingSkillType
  }
  context_performance: Array<{
    context_id: string
    context_name?: string
    submission_count: number
    avg_score: number
    skills: {
      task_achievement: number
      coherence: number
      lexical_resource: number
      grammatical_accuracy: number
      naturalness: number
      register: number
    }
  }>
  practiced_contexts: number
  practiced_types: string[]
  estimated_cefr?: string
  total_submissions: number
}

/** Complete recommendation response */
export interface WritingRecommendationResponse {
  recommendations: WritingRecommendation[]
  analysis: WritingRecommendationAnalysis
  total_available: number
}

export interface WritingProgress {
  grammar: number
  vocabulary: number
  coherence: number
  weakest_area: WritingSkillType
  weakest_context?: string
  recommendations: WritingRecommendation[]
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
