// Hook quản lý dữ liệu lịch sử thi và bài kiểm tra của học viên bằng TanStack Query.
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useToeicHistoryQuery, useCourseTestAttemptsQuery } from '@/features/toeic/hooks/use.toeic.query'
import { useAllCoursesQuery } from '@/features/courses/hooks/use.courses.query'
import { toeicKeys } from '@/features/toeic/keys/toeic.keys'
import { authService } from '@/features/auth/services/auth.service'

export interface ToeicHistoryItem {
  _id: string
  user_id?: string
  exam_id: string
  exam_title: string
  exam_code?: string
  exam_type: string
  attempt_type?: string
  is_system_placement?: boolean
  total_questions: number
  correct_questions: number
  incorrect_questions?: number
  total_scaled_score: number
  listening_score?: number
  reading_score?: number
  total_time_seconds?: number
  is_best_attempt?: boolean
  status?: string
  submitted_at: string
}

export interface CourseTestAttemptItem {
  attempt_id: string
  test_type: string
  course_id: string
  module_id?: string
  order_index?: number
  score: number
  correct_count?: number
  total_questions?: number
  is_passed: boolean
  submitted_at: string
}

export interface UnifiedTestAttempt {
  id: string
  sourceType: 'TOEIC' | 'COURSE'
  testType: string
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
  const queryClient = useQueryClient()
  const [mounted, setMounted] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<ExamHistoryTab>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')

  useEffect(() => {
    setMounted(true)
  }, [])

  const isEnabled = mounted && authService.isAuthenticated()

  const toeicHistoryQuery = useToeicHistoryQuery(isEnabled)
  const courseAttemptsQuery = useCourseTestAttemptsQuery(isEnabled)
  const allCoursesQuery = useAllCoursesQuery(undefined, isEnabled)

  const toeicAttempts = toeicHistoryQuery.data || []
  const courseAttempts = courseAttemptsQuery.data || []
  const allCourses = allCoursesQuery.data || []

  const courseTitleMap = useMemo(() => {
    const titleMap: Record<string, string> = {}
    allCourses.forEach((c) => {
      const cid = c.id || c._id
      if (cid && c.title) {
        titleMap[cid] = c.title
      }
    })
    return titleMap
  }, [allCourses])

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
        totalQuestions: t.total_questions || 200,
        correctCount: t.correct_questions || 0,
        incorrectCount: (t.total_questions || 200) - (t.correct_questions || 0),
        scoreDisplay: `${t.total_scaled_score || 0}/990`,
        scoreValue: t.total_scaled_score || 0,
        isPassed: (t.total_scaled_score || 0) >= 450,
        submittedAt: t.submitted_at || new Date().toISOString(),
        durationSeconds: t.total_time_seconds || 0,
      })
    })

    courseAttempts.forEach((c) => {
      let testType = c.test_type
      let testName = 'Kiểm tra'

      if (c.test_type === 'final-test') {
        testName = 'Bài thi tốt nghiệp Exit Test'
      } else if (c.test_type === 'challenge') {
        testName = `Thử thách chương ${c.order_index ?? ''}`
      } else if (c.test_type === 'post-mini') {
        testName = `Kiểm tra cuối chương ${c.order_index ?? ''}`
      }

      const courseTitle = courseTitleMap[c.course_id] || `Khóa học ID: ${c.course_id}`

      list.push({
        id: c.attempt_id,
        sourceType: 'COURSE',
        testType,
        title: testName,
        subtitle: courseTitle,
        courseId: c.course_id,
        orderIndex: c.order_index,
        totalQuestions: c.total_questions || 10,
        correctCount: c.correct_count ?? Math.round(((c.score || 0) / 100) * (c.total_questions || 10)),
        incorrectCount: (c.total_questions || 10) - (c.correct_count ?? Math.round(((c.score || 0) / 100) * (c.total_questions || 10))),
        scoreDisplay: `${c.score}%`,
        scoreValue: c.score,
        isPassed: c.is_passed,
        submittedAt: c.submitted_at,
        durationSeconds: 0,
      })
    })

    list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    return list
  }, [toeicAttempts, courseAttempts, courseTitleMap])

  const filteredList = useMemo(() => {
    let result = [...unifiedList]

    if (activeTab === 'PLACEMENT') {
      result = result.filter((i) => i.testType === 'PLACEMENT')
    } else if (activeTab === 'TOEIC') {
      result = result.filter((i) => i.sourceType === 'TOEIC' && i.testType !== 'PLACEMENT')
    } else if (activeTab === 'CHALLENGE') {
      result = result.filter((i) => i.sourceType === 'COURSE' && i.testType === 'challenge')
    } else if (activeTab === 'POST_MINI') {
      result = result.filter((i) => i.sourceType === 'COURSE' && i.testType === 'post-mini')
    } else if (activeTab === 'FINAL_TEST') {
      result = result.filter((i) => i.sourceType === 'COURSE' && i.testType === 'final-test')
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.subtitle && i.subtitle.toLowerCase().includes(q))
      )
    }

    return result
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

  const loadAllHistory = useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: toeicKeys.all })
  }, [queryClient])

  const isLoading =
    (toeicHistoryQuery.isLoading && toeicAttempts.length === 0) ||
    (courseAttemptsQuery.isLoading && courseAttempts.length === 0)

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
