// Custom hook quản lý truy vấn và cập nhật Sổ tay câu sai (Mistake Vault) bằng TanStack Query.

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mistakeService } from '@/features/practice/services/mistake.service'
import { practiceKeys } from '@/features/practice/keys/practice.keys'
import type {
  BatchRecordMistakesPayload,
  QueryMistakesParams,
  MistakesResponse,
  DueMistakesResponse,
  ReviewMistakePayload,
  ReviewMistakeResponse,
  TopicDrillResponse,
} from '@/features/practice/types/mistake'

export function useMyMistakesQuery(params?: QueryMistakesParams, enabled = true) {
  return useQuery<MistakesResponse>({
    queryKey: practiceKeys.mistakes(params),
    queryFn: () => mistakeService.getMyMistakes(params),
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useDueMistakesQuery(enabled = true) {
  return useQuery<DueMistakesResponse>({
    queryKey: practiceKeys.mistakesDue(),
    queryFn: () => mistakeService.getDueMistakes(),
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useTopicDrillQuery(tag: string, limit = 10, enabled = true) {
  return useQuery<TopicDrillResponse>({
    queryKey: practiceKeys.topicDrill(tag, limit),
    queryFn: () => mistakeService.getTopicDrillQuestions({ tag, limit }),
    enabled: enabled && Boolean(tag.trim()),
    staleTime: 5 * 60 * 1000,
  })
}

export function useReviewMistakeMutation() {
  const queryClient = useQueryClient()

  return useMutation<ReviewMistakeResponse, Error, { mistakeId: string; payload: ReviewMistakePayload }>({
    mutationFn: ({ mistakeId, payload }) => mistakeService.reviewMistake(mistakeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceKeys.mistakes() })
      queryClient.invalidateQueries({ queryKey: practiceKeys.mistakesDue() })
    },
  })
}

export function useRecordBatchMistakesMutation() {
  const queryClient = useQueryClient()

  return useMutation<{ recorded_count: number }, Error, BatchRecordMistakesPayload>({
    mutationFn: (payload) => mistakeService.recordBatchMistakes(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceKeys.mistakes() })
      queryClient.invalidateQueries({ queryKey: practiceKeys.mistakesDue() })
    },
  })
}

export function useDeleteMistakeMutation() {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean; message?: string }, Error, string>({
    mutationFn: (mistakeId) => mistakeService.deleteMistake(mistakeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceKeys.mistakes() })
      queryClient.invalidateQueries({ queryKey: practiceKeys.mistakesDue() })
    },
  })
}

