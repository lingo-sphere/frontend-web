/**
 * @file exam.service.ts
 * @description Service xử lý các logic nghiệp vụ chính cho dịch vụ exam
 */

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import type { Exam, ExamResult } from '@/types/api.types'

export interface BackendToeicExam {
  _id: string
  title: string
  slug: string
  description: string
  exam_type: string
  duration_minutes: number
  total_questions: number
  audio_full_url?: string
  is_published: boolean
  is_system_placement?: boolean
  skills_enabled?: string
  placement_type?: string
  attempts_count?: number
  parts?: Array<{
    part_number: number
    title: string
    question_count: number
    questions: Array<{
      question_number: number
      image_url?: string
      audio_url?: string
      question_text?: string
      options: Array<{ key: string; text: string }>
      correct_answer?: string
      explanation?: string
    }>
  }>
}

export const examService = {
  async getExams(params?: { type?: string; year?: number; search?: string }): Promise<BackendToeicExam[]> {
    return api.get<BackendToeicExam[]>(API_CONFIG.ENDPOINTS.EXAMS.LIST, params)
  },

  async getExamById(id: string): Promise<BackendToeicExam> {
    return api.get<BackendToeicExam>(API_CONFIG.ENDPOINTS.EXAMS.BY_ID(id))
  },

  async getToeicParts(): Promise<Array<Record<string, unknown>>> {
    return api.get<Array<Record<string, unknown>>>(API_CONFIG.ENDPOINTS.EXAMS.PARTS)
  },

  async startExamAttempt(examId: string, options?: Record<string, unknown>): Promise<{ attemptId: string }> {
    return api.post<{ attemptId: string }>(API_CONFIG.ENDPOINTS.EXAMS.START(examId), options)
  },

  async submitExamAttempt(attemptId: string, answers: Record<string, string>, durationSeconds?: number): Promise<ExamResult> {
    return api.post<ExamResult>(API_CONFIG.ENDPOINTS.EXAMS.SUBMIT(attemptId), { answers, duration_seconds: durationSeconds })
  },

  async getExamAttemptResult(attemptId: string): Promise<ExamResult> {
    return api.get<ExamResult>(API_CONFIG.ENDPOINTS.EXAMS.RESULT(attemptId))
  },

  async getMyExamProfile(): Promise<Record<string, unknown>> {
    return api.get<Record<string, unknown>>(API_CONFIG.ENDPOINTS.EXAMS.MY_PROFILE)
  },
}
