// Tiện ích hỗ trợ tính toán gói VIP và định dạng thông báo Header
import { formatRelativeTime } from '@/lib/format'

export function getRemainingSubscriptionText(expiresAt?: string | null, plan?: string | null, isVi: boolean = true): string {
  if (plan === 'LIFETIME') {
    return isVi ? 'Gói Vĩnh Viễn' : 'Lifetime Access'
  }
  if (!expiresAt) {
    return isVi ? 'Gói Premium VIP' : 'Premium VIP'
  }
  const exp = new Date(expiresAt).getTime()
  const diffMs = exp - Date.now()
  if (diffMs <= 0) {
    return isVi ? 'VIP đã hết hạn' : 'VIP Expired'
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 30) {
    const months = Math.floor(days / 30)
    const remDays = days % 30
    return isVi ? `Còn ${months} tháng ${remDays > 0 ? `${remDays} ngày` : ''}` : `${months}mo ${remDays}d left`
  }
  if (days > 0) {
    return isVi ? `Còn ${days} ngày ${hours > 0 ? `${hours} giờ` : ''}` : `${days}d ${hours}h left`
  }
  return isVi ? `Còn ${Math.max(1, hours)} giờ` : `${Math.max(1, hours)}h left`
}

export function getNotificationIcon(type: string): string {
  const iconMap: Record<string, string> = {
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

export const getNotifIcon = getNotificationIcon

export function formatNotifTime(dateString: string): string {
  return formatRelativeTime(dateString, false)
}
