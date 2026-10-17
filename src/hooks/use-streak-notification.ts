// Hook theo dõi sự kiện chuỗi Streak mới cập nhật để hiển thị popup chúc mừng (StreakCelebrationModal).
'use client'

import { useEffect, useState } from 'react'
import { useMyNotifications } from '@/features/notifications/hooks/use.notifications.query'

export interface StreakCelebrationState {
  open: boolean
  streak: number
  isNewRecord: boolean
  streakFreezesLeft?: number
}

export function useStreakNotification() {
  const [celebration, setCelebration] = useState<StreakCelebrationState>({
    open: false,
    streak: 0,
    isNewRecord: false,
  })

  // Poll hoặc fetch thông báo loại GAMIFICATION chưa đọc
  const { data: notifications } = useMyNotifications(
    { is_read: false, category: 'GAMIFICATION' },
    true,
  )

  useEffect(() => {
    if (!notifications || notifications.length === 0) return

    // Tìm thông báo STREAK_UPDATED mới nhất chưa đọc
    const streakNotif = notifications.find(
      (n) => n.notification_type === 'STREAK_UPDATED' && !n.is_read,
    )

    if (streakNotif) {
      const notifData = (streakNotif.data || {}) as Record<string, any>
      const currentStreak = Number(notifData.current_streak) || 1
      const isNewRecord = !!notifData.is_new_record
      const streakFreezesLeft = notifData.streak_freezes_left !== undefined ? Number(notifData.streak_freezes_left) : undefined

      // Đã hiển thị chưa trong session hiện tại để tránh pop nhiều lần
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

  // Lắng nghe sự kiện custom nội bộ nếu cần trigger trực tiếp từ client khi nộp bài
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

