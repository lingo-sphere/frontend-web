// Service xử lý các logic nghiệp vụ chính cho dịch vụ vocabulary
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
  LexicalItemListSchema,
  type Deck,
  type BackendTopic,
  type BackendIpaSymbol,
  type BackendGrammarPoint,
  type LexicalItem,
} from '@/schemas/vocabulary.schema'

export type { Deck, BackendTopic, BackendIpaSymbol, BackendGrammarPoint, LexicalItem }

export const vocabularyService = {
  async getPublicDecks(params?: { cefr_level?: string; search?: string }): Promise<Deck[]> {
    return api.get<Deck[]>(API_CONFIG.ENDPOINTS.VOCABULARY.PUBLIC_DECKS, params as Record<string, unknown>, DeckListSchema)
  },

  async getAllDecks(params?: { topicId?: string; cefrLevel?: string }): Promise<Deck[]> {
    return api.get<Deck[]>(API_CONFIG.ENDPOINTS.VOCABULARY.DECKS, params as Record<string, unknown>, DeckListSchema)
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

  async searchVocabulary(query: { q?: string; cefr_level?: string; topic_id?: string }): Promise<LexicalItem[]> {
    return api.get<LexicalItem[]>(
      API_CONFIG.ENDPOINTS.VOCABULARY.SEARCH,
      query as Record<string, unknown>,
      LexicalItemListSchema
    )
  },

  async getMyVocabProgress(): Promise<Record<string, unknown>> {
    return api.get<Record<string, unknown>>(API_CONFIG.ENDPOINTS.VOCABULARY.MY_PROGRESS)
  },

  async getMyEnrollments(): Promise<Deck[]> {
    return api.get<Deck[]>(API_CONFIG.ENDPOINTS.VOCABULARY.MY_ENROLLMENTS, undefined, DeckListSchema)
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
}
