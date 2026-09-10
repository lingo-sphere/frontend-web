// Trang giao diện hiển thị danh sách thông báo và tương tác của người dùng.

'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { Icon } from '@/components/icon.map'
import { useNavigate } from '@/lib/navigation'
import { notificationService } from '@/features/notifications/services/notification.service'
import { getCategoryColor, getCategoryLabel } from '@/features/notifications/types/notification'
import type { Notification, NotificationCategory } from '@/features/notifications/types/notification'

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

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  NORMAL: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  HIGH: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
  URGENT: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
  CRITICAL: 'bg-red-600 text-white',
}

export default function NotificationsAppPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isVietnamese = i18n.language === 'vi'
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'ALL' | NotificationCategory>('ALL')
  const [showRead, setShowRead] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchNotifications = async () => {
      try {
        setIsLoading(true)
        const res = await notificationService.getMyNotifications()
        if (isMounted) {
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
      filtered = filtered.filter((n) => n.notification_category === activeTab)
    }

    if (!showRead) {
      filtered = filtered.filter((n) => !n.is_read)
    }

    filtered = [...filtered].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1
      if (!a.is_pinned && b.is_pinned) return 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return filtered
  }, [notifications, activeTab, showRead])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => ((n._id === id || n.id === id) ? { ...n, is_read: true } : n)))
    await notificationService.markAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    await notificationService.markAllAsRead()
  }

  const handleNotificationClick = async (notification: Notification) => {
    const notifId = notification._id || notification.id || ''
    if (!notification.is_read && notifId) {
      await handleMarkAsRead(notifId)
    }
    if (notification.action_url) {
      navigate(notification.action_url)
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
            {filteredNotifications.map((notification, idx) => {
              const notifId = notification._id || notification.id || `notif-${idx}`
              return (
                <Card
                  key={notifId}
                  onClick={() => handleNotificationClick(notification)}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !notification.is_read ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="flex items-start gap-4 p-4">
                    <div
                      className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getCategoryColor(
                        notification.notification_category,
                      )}`}
                    >
                      <Icon name="bell" size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase text-primary">
                            {getCategoryLabel(notification.notification_category)}
                          </span>
                          {notification.is_pinned && (
                            <span className="rounded bg-warning/10 px-1.5 py-0.5 text-[10px] font-bold text-warning">
                              PINNED
                            </span>
                          )}
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              priorityColors[notification.priority] || priorityColors.NORMAL
                            }`}
                          >
                            {notification.priority}
                          </span>
                        </div>
                        <span className="text-xs text-text-tertiary">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                      <h3 className="mt-1 font-semibold text-text-primary">
                        {isVietnamese && notification.title_vi ? notification.title_vi : notification.title}
                      </h3>
                      <p className="mt-0.5 text-sm text-text-secondary line-clamp-2">
                        {isVietnamese && notification.content_vi ? notification.content_vi : notification.content}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </CardContent>
                </Card>
              )
            })}
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
