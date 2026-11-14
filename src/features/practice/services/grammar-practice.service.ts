/**
 * @file grammar-practice.service.ts
 * @description API client service cho Grammar Practice
 */

import { api } from '@/services/api.client'
import type {
  GrammarFeedback, GrammarDraft, GrammarSessionList, GrammarLevelSummary,
  GrammarTopicItem,
  GrammarTheoryTargets,
  GrammarSession,
  GrammarSessionResult,
  CreateGrammarSessionParams,
  SubmitGrammarAnswerParams,
  SubmitGrammarSessionParams,
} from '../types/grammar-practice'

export const grammarPracticeService = {
  getTheoryTargets(slug: string): Promise<GrammarTheoryTargets> {
    return api.get(`/practice/grammar/theory/${encodeURIComponent(slug)}/topics`)
  },
  startFromTheory(slug: string, topic_code: string, session_key: string): Promise<GrammarSession> {
    return api.post(`/practice/grammar/theory/${encodeURIComponent(slug)}/sessions`, { topic_code, session_key })
  },
  getSession(id: string): Promise<GrammarSession> { return api.get('/practice/grammar/sessions/' + id) },
  getSessions(page = 1, filters?: { limit?: number; status?: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'; level?: string }): Promise<GrammarSessionList> {
    return api.get('/practice/grammar/sessions', { page, limit: 20, ...filters })
  },
  saveDraft(id: string, payload: GrammarDraft): Promise<{ revision: number }> { return api.put('/practice/grammar/sessions/' + id, payload) },
  /**
   * Lấy danh sách 5 cấp độ ngữ pháp (A1 -> C1) cùng tiến độ
   */
  async getLevels(userId?: string): Promise<GrammarLevelSummary[]> {
    const path = userId ? '/practice/grammar/progress/levels' : '/practice/grammar/levels'
    return api.get<GrammarLevelSummary[]>(path)
  },

  /**
   * Lấy danh sách chủ điểm ngữ pháp theo level
   */
  async getTopics(level?: string, userId?: string): Promise<GrammarTopicItem[]> {
    const params = new URLSearchParams()
    if (level) params.append('level', level)
    const queryString = params.toString() ? `?${params.toString()}` : ''
    const path = userId ? '/practice/grammar/progress/topics' : '/practice/grammar/topics'
    return api.get<GrammarTopicItem[]>(`${path}${queryString}`)
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
