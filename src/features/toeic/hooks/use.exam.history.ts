// Hook quản lý dữ liệu lịch sử thi và bài kiểm tra của học viên.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { examService } from '@/features/toeic/services/exam.service'
import { courseService } from '@/features/courses/services/course.service'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { storage, STORAGE_KEYS } from '@/lib/storage'

export interface ToeicHistoryItem {
  _id: string
  user_id: string
  exam_id: string
  exam_title: string
  exam_code: string
  exam_type: 'FULL_TEST' | 'PART_PRACTICE' | 'PLACEMENT' | 'DIAGNOSTIC_TEST'
  attempt_type: string
  is_system_placement?: boolean
  total_questions: number
  correct_questions: number
  incorrect_questions: number
  total_scaled_score: number
  listening_scaled_score: number
  reading_scaled_score: number
  total_time_seconds: number
  is_best_attempt: boolean
  status: string
  submitted_at: string
}

export interface CourseTestAttemptItem {
  attempt_id: string
  test_type: 'challenge' | 'post-mini' | 'final-test'
  course_id: string
  module_id?: string
  order_index?: number
  score: number
  correct_count: number
  total_questions: number
  is_passed: boolean
  submitted_at: string
}

export interface UnifiedTestAttempt {
  id: string
  sourceType: 'TOEIC' | 'COURSE'
  testType: 'FULL_TEST' | 'PART_PRACTICE' | 'PLACEMENT' | 'DIAGNOSTIC_TEST' | 'challenge' | 'post-mini' | 'final-test'
  title: string
  subtitle?: string
  examId?: string
  courseId?: string
  moduleId?: string
  orderIndex?: number
  totalQuestions: number
  correctCount: number
  incorrectCount: number
  scoreDisplay: string
  scoreValue: number
  isPassed: boolean
  submittedAt: string
  durationSeconds?: number
}

export type ExamHistoryTab = 'ALL' | 'PLACEMENT' | 'TOEIC' | 'CHALLENGE' | 'POST_MINI' | 'FINAL_TEST'

export function useExamHistory() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [toeicAttempts, setToeicAttempts] = useState<ToeicHistoryItem[]>([])
  const [courseAttempts, setCourseAttempts] = useState<CourseTestAttemptItem[]>([])
  const [activeTab, setActiveTab] = useState<ExamHistoryTab>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [courseTitleMap, setCourseTitleMap] = useState<Record<string, string>>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  const loadAllHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const [toeicRes, courseRes, allCoursesRes] = await Promise.allSettled([
        examService.getMyExamHistory(),
        courseService.getMyCourseTestAttempts(),
        courseService.getAllCourses(),
      ])

      if (toeicRes.status === 'fulfilled' && Array.isArray(toeicRes.value)) {
        setToeicAttempts(toeicRes.value as unknown as ToeicHistoryItem[])
      }

      if (courseRes.status === 'fulfilled' && Array.isArray(courseRes.value)) {
        setCourseAttempts(courseRes.value as unknown as CourseTestAttemptItem[])
      }

      if (allCoursesRes.status === 'fulfilled' && Array.isArray(allCoursesRes.value)) {
        const titleMap: Record<string, string> = {}
        allCoursesRes.value.forEach((c) => {
          if (c.id && c.title) {
            titleMap[c.id] = c.title
          }
        })
        setCourseTitleMap(titleMap)
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAllHistory()
  }, [loadAllHistory])

  const unifiedList: UnifiedTestAttempt[] = useMemo(() => {
    const list: UnifiedTestAttempt[] = []

    toeicAttempts.forEach((t) => {
      const isPlacement = Boolean(
        t.is_system_placement ||
        t.attempt_type === 'PLACEMENT' ||
        t.exam_type === 'PLACEMENT' ||
        t.exam_type === 'DIAGNOSTIC_TEST' ||
        (t.exam_code && t.exam_code.includes('placement')) ||
        (t.exam_title && t.exam_title.toLowerCase().includes('đầu vào')) ||
        (t.exam_title && t.exam_title.toLowerCase().includes('placement'))
      )

      list.push({
        id: t._id,
        sourceType: 'TOEIC',
        testType: isPlacement ? 'PLACEMENT' : t.exam_type,
        title: isPlacement
          ? (t.exam_title || 'Bài thi đánh giá năng lực đầu vào (Placement Test)')
          : t.exam_title,
        subtitle: isPlacement
          ? (t.exam_code ? `Mã bài test: ${t.exam_code}` : 'Đánh giá năng lực TOEIC')
          : (t.exam_code ? `Mã đề: ${t.exam_code}` : undefined),
        examId: t.exam_id,
        totalQuestions: t.total_questions,
        correctCount: t.correct_questions,
        incorrectCount: t.incorrect_questions,
        scoreDisplay: `${t.total_scaled_score} / 990 điểm`,
        scoreValue: t.total_scaled_score,
        isPassed: t.total_scaled_score >= 450,
        submittedAt: t.submitted_at,
        durationSeconds: t.total_time_seconds,
      })
    })

    const hasRecordedPlacementAttempt = list.some((i) => i.testType === 'PLACEMENT')
    const activeUser = mounted ? user : null
    let userPlacementScore = Number(activeUser?.placement_test_score ?? 0)
    let userPlacementTestedAt = activeUser?.placement_tested_at
    let skillsType = activeUser?.placement_skills_type || '2SKILLS'

    if (!userPlacementScore) {
      const cached = storage.get<{ placement_test_score?: number; placement_tested_at?: string; placement_skills_type?: string }>(STORAGE_KEYS.PLACEMENT_SCORE)
      if (cached?.placement_test_score) {
        userPlacementScore = Number(cached.placement_test_score)
        userPlacementTestedAt = cached.placement_tested_at || userPlacementTestedAt
        skillsType = cached.placement_skills_type || skillsType
      }
    }

    if (!hasRecordedPlacementAttempt && (userPlacementScore > 0 || userPlacementTestedAt)) {
      const totalQ = skillsType === '4SKILLS' ? 8 : 4
      const estCorrect = Math.max(1, Math.round((userPlacementScore / 990) * totalQ))
      list.push({
        id: 'profile-placement-baseline',
        sourceType: 'TOEIC',
        testType: 'PLACEMENT',
        title: `Bài thi đánh giá năng lực đầu vào (TOEIC ${skillsType === '4SKILLS' ? '4 Kỹ Năng' : '2 Kỹ Năng LR'})`,
        subtitle: 'Kết quả đánh giá năng lực hệ thống đã ghi nhận',
        examId: skillsType === '4SKILLS' ? 'placement_4skills' : 'placement_2skills',
        totalQuestions: totalQ,
        correctCount: estCorrect,
        incorrectCount: Math.max(0, totalQ - estCorrect),
        scoreDisplay: `${userPlacementScore} / 990 điểm`,
        scoreValue: userPlacementScore,
        isPassed: userPlacementScore >= 450,
        submittedAt: userPlacementTestedAt || new Date(0).toISOString(),
      })
    }

    courseAttempts.forEach((c) => {
      const isFinal = c.test_type === 'final-test'
      const isChallenge = c.test_type === 'challenge'
      const title = isFinal
        ? 'Bài thi tốt nghiệp (Exit Test)'
        : isChallenge
        ? `Thử thách chương ${c.order_index ?? ''}`
        : `Kiểm tra cuối chương ${c.order_index ?? ''}`

      const courseTitle = courseTitleMap[c.course_id]
      const subtitle = courseTitle ? `Khóa học: ${courseTitle}` : `Khóa học ID: ${c.course_id}`

      list.push({
        id: c.attempt_id,
        sourceType: 'COURSE',
        testType: c.test_type,
        title,
        subtitle,
        courseId: c.course_id,
        moduleId: c.module_id,
        orderIndex: c.order_index,
        totalQuestions: c.total_questions,
        correctCount: c.correct_count,
        incorrectCount: Math.max(0, c.total_questions - c.correct_count),
        scoreDisplay: `${c.score}%`,
        scoreValue: c.score,
        isPassed: c.is_passed,
        submittedAt: c.submitted_at,
      })
    })

    list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    return list
  }, [toeicAttempts, courseAttempts, user, mounted, courseTitleMap])

  const filteredList = useMemo(() => {
    return unifiedList.filter((item) => {
      if (activeTab === 'PLACEMENT' && item.testType !== 'PLACEMENT') return false
      if (activeTab === 'TOEIC' && (item.sourceType !== 'TOEIC' || item.testType === 'PLACEMENT')) return false
      if (activeTab === 'CHALLENGE' && item.testType !== 'challenge') return false
      if (activeTab === 'POST_MINI' && item.testType !== 'post-mini') return false
      if (activeTab === 'FINAL_TEST' && item.testType !== 'final-test') return false

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const titleMatch = item.title.toLowerCase().includes(query)
        const subMatch = item.subtitle?.toLowerCase().includes(query)
        if (!titleMatch && !subMatch) return false
      }

      return true
    })
  }, [unifiedList, activeTab, searchQuery])

  const stats = useMemo(() => {
    const total = unifiedList.length
    if (total === 0) {
      return { total: 0, passed: 0, passRate: 0, avgScore: 0, totalCorrect: 0 }
    }
    const passed = unifiedList.filter((i) => i.isPassed).length
    const passRate = Math.round((passed / total) * 100)
    const totalCorrect = unifiedList.reduce((acc, curr) => acc + curr.correctCount, 0)
    const avgScore = Math.round(
      unifiedList.reduce((acc, curr) => acc + curr.scoreValue, 0) / total
    )

    return { total, passed, passRate, avgScore, totalCorrect }
  }, [unifiedList])

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '30 phút'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}p ${secs > 0 ? `${secs}s` : ''}`
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Vừa xong'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return {
    isLoading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    stats,
    filteredList,
    unifiedList,
    courseAttempts,
    loadAllHistory,
    formatDuration,
    formatDate,
  }
}
