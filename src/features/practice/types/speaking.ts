/**
 * @file speaking.ts
 * @description Định nghĩa kiểu dữ liệu TypeScript cho hệ thống giao diện Web
 */

export type SpeakingExerciseType =
  | 'READ_ALOUD'
  | 'DESCRIBE_PICTURE'
  | 'SHORT_DIALOGUE'
  | 'ANSWER_QUESTION'
  | 'OPINION_RESPONSE'
  | 'TOPIC'
  | 'RESPOND_SITUATION'
  | 'PRONUNCIATION'
  | 'SHADOWING'

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD'
export type SpeakingStatus = 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED'

export interface DialogueTurn {
  turn_number: number
  speaker: 'AI' | 'USER'
  speaker_name: string
  prompt_audio_id?: string
  text_en: string
  text_vi?: string
  user_guidance?: {
    goal_vi: string
    turn_goal_vi?: string
    suggested_phrases?: string[]
    expected_keywords?: string[]
  }
}

export interface DialogueScenario {
  setting: string
  setting_vi?: string
  user_role: string
  ai_role: string
  overall_goals_vi?: string[]
  turns: DialogueTurn[]
}

export interface DialogueTurnAttemptResult {
  turn_number: number
  user_transcription?: string
  recording_media_id?: string
  recording_storage_key?: string
  audio_url?: string
  response_latency_seconds?: number
  speaking_duration_seconds?: number
  silence_duration_seconds?: number
  goal_accomplished?: 'YES' | 'PARTIAL' | 'NO'
  pronunciation_score?: number
  accuracy_score?: number
  turn_fluency_score?: number
  turn_grammar_feedback?: string
  better_alternative?: string
  feedback?: string
}

export interface TieredTimeLimit {
  preparation_time_seconds: number
  response_time_seconds: number
  show_hints?: boolean
  max_record_attempts?: number
}

export interface SpeakingTimeConfiguration {
  easy?: TieredTimeLimit
  medium?: TieredTimeLimit
  hard?: TieredTimeLimit
}

export interface SpeakingExercise {
  id: string
  _id?: string
  title: string
  title_vi?: string
  description?: string
  description_vi?: string
  domain: 'SPEAKING'
  toeic_part?: number

  exercise_type: SpeakingExerciseType
  context_path?: string[]

  prompt_text_en?: string
  prompt_text_vi?: string
  prompt_media_id?: string

  reference_media_id?: string
  reference_transcript?: string

  source_text?: string
  source_text_vi?: string

  dialogue_scenario?: DialogueScenario | null
  tiered_time_limits?: SpeakingTimeConfiguration | null

  target_lexical_item_ids?: string[]
  target_ipa_symbol_ids?: string[]
  target_grammar_point_ids?: string[]
  target_phonetics_knowledge_ids?: string[]

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
  audio_url?: string

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
  difficulty_chosen?: DifficultyLevel
  dialogue_turns_results?: DialogueTurnAttemptResult[]

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

export interface PhonemeErrorDetail {
  phoneme_expected: string
  phoneme_actual: string
  word: string
  frequency: number
  position_in_word?: string
  confidence_score?: number
}

export interface GrammarCategorizedIssue {
  category: string
  error_count: number
  examples: Array<{
    sentence: string
    suggested_correction: string
    explanation: string
  }>
}

export interface SpeakingAnalysis {
  _id: string
  attempt_id: string
  user_id: string
  exercise_id: string
  overall_score: number
  cefr_assessed?: string

  pronunciation: {
    overall_score: number
    phoneme_accuracy: number
    word_accuracy: number
    stress_accuracy?: number
    phoneme_errors: PhonemeErrorDetail[]
    mispronounced_words: Array<{ word: string; phoneme_expected: string; phoneme_actual: string }>
  }

  fluency: {
    overall_score: number
    speech_rate_wpm: number
    total_pauses: number
    long_pauses_count: number
    avg_pause_duration_ms?: number
    hesitation_score?: number
    repetition_count?: number
  }

  grammar: {
    overall_score: number
    errors_by_category: GrammarCategorizedIssue[]
    chronic_error_flags: string[]
  }

  vocabulary: {
    overall_score: number
    lexical_diversity_ttr?: number
    distribution: {
      A1: number
      A2: number
      B1: number
      B2: number
      C1: number
      C2: number
    }
    repeated_words: Array<{ word: string; count: number }>
    inappropriate_usages: Array<{ word: string; context: string; suggestion: string }>
  }

  task_achievement: {
    overall_score: number
    covered_ideas: string[]
    missing_ideas: string[]
    task_completion_ratio: number
  }

  naturalness: {
    overall_score: number
    vietnamese_transfer_tendencies: string[]
    awkward_expressions: Array<{
      awkward_phrase: string
      natural_alternative: string
      explanation: string
    }>
    register_appropriateness?: string
  }

  pedagogical_feedback: {
    summary_vi: string
    key_strengths_vi: string[]
    priority_improvements_vi: string[]
    next_actionable_drills: string[]
  }

  created_at: string
}

export interface UserSpeakingProfile {
  _id: string
  user_id: string
  total_attempts: number
  total_speaking_duration_seconds: number
  overall_proficiency_score: number
  estimated_speaking_cefr: string

  radar_scores: {
    pronunciation: number
    fluency: number
    grammar: number
    vocabulary: number
    task_achievement: number
    naturalness: number
  }

  chronic_weaknesses: {
    top_phoneme_errors: Array<{
      phoneme_pair: string
      error_count: number
      last_observed: string
      suggested_drill_ids?: string[]
    }>
    top_grammar_issues: Array<{
      category: string
      error_count: number
    }>
    top_fluency_bottlenecks: string[]
  }

  best_sample_audio_url?: string
  best_sample_score?: number
  best_sample_exercise_title?: string

  practice_efficiency?: {
    first_take_avg_score: number
    best_take_avg_score: number
    score_gain_avg: number
    total_exercises_attempted: number
    total_retries_count: number
  }

  speaking_modes_lens?: {
    controlled_avg_score: number
    controlled_attempts: number
    spontaneous_avg_score: number
    spontaneous_attempts: number
    pedagogical_interpretation_vi: string
  }

  fluency_trends?: Array<{
    date: string
    exercise_type: string
    wpm: number
    pause_count: number
    long_pauses: number
  }>

  remedial_recommendations?: Array<{
    title: string
    reason_vi: string
    target_domain: 'SPEAKING' | 'PRONUNCIATION' | 'GRAMMAR'
    exercise_type?: string
    action_type: string
  }>

  updated_at: string
}

