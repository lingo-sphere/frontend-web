/**
 * @file pronunciation.service.ts
 * @description Service xử lý API cho Phoneme Mastery và Pronunciation Practice
 */

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'

export interface PhonemeRecentEvent {
  date: string
  source: 'IPA_LISTEN' | 'IPA_MINIMAL_PAIR' | 'IPA_RECOGNIZE' | 'IPA_RECORD' | 'SPEAKING'
  result: 'CORRECT' | 'INCORRECT'
  delta: number
  context_word?: string
}

export interface PhonemeSkillItem {
  phoneme: string
  mastery_score: number
  perception_score: number
  recognition_score: number
  production_score: number
  speaking_score: number
  status: 'NOT_STARTED' | 'CRITICAL' | 'WEAK' | 'DEVELOPING' | 'STRONG' | 'MASTERED'
  top_substitution?: string
  speaking_error_count: number
  speaking_success_count: number
  last_practiced_at?: string
  recent_events: PhonemeRecentEvent[]
  evidence_stats?: {
    total_attempts?: number
    correct_attempts?: number
    practiced_positions?: Array<'INITIAL' | 'MEDIAL' | 'FINAL'>
    exercised_types?: string[]
    distinct_words?: string[]
    active_dates?: string[]
  }
}

export interface PhonemeMasteryResponse {
  user_id: string
  overall_speaking_score: number
  phoneme_skills: Record<string, PhonemeSkillItem>
  top_chronic_phonemes: Array<{
    expected_phoneme: string
    actual_phoneme: string
    frequency: number
  }>
  last_calculated_at?: string
}

export interface MinimalPairData {
  word_a: string
  word_b: string
  ipa_a: string
  ipa_b: string
  phoneme_contrast: string
  audio_a?: string
  audio_b?: string
}

export interface PronunciationExerciseItem {
  _id: string
  id?: string
  title: string
  title_vi?: string
  domain: string
  exercise_type: string
  prompt_text?: string
  prompt_text_vi?: string
  instruction?: string
  instruction_vi?: string
  target_phonemes: string[]
  target_words: string[]
  target_ipa?: string
  minimal_pair?: MinimalPairData
  options?: string[]
  correct_answer?: string
  audio_id?: string
  difficulty_level: string
  cefr_level: string
}

export interface ChronicPhonemeWeakness {
  expected: string
  actual: string
  frequency: number
  last_occurred_at: string
}

export interface PhonemeBehaviorStats {
  total_attempts: number
  avg_replays_per_question: number
  avg_time_spent_seconds: number
  first_listen_accuracy: number
  top_replayed_phonemes: Array<{
    phoneme: string
    avg_replays: number
    attempts: number
  }>
}

export interface RecentPronunciationAttemptItem {
  _id: string
  exercise_id: string
  title: string
  exercise_type: string
  target_phonemes: string[]
  target_words: string[]
  target_ipa: string
  user_answer: string
  correct_answer: string
  actual_phoneme?: string
  is_correct: boolean
  score: number
  audio_replays_count: number
  time_spent_seconds: number
  completed_at: string
}

export interface PronunciationAnalyticsResponse {
  chronic_phonemes: ChronicPhonemeWeakness[]
  behavior_stats: PhonemeBehaviorStats
  recent_history: RecentPronunciationAttemptItem[]
}

export interface SubmitPronunciationDto {
  exercise_id: string
  user_selected_option?: string
  user_guess?: string
  user_transcription?: string
  audio_replays_count?: number
  time_spent_seconds?: number
  actual_phoneme?: string
  preparation_time_seconds?: number
  recording_time_seconds?: number
  ai_evaluation?: {
    overall_score: number
    pronunciation_score: number
  }
}

export const pronunciationService = {
  async getPhonemeMastery(userId: string): Promise<PhonemeMasteryResponse> {
    return api.get<PhonemeMasteryResponse>(
      API_CONFIG.ENDPOINTS.PRACTICE.PRONUNCIATION_MASTERY(userId)
    )
  },

  async getRecommendations(userId: string): Promise<{
    recommendations: PhonemeSkillItem[]
    chronic_errors: Array<{ expected_phoneme: string; actual_phoneme: string; frequency: number }>
  }> {
    return api.get<{
      recommendations: PhonemeSkillItem[]
      chronic_errors: Array<{ expected_phoneme: string; actual_phoneme: string; frequency: number }>
    }>(API_CONFIG.ENDPOINTS.PRACTICE.PRONUNCIATION_RECOMMENDATIONS(userId))
  },

  async getPhonemeAnalytics(userId: string): Promise<PronunciationAnalyticsResponse> {
    return api.get<PronunciationAnalyticsResponse>(
      API_CONFIG.ENDPOINTS.PRACTICE.PRONUNCIATION_ANALYTICS(userId)
    )
  },

  async getPracticeSession(
    userId: string,
    params?: { phoneme?: string; mode?: string; size?: number }
  ): Promise<PronunciationExerciseItem[]> {
    return api.get<PronunciationExerciseItem[]>(
      API_CONFIG.ENDPOINTS.PRACTICE.PRONUNCIATION_SESSION(userId),
      params as Record<string, unknown>
    )
  },

  async submitAttempt(userId: string, dto: SubmitPronunciationDto): Promise<any> {
    return api.post<any>(
      API_CONFIG.ENDPOINTS.PRACTICE.PRONUNCIATION_SUBMIT(userId),
      dto
    )
  },
}

