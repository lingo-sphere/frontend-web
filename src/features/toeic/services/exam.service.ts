// Xử lý API liên quan đến đề thi và bài làm TOEIC.

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import {
  BackendToeicExamSchema,
  BackendToeicExamListSchema,
  ExamResultSchema,
  ToeicLearningProfileSchema,
  type BackendToeicExam,
  type ExamResult,
  type ToeicLearningProfile,
} from '@/features/toeic/schemas/exam.schema'

export type { BackendToeicExam, ExamResult, ToeicLearningProfile }

export const examService = {
  async getExams(params?: { type?: string; year?: number; search?: string }): Promise<BackendToeicExam[]> {
    return api.get<BackendToeicExam[]>(
      API_CONFIG.ENDPOINTS.EXAMS.LIST,
      params as Record<string, unknown>,
      BackendToeicExamListSchema
    )
  },

  async getExamById(id: string): Promise<BackendToeicExam> {
    return api.get<BackendToeicExam>(
      API_CONFIG.ENDPOINTS.EXAMS.BY_ID(id),
      undefined,
      BackendToeicExamSchema
    )
  },

  async getToeicParts(): Promise<Array<Record<string, unknown>>> {
    return api.get<Array<Record<string, unknown>>>(API_CONFIG.ENDPOINTS.EXAMS.PARTS)
  },

  async startExamAttempt(examId: string, options?: Record<string, unknown>): Promise<{ attempt_id: string }> {
    return api.post<{ attempt_id: string }>(API_CONFIG.ENDPOINTS.EXAMS.START(examId), options)
  },

  async submitExamAttempt(
    attemptId: string,
    answers: Array<{ question_id: string; selected_option?: string }>,
    timeSpentSeconds?: number
  ): Promise<ExamResult> {
    return api.post<ExamResult>(
      API_CONFIG.ENDPOINTS.EXAMS.SUBMIT(attemptId),
      { answers, time_spent_seconds: timeSpentSeconds },
      ExamResultSchema
    )
  },

  async getExamAttemptResult(attemptId: string): Promise<ExamResult> {
    return api.get<ExamResult>(
      API_CONFIG.ENDPOINTS.EXAMS.RESULT(attemptId),
      undefined,
      ExamResultSchema
    )
  },

  async getMyExamProfile(): Promise<ToeicLearningProfile> {
    return api.get<ToeicLearningProfile>(API_CONFIG.ENDPOINTS.EXAMS.MY_PROFILE, undefined, ToeicLearningProfileSchema)
  },

  async getMyExamHistory(): Promise<Array<{
    _id: string
    user_id: string
    exam_id: string
    exam_title: string
    exam_code: string
    exam_type: 'FULL_TEST' | 'PART_PRACTICE' | 'PLACEMENT' | 'DIAGNOSTIC_TEST'
    attempt_type: string
    is_system_placement?: boolean
    total_questions: number
    correct_questions: number
    incorrect_questions: number
    total_scaled_score: number
    listening_scaled_score: number
    reading_scaled_score: number
    total_time_seconds: number
    is_best_attempt: boolean
    status: string
    submitted_at: string
    created_at: string
  }>> {
    return api.get(API_CONFIG.ENDPOINTS.EXAMS.HISTORY)
  },
}
