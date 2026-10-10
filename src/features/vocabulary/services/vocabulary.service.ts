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

  async getLearningSettings(): Promise<{ daily_new_cards_limit?: number; daily_goal?: number } | null> {
    try {
      return await api.get(API_CONFIG.ENDPOINTS.VOCABULARY.SETTINGS)
    } catch {
      return null
    }
  },

  async updateLearningSettings(data: { daily_goal?: number; daily_new_cards_limit?: number }): Promise<Record<string, unknown>> {
    return api.put(API_CONFIG.ENDPOINTS.VOCABULARY.SETTINGS, data)
  },

  async getDailyProgress(): Promise<{
    date: string
    daily_goal: number
    words_reviewed_today: number
    correct_count_today: number
    accuracy_today: number
    total_sessions_today: number
    is_goal_met: boolean
  } | null> {
    try {
      return await api.get(API_CONFIG.ENDPOINTS.VOCABULARY.DAILY_PROGRESS)
    } catch {
      return null
    }
  },

  async getMyEnrollments(): Promise<Deck[]> {
    try {
      const raw = await api.get<any[]>(
        API_CONFIG.ENDPOINTS.VOCABULARY.MY_ENROLLMENTS
      )
      if (!Array.isArray(raw)) return []
      return raw.map((item: any) => {
        if (item && item.deck_id && typeof item.deck_id === 'object') {
          const deck = item.deck_id
          return {
            ...deck,
            _id: deck._id || deck.id,
            enrollment_id: item._id,
            learning_count: item.learning_count ?? 0,
            mastered_count: item.mastered_count ?? 0,
            progress_percent: item.progress_percent ?? 0,
          }
        }
        return item
      })
    } catch {
      return []
    }
  },

  async enrollDeck(deckId: string): Promise<{ message: string }> {
    return api.post(API_CONFIG.ENDPOINTS.VOCABULARY.ENROLL_DECK(deckId))
  },

  async startReviewSession(deckId: string): Promise<Record<string, unknown>> {
    return api.post(API_CONFIG.ENDPOINTS.VOCABULARY.REVIEW_START, { deck_id: deckId })
  },

  async createDeck(data: {
    name: string
    name_vi?: string
    description?: string
    description_vi?: string
    tags?: string[]
    visibility?: 'PUBLIC' | 'PRIVATE'
    settings?: {
      target_band?: string
      exam_part?: string
    }
  }): Promise<Deck> {
    return api.post<Deck>(API_CONFIG.ENDPOINTS.VOCABULARY.DECKS, data)
  },

  async updateDeck(
    deckId: string,
    data: {
      name?: string
      description?: string
      visibility?: 'PUBLIC' | 'PRIVATE'
      tags?: string[]
    }
  ): Promise<Deck> {
    return api.put<Deck>(`/vocabulary/flashcards/decks/${deckId}`, data)
  },

  async deleteDeck(deckId: string): Promise<{ message: string }> {
    return api.delete(`/vocabulary/flashcards/decks/${deckId}`)
  },

  async unenrollDeck(deckId: string): Promise<{ message: string }> {
    return api.delete(`/vocabulary/flashcards/decks/${deckId}/enroll`)
  },

  async getDeckSaversCount(deckId: string): Promise<{ deck_id: string; savers_count: number }> {
    return api.get<{ deck_id: string; savers_count: number }>(`/vocabulary/flashcards/decks/${deckId}/savers-count`)
  },

  async addCardToDeck(
    deckId: string,
    data: {
      lexical_item_id: string
      meaning_index?: number
      front_text?: string
      back_text?: string
      user_notes?: string
    }
  ): Promise<Record<string, unknown>> {
    return api.post(`/vocabulary/flashcards/decks/${deckId}/cards`, data)
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

  async autoGenerateAudio(data: {
    lexical_item_id?: string
    word: string
    accent?: 'us' | 'uk'
    cefr_level?: string
  }): Promise<{ success: boolean; audio_url_us?: string; audio_url_uk?: string }> {
    try {
      return await api.post('/vocabulary/audio/auto-generate', data)
    } catch {
      return { success: false }
    }
  },

  // ==================== ADAPTIVE LEARNING ENGINE ====================

  async startLearningSession(data: {
    source_type: 'DECK' | 'TOPIC' | 'WRONG_WORDS' | 'DUE_SRS'
    source_id?: string
    session_mode?: string
    session_type?: 'LEARN_NEW' | 'REVIEW'
    session_size?: number
  }): Promise<{ session_id: string; total_items: number; session_type: string; session_mode: string }> {
    return api.post('/vocabulary/learning-sessions', data)
  },

  async getNextLearningQuestion(sessionId: string, mode?: string, vocabId?: string): Promise<{
    is_completed: boolean
    session_id?: string
    lexical_item_id?: string
    mode?: string
    progress?: {
      resolved: number;
      total: number;
      current_index?: number;
      is_relearning?: boolean;
      unresolved_count?: number;
    }
    prompt?: {
      word?: string
      part_of_speech?: string
      ipa?: string
      meaning_vi?: string
      audio_url?: string
      audio_url_us?: string
      audio_url_uk?: string
      examples?: Array<{ e: string; v: string }>
      first_letter_hint?: string
      word_length?: number
      context_sentence_en?: string
      context_sentence_vi?: string
    }
    options?: Array<{ id: string; text: string; word?: string; meaning_vi?: string }>
  }> {
    const params = new URLSearchParams({ t: Date.now().toString() })
    if (mode) params.append('mode', mode)
    if (vocabId) params.append('vocabId', vocabId)
    return api.get(`/vocabulary/learning-sessions/${sessionId}/next?${params.toString()}`)
  },

  async submitLearningAnswer(
    sessionId: string,
    data: {
      lexical_item_id: string
      mode: string
      answer_raw: string
      time_spent_seconds?: number
    }
  ): Promise<{
    result: 'CORRECT' | 'NEAR_CORRECT' | 'INCORRECT'
    is_correct: boolean
    is_near_correct: boolean
    correct_answer: string
    meaning_vi?: string
    message?: string
    progress: { resolved: number; total: number }
  }> {
    return api.post(`/vocabulary/learning-sessions/${sessionId}/answers`, data)
  },

  async completeLearningSession(sessionId: string): Promise<{
    session_id: string
    session_type: string
    duration_seconds: number
    learning_time_seconds: number
    review_time_seconds: number
    total_words: number
    correct_count: number
    near_correct_count: number
    accuracy_percent: number
    xp_earned: number
  }> {
    return api.post(`/vocabulary/learning-sessions/${sessionId}/complete`, {})
  },

  // ==================== WRONG WORDS COLLECTION ====================

  async getWrongWords(params?: { status?: string; page?: number; limit?: number }): Promise<{
    items: Array<any>
    pagination: {
      page: number
      limit: number
      total: number
      total_pages: number
      quota_used: number
      max_quota: number
    }
  }> {
    return api.get('/vocabulary/wrong-words', params as Record<string, unknown>)
  },

  // ==================== DASHBOARD & LEARNING ANALYTICS ====================

  async getDashboardOverview(): Promise<import('../types/vocabulary.dashboard').VocabularyDashboardOverview> {
    return api.get<import('../types/vocabulary.dashboard').VocabularyDashboardOverview>('/vocabulary/dashboard/overview')
  },
}