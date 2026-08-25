// Updated: 2026-08-17
// Mock data cho Leaderboard page:
// - monthlyLeaderboards: danh sách leaderboard theo tháng
// - getLeaderboard(month, type): lấy leaderboard theo tháng và loại
// - getMonthLabel(month): chuyển YYYY-MM thành label

import type { MonthlyLeaderboard, MonthlyLeaderboardUser } from '@/types/dashboard'

const avatarColors = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12', '#1abc9c', '#e91e63', '#00bcd4']

const makeUsers = (baseData: Array<{ name: string; streak: number; minutes: number; questions: number; words: number }>): MonthlyLeaderboardUser[] =>
  baseData.map((u, i) => ({
    rank: i + 1,
    name: u.name,
    avatarColor: avatarColors[i % avatarColors.length],
    streakDays: u.streak,
    totalMinutes: u.minutes,
    questionsAnswered: u.questions,
    wordsLearned: u.words,
    diamonds: 0,
    freezes: Math.random() > 0.7 ? 1 : 0,
  }))

const august2026: MonthlyLeaderboardUser[] = makeUsers([
  { name: 'Minh Anh', streak: 46, minutes: 1840, questions: 1245, words: 890 },
  { name: 'Thu Hà', streak: 42, minutes: 1680, questions: 1120, words: 756 },
  { name: 'Hoàng Bảo', streak: 38, minutes: 1520, questions: 980, words: 620 },
  { name: 'Phương Linh', streak: 35, minutes: 1400, questions: 890, words: 545 },
  { name: 'Đức Tuấn', streak: 32, minutes: 1280, questions: 760, words: 480 },
  { name: 'Mai Khánh', streak: 28, minutes: 1120, questions: 650, words: 420 },
  { name: 'Khánh Vy', streak: 25, minutes: 980, questions: 540, words: 365 },
  { name: 'Anh Tuấn', streak: 22, minutes: 860, questions: 420, words: 290 },
  { name: 'Ngọc Minh', streak: 20, minutes: 780, questions: 380, words: 245 },
  { name: 'Hải Yến', streak: 18, minutes: 720, questions: 320, words: 210 },
  { name: 'Bảo Ngọc', streak: 15, minutes: 600, questions: 280, words: 175 },
  { name: 'Minh Đức', streak: 14, minutes: 540, questions: 240, words: 150 },
  { name: 'Thanh Hà', streak: 12, minutes: 480, questions: 200, words: 120 },
  { name: 'Phong Vinh', streak: 10, minutes: 420, questions: 160, words: 95 },
  { name: 'Lan Anh', streak: 8, minutes: 360, questions: 120, words: 70 },
  { name: 'Văn Đạt', streak: 6, minutes: 280, questions: 90, words: 50 },
  { name: 'Kim Oanh', streak: 5, minutes: 220, questions: 70, words: 40 },
  { name: 'Trung Kiên', streak: 4, minutes: 180, questions: 50, words: 30 },
  { name: 'Huyền Trang', streak: 3, minutes: 120, questions: 30, words: 20 },
  { name: 'Gia Huy', streak: 2, minutes: 60, questions: 15, words: 10 },
])

const july2026: MonthlyLeaderboardUser[] = makeUsers([
  { name: 'Thu Hà', streak: 44, minutes: 1760, questions: 1180, words: 720 },
  { name: 'Minh Anh', streak: 40, minutes: 1600, questions: 1050, words: 680 },
  { name: 'Hoàng Bảo', streak: 36, minutes: 1440, questions: 920, words: 580 },
  { name: 'Phương Linh', streak: 30, minutes: 1200, questions: 750, words: 480 },
  { name: 'Đức Tuấn', streak: 26, minutes: 1040, questions: 620, words: 400 },
  { name: 'Mai Khánh', streak: 22, minutes: 880, questions: 480, words: 320 },
  { name: 'Khánh Vy', streak: 18, minutes: 720, questions: 360, words: 240 },
  { name: 'Anh Tuấn', streak: 15, minutes: 600, questions: 280, words: 180 },
  { name: 'Ngọc Minh', streak: 12, minutes: 480, questions: 200, words: 130 },
  { name: 'Hải Yến', streak: 10, minutes: 400, questions: 150, words: 95 },
  { name: 'Bảo Ngọc', streak: 8, minutes: 320, questions: 100, words: 65 },
  { name: 'Minh Đức', streak: 6, minutes: 240, questions: 70, words: 45 },
  { name: 'Thanh Hà', streak: 4, minutes: 160, questions: 40, words: 25 },
  { name: 'Phong Vinh', streak: 2, minutes: 80, questions: 20, words: 12 },
  { name: 'Lan Anh', streak: 1, minutes: 40, questions: 10, words: 5 },
])

const june2026: MonthlyLeaderboardUser[] = makeUsers([
  { name: 'Hoàng Bảo', streak: 42, minutes: 1680, questions: 1120, words: 680 },
  { name: 'Thu Hà', streak: 38, minutes: 1520, questions: 980, words: 580 },
  { name: 'Minh Anh', streak: 35, minutes: 1400, questions: 890, words: 520 },
  { name: 'Phương Linh', streak: 28, minutes: 1120, questions: 680, words: 420 },
  { name: 'Đức Tuấn', streak: 24, minutes: 960, questions: 540, words: 340 },
  { name: 'Mai Khánh', streak: 18, minutes: 720, questions: 380, words: 240 },
  { name: 'Khánh Vy', streak: 14, minutes: 560, questions: 260, words: 165 },
  { name: 'Anh Tuấn', streak: 10, minutes: 400, questions: 160, words: 100 },
  { name: 'Ngọc Minh', streak: 8, minutes: 320, questions: 100, words: 65 },
  { name: 'Hải Yến', streak: 5, minutes: 200, questions: 60, words: 35 },
])

export const monthlyLeaderboards: MonthlyLeaderboard[] = [
  {
    month: '2026-08',
    monthLabel: 'August 2026',
    closingDate: '2026-08-31',
    topThree: august2026.slice(0, 3),
    fullRanking: august2026,
    rewards: [
      { rank: 1, diamonds: 200, specialBadge: 'Streak Champion' },
      { rank: 2, diamonds: 100 },
      { rank: 3, diamonds: 50 },
    ],
  },
  {
    month: '2026-07',
    monthLabel: 'July 2026',
    closingDate: '2026-07-31',
    topThree: july2026.slice(0, 3),
    fullRanking: july2026,
    rewards: [
      { rank: 1, diamonds: 200, specialBadge: 'Streak Champion' },
      { rank: 2, diamonds: 100 },
      { rank: 3, diamonds: 50 },
    ],
  },
  {
    month: '2026-06',
    monthLabel: 'June 2026',
    closingDate: '2026-06-30',
    topThree: june2026.slice(0, 3),
    fullRanking: june2026,
    rewards: [
      { rank: 1, diamonds: 200, specialBadge: 'Streak Champion' },
      { rank: 2, diamonds: 100 },
      { rank: 3, diamonds: 50 },
    ],
  },
]

export function getLeaderboard(month: string): MonthlyLeaderboard | undefined {
  return monthlyLeaderboards.find((lb) => lb.month === month)
}

export function getMonthLabel(month: string): string {
  const [year, m] = month.split('-')
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${months[parseInt(m, 10) - 1]} ${year}`
}

export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function getDaysUntilMonthEnd(): number {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const diff = lastDay.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getNextMonth(current: string): string {
  const [year, month] = current.split('-').map(Number)
  if (month === 12) return `${year + 1}-01`
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

export function getPrevMonth(current: string): string {
  const [year, month] = current.split('-').map(Number)
  if (month === 1) return `${year - 1}-12`
  return `${year}-${String(month - 1).padStart(2, '0')}`
}
