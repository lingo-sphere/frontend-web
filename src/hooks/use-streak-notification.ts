// Hook theo dõi sự kiện chuỗi Streak mới cập nhật để hiển thị popup chúc mừng
'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useMyNotifications, useMarkNotificationAsReadMutation } from '@/features/notifications/hooks/use.notifications.query'

export interface StreakCelebrationState {
  open: boolean
  streak: number
  isNewRecord: boolean
  streakFreezesLeft?: number
  notificationId?: string
}

export function useStreakNotification() {
  const pathname = usePathname() || '/'
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isCheckingAuth = useAuthStore((s) => s.isLoading)
  const markAsReadMutation = useMarkNotificationAsReadMutation()

  const [celebration, setCelebration] = useState<StreakCelebrationState>({
    open: false,
    streak: 0,
    isNewRecord: false,
  })

  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/verify-email') ||
    pathname === '/'

  const isEnabled = isAuthenticated && !isCheckingAuth && !isAuthPage

  const { data: notifications } = useMyNotifications(
    { is_read: false, category: 'GAMIFICATION' },
    isEnabled,
  )

  useEffect(() => {
    if (!isEnabled || !notifications || notifications.length === 0) return

    const streakNotif = notifications.find(
      (n) => n.notification_type === 'STREAK_UPDATED' && !n.is_read,
    )

    if (streakNotif) {
      const notifData = (streakNotif.data || {}) as Record<string, unknown>
      const currentStreak = Number(notifData.current_streak) || 1
      const isNewRecord = !!notifData.is_new_record
      const streakFreezesLeft = notifData.streak_freezes_left !== undefined ? Number(notifData.streak_freezes_left) : undefined
      const notifId = streakNotif._id || streakNotif.id

      const seenKey = `streak_seen_${notifId}`
      if (!sessionStorage.getItem(seenKey)) {
        setCelebration({
          open: true,
          streak: currentStreak,
          isNewRecord,
          streakFreezesLeft,
          notificationId: notifId,
        })
      }
    }
  }, [isEnabled, notifications])

  useEffect(() => {
    const handleClientStreakEvent = (e: Event) => {
      if (isAuthPage) return
      const customEvent = e as CustomEvent<{
        streak: number
        isNewRecord?: boolean
        streakFreezesLeft?: number
      }>
      if (customEvent.detail) {
        setCelebration({
          open: true,
          streak: customEvent.detail.streak || 1,
          isNewRecord: !!customEvent.detail.isNewRecord,
          streakFreezesLeft: customEvent.detail.streakFreezesLeft,
        })
      }
    }

    window.addEventListener('lingosphere:streak-celebration', handleClientStreakEvent)
    return () => {
      window.removeEventListener('lingosphere:streak-celebration', handleClientStreakEvent)
    }
  }, [isAuthPage])

  const closeCelebration = useCallback(() => {
    if (celebration.notificationId) {
      sessionStorage.setItem(`streak_seen_${celebration.notificationId}`, 'true')
      markAsReadMutation.mutate(celebration.notificationId)
    }
    setCelebration((prev) => ({ ...prev, open: false }))
  }, [celebration.notificationId, markAsReadMutation])

  return {
    celebration,
    closeCelebration,
  }
}
