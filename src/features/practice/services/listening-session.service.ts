/**
 * @file listening-session.service.ts
 * @description API service cho Listening Practice Session
 */

import { api } from '@/services/api.client'
import type {
  ListeningSession,
  ListeningSessionResult,
  CreateSessionParams,
  SubmitAnswerParams,
  SubmitSessionParams,
} from '../types/listening-session'

export const listeningSessionService = {
  /**
   * Tạo session mới với exercises
   */
  async createSession(params: CreateSessionParams): Promise<ListeningSession> {
    const activeUserId = params.userId || params.user_id
    const query = activeUserId ? `?userId=${encodeURIComponent(activeUserId)}` : ''
    return api.post<ListeningSession>(`/practice/listening/sessions${query}`, params)
  },

  /**
   * Lấy session đang làm
   */
  async getSession(sessionId: string): Promise<ListeningSession> {
    return api.get<ListeningSession>(`/practice/listening/sessions/${sessionId}`)
  },

  /**
   * Submit câu trả lời cho 1 câu
   */
  async submitAnswer(params: SubmitAnswerParams): Promise<{ success: boolean; is_correct: boolean }> {
    return api.post<{ success: boolean; is_correct: boolean }>(
      '/practice/listening/sessions/answer',
      params
    )
  },

  /**
   * Submit toàn bộ session
   */
  async submitSession(params: SubmitSessionParams): Promise<ListeningSessionResult> {
    const activeUserId = params.userId
    const query = activeUserId ? `?userId=${encodeURIComponent(activeUserId)}` : ''
    return api.post<ListeningSessionResult>(`/practice/listening/sessions/submit${query}`, params)
  },

  /**
   * Lấy kết quả session
   */
  async getResult(sessionId: string): Promise<ListeningSessionResult> {
    return api.get<ListeningSessionResult>(`/practice/listening/sessions/${sessionId}/result`)
  },
}
