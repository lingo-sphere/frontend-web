// Hook theo dõi sự kiện chuỗi Streak mới cập nhật và chào mừng chuỗi ngày khi đăng nhập vào hệ thống
'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useMyNotifications, useMarkNotificationAsReadMutation } from '@/features/notifications/hooks/use.notifications.query'
import { useGamificationProfileQuery } from '@/features/progress/hooks/use.progress.query'

export interface StreakCelebrationState {
  open: boolean
  streak: number
  isNewRecord: boolean
  streakFreezesLeft?: number
  notificationId?: string
}

export function useStreakNotification() {
  const pathname = usePathname() || '/'
  const user = useAuthStore((s) => s.user)
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

  const { data: gamification } = useGamificationProfileQuery(isEnabled)

  const userId = user?.user_id
  const streakCount = gamification?.current_streak ?? 0
  const freezesLeft = gamification?.streak_freezes_left

  useEffect(() => {
    if (!isEnabled || !userId) return

    if (notifications && notifications.length > 0) {
      const streakNotif = notifications.find(
        (n) => n.notification_type === 'STREAK_UPDATED' && !n.is_read,
      )

      if (streakNotif) {
        const notifData = (streakNotif.data || {}) as Record<string, unknown>
        const currentStreak = Number(notifData.current_streak) || streakCount || 1
        const isNewRecord = !!notifData.is_new_record
        const streakFreezesLeft = notifData.streak_freezes_left !== undefined ? Number(notifData.streak_freezes_left) : freezesLeft
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
          sessionStorage.setItem(`lingo_streak_welcome_${userId}`, 'true')
          return
        }
      }
    }

    if (streakCount >= 1) {
      const sessionKey = `lingo_streak_welcome_${userId}`
      const alreadyShown = sessionStorage.getItem(sessionKey)
      if (!alreadyShown) {
        setCelebration({
          open: true,
          streak: streakCount,
          isNewRecord: false,
          streakFreezesLeft: freezesLeft,
        })
        sessionStorage.setItem(sessionKey, 'true')
      }
    }
  }, [isEnabled, notifications, streakCount, freezesLeft, userId])

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
    if (userId) {
      sessionStorage.setItem(`lingo_streak_welcome_${userId}`, 'true')
    }
    setCelebration((prev) => ({ ...prev, open: false }))
  }, [celebration.notificationId, markAsReadMutation, userId])

  return {
    celebration,
    closeCelebration,
  }
}
