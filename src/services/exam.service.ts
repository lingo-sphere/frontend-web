import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { Exam, Question, ExamSubmissionPayload, ExamResult } from '@/types/api.types'

export const examService = {
  // Lấy danh sách đề thi TOEIC
  async getExams(params?: { type?: string; year?: number; search?: string }): Promise<Exam[]> {
    return api.get<Exam[]>(API_CONFIG.ENDPOINTS.EXAMS.LIST, params)
  },

  // Lấy thông tin chi tiết 1 đề thi
  async getExamById(id: string): Promise<Exam> {
    return api.get<Exam>(API_CONFIG.ENDPOINTS.EXAMS.BY_ID(id))
  },

  // Lấy toàn bộ câu hỏi và audio/ảnh của đề thi
  async getExamQuestions(examId: string): Promise<Question[]> {
    return api.get<Question[]>(API_CONFIG.ENDPOINTS.EXAMS.QUESTIONS(examId))
  },

  // Nộp bài thi trắc nghiệm để hệ thống chấm điểm ETS
  async submitExam(payload: ExamSubmissionPayload): Promise<ExamResult> {
    return api.post<ExamResult>(API_CONFIG.ENDPOINTS.EXAMS.SUBMIT, payload)
  },

  // Lấy kết quả bài thi chi tiết
  async getExamResult(submissionId: string): Promise<ExamResult> {
    return api.get<ExamResult>(API_CONFIG.ENDPOINTS.EXAMS.RESULT(submissionId))
  },

  // Lấy lịch sử làm bài thi của tôi
  async getExamHistory(): Promise<ExamResult[]> {
    return api.get<ExamResult[]>(API_CONFIG.ENDPOINTS.EXAMS.HISTORY)
  },
}
