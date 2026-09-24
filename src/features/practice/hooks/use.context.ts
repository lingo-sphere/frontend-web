/**
 * @file use.context.ts
 * @description Hooks cho PracticeContext taxonomy
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import type { PracticeContext, ContextSearchResult, ListeningContextStats } from '../types/context.types'

/**
 * Lấy danh sách contexts với filter
 */
export function useContexts(params?: {
  parent_id?: string
  level?: number
  is_selectable?: boolean
}) {
  const queryParams = new URLSearchParams()
  if (params?.parent_id) queryParams.set('parent_id', params.parent_id)
  if (params?.level !== undefined) queryParams.set('level', String(params.level))
  if (params?.is_selectable !== undefined) queryParams.set('is_selectable', String(params.is_selectable))

  const queryString = queryParams.toString()

  return useQuery<PracticeContext[]>({
    queryKey: ['contexts', params],
    queryFn: () => api.get<PracticeContext[]>(
      `${API_CONFIG.ENDPOINTS.CONTEXT.LIST}${queryString ? `?${queryString}` : ''}`,
      undefined,
      undefined
    ),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Lấy context tree (hierarchical)
 */
export function useContextTree() {
  return useQuery<PracticeContext[]>({
    queryKey: ['contexts', 'tree'],
    queryFn: () => api.get<PracticeContext[]>(
      API_CONFIG.ENDPOINTS.CONTEXT.TREE,
      undefined,
      undefined
    ),
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Search contexts across all 3 levels
 */
export function useContextSearch(query: string, domain?: string) {
  return useQuery<ContextSearchResult[]>({
    queryKey: ['contexts', 'search', query, domain],
    queryFn: () => {
      const params = new URLSearchParams({ q: query })
      if (domain) params.set('domain', domain)
      return api.get<ContextSearchResult[]>(
        `${API_CONFIG.ENDPOINTS.CONTEXT.SEARCH}?${params.toString()}`,
        undefined,
        undefined
      )
    },
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Lấy thống kê context cho Listening (grouped by level)
 */
export function useListeningContextStats() {
  return useQuery<ListeningContextStats>({
    queryKey: ['contexts', 'listening-stats'],
    queryFn: () => api.get<ListeningContextStats>(
      API_CONFIG.ENDPOINTS.CONTEXT.LISTENING_STATS,
      undefined,
      undefined
    ),
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Lấy Level 0 contexts (root)
 */
export function useLevel0Contexts() {
  return useQuery<PracticeContext[]>({
    queryKey: ['contexts', 'level0'],
    queryFn: () => api.get<PracticeContext[]>(
      `${API_CONFIG.ENDPOINTS.CONTEXT.LIST}?level=0&is_selectable=true`,
      undefined,
      undefined
    ),
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Lấy Level 1 contexts (children of a Level 0)
 */
export function useLevel1Contexts(parentId?: string) {
  return useQuery<PracticeContext[]>({
    queryKey: ['contexts', 'level1', parentId],
    queryFn: () => api.get<PracticeContext[]>(
      `${API_CONFIG.ENDPOINTS.CONTEXT.LIST}?parent_id=${parentId}&is_selectable=true`,
      undefined,
      undefined
    ),
    enabled: !!parentId,
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Lấy chi tiết context theo ID
 */
export function useContextById(contextId?: string) {
  return useQuery<PracticeContext | null>({
    queryKey: ['contexts', 'detail', contextId],
    queryFn: async () => {
      try {
        return await api.get<PracticeContext>(`/practice/contexts/${contextId}`)
      } catch {
        return null
      }
    },
    enabled: !!contextId,
    staleTime: 10 * 60 * 1000,
    retry: false,
  })
}
