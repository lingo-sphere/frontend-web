/**
 * @file reading-practice.service.ts
 * @description Frontend API Service cho Reading Practice (Part 6, Part 7, Task-based, Info Matching)
 */

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import type {
  ReadingPassage,
  ReadingQuestion,
  SubmitReadingAttemptPayload,
  ReadingAttemptResult,
} from '../types/reading'

export const readingPracticeService = {
  /**
   * Lấy danh sách bài đọc theo các bộ lọc
   */
  async getPassages(params?: {
    context_id?: string
    reading_type?: string
    cefr_level?: string
    limit?: number
    page?: number
  }): Promise<{ passages: ReadingPassage[]; pagination: { total: number; page: number; limit: number; total_pages: number } }> {
    const res = await api.get<{ passages: ReadingPassage[]; pagination: { total: number; page: number; limit: number; total_pages: number } }>(
      API_CONFIG.ENDPOINTS.PRACTICE.READING_PASSAGES,
      params as Record<string, unknown>
    )
    return res || { passages: [], pagination: { total: 0, page: 1, limit: 20, total_pages: 0 } }
  },

  /**
   * Lấy chi tiết bài đọc kèm câu hỏi
   */
  async getPassageById(id: string): Promise<ReadingPassage> {
    return api.get<ReadingPassage>(
      API_CONFIG.ENDPOINTS.PRACTICE.READING_PASSAGE_BY_ID(id)
    )
  },

  /**
   * Lấy danh sách câu hỏi của một bài đọc
   */
  async getQuestionsByPassage(passageId: string): Promise<ReadingQuestion[]> {
    return api.get<ReadingQuestion[]>(
      API_CONFIG.ENDPOINTS.PRACTICE.READING_PASSAGE_QUESTIONS(passageId)
    )
  },

  /**
   * Nộp bài làm đọc hiểu và nhận kết quả chấm điểm + SRS snapshot
   */
  async submitAttempt(payload: SubmitReadingAttemptPayload): Promise<ReadingAttemptResult> {
    return api.post<ReadingAttemptResult>(
      API_CONFIG.ENDPOINTS.PRACTICE.READING_SUBMIT_ATTEMPT,
      payload
    )
  },

  /**
   * Lấy lịch sử làm bài đọc của user
   */
  async getAttemptHistory(passageId?: string): Promise<ReadingAttemptResult[]> {
    return api.get<ReadingAttemptResult[]>(
      API_CONFIG.ENDPOINTS.PRACTICE.READING_ATTEMPT_HISTORY,
      passageId ? { passage_id: passageId } : undefined
    )
  },
}
