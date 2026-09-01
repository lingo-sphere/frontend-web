/**
 * @file speaking.ts
 * @description Định nghĩa kiểu dữ liệu TypeScript cho hệ thống giao diện Web
 */

export type SpeakingExerciseType = 'TOPIC' | 'RESPOND_SITUATION' | 'PRONUNCIATION' | 'READ_ALOUD' | 'SHADOWING'
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD'
export type SpeakingStatus = 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED'

export interface SpeakingExercise {
  id: string
  title: string
  title_vi?: string
  description?: string
  description_vi?: string
  domain: 'SPEAKING'
  toeic_part?: number

  exercise_type: SpeakingExerciseType

  prompt_text_en?: string
  prompt_text_vi?: string
  prompt_media_id?: string

  reference_media_id?: string

  source_text?: string
  source_text_vi?: string

  target_lexical_item_ids?: string[]
  target_ipa_symbol_ids?: string[]
  target_grammar_point_ids?: string[]

  expected_keywords?: string[]
  expected_structure?: string[]

  rubric?: SpeakingRubric
  max_score?: number

  preparation_time_seconds?: number
  response_time_seconds?: number
  topic?: string
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

export interface SpeakingRubric {
  pronunciation?: { weight: number; criteria: string[] }
  fluency?: { weight: number; criteria: string[] }
  grammar?: { weight: number; criteria: string[] }
  vocabulary?: { weight: number; criteria: string[] }
  coherence?: { weight: number; criteria: string[] }
  content?: { weight: number; criteria: string[] }
}

export interface SpeakingAttempt {
  id: string
  user_id: string
  exercise_id: string
  session_id?: string

  recording_media_id?: string
  recording_duration_seconds?: number

  transcription?: string
  transcription_confidence?: number

  ai_evaluation?: AIEvaluationResult
  pronunciation_score?: number
  fluency_score?: number
  grammar_score?: number
  vocabulary_score?: number
  coherence_score?: number
  content_score?: number
  overall_score?: number

  preparation_time_seconds?: number
  speaking_time_seconds?: number
  attempt_number: number
  is_best_attempt: boolean

  domain: 'SPEAKING'
  status: SpeakingStatus
  completed_at?: string
  created_at: string

  exercise?: SpeakingExercise
}

export interface AIEvaluationResult {
  overall_feedback: string
  pronunciation_analysis?: {
    score: number
    issues: string[]
    suggestions: string[]
  }
  fluency_analysis?: {
    score: number
    issues: string[]
    suggestions: string[]
  }
  grammar_analysis?: {
    score: number
    issues: string[]
    suggestions: string[]
  }
  vocabulary_analysis?: {
    score: number
    issues: string[]
    suggestions: string[]
  }
  coherence_analysis?: {
    score: number
    issues: string[]
    suggestions: string[]
  }
  content_analysis?: {
    score: number
    issues: string[]
    suggestions: string[]
  }
  improvement_tips?: string[]
  ai_model?: string
  processing_time_ms?: number
}

export interface SpeakingStats {
  total_attempts: number
  average_score: number
  average_pronunciation: number
  average_fluency: number
  average_grammar: number
  average_vocabulary: number
  average_coherence: number
  average_content: number
  total_practice_minutes: number
  best_streak: number
}

export interface SpeakingProgress {
  pronunciation: number
  fluency: number
  grammar: number
  vocabulary: number
  weakest_area: string
  recommended_exercises: string[]
}

export type RecordingPhase = 'idle' | 'preparing' | 'recording' | 'reviewing'

export interface RecordingState {
  phase: RecordingPhase
  preparationTimeLeft: number
  speakingTimeLeft: number
  duration: number
  audioUrl: string | null
  isPlaying: boolean
  playbackPosition: number
}
