/**
 * @file progress.service.ts
 * @description Service xử lý tiến độ học tập và lộ trình người dùng (User Roadmap Progress)
 */

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import {
  UserRoadmapProgressSchema,
  type UserRoadmapProgress,
} from '@/schemas/course.schema'

export type { UserRoadmapProgress }

export const progressService = {
  async getMyRoadmapProgress(): Promise<UserRoadmapProgress | null> {
    try {
      return await api.get<UserRoadmapProgress>(
        API_CONFIG.ENDPOINTS.PROGRESS.ROADMAP_MY,
        undefined,
        UserRoadmapProgressSchema
      )
    } catch {
      return null
    }
  },

  async enrollRoadmap(data: {
    roadmap_id: string
    baseline_score?: number
  }): Promise<UserRoadmapProgress> {
    return api.post<UserRoadmapProgress>(
      API_CONFIG.ENDPOINTS.PROGRESS.ROADMAP_ENROLL,
      data,
      UserRoadmapProgressSchema
    )
  },

  async recordCheckpointResult(data: {
    roadmap_id: string
    stage_order: number
    exam_id?: string
    course_id?: string
    score?: number
    checkpoint_score?: number
  }): Promise<UserRoadmapProgress> {
    const payload = {
      ...data,
      score: data.score ?? data.checkpoint_score ?? 80,
      checkpoint_score: data.checkpoint_score ?? data.score ?? 80,
    }
    return api.post<UserRoadmapProgress>(API_CONFIG.ENDPOINTS.PROGRESS.ROADMAP_CHECKPOINT, payload)
  },
}
