// User types and interfaces

export interface User {
  id: string
  email: string
  username: string
  displayName: string
  avatar?: string
  bio?: string
  phone?: string
  dateOfBirth?: string // ISO date string
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  address?: string
  city?: string
  country?: string

  // Learning stats
  stats: UserStats

  // Preferences
  preferences: UserPreferences

  // Account info
  role: 'student' | 'teacher' | 'admin'
  isVerified: boolean
  isActive: boolean

  // Timestamps
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface UserStats {
  totalExercises: number
  totalListeningExercises: number
  totalVocabularyLearned: number
  totalListeningTime: number // in minutes
  totalSpeakingTime: number // in minutes
  currentStreak: number // days
  longestStreak: number // days
  totalXP: number
  level: number
  badges: Badge[]

  // Accuracy stats
  averageAccuracy: number // percentage
  totalCorrectAnswers: number
  totalWrongAnswers: number

  // Time stats
  totalStudyTime: number // in minutes
  weeklyStudyTime: number // in minutes this week
  monthlyStudyTime: number // in minutes this month
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
}

export interface UserPreferences {
  language: string
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    push: boolean
    sound: boolean
    dailyReminder: boolean
    weeklyReport: boolean
  }
  learning: {
    autoPlayAudio: boolean
    showPhonetic: boolean
    defaultExerciseDifficulty: 'easy' | 'medium' | 'hard'
    dailyGoal: number // minutes per day
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

// Form types for editing
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
