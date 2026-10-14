// Định nghĩa kiểu dữ liệu TypeScript cho hệ thống giao diện bảng điều khiển học tập.

export type ThemeMode = 'light' | 'dark'
export type NavSectionId = 'home' | 'learning' | 'ai' | 'leaderboard' | 'progress' | 'system'
export type LearningTaskKind = 'vocabulary' | 'listening' | 'writing' | 'speaking'
export type MilestoneStatus = 'done' | 'current' | 'locked'
export type LeaderboardPeriod = 'week' | 'month' | 'year'
export type HeatmapIntensity = 0 | 1 | 2 | 3 | 4
export type HeatmapStatus = 'checked-in' | 'freeze' | 'inactive'
export type LeaderboardType = 'streak' | 'learning' | 'vocabulary'

export interface NavItem {
  id: string
  label: string
  icon: string
  accent?: 'primary' | 'info' | 'ai' | 'yellow' | 'neutral'
}

export interface NavGroup {
  id: NavSectionId
  label: string
  items: NavItem[]
}

export interface LearningTask {
  id: string
  kind: LearningTaskKind
  label: string
  durationLabel: string
  icon: string
  completed: boolean
}


export interface StreakMilestone {
  days: number
  reward: string
  status: MilestoneStatus
}

export interface LeaderboardEntry {
  rank: number
  name: string
  streakDays: number
}

export interface LeaderboardData {
  week: LeaderboardEntry[]
  month: LeaderboardEntry[]
  year: LeaderboardEntry[]
}

export interface Topic {
  id: string
  label: string
  emoji: string
  words: number
}

export interface HeatmapDay {
  id: string
  date: string
  intensity: HeatmapIntensity
  status: HeatmapStatus
  minutes: number
  activityLabel: string
}

export interface HeatmapSummary {
  studyDays: number
  totalMinutes: number
  longestStreak: number
}

export interface DashboardData {
  navGroups: NavGroup[]
  tasks: LearningTask[]
  milestones: StreakMilestone[]
  leaderboard: LeaderboardData
  topics: Topic[]
  heatmap: HeatmapDay[]
  heatmapSummary: HeatmapSummary
}

export interface MonthlyLeaderboardUser {
  rank: number
  name: string
  avatarColor: string
  streakDays: number
  totalMinutes: number
  questionsAnswered: number
  wordsLearned: number
  freezes: number
  isCurrentUser?: boolean
}

export interface MonthlyReward {
  rank: number
  xp_reward: number
  specialBadge?: string
}

export interface MonthlyLeaderboard {
  month: string 
  monthLabel: string 
  closingDate: string 
  topThree: MonthlyLeaderboardUser[]
  fullRanking: MonthlyLeaderboardUser[]
  rewards: MonthlyReward[]
}
