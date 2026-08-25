import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'

export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export const aiService = {
  // Trò chuyện cùng Gia sư AI LingoSphere (Ollama / LLM)
  async chatWithAiTutor(message: string, history: AiChatMessage[] = []): Promise<{ response: string; model_used: string }> {
    return api.post(API_CONFIG.ENDPOINTS.AI.CHAT, {
      message,
      history,
    })
  },

  // AI giải thích chi tiết đáp án câu hỏi TOEIC
  async explainToeicQuestion(payload: {
    question_text: string
    options: Array<{ key: string; text: string }>
    selected_answer: string
    correct_answer: string
  }): Promise<{ explanation_vi: string; grammar_notes: string[]; vocabulary_tips: string[] }> {
    return api.post(API_CONFIG.ENDPOINTS.AI.EXPLAIN_QUESTION, payload)
  },

  // AI gợi ý cải thiện bài viết tiếng Anh
  async improveWriting(text: string): Promise<{ corrected_text: string; explanations: string[] }> {
    return api.post(API_CONFIG.ENDPOINTS.AI.IMPROVE_WRITING, { text })
  },
}
