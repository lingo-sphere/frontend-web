'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icons/icon-map'
import { mockNotifications, markAsRead, markAllAsRead, getUnreadCount } from '@/data/notifications-data'
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

export function NotificationsPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [activeTab, setActiveTab] = useState<'ALL' | NotificationCategory>('ALL')
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [showRead, setShowRead] = useState(true)

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

  const unreadCount = getUnreadCount(notifications)

  const handleMarkAsRead = (id: string) => {
    setNotifications(markAsRead(notifications, id))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(markAllAsRead(notifications))
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
    <Layout>
      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
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
              {tab.label[isVietnamese ? 'vi' : 'en']}
            </button>
          ))}
        </div>

        <div className="mb-4 flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={showRead}
              onChange={(e) => setShowRead(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            {isVietnamese ? 'Hiển thị thông báo đã đọc' : 'Show read notifications'}
          </label>
        </div>

        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Icon name="bellOff" size={48} className="mb-4 text-text-tertiary" />
                <p className="text-lg font-medium text-text-primary">{t('notifications.noNotifications')}</p>
                <p className="text-sm text-text-tertiary">{t('notifications.allCaughtUp')}</p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
                formatTime={formatTime}
                isVietnamese={isVietnamese}
              />
            ))
          )}
        </div>
      </main>

      {selectedNotification && (
        <NotificationModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          isVietnamese={isVietnamese}
        />
      )}
    </Layout>
  )
}

function NotificationItem({
  notification,
  onClick,
  formatTime,
  isVietnamese,
}: {
  notification: Notification
  onClick: () => void
  formatTime: (date: string) => string
  isVietnamese: boolean
}) {
  const categoryColor = getCategoryColor(notification.notificationCategory)

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        notification.isRead ? 'opacity-70' : ''
      } ${notification.isPinned ? 'border-primary/30 bg-primary/5' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex gap-3" onClick={onClick}>
          <div className={`mt-1 shrink-0 rounded-xl p-2 ${categoryColor}/10`}>
            <Icon
              name={getNotificationIcon(notification.notificationType)}
              size={20}
              className={categoryColor.replace('bg-', 'text-')}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {notification.isPinned && <Icon name="pin" size={12} className="text-primary" />}
                  <h4 className={`font-medium ${notification.isRead ? 'text-text-secondary' : 'text-text-primary'}`}>
                    {isVietnamese && notification.titleVi ? notification.titleVi : notification.title}
                  </h4>
                </div>
                <p className="mt-1 text-sm text-text-tertiary line-clamp-2">
                  {isVietnamese && notification.contentVi ? notification.contentVi : notification.content}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-xs text-text-tertiary">{formatTime(notification.createdAt)}</span>
                {!notification.isRead && <div className="mt-1 ml-auto h-2 w-2 rounded-full bg-primary" />}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${categoryColor} text-white`}>
                {getCategoryLabel(notification.notificationCategory)}
              </span>
              {notification.priority !== 'NORMAL' && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityColors[notification.priority]}`}
                >
                  {notification.priority}
                </span>
              )}
              <div className="flex gap-1">
                {notification.channels.map((ch) => (
                  <span key={ch} className="rounded bg-surface-subtle px-1.5 py-0.5 text-[10px] text-text-tertiary">
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function NotificationModal({
  notification,
  onClose,
  isVietnamese,
}: {
  notification: Notification
  onClose: () => void
  isVietnamese: boolean
}) {
  const { t } = useTranslation()
  const categoryColor = getCategoryColor(notification.notificationCategory)
  const categoryLabel = getCategoryLabel(notification.notificationCategory)

  const formatDateTime = (dateString: string) => {
    const locale = isVietnamese ? 'vi-VN' : 'en-US'
    return new Date(dateString).toLocaleString(locale, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-2 ${categoryColor}/10`}>
                <Icon
                  name={getNotificationIcon(notification.notificationType)}
                  size={24}
                  className={categoryColor.replace('bg-', 'text-')}
                />
              </div>
              <div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor} text-white`}>
                  {categoryLabel}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-text-tertiary hover:text-text-primary">
              <Icon name="x" size={20} />
            </button>
          </div>

          <h3 className="mb-2 text-lg font-semibold text-text-primary">
            {isVietnamese && notification.titleVi ? notification.titleVi : notification.title}
          </h3>

          <p className="mb-4 text-sm text-text-tertiary">{formatDateTime(notification.createdAt)}</p>

          <div className="mb-6 rounded-xl bg-surface-subtle p-4">
            <p className="text-text-primary">
              {isVietnamese && notification.contentVi ? notification.contentVi : notification.content}
            </p>
          </div>

          {notification.data && Object.keys(notification.data).length > 0 && (
            <div className="mb-6">
              <h4 className="mb-2 text-sm font-medium text-text-secondary">
                {isVietnamese ? 'Chi tiết' : 'Details'}
              </h4>
              <div className="rounded-lg border border-surface-subtle p-3">
                <pre className="text-xs text-text-tertiary overflow-x-auto">
                  {JSON.stringify(notification.data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="mb-6 flex flex-wrap gap-2 text-xs text-text-tertiary">
            <span>
              {isVietnamese ? 'Kênh' : 'Channels'}: {notification.channels.join(', ')}
            </span>
            {notification.sourceService && (
              <span>
                {isVietnamese ? 'Nguồn' : 'Source'}: {notification.sourceService}
              </span>
            )}
            {notification.sourceId && <span>ID: {notification.sourceId}</span>}
          </div>

          <div className="flex gap-3">
            {notification.actionUrl && (
              <Button className="flex-1" onClick={() => (window.location.href = notification.actionUrl!)}>
                {notification.actionLabel || (isVietnamese ? 'Xem' : 'View')}
              </Button>
            )}
            <Button variant="outline" className="flex-1" onClick={onClose}>
              {t('common.close')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getNotificationIcon(type: string): string {
  const iconMap: Record<string, string> = {
    LOGIN_SUCCESS: 'logIn',
    LOGIN_FAILED: 'alertTriangle',
    PASSWORD_CHANGED: 'lock',
    EMAIL_VERIFIED: 'checkCircle',
    TWO_FACTOR_ENABLED: 'shield',
    ACCOUNT_BLOCKED: 'xCircle',
    NEW_LOGIN_LOCATION: 'mapPin',
    SUBSCRIPTION_CREATED: 'creditCard',
    SUBSCRIPTION_RENEWED: 'refresh',
    SUBSCRIPTION_EXPIRING: 'clock',
    SUBSCRIPTION_EXPIRED: 'alertCircle',
    PAYMENT_SUCCESS: 'checkCircle',
    PAYMENT_FAILED: 'xCircle',
    STREAK_REMINDER: 'flame',
    STREAK_BROKEN: 'zapOff',
    STREAK_MILESTONE: 'award',
    LEVEL_UP: 'trendingUp',
    XP_MILESTONE: 'star',
    ACHIEVEMENT_UNLOCKED: 'trophy',
    GEM_EARNED: 'gem',
    SRS_DUE: 'clock',
    NEW_CARDS_AVAILABLE: 'plusCircle',
    DECK_COMPLETED: 'checkCircle',
    VOCABULARY_MASTERED: 'checkSquare',
    PRACTICE_SESSION_REMINDER: 'activity',
    SPEAKING_EVALUATION_READY: 'mic',
    WRITING_EVALUATION_READY: 'pencil',
    LISTENING_EVALUATION_READY: 'headphones',
    TOEIC_TEST_REMINDER: 'fileText',
    TOEIC_RESULT_READY: 'barChart',
    TOEIC_SCORE_IMPROVED: 'trendingUp',
    TOEIC_PART_WEAK: 'alertTriangle',
    COURSE_ENROLLED: 'book',
    LESSON_AVAILABLE: 'playCircle',
    LESSON_COMPLETED: 'checkCircle',
    COURSE_COMPLETED: 'graduation',
    COURSE_CERTIFICATE_READY: 'award',
    AI_QUOTA_WARNING: 'alertTriangle',
    AI_RECOMMENDATION_AVAILABLE: 'lightbulb',
    DAILY_GOAL_REMINDER: 'target',
    DAILY_GOAL_COMPLETED: 'checkCircle',
    SYSTEM_MAINTENANCE: 'settings',
  }
  return iconMap[type] || 'bell'
}
