// Quản lý Query Keys tập trung cho module bảng xếp hạng (Leaderboard).
export const leaderboardKeys = {
  all: ['leaderboard'] as const,
  byPeriod: (period: 'weekly' | 'all-time' | 'monthly' = 'weekly') =>
    [...leaderboardKeys.all, period] as const,
}
