// Custom hook quản lý truy vấn và cập nhật thông báo với Optimistic Update bằng TanStack Query.
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '@/features/notifications/services/notification.service'
import { notificationKeys } from '@/features/notifications/keys/notification.keys'
import type { Notification } from '@/features/notifications/types/notification'

export function useMyNotifications(
  params?: { is_read?: boolean; category?: string },
  enabled = true
) {
  return useQuery<Notification[]>({
    queryKey: notificationKeys.mine(params),
    queryFn: () => notificationService.getMyNotifications(params),
    enabled,
    staleTime: 30 * 1000,
  })
}

export function useMarkNotificationAsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })
      const previousNotifications = queryClient.getQueryData<Notification[]>(notificationKeys.mine())
      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(
          notificationKeys.mine(),
          previousNotifications.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
        )
      }
      return { previousNotifications }
    },
    onError: (_err, _id, context) => {
      if (context?.previousNotifications !== undefined) {
        queryClient.setQueryData(notificationKeys.mine(), context.previousNotifications)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useMarkAllNotificationsAsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })
      const previousNotifications = queryClient.getQueryData<Notification[]>(notificationKeys.mine())
      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(
          notificationKeys.mine(),
          previousNotifications.map((n) => ({ ...n, is_read: true }))
        )
      }
      return { previousNotifications }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousNotifications !== undefined) {
        queryClient.setQueryData(notificationKeys.mine(), context.previousNotifications)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
