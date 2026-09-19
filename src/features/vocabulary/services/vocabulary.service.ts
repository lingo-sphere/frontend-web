// Service xử lý các logic nghiệp vụ chính cho dịch vụ từ vựng.
import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import {
  DeckSchema,
  DeckListSchema,
  BackendTopicSchema,
  BackendTopicListSchema,
  BackendIpaSymbolListSchema,
  BackendGrammarPointSchema,
  BackendGrammarPointListSchema,
  LookupResponseSchema,
  SearchHistoryResponseSchema,
  type Deck,
  type BackendTopic,
  type BackendIpaSymbol,
  type BackendGrammarPoint,
  type LookupResponse,
  type SearchHistoryResponse,
} from '@/features/vocabulary/schemas/vocabulary.schema'

export type { Deck, BackendTopic, BackendIpaSymbol, BackendGrammarPoint, LookupResponse, SearchHistoryResponse }

export const vocabularyService = {
  async getPublicDecks(params?: { cefr_level?: string; search?: string }): Promise<Deck[]> {
    return api.get<Deck[]>(
      API_CONFIG.ENDPOINTS.VOCABULARY.PUBLIC_DECKS,
      params as Record<string, unknown>,
      DeckListSchema
    )
  },

  async getAllDecks(params?: { topicId?: string; cefrLevel?: string }): Promise<Deck[]> {
    return api.get<Deck[]>(
      API_CONFIG.ENDPOINTS.VOCABULARY.DECKS,
      params as Record<string, unknown>,
      DeckListSchema
    )
  },

  async getDeckById(deckId: string): Promise<Deck> {
    return api.get<Deck>(API_CONFIG.ENDPOINTS.VOCABULARY.DECK_BY_ID(deckId), undefined, DeckSchema)
  },

  async getTopics(params?: { cefr_level?: string }): Promise<BackendTopic[]> {
    return api.get<BackendTopic[]>(API_CONFIG.ENDPOINTS.VOCABULARY.TOPICS, params as Record<string, unknown>, BackendTopicListSchema)
  },

  async getTopicById(id: string): Promise<BackendTopic> {
    return api.get<BackendTopic>(API_CONFIG.ENDPOINTS.VOCABULARY.TOPIC_BY_ID(id), undefined, BackendTopicSchema)
  },

  async getIpaSymbols(symbolType?: string): Promise<BackendIpaSymbol[]> {
    return api.get<BackendIpaSymbol[]>(
      API_CONFIG.ENDPOINTS.VOCABULARY.IPA_SYMBOLS,
      symbolType ? { symbol_type: symbolType } : undefined,
      BackendIpaSymbolListSchema
    )
  },

  async getGrammarPoints(params?: { grammarType?: string; cefrLevel?: string }): Promise<BackendGrammarPoint[]> {
    return api.get<BackendGrammarPoint[]>(
      API_CONFIG.ENDPOINTS.VOCABULARY.GRAMMAR_POINTS,
      params as Record<string, unknown>,
      BackendGrammarPointListSchema
    )
  },

  async getGrammarPointById(id: string): Promise<BackendGrammarPoint> {
    return api.get<BackendGrammarPoint>(
      API_CONFIG.ENDPOINTS.VOCABULARY.GRAMMAR_POINT_BY_ID(id),
      undefined,
      BackendGrammarPointSchema
    )
  },

  async lookup(query: string, limit: number = 8): Promise<LookupResponse> {
    return api.get<LookupResponse>(
      API_CONFIG.ENDPOINTS.VOCABULARY.LOOKUP,
      { q: query, limit },
      LookupResponseSchema
    )
  },

  async getSearchHistory(userId: string, limit: number = 10): Promise<SearchHistoryResponse> {
    return api.get<SearchHistoryResponse>(
      API_CONFIG.ENDPOINTS.VOCABULARY.SEARCH_HISTORY,
      { userId, limit },
      SearchHistoryResponseSchema
    )
  },

  async saveSearchHistory(userId: string, data: {
    vocabularyId?: string
    searchQuery?: string
    searchType?: string
  }): Promise<{ success: boolean; id?: string }> {
    return api.post(
      `${API_CONFIG.ENDPOINTS.VOCABULARY.SEARCH_HISTORY}?userId=${userId}`,
      data
    )
  },

  async deleteSearchHistory(userId: string, historyId: string): Promise<{ success: boolean }> {
    return api.delete(
      `${API_CONFIG.ENDPOINTS.VOCABULARY.SEARCH_HISTORY}/${historyId}?userId=${userId}`
    )
  },

  async clearSearchHistory(userId: string): Promise<{ success: boolean }> {
    return api.delete(
      `${API_CONFIG.ENDPOINTS.VOCABULARY.SEARCH_HISTORY}/clear?userId=${userId}`
    )
  },

  async getMyVocabProgress(): Promise<Record<string, unknown>> {
    return api.get<Record<string, unknown>>(API_CONFIG.ENDPOINTS.VOCABULARY.MY_PROGRESS)
  },

  async getMyEnrollments(): Promise<Deck[]> {
    return api.get<Deck[]>(
      API_CONFIG.ENDPOINTS.VOCABULARY.MY_ENROLLMENTS,
      undefined,
      DeckListSchema
    )
  },

  async enrollDeck(deckId: string): Promise<{ message: string }> {
    return api.post(API_CONFIG.ENDPOINTS.VOCABULARY.ENROLL_DECK(deckId))
  },

  async startReviewSession(deckId: string): Promise<Record<string, unknown>> {
    return api.post(API_CONFIG.ENDPOINTS.VOCABULARY.REVIEW_START, { deck_id: deckId })
  },

  async submitReviewSession(sessionId: string, items: Array<{ card_id: string; quality: number }>): Promise<Record<string, unknown>> {
    return api.post(API_CONFIG.ENDPOINTS.VOCABULARY.SUBMIT_REVIEW(sessionId), { items })
  },

  async saveVocabulary(userId: string, lexicalItemId: string, meaningIndex: number): Promise<{ success: boolean; saved_id?: string }> {
    return api.post(`${API_CONFIG.ENDPOINTS.VOCABULARY.SAVED}?user_id=${userId}`, {
      lexical_item_id: lexicalItemId,
      meaning_index: meaningIndex,
    })
  },

  async unsaveVocabulary(userId: string, lexicalItemId: string, meaningIndex: number): Promise<{ success: boolean }> {
    return api.delete(`${API_CONFIG.ENDPOINTS.VOCABULARY.SAVED}/${lexicalItemId}/${meaningIndex}?user_id=${userId}`)
  },

  async getSavedVocabulary(params?: { page?: number; limit?: number }): Promise<{
    items: Array<{
      saved_id: string
      lexical_item_id: string
      word: string
      ipa?: string
      part_of_speech: string
      cefr?: string
      meaning_index: number
      meaning: string
      examples: Array<{ en: string; vi?: string }>
      audio_us?: string
      audio_uk?: string
      saved_at: string
    }>
    pagination: {
      page: number
      limit: number
      total: number
      total_pages: number
    }
  }> {
    return api.get(API_CONFIG.ENDPOINTS.VOCABULARY.SAVED, params as Record<string, unknown>)
  },

  async checkVocabularySaved(lexicalItemId: string, meaningIndex: number): Promise<boolean> {
    const result = await api.get<boolean>(`${API_CONFIG.ENDPOINTS.VOCABULARY.SAVED}/check`, {
      lexical_item_id: lexicalItemId,
      meaning_index: meaningIndex,
    })
    return result
  },

  async getSavedMeaningIndices(userId: string, lexicalItemId: string): Promise<number[]> {
    return api.get<number[]>(`${API_CONFIG.ENDPOINTS.VOCABULARY.SAVED}/indices?user_id=${userId}`, {
      lexical_item_id: lexicalItemId,
    })
  },
}