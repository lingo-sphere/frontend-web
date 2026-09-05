/**
 * @file profile.overview.tab.tsx
 * @description Thành phần hiển thị nội dung tab Tổng quan trong hồ sơ học viên (Điểm số, Tiến độ XP, Thành tích, Bảng xếp hạng, Khóa học gợi ý)
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/icons/icon.map'
import type { User } from '@/types/user'
import { XPProgress } from '@/components/user/user.stats'
import { UserBadgesList } from '@/components/user/user.badges'
import { UserScoreCard } from '@/components/user/user.score.card'
import { RecommendedCoursesSection } from '@/components/course/course.recommended.section'
import { ProfileLeaderboardCard } from './profile.leaderboard.card'

interface ProfileOverviewTabProps {
  user: User
  userScores: {
    totalScore: number
    listeningScore: number
    readingScore: number
    speakingScore: number
    writingScore: number
    targetScore: number
    skillsType: string
    isManuallyEdited: boolean
    hasTested: boolean
    testedAt: string | null
  }
  leaderboard: any[]
  setUserScores: React.Dispatch<React.SetStateAction<any>>
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
          setUserScores((prev: any) => ({ ...prev, ...updated }))
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
