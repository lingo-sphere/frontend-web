// Service gọi API lấy thông tin quyền hạn, cài đặt phòng và tin nhắn cộng đồng.
import { api } from '@/services/api.client';
import { API_CONFIG } from '@/config/api.config';
import type {
  ChatRoom,
  EligibilityResponse,
  MessagesResponse,
} from '@/features/community/types/community.types';

export const communityService = {
  async getEligibility(): Promise<EligibilityResponse> {
    return api.get<EligibilityResponse>(API_CONFIG.ENDPOINTS.COMMUNITY.ELIGIBILITY);
  },

  async getRoom(): Promise<ChatRoom> {
    return api.get<ChatRoom>(API_CONFIG.ENDPOINTS.COMMUNITY.ROOM);
  },

  async getMessages(limit: number = 50, beforeId?: string): Promise<MessagesResponse> {
    const params: Record<string, string> = { limit: String(limit) };
    if (beforeId) params.before_id = beforeId;
    return api.get<MessagesResponse>(API_CONFIG.ENDPOINTS.COMMUNITY.MESSAGES, params);
  },

  async uploadChatImage(file: File): Promise<string> {
    const res = await api.upload<{
      url?: string;
      file_url?: string;
      public_url?: string;
    }>('/media/upload', file);
    return res?.url || res?.file_url || res?.public_url || '';
  },
};
