// Component nút chuông và dropdown danh sách thông báo trên Header.

'use client'

import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip'
import { Icon } from '@/components/icon.map'
import { useNavigate } from '@/lib/navigation'
import { getCategoryColor, getCategoryLabel } from '@/features/notifications/types/notification'
import type { Notification } from '@/features/notifications/types/notification'
import { getNotifIcon, formatNotifTime } from '@/layouts/header.utils'

interface HeaderNotificationDropdownProps {
  notifications: Notification[]
  unreadCount: number
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  onMarkAsRead: (id: string) => void
  onAction?: (msg: string) => void
  isVi: boolean
}

export function HeaderNotificationDropdown({
  notifications,
  unreadCount,
  isOpen,
  onToggle,
  onClose,
  onMarkAsRead,
  onAction,
  isVi,
}: HeaderNotificationDropdownProps) {
  const navigate = useNavigate()

  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label="Notifications"
            className="relative h-9 w-9 rounded-xl border-border"
            onClick={onToggle}
            size="icon"
            variant="outline"
          >
            <Icon name="bell" size={17} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isVi ? 'Thông báo' : 'Notifications'}</TooltipContent>
      </Tooltip>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <Card className="absolute right-0 top-full z-50 mt-2 w-80 shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-3">
              <span suppressHydrationWarning className="font-semibold text-text-primary">
                {isVi ? 'Thông báo' : 'Notifications'}
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
                  {unreadCount} {isVi ? 'mới' : 'new'}
                </span>
              )}
            </div>
            <CardContent className="max-h-96 overflow-y-auto p-0">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Icon name="bellOff" size={32} className="mb-2 text-text-tertiary" />
                  <p suppressHydrationWarning className="text-sm text-text-tertiary">
                    {isVi ? 'Không có thông báo' : 'No notifications'}
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const notifId = notif._id || notif.id || ''
                  return (
                    <div
                      key={notifId}
                      className={`flex cursor-pointer items-start gap-3 border-b border-border p-3 last:border-0 hover:bg-surface-subtle ${
                        !notif.is_read ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => {
                        onMarkAsRead(notifId)
                        if (onAction) onAction(`Viewed: ${notif.title}`)
                      }}
                    >
                      <div className={`mt-0.5 shrink-0 rounded-lg p-1.5 ${getCategoryColor(notif.notification_category)}/10`}>
                        <Icon
                          name={getNotifIcon(notif.notification_type)}
                          size={14}
                          className={getCategoryColor(notif.notification_category).replace('bg-', 'text-')}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`truncate text-sm ${notif.is_read ? 'text-text-secondary' : 'font-medium text-text-primary'}`}>
                            {isVi && notif.title_vi ? notif.title_vi : notif.title}
                          </span>
                          {!notif.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs text-text-tertiary">
                          {isVi && notif.content_vi ? notif.content_vi : notif.content}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] text-text-tertiary">{formatNotifTime(notif.created_at)}</span>
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${getCategoryColor(notif.notification_category)} text-white`}>
                            {getCategoryLabel(notif.notification_category, isVi)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
            <div className="border-t border-border p-2">
              <Button
                variant="ghost"
                className="w-full text-xs text-primary"
                onClick={() => {
                  onClose()
                  navigate('/notifications')
                }}
              >
                <span suppressHydrationWarning>{isVi ? 'Xem tất cả thông báo' : 'View all notifications'}</span>
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
