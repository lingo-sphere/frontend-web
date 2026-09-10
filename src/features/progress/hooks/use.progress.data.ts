// Custom React hook quản lý trạng thái tải dữ liệu và tính toán chỉ số học tập trang Tiến độ

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { authService } from '@/features/auth/services/auth.service'
import { userService, type GamificationProfile } from '@/features/user/services/user.service'
import { progressService, type UserCourseProgressItem, type UserRoadmapProgress } from '@/features/progress/services/progress.service'
import { courseService } from '@/features/courses/services/course.service'
import { examService, type ToeicLearningProfile } from '@/features/toeic/services/exam.service'
import { vocabularyService } from '@/features/vocabulary/services/vocabulary.service'
import type { Course, CourseEnrollment } from '@/types/api.types'

export interface VocabStatsSummary {
  learned_words: number
  review_due: number
  total_cards: number
}

export interface UnifiedCourseCardItem {
  course_id: string
  title: string
  thumbnail_url?: string
  level: string
  category: string
  progress_percentage: number
  completed_lessons_count: number
  total_lessons_count: number
  completed_modules_count: number
  total_modules_count: number
  status: string
  enrolled_at: string
}

export interface ProgressMetrics {
  totalCourses: number
  completedCourses: number
  avgProgress: number
  totalLessons: number
  totalAttemptsCount: number
  passRate: number
  currentScore: number
  targetScore: number
  scoreProgressPercent: number
  streak: number
  xp: number
  level: string
}

export interface ProgressRecentActivity {
  id: string
  courseId?: string
  type: 'TOEIC' | 'COURSE'
  title: string
  subtitle: string
  scoreText: string
  isPassed: boolean
  submittedAt: string
}

export function useProgressData(navigate: (path: string) => void) {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState<boolean>(false)

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [courseProgresses, setCourseProgresses] = useState<UserCourseProgressItem[]>([])
  const [myEnrolledCourses, setMyEnrolledCourses] = useState<CourseEnrollment[]>([])
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [roadmapProgress, setRoadmapProgress] = useState<UserRoadmapProgress | null>(null)
  const [examProfile, setExamProfile] = useState<ToeicLearningProfile | null>(null)
  const [gamification, setGamification] = useState<GamificationProfile | null>(null)
  const [testAttempts, setTestAttempts] = useState<Array<{
    attempt_id: string
    test_type: string
    course_id: string
    module_id?: string
    order_index?: number
    score: number
    correct_count: number
    total_questions: number
    is_passed: boolean
    submitted_at: string
  }>>([])
  const [toeicAttempts, setToeicAttempts] = useState<Array<{
    _id: string
    exam_title: string
    total_scaled_score: number
    correct_questions: number
    total_questions: number
    submitted_at: string
  }>>([])
  const [vocabStats, setVocabStats] = useState<VocabStatsSummary>({
    learned_words: 0,
    review_due: 0,
    total_cards: 0,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !authService.isAuthenticated()) {
      navigate('/login')
    }
  }, [mounted, navigate])

  const loadAllProgressData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [
        coursesProgressRes,
        enrolledCoursesRes,
        allCoursesRes,
        roadmapRes,
        examProfileRes,
        gamificationRes,
        testAttemptsRes,
        examHistoryRes,
        vocabProgressRes,
      ] = await Promise.allSettled([
        progressService.getMyCoursesProgress(),
        courseService.getMyEnrolledCourses(),
        courseService.getAllCourses(),
        progressService.getMyRoadmapProgress(),
        examService.getMyExamProfile(),
        userService.getGamificationProfile(),
        progressService.getMyTestAttempts(),
        examService.getMyExamHistory(),
        vocabularyService.getMyVocabProgress(),
      ])

      if (coursesProgressRes.status === 'fulfilled' && Array.isArray(coursesProgressRes.value)) {
        setCourseProgresses(coursesProgressRes.value)
      }
      if (enrolledCoursesRes.status === 'fulfilled' && Array.isArray(enrolledCoursesRes.value)) {
        setMyEnrolledCourses(enrolledCoursesRes.value)
      }
      if (allCoursesRes.status === 'fulfilled' && Array.isArray(allCoursesRes.value)) {
        setAllCourses(allCoursesRes.value)
      }
      if (roadmapRes.status === 'fulfilled') {
        setRoadmapProgress(roadmapRes.value)
      }
      if (examProfileRes.status === 'fulfilled' && examProfileRes.value) {
        setExamProfile(examProfileRes.value)
      }
      if (gamificationRes.status === 'fulfilled' && gamificationRes.value) {
        setGamification(gamificationRes.value)
      }
      if (testAttemptsRes.status === 'fulfilled' && Array.isArray(testAttemptsRes.value)) {
        setTestAttempts(testAttemptsRes.value)
      }
      if (examHistoryRes.status === 'fulfilled' && Array.isArray(examHistoryRes.value)) {
        setToeicAttempts(examHistoryRes.value as unknown as typeof toeicAttempts)
      }
      if (vocabProgressRes.status === 'fulfilled' && vocabProgressRes.value) {
        const raw = vocabProgressRes.value as Record<string, unknown>
        setVocabStats({
          learned_words: Number(raw.learned_words || raw.total_learned || 0),
          review_due: Number(raw.review_due || raw.due_cards || 0),
          total_cards: Number(raw.total_cards || 0),
        })
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAllProgressData()
  }, [loadAllProgressData])

  const activeUser = mounted ? user : null

  const coursesMap = useMemo(() => {
    const map = new Map<string, Course>()
    allCourses.forEach((c) => {
      if (c.id) map.set(c.id, c)
      if (c._id) map.set(c._id, c)
    })
    return map
  }, [allCourses])

  const enrolledCourseCards = useMemo<UnifiedCourseCardItem[]>(() => {
    const courseProgressMap = new Map<string, UserCourseProgressItem>()
    courseProgresses.forEach((cp) => {
      if (cp.course_id) {
        courseProgressMap.set(cp.course_id, cp)
      }
    })

    const enrolledMap = new Map<string, CourseEnrollment>()
    myEnrolledCourses.forEach((e) => {
      if (e.course_id) {
        enrolledMap.set(e.course_id, e)
      }
    })

    const allCourseIds = Array.from(
      new Set([...Array.from(enrolledMap.keys()), ...Array.from(courseProgressMap.keys())])
    )

    return allCourseIds.map((courseId) => {
      const enrollment = enrolledMap.get(courseId)
      const progress = courseProgressMap.get(courseId)
      const catalogCourse = coursesMap.get(courseId) || enrollment?.course

      const title = catalogCourse?.title || `Khóa học: ${courseId}`
      const thumbnail_url = catalogCourse?.thumbnail_url
      const level = catalogCourse?.level || 'Mọi cấp độ'
      const category = catalogCourse?.category || 'TOEIC'

      const completedLessons = progress?.completed_lessons_count ?? 0
      const totalLessons = progress?.total_lessons_count || catalogCourse?.total_lessons || 1
      const completedModules = progress?.completed_modules_count ?? 0
      const totalModules = progress?.total_modules_count || 1
      const progressPercent = progress?.progress_percentage ?? (enrollment?.progress_percent ?? 0)
      const status = progress?.status || (progressPercent >= 100 ? 'COMPLETED' : 'ACTIVE')
      const enrolledAt = progress?.enrolled_at || enrollment?.enrolled_at || ''

      return {
        course_id: courseId,
        title,
        thumbnail_url,
        level,
        category,
        progress_percentage: progressPercent,
        completed_lessons_count: completedLessons,
        total_lessons_count: totalLessons,
        completed_modules_count: completedModules,
        total_modules_count: totalModules,
        status,
        enrolled_at: enrolledAt,
      }
    })
  }, [courseProgresses, myEnrolledCourses, coursesMap])

  const metrics = useMemo<ProgressMetrics>(() => {
    const totalCourses = enrolledCourseCards.length
    const completedCourses = enrolledCourseCards.filter(
      (cp) => cp.status === 'COMPLETED' || cp.progress_percentage >= 100
    ).length
    const avgProgress =
      totalCourses > 0
        ? Math.round(
            enrolledCourseCards.reduce((acc, curr) => acc + (curr.progress_percentage || 0), 0) /
              totalCourses
          )
        : 0

    const totalLessons = enrolledCourseCards.reduce(
      (acc, curr) => acc + (curr.completed_lessons_count || 0),
      0
    )

    const totalAttemptsCount = testAttempts.length + toeicAttempts.length
    const passedAttemptsCount =
      testAttempts.filter((t) => t.is_passed).length +
      toeicAttempts.filter((t) => t.total_scaled_score >= 450).length
    const passRate =
      totalAttemptsCount > 0 ? Math.round((passedAttemptsCount / totalAttemptsCount) * 100) : 0

    const currentScore = Number(
      activeUser?.placement_test_score ??
        examProfile?.profile?.best_score ??
        activeUser?.current_estimated_score ??
        0
    )
    const targetScore = Number(
      activeUser?.target_toeic_score ??
        activeUser?.target_score ??
        examProfile?.profile?.target_score ??
        roadmapProgress?.target_score ??
        800
    )
    const scoreProgressPercent = Math.min(
      100,
      Math.max(0, Math.round((currentScore / (targetScore || 990)) * 100))
    )

    const streak = gamification?.current_streak ?? Number(activeUser?.streak_count || 0)
    const xp = gamification?.total_xp ?? Number(activeUser?.xp || 0)
    const level = gamification?.level ? String(gamification.level) : (activeUser?.level || '1')

    return {
      totalCourses,
      completedCourses,
      avgProgress,
      totalLessons,
      totalAttemptsCount,
      passRate,
      currentScore,
      targetScore,
      scoreProgressPercent,
      streak,
      xp,
      level,
    }
  }, [enrolledCourseCards, testAttempts, toeicAttempts, activeUser, examProfile, roadmapProgress, gamification])

  const recentActivities = useMemo<ProgressRecentActivity[]>(() => {
    const list: ProgressRecentActivity[] = []

    toeicAttempts.slice(0, 5).forEach((t) => {
      list.push({
        id: t._id,
        type: 'TOEIC',
        title: t.exam_title || 'Đề thi TOEIC',
        subtitle: `Đúng ${t.correct_questions}/${t.total_questions} câu`,
        scoreText: `${t.total_scaled_score} / 990 điểm`,
        isPassed: t.total_scaled_score >= 450,
        submittedAt: t.submitted_at,
      })
    })

    testAttempts.slice(0, 5).forEach((c) => {
      const courseMeta = coursesMap.get(c.course_id)
      const testName =
        c.test_type === 'final-test'
          ? 'Bài thi tốt nghiệp Exit Test'
          : c.test_type === 'challenge'
          ? `Thử thách chương ${c.order_index ?? ''}`
          : `Kiểm tra cuối chương ${c.order_index ?? ''}`

      list.push({
        id: c.attempt_id,
        courseId: c.course_id,
        type: 'COURSE',
        title: testName,
        subtitle: courseMeta?.title || `Khóa học ID: ${c.course_id}`,
        scoreText: `${c.score}%`,
        isPassed: c.is_passed,
        submittedAt: c.submitted_at,
      })
    })

    list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    return list.slice(0, 5)
  }, [toeicAttempts, testAttempts, coursesMap])

  const listeningScore = Number(
    activeUser?.placement_listening_score ??
      examProfile?.profile?.best_listening_score ??
      0
  )
  const readingScore = Number(
    activeUser?.placement_reading_score ??
      examProfile?.profile?.best_reading_score ??
      0
  )

  return {
    isLoading,
    activeUser,
    roadmapProgress,
    enrolledCourseCards,
    metrics,
    recentActivities,
    vocabStats,
    listeningScore,
    readingScore,
    reload: loadAllProgressData,
  }
}
