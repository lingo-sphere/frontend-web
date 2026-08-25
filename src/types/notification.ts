
export type NotificationCategory =
  | 'AUTH'
  | 'SUBSCRIPTION'
  | 'USER'
  | 'VOCABULARY'
  | 'PRACTICE'
  | 'EXAM'
  | 'COURSE'
  | 'AI'
  | 'GAMIFICATION'
  | 'MARKETING'
  | 'SYSTEM'

export type NotificationType =

  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'EMAIL_VERIFIED'
  | 'TWO_FACTOR_ENABLED'
  | 'ACCOUNT_BLOCKED'
  | 'NEW_LOGIN_LOCATION'
  // SUBSCRIPTION
  | 'SUBSCRIPTION_CREATED'
  | 'SUBSCRIPTION_RENEWED'
  | 'SUBSCRIPTION_EXPIRING'
  | 'SUBSCRIPTION_EXPIRED'
  | 'SUBSCRIPTION_CANCELLED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  // USER & GAMIFICATION
  | 'STREAK_REMINDER'
  | 'STREAK_BROKEN'
  | 'STREAK_MILESTONE'
  | 'STREAK_7_DAYS'
  | 'STREAK_30_DAYS'
  | 'DAILY_GOAL_REMINDER'
  | 'DAILY_GOAL_COMPLETED'
  | 'LEVEL_UP'
  | 'XP_MILESTONE'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'GEM_EARNED'
  // VOCABULARY
  | 'SRS_DUE'
  | 'SRS_DUE_COUNT'
  | 'NEW_CARDS_AVAILABLE'
  | 'DECK_COMPLETED'
  | 'VOCABULARY_MASTERED'
  | 'REVIEW_COMPLETED'
  // PRACTICE
  | 'PRACTICE_SESSION_REMINDER'
  | 'PRACTICE_STREAK'
  | 'SPEAKING_EVALUATION_READY'
  | 'WRITING_EVALUATION_READY'
  // EXAM
  | 'TOEIC_TEST_REMINDER'
  | 'TOEIC_RESULT_READY'
  | 'TOEIC_SCORE_IMPROVED'
  | 'TOEIC_PART_WEAK'
  // COURSE
  | 'COURSE_ENROLLED'
  | 'LESSON_AVAILABLE'
  | 'LESSON_COMPLETED'
  | 'COURSE_COMPLETED'
  | 'COURSE_CERTIFICATE_READY'
  // AI
  | 'AI_QUOTA_WARNING'
  | 'AI_RECOMMENDATION_AVAILABLE'
  // SYSTEM
  | 'SYSTEM_MAINTENANCE'

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL'

export interface Notification {
  id: string
  recipientId: string
  recipientType: 'USER' | 'ADMIN'
  notificationType: NotificationType
  notificationCategory: NotificationCategory
  channels: ('PUSH' | 'EMAIL' | 'SMS' | 'IN_APP')[]
  title: string
  titleVi?: string
  content: string
  contentVi?: string
  data?: Record<string, unknown>
  actionType?: 'NAVIGATE' | 'REDIRECT' | 'BUTTON' | 'DISMISS'
  actionUrl?: string
  actionParams?: Record<string, unknown>
  actionLabel?: string
  sourceService?: 'AUTH' | 'USER' | 'VOCABULARY' | 'PRACTICE' | 'EXAM' | 'COURSE' | 'AI'
  sourceType?: string
  sourceId?: string
  priority: NotificationPriority
  isPinned: boolean
  isRead: boolean
  readAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt?: string
}

export function getCategoryColor(category: NotificationCategory): string {
  const colors: Record<NotificationCategory, string> = {
    AUTH: 'bg-red-500',
    SUBSCRIPTION: 'bg-purple-500',
    USER: 'bg-blue-500',
    VOCABULARY: 'bg-green-500',
    PRACTICE: 'bg-orange-500',
    EXAM: 'bg-yellow-500',
    COURSE: 'bg-cyan-500',
    AI: 'bg-pink-500',
    GAMIFICATION: 'bg-amber-500',
    MARKETING: 'bg-indigo-500',
    SYSTEM: 'bg-gray-500',
  }
  return colors[category] || 'bg-gray-500'
}

export function getCategoryLabel(category: NotificationCategory): string {
  const labels: Record<NotificationCategory, string> = {
    AUTH: 'Auth & Security',
    SUBSCRIPTION: 'Subscription',
    USER: 'User',
    VOCABULARY: 'Vocabulary',
    PRACTICE: 'Practice',
    EXAM: 'Exam',
    COURSE: 'Course',
    AI: 'AI',
    GAMIFICATION: 'Gamification',
    MARKETING: 'Marketing',
    SYSTEM: 'System',
  }
  return labels[category] || category
}
