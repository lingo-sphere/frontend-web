/**
 * @file practice.service.ts
 * @description Service xử lý các logic nghiệp vụ chính cho dịch vụ practice
 */

import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { SpeechAssessmentResult } from '@/types/api.types'

export interface BackendListeningExercise {
  _id: string
  title: string
  title_vi?: string
  description?: string
  description_vi?: string
  domain: string
  toeic_part?: number
  media_id: string
  media_type: string
  duration_seconds: number
  transcript?: string
  difficulty_level: string
  cefr_level: string
  status: string
}

export interface BackendSpeakingExercise {
  _id: string
  title: string
  title_vi?: string
  description?: string
  description_vi?: string
  domain: string
  toeic_part?: number
  exercise_type: string
  prompt_text_en?: string
  prompt_text_vi?: string
  preparation_time_seconds: number
  response_time_seconds: number
  difficulty_level: string
  cefr_level: string
  status: string
}

export interface BackendWritingExercise {
  _id: string
  title: string
  title_vi?: string
  description?: string
  description_vi?: string
  domain: string
  toeic_part?: number
  exercise_type: string
  writing_level: string
  prompt_en: string
  prompt_vi?: string
  min_words?: number
  max_words?: number
  difficulty_level: string
  cefr_level: string
  status: string
}

export const practiceService = {
  async getListeningExercises(params?: { part?: number; level?: string }): Promise<BackendListeningExercise[]> {
    return api.get<BackendListeningExercise[]>(API_CONFIG.ENDPOINTS.PRACTICE.LISTENING, params)
  },

  async getListeningExerciseById(id: string): Promise<BackendListeningExercise> {
    return api.get<BackendListeningExercise>(API_CONFIG.ENDPOINTS.PRACTICE.LISTENING_BY_ID(id))
  },

  async submitListeningDictation(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return api.post(API_CONFIG.ENDPOINTS.PRACTICE.LISTENING_DICTATION_SUBMIT, payload)
  },

  async getSpeakingExercises(params?: { part?: number }): Promise<BackendSpeakingExercise[]> {
    return api.get<BackendSpeakingExercise[]>(API_CONFIG.ENDPOINTS.PRACTICE.SPEAKING, params)
  },

  async getSpeakingExerciseById(id: string): Promise<BackendSpeakingExercise> {
    return api.get<BackendSpeakingExercise>(API_CONFIG.ENDPOINTS.PRACTICE.SPEAKING_BY_ID(id))
  },

  async evaluateSpeakingAudio(audioBlob: Blob, exerciseId?: string, topic?: string): Promise<SpeechAssessmentResult> {
    const params: Record<string, string> = {}
    if (exerciseId) params.exercise_id = exerciseId
    if (topic) params.topic = topic

    return api.upload<SpeechAssessmentResult>(
      API_CONFIG.ENDPOINTS.PRACTICE.SPEAKING_EVALUATE,
      audioBlob,
      params,
    )
  },

  async submitSpeakingAttempt(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return api.post(API_CONFIG.ENDPOINTS.PRACTICE.SPEAKING_SUBMIT, payload)
  },

  async getWritingExercises(): Promise<BackendWritingExercise[]> {
    return api.get<BackendWritingExercise[]>(API_CONFIG.ENDPOINTS.PRACTICE.WRITING)
  },

  async getWritingExerciseById(id: string): Promise<BackendWritingExercise> {
    return api.get<BackendWritingExercise>(API_CONFIG.ENDPOINTS.PRACTICE.WRITING_BY_ID(id))
  },

  async evaluateWritingEssay(essay: string, topic: string): Promise<{
    grammar_score: number
    vocabulary_score: number
    coherence_score: number
    overall_score: number
    feedback_vi: string
    improved_essay: string
  }> {
    return api.post(API_CONFIG.ENDPOINTS.PRACTICE.WRITING_EVALUATE, {
      essay_text: essay,
      topic: topic,
    })
  },

  async submitWritingSubmission(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return api.post(API_CONFIG.ENDPOINTS.PRACTICE.WRITING_SUBMIT, payload)
  },

  async getDailyJournalPrompt(): Promise<{ id: string; topic_vi: string; topic_en: string; date: string }> {
    return api.get(API_CONFIG.ENDPOINTS.PRACTICE.DAILY_PROMPT)
  },

  async submitDailyJournal(payload: { entry_text: string; prompt_id?: string; mood?: string }): Promise<Record<string, unknown>> {
    return api.post(API_CONFIG.ENDPOINTS.PRACTICE.DAILY_JOURNAL_SUBMIT, payload)
  },

  async getDailyJournalHistory(params?: { limit?: number }): Promise<Array<Record<string, unknown>>> {
    return api.get<Array<Record<string, unknown>>>(API_CONFIG.ENDPOINTS.PRACTICE.DAILY_JOURNAL_HISTORY, params)
  },

  async getUserPracticeProfile(): Promise<Record<string, unknown>> {
    return api.get<Record<string, unknown>>(API_CONFIG.ENDPOINTS.PRACTICE.MY_PRACTICE_PROFILE)
  },
}
