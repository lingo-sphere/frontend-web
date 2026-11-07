// Hook theo dõi sự kiện chuỗi Streak mới cập nhật để hiển thị popup chúc mừng
'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useMyNotifications } from '@/features/notifications/hooks/use.notifications.query'

export interface StreakCelebrationState {
  open: boolean
  streak: number
  isNewRecord: boolean
  streakFreezesLeft?: number
}

export function useStreakNotification() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [celebration, setCelebration] = useState<StreakCelebrationState>({
    open: false,
    streak: 0,
    isNewRecord: false,
  })

  const { data: notifications } = useMyNotifications(
    { is_read: false, category: 'GAMIFICATION' },
    isAuthenticated,
  )

  useEffect(() => {
    if (!notifications || notifications.length === 0) return

    const streakNotif = notifications.find(
      (n) => n.notification_type === 'STREAK_UPDATED' && !n.is_read,
    )

    if (streakNotif) {
      const notifData = (streakNotif.data || {}) as Record<string, unknown>
      const currentStreak = Number(notifData.current_streak) || 1
      const isNewRecord = !!notifData.is_new_record
      const streakFreezesLeft = notifData.streak_freezes_left !== undefined ? Number(notifData.streak_freezes_left) : undefined

      const seenKey = `streak_seen_${streakNotif._id || streakNotif.id}`
      if (!sessionStorage.getItem(seenKey)) {
        sessionStorage.setItem(seenKey, 'true')
        setCelebration({
          open: true,
          streak: currentStreak,
          isNewRecord,
          streakFreezesLeft,
        })
      }
    }
  }, [notifications])

  useEffect(() => {
    const handleClientStreakEvent = (e: Event) => {
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
  }, [])

  const closeCelebration = () => {
    setCelebration((prev) => ({ ...prev, open: false }))
  }

  return {
    celebration,
    closeCelebration,
  }
}
