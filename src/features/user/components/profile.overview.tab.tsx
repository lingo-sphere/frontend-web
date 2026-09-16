// Thành phần hiển thị nội dung tab Tổng quan trong hồ sơ học viên (Điểm số, Tiến độ XP, Thành tích, Bảng xếp hạng, Khóa học gợi ý).
'use client'

import { Card, CardContent } from '@/components/card'
import { Icon } from '@/components/icon.map'
import type { User } from '@/features/user/types/user'
import { XPProgress } from '@/features/user/components/user.stats'
import { UserBadgesList } from '@/features/user/components/user.badges'
import { UserScoreCard } from '@/features/user/components/user.score.card'
import { RecommendedCoursesSection } from '@/features/courses/components/course.recommended.section'
import { ProfileLeaderboardCard } from '@/features/user/components/profile.leaderboard.card'
import type { UserScoreData, LeaderboardEntry } from '@/features/user/utils/user.score.utils'

interface ProfileOverviewTabProps {
  user: User
  userScores: UserScoreData
  leaderboard: LeaderboardEntry[]
  setUserScores: React.Dispatch<React.SetStateAction<UserScoreData>>
}

export function ProfileOverviewTab({
  user,
  userScores,
  leaderboard,
  setUserScores,
}: ProfileOverviewTabProps) {
  return (
    <div className="space-y-6">
      <UserScoreCard
        userScores={userScores}
        onScoresUpdated={(updated) => {
          setUserScores((prev) => ({ ...prev, ...updated }))
        }}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <XPProgress currentXP={user.stats?.totalXP || 0} />
          <Card className="dashboard-card">
            <CardContent className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-text-primary">
                <Icon name="award" size={18} className="text-primary" />
                Thành tích nổi bật
              </h3>
              <UserBadgesList achievements={[]} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <ProfileLeaderboardCard leaderboard={leaderboard} />
        </div>
      </div>

      <RecommendedCoursesSection
        currentScore={userScores.totalScore}
        targetScore={userScores.targetScore}
      />
    </div>
  )
}
