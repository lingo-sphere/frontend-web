// Component nút chuông và dropdown danh sách thông báo trên Header.

'use client'

import { useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { Icon } from '@/components/icon.map'
import { useNavigate } from '@/lib/navigation'
import { getCategoryColor, getCategoryLabel } from '@/features/notifications/types/notification'
import type { Notification } from '@/features/notifications/types/notification'
import { getNotifIcon, formatNotifTime } from '@/layouts/header.utils'

interface HeaderNotificationDropdownProps {
  notifications: Notification[]
  unreadCount: number
  isOpen: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
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
  onMouseEnter,
  onMouseLeave,
  onToggle,
  onClose,
  onMarkAsRead,
  onAction,
  isVi,
}: HeaderNotificationDropdownProps) {
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Button
        aria-label={isVi ? 'Thông báo' : 'Notifications'}
        className={`relative h-9 w-9 rounded-xl border transition-all cursor-pointer ${
          isOpen
            ? 'border-primary/40 bg-primary/10 text-primary shadow-xs'
            : 'border-border hover:bg-surface-subtle text-text-primary'
        }`}
        onClick={onToggle}
        size="icon"
        variant="outline"
      >
        <Icon name="bell" size={17} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <div
        className={`absolute right-0 top-full pt-2 z-50 transition-all duration-200 ease-out origin-top-right ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto visible'
            : 'opacity-0 -translate-y-2 scale-[0.98] pointer-events-none invisible duration-150 ease-in'
        }`}
      >
        <Card className="w-80 sm:w-[360px] rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden text-left">
          <div className="flex items-center justify-between border-b border-border/70 bg-surface-subtle/50 px-4 py-3">
            <span suppressHydrationWarning className="text-sm font-bold text-text-primary">
              {isVi ? 'Thông báo' : 'Notifications'}
            </span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary border border-primary/20">
                {unreadCount} {isVi ? 'mới' : 'new'}
              </span>
            )}
          </div>
          <CardContent className="max-h-96 overflow-y-auto p-0 divide-y divide-border/60">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                <Icon name="bellOff" size={32} className="text-text-tertiary" />
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
                    className={`flex cursor-pointer items-start gap-3 p-3.5 hover:bg-surface-subtle transition-colors ${
                      !notif.is_read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => {
                      onMarkAsRead(notifId)
                      if (onAction) onAction(`Viewed: ${notif.title}`)
                    }}
                  >
                    <div className={`mt-0.5 shrink-0 rounded-xl p-2 ${getCategoryColor(notif.notification_category)}/10`}>
                      <Icon
                        name={getNotifIcon(notif.notification_type)}
                        size={15}
                        className={getCategoryColor(notif.notification_category).replace('bg-', 'text-')}
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`truncate text-xs ${notif.is_read ? 'text-text-secondary' : 'font-bold text-text-primary'}`}>
                          {isVi && notif.title_vi ? notif.title_vi : notif.title}
                        </span>
                        {!notif.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                      </div>
                      <p className="line-clamp-2 text-[11px] text-text-tertiary leading-snug">
                        {isVi && notif.content_vi ? notif.content_vi : notif.content}
                      </p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[10px] text-text-tertiary">{formatNotifTime(notif.created_at)}</span>
                        <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${getCategoryColor(notif.notification_category)} text-white`}>
                          {getCategoryLabel(notif.notification_category, isVi)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
          <div className="border-t border-border/70 p-2.5 bg-surface-subtle/30">
            <Button
              variant="ghost"
              className="w-full text-xs font-semibold text-primary hover:bg-primary/10 rounded-xl py-2 cursor-pointer"
              onClick={() => {
                onClose()
                navigate('/notifications')
              }}
            >
              <span suppressHydrationWarning>{isVi ? 'Xem tất cả thông báo' : 'View all notifications'}</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
