/**
 * @file ai.service.ts
 * @description Service xử lý các logic nghiệp vụ chính cho dịch vụ ai
 */

import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'

export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export const aiService = {

  async chatWithAiTutor(message: string, history: AiChatMessage[] = []): Promise<{ response: string; model_used: string }> {
    return api.post(API_CONFIG.ENDPOINTS.AI.CHAT, {
      message,
      history,
    })
  },

  async explainToeicQuestion(payload: {
    question_text: string
    options: Array<{ key: string; text: string }>
    selected_answer: string
    correct_answer: string
  }): Promise<{ explanation_vi: string; grammar_notes: string[]; vocabulary_tips: string[] }> {
    return api.post(API_CONFIG.ENDPOINTS.AI.EXPLAIN_QUESTION, payload)
  },

  async improveWriting(text: string): Promise<{ corrected_text: string; explanations: string[] }> {
    return api.post(API_CONFIG.ENDPOINTS.AI.IMPROVE_WRITING, { text })
  },
}
