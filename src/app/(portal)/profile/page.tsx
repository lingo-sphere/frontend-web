/**
 * @file page.tsx
 * @description Trang hồ sơ cá nhân và quản lý tiến độ học tập của học viên LingoSphere
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { SectionHeading } from '@/components/dashboard/section.heading'
import { Icon } from '@/components/icons/icon.map'
import { UserStatsHeader } from '@/components/user/user.header'
import { StatCard } from '@/components/user/user.stats'
import { UserBadgesList } from '@/components/user/user.badges'
import { UserActivityList } from '@/components/user/user.activities'
import { EditProfileModal } from '@/components/user/user.edit.modal'
import { useProfileData, formatNumber } from './use.profile.data'
import { ProfileOverviewTab } from './profile.overview.tab'

export default function ProfileAppPage() {
  const {
    user,
    isEditing,
    setIsEditing,
    activeTab,
    setActiveTab,
    leaderboard,
    userScores,
    setUserScores,
    handleSaveProfile,
  } = useProfileData()

  return (
    <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <SectionHeading
        eyebrow="Hồ sơ cá nhân"
        title="Thông tin tài khoản"
        description="Quản lý thông tin cá nhân và xem tiến độ học tập của bạn"
      />

      <Card className="dashboard-card mb-6">
        <CardContent className="p-6">
          <UserStatsHeader user={user} onEditClick={() => setIsEditing(true)} />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon="flame"
              label="Chuỗi ngày học"
              value={`${user.stats?.currentStreak || 0} ngày`}
              color="error"
            />
            <StatCard
              icon="zap"
              label="Tổng kinh nghiệm"
              value={`${formatNumber(user.stats?.totalXP || 0)} XP`}
              color="warning"
            />
            <StatCard
              icon="award"
              label="Cấp độ"
              value={`Level ${user.stats?.level || 1}`}
              color="primary"
            />
            <StatCard
              icon="book-open"
              label="Từ đã học"
              value={user.stats?.totalVocabularyLearned || 0}
              color="success"
            />
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 flex border-b border-surface-subtle">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Icon name="layout" size={16} className="mr-1.5 inline" />
          Tổng quan
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'achievements'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Icon name="award" size={16} className="mr-1.5 inline" />
          Thành tích
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'activity'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Icon name="activity" size={16} className="mr-1.5 inline" />
          Hoạt động gần đây
        </button>
      </div>

      {activeTab === 'overview' && (
        <ProfileOverviewTab
          user={user}
          userScores={userScores}
          leaderboard={leaderboard}
          setUserScores={setUserScores}
        />
      )}

      {activeTab === 'achievements' && (
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <UserBadgesList achievements={[]} />
          </CardContent>
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <UserActivityList activities={[]} />
          </CardContent>
        </Card>
      )}

      {isEditing && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditing(false)}
          onSave={handleSaveProfile}
        />
      )}
    </main>
  )
}
