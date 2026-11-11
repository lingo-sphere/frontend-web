/**
 * @file use.vocabulary.dashboard.ts
 * @description Hook lấy dữ liệu phân tích học tập từ vựng (Vocabulary Learning Analytics)
 */

'use client'

import { useAuthStore } from '@/features/auth/store/auth.store'
import { useQuery } from '@tanstack/react-query'
import { vocabularyService } from '../services/vocabulary.service'
import { vocabularyKeys } from '../keys/vocabulary.keys'
import type { VocabularyDashboardOverview } from '../types/vocabulary.dashboard'

export function useVocabularyDashboard() {
  const userId = useAuthStore(state => state.user?.user_id)
  const query = useQuery<VocabularyDashboardOverview>({
    queryKey: [...vocabularyKeys.dashboardOverview(), userId],
    enabled: Boolean(userId),
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
