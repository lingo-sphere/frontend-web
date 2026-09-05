/**
 * @file practice.service.ts
 * @description Service xử lý các logic nghiệp vụ chính cho dịch vụ practice
 */

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import {
  BackendListeningExerciseSchema,
  BackendListeningExerciseListSchema,
  BackendSpeakingExerciseSchema,
  BackendSpeakingExerciseListSchema,
  BackendWritingExerciseSchema,
  BackendWritingExerciseListSchema,
  SpeechAssessmentResultSchema,
  WritingEvaluationResponseSchema,
  DailyJournalPromptSchema,
  type BackendListeningExercise,
  type BackendSpeakingExercise,
  type BackendWritingExercise,
  type SpeechAssessmentResult,
  type WritingEvaluationResponse,
  type DailyJournalPrompt,
} from '@/schemas/practice.schema'

export type {
  BackendListeningExercise,
  BackendSpeakingExercise,
  BackendWritingExercise,
  SpeechAssessmentResult,
  WritingEvaluationResponse,
  DailyJournalPrompt,
}

export const practiceService = {
  async getListeningExercises(params?: { part?: number; level?: string }): Promise<BackendListeningExercise[]> {
    return api.get<BackendListeningExercise[]>(
      API_CONFIG.ENDPOINTS.PRACTICE.LISTENING,
      params as Record<string, unknown>,
      BackendListeningExerciseListSchema
    )
  },

  async getListeningExerciseById(id: string): Promise<BackendListeningExercise> {
    return api.get<BackendListeningExercise>(
      API_CONFIG.ENDPOINTS.PRACTICE.LISTENING_BY_ID(id),
      undefined,
      BackendListeningExerciseSchema
    )
  },

  async submitListeningDictation(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return api.post(API_CONFIG.ENDPOINTS.PRACTICE.LISTENING_DICTATION_SUBMIT, payload)
  },

  async getSpeakingExercises(params?: { part?: number }): Promise<BackendSpeakingExercise[]> {
    return api.get<BackendSpeakingExercise[]>(
      API_CONFIG.ENDPOINTS.PRACTICE.SPEAKING,
      params as Record<string, unknown>,
      BackendSpeakingExerciseListSchema
    )
  },

  async getSpeakingExerciseById(id: string): Promise<BackendSpeakingExercise> {
    return api.get<BackendSpeakingExercise>(
      API_CONFIG.ENDPOINTS.PRACTICE.SPEAKING_BY_ID(id),
      undefined,
      BackendSpeakingExerciseSchema
    )
  },

  async evaluateSpeakingAudio(audioBlob: Blob, exerciseId?: string, topic?: string): Promise<SpeechAssessmentResult> {
    const params: Record<string, string> = {}
    if (exerciseId) params.exercise_id = exerciseId
    if (topic) params.topic = topic

    return api.upload<SpeechAssessmentResult>(
      API_CONFIG.ENDPOINTS.PRACTICE.SPEAKING_EVALUATE,
      audioBlob,
      params,
      undefined,
      SpeechAssessmentResultSchema
    )
  },

  async submitSpeakingAttempt(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return api.post(API_CONFIG.ENDPOINTS.PRACTICE.SPEAKING_SUBMIT, payload)
  },

  async getWritingExercises(): Promise<BackendWritingExercise[]> {
    return api.get<BackendWritingExercise[]>(
      API_CONFIG.ENDPOINTS.PRACTICE.WRITING,
      undefined,
      BackendWritingExerciseListSchema
    )
  },

  async getWritingExerciseById(id: string): Promise<BackendWritingExercise> {
    return api.get<BackendWritingExercise>(
      API_CONFIG.ENDPOINTS.PRACTICE.WRITING_BY_ID(id),
      undefined,
      BackendWritingExerciseSchema
    )
  },

  async evaluateWritingEssay(essay: string, topic: string): Promise<WritingEvaluationResponse> {
    return api.post<WritingEvaluationResponse>(
      API_CONFIG.ENDPOINTS.PRACTICE.WRITING_EVALUATE,
      {
        essay_text: essay,
        topic: topic,
      },
      WritingEvaluationResponseSchema
    )
  },

  async submitWritingSubmission(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return api.post(API_CONFIG.ENDPOINTS.PRACTICE.WRITING_SUBMIT, payload)
  },

  async getDailyJournalPrompt(): Promise<DailyJournalPrompt> {
    return api.get<DailyJournalPrompt>(API_CONFIG.ENDPOINTS.PRACTICE.DAILY_PROMPT, undefined, DailyJournalPromptSchema)
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
