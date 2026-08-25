import type {
  User,
  UserStats,
  Badge,
  UserPreferences,
  Achievement,
  Activity,
} from '@/types/user'

// Sample user data
export const currentUser: User = {
  id: 'user-001',
  email: 'nguyen.van.a@email.com',
  username: 'nguyenvana',
  displayName: 'Nguyễn Văn A',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  bio: 'Học viên ngôn ngữ Anh chuyên về giao tiếp. Yêu thích phim Hollywood và âm nhạc pop.',
  phone: '0912345678',
  dateOfBirth: '2000-05-15',
  gender: 'male',
  address: '123 Đường Nguyễn Trãi',
  city: 'TP. Hồ Chí Minh',
  country: 'Việt Nam',
  stats: {
    totalExercises: 156,
    totalListeningExercises: 89,
    totalVocabularyLearned: 1250,
    totalListeningTime: 4320, // 72 hours
    totalSpeakingTime: 2160, // 36 hours
    currentStreak: 15,
    longestStreak: 45,
    totalXP: 24500,
    level: 12,
    badges: [
      {
        id: 'badge-1',
        name: 'Khởi đầu',
        description: 'Hoàn thành bài học đầu tiên',
        icon: 'star',
        earnedAt: '2024-01-15',
        tier: 'bronze',
      },
      {
        id: 'badge-2',
        name: 'Người học chăm chỉ',
        description: 'Học 30 ngày liên tiếp',
        icon: 'fire',
        earnedAt: '2024-02-10',
        tier: 'silver',
      },
      {
        id: 'badge-3',
        name: 'Chuyên gia nghe',
        description: 'Hoàn thành 50 bài nghe',
        icon: 'headphones',
        earnedAt: '2024-03-05',
        tier: 'gold',
      },
    ],
    averageAccuracy: 78,
    totalCorrectAnswers: 8920,
    totalWrongAnswers: 2510,
    totalStudyTime: 6480, // 108 hours
    weeklyStudyTime: 420, // 7 hours this week
    monthlyStudyTime: 1800, // 30 hours this month
  },
  preferences: {
    language: 'vi',
    theme: 'system',
    notifications: {
      // Master toggle
      allEnabled: true,
      marketingEnabled: false,

      // Channels
      email: true,
      push: true,
      sound: true,
      sms: false,

      // Quiet hours
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',

      // Per-category toggles (synced with notification-service.dbml)
      categories: {
        // AUTH - Login, security
        auth: { push: true, email: true, inApp: true },
        // SUBSCRIPTION - Subscription, billing
        subscription: { push: true, email: true, inApp: true },
        // USER - User profile, account
        user: { push: true, email: false, inApp: true },
        // VOCABULARY - Words, SRS, flashcards
        vocabulary: { push: true, email: false, inApp: true },
        // PRACTICE - Speaking, Writing, Listening
        practice: { push: true, email: false, inApp: true },
        // EXAM - TOEIC, tests
        exam: { push: true, email: true, inApp: true },
        // COURSE - Courses, lessons
        course: { push: false, email: false, inApp: true },
        // AI - AI quotas, recommendations
        ai: { push: false, email: false, inApp: true },
        // GAMIFICATION - Streak, achievement, XP
        gamification: { push: true, email: false, inApp: true },
        // MARKETING - Promotions, campaigns
        marketing: { push: false, email: false, inApp: false },
      },
    },
    learning: {
      autoPlayAudio: true,
      showPhonetic: true,
      defaultExerciseDifficulty: 'medium',
      dailyGoal: 30,
    },
    privacy: {
      showProfile: true,
      showProgress: true,
      allowFriendRequests: true,
    },
  },
  role: 'student',
  isVerified: true,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-06-15T10:30:00Z',
  lastLoginAt: '2024-06-15T10:30:00Z',
}

// Sample achievements for the user
export const userAchievements: Achievement[] = [
  {
    id: 'ach-1',
    title: 'Tân binh',
    description: 'Hoàn thành 10 bài học đầu tiên',
    icon: '🎯',
    progress: 10,
    maxProgress: 10,
    isCompleted: true,
    completedAt: '2024-01-10',
  },
  {
    id: 'ach-2',
    title: 'Người học chăm chỉ',
    description: 'Học 7 ngày liên tiếp',
    icon: '🔥',
    progress: 7,
    maxProgress: 7,
    isCompleted: true,
    completedAt: '2024-01-20',
  },
  {
    id: 'ach-3',
    title: 'Siêu sao nghe',
    description: 'Đạt 100% accuracy trong 5 bài nghe',
    icon: '🏆',
    progress: 3,
    maxProgress: 5,
    isCompleted: false,
  },
  {
    id: 'ach-4',
    title: 'Kho từ vựng',
    description: 'Học 1000 từ mới',
    icon: '📚',
    progress: 1000,
    maxProgress: 1000,
    isCompleted: true,
    completedAt: '2024-05-01',
  },
  {
    id: 'ach-5',
    title: 'Bậc thầy phát âm',
    description: 'Đạt 50 giờ luyện nói',
    icon: '🎤',
    progress: 36,
    maxProgress: 50,
    isCompleted: false,
  },
  {
    id: 'ach-6',
    title: 'Chuỗi ngày dài',
    description: 'Duy trì streak 30 ngày',
    icon: '⚡',
    progress: 15,
    maxProgress: 30,
    isCompleted: false,
  },
]

// Sample recent activities
export const userActivities: Activity[] = [
  {
    id: 'act-1',
    type: 'listening',
    title: 'Hoàn thành bài nghe',
    description: 'Business English - Meeting',
    xpEarned: 150,
    timestamp: '2024-06-15T10:30:00Z',
    metadata: { accuracy: 85, duration: 15 },
  },
  {
    id: 'act-2',
    type: 'vocabulary',
    title: 'Học từ mới',
    description: '25 từ vựng mới',
    xpEarned: 100,
    timestamp: '2024-06-15T09:00:00Z',
    metadata: { wordsLearned: 25 },
  },
  {
    id: 'act-3',
    type: 'exercise',
    title: 'Luyện tập Daily',
    description: 'Hoàn thành bài tập hàng ngày',
    xpEarned: 50,
    timestamp: '2024-06-14T20:00:00Z',
    metadata: { accuracy: 92 },
  },
  {
    id: 'act-4',
    type: 'streak',
    title: 'Streak 15 ngày!',
    description: 'Tiếp tục duy trì chuỗi học tập',
    xpEarned: 75,
    timestamp: '2024-06-14T08:00:00Z',
    metadata: { currentStreak: 15 },
  },
  {
    id: 'act-5',
    type: 'achievement',
    title: 'Mở khóa thành tựu',
    description: 'Hoàn thành 1000 từ vựng',
    xpEarned: 200,
    timestamp: '2024-06-13T15:00:00Z',
    metadata: { badgeId: 'ach-4' },
  },
  {
    id: 'act-6',
    type: 'speaking',
    title: 'Luyện nói',
    description: 'Practice conversation - Travel',
    xpEarned: 120,
    timestamp: '2024-06-13T10:00:00Z',
    metadata: { duration: 10, score: 88 },
  },
  {
    id: 'act-7',
    type: 'listening',
    title: 'Hoàn thành bài nghe',
    description: 'Daily News - Technology',
    xpEarned: 180,
    timestamp: '2024-06-12T14:00:00Z',
    metadata: { accuracy: 95, duration: 20 },
  },
]

// Sample leaderboard data
export const leaderboardData = [
  { userId: 'user-002', displayName: 'Trần Thị B', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', xp: 45000, level: 18, streak: 89 },
  { userId: 'user-003', displayName: 'Lê Văn C', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', xp: 38200, level: 15, streak: 45 },
  { userId: 'user-001', displayName: 'Nguyễn Văn A', avatar: currentUser.avatar, xp: 24500, level: 12, streak: 15, isCurrentUser: true },
  { userId: 'user-004', displayName: 'Phạm Thị D', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', xp: 19800, level: 10, streak: 22 },
  { userId: 'user-005', displayName: 'Hoàng Văn E', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', xp: 15200, level: 8, streak: 8 },
]

// Helper function to get user rank
export function getUserRank(userId: string): number {
  const sorted = [...leaderboardData].sort((a, b) => b.xp - a.xp)
  const index = sorted.findIndex(u => u.userId === userId)
  return index + 1
}

// Helper to get level from XP
export function getLevelFromXP(xp: number): number {
  // Each level requires progressively more XP
  // Level 1: 0, Level 2: 1000, Level 3: 2500, etc.
  let level = 1
  let requiredXP = 0
  while (requiredXP <= xp) {
    requiredXP += level * 500
    if (requiredXP <= xp) level++
  }
  return level
}

// Helper to get XP needed for next level
export function getXPForNextLevel(currentXP: number): { current: number; required: number; progress: number } {
  const currentLevel = getLevelFromXP(currentXP)
  let requiredForCurrent = 0
  for (let i = 1; i < currentLevel; i++) {
    requiredForCurrent += i * 500
  }
  const requiredForNext = requiredForCurrent + currentLevel * 500
  const progress = ((currentXP - requiredForCurrent) / (currentLevel * 500)) * 100
  return {
    current: currentXP - requiredForCurrent,
    required: currentLevel * 500,
    progress: Math.min(100, Math.max(0, progress)),
  }
}
