// Thành phần hiển thị thẻ Bảng xếp hạng tuần trong trang thông tin hồ sơ cá nhân.
'use client'

import { Card, CardContent } from '@/components/card'
import { Icon } from '@/components/icon.map'
import { formatNumber } from '@/features/user/hooks/use.profile.data'
import type { LeaderboardEntry } from '@/features/user/utils/user.score.utils'

interface ProfileLeaderboardCardProps {
  leaderboard: LeaderboardEntry[]
}

export function ProfileLeaderboardCard({ leaderboard }: ProfileLeaderboardCardProps) {
  return (
    <Card className="dashboard-card">
      <CardContent className="p-6">
        <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-text-primary">
          <Icon name="trending-up" size={18} className="text-warning" />
          Bảng xếp hạng tuần
        </h3>
        <div className="space-y-3">
          {leaderboard.slice(0, 5).map((entry, idx) => (
            <div
              key={entry.user_id || `lb_${idx}`}
              className="flex items-center gap-3 rounded-xl bg-surface-subtle p-2.5 transition-colors"
            >
              <span className="w-5 text-center text-xs font-bold text-text-tertiary">
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-text-primary">
                  {entry.full_name}
                </p>
                <p suppressHydrationWarning className="text-[11px] text-text-tertiary">
                  {formatNumber(entry.xp)} XP
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
