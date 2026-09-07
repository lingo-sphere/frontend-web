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
  ExternalLink,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
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
  totalQuestions: number
  correctCount: number
  incorrectCount: number
  scoreDisplay: string
  scoreValue: number
  isPassed: boolean
  submittedAt: string
  durationSeconds?: number
}

interface AttemptResultDetail {
  attempt: {
    _id: string
    exam_title?: string
    total_scaled_score: number
    listening_scaled_score: number
    reading_scaled_score: number
    correct_questions: number
    total_questions: number
    submitted_at: string
  }
  answers?: Array<{
    question_number: number
    selected_option?: string
    correct_option: string
    is_correct: boolean
    is_skipped: boolean
    question_id?: {
      question_text_en?: string
      question_text_vi?: string
      options?: Array<{ key: string; text_en: string; text_vi?: string }>
      explanation_en?: string
      explanation_vi?: string
      correct_option: string
      image_url?: string
      audio_url?: string
    }
  }>
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

  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false)
  const [detailData, setDetailData] = useState<AttemptResultDetail | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const loadAllHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const [toeicRes, courseRes] = await Promise.allSettled([
        examService.getMyExamHistory(),
        courseService.getMyCourseTestAttempts(),
      ])

      if (toeicRes.status === 'fulfilled' && Array.isArray(toeicRes.value)) {
        setToeicAttempts(toeicRes.value as unknown as ToeicHistoryItem[])
      }

      if (courseRes.status === 'fulfilled' && Array.isArray(courseRes.value)) {
        setCourseAttempts(courseRes.value as unknown as CourseTestAttemptItem[])
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
    const userPlacementScore = Number(activeUser?.placement_test_score ?? 0)
    const userPlacementTestedAt = activeUser?.placement_tested_at
    if (!hasRecordedPlacementAttempt && (userPlacementScore > 0 || userPlacementTestedAt)) {
      const skillsType = activeUser?.placement_skills_type || '2SKILLS'
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

      list.push({
        id: c.attempt_id,
        sourceType: 'COURSE',
        testType: c.test_type,
        title,
        subtitle: `Khóa học ID: ${c.course_id}`,
        courseId: c.course_id,
        moduleId: c.module_id,
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
  }, [toeicAttempts, courseAttempts, user, mounted])

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

  const handleOpenDetail = async (attemptId: string) => {
    setSelectedAttemptId(attemptId)
    setIsLoadingDetail(true)
    setDetailData(null)

    try {
      const res = await examService.getExamAttemptResult(attemptId)
      if (res) {
        setDetailData(res as unknown as AttemptResultDetail)
      }
    } catch {
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date)
    } catch {
      return isoString
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return null
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 max-w-7xl mx-auto space-y-6">
      <SectionHeading
        eyebrow="Khảo thí & Đánh giá năng lực"
        title="Lịch sử làm bài kiểm tra"
        description="Xem lại toàn bộ bài thi đã làm, kiểm tra số câu đúng sai và theo dõi sự tiến bộ của bạn."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl border border-border bg-surface shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-text-secondary">Tổng số bài làm</span>
            <div className="p-1.5 rounded-xl bg-primary/10 text-primary">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-text-primary">{stats.total}</div>
            <p className="text-[11px] font-semibold text-text-tertiary mt-0.5">lần làm bài thi</p>
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
                className="dashboard-card hover:border-primary/40 transition-all overflow-hidden"
              >
                <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`${badgeClass} text-[10.5px] font-bold px-2 py-0.5 rounded-lg`}>
                        {badgeText}
                      </Badge>
                      <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{formatDate(item.submittedAt)}</span>
                      </span>
                      {item.durationSeconds && (
                        <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                          <Clock size={12} />
                          <span>{formatDuration(item.durationSeconds)}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-text-primary truncate">
                      {item.title}
                    </h3>

                    {item.subtitle && (
                      <p className="text-xs text-text-secondary truncate">{item.subtitle}</p>
                    )}

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={12} /> {item.correctCount} đúng
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                        <XCircle size={12} /> {item.incorrectCount} sai
                      </span>
                      <span className="text-[11px] text-text-tertiary">
                        Tổng {item.totalQuestions} câu hỏi
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-border">
                    <div className="text-left md:text-right">
                      <div className="text-lg sm:text-xl font-black text-text-primary">
                        {item.scoreDisplay}
                      </div>
                      <div className="mt-0.5">
                        {item.isPassed ? (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle size={12} /> Đạt chuẩn
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-600 dark:text-amber-400">
                            <AlertCircle size={12} /> Chưa đạt
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isToeic && item.id !== 'profile-placement-baseline' && (
                        <Button
                          onClick={() => handleOpenDetail(item.id)}
                          variant="outline"
                          size="sm"
                          className="rounded-xl gap-1.5 text-xs font-semibold cursor-pointer"
                        >
                          <Eye size={14} />
                          <span>Chi tiết đáp án</span>
                        </Button>
                      )}

                      {isToeic ? (
                        <Button
                          onClick={() => navigate(item.examId ? `/toeic/exam/${item.examId}` : '/toeic/exam/placement_2skills')}
                          size="sm"
                          className="rounded-xl bg-primary text-white hover:bg-primary-hover gap-1.5 text-xs font-semibold cursor-pointer"
                        >
                          <RotateCcw size={14} />
                          <span>Làm lại bài</span>
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            if (item.courseId) {
                              navigate(
                                `/course/${item.courseId}/exam?type=${item.testType}${
                                  item.moduleId ? `&chapterId=${item.moduleId}` : ''
                                }`
                              )
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="rounded-xl gap-1.5 text-xs font-semibold cursor-pointer"
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

      {selectedAttemptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl border border-border bg-surface shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border flex items-center justify-between shrink-0 bg-surface-subtle/50">
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  {detailData?.attempt?.exam_title ?? 'Chi Tiết Kết Quả Bài Thi'}
                </h3>
                {detailData?.attempt && (
                  <p className="text-xs text-text-secondary mt-0.5">
                    Điểm số: <strong className="text-primary">{detailData.attempt.total_scaled_score} điểm</strong> • Đúng {detailData.attempt.correct_questions}/{detailData.attempt.total_questions} câu
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedAttemptId(null)
                  setDetailData(null)
                }}
                className="rounded-xl cursor-pointer"
              >
                <X size={18} />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {isLoadingDetail ? (
                <div className="py-16 flex flex-col items-center justify-center gap-2.5 text-text-secondary">
                  <Loader2 size={28} className="animate-spin text-primary" />
                  <p className="text-xs font-semibold">Đang tải đáp án chi tiết...</p>
                </div>
              ) : !detailData || !detailData.answers || detailData.answers.length === 0 ? (
                <div className="py-12 text-center text-xs text-text-secondary space-y-2">
                  <AlertCircle size={24} className="mx-auto text-amber-500" />
                  <p>Lần thi này chưa được lưu lại danh sách câu hỏi chi tiết.</p>
                </div>
              ) : (
                detailData.answers.map((ans, idx) => {
                  const q = ans.question_id
                  const isCorrect = ans.is_correct
                  const isSkipped = ans.is_skipped || !ans.selected_option
                  const correctKey = ans.correct_option

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border text-xs space-y-2.5 transition-all ${
                        isCorrect
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : isSkipped
                          ? 'border-amber-500/30 bg-amber-500/5'
                          : 'border-rose-500/30 bg-rose-500/5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-text-primary text-sm">
                          Câu {ans.question_number}:
                        </span>
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                            <CheckCircle size={12} /> Làm đúng
                          </span>
                        ) : isSkipped ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full">
                            <AlertCircle size={12} /> Chưa làm
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-700 dark:text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded-full">
                            <XCircle size={12} /> Chưa chính xác
                          </span>
                        )}
                      </div>

                      {q?.question_text_en && (
                        <p className="text-text-primary leading-relaxed">{q.question_text_en}</p>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 rounded-xl bg-surface border border-border">
                          <span className="font-semibold text-text-secondary block">
                            Lựa chọn của bạn:
                          </span>
                          <span
                            className={`font-bold ${
                              isCorrect
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {ans.selected_option ?? 'Chưa chọn'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface border border-border">
                          <span className="font-semibold text-text-secondary block">
                            Đáp án chuẩn xác:
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {correctKey}
                          </span>
                        </div>
                      </div>

                      {q?.explanation_en && (
                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200">
                          <span className="font-bold text-blue-700 dark:text-blue-300 block mb-0.5">
                            💡 Giải thích chi tiết:
                          </span>
                          <p className="leading-relaxed">{q.explanation_en}</p>
                        </div>
                      )}
                      {q?.explanation_vi && (
                        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-900 dark:text-blue-200">
                          <span className="font-bold text-blue-700 dark:text-blue-300 block mb-0.5">
                            💡 Giải thích (Tiếng Việt):
                          </span>
                          <p className="leading-relaxed italic">{q.explanation_vi}</p>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            <div className="p-4 border-t border-border bg-surface-subtle/50 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAttemptId(null)
                  setDetailData(null)
                }}
                className="rounded-xl text-xs font-semibold cursor-pointer"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
