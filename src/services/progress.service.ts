/**
 * @file progress.service.ts
 * @description Service xử lý tiến độ học tập và lộ trình người dùng (User Roadmap Progress)
 */

import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { UserRoadmapProgress } from '@/types/api.types'

export const progressService = {
  /**
   * Lấy tiến độ lộ trình học tập hiện tại của người dùng
   */
  async getMyRoadmapProgress(): Promise<UserRoadmapProgress | null> {
    try {
      return await api.get<UserRoadmapProgress>(API_CONFIG.ENDPOINTS.PROGRESS.ROADMAP_MY)
    } catch {
      return null
    }
  },

  /**
   * Đăng ký tham gia một lộ trình học tập trọn gói
   */
  async enrollRoadmap(data: {
    roadmap_id: string
    baseline_score?: number
  }): Promise<UserRoadmapProgress> {
    return api.post<UserRoadmapProgress>(API_CONFIG.ENDPOINTS.PROGRESS.ROADMAP_ENROLL, data)
  },

  /**
   * Ghi nhận kết quả bài kiểm tra chặng (Checkpoint Exam) để cập nhật tăng trưởng
   */
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
