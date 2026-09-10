// Trang chi tiết kết quả bài kiểm tra và bài thi thử của học viên.

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  RotateCcw,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { Card } from '@/components/card'
import { Button } from '@/components/button'
import { useParams, useSearchParams, useNavigate } from '@/lib/navigation'
import { examService } from '@/features/toeic/services/exam.service'
import { courseService } from '@/features/courses/services/course.service'
import { AttemptSummaryCard } from '@/features/toeic/components/attempt.summary.card'
import {
  AttemptAnswerDetail,
  CourseQuestionDetail,
  ToeicQuestionCard,
  CourseQuestionCard,
} from '@/features/toeic/components/attempt.question.item'

interface AttemptResultDetail {
  attempt?: {
    _id?: string
    exam_id?: string
    exam_title?: string
    exam_code?: string
    total_scaled_score?: number
    listening_scaled_score?: number
    reading_scaled_score?: number
    correct_questions?: number
    total_questions?: number
    total_time_seconds?: number
    submitted_at?: string
  }
  answers?: AttemptAnswerDetail[]
}

export default function ExamAttemptDetailPage() {
  const navigate = useNavigate()
  const params = useParams<{ attemptId: string }>()
  const searchParams = useSearchParams()

  const attemptId = params?.attemptId || ''
  const sourceType = searchParams.get('sourceType') || 'TOEIC'
  const testType = searchParams.get('testType') || ''
  const courseId = searchParams.get('courseId') || ''
  const moduleId = searchParams.get('moduleId') || ''
  const initialTitle = searchParams.get('title') || 'Chi tiết bài làm'
  const initialScore = searchParams.get('score') || ''
  const initialCorrect = searchParams.get('correct') ? Number(searchParams.get('correct')) : undefined
  const initialTotal = searchParams.get('total') ? Number(searchParams.get('total')) : undefined
  const initialIsPassed = searchParams.get('isPassed') === 'true'
  const initialSubmittedAt = searchParams.get('submittedAt') || ''
  const initialDuration = searchParams.get('duration') ? Number(searchParams.get('duration')) : undefined

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [detailData, setDetailData] = useState<AttemptResultDetail | null>(null)
  const [courseQuestions, setCourseQuestions] = useState<CourseQuestionDetail[]>([])
  const [courseTitle, setCourseTitle] = useState<string>('')
  const [filterAnswerStatus, setFilterAnswerStatus] = useState<'ALL' | 'CORRECT' | 'INCORRECT' | 'SKIPPED'>('ALL')

  const isProfilePlacement = attemptId === 'profile-placement-baseline'
  const isCourseTest = sourceType === 'COURSE'

  const loadAttemptDetail = useCallback(async () => {
    if (!attemptId) return
    setIsLoading(true)
    try {
      if (isCourseTest && courseId) {
        const course = await courseService.getCourseById(courseId).catch(() => null)
        if (course) {
          const rawCourse = course as unknown as {
            title?: string
            final_test_questions?: unknown[]
            modules?: Array<{
              _id?: string
              id?: string
              order_index?: number
              challenge_questions?: Array<{
                question_text?: string
                question?: string
                options?: string[] | Array<{ text?: string; key?: string }>
                correct_answer?: string
                correct_option?: string
                explanation?: string
                explanation_vi?: string
                explanation_en?: string
                media_url?: string
                audio_url?: string
                image_url?: string
              }>
              post_mini_test_questions?: Array<{
                question_text?: string
                question?: string
                options?: string[] | Array<{ text?: string; key?: string }>
                correct_answer?: string
                correct_option?: string
                explanation?: string
                explanation_vi?: string
                explanation_en?: string
                media_url?: string
                audio_url?: string
                image_url?: string
              }>
            }>
          }

          if (rawCourse.title) setCourseTitle(rawCourse.title)

          let qList: unknown[] = []
          if (testType === 'final-test') {
            qList = Array.isArray(rawCourse.final_test_questions) ? rawCourse.final_test_questions : []
          } else if (rawCourse.modules && Array.isArray(rawCourse.modules)) {
            const targetMod =
              rawCourse.modules.find((m) => m._id === moduleId || m.id === moduleId) ||
              rawCourse.modules[0]

            if (targetMod) {
              if (testType === 'challenge') {
                qList = targetMod.challenge_questions || []
              } else {
                qList = targetMod.post_mini_test_questions || targetMod.challenge_questions || []
              }
            }
          }

          if (qList.length > 0) {
            const parsedQuestions: CourseQuestionDetail[] = qList.map((item, idx) => {
              const qObj = item as Record<string, unknown>
              const optRaw = qObj.options
              let cleanOptions: string[] = []
              if (Array.isArray(optRaw)) {
                cleanOptions = optRaw.map((opt) => {
                  if (typeof opt === 'string') return opt
                  if (opt && typeof opt === 'object') {
                    const oRec = opt as Record<string, unknown>
                    return String(oRec.text || oRec.key || '')
                  }
                  return ''
                })
              }

              return {
                question_number: idx + 1,
                question_text: String(
                  qObj.question_text || qObj.question || `Câu hỏi số ${idx + 1}`
                ),
                options: cleanOptions,
                correct_answer: String(qObj.correct_answer || qObj.correct_option || 'A'),
                explanation: String(
                  qObj.explanation_vi || qObj.explanation || qObj.explanation_en || ''
                ),
                media_url: qObj.media_url
                  ? String(qObj.media_url)
                  : qObj.audio_url
                  ? String(qObj.audio_url)
                  : undefined,
                image_url: qObj.image_url ? String(qObj.image_url) : undefined,
              }
            })
            setCourseQuestions(parsedQuestions)
          }
        }
      } else if (!isProfilePlacement) {
        const res = await examService.getExamAttemptResult(attemptId).catch(() => null)
        if (res) {
          setDetailData(res as unknown as AttemptResultDetail)
        }
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  }, [attemptId, isCourseTest, courseId, moduleId, testType, isProfilePlacement])

  useEffect(() => {
    loadAttemptDetail()
  }, [loadAttemptDetail])

  const title = detailData?.attempt?.exam_title || initialTitle
  const scoreDisplay = detailData?.attempt
    ? `${detailData.attempt.total_scaled_score ?? 0} / 990 điểm`
    : initialScore || 'Hoàn thành'
  const totalQ = detailData?.attempt?.total_questions ?? initialTotal ?? 0
  const correctQ = detailData?.attempt?.correct_questions ?? initialCorrect ?? 0
  const isPassed = detailData?.attempt
    ? (detailData.attempt.total_scaled_score ?? 0) >= 450
    : initialIsPassed
  const submittedAt = detailData?.attempt?.submitted_at || initialSubmittedAt
  const durationSeconds = detailData?.attempt?.total_time_seconds ?? initialDuration

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '30 phút'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins} phút ${secs > 0 ? `${secs} giây` : ''}`
  }

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'Đang cập nhật'
    try {
      const d = new Date(dateStr)
      return d.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const filteredToeicAnswers = useMemo(() => {
    if (!detailData?.answers) return []
    return detailData.answers.filter((ans) => {
      if (filterAnswerStatus === 'CORRECT') return ans.is_correct
      if (filterAnswerStatus === 'INCORRECT')
        return !ans.is_correct && !ans.is_skipped && Boolean(ans.selected_option)
      if (filterAnswerStatus === 'SKIPPED') return ans.is_skipped || !ans.selected_option
      return true
    })
  }, [detailData?.answers, filterAnswerStatus])

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/exam-history')}
            className="rounded-xl shrink-0 cursor-pointer hover:bg-surface-subtle"
            title="Quay lại danh sách"
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-text-tertiary">
                {isCourseTest ? 'Khóa học' : 'Luyện thi TOEIC'}
              </span>
              <span className="text-text-tertiary">•</span>
              <span className="text-xs font-mono text-text-tertiary">Mã: {attemptId}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isCourseTest && courseId ? (
            <Button
              onClick={() =>
                navigate(
                  `/course/${courseId}/exam?type=${testType}${moduleId ? `&chapterId=${moduleId}` : ''}`
                )
              }
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl gap-1.5 shadow-xs cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Làm lại bài</span>
            </Button>
          ) : (
            <Button
              onClick={() =>
                navigate(
                  detailData?.attempt?.exam_id
                    ? `/toeic/exam/${detailData.attempt.exam_id}`
                    : '/toeic/exam/placement_2skills'
                )
              }
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl gap-1.5 shadow-xs cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Làm lại đề thi</span>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/exam-history')}
            className="text-xs font-semibold rounded-xl cursor-pointer"
          >
            Quay lại
          </Button>
        </div>
      </div>

      <AttemptSummaryCard
        scoreDisplay={scoreDisplay}
        isPassed={isPassed}
        correctQ={correctQ}
        totalQ={totalQ}
        durationSeconds={durationSeconds}
        submittedAt={submittedAt}
        formatDuration={formatDuration}
        formatDateTime={formatDateTime}
        listeningScore={detailData?.attempt?.listening_scaled_score}
        readingScore={detailData?.attempt?.reading_scaled_score}
      />

      {detailData?.answers && detailData.answers.length > 0 && (
        <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterAnswerStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterAnswerStatus === 'ALL'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
            }`}
          >
            Tất cả ({detailData.answers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterAnswerStatus('CORRECT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterAnswerStatus === 'CORRECT'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            Làm đúng ({detailData.answers.filter((a) => a.is_correct).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterAnswerStatus('INCORRECT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterAnswerStatus === 'INCORRECT'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
            }`}
          >
            Làm sai (
            {
              detailData.answers.filter(
                (a) => !a.is_correct && !a.is_skipped && Boolean(a.selected_option)
              ).length
            }
            )
          </button>
          <button
            type="button"
            onClick={() => setFilterAnswerStatus('SKIPPED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterAnswerStatus === 'SKIPPED'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
            }`}
          >
            Chưa làm ({detailData.answers.filter((a) => a.is_skipped || !a.selected_option).length})
          </button>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-text-secondary">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm font-semibold">Đang tải chi tiết các câu hỏi bài làm...</p>
          </div>
        ) : isCourseTest ? (
          courseQuestions.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <BookOpen size={18} className="text-primary" />
                <span>Danh sách câu hỏi bài kiểm tra khóa học</span>
              </h3>
              {courseQuestions.map((q) => (
                <CourseQuestionCard
                  key={q.question_number}
                  question={q}
                  courseTitle={courseTitle}
                  courseId={courseId}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center space-y-4 rounded-2xl border-border">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Trophy size={24} />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="font-bold text-text-primary text-base">
                  Kết quả bài kiểm tra khóa học
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Bạn đã hoàn thành bài kiểm tra với kết quả{' '}
                  <strong className="text-primary font-bold">{scoreDisplay}</strong> (Đúng{' '}
                  {correctQ}/{totalQ} câu hỏi).
                </p>
              </div>
              {courseId && (
                <div className="pt-2 flex items-center justify-center gap-2.5">
                  <Button
                    onClick={() =>
                      navigate(
                        `/course/${courseId}/exam?type=${testType}${
                          moduleId ? `&chapterId=${moduleId}` : ''
                        }`
                      )
                    }
                    className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl"
                  >
                    <RotateCcw size={14} className="mr-1.5" />
                    Làm lại bài kiểm tra
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="text-xs font-semibold rounded-xl"
                  >
                    Vào khóa học
                  </Button>
                </div>
              )}
            </Card>
          )
        ) : isProfilePlacement ? (
          <Card className="p-8 text-center space-y-4 rounded-2xl border-border">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 mx-auto flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="font-bold text-text-primary text-base">
                Đánh Giá Năng Lực Đầu Vào (Placement Test)
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Điểm xuất phát của bạn được ghi nhận là{' '}
                <strong className="text-primary">{scoreDisplay}</strong>. Hệ thống đã xây dựng lộ
                trình luyện thi TOEIC cá nhân hóa tương ứng với kết quả này.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2.5">
              <Button
                onClick={() => navigate('/roadmap')}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl"
              >
                Xem lộ trình học tập
              </Button>
              <Button
                onClick={() => navigate('/toeic/exam/placement_2skills')}
                variant="outline"
                className="text-xs font-semibold rounded-xl"
              >
                <RotateCcw size={14} className="mr-1.5" />
                Làm lại Test đầu vào
              </Button>
            </div>
          </Card>
        ) : !detailData || !detailData.answers || detailData.answers.length === 0 ? (
          <Card className="p-12 text-center text-xs text-text-secondary space-y-2 rounded-2xl border-border">
            <AlertCircle size={28} className="mx-auto text-amber-500" />
            <h4 className="text-sm font-bold text-text-primary">
              Không có dữ liệu câu hỏi chi tiết
            </h4>
            <p>Lần thi này chưa được lưu lại danh sách câu hỏi từng phần trong cơ sở dữ liệu.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <HelpCircle size={18} className="text-primary" />
              <span>
                Phân tích chi tiết câu hỏi & Lời giải bài làm ({filteredToeicAnswers.length}/
                {detailData.answers.length} câu)
              </span>
            </h3>
            {filteredToeicAnswers.map((ans, idx) => (
              <ToeicQuestionCard key={idx} answer={ans} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
