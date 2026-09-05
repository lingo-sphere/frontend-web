/**
 * @file use.profile.data.ts
 * @description Custom hook tải và đồng bộ dữ liệu hồ sơ cá nhân, điểm đánh giá TOEIC, điểm XP và bảng xếp hạng tuần
 */

import { useState, useEffect } from 'react'
import { userService } from '@/services/user.service'
import type { User, EditProfileForm } from '@/types/user'
import { useAuthStore } from '@/store/auth.store'

export function formatNumber(val?: number): string {
  if (val === undefined || val === null) return '0'
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function useProfileData() {
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

  return {
    user,
    setUser,
    isEditing,
    setIsEditing,
    activeTab,
    setActiveTab,
    leaderboard,
    userScores,
    setUserScores,
    handleSaveProfile,
  }
}
