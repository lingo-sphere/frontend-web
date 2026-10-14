// Service xử lý API cho các phiên luyện nghe.

import { api } from '@/services/api.client'
import type {
  ListeningSession,
  ListeningSessionResult,
  CreateSessionParams,
  SubmitAnswerParams,
  SubmitSessionParams,
} from '@/features/practice/types/listening-session'

export const listeningSessionService = {
  async createSession(params: CreateSessionParams): Promise<ListeningSession> {
    return api.post<ListeningSession>('/practice/listening/sessions', params)
  },

  async getSession(sessionId: string): Promise<ListeningSession> {
    return api.get<ListeningSession>(`/practice/listening/sessions/${sessionId}`)
  },

  async submitAnswer(params: SubmitAnswerParams): Promise<{ success: boolean; is_correct: boolean }> {
    return api.post<{ success: boolean; is_correct: boolean }>(
      '/practice/listening/sessions/answer',
      params
    )
  },

  async submitSession(params: SubmitSessionParams): Promise<ListeningSessionResult> {
    return api.post<ListeningSessionResult>('/practice/listening/sessions/submit', params)
  },

  async getResult(sessionId: string): Promise<ListeningSessionResult> {
    return api.get<ListeningSessionResult>(`/practice/listening/sessions/${sessionId}/result`)
  },
}
