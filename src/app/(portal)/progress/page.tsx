// Trang tổng quan tiến độ học tập, lộ trình và phân tích năng lực học viên (Progress & Analytics Page)

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Trophy,
  Target,
  Flame,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Award,
  Layers,
  Loader2,
  Calendar,
  Compass,
  Zap,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SectionHeading } from '@/components/dashboard/section.heading'
import { useNavigate } from '@/lib/navigation'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import { userService, type GamificationProfile } from '@/services/user.service'
import { progressService, type UserCourseProgressItem, type UserRoadmapProgress } from '@/services/progress.service'
import { courseService } from '@/services/course.service'
import { examService, type ToeicLearningProfile } from '@/services/exam.service'
import { vocabularyService } from '@/services/vocabulary.service'
import type { Course, CourseEnrollment } from '@/types/api.types'

interface VocabStatsSummary {
  learned_words: number
  review_due: number
  total_cards: number
}

export default function ProgressAppPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState<boolean>(false)

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ROADMAP' | 'SKILLS' | 'RECENT_TESTS'>('OVERVIEW')

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

  const enrolledCourseCards = useMemo(() => {
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

  const metrics = useMemo(() => {
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

  const recentActivities = useMemo(() => {
    const list: Array<{
      id: string
      courseId?: string
      type: 'TOEIC' | 'COURSE'
      title: string
      subtitle: string
      scoreText: string
      isPassed: boolean
      submittedAt: string
    }> = []

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

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Chưa có'
    try {
      const d = new Date(isoString)
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(d)
    } catch {
      return isoString
    }
  }

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

  return (
    <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 space-y-6">
      <SectionHeading
        eyebrow="Phân tích & Tiến độ học tập"
        title="Bảng tiến độ & Năng lực học tập"
        description="Theo dõi toàn diện sự tiến bộ qua từng khóa học, đề thi TOEIC, lộ trình cá nhân hóa và năng lực đa kỹ năng."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Điểm số mục tiêu</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Trophy size={18} />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-700 dark:text-amber-300">
                {metrics.currentScore > 0 ? metrics.currentScore : '--'}
              </span>
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-400">
                Mục tiêu: {metrics.targetScore}
              </span>
            </div>
            <Progress value={metrics.scoreProgressPercent} className="h-2 bg-amber-500/20" />
            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              Đạt {metrics.scoreProgressPercent}% chặng đường TOEIC
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-primary/30 bg-primary/10 dark:bg-primary/5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-primary">Tiến độ khóa học</span>
            <div className="p-2 rounded-xl bg-primary/20 text-primary">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-text-primary">
                {metrics.avgProgress}%
              </span>
              <span className="text-xs font-semibold text-text-secondary">
                {metrics.completedCourses}/{metrics.totalCourses} khóa hoàn thành
              </span>
            </div>
            <Progress value={metrics.avgProgress} className="h-2 bg-primary/20" />
            <p className="text-[11px] font-semibold text-text-tertiary">
              Đã hoàn thành {metrics.totalLessons} bài học
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-orange-500/30 bg-orange-500/10 dark:bg-orange-950/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-orange-800 dark:text-orange-300">Chuyên cần & Streak</span>
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400">
              <Flame size={18} />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-orange-600 dark:text-orange-400">
                {metrics.streak}
              </span>
              <span className="text-xs font-bold text-text-secondary">ngày liên tiếp</span>
            </div>
            <p className="text-[11px] font-semibold text-text-tertiary">
              Tích lũy: <strong className="text-orange-600">{metrics.xp} XP</strong> • Cấp độ {metrics.level}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 dark:bg-indigo-950/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300">Khảo thí & Đánh giá</span>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Target size={18} />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {metrics.totalAttemptsCount}
              </span>
              <span className="text-xs font-bold text-text-secondary">lần làm bài kiểm tra</span>
            </div>
            <p className="text-[11px] font-semibold text-text-tertiary">
              Tỷ lệ đạt chuẩn: <strong className="text-indigo-600">{metrics.passRate}%</strong> bài thi
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'OVERVIEW'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
          }`}
        >
          Khóa học ({enrolledCourseCards.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ROADMAP')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ROADMAP'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
          }`}
        >
          Lộ trình mục tiêu
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('SKILLS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'SKILLS'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
          }`}
        >
          Kỹ năng & Từ vựng
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('RECENT_TESTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'RECENT_TESTS'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
          }`}
        >
          Bài kiểm tra gần đây
        </button>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-text-secondary">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm font-semibold">Đang tổng hợp dữ liệu tiến độ học tập...</p>
        </div>
      ) : activeTab === 'OVERVIEW' ? (
        enrolledCourseCards.length === 0 ? (
          <Card className="border-dashed p-8 sm:p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
              <BookOpen size={28} />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-text-primary">Chưa có khóa học nào được ghi nhận</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Bạn chưa tham gia khóa học nào. Hãy đăng ký ngay các khóa học luyện thi TOEIC chuẩn đầu ra để bắt đầu học tập và theo dõi tiến trình nhé!
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Button
                onClick={() => navigate('/courses')}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl"
              >
                Khám phá khóa học
              </Button>
              <Button
                onClick={() => navigate('/toeic/exam/placement_2skills')}
                variant="outline"
                className="text-xs font-semibold rounded-xl"
              >
                Làm Test đầu vào
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {enrolledCourseCards.map((c) => {
              const isCompleted = c.status === 'COMPLETED' || c.progress_percentage >= 100
              return (
                <Card
                  key={c.course_id}
                  className="dashboard-card hover:border-primary/50 transition-all flex flex-col justify-between overflow-hidden"
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {c.category}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5 rounded-md">
                            {c.level}
                          </Badge>
                          {isCompleted && (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              <CheckCircle2 size={11} className="mr-1" /> Đã hoàn thành
                            </Badge>
                          )}
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-text-primary line-clamp-2 pt-1">
                          {c.title}
                        </h4>
                      </div>
                      {c.thumbnail_url && (
                        <img
                          src={c.thumbnail_url}
                          alt={c.title}
                          className="w-14 h-14 rounded-xl object-cover border border-border shrink-0"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-text-secondary">Tiến độ bài học:</span>
                        <span className="font-bold text-primary">{c.progress_percentage}%</span>
                      </div>
                      <Progress value={c.progress_percentage} className="h-2 bg-surface-subtle" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-text-secondary">
                      <div className="p-2.5 rounded-xl bg-surface-subtle/60 border border-border/50">
                        <span className="block text-[10px] text-text-tertiary">Bài học:</span>
                        <span className="font-bold text-text-primary">
                          {c.completed_lessons_count}/{c.total_lessons_count || 1} bài
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface-subtle/60 border border-border/50">
                        <span className="block text-[10px] text-text-tertiary">Chương học:</span>
                        <span className="font-bold text-text-primary">
                          {c.completed_modules_count}/{c.total_modules_count || 1} chương
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <div className="p-4 border-t border-border bg-surface-subtle/30 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                      <Calendar size={12} />
                      <span>Tham gia: {formatDate(c.enrolled_at)}</span>
                    </span>
                    <Button
                      onClick={() => navigate(`/course/${c.course_id}`)}
                      size="sm"
                      className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl gap-1.5 cursor-pointer"
                    >
                      <span>{isCompleted ? 'Xem lại bài học' : 'Tiếp tục học'}</span>
                      <ArrowRight size={13} />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )
      ) : activeTab === 'ROADMAP' ? (
        roadmapProgress ? (
          <div className="space-y-6">
            <Card className="dashboard-card p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-md">
                      Lộ trình TOEIC Cá Nhân Hóa
                    </Badge>
                    <span className="text-xs text-text-secondary font-medium">
                      Chặng hiện tại: <strong>Stage {roadmapProgress.current_stage_order || 1}</strong>
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-text-primary">
                    {roadmapProgress.roadmap_title || roadmapProgress.roadmap?.title || 'Lộ trình luyện thi TOEIC chuẩn đầu ra'}
                  </h3>
                </div>
                <Button
                  onClick={() => navigate('/roadmap')}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Compass size={14} />
                  <span>Vào giao diện Lộ Trình</span>
                </Button>
              </div>

              {(() => {
                const extractScore = (score: unknown): number | null => {
                  if (typeof score === 'number') return score
                  if (score && typeof score === 'object' && 'total' in score) {
                    const totalVal = (score as { total: unknown }).total
                    if (typeof totalVal === 'number') return totalVal
                  }
                  return null
                }
                const baselineVal = extractScore(roadmapProgress.baseline_score) ?? activeUser?.placement_test_score ?? null
                const targetVal = roadmapProgress.roadmap?.target_score ?? 800

                const roadmapStages = roadmapProgress.roadmap?.stages ?? []
                const stageMilestones = roadmapProgress.stage_milestones ?? []
                const displayStages = roadmapStages.length > 0
                  ? roadmapStages.map((st, idx) => {
                      const ms = stageMilestones.find((m) => m.stage_order === st.stage_order)
                      const isDone = ms?.status === 'COMPLETED' || ms?.is_completed
                      const isCurrent = ms?.status === 'IN_PROGRESS' || (!ms && st.stage_order === (roadmapProgress.current_stage_order ?? 1))
                      return {
                        id: `stage-${st.stage_order || idx}`,
                        order: st.stage_order || idx + 1,
                        title: st.stage_title || `Chặng mục tiêu ${st.target_band || ''}`,
                        isDone,
                        isCurrent,
                        checkpointScore: ms?.checkpoint_score,
                      }
                    })
                  : stageMilestones.map((ms, idx) => ({
                      id: `milestone-${ms.stage_order || idx}`,
                      order: ms.stage_order || idx + 1,
                      title: ms.course_title || `Chặng ${ms.stage_order || idx + 1}`,
                      isDone: ms.status === 'COMPLETED' || ms.is_completed,
                      isCurrent: ms.status === 'IN_PROGRESS',
                      checkpointScore: ms.checkpoint_score,
                    }))

                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="p-3.5 rounded-xl border border-border bg-surface-subtle/50">
                        <span className="text-[11px] font-semibold text-text-tertiary block">Điểm xuất phát:</span>
                        <span className="text-lg font-black text-text-primary">
                          {baselineVal !== null ? `${baselineVal} điểm` : 'Chưa test'}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl border border-border bg-surface-subtle/50">
                        <span className="text-[11px] font-semibold text-text-tertiary block">Điểm mục tiêu:</span>
                        <span className="text-lg font-black text-primary">
                          {targetVal} điểm
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl border border-border bg-surface-subtle/50">
                        <span className="text-[11px] font-semibold text-text-tertiary block">Số chặng học:</span>
                        <span className="text-lg font-black text-indigo-600">
                          {displayStages.length} chặng
                        </span>
                      </div>
                    </div>
                  </>
                )
              })()}
            </Card>

            {(() => {
              const roadmapStages = roadmapProgress.roadmap?.stages ?? []
              const stageMilestones = roadmapProgress.stage_milestones ?? []
              const displayStages = roadmapStages.length > 0
                ? roadmapStages.map((st, idx) => {
                    const ms = stageMilestones.find((m) => m.stage_order === st.stage_order)
                    const isDone = ms?.status === 'COMPLETED' || ms?.is_completed
                    const isCurrent = ms?.status === 'IN_PROGRESS' || (!ms && st.stage_order === (roadmapProgress.current_stage_order ?? 1))
                    return {
                      id: `stage-${st.stage_order || idx}`,
                      order: st.stage_order || idx + 1,
                      title: st.stage_title || `Chặng mục tiêu ${st.target_band || ''}`,
                      isDone,
                      isCurrent,
                      checkpointScore: ms?.checkpoint_score,
                    }
                  })
                : stageMilestones.map((ms, idx) => ({
                    id: `milestone-${ms.stage_order || idx}`,
                    order: ms.stage_order || idx + 1,
                    title: ms.course_title || `Chặng ${ms.stage_order || idx + 1}`,
                    isDone: ms.status === 'COMPLETED' || ms.is_completed,
                    isCurrent: ms.status === 'IN_PROGRESS',
                    checkpointScore: ms.checkpoint_score,
                  }))

              if (displayStages.length === 0) return null

              return (
                <div className="space-y-3 pt-2">
                  <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <Layers size={16} className="text-primary" />
                    <span>Chi tiết các chặng trong lộ trình</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {displayStages.map((stage) => (
                      <Card
                        key={stage.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          stage.isDone
                            ? 'border-emerald-500/30 bg-emerald-500/5'
                            : stage.isCurrent
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-border bg-surface opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <span className="text-[10.5px] font-bold uppercase tracking-wider text-text-tertiary">
                              Chặng {stage.order}
                            </span>
                            <h5 className="text-sm font-bold text-text-primary">
                              {stage.title}
                            </h5>
                          </div>
                          {stage.isDone ? (
                            <Badge className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                              Hoàn thành
                            </Badge>
                          ) : stage.isCurrent ? (
                            <Badge className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                              Đang học
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5 rounded-md">
                              Chưa mở
                            </Badge>
                          )}
                        </div>

                        {typeof stage.checkpointScore === 'number' && (
                          <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                            <span className="text-text-secondary">Điểm bài kiểm tra chặng:</span>
                            <strong className="text-primary">{stage.checkpointScore} điểm</strong>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        ) : (
          <Card className="border-dashed p-8 sm:p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 mx-auto flex items-center justify-center">
              <Compass size={28} />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-text-primary">
                {metrics.currentScore > 0
                  ? `Đã ghi nhận điểm đầu vào TOEIC: ${metrics.currentScore} điểm`
                  : 'Chưa kích hoạt lộ trình cá nhân'}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {metrics.currentScore > 0
                  ? `Bạn đã hoàn thành bài thi test đầu vào và đạt ${metrics.currentScore} điểm (Mục tiêu: ${metrics.targetScore} điểm). Hãy vào giao diện Lộ Trình để bắt đầu các chặng học tối ưu riêng cho bạn!`
                  : 'Hãy làm bài test đánh giá năng lực đầu vào hoặc thiết lập mục tiêu điểm số để hệ thống tạo lộ trình học chuẩn xác nhất cho bạn!'}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Button
                onClick={() => navigate('/roadmap')}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl gap-1.5 cursor-pointer"
              >
                <Compass size={14} />
                <span>Xem lộ trình học tập</span>
              </Button>
              <Button
                onClick={() => navigate('/toeic/exam/placement_2skills')}
                variant="outline"
                className="text-xs font-semibold rounded-xl cursor-pointer"
              >
                {metrics.currentScore > 0 ? 'Làm lại test đầu vào' : 'Làm Test đầu vào ngay'}
              </Button>
            </div>
          </Card>
        )
      ) : activeTab === 'SKILLS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="dashboard-card p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-primary">Năng lực khảo thí TOEIC</span>
                <h4 className="text-sm font-bold text-text-primary">Kỹ năng Nghe & Đọc (LR)</h4>
              </div>
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <GraduationCap size={18} />
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-xl border border-border bg-surface-subtle/50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-text-primary block">Listening (Kỹ năng Nghe)</span>
                  <span className="text-[11px] text-text-tertiary">Part 1, 2, 3, 4</span>
                </div>
                <span className="text-base font-black text-indigo-600">
                  {listeningScore > 0 ? `${listeningScore} / 495` : '-- / 495'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-surface-subtle/50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-text-primary block">Reading (Kỹ năng Đọc)</span>
                  <span className="text-[11px] text-text-tertiary">Part 5, 6, 7</span>
                </div>
                <span className="text-base font-black text-emerald-600">
                  {readingScore > 0 ? `${readingScore} / 495` : '-- / 495'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={() => navigate('/toeic')}
                className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl"
              >
                Luyện đề thi TOEIC
              </Button>
            </div>
          </Card>

          <Card className="dashboard-card p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-amber-600">Từ vựng & Trí nhớ ngắt quãng</span>
                <h4 className="text-sm font-bold text-text-primary">Spaced Repetition (SRS)</h4>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                <Zap size={18} />
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-xl border border-border bg-surface-subtle/50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-text-primary block">Từ vựng đã ghi nhớ:</span>
                  <span className="text-[11px] text-text-tertiary">Đã lưu vào bộ nhớ dài hạn</span>
                </div>
                <span className="text-base font-black text-amber-600">
                  {vocabStats.learned_words} từ
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-surface-subtle/50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-text-primary block">Thẻ cần ôn tập hôm nay:</span>
                  <span className="text-[11px] text-text-tertiary">Lặp lại ngắt quãng SRS</span>
                </div>
                <span className="text-base font-black text-rose-600">
                  {vocabStats.review_due} thẻ
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={() => navigate('/vocabulary')}
                variant="outline"
                className="w-full text-xs font-semibold rounded-xl"
              >
                Vào học Từ Vựng
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-text-primary">5 bài kiểm tra hoàn thành gần đây</h4>
            <Button
              onClick={() => navigate('/exam-history')}
              variant="outline"
              size="sm"
              className="text-xs font-semibold rounded-xl gap-1.5"
            >
              <span>Xem toàn bộ lịch sử thi</span>
              <ArrowRight size={13} />
            </Button>
          </div>

          {recentActivities.length === 0 ? (
            <Card className="border-dashed p-8 text-center space-y-3">
              <Award size={28} className="mx-auto text-text-tertiary" />
              <p className="text-xs text-text-secondary">Chưa có bài kiểm tra nào được hoàn thành gần đây.</p>
              <Button
                onClick={() => navigate('/toeic')}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl"
              >
                Làm đề thi thử ngay
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((item) => (
                <Card
                  key={item.id}
                  onClick={() => {
                    if (item.type === 'TOEIC') {
                      navigate(`/exam-history/${item.id}`)
                    } else if (item.courseId) {
                      navigate(`/course/${item.courseId}`)
                    } else {
                      navigate('/exam-history')
                    }
                  }}
                  className="dashboard-card hover:border-primary/50 transition-all p-4 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge className={item.type === 'TOEIC' ? 'bg-indigo-600 text-white text-[10px]' : 'bg-amber-600 text-white text-[10px]'}>
                        {item.type === 'TOEIC' ? 'Đề thi TOEIC' : 'Khóa học'}
                      </Badge>
                      <span className="text-xs font-bold text-text-primary truncate">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary truncate">{item.subtitle}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-text-primary">{item.scoreText}</div>
                    <span className={`text-[10px] font-bold ${item.isPassed ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {item.isPassed ? 'Đạt chuẩn' : 'Chưa đạt'}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
