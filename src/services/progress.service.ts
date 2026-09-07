// Service xử lý API tiến độ học tập, lộ trình và bài thi của người dùng.

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import {
  UserRoadmapProgressSchema,
  UserRoadmapProgressObjectSchema,
  type UserRoadmapProgress,
} from '@/schemas/course.schema'
import type { UserCourseProgressItem } from '@/types/api.types'

export type { UserRoadmapProgress, UserCourseProgressItem }

export const progressService = {
  async getMyRoadmapProgress(): Promise<UserRoadmapProgress | null> {
    try {
      const res = await api.get<UserRoadmapProgress | null | undefined>(
        API_CONFIG.ENDPOINTS.PROGRESS.ROADMAP_MY,
        undefined,
        UserRoadmapProgressSchema
      )
      return res ?? null
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
      UserRoadmapProgressObjectSchema
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

  async getMyCoursesProgress(): Promise<UserCourseProgressItem[]> {
    try {
      const res = await api.get<UserCourseProgressItem[]>(API_CONFIG.ENDPOINTS.PROGRESS.COURSES)
      return Array.isArray(res) ? res : []
    } catch {
      return []
    }
  },

  async getCourseProgressDetail(courseId: string): Promise<{
    course_progress: UserCourseProgressItem | null
    modules_progress: Array<Record<string, unknown>>
    completed_lesson_ids: string[]
  } | null> {
    try {
      return await api.get(API_CONFIG.ENDPOINTS.PROGRESS.COURSE_DETAIL(courseId))
    } catch {
      return null
    }
  },

  async getGrowthChart(courseId: string): Promise<{
    course_id: string
    growth_chart_data: Array<{ stage: string; score: number; timestamp?: string }>
  } | null> {
    try {
      return await api.get(API_CONFIG.ENDPOINTS.PROGRESS.GROWTH_CHART(courseId))
    } catch {
      return null
    }
  },

  async getMyTestAttempts(): Promise<Array<{
    attempt_id: string
    test_type: string
    course_id: string
    module_id?: string
    order_index?: number
    score: number
    correct_count: number
    total_questions: number
    is_passed: boolean
    submitted_at: string
  }>> {
    try {
      const res = await api.get<Array<{
        attempt_id: string
        test_type: string
        course_id: string
        module_id?: string
        order_index?: number
        score: number
        correct_count: number
        total_questions: number
        is_passed: boolean
        submitted_at: string
      }>>(API_CONFIG.ENDPOINTS.PROGRESS.TEST_ATTEMPTS)
      return Array.isArray(res) ? res : []
    } catch {
      return []
    }
  },
}
