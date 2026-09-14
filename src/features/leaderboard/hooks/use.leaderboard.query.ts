// Custom hook quản lý truy vấn dữ liệu bảng xếp hạng bằng TanStack Query.
'use client'

import { useQuery } from '@tanstack/react-query'
import { userService, type LeaderboardEntry } from '@/features/user/services/user.service'
import { leaderboardKeys } from '@/features/leaderboard/keys/leaderboard.keys'

export type LeaderboardPeriod = 'weekly' | 'all-time' | 'monthly'

export function useLeaderboardQuery(period: LeaderboardPeriod = 'weekly', enabled = true) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: leaderboardKeys.byPeriod(period),
    queryFn: () => userService.getLeaderboard(period),
    enabled,
    staleTime: 3 * 60 * 1000,
  })
}
