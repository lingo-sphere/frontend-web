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
  ReadingAttemptResultEnhanced,
  AIReadingExplanation,
  ReadingSession,
  TimerPresetMode,
} from '../types/reading'

export const readingPracticeService = {
  startSession(payload: { passage_id: string; session_key: string; time_mode: TimerPresetMode }): Promise<ReadingSession> { return api.post('/practice/reading/sessions', payload) },
  getSession(id: string): Promise<ReadingSession> { return api.get(`/practice/reading/sessions/${id}`) },
  activeSessions(): Promise<Array<{ session_id: string; passage_title: string; deadline_at: string; reading_type: string }>> { return api.get('/practice/reading/sessions') },
  saveDraft(id: string, payload: { expected_revision: number; answers: Record<string, string> }): Promise<{ revision: number }> { return api.put(`/practice/reading/sessions/${id}`, payload) },
  reviewAttempt(id: string): Promise<{ passage: ReadingPassage; result: ReadingAttemptResultEnhanced }> { return api.get(`/practice/reading/attempts/${id}`) },
  retryAIExplanation(id: string): Promise<unknown> { return api.post(`/practice/reading/ai-explanation/${id}/retry`, {}) },
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
   * Nộp bài làm đọc hiểu và nhận kết quả ENHANCED (có context, skill breakdown, wrong answers)
   */
  async submitAttempt(payload: SubmitReadingAttemptPayload): Promise<ReadingAttemptResultEnhanced> {
    return api.post<ReadingAttemptResultEnhanced>(
      API_CONFIG.ENDPOINTS.PRACTICE.READING_SUBMIT_ATTEMPT,
      payload
    )
  },

  /**
   * Lấy lịch sử bài đọc đã làm
   */
  async getAttemptHistory(_userId?: string, params?: { passage_id?: string; limit?: number; page?: number }): Promise<ReadingAttemptResult[]> {
    return api.get<ReadingAttemptResult[]>(
      '/practice/reading/attempts',
      params as Record<string, unknown>
    )
  },

  /**
   * Lấy AI explanation cho một bài reading
   */
  async getAIExplanation(attemptId: string): Promise<{
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | null
    explanation?: AIReadingExplanation | null
    retry_after_seconds?: number
    can_retry?: boolean
  }> {
    const response = await api.get<{
      status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
      explanation?: {
        ai_result?: AIReadingExplanation
      }
      retry_after_seconds?: number
      can_retry?: boolean
    }>(
      `/practice/reading/ai-explanation/${attemptId}`,
      undefined
    )
    // Extract ai_result from explanation
    return {
      status: response?.status || null,
      explanation: response?.explanation?.ai_result || null,
      retry_after_seconds: response?.retry_after_seconds,
      can_retry: response?.can_retry,
    }
  },

  /**
   * Lấy lịch sử AI explanations của user
   */
  async getAIExplanationHistory(userId: string, params?: { limit?: number; page?: number }): Promise<{
    items: Array<{
      _id: string
      attempt_id: string
      passage_title: string
      status: string
      ai_result?: AIReadingExplanation
      created_at: string
    }>
    total: number
    page: number
    limit: number
    total_pages: number
  }> {
    return api.get(
      '/practice/reading/ai-explanations',
      params as Record<string, unknown>
    )
  },

}
