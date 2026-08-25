import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { Deck, LexicalItem, SpacedRepetitionReviewPayload } from '@/types/api.types'

export const vocabularyService = {
  // Lấy danh sách bộ từ vựng công khai
  async getPublicDecks(params?: { cefr_level?: string; search?: string }): Promise<Deck[]> {
    return api.get<Deck[]>(API_CONFIG.ENDPOINTS.VOCABULARY.PUBLIC_DECKS, params)
  },

  // Lấy chi tiết bộ từ vựng kèm danh sách thẻ
  async getDeckById(deckId: string): Promise<Deck> {
    return api.get<Deck>(API_CONFIG.ENDPOINTS.VOCABULARY.DECK_BY_ID(deckId))
  },

  // Lấy phiên học Spaced Repetition SM-2 (các từ cần ôn hôm nay)
  async getReviewSession(deckId: string): Promise<LexicalItem[]> {
    return api.get<LexicalItem[]>(API_CONFIG.ENDPOINTS.VOCABULARY.REVIEW_SESSION(deckId))
  },

  // Nộp kết quả đánh giá thẻ (1-5 sao) để cập nhật thuật toán SM-2
  async submitCardReview(payload: SpacedRepetitionReviewPayload): Promise<{ next_review_at: string; xp_gained: number }> {
    return api.post(API_CONFIG.ENDPOINTS.VOCABULARY.SUBMIT_REVIEW, payload)
  },

  // Lấy sổ tay từ vựng cá nhân
  async getNotebookItems(): Promise<LexicalItem[]> {
    return api.get<LexicalItem[]>(API_CONFIG.ENDPOINTS.VOCABULARY.NOTEBOOK)
  },

  // Lưu từ vựng vào sổ tay
  async saveToNotebook(cardId: string): Promise<{ message: string }> {
    return api.post(API_CONFIG.ENDPOINTS.VOCABULARY.NOTEBOOK_SAVE, { card_id: cardId })
  },
}
