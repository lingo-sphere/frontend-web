// Updated: 2026-08-20
// Mock data cho dashboard, bao gồm:
// - navGroups: cấu trúc navigation sidebar
// - tasks: danh sách bài học hôm nay
// - roadmap: learning path với các units
// - milestones: streak rewards (7, 14, 30, 60, 90 ngày)
// - leaderboard: top users theo week/month/year
// - topics: vocabulary topics để khám phá
// - heatmap: 90 ngày gần nhất (makeHeatmap())

import type { DashboardData, HeatmapDay, HeatmapIntensity, HeatmapStatus, NavGroup } from '@/types/dashboard'

const navigationGroups: NavGroup[] = [
  { id: 'home', label: 'Home', items: [{ id: 'home', label: 'Home', icon: 'home', accent: 'primary' }] },
  {
    id: 'learning',
    label: 'LEARNING',
    items: [
      { id: 'courses', label: 'Courses', icon: 'library', accent: 'primary' },
      { id: 'roadmap', label: 'Learning Roadmap', icon: 'route', accent: 'primary' },
      { id: 'vocabulary', label: 'Vocabulary', icon: 'book', accent: 'primary' },
      { id: 'practice', label: 'Practice', icon: 'activity', accent: 'info' },
      { id: 'notes', label: 'Notes', icon: 'notes', accent: 'primary' },
    ],
  },
  { id: 'community', label: 'COMMUNITY', items: [{ id: 'community', label: 'Community Chat', icon: 'users', accent: 'primary' }, { id: 'public-decks', label: 'Public Decks', icon: 'cards', accent: 'info' }, { id: 'topics', label: 'Topics', icon: 'tags', accent: 'info' }] },
  { id: 'leaderboard', label: 'RANKING', items: [{ id: 'leaderboard', label: 'Leaderboard', icon: 'trophy', accent: 'yellow' }] },
  {
    id: 'system',
    label: 'SYSTEM',
    items: [
      { id: 'notifications', label: 'Notifications', icon: 'bell' },
      { id: 'settings', label: 'Settings', icon: 'settings' },
    ],
  },
]

const heatmapPattern: HeatmapIntensity[] = [0, 1, 0, 2, 0, 1, 3, 0, 2, 4, 1, 0, 2]

const makeHeatmap = (): HeatmapDay[] => {
  const end = new Date(Date.UTC(2026, 7, 14))
  const days: HeatmapDay[] = []

  for (let index = 0; index < 90; index += 1) {
    const date = new Date(end)
    date.setUTCDate(end.getUTCDate() - (89 - index))
    const id = date.toISOString().slice(0, 10)
    const isSelected = id === '2026-08-14'
    const intensity = isSelected ? 2 : heatmapPattern[index % heatmapPattern.length]
    const status: HeatmapStatus = isSelected ? 'checked-in' : intensity === 0 ? 'inactive' : index % 17 === 0 ? 'freeze' : 'checked-in'

    days.push({
      id,
      date: id,
      intensity,
      status,
      minutes: isSelected ? 2 : intensity * 12,
      activityLabel: isSelected ? 'Không có hoạt động nào ngày này' : intensity === 0 ? 'Chưa có hoạt động' : 'Hoàn thành mục tiêu học tập',
    })
  }

  return days
}

export const mockDashboardData: DashboardData = {
  navGroups: navigationGroups,
  tasks: [
    { id: 'vocabulary-review', kind: 'vocabulary', label: 'Vocabulary Review', durationLabel: '10 words', icon: 'check', completed: true },
    { id: 'listening', kind: 'listening', label: 'Listening', durationLabel: '15 minutes', icon: 'headphones', completed: false },
    { id: 'writing', kind: 'writing', label: 'Writing', durationLabel: '10 minutes', icon: 'pencil', completed: false },
    { id: 'speaking', kind: 'speaking', label: 'Speaking', durationLabel: '10 minutes', icon: 'microphone', completed: false },
  ],
  roadmap: [
    { id: 'unit-01', label: 'Unit 01', status: 'completed' },
    { id: 'unit-02', label: 'Unit 02', status: 'completed' },
    { id: 'unit-03', label: 'Unit 03', status: 'completed' },
    { id: 'unit-04', label: 'Unit 04', status: 'current' },
    { id: 'unit-05', label: 'Unit 05', status: 'locked' },
    { id: 'unit-06', label: 'Unit 06', status: 'locked' },
  ],
  milestones: [
    { days: 7, reward: '50 Diamonds', status: 'done' },
    { days: 14, reward: '1 Streak Freeze', status: 'current' },
    { days: 30, reward: 'Achievement Badge', status: 'locked' },
    { days: 60, reward: '100 Diamonds', status: 'locked' },
    { days: 90, reward: 'Gold Badge', status: 'locked' },
  ],
  leaderboard: {
    week: [
      { rank: 1, name: 'Linh', streakDays: 21 },
      { rank: 2, name: 'Minh', streakDays: 18 },
      { rank: 3, name: 'Bảo', streakDays: 12 },
      { rank: 4, name: 'Hà', streakDays: 9 },
      { rank: 5, name: 'Tuấn', streakDays: 7 },
    ],
    month: [
      { rank: 1, name: 'Minh', streakDays: 46 },
      { rank: 2, name: 'Linh', streakDays: 42 },
      { rank: 3, name: 'Bảo', streakDays: 28 },
      { rank: 4, name: 'Hà', streakDays: 22 },
      { rank: 5, name: 'Tuấn', streakDays: 18 },
    ],
    year: [
      { rank: 1, name: 'Linh', streakDays: 214 },
      { rank: 2, name: 'Bảo', streakDays: 188 },
      { rank: 3, name: 'Minh', streakDays: 176 },
      { rank: 4, name: 'Hà', streakDays: 142 },
      { rank: 5, name: 'Tuấn', streakDays: 118 },
    ],
  },
  topics: [
    { id: 'business', label: 'Business', emoji: '💼', words: 120 },
    { id: 'travel', label: 'Travel', emoji: '✈️', words: 95 },
    { id: 'education', label: 'Education', emoji: '🎓', words: 86 },
    { id: 'health', label: 'Health', emoji: '🏥', words: 110 },
  ],
  heatmap: makeHeatmap(),
  heatmapSummary: { studyDays: 0, totalMinutes: 0, longestStreak: 1 },
}
