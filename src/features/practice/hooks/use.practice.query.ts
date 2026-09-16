// Custom hook quản lý truy vấn các bài tập luyện nghe, nói, viết và nhật ký bằng TanStack Query.
'use client'

import { useQuery } from '@tanstack/react-query'
import {
  practiceService,
  type BackendListeningExercise,
  type BackendSpeakingExercise,
  type BackendWritingExercise,
  type DailyJournalPrompt,
} from '@/features/practice/services/practice.service'
import { practiceKeys } from '@/features/practice/keys/practice.keys'

export function useDailyJournalPromptQuery(enabled = true) {
  return useQuery<DailyJournalPrompt>({
    queryKey: practiceKeys.dailyJournalPrompt(),
    queryFn: () => practiceService.getDailyJournalPrompt(),
    enabled,
    staleTime: 60 * 60 * 1000,
  })
}

export function useListeningExercisesQuery(params?: { part?: number; level?: string }, enabled = true) {
  return useQuery<BackendListeningExercise[]>({
    queryKey: practiceKeys.listening(params),
    queryFn: () => practiceService.getListeningExercises(params),
    enabled,
    staleTime: 10 * 60 * 1000,
  })
}

export function useSpeakingExercisesQuery(params?: { part?: number }, enabled = true) {
  return useQuery<BackendSpeakingExercise[]>({
    queryKey: practiceKeys.speaking(params),
    queryFn: () => practiceService.getSpeakingExercises(params),
    enabled,
    staleTime: 10 * 60 * 1000,
  })
}

export function useWritingExercisesQuery(enabled = true) {
  return useQuery<BackendWritingExercise[]>({
    queryKey: practiceKeys.writing(),
    queryFn: () => practiceService.getWritingExercises(),
    enabled,
    staleTime: 10 * 60 * 1000,
  })
}
