/**
 * @file practice.service.ts
 * @description Service xử lý các logic nghiệp vụ chính cho dịch vụ practice
 */

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import {
  BackendListeningExerciseSchema,
  BackendListeningExercisePaginatedSchema,
  BackendListeningPracticeItemPaginatedSchema,
  BackendSpeakingExerciseSchema,
  BackendSpeakingExerciseListSchema,
  BackendWritingExerciseSchema,
  BackendWritingExerciseListSchema,
  SpeechAssessmentResultSchema,
  WritingEvaluationResponseSchema,
  type BackendListeningExercise,
  type BackendListeningPracticeItem,
  type BackendListeningPracticeItemPaginated,
  type BackendSpeakingExercise,
  type BackendWritingExercise,
  type SpeechAssessmentResult,
  type WritingEvaluationResponse,
} from '@/features/practice/schemas/practice.schema'

export type {
  BackendListeningExercise,
  BackendListeningPracticeItem,
  BackendListeningPracticeItemPaginated,
  BackendSpeakingExercise,
  BackendWritingExercise,
  SpeechAssessmentResult,
  WritingEvaluationResponse,
}

export const practiceService = {
  async getListeningExercises(params?: { part?: number; level?: string; page?: number; limit?: number }): Promise<BackendListeningExercise[]> {
    const response = await api.get<{ items: BackendListeningExercise[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
      API_CONFIG.ENDPOINTS.PRACTICE.LISTENING,
      params as Record<string, unknown>,
      BackendListeningExercisePaginatedSchema
    )
    return response?.items || []
  },

  async getListeningPracticeItems(params?: { difficulty?: string; contextId?: string; cefrLevel?: string; page?: number; limit?: number }): Promise<BackendListeningPracticeItemPaginated> {
    return api.get<BackendListeningPracticeItemPaginated>(
      API_CONFIG.ENDPOINTS.PRACTICE.LISTENING_PRACTICE_ITEMS,
      params as Record<string, unknown>,
      BackendListeningPracticeItemPaginatedSchema
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

  async getMyWritingSubmissions(exerciseId?: string): Promise<any> {
    const url = exerciseId
      ? `${API_CONFIG.ENDPOINTS.PRACTICE.WRITING_MY_SUBMISSIONS}?exercise_id=${exerciseId}`
      : API_CONFIG.ENDPOINTS.PRACTICE.WRITING_MY_SUBMISSIONS;
    return api.get<any>(url);
  },

  async getWritingSubmissionById(id: string): Promise<any> {
    return api.get<any>(API_CONFIG.ENDPOINTS.PRACTICE.WRITING_SUBMISSION_BY_ID(id));
  },

  async getSubmissionComparison(id: string): Promise<any> {
    return api.get<any>(API_CONFIG.ENDPOINTS.PRACTICE.WRITING_SUBMISSION_COMPARISON(id));
  },

  async getWritingRecommendations(userId: string, limit = 4): Promise<any> {
    return api.get<any>(`${API_CONFIG.ENDPOINTS.PRACTICE.WRITING_RECOMMENDATIONS(userId)}?limit=${limit}`);
  },
};
