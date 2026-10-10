// Custom hook quản lý truy vấn các bài tập luyện nghe, nói, viết bằng TanStack Query.
'use client'

import { useQuery } from '@tanstack/react-query'
import {
  practiceService,
  type BackendListeningPracticeItemPaginated,
  type BackendSpeakingExercise,
  type BackendWritingExercise,
} from '@/features/practice/services/practice.service'
import { practiceKeys } from '@/features/practice/keys/practice.keys'

export function useListeningPracticeItemsQuery(params?: { difficulty?: string; contextId?: string; cefrLevel?: string; page?: number; limit?: number }, enabled = true) {
  return useQuery<BackendListeningPracticeItemPaginated>({
    queryKey: practiceKeys.listeningPracticeItems(params),
    queryFn: () => practiceService.getListeningPracticeItems(params),
    enabled,
    staleTime: 5 * 60 * 1000,
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

export function useWritingExerciseByIdQuery(id: string | null, enabled = true) {
  return useQuery<BackendWritingExercise>({
    queryKey: practiceKeys.writingDetail(id || ''),
    queryFn: () => practiceService.getWritingExerciseById(id!),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  })
}

import type { WritingRecommendationResponse } from '@/features/practice/types/writing'

export function useWritingRecommendationsQuery(userId: string | null, limit = 4, enabled = true) {
  return useQuery<WritingRecommendationResponse>({
    queryKey: ['writing', 'recommendations', userId, limit],
    queryFn: () => practiceService.getWritingRecommendations(userId!, limit),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes - recommendations can change
  })
}

import type { SpeakingAttempt, UserSpeakingProfile } from '@/features/practice/types/speaking'

export function useSpeakingAttemptsQuery(limit = 20, enabled = true) {
  return useQuery<SpeakingAttempt[]>({
    queryKey: ['speaking', 'attempts', 'my', limit],
    queryFn: () => practiceService.getMySpeakingAttempts(limit),
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useSpeakingProfileQuery(enabled = true) {
  return useQuery<UserSpeakingProfile>({
    queryKey: ['speaking', 'profile', 'my'],
    queryFn: () => practiceService.getMySpeakingProfile(),
    enabled,
    staleTime: 60 * 1000,
  })
}
