/**
 * @file grammar-practice.service.ts
 * @description API client service cho Grammar Practice
 */

import { api } from '@/services/api.client'
import type {
  GrammarFeedback, GrammarDraft, GrammarSessionList, GrammarLevelSummary,
  GrammarTopicItem,
  GrammarSession,
  GrammarSessionResult,
  CreateGrammarSessionParams,
  SubmitGrammarAnswerParams,
  SubmitGrammarSessionParams,
} from '../types/grammar-practice'

export const grammarPracticeService = {
  getSession(id: string): Promise<GrammarSession> { return api.get('/practice/grammar/sessions/' + id) },
  getSessions(page = 1): Promise<GrammarSessionList> { return api.get('/practice/grammar/sessions', { page, limit: 10 }) },
  saveDraft(id: string, payload: GrammarDraft): Promise<{ revision: number }> { return api.put('/practice/grammar/sessions/' + id, payload) },
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
    const { grammar_knowledge_id, cefr_level, question_count, session_key } = params
    const payload = { grammar_knowledge_id, cefr_level, question_count, session_key }
    return api.post<GrammarSession>('/practice/grammar/sessions', payload)
  },

  /**
   * Trả lời từng câu hỏi
   */
  async submitAnswer(params: SubmitGrammarAnswerParams): Promise<GrammarFeedback> {
    const { session_id, question_index, answer } = params
    const payload = { session_id, question_index, answer }
    return api.post<GrammarFeedback>('/practice/grammar/sessions/answer', payload)
  },

  /**
   * Nộp toàn bộ bài tập ngữ pháp
   */
  async submitSession(params: SubmitGrammarSessionParams): Promise<GrammarSessionResult> {
    const { session_id, answers, total_time_seconds, skipped_indices } = params
    const payload = { session_id, answers, total_time_seconds, skipped_indices }
    return api.post<GrammarSessionResult>('/practice/grammar/sessions/submit', payload)
  },
}
