// Custom React hook quản lý trạng thái tải dữ liệu và tính toán chỉ số học tập trang Tiến độ bằng TanStack Query.
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { authService } from '@/features/auth/services/auth.service'
import { progressKeys } from '@/features/progress/keys/progress.keys'
import { courseKeys } from '@/features/courses/keys/course.keys'
import {
  useCoursesProgressQuery,
  useRoadmapProgressQuery,
  useExamProfileQuery,
  useGamificationProfileQuery,
  useTestAttemptsQuery,
  useExamHistoryQuery,
  useVocabProgressQuery,
} from '@/features/progress/hooks/use.progress.query'
import { useAllCoursesQuery, useMyEnrollmentsQuery } from '@/features/courses/hooks/use.courses.query'
import type { Course, CourseEnrollment } from '@/types/api.types'
import type { UserCourseProgressItem } from '@/features/progress/services/progress.service'

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
  moduleId?: string
  type: 'TOEIC' | 'COURSE'
  examType?: string
  title: string
  subtitle: string
  scoreText: string
  scoreValue: number
  maxScore: number
  scorePercentage: number
  correctCount: number
  totalQuestions: number
  listeningScore?: number
  readingScore?: number
  durationSeconds?: number
  isPassed: boolean
  isBestAttempt?: boolean
  submittedAt: string
}

export function useProgressData(navigate: (path: string) => void) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !authService.isAuthenticated()) {
      navigate('/')
    }
  }, [mounted, navigate])

  const isEnabled = mounted && authService.isAuthenticated()

  const coursesProgressQuery = useCoursesProgressQuery(isEnabled)
  const myEnrollmentsQuery = useMyEnrollmentsQuery(isEnabled)
  const allCoursesQuery = useAllCoursesQuery(undefined, isEnabled)
  const roadmapProgressQuery = useRoadmapProgressQuery(isEnabled)
  const examProfileQuery = useExamProfileQuery(isEnabled)
  const gamificationQuery = useGamificationProfileQuery(isEnabled)
  const testAttemptsQuery = useTestAttemptsQuery(isEnabled)
  const examHistoryQuery = useExamHistoryQuery(isEnabled)
  const vocabProgressQuery = useVocabProgressQuery(isEnabled)

  const activeUser = mounted ? user : null

  const courseProgresses = coursesProgressQuery.data || []
  const myEnrolledCourses = myEnrollmentsQuery.data || []
  const allCourses = allCoursesQuery.data || []
  const roadmapProgress = roadmapProgressQuery.data || null
  const examProfile = examProfileQuery.data || null
  const gamification = gamificationQuery.data || null
  const testAttempts = testAttemptsQuery.data || []
  const toeicAttempts = examHistoryQuery.data || []
  const rawVocab = vocabProgressQuery.data

  const vocabStats: VocabStatsSummary = useMemo(() => {
    if (!rawVocab) {
      return { learned_words: 0, review_due: 0, total_cards: 0 }
    }
    const raw = rawVocab as unknown as Record<string, unknown>
    return {
      learned_words: Number(raw.learned_words || raw.total_learned || 0),
      review_due: Number(raw.review_due || raw.due_cards || 0),
      total_cards: Number(raw.total_cards || 0),
    }
  }, [rawVocab])

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

      return {
        course_id: courseId,
        title,
        thumbnail_url,
        level,
        category,
        progress_percentage: Math.min(100, Math.max(0, Math.round(progressPercent))),
        completed_lessons_count: completedLessons,
        total_lessons_count: totalLessons,
        completed_modules_count: completedModules,
        total_modules_count: totalModules,
        status: enrollment?.status || (progressPercent >= 100 ? 'COMPLETED' : 'STUDYING'),
        enrolled_at: enrollment?.enrolled_at || new Date().toISOString(),
      }
    })
  }, [courseProgresses, myEnrolledCourses, coursesMap])

  const metrics: ProgressMetrics = useMemo(() => {
    const totalCourses = enrolledCourseCards.length
    const completedCourses = enrolledCourseCards.filter(
      (c) => c.status === 'COMPLETED' || c.progress_percentage >= 100
    ).length
    const avgProgress = totalCourses
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
    const passedAttempts =
      testAttempts.filter((t) => t.is_passed).length +
      toeicAttempts.filter((t) => (t.total_scaled_score || 0) >= 450).length
    const passRate = totalAttemptsCount ? Math.round((passedAttempts / totalAttemptsCount) * 100) : 0

    const currentScore = Number(
      activeUser?.current_estimated_score ||
        examProfile?.profile?.estimated_score ||
        0
    )
    const targetScore = Number(
      activeUser?.target_toeic_score ||
        roadmapProgress?.target_score ||
        examProfile?.profile?.target_score ||
        0
    )
    const scoreProgressPercent = targetScore > 0
      ? Math.min(100, Math.max(0, Math.round((currentScore / targetScore) * 100)))
      : 0

    const streak = Number(gamification?.streak ?? activeUser?.streak_count ?? 0)
    const xp = Number(gamification?.total_xp ?? activeUser?.xp ?? 0)
    const level = String(gamification?.level ?? activeUser?.level ?? 1)

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

  const recentActivities: ProgressRecentActivity[] = useMemo(() => {
    const list: ProgressRecentActivity[] = []

    toeicAttempts.forEach((t) => {
      const correct = t.correct_questions || 0
      const total = t.total_questions || 200
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0
      const score = t.total_scaled_score || 0
      list.push({
        id: t._id,
        type: 'TOEIC',
        examType: t.exam_type,
        title: t.exam_title || 'Bài thi TOEIC Full Test',
        subtitle: `Điểm đạt: ${score}/990 (${correct}/${total} câu đúng)`,
        scoreText: `${score} điểm`,
        scoreValue: score,
        maxScore: 990,
        scorePercentage: pct,
        correctCount: correct,
        totalQuestions: total,
        listeningScore: t.listening_scaled_score,
        readingScore: t.reading_scaled_score,
        durationSeconds: t.total_time_seconds,
        isPassed: score >= 450,
        isBestAttempt: Boolean(t.is_best_attempt),
        submittedAt: t.submitted_at || new Date().toISOString(),
      })
    })

    testAttempts.forEach((c) => {
      const courseMeta = coursesMap.get(c.course_id)
      const testName =
        c.test_type === 'final-test'
          ? 'Bài thi tốt nghiệp Exit Test'
          : `Kiểm tra chương ${c.order_index ?? ''}`

      const score = Math.round(c.score || 0)
      const correct = c.correct_count ?? 0
      const total = c.total_questions ?? 0
      const pct = total > 0 ? Math.round((correct / total) * 100) : score

      list.push({
        id: c.attempt_id,
        courseId: c.course_id,
        moduleId: c.module_id,
        type: 'COURSE',
        examType: c.test_type,
        title: testName,
        subtitle: courseMeta?.title || `Khóa học ID: ${c.course_id}`,
        scoreText: `${score}%`,
        scoreValue: score,
        maxScore: 100,
        scorePercentage: pct,
        correctCount: correct,
        totalQuestions: total,
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

  const reload = () => {
    queryClient.invalidateQueries({ queryKey: progressKeys.all })
    queryClient.invalidateQueries({ queryKey: courseKeys.all })
  }

  const isLoading =
    (coursesProgressQuery.isLoading && courseProgresses.length === 0) ||
    (allCoursesQuery.isLoading && allCourses.length === 0)

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
    reload,
  }
}
