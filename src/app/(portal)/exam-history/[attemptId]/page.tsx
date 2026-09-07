// Trang chi tiết kết quả bài kiểm tra và bài thi thử của học viên.

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  RotateCcw,
  ArrowLeft,
  BookOpen,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  ExternalLink,
  Volume2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useParams, useSearchParams, useNavigate } from '@/lib/navigation'
import { examService } from '@/services/exam.service'
import { courseService } from '@/services/course.service'

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
      correct_option?: string
      image_url?: string
      audio_url?: string
    }
  }>
}

interface CourseQuestionDetail {
  question_number: number
  question_text: string
  options: string[]
  correct_answer: string
  explanation?: string
  media_url?: string
  image_url?: string
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
  const initialScoreVal = searchParams.get('scoreVal') ? Number(searchParams.get('scoreVal')) : undefined
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
            const targetMod = rawCourse.modules.find(
              (m) => m._id === moduleId || m.id === moduleId
            ) || rawCourse.modules[0]

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
                question_text: String(qObj.question_text || qObj.question || `Câu hỏi số ${idx + 1}`),
                options: cleanOptions,
                correct_answer: String(qObj.correct_answer || qObj.correct_option || 'A'),
                explanation: String(qObj.explanation_vi || qObj.explanation || qObj.explanation_en || ''),
                media_url: qObj.media_url ? String(qObj.media_url) : qObj.audio_url ? String(qObj.audio_url) : undefined,
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
  const incorrectQ = Math.max(0, totalQ - correctQ)
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
      if (filterAnswerStatus === 'INCORRECT') return !ans.is_correct && !ans.is_skipped && Boolean(ans.selected_option)
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dashboard-card p-4 rounded-2xl border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Điểm số đạt được</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Trophy size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-primary">
              {scoreDisplay}
            </div>
            <div className="mt-1 flex items-center gap-2">
              {isPassed ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  <CheckCircle size={10} className="mr-1" /> Đạt chuẩn
                </Badge>
              ) : (
                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  <AlertCircle size={10} className="mr-1" /> Cần cải thiện
                </Badge>
              )}
            </div>
          </div>
        </Card>

        <Card className="dashboard-card p-4 rounded-2xl border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Số câu chính xác</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {correctQ} / {totalQ} câu
            </div>
            <p className="text-[11px] font-semibold text-text-tertiary mt-1">
              Độ chính xác: {totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0}%
            </p>
          </div>
        </Card>

        <Card className="dashboard-card p-4 rounded-2xl border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Thời gian làm bài</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {formatDuration(durationSeconds)}
            </div>
            <p className="text-[11px] font-semibold text-text-tertiary mt-1">
              Thời lượng quy chuẩn
            </p>
          </div>
        </Card>

        <Card className="dashboard-card p-4 rounded-2xl border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Thời điểm nộp bài</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <Calendar size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-black text-text-primary">
              {formatDateTime(submittedAt)}
            </div>
            <p className="text-[11px] font-semibold text-text-tertiary mt-1">
              Đã đồng bộ lên hệ thống
            </p>
          </div>
        </Card>
      </div>

      {detailData?.attempt && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-4 rounded-2xl border border-border bg-surface">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary">Điểm phần Nghe (Listening)</span>
              <span className="text-xs font-semibold text-primary">ETS Scaled</span>
            </div>
            <div className="mt-2 text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {detailData.attempt.listening_scaled_score ?? 0} / 495 điểm
            </div>
            <div className="w-full bg-surface-subtle h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round(((detailData.attempt.listening_scaled_score ?? 0) / 495) * 100))}%` }}
              />
            </div>
          </Card>

          <Card className="p-4 rounded-2xl border border-border bg-surface">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary">Điểm phần Đọc (Reading)</span>
              <span className="text-xs font-semibold text-emerald-600">ETS Scaled</span>
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {detailData.attempt.reading_scaled_score ?? 0} / 495 điểm
            </div>
            <div className="w-full bg-surface-subtle h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round(((detailData.attempt.reading_scaled_score ?? 0) / 495) * 100))}%` }}
              />
            </div>
          </Card>
        </div>
      )}

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
            Làm sai ({detailData.answers.filter((a) => !a.is_correct && !a.is_skipped && Boolean(a.selected_option)).length})
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
                <Card
                  key={q.question_number}
                  className="p-5 rounded-2xl border border-border bg-surface text-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-text-primary text-sm">
                      Câu {q.question_number}:
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold">
                      Khóa học: {courseTitle || courseId}
                    </Badge>
                  </div>

                  {q.question_text && (
                    <p className="text-text-primary text-sm leading-relaxed">{q.question_text}</p>
                  )}

                  {q.image_url && (
                    <div className="max-w-md rounded-xl overflow-hidden border border-border">
                      <img src={q.image_url} alt={`Câu ${q.question_number}`} className="w-full h-auto object-cover" />
                    </div>
                  )}

                  {q.media_url && (
                    <div className="pt-1">
                      <audio controls className="w-full h-8" src={q.media_url} />
                    </div>
                  )}

                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      {q.options.map((opt, oIdx) => {
                        const optKey = ['A', 'B', 'C', 'D'][oIdx] || String(oIdx + 1)
                        const isCorrect =
                          q.correct_answer === optKey ||
                          q.correct_answer.toLowerCase() === opt.toLowerCase() ||
                          q.correct_answer.startsWith(optKey)

                        return (
                          <div
                            key={oIdx}
                            className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                              isCorrect
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold'
                                : 'border-border bg-surface-subtle/50 text-text-secondary'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-border text-text-tertiary'
                              }`}
                            >
                              {optKey}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isCorrect && <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {q.explanation && (
                    <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200 text-xs">
                      <span className="font-bold text-blue-700 dark:text-blue-300 block mb-1">
                        💡 Giải thích chi tiết:
                      </span>
                      <p className="leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center space-y-4 rounded-2xl border-border">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Trophy size={24} />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="font-bold text-text-primary text-base">Kết quả bài kiểm tra khóa học</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Bạn đã hoàn thành bài kiểm tra với kết quả <strong className="text-primary font-bold">{scoreDisplay}</strong> (Đúng {correctQ}/{totalQ} câu hỏi).
                </p>
              </div>
              {courseId && (
                <div className="pt-2 flex items-center justify-center gap-2.5">
                  <Button
                    onClick={() =>
                      navigate(
                        `/course/${courseId}/exam?type=${testType}${moduleId ? `&chapterId=${moduleId}` : ''}`
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
              <h4 className="font-bold text-text-primary text-base">Đánh Giá Năng Lực Đầu Vào (Placement Test)</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Điểm xuất phát của bạn được ghi nhận là <strong className="text-primary">{scoreDisplay}</strong>. Hệ thống đã xây dựng lộ trình luyện thi TOEIC cá nhân hóa tương ứng với kết quả này.
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
            <h4 className="text-sm font-bold text-text-primary">Không có dữ liệu câu hỏi chi tiết</h4>
            <p>Lần thi này chưa được lưu lại danh sách câu hỏi từng phần trong cơ sở dữ liệu.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <HelpCircle size={18} className="text-primary" />
              <span>Phân tích chi tiết câu hỏi & Lời giải bài làm ({filteredToeicAnswers.length}/{detailData.answers.length} câu)</span>
            </h3>
            {filteredToeicAnswers.map((ans, idx) => {
              const q = ans.question_id
              const isCorrect = ans.is_correct
              const isSkipped = ans.is_skipped || !ans.selected_option
              const correctKey = ans.correct_option

              return (
                <Card
                  key={idx}
                  className={`p-5 rounded-2xl border text-xs space-y-3 transition-all ${
                    isCorrect
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : isSkipped
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-rose-500/30 bg-rose-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-text-primary text-sm">
                      Câu {ans.question_number}:
                    </span>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-full text-xs">
                        <CheckCircle size={13} /> Làm đúng
                      </span>
                    ) : isSkipped ? (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-full text-xs">
                        <AlertCircle size={13} /> Chưa làm
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-700 dark:text-rose-300 bg-rose-500/15 px-2.5 py-1 rounded-full text-xs">
                        <XCircle size={13} /> Chưa chính xác
                      </span>
                    )}
                  </div>

                  {q?.question_text_en && (
                    <p className="text-text-primary text-sm leading-relaxed">{q.question_text_en}</p>
                  )}

                  {q?.image_url && (
                    <div className="max-w-md rounded-xl overflow-hidden border border-border">
                      <img src={q.image_url} alt={`Câu ${ans.question_number}`} className="w-full h-auto object-cover" />
                    </div>
                  )}

                  {q?.audio_url && (
                    <div className="pt-1">
                      <audio controls className="w-full h-8" src={q.audio_url} />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-3 rounded-xl bg-surface border border-border">
                      <span className="font-semibold text-text-secondary block">
                        Lựa chọn của bạn:
                      </span>
                      <span
                        className={`text-sm font-black ${
                          isCorrect
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {ans.selected_option ?? 'Chưa chọn'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface border border-border">
                      <span className="font-semibold text-text-secondary block">
                        Đáp án chuẩn xác:
                      </span>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {correctKey}
                      </span>
                    </div>
                  </div>

                  {q?.explanation_en && (
                    <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200">
                      <span className="font-bold text-blue-700 dark:text-blue-300 block mb-1">
                        💡 Giải thích chi tiết:
                      </span>
                      <p className="leading-relaxed">{q.explanation_en}</p>
                    </div>
                  )}
                  {q?.explanation_vi && (
                    <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-900 dark:text-blue-200">
                      <span className="font-bold text-blue-700 dark:text-blue-300 block mb-1">
                        💡 Giải thích (Tiếng Việt):
                      </span>
                      <p className="leading-relaxed italic">{q.explanation_vi}</p>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
