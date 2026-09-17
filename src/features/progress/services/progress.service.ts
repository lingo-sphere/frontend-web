// Service xử lý API tiến độ học tập và bài thi của người dùng.

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import type { UserCourseProgressItem } from '@/types/api.types'

export type { UserCourseProgressItem }

export const progressService = {

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
