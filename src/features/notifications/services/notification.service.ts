// Service xử lý API thông báo và tùy chọn nhận tin của người dùng.

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import type { Notification } from '@/features/notifications/types/notification'

export const notificationService = {
  async getMyNotifications(params?: { is_read?: boolean; category?: string }): Promise<Notification[]> {
    try {
      const queryParts: string[] = []
      if (params?.is_read !== undefined) queryParts.push(`is_read=${params.is_read}`)
      if (params?.category) queryParts.push(`category=${params.category}`)
      const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : ''

      const res = await api.get<Notification[]>(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS.MY}${query}`)
      return Array.isArray(res) ? res : []
    } catch {
      return []
    }
  },

  async markAsRead(notificationId: string): Promise<Notification | null> {
    try {
      return await api.put<Notification>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId))
    } catch {
      return null
    }
  },

  async markAllAsRead(): Promise<boolean> {
    try {
      await api.put(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)
      return true
    } catch {
      return false
    }
  },
}
