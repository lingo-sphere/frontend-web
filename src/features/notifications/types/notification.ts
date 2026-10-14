// Định nghĩa kiểu dữ liệu TypeScript cho thực thể thông báo và danh mục.

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
  | 'SUBSCRIPTION_CREATED'
  | 'SUBSCRIPTION_RENEWED'
  | 'SUBSCRIPTION_EXPIRING'
  | 'SUBSCRIPTION_EXPIRED'
  | 'SUBSCRIPTION_CANCELLED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
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
  | 'SRS_DUE'
  | 'SRS_DUE_COUNT'
  | 'NEW_CARDS_AVAILABLE'
  | 'DECK_COMPLETED'
  | 'VOCABULARY_MASTERED'
  | 'REVIEW_COMPLETED'
  | 'PRACTICE_SESSION_REMINDER'
  | 'PRACTICE_STREAK'
  | 'SPEAKING_EVALUATION_READY'
  | 'WRITING_EVALUATION_READY'
  | 'TOEIC_TEST_REMINDER'
  | 'TOEIC_RESULT_READY'
  | 'TOEIC_SCORE_IMPROVED'
  | 'TOEIC_PART_WEAK'
  | 'TEST_ASSIGNED'
  | 'COURSE_ENROLLED'
  | 'LESSON_AVAILABLE'
  | 'LESSON_COMPLETED'
  | 'COURSE_COMPLETED'
  | 'COURSE_CERTIFICATE_READY'
  | 'AI_QUOTA_WARNING'
  | 'AI_RECOMMENDATION_AVAILABLE'
  | 'SYSTEM_MAINTENANCE'

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL'

export interface Notification {
  _id: string
  id?: string
  recipient_id: string
  recipient_type?: string
  notification_type: NotificationType
  notification_category: NotificationCategory
  channels?: ('PUSH' | 'EMAIL' | 'SMS' | 'IN_APP')[]
  title: string
  title_vi?: string
  content: string
  content_vi?: string
  data?: Record<string, unknown>
  action_type?: string
  action_url?: string
  action_params?: Record<string, unknown>
  action_label?: string
  action_label_vi?: string
  source_service?: string
  source_type?: string
  source_id?: string
  priority: NotificationPriority
  is_pinned: boolean
  is_read: boolean
  read_at?: string
  expires_at?: string
  created_at: string
  updated_at?: string
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

export function getCategoryLabel(category: NotificationCategory, isVietnamese = false): string {
  const labelsVi: Record<NotificationCategory, string> = {
    AUTH: 'Bảo mật & Tài khoản',
    SUBSCRIPTION: 'Gói đăng ký',
    USER: 'Người dùng',
    VOCABULARY: 'Từ vựng',
    PRACTICE: 'Luyện tập',
    EXAM: 'Bài thi',
    COURSE: 'Khóa học',
    AI: 'AI hỗ trợ',
    GAMIFICATION: 'Nhiệm vụ & Điểm',
    MARKETING: 'Khuyến mãi',
    SYSTEM: 'Hệ thống',
  }
  const labelsEn: Record<NotificationCategory, string> = {
    AUTH: 'Auth & Security',
    SUBSCRIPTION: 'Subscription',
    USER: 'User',
    VOCABULARY: 'Vocabulary',
    PRACTICE: 'Practice',
    EXAM: 'Exam',
    COURSE: 'Course',
    AI: 'AI Assistant',
    GAMIFICATION: 'Gamification',
    MARKETING: 'Marketing',
    SYSTEM: 'System',
  }
  return isVietnamese ? (labelsVi[category] || category) : (labelsEn[category] || category)
}
