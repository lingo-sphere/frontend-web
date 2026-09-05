/**
 * @file page.tsx
 * @description Thành phần Page phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (portal)/notifications
 */

import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icons/icon.map'
import { api } from '@/services/api.client'
import { getCategoryColor, getCategoryLabel } from '@/types/notification'
import type { Notification, NotificationCategory } from '@/types/notification'

const categoryTabs: { key: 'ALL' | NotificationCategory; label: { vi: string; en: string } }[] = [
  { key: 'ALL', label: { vi: 'Tất cả', en: 'All' } },
  { key: 'AUTH', label: { vi: 'Bảo mật', en: 'Auth' } },
  { key: 'SUBSCRIPTION', label: { vi: 'Đăng ký', en: 'Subscription' } },
  { key: 'GAMIFICATION', label: { vi: 'Gamification', en: 'Gamification' } },
  { key: 'VOCABULARY', label: { vi: 'Từ vựng', en: 'Vocabulary' } },
  { key: 'PRACTICE', label: { vi: 'Luyện tập', en: 'Practice' } },
  { key: 'EXAM', label: { vi: 'Bài thi', en: 'Exam' } },
  { key: 'COURSE', label: { vi: 'Khóa học', en: 'Course' } },
  { key: 'AI', label: { vi: 'AI', en: 'AI' } },
]

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-600',
  NORMAL: 'bg-blue-100 text-blue-600',
  HIGH: 'bg-orange-100 text-orange-600',
  URGENT: 'bg-red-100 text-red-600',
  CRITICAL: 'bg-red-600 text-white',
}

export default function NotificationsAppPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'ALL' | NotificationCategory>('ALL')
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [showRead, setShowRead] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchNotifications = async () => {
      try {
        setIsLoading(true)
        const res = await api.get<Notification[]>('/notifications/my').catch(() => [])
        if (isMounted && Array.isArray(res)) {
          setNotifications(res)
        }
      } catch (err) {
        console.error('Failed to load notifications:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchNotifications()
    return () => {
      isMounted = false
    }
  }, [])

  const filteredNotifications = useMemo(() => {
    let filtered = notifications

    if (activeTab !== 'ALL') {
      filtered = filtered.filter((n) => n.notificationCategory === activeTab)
    }

    if (!showRead) {
      filtered = filtered.filter((n) => !n.isRead)
    }

    filtered = [...filtered].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return filtered
  }, [notifications, activeTab, showRead])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    api.post(`/notifications/${id}/read`).catch(() => {})
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    api.post('/notifications/my/read-all').catch(() => {})
  }

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification)
    if (!notification.isRead) {
      handleMarkAsRead(notification.id)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return isVietnamese ? 'Vừa xong' : 'Just now'
    if (diffMins < 60) return `${diffMins}m ${isVietnamese ? 'trước' : 'ago'}`
    if (diffHours < 24) return `${diffHours}h ${isVietnamese ? 'trước' : 'ago'}`
    if (diffDays < 7) return `${diffDays}d ${isVietnamese ? 'trước' : 'ago'}`
    return date.toLocaleDateString()
  }

  return (
    <>
      <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="bell" size={24} className="text-text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{t('notifications.title')}</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-text-tertiary">
                  {unreadCount} {isVietnamese ? 'thông báo chưa đọc' : 'unread notifications'}
                </p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              {t('notifications.markAllRead')}
            </Button>
          )}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {categoryTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-surface-subtle text-text-secondary hover:bg-surface-hover'
              }`}
            >
              {isVietnamese ? tab.label.vi : tab.label.en}
            </button>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            {isVietnamese ? 'Hiển thị' : 'Showing'} {filteredNotifications.length}{' '}
            {isVietnamese ? 'thông báo' : 'notifications'}
          </span>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={showRead}
              onChange={(e) => setShowRead(e.target.checked)}
              className="rounded border-border"
            />
            {isVietnamese ? 'Hiện thông báo đã đọc' : 'Show read notifications'}
          </label>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.isRead ? 'border-primary/50 bg-primary/5' : ''
                }`}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div
                    className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getCategoryColor(
                      notification.notificationCategory,
                    )}`}
                  >
                    <Icon name="bell" size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase text-primary">
                          {getCategoryLabel(notification.notificationCategory)}
                        </span>
                        {notification.isPinned && (
                          <span className="rounded bg-warning/10 px-1.5 py-0.5 text-[10px] font-bold text-warning">
                            PINNED
                          </span>
                        )}
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            priorityColors[notification.priority]
                          }`}
                        >
                          {notification.priority}
                        </span>
                      </div>
                      <span className="text-xs text-text-tertiary">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <h3 className="mt-1 font-semibold text-text-primary">
                      {isVietnamese && notification.titleVi ? notification.titleVi : notification.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-text-secondary line-clamp-2">
                      {isVietnamese && notification.contentVi ? notification.contentVi : notification.content}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <Icon name="bell" size={48} className="mx-auto mb-3 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary">
              {isVietnamese ? 'Không có thông báo nào' : 'No notifications'}
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              {isVietnamese ? 'Bạn đã xem hết tất cả thông báo mới' : "You're all caught up!"}
            </p>
          </div>
        )}
      </main>
    </>
  )
}
