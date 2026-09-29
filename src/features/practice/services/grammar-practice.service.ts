/**
 * @file grammar-practice.service.ts
 * @description API client service cho Grammar Practice
 */

import { api } from '@/services/api.client'
import type {
  GrammarLevelSummary,
  GrammarTopicItem,
  GrammarSession,
  GrammarSessionResult,
  CreateGrammarSessionParams,
  SubmitGrammarAnswerParams,
  SubmitGrammarSessionParams,
} from '../types/grammar-practice'

export const grammarPracticeService = {
  /**
   * Lấy danh sách 5 cấp độ ngữ pháp (A1 -> C1) cùng tiến độ
   */
  async getLevels(userId?: string): Promise<GrammarLevelSummary[]> {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : ''
    return api.get<GrammarLevelSummary[]>(`/practice/grammar/levels${query}`)
  },

  /**
   * Lấy danh sách chủ điểm ngữ pháp theo level
   */
  async getTopics(level?: string, userId?: string): Promise<GrammarTopicItem[]> {
    const params = new URLSearchParams()
    if (level) params.append('level', level)
    if (userId) params.append('userId', userId)
    const queryString = params.toString() ? `?${params.toString()}` : ''
    return api.get<GrammarTopicItem[]>(`/practice/grammar/topics${queryString}`)
  },

  /**
   * Tạo phiên luyện tập ngữ pháp mới
   */
  async createSession(params: CreateGrammarSessionParams): Promise<GrammarSession> {
    const activeUserId = params.userId
    const query = activeUserId ? `?userId=${encodeURIComponent(activeUserId)}` : ''
    return api.post<GrammarSession>(`/practice/grammar/sessions${query}`, params)
  },

  /**
   * Trả lời từng câu hỏi
   */
  async submitAnswer(params: SubmitGrammarAnswerParams): Promise<{ success: boolean; is_correct: boolean }> {
    const activeUserId = params.userId
    const query = activeUserId ? `?userId=${encodeURIComponent(activeUserId)}` : ''
    return api.post<{ success: boolean; is_correct: boolean }>(`/practice/grammar/sessions/answer${query}`, params)
  },

  /**
   * Nộp toàn bộ bài tập ngữ pháp
   */
  async submitSession(params: SubmitGrammarSessionParams): Promise<GrammarSessionResult> {
    const activeUserId = params.userId
    const query = activeUserId ? `?userId=${encodeURIComponent(activeUserId)}` : ''
    return api.post<GrammarSessionResult>(`/practice/grammar/sessions/submit${query}`, params)
  },
}
