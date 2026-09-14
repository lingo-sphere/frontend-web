// Custom hook quản lý truy vấn dữ liệu lộ trình học tập bằng TanStack Query.
'use client'

import { useQuery } from '@tanstack/react-query'
import { courseService } from '@/features/courses/services/course.service'
import { roadmapKeys } from '@/features/roadmap/keys/roadmap.keys'
import type { LearningRoadmap } from '@/types/api.types'

export type RoadmapQueryParams = {
  skills_focus?: string
  is_published?: boolean
}

export function useAllRoadmapsQuery(params?: RoadmapQueryParams, enabled = true) {
  return useQuery<LearningRoadmap[]>({
    queryKey: roadmapKeys.list(params),
    queryFn: () => courseService.getAllRoadmaps(params),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useRoadmapDetailQuery(roadmapId: string, enabled = true) {
  return useQuery<LearningRoadmap>({
    queryKey: roadmapKeys.detail(roadmapId),
    queryFn: () => courseService.getRoadmapById(roadmapId),
    enabled: Boolean(roadmapId) && enabled,
    staleTime: 5 * 60 * 1000,
  })
}
