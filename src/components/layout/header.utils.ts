/**
 * @file header.utils.ts
 * @description Các hàm tiện ích hỗ trợ tính toán gói VIP và biểu tượng thông báo cho Header
 */

export function getRemainingSubscriptionText(expiresAt?: string, plan?: string, isVi: boolean = true): string {
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
    return isVi ? `Còn ${days} ngày ${hours > 0 ? `${hours}h` : ''}` : `${days}d ${hours}h left`
  }
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  return isVi ? `Còn ${hours}h ${mins}m` : `${hours}h ${mins}m left`
}

export function getNotifIcon(type: string): string {
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
    PRACTICE_STREAK: 'flame',
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

export function formatNotifTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString()
}
