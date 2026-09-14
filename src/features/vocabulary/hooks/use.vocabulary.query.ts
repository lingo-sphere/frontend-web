// Custom hook quản lý truy vấn từ vựng bằng TanStack Query.
'use client'

import { useQuery } from '@tanstack/react-query'
import { vocabularyService } from '@/features/vocabulary/services/vocabulary.service'
import { vocabularyKeys } from '@/features/vocabulary/keys/vocabulary.keys'
import type {
  Deck,
  BackendTopic,
  BackendIpaSymbol,
  BackendGrammarPoint,
} from '@/features/vocabulary/schemas/vocabulary.schema'

export function usePublicDecksQuery(params?: { cefr_level?: string; search?: string }, enabled = true) {
  return useQuery<Deck[]>({
    queryKey: vocabularyKeys.publicDecks(params),
    queryFn: () => vocabularyService.getPublicDecks(params),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useMyVocabularyEnrollmentsQuery(enabled = true) {
  return useQuery<Deck[]>({
    queryKey: vocabularyKeys.myEnrollments(),
    queryFn: async () => {
      try {
        const res = await vocabularyService.getMyEnrollments()
        return Array.isArray(res) ? res : []
      } catch {
        return []
      }
    },
    enabled,
    staleTime: 2 * 60 * 1000,
  })
}

export function useDeckDetailQuery(deckId: string, enabled = true) {
  return useQuery<Deck>({
    queryKey: vocabularyKeys.deck(deckId),
    queryFn: () => vocabularyService.getDeckById(deckId),
    enabled: Boolean(deckId) && enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useTopicsQuery(params?: { cefr_level?: string }, enabled = true) {
  return useQuery<BackendTopic[]>({
    queryKey: vocabularyKeys.topics(params),
    queryFn: () => vocabularyService.getTopics(params),
    enabled,
    staleTime: 10 * 60 * 1000,
  })
}

export function useIpaSymbolsQuery(symbolType?: string, enabled = true) {
  return useQuery<BackendIpaSymbol[]>({
    queryKey: vocabularyKeys.ipaSymbols(symbolType),
    queryFn: () => vocabularyService.getIpaSymbols(symbolType),
    enabled,
    staleTime: 15 * 60 * 1000,
  })
}

export function useGrammarPointsQuery(
  params?: { grammarType?: string; cefrLevel?: string },
  enabled = true
) {
  return useQuery<BackendGrammarPoint[]>({
    queryKey: vocabularyKeys.grammarPoints(params),
    queryFn: () => vocabularyService.getGrammarPoints(params),
    enabled,
    staleTime: 15 * 60 * 1000,
  })
}

