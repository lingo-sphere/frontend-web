import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { Deck, LexicalItem } from '@/types/api.types'

export interface BackendTopic {
  _id: string
  name_en: string
  name_vi: string
  slug: string
  description_en?: string
  description_vi?: string
  icon_url?: string
  lexical_count: number
  cefr_level: string
  is_featured: boolean
  display_order: number
}

export interface BackendIpaSymbol {
  _id: string
  symbol: string
  symbol_type: 'VOWEL' | 'CONSONANT' | 'DIPHTHONG'
  description_en?: string
  description_vi?: string
  example_word: string
  example_word_ipa: string
  audio_url?: string
  example_audio_url?: string
}

export interface BackendGrammarPoint {
  _id: string
  title_en: string
  title_vi: string
  slug: string
  category: string
  cefr_level: string
  description_en?: string
  description_vi?: string
  rule_en?: string
  rule_vi?: string
  structure_form?: string
  usage_notes?: string
  common_mistakes?: string
  examples: Array<{ sentence_en: string; sentence_vi: string }>
  toeic_relevance: number
  practice_count: number
  is_featured: boolean
  is_published: boolean
}

export const vocabularyService = {
  async getPublicDecks(params?: { cefr_level?: string; search?: string }): Promise<Deck[]> {
    return api.get<Deck[]>(API_CONFIG.ENDPOINTS.VOCABULARY.PUBLIC_DECKS, params)
  },

  async getAllDecks(params?: { topicId?: string; cefrLevel?: string }): Promise<Deck[]> {
    return api.get<Deck[]>(API_CONFIG.ENDPOINTS.VOCABULARY.DECKS, params)
  },

  async getDeckById(deckId: string): Promise<Deck> {
    return api.get<Deck>(API_CONFIG.ENDPOINTS.VOCABULARY.DECK_BY_ID(deckId))
  },

  async getTopics(params?: { cefr_level?: string }): Promise<BackendTopic[]> {
    return api.get<BackendTopic[]>(API_CONFIG.ENDPOINTS.VOCABULARY.TOPICS, params)
  },

  async getTopicById(id: string): Promise<BackendTopic> {
    return api.get<BackendTopic>(API_CONFIG.ENDPOINTS.VOCABULARY.TOPIC_BY_ID(id))
  },

  async getIpaSymbols(symbolType?: string): Promise<BackendIpaSymbol[]> {
    return api.get<BackendIpaSymbol[]>(API_CONFIG.ENDPOINTS.VOCABULARY.IPA_SYMBOLS, symbolType ? { symbol_type: symbolType } : undefined)
  },

  async getGrammarPoints(params?: { grammarType?: string; cefrLevel?: string }): Promise<BackendGrammarPoint[]> {
    return api.get<BackendGrammarPoint[]>(API_CONFIG.ENDPOINTS.VOCABULARY.GRAMMAR_POINTS, params)
  },

  async getGrammarPointById(id: string): Promise<BackendGrammarPoint> {
    return api.get<BackendGrammarPoint>(API_CONFIG.ENDPOINTS.VOCABULARY.GRAMMAR_POINT_BY_ID(id))
  },

  async searchVocabulary(query: { q?: string; cefr_level?: string; topic_id?: string }): Promise<LexicalItem[]> {
    return api.get<LexicalItem[]>(API_CONFIG.ENDPOINTS.VOCABULARY.SEARCH, query)
  },

  async getMyVocabProgress(): Promise<Record<string, unknown>> {
    return api.get<Record<string, unknown>>(API_CONFIG.ENDPOINTS.VOCABULARY.MY_PROGRESS)
  },

  async getMyEnrollments(): Promise<Deck[]> {
    return api.get<Deck[]>(API_CONFIG.ENDPOINTS.VOCABULARY.MY_ENROLLMENTS)
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
