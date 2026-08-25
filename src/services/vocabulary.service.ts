import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { Deck, LexicalItem, SpacedRepetitionReviewPayload } from '@/types/api.types'

export const vocabularyService = {

  async getPublicDecks(params?: { cefr_level?: string; search?: string }): Promise<Deck[]> {
    return api.get<Deck[]>(API_CONFIG.ENDPOINTS.VOCABULARY.PUBLIC_DECKS, params)
  },

  async getDeckById(deckId: string): Promise<Deck> {
    return api.get<Deck>(API_CONFIG.ENDPOINTS.VOCABULARY.DECK_BY_ID(deckId))
  },

  async getReviewSession(deckId: string): Promise<LexicalItem[]> {
    return api.get<LexicalItem[]>(API_CONFIG.ENDPOINTS.VOCABULARY.REVIEW_SESSION(deckId))
  },

  async submitCardReview(payload: SpacedRepetitionReviewPayload): Promise<{ next_review_at: string; xp_gained: number }> {
    return api.post(API_CONFIG.ENDPOINTS.VOCABULARY.SUBMIT_REVIEW, payload)
  },

  async getNotebookItems(): Promise<LexicalItem[]> {
    return api.get<LexicalItem[]>(API_CONFIG.ENDPOINTS.VOCABULARY.NOTEBOOK)
  },

  async saveToNotebook(cardId: string): Promise<{ message: string }> {
    return api.post(API_CONFIG.ENDPOINTS.VOCABULARY.NOTEBOOK_SAVE, { card_id: cardId })
  },
}
