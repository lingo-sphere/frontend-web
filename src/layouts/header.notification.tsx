// Component hiển thị nút chuông và dropdown danh sách thông báo trên Header theo phong cách hiện đại.
'use client'

import { useRef, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { useNavigate } from '@/lib/navigation'
import type { Notification } from '@/features/notifications/types/notification'
import { formatNotifTime } from '@/layouts/header.utils'
import {
  Bell,
  BellRing,
  CheckCheck,
  Check,
  Flame,
  Clock,
  Target,
  Trophy,
  BookOpen,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Inbox,
} from 'lucide-react'

interface HeaderNotificationDropdownProps {
  notifications: Notification[]
  unreadCount: number
  isOpen: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onToggle: () => void
  onClose: () => void
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead?: () => void
  onAction?: (msg: string) => void
  isVi: boolean
}

function getNotificationMeta(notif: Notification, isVi: boolean) {
  const type = notif.notification_type || ''
  const cat = notif.notification_category || ''

  if (type.includes('STREAK')) {
    return {
      icon: Flame,
      colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/25',
      tagClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
      tagLabel: isVi ? 'Chuỗi học tập' : 'Streak',
    }
  }
  if (type.includes('REMINDER') || type.includes('DUE') || type.includes('DAILY_GOAL')) {
    return {
      icon: Clock,
      colorClass: 'text-sky-500 bg-sky-500/10 border-sky-500/25',
      tagClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25',
      tagLabel: isVi ? 'Nhắc nhở' : 'Reminder',
    }
  }
  if (type.includes('ACHIEVEMENT') || type.includes('LEVEL_UP') || type.includes('MILESTONE') || cat === 'GAMIFICATION') {
    return {
      icon: Trophy,
      colorClass: 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/25',
      tagClass: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/25',
      tagLabel: isVi ? 'Nhiệm vụ & Điểm' : 'Achievement',
    }
  }
  if (cat === 'COURSE' || type.includes('COURSE') || type.includes('LESSON')) {
    return {
      icon: BookOpen,
      colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25',
      tagClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
      tagLabel: isVi ? 'Khóa học' : 'Course',
    }
  }
  if (cat === 'EXAM' || type.includes('TOEIC') || type.includes('TEST')) {
    return {
      icon: GraduationCap,
      colorClass: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/25',
      tagClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/25',
      tagLabel: isVi ? 'Bài thi' : 'Exam',
    }
  }
  if (cat === 'VOCABULARY' || type.includes('SRS') || type.includes('CARDS')) {
    return {
      icon: Sparkles,
      colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/25',
      tagClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25',
      tagLabel: isVi ? 'Từ vựng' : 'Vocabulary',
    }
  }
  if (cat === 'AUTH' || type.includes('PASSWORD') || type.includes('LOGIN')) {
    return {
      icon: ShieldCheck,
      colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/25',
      tagClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25',
      tagLabel: isVi ? 'Bảo mật' : 'Security',
    }
  }
  return {
    icon: Bell,
    colorClass: 'text-slate-500 bg-slate-500/10 border-slate-500/25',
    tagClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/25',
    tagLabel: isVi ? 'Hệ thống' : 'System',
  }
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
  onMarkAllAsRead,
  onAction,
  isVi,
}: HeaderNotificationDropdownProps) {
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

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

  const displayedNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.is_read)
      : notifications

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
            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 shadow-xs'
            : 'border-border hover:bg-surface-subtle text-text-primary'
        }`}
        onClick={onToggle}
        size="icon"
        variant="outline"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white shadow-sm ring-2 ring-surface">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <div
        className={`absolute right-0 top-full pt-2.5 z-50 transition-all duration-200 ease-out origin-top-right ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto visible'
            : 'opacity-0 -translate-y-2 scale-[0.98] pointer-events-none invisible duration-150 ease-in'
        }`}
      >
        <Card className="w-[380px] sm:w-[410px] rounded-[22px] border border-border/80 bg-surface/98 dark:bg-card/98 backdrop-blur-2xl shadow-2xl shadow-black/10 dark:shadow-black/50 overflow-hidden text-left ring-1 ring-black/5 dark:ring-white/10">
          <div className="border-b border-border/60 bg-surface-subtle/50 px-4.5 pt-3.5 pb-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <BellRing size={15} />
                </div>
                <span suppressHydrationWarning className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                  {isVi ? 'Thông báo' : 'Notifications'}
                </span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10.5px] font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    {unreadCount} {isVi ? 'mới' : 'new'}
                  </span>
                )}
              </div>

              {unreadCount > 0 && onMarkAllAsRead && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-emerald-500/10"
                  title={isVi ? 'Đánh dấu tất cả là đã đọc' : 'Mark all as read'}
                >
                  <CheckCheck size={14} className="stroke-[2.2]" />
                  <span>{isVi ? 'Đã đọc tất cả' : 'Read all'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-border/40">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-surface shadow-2xs text-slate-900 dark:text-white border border-border/80'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {isVi ? 'Tất cả' : 'All'} ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filter === 'unread'
                    ? 'bg-surface shadow-2xs text-slate-900 dark:text-white border border-border/80'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {isVi ? 'Chưa đọc' : 'Unread'} ({unreadCount})
              </button>
            </div>
          </div>

          <CardContent className="max-h-[360px] overflow-y-auto p-0 divide-y divide-border/50 scrollbar-thin">
            {displayedNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400">
                  <Inbox size={20} />
                </div>
                <p suppressHydrationWarning className="text-xs font-bold text-text-primary">
                  {filter === 'unread'
                    ? isVi
                      ? 'Đã đọc tất cả thông báo!'
                      : 'All caught up!'
                    : isVi
                    ? 'Không có thông báo nào'
                    : 'No notifications'}
                </p>
                <p suppressHydrationWarning className="text-[11px] text-text-tertiary max-w-[200px]">
                  {filter === 'unread'
                    ? isVi
                      ? 'Bạn không có thông báo chưa đọc nào.'
                      : 'You have no unread notifications.'
                    : isVi
                    ? 'Các tin tức và thông báo mới sẽ xuất hiện tại đây.'
                    : 'Updates and alerts will appear here.'}
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => {
                const notifId = notif._id
                const meta = getNotificationMeta(notif, isVi)
                const IconComponent = meta.icon

                return (
                  <div
                    key={notifId}
                    className={`group relative flex cursor-pointer items-start gap-3 p-3.5 transition-all duration-200 ${
                      !notif.is_read
                        ? 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] hover:bg-emerald-500/[0.08]'
                        : 'bg-transparent hover:bg-surface-subtle/80'
                    }`}
                    onClick={() => {
                      onMarkAsRead(notifId)
                      if (onAction) onAction(`Viewed: ${notif.title}`)
                    }}
                  >
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${meta.colorClass} shadow-2xs transition-transform duration-200 group-hover:scale-105`}>
                      <IconComponent size={16} strokeWidth={2.2} />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9.5px] font-extrabold border ${meta.tagClass}`}>
                          {meta.tagLabel}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-medium text-text-tertiary">
                            {formatNotifTime(notif.created_at)}
                          </span>
                          {!notif.is_read && (
                            <span
                              className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 shrink-0"
                              title={isVi ? 'Chưa đọc' : 'Unread'}
                            />
                          )}
                        </div>
                      </div>

                      <h4 className={`text-[12.5px] leading-snug line-clamp-2 ${notif.is_read ? 'font-medium text-text-secondary' : 'font-extrabold text-slate-900 dark:text-white'} group-hover:text-emerald-600 transition-colors`}>
                        {isVi && notif.title_vi ? notif.title_vi : notif.title}
                      </h4>

                      <p className="line-clamp-2 text-[11px] text-text-tertiary leading-relaxed">
                        {isVi && notif.content_vi ? notif.content_vi : notif.content}
                      </p>
                    </div>

                    {!notif.is_read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onMarkAsRead(notifId)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-md text-slate-400 hover:text-emerald-600 shrink-0 self-center"
                        title={isVi ? 'Đánh dấu đã đọc' : 'Mark as read'}
                      >
                        <Check size={13} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>

          <div className="border-t border-border/60 p-2 bg-surface-subtle/50">
            <Button
              variant="ghost"
              className="group/btn w-full flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 rounded-xl py-2 cursor-pointer transition-all"
              onClick={() => {
                onClose()
                navigate('/notifications')
              }}
            >
              <span suppressHydrationWarning>{isVi ? 'Xem tất cả thông báo' : 'View all notifications'}</span>
              <ArrowRight size={13} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
