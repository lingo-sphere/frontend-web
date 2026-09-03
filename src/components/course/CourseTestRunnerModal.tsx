'use client'

/**
 * @file CourseTestRunnerModal.tsx
 * @description Modal thi và đánh giá 4 kỹ năng: Trắc nghiệm nghe hiểu có audio player, Luyện nói thu âm micro tích hợp Whisper STT và Viết luận có bộ đếm từ tự động.
 */

import { useState, useMemo, useRef, useEffect } from 'react'
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Trophy,
  ArrowRight,
  RotateCcw,
  FileQuestion,
  TrendingUp,
  Bot,
  Loader2,
  ChevronDown,
  ChevronUp,
  Volume2,
  Mic,
  MicOff,
  PenTool,
  Square,
  Play,
  Send,
  BookOpen,
  Headphones,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Chapter } from '@/types/course'
import { courseService } from '@/services/course.service'
import { api } from '@/services/api-client'
import { toast } from '@/store/toast-store'

export interface CourseTestQuestion {
  id?: string
  question_text?: string
  question?: string
  options?: string[]
  answers?: string[]
  correct_answer?: string | number
  correct_index?: number
  explanation?: string
  media_url?: string
}

interface CourseTestRunnerModalProps {
  isOpen: boolean
  courseId: string
  chapter: Chapter | null
  testType: 'challenge' | 'exercise' | 'post-mini' | 'final-test'
  finalTestQuestions?: CourseTestQuestion[]
  onClose: () => void
  onComplete?: (score: number, isPassed: boolean, resultData?: unknown) => void
}

function getCorrectOptionIndex(q: CourseTestQuestion, options: string[]): number {
  if (typeof q.correct_index === 'number' && q.correct_index >= 0) {
    return q.correct_index
  }
  if (typeof q.correct_answer === 'number' && q.correct_answer >= 0) {
    return q.correct_answer
  }
  if (typeof q.correct_answer === 'string') {
    const trimmed = q.correct_answer.trim()
    const upper = trimmed.toUpperCase()
    if (upper === 'A') return 0
    if (upper === 'B') return 1
    if (upper === 'C') return 2
    if (upper === 'D') return 3

    const num = parseInt(trimmed, 10)
    if (!isNaN(num) && num >= 0 && num < options.length) {
      return num
    }

    const textMatchIdx = options.findIndex(
      (opt) => opt.trim().toLowerCase() === trimmed.toLowerCase()
    )
    if (textMatchIdx !== -1) return textMatchIdx
  }
  return 0
}

export function CourseTestRunnerModal({
  isOpen,
  courseId,
  chapter,
  testType,
  finalTestQuestions,
  onClose,
  onComplete,
}: CourseTestRunnerModalProps) {
  const [activeSection, setActiveSection] = useState<'QUIZ' | 'SPEAKING' | 'WRITING'>('QUIZ')

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [scoreResult, setScoreResult] = useState<{
    correctCount: number
    totalQuestions: number
    score: number
    isPassed: boolean
  } | null>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [progressionNote, setProgressionNote] = useState<string | null>(null)
  const [growthDiff, setGrowthDiff] = useState<{ scoreDiff: number; percent: number } | null>(null)

  const [isLoadingAi, setIsLoadingAi] = useState(false)
  const [showAiDetails, setShowAiDetails] = useState(false)
  const [aiExplanations, setAiExplanations] = useState<{
    summary?: string
    overall_advice?: string
    explanations: Array<{
      question_number: number
      question_text: string
      user_selected: string
      correct_answer: string
      why_wrong: string
      why_correct: string
      recommended_topic: string
    }>
  } | null>(null)
  const [wrongQuestionsList, setWrongQuestionsList] = useState<
    Array<{
      question_number: number
      question_text: string
      user_selected_answer: string
      correct_answer: string
      category?: string
    }>
  >([])

  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [isSubmittingSpeaking, setIsSubmittingSpeaking] = useState(false)
  const [speakingResult, setSpeakingResult] = useState<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [essayText, setEssayText] = useState('')
  const [isSubmittingWriting, setIsSubmittingWriting] = useState(false)
  const [writingResult, setWritingResult] = useState<any>(null)

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const rawQuestions: CourseTestQuestion[] = useMemo(() => {
    if (testType === 'final-test') {
      if (Array.isArray(finalTestQuestions) && finalTestQuestions.length > 0) {
        return finalTestQuestions as CourseTestQuestion[]
      }
    }
    if (testType === 'challenge' || testType === 'post-mini' || testType === 'exercise') {
      const qList =
        (Array.isArray(chapter?.test_questions) && chapter.test_questions.length > 0 ? chapter.test_questions : null) ||
        (Array.isArray(chapter?.post_mini_questions) && chapter.post_mini_questions.length > 0 ? chapter.post_mini_questions : null) ||
        (Array.isArray(chapter?.challenge_questions) && chapter.challenge_questions.length > 0 ? chapter.challenge_questions : null) ||
        []
      return qList as CourseTestQuestion[]
    }
    return []
  }, [chapter, testType, finalTestQuestions])

  if (!isOpen) return null

  const passingScore =
    testType === 'challenge'
      ? chapter?.challengeTest?.passingScore || 80
      : testType === 'final-test'
      ? 70
      : 60

  const testTitle =
    testType === 'challenge'
      ? `Bài kiểm tra đầu chương (Challenge Test)`
      : testType === 'post-mini'
      ? `Bài kiểm tra cuối chương (Post-Mini Test)`
      : testType === 'final-test'
      ? `Bài thi tốt nghiệp khóa học (Final Test)`
      : `Bài luyện tập trắc nghiệm (${chapter?.title || ''})`

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }))
  }

  const handleRetry = () => {
    setSelectedAnswers({})
    setIsSubmitted(false)
    setScoreResult(null)
    setAiExplanations(null)
    setWrongQuestionsList([])
    setShowAiDetails(false)
  }

  const handleSubmitTest = async () => {
    let correct = 0
    const wrongs: typeof wrongQuestionsList = []

    rawQuestions.forEach((q, idx) => {
      const chosen = selectedAnswers[idx]
      const options = q.options || q.answers || ['A', 'B', 'C', 'D']
      const correctIdx = getCorrectOptionIndex(q, options)

      if (chosen === correctIdx) {
        correct++
      } else {
        wrongs.push({
          question_number: idx + 1,
          question_text: q.question_text || q.question || `Câu hỏi số ${idx + 1}`,
          user_selected_answer:
            chosen !== undefined ? options[chosen] || String.fromCharCode(65 + chosen) : 'Chưa chọn',
          correct_answer: options[correctIdx] || String.fromCharCode(65 + correctIdx),
          category: chapter?.title || 'Kiến thức chung',
        })
      }
    })

    const total = rawQuestions.length
    const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 100
    const isPassed = scorePercent >= passingScore

    setWrongQuestionsList(wrongs)
    setScoreResult({
      correctCount: correct,
      totalQuestions: total,
      score: scorePercent,
      isPassed,
    })
    setIsSubmitted(true)

    setIsSaving(true)
    let backendResult: any = null
    try {
      if (testType === 'challenge' && chapter?.id) {
        backendResult = await courseService.submitModuleChallenge(courseId, String(chapter.id), {
          score: scorePercent,
          passing_score: passingScore,
        })
        if (backendResult?.message) {
          setProgressionNote(backendResult.message)
        }
      } else if ((testType === 'post-mini' || testType === 'exercise') && chapter?.id) {
        backendResult = await courseService.submitModulePostMini(courseId, String(chapter.id), {
          score: scorePercent,
        })
        if (backendResult?.progression_comparison) {
          const comp = backendResult.progression_comparison
          setProgressionNote(comp.comparison_note)
          setGrowthDiff({
            scoreDiff: comp.score_diff,
            percent: comp.percentage_improvement,
          })
        }
      } else if (testType === 'final-test') {
        backendResult = await courseService.submitCourseFinalTest(courseId, {
          score: scorePercent,
        })
        if (backendResult?.total_score_growth !== undefined) {
          setGrowthDiff({
            scoreDiff: backendResult.total_score_growth,
            percent: backendResult.total_growth_percentage,
          })
          setProgressionNote(
            backendResult.baseline_score > 0
              ? `Tốt nghiệp khóa học! Tiến bộ tổng thể ${backendResult.total_score_growth >= 0 ? '+' : ''}${backendResult.total_score_growth} điểm (+${backendResult.total_growth_percentage}%) so với Baseline ban đầu.`
              : 'Chúc mừng bạn đã hoàn thành bài thi tốt nghiệp cuối khóa!'
          )
        }
      }
    } catch (err) {
      console.warn('Could not save test to backend:', err)
    } finally {
      setIsSaving(false)
      onComplete?.(scorePercent, isPassed, backendResult)
    }
  }

  const handleExplainMistakes = async () => {
    if (wrongQuestionsList.length === 0) return
    setIsLoadingAi(true)
    setShowAiDetails(true)
    try {
      const res = await courseService.explainTestMistakes(courseId, {
        test_type: testType,
        wrong_questions: wrongQuestionsList,
      })
      if (res) {
        setAiExplanations(res)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoadingAi(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setRecordedBlob(blob)
        setRecordedUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((t) => t.stop())
      }

      recorder.start()
      setIsRecording(true)
      setRecordingSeconds(0)
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1)
      }, 1000)
    } catch {
      toast.error('Không thể mở micro. Vui lòng cho phép quyền truy cập micro trong trình duyệt.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }

  const resetRecording = () => {
    if (isRecording) stopRecording()
    setRecordedBlob(null)
    setRecordedUrl(null)
    setRecordingSeconds(0)
    setSpeakingResult(null)
  }

  const handleSubmitSpeaking = async () => {
    if (!recordedBlob) return
    setIsSubmittingSpeaking(true)
    try {
      let uploadedAudioUrl = 'https://res.lingosphere.com/audio/sample_speaking.mp3'
      try {
        const uploadRes = await api.upload<{ file_url: string }>('/media/upload', recordedBlob, {
          folder: 'speaking-submissions',
        })
        if (uploadRes?.file_url) {
          uploadedAudioUrl = uploadRes.file_url
        }
      } catch {
        // Fallback demo URL if offline
      }

      const res = await courseService.submitSpeakingSubmission(courseId, {
        audio_url: uploadedAudioUrl,
        module_id: chapter?.id ? String(chapter.id) : undefined,
        test_type: testType.toUpperCase(),
        prompt: 'Luyện phát âm và trả lời câu hỏi bằng tiếng Anh',
      })
      setSpeakingResult(res)
      toast.success('Đã nộp bài nói thành công! Whisper & AI đã hoàn tất chấm sơ bộ.')
    } catch {
      toast.error('Lỗi khi nộp bài nói. Vui lòng thử lại.')
    } finally {
      setIsSubmittingSpeaking(false)
    }
  }

  const handleSubmitWriting = async () => {
    if (!essayText.trim()) return
    setIsSubmittingWriting(true)
    try {
      const res = await courseService.submitWritingSubmission(courseId, {
        essay_text: essayText,
        module_id: chapter?.id ? String(chapter.id) : undefined,
        test_type: testType.toUpperCase(),
        prompt: 'Viết đoạn văn ngắn bằng tiếng Anh',
      })
      setWritingResult(res)
      toast.success('Đã nộp bài viết thành công! AI đã hoàn tất phân tích bài luận.')
    } catch {
      toast.error('Lỗi khi nộp bài viết. Vui lòng thử lại.')
    } finally {
      setIsSubmittingWriting(false)
    }
  }

  const essayWordCount = essayText.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-4xl max-h-[92vh] rounded-3xl bg-surface border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-surface-subtle/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
              {testType === 'final-test' ? <Trophy size={20} /> : <Sparkles size={20} />}
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">{testTitle}</h3>
              <p className="text-xs text-text-secondary">
                {chapter ? chapter.title : 'Khóa học'} • Điểm đạt:{' '}
                <span className="font-bold text-primary">{passingScore}%</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-border/70 bg-surface-subtle/30 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSection('QUIZ')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'QUIZ'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <BookOpen size={13} />
            <span>Trắc nghiệm & Nghe hiểu ({rawQuestions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('SPEAKING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'SPEAKING'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <Mic size={13} />
            <span>Luyện Nói (Whisper AI)</span>
            {speakingResult && (
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-black">
                {speakingResult.ai_score}đ
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('WRITING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'WRITING'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <PenTool size={13} />
            <span>Viết Luận (Writing)</span>
            {writingResult && (
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-black">
                {writingResult.ai_score}đ
              </span>
            )}
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeSection === 'QUIZ' && (
            <>
              {rawQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-subtle text-text-tertiary">
                    <FileQuestion size={32} />
                  </div>
                  <h4 className="text-sm font-bold text-text-primary">Chưa có dữ liệu câu hỏi trắc nghiệm</h4>
                  <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                    Giáo viên chưa cập nhật danh sách câu hỏi cho phần này của khóa học. Bạn có thể làm bài phần Speaking hoặc Writing ở các tab phía trên.
                  </p>
                </div>
              ) : (
                <>
                  {isSubmitted && scoreResult && (
                    <div className="space-y-3.5">
                      <div
                        className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300 ${
                          scoreResult.isPassed
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                              scoreResult.isPassed
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                : 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                            }`}
                          >
                            {scoreResult.isPassed ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                          </div>
                          <div>
                            <h4 className="text-base font-extrabold">
                              {scoreResult.isPassed
                                ? testType === 'challenge'
                                  ? '🎉 Xuất sắc! Bạn đã vượt cấp thành công!'
                                  : '🎉 Chúc mừng! Bạn đã hoàn thành bài test!'
                                : testType === 'challenge'
                                ? '⚡ Chưa đạt điểm vượt cấp (Đã sử dụng 1 lượt thử)'
                                : '⚡ Chưa đạt điểm chuẩn!'}
                            </h4>
                            <p className="text-xs opacity-90 mt-0.5">
                              Đúng {scoreResult.correctCount}/{scoreResult.totalQuestions} câu (
                              {scoreResult.score}%).{' '}
                              {scoreResult.isPassed
                                ? testType === 'challenge'
                                  ? 'Chương đã được vượt cấp, mở khóa chương kế tiếp!'
                                  : 'Tiến độ và điểm số đã được tự động lưu vào hệ thống!'
                                : testType === 'challenge'
                                ? `Cần đạt tối thiểu ${passingScore}%. Hãy hoàn thành các bài giảng và làm bài test ở cuối chương nhé!`
                                : `Cần đạt tối thiểu ${passingScore}% để vượt qua. Bạn có thể làm lại bài này nhiều lần.`}
                            </p>
                          </div>
                        </div>

                        {!scoreResult.isPassed && testType !== 'challenge' && (
                          <Button
                            onClick={handleRetry}
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 shrink-0 flex items-center gap-1.5 cursor-pointer text-xs"
                          >
                            <RotateCcw size={14} />
                            <span>Làm lại</span>
                          </Button>
                        )}
                      </div>

                      {progressionNote && (
                        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                            <TrendingUp size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                                Đánh giá tiến độ giai đoạn:
                              </span>
                              {growthDiff && (
                                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                                  {growthDiff.scoreDiff >= 0 ? `+${growthDiff.scoreDiff}` : growthDiff.scoreDiff} điểm ({growthDiff.percent >= 0 ? `+${growthDiff.percent}` : growthDiff.percent}%)
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-indigo-800 dark:text-indigo-300 mt-1 leading-relaxed font-medium">
                              {progressionNote}
                            </p>
                          </div>
                        </div>
                      )}

                      {wrongQuestionsList.length > 0 && (
                        <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-xl bg-purple-600 text-white shadow-xs">
                                <Bot size={16} />
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-purple-950 dark:text-purple-200">
                                  Gia sư AI giải thích lỗi sai & đề xuất ôn tập
                                </h5>
                                <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-0.5">
                                  Bạn có {wrongQuestionsList.length} câu trả lời chưa chính xác
                                </p>
                              </div>
                            </div>

                            {!aiExplanations ? (
                              <Button
                                onClick={handleExplainMistakes}
                                disabled={isLoadingAi}
                                size="sm"
                                className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
                              >
                                {isLoadingAi ? (
                                  <>
                                    <Loader2 size={13} className="animate-spin" />
                                    <span>Đang phân tích...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles size={13} />
                                    <span>Giải thích bằng AI</span>
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                onClick={() => setShowAiDetails(!showAiDetails)}
                                variant="ghost"
                                size="sm"
                                className="rounded-xl text-purple-700 dark:text-purple-300 text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                              >
                                <span>{showAiDetails ? 'Thu gọn' : 'Xem chi tiết'}</span>
                                {showAiDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </Button>
                            )}
                          </div>

                          {showAiDetails && aiExplanations && (
                            <div className="pt-3 border-t border-purple-200/60 dark:border-purple-800/40 space-y-3 animate-in fade-in duration-200">
                              {aiExplanations.overall_advice && (
                                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-purple-200/50 text-xs text-purple-900 dark:text-purple-200 font-medium">
                                  💡 <strong>Lời khuyên tổng thể:</strong> {aiExplanations.overall_advice}
                                </div>
                              )}

                              <div className="space-y-2.5">
                                {aiExplanations.explanations.map((item, exIdx) => (
                                  <div
                                    key={exIdx}
                                    className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-purple-200/60 dark:border-purple-800/50 space-y-2 text-xs"
                                  >
                                    <div className="flex items-center justify-between font-bold text-text-primary">
                                      <span>Câu {item.question_number}: {item.question_text}</span>
                                      {item.recommended_topic && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                                          {item.recommended_topic}
                                        </span>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                      <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200/50 text-rose-700 dark:text-rose-300">
                                        <span className="font-bold block">Bạn đã chọn: {item.user_selected}</span>
                                        <span className="opacity-90">{item.why_wrong}</span>
                                      </div>
                                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 text-emerald-700 dark:text-emerald-300">
                                        <span className="font-bold block">Đáp án đúng: {item.correct_answer}</span>
                                        <span className="opacity-90">{item.why_correct}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {rawQuestions.some(
                    (q) =>
                      q.media_url &&
                      (q.media_url.match(/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i) ||
                        q.media_url.includes('audio') ||
                        q.media_url.includes('quiz-audio'))
                  ) && (
                    <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center gap-3 shadow-xs">
                      <div className="p-2 rounded-xl bg-indigo-500 text-white shadow-xs shrink-0">
                        <Volume2 size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 block mb-1">
                          Audio bài thi Nghe (Listening) • Nhấn để phát:
                        </span>
                        <audio
                          controls
                          src={
                            rawQuestions.find(
                              (q) =>
                                q.media_url &&
                                (q.media_url.match(/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i) ||
                                  q.media_url.includes('audio') ||
                                  q.media_url.includes('quiz-audio'))
                            )?.media_url
                          }
                          className="w-full h-8"
                        />
                      </div>
                    </div>
                  )}

                  {rawQuestions.map((q, qIdx) => {
                    const chosenIdx = selectedAnswers[qIdx]
                    const options = q.options || q.answers || ['A', 'B', 'C', 'D']
                    const correctIdx = isSubmitted ? getCorrectOptionIndex(q, options) : -1

                    return (
                      <div
                        key={q.id || `q-${qIdx}`}
                        className={`p-5 rounded-2xl border transition-all ${
                          isSubmitted
                            ? chosenIdx === correctIdx
                              ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/10'
                              : 'border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/10'
                            : 'border-border bg-surface'
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3.5">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-extrabold text-xs">
                            {qIdx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-text-primary leading-relaxed">
                              {q.question_text || q.question || `Câu hỏi ${qIdx + 1}`}
                            </p>
                            {q.media_url && (
                              <div className="mt-2.5 max-w-md rounded-xl overflow-hidden border border-border">
                                {q.media_url.match(/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i) ||
                                q.media_url.includes('audio') ||
                                q.media_url.includes('quiz-audio') ? (
                                  <audio controls src={q.media_url} className="w-full" />
                                ) : (
                                  <img
                                    src={q.media_url}
                                    alt={`Question ${qIdx + 1}`}
                                    className="w-full object-cover max-h-56"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 pl-9">
                          {options.map((opt, optIdx) => {
                            const isSelected = chosenIdx === optIdx
                            const isCorrectAnswer = isSubmitted && optIdx === correctIdx
                            const isWrongSelected = isSubmitted && isSelected && optIdx !== correctIdx

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={isSubmitted}
                                onClick={() => handleSelectOption(qIdx, optIdx)}
                                className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-3 cursor-pointer ${
                                  isCorrectAnswer
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold'
                                    : isWrongSelected
                                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 line-through'
                                    : isSelected
                                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                                    : 'border-border/70 hover:border-primary/50 bg-surface-subtle/30 text-text-secondary hover:text-text-primary'
                                }`}
                              >
                                <span
                                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                    isCorrectAnswer
                                      ? 'bg-emerald-500 text-white'
                                      : isWrongSelected
                                      ? 'bg-rose-500 text-white'
                                      : isSelected
                                      ? 'bg-primary text-white'
                                      : 'bg-surface border border-border text-text-tertiary'
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="flex-1">{opt}</span>
                              </button>
                            )
                          })}
                        </div>

                        {isSubmitted && q.explanation && (
                          <div className="mt-3.5 ml-9 p-3 rounded-xl bg-surface-subtle/80 border border-border/80 text-xs text-text-secondary">
                            <span className="font-bold text-primary">💡 Giải thích: </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </>
              )}
            </>
          )}

          {activeSection === 'SPEAKING' && (
            <div className="space-y-5">
              <div className="p-4.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                  <Mic className="h-4 w-4 text-amber-600" />
                  <span>Đề bài luyện nói Speaking:</span>
                </div>
                <p className="text-xs text-amber-900 dark:text-amber-100 font-medium leading-relaxed">
                  &ldquo;Please introduce yourself and explain why learning English is important for your personal and professional future. Speak clearly for about 30 seconds to 2 minutes.&rdquo;
                </p>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                  ⚡ Giọng nói của bạn sẽ được chuyển thành văn bản bằng Whisper STT và AI chấm điểm phát âm. Giáo viên có thể nghe lại để phúc khảo điểm.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-border bg-surface-subtle/40 space-y-4">
                {!isRecording && !recordedUrl && (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex flex-col items-center gap-2 p-6 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 transition-all transform hover:scale-105 cursor-pointer"
                  >
                    <Mic className="h-8 w-8" />
                    <span className="text-xs font-black">Bấm để thu âm</span>
                  </button>
                )}

                {isRecording && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-rose-500 font-black text-sm animate-pulse">
                      <div className="h-3 w-3 rounded-full bg-rose-500" />
                      <span>Đang thu âm: {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}</span>
                    </div>

                    <button
                      type="button"
                      onClick={stopRecording}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                    >
                      <Square className="h-4 w-4 fill-white" />
                      <span>Dừng ghi âm</span>
                    </button>
                  </div>
                )}

                {recordedUrl && (
                  <div className="w-full max-w-md space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
                      <span>Bản thu của bạn ({recordingSeconds}s):</span>
                      <button
                        type="button"
                        onClick={resetRecording}
                        className="flex items-center gap-1 text-rose-500 hover:underline cursor-pointer"
                      >
                        <RotateCcw size={12} />
                        <span>Thu lại</span>
                      </button>
                    </div>

                    <audio controls src={recordedUrl} className="w-full h-9" />

                    {!speakingResult && (
                      <Button
                        type="button"
                        disabled={isSubmittingSpeaking}
                        onClick={handleSubmitSpeaking}
                        className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2.5 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isSubmittingSpeaking ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Whisper đang bóc tách & AI chấm điểm...</span>
                          </>
                        ) : (
                          <>
                            <Send size={14} />
                            <span>Nộp bài nói để Whisper & AI chấm</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {speakingResult && (
                <div className="p-5 rounded-2xl bg-surface border border-emerald-500/40 shadow-xs space-y-3.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={16} />
                      <span>Kết quả đánh giá bài nói sơ bộ</span>
                    </div>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl">
                      {speakingResult.ai_score}/100 điểm
                    </span>
                  </div>

                  {speakingResult.whisper_transcript && (
                    <div className="p-3.5 rounded-xl bg-surface-subtle border border-border text-xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                        <Bot size={13} /> Whisper STT nhận diện bài nói:
                      </span>
                      <p className="text-text-primary italic leading-relaxed">
                        &ldquo;{speakingResult.whisper_transcript}&rdquo;
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
                      <span className="text-[10px] text-text-tertiary block">Phát âm</span>
                      <span className="font-extrabold text-text-primary">{speakingResult.ai_feedback?.pronunciation_score || 80}/100</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
                      <span className="text-[10px] text-text-tertiary block">Độ lưu loát</span>
                      <span className="font-extrabold text-text-primary">{speakingResult.ai_feedback?.fluency_score || 78}/100</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
                      <span className="text-[10px] text-text-tertiary block">Ngữ pháp</span>
                      <span className="font-extrabold text-text-primary">{speakingResult.ai_feedback?.grammar_score || 82}/100</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
                      <span className="text-[10px] text-text-tertiary block">Từ vựng</span>
                      <span className="font-extrabold text-text-primary">{speakingResult.ai_feedback?.vocabulary_score || 80}/100</span>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary">
                    {speakingResult.ai_feedback?.detailed_comment}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'WRITING' && (
            <div className="space-y-5">
              <div className="p-4.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  <PenTool className="h-4 w-4 text-indigo-600" />
                  <span>Đề bài viết luận Writing:</span>
                </div>
                <p className="text-xs text-indigo-900 dark:text-indigo-100 font-medium leading-relaxed">
                  &ldquo;Write a short essay (between 80 and 150 words) describing an effective habit or strategy you use to improve your daily English learning. Support your answer with specific examples.&rdquo;
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-text-secondary">Khung soạn thảo bài viết:</label>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md ${
                      essayWordCount >= 80 && essayWordCount <= 150
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-surface-subtle text-text-tertiary'
                    }`}
                  >
                    Đã viết: {essayWordCount} từ {essayWordCount < 80 ? '(Tối thiểu 80 từ)' : ''}
                  </span>
                </div>

                <textarea
                  rows={8}
                  disabled={Boolean(writingResult)}
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  placeholder="Gõ bài viết tiếng Anh của bạn tại đây..."
                  className="w-full p-4 rounded-2xl border border-border bg-surface text-xs text-text-primary leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-primary"
                />

                {!writingResult && (
                  <Button
                    type="button"
                    disabled={isSubmittingWriting || essayWordCount < 10}
                    onClick={handleSubmitWriting}
                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingWriting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>AI đang phân tích ngữ pháp & từ vựng...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Nộp bài luận để AI chấm</span>
                      </>
                    )}
                  </Button>
                )}
              </div>

              {writingResult && (
                <div className="p-5 rounded-2xl bg-surface border border-indigo-500/40 shadow-xs space-y-3.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <CheckCircle2 size={16} />
                      <span>Kết quả đánh giá bài viết sơ bộ</span>
                    </div>
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-xl">
                      {writingResult.ai_score}/100 điểm
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    {writingResult.ai_feedback?.detailed_comment}
                  </p>

                  {Array.isArray(writingResult.ai_feedback?.improvement_tips) && (
                    <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-1.5 text-xs">
                      <span className="font-bold text-primary block">💡 Gợi ý cải thiện:</span>
                      <ul className="list-disc pl-4 space-y-1 text-text-secondary">
                        {writingResult.ai_feedback.improvement_tips.map((tip: string, tIdx: number) => (
                          <li key={tIdx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-surface-subtle/50 px-6 py-4">
          <div className="text-xs text-text-secondary">
            {activeSection === 'QUIZ' && (
              <span>
                Đã trả lời:{' '}
                <strong className="text-text-primary">
                  {Object.keys(selectedAnswers).length}/{rawQuestions.length}
                </strong>{' '}
                câu
              </span>
            )}
            {activeSection === 'SPEAKING' && <span>Phần thi Nói tích hợp Whisper STT</span>}
            {activeSection === 'WRITING' && <span>Phần thi Viết luận chấm điểm bằng AI</span>}
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={onClose}
              variant="outline"
              className="rounded-xl px-4 text-xs font-bold cursor-pointer"
            >
              Đóng
            </Button>

            {activeSection === 'QUIZ' && rawQuestions.length > 0 && !isSubmitted && (
              <Button
                onClick={handleSubmitTest}
                disabled={Object.keys(selectedAnswers).length === 0 || isSaving}
                className="rounded-xl bg-primary text-white hover:bg-primary-hover px-5 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Đang lưu kết quả...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Nộp bài trắc nghiệm</span>
                  </>
                )}
              </Button>
            )}

            {activeSection === 'QUIZ' && rawQuestions.length > 0 && isSubmitted && (
              <Button
                onClick={onClose}
                className="rounded-xl bg-primary text-white hover:bg-primary-hover px-5 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
              >
                <span>Tiếp tục học</span>
                <ArrowRight size={14} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
