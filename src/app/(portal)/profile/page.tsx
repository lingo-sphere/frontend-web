'use client'

/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (portal)/profile
 */

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeading } from '@/components/dashboard/SectionHeading'
import { Icon } from '@/components/icons/icon-map'
import { userService } from '@/services/user.service'
import type { User, EditProfileForm } from '@/types/user'
import { useAuthStore } from '@/store/auth-store'
import { UserStatsHeader } from '@/components/user/UserStatsHeader'
import { StatCard, XPProgress } from '@/components/user/UserStatsGrid'
import { UserBadgesList } from '@/components/user/UserBadgesList'
import { UserActivityList } from '@/components/user/UserActivityList'
import { EditProfileModal } from '@/components/user/UserProfileEditModal'

export default function ProfileAppPage() {
  const { user: authUser } = useAuthStore()

  const [user, setUser] = useState<User>(() => {
    const currentAuth = useAuthStore.getState().user
    let cachedStats: any = null
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('lingo_cached_profile_stats')
        if (stored) cachedStats = JSON.parse(stored)
      }
    } catch {}

    return {
      id: currentAuth?.id || 'current_user',
      email: currentAuth?.email || '',
      username: (currentAuth as any)?.username || currentAuth?.email?.split('@')[0] || 'learner',
      displayName: currentAuth?.full_name || 'Học viên',
      avatar: currentAuth?.avatar_url || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role: (currentAuth?.role?.toLowerCase() as any) || 'student',
      isVerified: true,
      isActive: true,
      is_premium: Boolean(currentAuth?.is_premium),
      subscription_expires_at: currentAuth?.subscription_expires_at,
      subscription_plan: currentAuth?.subscription_plan,
      stats: {
        totalExercises: cachedStats?.totalExercises || 0,
        totalListeningExercises: cachedStats?.totalListeningExercises || 0,
        totalVocabularyLearned: cachedStats?.totalVocabularyLearned || 0,
        totalListeningTime: cachedStats?.totalListeningTime || 0,
        totalSpeakingTime: cachedStats?.totalSpeakingTime || 0,
        currentStreak: cachedStats?.currentStreak || 0,
        longestStreak: cachedStats?.longestStreak || 0,
        totalXP: cachedStats?.totalXP || 0,
        level: cachedStats?.level || 1,
        badges: cachedStats?.badges || [],
        averageAccuracy: cachedStats?.averageAccuracy || 0,
        totalCorrectAnswers: cachedStats?.totalCorrectAnswers || 0,
        totalWrongAnswers: cachedStats?.totalWrongAnswers || 0,
        totalStudyTime: cachedStats?.totalStudyTime || 0,
        weeklyStudyTime: cachedStats?.weeklyStudyTime || 0,
        monthlyStudyTime: cachedStats?.monthlyStudyTime || 0,
      },
      preferences: {
        language: 'vi',
        theme: 'system',
        notifications: {
          allEnabled: true,
          email: true,
          push: true,
          sound: true,
        },
        learning: {
          autoPlayAudio: true,
          showPhonetic: true,
          defaultExerciseDifficulty: 'medium',
          dailyGoal: 20,
        },
        privacy: {
          showProfile: true,
          showProgress: true,
          allowFriendRequests: true,
        },
      },
    }
  })

  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'activity'>('overview')
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  useEffect(() => {
    if (authUser) {
      setUser((prev) => ({
        ...prev,
        id: authUser.id || prev.id,
        email: authUser.email || prev.email,
        username: (authUser as any)?.username || prev.username,
        displayName: authUser.full_name || prev.displayName,
        avatar: authUser.avatar_url || prev.avatar,
        is_premium: Boolean(authUser.is_premium),
        subscription_expires_at: authUser.subscription_expires_at || prev.subscription_expires_at,
        subscription_plan: authUser.subscription_plan || prev.subscription_plan,
      }))
    }
  }, [authUser])

  useEffect(() => {
    let isMounted = true
    const loadProfileData = async () => {
      try {
        const [prof, gamify, lb] = await Promise.all([
          userService.getProfile().catch(() => null),
          userService.getGamificationProfile().catch(() => null),
          userService.getLeaderboard('weekly').catch(() => []),
        ])

        if (isMounted) {
          if (prof) {
            const profileData = (prof as any)?.profile || prof
            setUser((prev) => {
              const updatedStats = {
                ...prev.stats,
                totalXP: (gamify as any)?.total_xp ?? prev.stats?.totalXP ?? 0,
                currentStreak: (gamify as any)?.streak_days ?? prev.stats?.currentStreak ?? 0,
                longestStreak: (gamify as any)?.longest_streak ?? prev.stats?.longestStreak ?? 0,
              }
              try {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('lingo_cached_profile_stats', JSON.stringify(updatedStats))
                }
              } catch {}

              return {
                ...prev,
                id: profileData?.id || profileData?._id || prev.id,
                email: profileData?.email || prev.email,
                username: profileData?.username || prev.username,
                displayName: profileData?.full_name || profileData?.displayName || prev.displayName,
                avatar: profileData?.avatar_url || profileData?.avatar || prev.avatar,
                bio: profileData?.bio || prev.bio,
                is_premium: Boolean(profileData?.is_premium || (prof as any)?.is_premium || (prof as any)?.subscription || prev.is_premium),
                subscription_expires_at: profileData?.subscription_expires_at || (prof as any)?.subscription_expires_at || (prof as any)?.subscription?.expires_at || prev.subscription_expires_at,
                subscription_plan: profileData?.subscription_plan || (prof as any)?.subscription_plan || (prof as any)?.subscription?.billing_cycle || prev.subscription_plan,
                stats: updatedStats,
              }
            })
          }
          if (Array.isArray(lb)) {
            setLeaderboard(lb)
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err)
      }
    }
    loadProfileData()
    return () => {
      isMounted = false
    }
  }, [])

  const handleSaveProfile = async (formData: EditProfileForm) => {
    try {
      await userService.updateProfile({
        full_name: formData.displayName,
        phone_number: formData.phone,
      } as any)
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
    } catch (err) {
      console.error('Update profile failed:', err)
    }
    setIsEditing(false)
  }

  return (
    <Layout>
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
                value={`${(user.stats?.totalXP || 0).toLocaleString()} XP`}
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
            className={`px-4 pb-3 text-sm font-medium border-b-2 transition-colors ${
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
            className={`px-4 pb-3 text-sm font-medium border-b-2 transition-colors ${
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
            className={`px-4 pb-3 text-sm font-medium border-b-2 transition-colors ${
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
              <Card className="dashboard-card">
                <CardContent className="p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-text-primary">
                    <Icon name="trending-up" size={18} className="text-warning" />
                    Bảng xếp hạng tuần
                  </h3>
                  <div className="space-y-3">
                    {leaderboard.slice(0, 5).map((entry, idx) => (
                      <div
                        key={entry.user_id || idx}
                        className="flex items-center gap-3 rounded-xl bg-surface-subtle p-2.5 transition-colors"
                      >
                        <span className="w-5 text-center text-xs font-bold text-text-tertiary">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-text-primary">
                            {entry.full_name || entry.username || entry.user_name || `Học viên #${idx + 1}`}
                          </p>
                          <p className="text-[11px] text-text-tertiary">
                            {(entry.xp_total || entry.xp || 100).toLocaleString()} XP
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
    </Layout>
  )
}
