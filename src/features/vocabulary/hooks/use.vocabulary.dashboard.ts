/**
 * @file use.vocabulary.dashboard.ts
 * @description Hook lấy dữ liệu phân tích học tập từ vựng (Vocabulary Learning Analytics)
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { vocabularyService } from '../services/vocabulary.service'
import { vocabularyKeys } from '../keys/vocabulary.keys'
import type { VocabularyDashboardOverview } from '../types/vocabulary.dashboard'

export function useVocabularyDashboard() {
  const query = useQuery<VocabularyDashboardOverview>({
    queryKey: vocabularyKeys.dashboardOverview(),
    queryFn: () => vocabularyService.getDashboardOverview(),
    staleTime: 60 * 1000, // 1 phút
    refetchOnWindowFocus: false,
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
