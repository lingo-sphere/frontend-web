// Custom hook quản lý hạn ngạch và tương tác dịch vụ AI qua TanStack Query.
'use client'

import { useQuery } from '@tanstack/react-query'
import { aiService, type UserAiQuotaSummary } from '@/features/ai-learning/services/ai.service'
import { aiKeys } from '@/features/ai-learning/keys/ai.keys'

export function useAiQuotaQuery(enabled = true) {
  return useQuery<UserAiQuotaSummary>({
    queryKey: aiKeys.quota(),
    queryFn: () => aiService.getAiQuota(),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}
