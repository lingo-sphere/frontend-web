import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { Exam, Question, ExamSubmissionPayload, ExamResult } from '@/types/api.types'

export const examService = {

  async getExams(params?: { type?: string; year?: number; search?: string }): Promise<Exam[]> {
    return api.get<Exam[]>(API_CONFIG.ENDPOINTS.EXAMS.LIST, params)
  },

  async getExamById(id: string): Promise<Exam> {
    return api.get<Exam>(API_CONFIG.ENDPOINTS.EXAMS.BY_ID(id))
  },

  async getExamQuestions(examId: string): Promise<Question[]> {
    return api.get<Question[]>(API_CONFIG.ENDPOINTS.EXAMS.QUESTIONS(examId))
  },

  async submitExam(payload: ExamSubmissionPayload): Promise<ExamResult> {
    return api.post<ExamResult>(API_CONFIG.ENDPOINTS.EXAMS.SUBMIT, payload)
  },

  async getExamResult(submissionId: string): Promise<ExamResult> {
    return api.get<ExamResult>(API_CONFIG.ENDPOINTS.EXAMS.RESULT(submissionId))
  },

  async getExamHistory(): Promise<ExamResult[]> {
    return api.get<ExamResult[]>(API_CONFIG.ENDPOINTS.EXAMS.HISTORY)
  },
}
