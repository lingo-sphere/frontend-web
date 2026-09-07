// Trang hiển thị lịch sử làm bài kiểm tra và thi thử của học viên (Exam History Page)

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  RotateCcw,
  Search,
  BookOpen,
  Eye,
  CheckCircle,
  HelpCircle,
  FileQuestion,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SectionHeading } from '@/components/dashboard/section.heading'
import { examService } from '@/services/exam.service'
import { courseService } from '@/services/course.service'
import { useNavigate } from '@/lib/navigation'
import { useAuthStore } from '@/store/auth.store'

interface ToeicHistoryItem {
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

interface CourseTestAttemptItem {
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

interface UnifiedTestAttempt {
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

export default function ExamHistoryPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState<boolean>(false)

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [toeicAttempts, setToeicAttempts] = useState<ToeicHistoryItem[]>([])
  const [courseAttempts, setCourseAttempts] = useState<CourseTestAttemptItem[]>([])
  const [activeTab, setActiveTab] = useState<'ALL' | 'PLACEMENT' | 'TOEIC' | 'CHALLENGE' | 'POST_MINI' | 'FINAL_TEST'>('ALL')
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

    if (!userPlacementScore && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('lingo_user_placement_score')
        if (cached) {
          const parsed = JSON.parse(cached)
          if (parsed.placement_test_score) {
            userPlacementScore = Number(parsed.placement_test_score)
            userPlacementTestedAt = parsed.placement_tested_at || userPlacementTestedAt
            skillsType = parsed.placement_skills_type || skillsType
          }
        }
      } catch {}
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

  const handleNavigateDetail = (item: UnifiedTestAttempt) => {
    const query = new URLSearchParams()
    if (item.sourceType) query.set('sourceType', item.sourceType)
    if (item.testType) query.set('testType', item.testType)
    if (item.courseId) query.set('courseId', item.courseId)
    if (item.moduleId) query.set('moduleId', item.moduleId)
    if (item.examId) query.set('examId', item.examId)
    if (item.title) query.set('title', item.title)
    if (item.scoreDisplay) query.set('score', item.scoreDisplay)
    if (item.scoreValue !== undefined) query.set('scoreVal', String(item.scoreValue))
    if (item.correctCount !== undefined) query.set('correct', String(item.correctCount))
    if (item.totalQuestions !== undefined) query.set('total', String(item.totalQuestions))
    if (item.isPassed !== undefined) query.set('isPassed', String(item.isPassed))
    if (item.submittedAt) query.set('submittedAt', item.submittedAt)
    if (item.durationSeconds !== undefined) query.set('duration', String(item.durationSeconds))

    navigate(`/exam-history/${item.id}?${query.toString()}`)
  }

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

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <SectionHeading
            eyebrow="Đánh Giá Năng Lực"
            title="Lịch Sử Bài Kiểm Tra & Thi Thử"
            description="Tổng hợp toàn diện kết quả các bài test đầu vào, bài thi thử TOEIC và bài kiểm tra tiến độ trong khóa học."
          />
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={() => navigate('/toeic')}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl gap-1.5 shadow-xs cursor-pointer"
          >
            <BookOpen size={14} />
            <span>Luyện đề TOEIC mới</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => loadAllHistory()}
            className="text-xs font-semibold rounded-xl cursor-pointer"
            title="Tải lại dữ liệu"
          >
            Làm mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl border border-border bg-surface shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-text-secondary">Tổng số lượt làm bài</span>
            <div className="p-1.5 rounded-xl bg-primary/10 text-primary">
              <Trophy size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-text-primary">
              {stats.total}
            </div>
            <p className="text-[11px] font-semibold text-text-tertiary mt-0.5">lần hoàn thành bài test</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Tỷ lệ đạt chuẩn</span>
            <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
              {stats.passRate}%
            </div>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {stats.passed} / {stats.total} bài đạt
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-surface shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-text-secondary">Tổng câu đúng</span>
            <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-600">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {stats.totalCorrect}
            </div>
            <p className="text-[11px] font-semibold text-text-tertiary mt-0.5">câu trả lời chuẩn xác</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Mức điểm trung bình</span>
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Trophy size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-700 dark:text-amber-300">
              {stats.avgScore}
            </div>
            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mt-0.5">điểm trung bình</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
            }`}
          >
            Tất cả ({unifiedList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PLACEMENT')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'PLACEMENT'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20'
            }`}
          >
            Test đầu vào ({unifiedList.filter((i) => i.testType === 'PLACEMENT').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TOEIC')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'TOEIC'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
            }`}
          >
            Đề thi TOEIC ({unifiedList.filter((i) => i.sourceType === 'TOEIC' && i.testType !== 'PLACEMENT').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CHALLENGE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'CHALLENGE'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
            }`}
          >
            Thử thách chương ({courseAttempts.filter((c) => c.test_type === 'challenge').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('POST_MINI')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'POST_MINI'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
            }`}
          >
            Kiểm tra chương ({courseAttempts.filter((c) => c.test_type === 'post-mini').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('FINAL_TEST')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'FINAL_TEST'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-500/10 text-purple-700 dark:text-purple-400'
            }`}
          >
            Tốt nghiệp ({courseAttempts.filter((c) => c.test_type === 'final-test').length})
          </button>
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài thi..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-border bg-surface text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-text-secondary">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm font-semibold">Đang tổng hợp lịch sử làm bài...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-border bg-surface-subtle/50 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <FileQuestion size={24} />
          </div>
          <h3 className="text-base font-bold text-text-primary">
            {activeTab === 'PLACEMENT' ? 'Chưa có bài test đầu vào nào' : 'Chưa có bài kiểm tra nào'}
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            {activeTab === 'PLACEMENT'
              ? 'Bạn chưa hoàn thành bài test đánh giá năng lực đầu vào. Hãy làm bài test nhanh để hệ thống gợi ý lộ trình phù hợp nhất nhé!'
              : 'Bạn chưa hoàn thành bài thi nào trong mục này. Hãy thử sức với các đề thi TOEIC hoặc bài tập khóa học để ghi nhận kết quả nhé!'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            {activeTab === 'PLACEMENT' ? (
              <Button
                onClick={() => navigate('/toeic/exam/placement_2skills')}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl"
              >
                Làm bài Test đầu vào ngay
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/toeic')}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl"
                >
                  Làm đề thi TOEIC
                </Button>
                <Button
                  onClick={() => navigate('/toeic/exam/placement_2skills')}
                  variant="outline"
                  className="text-xs font-semibold rounded-xl"
                >
                  Test đầu vào
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((item) => {
            const isToeic = item.sourceType === 'TOEIC'
            const isPlacement = item.testType === 'PLACEMENT'
            const isChallenge = item.testType === 'challenge'
            const isFinal = item.testType === 'final-test'

            let badgeClass = 'bg-indigo-600 text-white'
            let badgeText = 'Đề thi TOEIC'

            if (isPlacement) {
              badgeClass = 'bg-sky-600 text-white'
              badgeText = 'Test đầu vào'
            } else if (!isToeic) {
              if (isChallenge) {
                badgeClass = 'bg-amber-600 text-white'
                badgeText = 'Thử thách chương'
              } else if (isFinal) {
                badgeClass = 'bg-purple-600 text-white'
                badgeText = 'Tốt nghiệp Exit Test'
              } else {
                badgeClass = 'bg-emerald-600 text-white'
                badgeText = 'Kiểm tra chương'
              }
            }

            return (
              <Card
                key={item.id}
                onClick={() => handleNavigateDetail(item)}
                className="dashboard-card group p-5 border-border hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
              >
                <CardContent className="p-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-2xl bg-surface-subtle border border-border/80 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-primary/30 transition-colors">
                      {isToeic ? (
                        <Trophy size={20} className={isPlacement ? 'text-sky-600' : 'text-primary'} />
                      ) : (
                        <BookOpen size={20} className="text-emerald-600" />
                      )}
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${badgeClass} text-[10px] font-bold px-2 py-0.5 rounded-md`}>
                          {badgeText}
                        </Badge>
                        <h3 className="text-sm sm:text-base font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                          {item.title}
                        </h3>
                      </div>

                      {item.subtitle && (
                        <p className="text-xs text-text-secondary font-medium truncate">
                          {item.subtitle}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-text-tertiary flex-wrap pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          <span>{formatDate(item.submittedAt)}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} />
                          <span>{formatDuration(item.durationSeconds)}</span>
                        </span>
                        <span>•</span>
                        <span>
                          Tổng số câu: <strong>{item.totalQuestions}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-5 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-border/60">
                    <div className="flex items-center gap-4 text-left">
                      <div>
                        <span className="text-[11px] font-semibold text-text-tertiary block">
                          Điểm số
                        </span>
                        <div className="text-base sm:text-lg font-black text-primary">
                          {item.scoreDisplay}
                        </div>
                      </div>

                      <div className="h-8 w-px bg-border/80" />

                      <div>
                        <span className="text-[11px] font-semibold text-text-tertiary block">
                          Kết quả
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold">
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 size={13} />
                            {item.correctCount}
                          </span>
                          <span className="text-text-tertiary">/</span>
                          <span className="text-rose-500 flex items-center gap-0.5">
                            <XCircle size={13} />
                            {item.incorrectCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNavigateDetail(item)
                        }}
                        className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Eye size={14} />
                        <span>Xem chi tiết</span>
                      </Button>

                      {isToeic ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(item.examId ? `/toeic/exam/${item.examId}` : '/toeic/exam/placement_2skills')
                          }}
                          className="rounded-xl gap-1.5 text-xs font-semibold cursor-pointer hover:border-primary/40"
                        >
                          <RotateCcw size={14} />
                          <span>Làm lại</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(
                              `/course/${item.courseId}/exam?type=${item.testType}${
                                item.moduleId ? `&chapterId=${item.moduleId}` : ''
                              }`
                            )
                          }}
                          className="rounded-xl gap-1.5 text-xs font-semibold cursor-pointer hover:border-primary/40"
                        >
                          <RotateCcw size={14} />
                          <span>Làm lại bài</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </main>
  )
}
