// Dịch vụ kết nối API quản lý Sổ tay câu sai (Mistake Vault), ôn tập ngắt quãng SRS và luyện đề theo chủ đề.

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import type {
  BatchRecordMistakesPayload,
  QueryMistakesParams,
  MistakesResponse,
  DueMistakesResponse,
  ReviewMistakePayload,
  ReviewMistakeResponse,
  TopicDrillResponse,
} from '@/features/practice/types/mistake'

export const mistakeService = {
  async recordBatchMistakes(payload: BatchRecordMistakesPayload): Promise<{ recorded_count: number }> {
    return api.post<{ recorded_count: number }>(API_CONFIG.ENDPOINTS.PRACTICE.MISTAKES_RECORD_BATCH, payload)
  },

  async getMyMistakes(params?: QueryMistakesParams): Promise<MistakesResponse> {
    return api.get<MistakesResponse>(
      API_CONFIG.ENDPOINTS.PRACTICE.MISTAKES_MY,
      params as Record<string, unknown>,
    )
  },

  async getDueMistakes(): Promise<DueMistakesResponse> {
    return api.get<DueMistakesResponse>(API_CONFIG.ENDPOINTS.PRACTICE.MISTAKES_DUE)
  },

  async reviewMistake(mistakeId: string, payload: ReviewMistakePayload): Promise<ReviewMistakeResponse> {
    return api.post<ReviewMistakeResponse>(
      API_CONFIG.ENDPOINTS.PRACTICE.MISTAKE_REVIEW(mistakeId),
      payload,
    )
  },

  async getTopicDrillQuestions(params: { tag: string; limit?: number }): Promise<TopicDrillResponse> {
    return api.get<TopicDrillResponse>(
      API_CONFIG.ENDPOINTS.PRACTICE.TOPIC_DRILL,
      params as Record<string, unknown>,
    )
  },

  async deleteMistake(mistakeId: string): Promise<{ success: boolean; message?: string }> {
    return api.delete<{ success: boolean; message?: string }>(
      API_CONFIG.ENDPOINTS.PRACTICE.MISTAKE_DELETE(mistakeId),
    )
  },
}
