/**
 * @file ai.service.ts
 * @description Service xử lý các logic nghiệp vụ chính cho dịch vụ ai
 */

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'

export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AiQuotaInfo {
  is_premium: boolean
  remaining: number
  limit: number | null
  used?: number
}

export interface UserAiQuotaSummary {
  is_premium: boolean
  plan_type: string
  chat: { used: number; limit: number | null; remaining: number; is_unlimited: boolean }
  translation: { used: number; limit: number | null; remaining: number; is_unlimited: boolean }
  context_token_limit: number
}

export interface TranslationResponse {
  translated_text: string
  source_lang?: string
  target_lang?: string
  context_explanation?: string
  key_vocabulary?: Array<{ word: string; meaning: string; part_of_speech?: string }>
  grammar_notes?: string[]
  quota?: AiQuotaInfo
}

export const aiService = {
  async chatWithAiTutor(
    message: string,
    history: AiChatMessage[] = []
  ): Promise<{ response: string; model?: string; tokens_used?: number; quota?: AiQuotaInfo }> {
    return api.post(API_CONFIG.ENDPOINTS.AI.CHAT, {
      message,
      history,
    })
  },

  async getAiQuota(): Promise<UserAiQuotaSummary> {
    return api.get('/ai/quota')
  },

  async translate(payload: {
    text: string
    source_lang?: string
    target_lang?: string
    requested_tone?: string
  }): Promise<TranslationResponse> {
    return api.post('/ai/translations/translate', payload)
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
