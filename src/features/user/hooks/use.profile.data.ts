// Custom hook tải và đồng bộ dữ liệu hồ sơ cá nhân và bảng xếp hạng bằng TanStack Query.
import { useState, useEffect } from 'react'
import { userService } from '@/features/user/services/user.service'
import { useLeaderboardQuery } from '@/features/leaderboard/hooks/use.leaderboard.query'
import type { User, EditProfileForm } from '@/features/user/types/user'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { storage, STORAGE_KEYS } from '@/lib/storage'

export function formatNumber(val?: number): string {
  if (val === undefined || val === null) return '0'
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const defaultUserState: User = {
  id: 'current_user',
  user_id: '',
  email: '',
  full_name: 'Học viên',
  avatar_url: '',
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
}

const defaultUserScores = {
  totalScore: 0,
  listeningScore: 0,
  readingScore: 0,
  speakingScore: 0,
  writingScore: 0,
  targetScore: 0,
  skillsType: '2SKILLS',
  isManuallyEdited: false,
  hasTested: false,
  testedAt: null as string | null,
}

export function useProfileData() {
  const { user: authUser } = useAuthStore()

  const [user, setUser] = useState<User>(defaultUserState)

  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'activity'>('overview')
  const { data: leaderboard = [] } = useLeaderboardQuery('weekly')

  const [userScores, setUserScores] = useState(defaultUserScores)

  useEffect(() => {
    const auth = authUser || useAuthStore.getState().user
    if (auth) {
      const cachedStats = storage.get<{ totalXP?: number; currentStreak?: number; longestStreak?: number }>(STORAGE_KEYS.PROFILE_STATS)
      setUser((prev) => ({
        ...prev,
        id: auth.user_id || auth.id || prev.id,
        user_id: auth.user_id || prev.user_id,
        email: auth.email || prev.email,
        full_name: auth.full_name || prev.full_name,
        avatar_url: auth.avatar_url || prev.avatar_url,
        is_premium: Boolean(auth.is_premium),
        subscription_expires_at: auth.subscription_expires_at || prev.subscription_expires_at,
        subscription_plan: auth.subscription_plan || prev.subscription_plan,
        stats: cachedStats ? { ...prev.stats, ...cachedStats } : prev.stats,
      }))

      const rawAuth = auth as any
      const sTotal = Number(rawAuth?.placement_test_score || rawAuth?.current_estimated_score || 0)
      const sList = Number(rawAuth?.placement_listening_score || 0)
      const sRead = Number(rawAuth?.placement_reading_score || 0)
      const sSpk = Number(rawAuth?.placement_speaking_score || 0)
      const sWrt = Number(rawAuth?.placement_writing_score || 0)
      const hasScores = Boolean(sTotal > 0 || sList > 0 || sRead > 0)
      const isManual = Boolean(rawAuth?.is_score_manually_edited)
      const rawTarget = rawAuth?.target_toeic_score ?? rawAuth?.target_score
      const resolvedTarget = (hasScores || isManual) && rawTarget ? Number(rawTarget) : 0

      setUserScores({
        totalScore: sTotal,
        listeningScore: sList,
        readingScore: sRead,
        speakingScore: sSpk,
        writingScore: sWrt,
        targetScore: resolvedTarget,
        skillsType: rawAuth?.placement_skills_type || '2SKILLS',
        isManuallyEdited: isManual,
        hasTested: hasScores,
        testedAt: rawAuth?.placement_tested_at || null,
      })
    } else {
      setUser(defaultUserState)
      setUserScores(defaultUserScores)
    }
  }, [authUser])

  useEffect(() => {
    let isMounted = true
    const loadProfileData = async () => {
      const auth = authUser || useAuthStore.getState().user
      if (!auth) return
      try {
        const [prof, gamify] = await Promise.all([
          userService.getProfile().catch(() => null),
          userService.getGamificationProfile().catch(() => null),
        ])

        if (isMounted) {
          if (prof) {
            const profileData = prof.profile
            setUser((prev) => {
              const updatedStats = {
                ...prev.stats,
                totalXP: gamify?.total_xp ?? prev.stats?.totalXP ?? 0,
                currentStreak: gamify?.current_streak ?? prev.stats?.currentStreak ?? 0,
                longestStreak: gamify?.longest_streak ?? prev.stats?.longestStreak ?? 0,
              }
              storage.set(STORAGE_KEYS.PROFILE_STATS, updatedStats)

              return {
                ...prev,
                id: profileData?.id || profileData?._id || prev.id,
                user_id: profileData?.user_id || prev.user_id,
                email: profileData?.email || prev.email,
                full_name: profileData?.full_name || prev.full_name,
                avatar_url: profileData?.avatar_url || prev.avatar_url,
                bio: profileData?.bio || prev.bio,
                phone_number: profileData?.phone_number || prev.phone_number,
                date_of_birth: profileData?.date_of_birth ? String(profileData.date_of_birth) : prev.date_of_birth,
                is_premium: Boolean(prof.is_premium || profileData?.is_premium || prev.is_premium),
                subscription_expires_at: prof.subscription_expires_at || profileData?.subscription_expires_at || prev.subscription_expires_at,
                subscription_plan: prof.subscription_plan || profileData?.subscription_plan || prev.subscription_plan,
                stats: updatedStats,
              }
            })

            const pEstimate = profileData?.current_estimated_score
            const pPlacement = profileData?.placement_test_score
            if (pPlacement !== undefined || pEstimate !== undefined) {
              const sTotal = pPlacement ?? pEstimate ?? 0
              const sList = profileData?.placement_listening_score ?? 0
              const sRead = profileData?.placement_reading_score ?? 0
              const sSpk = profileData?.placement_speaking_score ?? 0
              const sWrt = profileData?.placement_writing_score ?? 0
              const sHas = Boolean(sTotal > 0 || sList > 0 || sRead > 0)
              const isManual = Boolean(profileData?.is_score_manually_edited)
              const rawTarget = profileData?.target_toeic_score ?? profileData?.target_score
              const resolvedTarget = (sHas || isManual) && rawTarget ? Number(rawTarget) : 0

              setUserScores((prev) => ({
                ...prev,
                totalScore: sTotal,
                listeningScore: sList,
                readingScore: sRead,
                speakingScore: sSpk,
                writingScore: sWrt,
                targetScore: resolvedTarget,
                skillsType: profileData?.placement_skills_type || prev.skillsType || '2SKILLS',
                isManuallyEdited: isManual,
                hasTested: sHas,
              }))
            }
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
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender ? (formData.gender as 'MALE' | 'FEMALE' | 'OTHER') : undefined,
        bio: formData.bio,
      })
      setUser((prev) => ({
        ...prev,
        full_name: formData.full_name,
        bio: formData.bio,
        phone_number: formData.phone_number,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender || undefined,
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
