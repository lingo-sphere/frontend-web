'use client'

/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (portal)/profile
 */

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeading } from '@/components/dashboard/section.heading'
import { Icon } from '@/components/icons/icon-map'
import { userService } from '@/services/user.service'
import type { User, EditProfileForm } from '@/types/user'
import { useAuthStore } from '@/store/auth-store'
import { UserStatsHeader } from '@/components/user/user.header'
import { StatCard, XPProgress } from '@/components/user/user.stats'
import { UserBadgesList } from '@/components/user/user.badges'
import { UserActivityList } from '@/components/user/user.activities'
import { EditProfileModal } from '@/components/user/user.edit.modal'
import { UserScoreCard } from '@/components/user/user.score.card'
import { RecommendedCoursesSection } from '@/components/course/course.recommended.section'

function formatNumber(val?: number): string {
  if (val === undefined || val === null) return '0'
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export default function ProfileAppPage() {
  const { user: authUser } = useAuthStore()

  const [user, setUser] = useState<User>({
    id: 'current_user',
    email: '',
    username: 'learner',
    displayName: 'Học viên',
    avatar: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    role: 'student',
    isVerified: true,
    isActive: true,
    is_premium: false,
    stats: {
      totalExercises: 0,
      totalListeningExercises: 0,
      totalVocabularyLearned: 0,
      totalListeningTime: 0,
      totalSpeakingTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalXP: 0,
      level: 1,
      badges: [],
      averageAccuracy: 0,
      totalCorrectAnswers: 0,
      totalWrongAnswers: 0,
      totalStudyTime: 0,
      weeklyStudyTime: 0,
      monthlyStudyTime: 0,
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
  })

  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'activity'>('overview')
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  const [userScores, setUserScores] = useState({
    totalScore: 0,
    listeningScore: 0,
    readingScore: 0,
    speakingScore: 0,
    writingScore: 0,
    targetScore: 650,
    skillsType: '2SKILLS',
    isManuallyEdited: false,
    hasTested: false,
    testedAt: null as string | null,
  })

  useEffect(() => {
    // Client-side hydration sync
    let cachedStats: any = null
    let localScore: any = null
    try {
      if (typeof window !== 'undefined') {
        const storedStats = localStorage.getItem('lingo_cached_profile_stats')
        if (storedStats) cachedStats = JSON.parse(storedStats)
        const storedScore = localStorage.getItem('lingo_user_placement_score')
        if (storedScore) localScore = JSON.parse(storedScore)
      }
    } catch {}

    const auth = authUser || (useAuthStore.getState().user as any)
    if (auth) {
      setUser((prev) => ({
        ...prev,
        id: auth.id || prev.id,
        email: auth.email || prev.email,
        username: auth.username || auth.email?.split('@')[0] || prev.username,
        displayName: auth.full_name || prev.displayName,
        avatar: auth.avatar_url || prev.avatar,
        is_premium: Boolean(auth.is_premium),
        subscription_expires_at: auth.subscription_expires_at || prev.subscription_expires_at,
        subscription_plan: auth.subscription_plan || prev.subscription_plan,
        stats: cachedStats ? { ...prev.stats, ...cachedStats } : prev.stats,
      }))

      const sTotal = localScore?.placement_test_score ?? auth?.placement_test_score ?? auth?.current_estimated_score ?? 0
      const sList = localScore?.placement_listening_score ?? auth?.placement_listening_score ?? 0
      const sRead = localScore?.placement_reading_score ?? auth?.placement_reading_score ?? 0
      const sSpk = localScore?.placement_speaking_score ?? auth?.placement_speaking_score ?? 0
      const sWrt = localScore?.placement_writing_score ?? auth?.placement_writing_score ?? 0
      const hasScores = Boolean(sTotal > 0 || sList > 0 || sRead > 0)

      setUserScores({
        totalScore: sTotal,
        listeningScore: sList,
        readingScore: sRead,
        speakingScore: sSpk,
        writingScore: sWrt,
        targetScore: localScore?.target_toeic_score || auth?.target_toeic_score || 650,
        skillsType: localScore?.placement_skills_type || auth?.placement_skills_type || '2SKILLS',
        isManuallyEdited: localScore?.is_score_manually_edited ?? auth?.is_score_manually_edited ?? false,
        hasTested: hasScores,
        testedAt: localScore?.placement_tested_at || auth?.placement_tested_at || null,
      })
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

            if (profileData && (profileData.placement_test_score !== undefined || profileData.current_estimated_score !== undefined)) {
              const sTotal = profileData.placement_test_score ?? profileData.current_estimated_score ?? 0
              const sList = profileData.placement_listening_score ?? 0
              const sRead = profileData.placement_reading_score ?? 0
              const sSpk = profileData.placement_speaking_score ?? 0
              const sWrt = profileData.placement_writing_score ?? 0
              const sHas = Boolean(sTotal > 0 || sList > 0 || sRead > 0)

              setUserScores((prev) => ({
                ...prev,
                totalScore: sTotal,
                listeningScore: sList,
                readingScore: sRead,
                speakingScore: sSpk,
                writingScore: sWrt,
                targetScore: profileData.target_toeic_score || prev.targetScore || 650,
                skillsType: profileData.placement_skills_type || prev.skillsType || '2SKILLS',
                isManuallyEdited: profileData.is_score_manually_edited ?? prev.isManuallyEdited ?? false,
                hasTested: sHas,
                testedAt: profileData.placement_tested_at || prev.testedAt,
              }))
            }
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
    <>
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
                            <p suppressHydrationWarning className="text-[11px] text-text-tertiary">
                              {formatNumber(entry.xp_total || entry.xp || 100)} XP
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <RecommendedCoursesSection
              currentScore={userScores.totalScore}
              targetScore={userScores.targetScore}
            />
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
    </>
  )
}
