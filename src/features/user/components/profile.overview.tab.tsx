// Thành phần hiển thị nội dung tab Tổng quan trong hồ sơ học viên (Điểm số, Thành tích, Khóa học gợi ý).
'use client'

import { Card, CardContent } from '@/components/card'
import { Icon } from '@/components/icon.map'
import type { User } from '@/features/user/types/user'
import { UserBadgesList } from '@/features/user/components/user.badges'
import { UserScoreCard } from '@/features/user/components/user.score.card'
import { RecommendedCoursesSection } from '@/features/courses/components/course.recommended.section'
import type { UserScoreData, LeaderboardEntry } from '@/features/user/utils/user.score.utils'

interface ProfileOverviewTabProps {
  user: User
  userScores: UserScoreData
  setUserScores: React.Dispatch<React.SetStateAction<UserScoreData>>
}

export function ProfileOverviewTab({
  user,
  userScores,
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

      <Card className="dashboard-card">
        <CardContent className="p-6">
          <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-text-primary">
            <Icon name="award" size={18} className="text-primary" />
            Thành tích nổi bật
          </h3>
          <UserBadgesList achievements={[]} />
        </CardContent>
      </Card>

      <RecommendedCoursesSection
        currentScore={userScores.totalScore}
        targetScore={userScores.targetScore}
      />
    </div>
  )
}
