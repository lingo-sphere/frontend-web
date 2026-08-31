'use client'

import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeading } from '@/components/dashboard/SectionHeading'
import { Icon } from '@/components/icons/icon-map'
import {
  currentUser,
  userAchievements,
  userActivities,
  leaderboardData,
  getUserRank,
} from '@/data/user-data'
import type { User, EditProfileForm } from '@/types/user'
import { UserStatsHeader } from '@/components/user/UserStatsHeader'
import { StatCard, XPProgress } from '@/components/user/UserStatsGrid'
import { UserBadgesList } from '@/components/user/UserBadgesList'
import { UserActivityList } from '@/components/user/UserActivityList'
import { EditProfileModal } from '@/components/user/UserProfileEditModal'

export default function ProfileAppPage() {
  const [user, setUser] = useState<User>(currentUser)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'activity'>('overview')

  const userRank = getUserRank(user.id)

  const handleSaveProfile = (formData: EditProfileForm) => {
    setUser((prev) => ({
      ...prev,
      displayName: formData.displayName,
      bio: formData.bio,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender ? (formData.gender as User['gender']) : undefined,
      address: formData.address,
      city: formData.city,
      country: formData.country,
    }))
    setIsEditing(false)
  }

  return (
    <Layout>
      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <SectionHeading
          eyebrow="Hồ sơ cá nhân"
          title="Thông tin tài khoản"
          description="Quản lý thông tin cá nhân và xem tiến độ học tập của bạn"
        />

        <Card className="dashboard-card mb-6">
          <CardContent className="p-6">
            <UserStatsHeader user={user} onEditClick={() => setIsEditing(true)} />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                icon="flame"
                label="Chuỗi ngày học"
                value={`${user.stats?.currentStreak || 0} ngày`}
                color="error"
              />
              <StatCard
                icon="zap"
                label="Tổng kinh nghiệm"
                value={`${(user.stats?.totalXP || 0).toLocaleString()} XP`}
                color="warning"
              />
              <StatCard
                icon="award"
                label="Xếp hạng hiện tại"
                value={`#${userRank || '-'}`}
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

        <div className="flex border-b border-surface-subtle mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon name="layout" size={16} className="inline mr-1.5" />
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'achievements'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon name="award" size={16} className="inline mr-1.5" />
            Thành tích ({userAchievements.filter((a) => a.isCompleted).length}/{userAchievements.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'activity'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon name="activity" size={16} className="inline mr-1.5" />
            Hoạt động gần đây
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <XPProgress currentXP={user.stats?.totalXP || 0} />
              <Card className="dashboard-card">
                <CardContent className="p-6">
                  <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Icon name="award" size={18} className="text-primary" />
                    Thành tích nổi bật
                  </h3>
                  <UserBadgesList achievements={userAchievements.slice(0, 4)} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="dashboard-card">
                <CardContent className="p-6">
                  <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Icon name="trending-up" size={18} className="text-warning" />
                    Bảng xếp hạng tuần
                  </h3>
                  <div className="space-y-3">
                    {leaderboardData.slice(0, 5).map((entry, idx) => (
                      <div
                        key={entry.userId}
                        className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                          entry.userId === user.id ? 'bg-primary-10' : 'bg-surface-subtle'
                        }`}
                      >
                        <span className="w-5 text-center text-xs font-bold text-text-tertiary">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-text-primary truncate">
                            {entry.displayName}
                          </p>
                          <p className="text-[11px] text-text-tertiary">
                            {entry.xp.toLocaleString()} XP
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <Card className="dashboard-card">
            <CardContent className="p-6">
              <UserBadgesList achievements={userAchievements} />
            </CardContent>
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card className="dashboard-card">
            <CardContent className="p-6">
              <UserActivityList activities={userActivities} />
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
    </Layout>
  )
}
