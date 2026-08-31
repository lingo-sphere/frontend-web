
export interface User {
  id: string
  email: string
  username: string
  displayName: string
  avatar?: string
  bio?: string
  phone?: string
  dateOfBirth?: string 
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  address?: string
  city?: string
  country?: string

  stats: UserStats

  preferences: UserPreferences

  role: 'student' | 'teacher' | 'admin'
  isVerified: boolean
  isActive: boolean
  is_premium?: boolean
  subscription_expires_at?: string
  subscription_plan?: string

  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface UserStats {
  totalExercises: number
  totalListeningExercises: number
  totalVocabularyLearned: number
  totalListeningTime: number 
  totalSpeakingTime: number 
  currentStreak: number 
  longestStreak: number 
  totalXP: number
  level: number
  badges: Badge[]

  averageAccuracy: number 
  totalCorrectAnswers: number
  totalWrongAnswers: number

  totalStudyTime: number 
  weeklyStudyTime: number 
  monthlyStudyTime: number 
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
}

export interface NotificationCategorySettings {
  push: boolean
  email: boolean
  inApp: boolean
}

export interface UserPreferences {
  language: string
  theme: 'light' | 'dark' | 'system'
  notifications: {
    allEnabled?: boolean
    marketingEnabled?: boolean
    email: boolean
    push: boolean
    sound: boolean
    sms?: boolean
    dailyReminder?: boolean
    weeklyReport?: boolean
    quietHoursEnabled?: boolean
    quietHoursStart?: string
    quietHoursEnd?: string
    categories?: Record<string, NotificationCategorySettings>
  }
  learning: {
    autoPlayAudio: boolean
    showPhonetic: boolean
    defaultExerciseDifficulty: 'easy' | 'medium' | 'hard'
    dailyGoal: number 
  }
  privacy: {
    showProfile: boolean
    showProgress: boolean
    allowFriendRequests: boolean
  }
}

export interface UserProfile extends Omit<User, 'stats' | 'preferences'> {
  stats: UserStats
  preferences: UserPreferences
  rank?: number
  achievements: Achievement[]
  recentActivity: Activity[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  progress: number
  maxProgress: number
  isCompleted: boolean
  completedAt?: string
}

export interface Activity {
  id: string
  type: 'vocabulary' | 'listening' | 'speaking' | 'exercise' | 'streak' | 'achievement'
  title: string
  description: string
  xpEarned: number
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface EditProfileForm {
  displayName: string
  bio: string
  phone: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | ''
  address: string
  city: string
  country: string
}

export interface ChangePasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
