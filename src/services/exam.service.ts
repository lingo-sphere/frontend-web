// Xử lý API liên quan đến đề thi và bài làm TOEIC.

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import {
  BackendToeicExamSchema,
  BackendToeicExamListSchema,
  ExamResultSchema,
  type BackendToeicExam,
  type ExamResult,
} from '@/schemas/exam.schema'

export type { BackendToeicExam, ExamResult }

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

  async startExamAttempt(examId: string, options?: Record<string, unknown>): Promise<{ attemptId: string }> {
    return api.post<{ attemptId: string }>(API_CONFIG.ENDPOINTS.EXAMS.START(examId), options)
  },

  async submitExamAttempt(attemptId: string, answers: Record<string, string>, durationSeconds?: number): Promise<ExamResult> {
    return api.post<ExamResult>(
      API_CONFIG.ENDPOINTS.EXAMS.SUBMIT(attemptId),
      { answers, duration_seconds: durationSeconds },
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

  async getMyExamProfile(): Promise<Record<string, unknown>> {
    return api.get<Record<string, unknown>>(API_CONFIG.ENDPOINTS.EXAMS.MY_PROFILE)
  },

  async getMyExamHistory(): Promise<Array<{
    _id: string
    exam_id: { _id: string; title: string; code?: string; exam_type?: string }
    exam_title?: string
    exam_code?: string
    exam_type?: string
    total_questions: number
    answered_questions?: number
    correct_questions?: number
    incorrect_questions?: number
    total_scaled_score?: number
    listening_scaled_score?: number
    reading_scaled_score?: number
    total_time_seconds?: number
    status: string
    submitted_at: string
    created_at: string
  }>> {
    return api.get(API_CONFIG.ENDPOINTS.EXAMS.HISTORY)
  },
}
