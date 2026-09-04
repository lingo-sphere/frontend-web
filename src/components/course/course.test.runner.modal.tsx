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
  UploadCloud,
  FileAudio,
  History,
  Crown,
  Medal,
  Target,
  XCircle,
  CheckCircle,
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
  choices?: string[]
  correct_answer?: number | string
  correct_index?: number
  explanation?: string
  media_url?: string
}

export interface TestAttemptItem {
  attempt_id: string
  test_type?: string
  score: number
  correct_count?: number
  total_questions?: number
  is_passed: boolean
  submitted_at: string | Date
}

interface CourseTestRunnerModalProps {
  isOpen: boolean
  courseId: string
  chapter: Chapter | null
  testType: 'challenge' | 'exercise' | 'post-mini' | 'final-test'
  finalTestQuestions?: CourseTestQuestion[]
  finalTestAudioUrl?: string
  category?: string
  skills?: string[]
  highestScore?: number
  previousAttempts?: TestAttemptItem[]
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
  finalTestAudioUrl,
  category,
  skills,
  highestScore = 0,
  previousAttempts = [],
  onClose,
  onComplete,
}: CourseTestRunnerModalProps) {
  const is4Skills = useMemo(() => {
    if (category === 'TOEIC_4_SKILLS') return true
    if (Array.isArray(skills) && (skills.includes('SPEAKING') || skills.includes('WRITING'))) return true
    return false
  }, [category, skills])

  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [attemptsList, setAttemptsList] = useState<TestAttemptItem[]>(previousAttempts || [])
  const [bestScore, setBestScore] = useState<number>(highestScore || 0)
  const [isNewHighScore, setIsNewHighScore] = useState(false)

  useEffect(() => {
    if (previousAttempts) {
      setAttemptsList(previousAttempts)
    }
  }, [previousAttempts])

  useEffect(() => {
    if (highestScore !== undefined) {
      setBestScore(highestScore)
    }
  }, [highestScore])

  const [activeSection, setActiveSection] = useState<'QUIZ' | 'SPEAKING' | 'WRITING'>('QUIZ')

  useEffect(() => {
    if (!is4Skills && activeSection !== 'QUIZ') {
      setActiveSection('QUIZ')
    }
  }, [is4Skills, activeSection])

  const [speakingInputMode, setSpeakingInputMode] = useState<'RECORD' | 'UPLOAD'>('RECORD')
  const [uploadedAudioName, setUploadedAudioName] = useState<string | null>(null)
  const audioFileInputRef = useRef<HTMLInputElement>(null)

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
      study_focus?: string
      trap_identified?: string
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
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const [micVolume, setMicVolume] = useState<number>(0)

  const [essayText, setEssayText] = useState('')
  const [isSubmittingWriting, setIsSubmittingWriting] = useState(false)
  const [writingResult, setWritingResult] = useState<any>(null)

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {})
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
        (Array.isArray(chapter?.challenge_questions) && chapter.challenge_questions.length > 0 ? chapter.challenge_questions : null) ||
        (Array.isArray(chapter?.test_questions) && chapter.test_questions.length > 0 ? chapter.test_questions : null) ||
        (Array.isArray(chapter?.post_mini_questions) && chapter.post_mini_questions.length > 0 ? chapter.post_mini_questions : null) ||
        []
      return qList as CourseTestQuestion[]
    }
    return []
  }, [chapter, testType, finalTestQuestions])

  const testAudioUrl = useMemo(() => {
    if (testType === 'final-test') {
      if (finalTestAudioUrl) return finalTestAudioUrl
      return (
        chapter?.test_audio_url ||
        chapter?.challenge_audio_url ||
        chapter?.audio_url ||
        rawQuestions.find(
          (q) =>
            q.media_url &&
            (q.media_url.match(/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i) ||
              q.media_url.includes('audio') ||
              q.media_url.includes('quiz-audio'))
        )?.media_url ||
        ''
      )
    }
    return (
      chapter?.test_audio_url ||
      chapter?.challenge_audio_url ||
      chapter?.audio_url ||
      finalTestAudioUrl ||
      rawQuestions.find(
        (q) =>
          q.media_url &&
          (q.media_url.match(/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i) ||
            q.media_url.includes('audio') ||
            q.media_url.includes('quiz-audio'))
      )?.media_url ||
      ''
    )
  }, [testType, finalTestAudioUrl, chapter, rawQuestions])

  if (!isOpen) return null

  const passingScore =
    testType === 'challenge'
      ? chapter?.challengeTest?.passingScore || (chapter as any)?.challenge_passing_score || 80
      : testType === 'final-test'
      ? 70
      : 80

  const testTitle =
    testType === 'challenge'
      ? `Bài test thử thách cuối chương - ${chapter?.title || ''}`
      : testType === 'post-mini'
      ? `Bài kiểm tra cuối chương - ${chapter?.title || ''}`
      : testType === 'final-test'
      ? `Bài thi tốt nghiệp khóa học (Exit Test)`
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

    // Tự động kích hoạt Gia sư AI phân tích lý do sai & nội dung nên chú trọng học thêm
    if (wrongs.length > 0) {
      setIsLoadingAi(true)
      setShowAiDetails(true)
      courseService
        .explainTestMistakes(courseId, {
          test_title: chapter?.title || 'Bài kiểm tra',
          test_type: testType,
          wrong_questions: wrongs,
        })
        .then((res) => {
          if (res) {
            setAiExplanations(res)
          }
        })
        .catch((err) => {
          console.error('Lỗi khi tự động giải thích câu sai bằng AI:', err)
        })
        .finally(() => {
          setIsLoadingAi(false)
        })
    }

    if (scorePercent > bestScore) {
      setIsNewHighScore(true)
      setBestScore(scorePercent)
    }

    const optimisticAttempt: TestAttemptItem = {
      attempt_id: `att_${Date.now()}`,
      test_type: testType,
      score: scorePercent,
      correct_count: correct,
      total_questions: total,
      is_passed: isPassed,
      submitted_at: new Date(),
    }
    setAttemptsList((prev) => [optimisticAttempt, ...prev])

    setIsSaving(true)
    let backendResult: any = null
    try {
      if (testType === 'challenge' && chapter?.id) {
        backendResult = await courseService.submitModuleChallenge(courseId, String(chapter.id), {
          score: scorePercent,
          correct_count: correct,
          total_questions: total,
          passing_score: passingScore,
          challenge_attempt_id: `att_ch_${Date.now()}`,
          order_index: chapter?.order || 1,
        })
        if (backendResult?.message) {
          setProgressionNote(backendResult.message)
        }
        if (Array.isArray(backendResult?.attempts)) {
          setAttemptsList(backendResult.attempts)
        }
        if (typeof backendResult?.highest_score === 'number') {
          setBestScore(backendResult.highest_score)
        }
      } else if ((testType === 'post-mini' || testType === 'exercise') && chapter?.id) {
        backendResult = await courseService.submitModulePostMini(courseId, String(chapter.id), {
          score: scorePercent,
          correct_count: correct,
          total_questions: total,
          post_mini_attempt_id: `att_pm_${Date.now()}`,
          order_index: chapter?.order || 1,
        })
        if (backendResult?.progression_comparison) {
          const comp = backendResult.progression_comparison
          setProgressionNote(comp.comparison_note)
          setGrowthDiff({
            scoreDiff: comp.score_diff,
            percent: comp.percentage_improvement,
          })
        }
        if (Array.isArray(backendResult?.attempts)) {
          setAttemptsList(backendResult.attempts)
        }
        if (typeof backendResult?.highest_score === 'number') {
          setBestScore(backendResult.highest_score)
        }
        if (backendResult?.is_new_high_score) {
          setIsNewHighScore(true)
        }
      } else if (testType === 'final-test') {
        backendResult = await courseService.submitCourseFinalTest(courseId, {
          score: scorePercent,
          correct_count: correct,
          total_questions: total,
          final_test_attempt_id: `att_fin_${Date.now()}`,
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
        if (Array.isArray(backendResult?.final_test_attempts)) {
          setAttemptsList(backendResult.final_test_attempts)
        }
        if (typeof backendResult?.highest_score === 'number') {
          setBestScore(backendResult.highest_score)
        }
        if (backendResult?.is_new_high_score) {
          setIsNewHighScore(true)
        }
      }
    } catch (err) {
      console.warn('Could not save test to backend:', err)
    } finally {
      setIsSaving(false)
      onComplete?.(scorePercent, isPassed, backendResult)
    }
  }

  const handleExplainMistakes = async (overrideWrongs?: typeof wrongQuestionsList) => {
    const list = overrideWrongs || wrongQuestionsList
    if (list.length === 0) return
    setIsLoadingAi(true)
    setShowAiDetails(true)
    try {
      const res = await courseService.explainTestMistakes(courseId, {
        test_title: chapter?.title || 'Bài kiểm tra',
        test_type: testType,
        wrong_questions: list,
      })
      if (res) {
        setAiExplanations(res)
      }
    } catch (err) {
      console.error('Lỗi khi gọi Gia sư AI giải thích câu sai:', err)
    } finally {
      setIsLoadingAi(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = true
      }

      audioChunksRef.current = []

      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/aac',
      ].find((type) => MediaRecorder.isTypeSupported(type)) || ''

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const finalMime = recorder.mimeType || mimeType || 'audio/webm'
        const blob = new Blob(audioChunksRef.current, { type: finalMime })
        if (blob.size > 0) {
          setRecordedBlob(blob)
          setRecordedUrl(URL.createObjectURL(blob))
        } else {
          toast.warning('Bản thu âm bị rỗng hoặc chưa nhận tín hiệu âm thanh từ micro.')
        }
        stream.getTracks().forEach((t) => t.stop())
      }

      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (AudioCtx) {
          const audioCtx = new AudioCtx()
          audioContextRef.current = audioCtx
          const source = audioCtx.createMediaStreamSource(stream)
          const analyser = audioCtx.createAnalyser()
          analyser.fftSize = 256
          source.connect(analyser)
          analyserRef.current = analyser

          const dataArray = new Uint8Array(analyser.frequencyBinCount)
          const checkVolume = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray)
              let sum = 0
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i]
              }
              const avg = sum / dataArray.length
              setMicVolume(Math.min(100, Math.round((avg / 128) * 100)))
              animFrameRef.current = requestAnimationFrame(checkVolume)
            }
          }
          checkVolume()
        }
      } catch {}

      recorder.start(250)
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
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    setMicVolume(0)

    if (mediaRecorderRef.current && isRecording) {
      try {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.requestData()
        }
      } catch {}
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }

  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!/\.(mp3|wav|m4a|ogg|webm)$/i.test(file.name)) {
      toast.error('Chỉ chấp nhận file âm thanh (.mp3, .wav, .m4a, .ogg, .webm)')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Dung lượng file âm thanh không được vượt quá 50MB')
      return
    }

    if (isRecording) stopRecording()
    setRecordedBlob(file)
    setRecordedUrl(URL.createObjectURL(file))
    setUploadedAudioName(file.name)
    setRecordingSeconds(0)
    setSpeakingResult(null)
    toast.success(`Đã chọn file ghi âm: ${file.name}`)
  }

  const resetRecording = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    setMicVolume(0)
    if (isRecording) stopRecording()
    setRecordedBlob(null)
    setRecordedUrl(null)
    setUploadedAudioName(null)
    setRecordingSeconds(0)
    setSpeakingResult(null)
    if (audioFileInputRef.current) audioFileInputRef.current.value = ''
  }

  const handleSubmitSpeaking = async () => {
    if (!recordedBlob) return
    setIsSubmittingSpeaking(true)
    try {
      let uploadedAudioUrl = 'https://res.lingosphere.com/audio/sample_speaking.mp3'
      const uploadFile = recordedBlob instanceof File
        ? recordedBlob
        : new File([recordedBlob], `speaking_${Date.now()}.webm`, {
            type: recordedBlob.type || 'audio/webm',
          })
      try {
        const uploadRes = await api.upload<{ file_url: string }>('/media/upload', uploadFile, {
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
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs font-black shadow-2xs">
              <Crown size={14} className="text-amber-500 shrink-0" />
              <span>Điểm cao nhất: {bestScore > 0 ? `${bestScore}%` : 'Chưa có'}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-primary/40 text-text-secondary hover:text-text-primary text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Xem lại lịch sử các lần làm bài"
            >
              <History size={14} className="text-primary shrink-0" />
              <span className="hidden sm:inline">Lịch sử</span>
              <span className="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px] font-black">
                {attemptsList.length}
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {is4Skills && (
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
        )}

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
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-extrabold">
                                {scoreResult.isPassed
                                  ? testType === 'challenge'
                                    ? '🎉 Xuất sắc! Bạn đã vượt qua bài test thử thách của chương!'
                                    : testType === 'final-test'
                                    ? '🎉 Chúc mừng bạn đã hoàn thành bài thi tốt nghiệp cuối khóa!'
                                    : '🎉 Chúc mừng! Bạn đã hoàn thành bài test!'
                                  : testType === 'challenge'
                                  ? `⚡ Chưa đạt yêu cầu để mở khóa chương sau (Cần tối thiểu ${passingScore}%)`
                                  : '⚡ Chưa đạt điểm chuẩn!'}
                              </h4>
                              {isNewHighScore && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                                  <Crown size={12} /> Kỷ lục mới!
                                </span>
                              )}
                            </div>
                            <p className="text-xs opacity-90 mt-0.5">
                              Lần thi này: Đúng {scoreResult.correctCount}/{scoreResult.totalQuestions} câu (
                              <strong>{scoreResult.score}%</strong>) • Điểm yêu cầu: <strong>{passingScore}%</strong> • 👑 Điểm cao nhất:{' '}
                              <strong>{bestScore}%</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          <Button
                            type="button"
                            onClick={() => setShowHistoryModal(true)}
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-border hover:bg-surface text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <History size={13} className="text-primary" />
                            <span>Lịch sử ({attemptsList.length})</span>
                          </Button>

                          <Button
                            onClick={handleRetry}
                            variant="outline"
                            size="sm"
                            className={`rounded-xl shrink-0 flex items-center gap-1.5 cursor-pointer text-xs font-bold ${
                              scoreResult.isPassed
                                ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10'
                                : 'border-amber-500/60 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 ring-1 ring-amber-500/30'
                            }`}
                          >
                            <RotateCcw size={14} />
                            <span>{scoreResult.isPassed ? 'Luyện tập lại' : 'Làm lại thử thách ngay'}</span>
                          </Button>
                        </div>
                      </div>

                      {isNewHighScore && (
                        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/5 border border-amber-500/30 flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs shrink-0">
                            <Crown size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-extrabold text-amber-900 dark:text-amber-200">
                              Kỷ lục mới! Điểm số cao nhất từ trước đến nay!
                            </h5>
                            <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                              Bạn đã thiết lập cột mốc điểm cao nhất mới: <strong>{bestScore}%</strong>. Điểm kỷ lục này đã được cập nhật vào hồ sơ khóa học của bạn.
                            </p>
                          </div>
                        </div>
                      )}

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
                        <div className="p-4 rounded-2xl bg-purple-50/90 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
                                <Bot size={18} />
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center gap-2">
                                  <span>Gia sư AI: Giải thích lỗi sai & Hướng dẫn học tập</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200/80 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 font-semibold">
                                    {wrongQuestionsList.length} câu chưa đúng
                                  </span>
                                </h5>
                                <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-0.5">
                                  {isLoadingAi
                                    ? 'Đang phân tích nguyên nhân sai và đề xuất nội dung bạn nên chú trọng học thêm...'
                                    : aiExplanations?.summary || 'Hệ thống đã phân tích chi tiết lỗi sai và chủ điểm kiến thức cần ôn tập.'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                onClick={() => handleExplainMistakes()}
                                disabled={isLoadingAi}
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-xs font-semibold cursor-pointer h-8 px-2.5"
                                title="Phân tích lại bằng AI"
                              >
                                <RotateCcw size={12} className={isLoadingAi ? 'animate-spin' : ''} />
                                <span className="hidden sm:inline">Phân tích lại</span>
                              </Button>
                              {aiExplanations && (
                                <Button
                                  onClick={() => setShowAiDetails(!showAiDetails)}
                                  variant="ghost"
                                  size="sm"
                                  className="rounded-xl text-purple-700 dark:text-purple-300 text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer h-8 px-2.5"
                                >
                                  <span>{showAiDetails ? 'Thu gọn' : 'Xem toàn bộ'}</span>
                                  {showAiDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Đang gọi AI */}
                          {isLoadingAi && !aiExplanations && (
                            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-purple-200/60 text-xs text-purple-800 dark:text-purple-300 animate-pulse">
                              <Loader2 size={15} className="animate-spin text-purple-600 dark:text-purple-400 shrink-0" />
                              <span>Gia sư AI đang đối chiếu đáp án, bóc tách nguyên nhân sai và đề xuất các chủ điểm bạn nên chú trọng học thêm...</span>
                            </div>
                          )}

                          {/* Nội dung tư vấn từ AI */}
                          {aiExplanations && (
                            <div className="space-y-3 animate-in fade-in duration-200">
                              {/* Lời khuyên tổng thể: Nên chú trọng học thêm chỗ nào */}
                              {aiExplanations.overall_advice && (
                                <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-100/90 to-indigo-100/90 dark:from-purple-900/40 dark:to-indigo-900/40 border border-purple-300/80 dark:border-purple-700/60 text-xs space-y-1.5 shadow-xs">
                                  <div className="flex items-center gap-1.5 font-bold text-purple-950 dark:text-purple-100">
                                    <Target size={15} className="text-purple-600 dark:text-purple-400 shrink-0" />
                                    <span>🎯 Nên chú trọng học thêm chỗ nào (Định hướng từ AI):</span>
                                  </div>
                                  <p className="text-[12px] text-purple-950 dark:text-purple-200 leading-relaxed font-medium pl-5">
                                    {aiExplanations.overall_advice}
                                  </p>
                                </div>
                              )}

                              {showAiDetails && (
                                <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/40 space-y-2.5">
                                  <span className="text-[11px] font-bold text-purple-900 dark:text-purple-300 block uppercase tracking-wider">
                                    Danh sách chi tiết các câu sai & Chủ điểm kiến thức:
                                  </span>
                                  {aiExplanations.explanations.map((item, exIdx) => (
                                    <div
                                      key={exIdx}
                                      className="p-3.5 rounded-xl bg-white/95 dark:bg-slate-900/85 border border-purple-200/70 dark:border-purple-800/50 space-y-2 text-xs shadow-xs"
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-text-primary">
                                        <span className="text-purple-950 dark:text-purple-200">
                                          Câu {item.question_number}: {item.question_text}
                                        </span>
                                        {item.recommended_topic && (
                                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/70 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700 flex items-center gap-1">
                                            <Target size={10} className="text-purple-600 dark:text-purple-400" />
                                            <span>Chủ điểm: {item.recommended_topic}</span>
                                          </span>
                                        )}
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                        <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/50 text-rose-800 dark:text-rose-200 space-y-0.5">
                                          <div className="flex items-center gap-1 font-bold text-rose-700 dark:text-rose-300">
                                            <XCircle size={12} className="shrink-0" />
                                            <span>❌ Bạn đã chọn: {item.user_selected}</span>
                                          </div>
                                          <p className="leading-relaxed opacity-95 pl-4">{item.why_wrong}</p>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200 space-y-0.5">
                                          <div className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300">
                                            <CheckCircle size={12} className="shrink-0" />
                                            <span>✅ Đáp án đúng: {item.correct_answer}</span>
                                          </div>
                                          <p className="leading-relaxed opacity-95 pl-4">{item.why_correct}</p>
                                        </div>
                                      </div>

                                      {/* Nên chú trọng học thêm chỗ nào */}
                                      {(item.study_focus || item.recommended_topic) && (
                                        <div className="p-2.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 text-indigo-950 dark:text-indigo-200 text-[11px] leading-relaxed flex items-start gap-1.5">
                                          <Target size={12} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                                          <div>
                                            <strong>Nên chú trọng học thêm: </strong>
                                            {item.study_focus || `Cần ôn lại kỹ chủ điểm "${item.recommended_topic}" và luyện tập thêm bài tập liên quan.`}
                                          </div>
                                        </div>
                                      )}

                                      {item.trap_identified && (
                                        <div className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 text-amber-900 dark:text-amber-200 text-[11px] flex items-center gap-1.5">
                                          <span className="font-bold">⚠️ Bẫy cần tránh:</span>
                                          <span>{item.trap_identified}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {Boolean(testAudioUrl) && (
                    <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center gap-3 shadow-xs">
                      <div className="p-2 rounded-xl bg-indigo-500 text-white shadow-xs shrink-0">
                        <Volume2 size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 block mb-1">
                          Audio bài thi Nghe (Listening) • Phát âm thanh toàn bộ đề:
                        </span>
                        <audio
                          controls
                          src={testAudioUrl}
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
                            {q.media_url &&
                              (q.media_url.match(/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i) ||
                              q.media_url.includes('audio') ||
                              q.media_url.includes('quiz-audio') ? (
                                q.media_url !== testAudioUrl ? (
                                  <div className="mt-2.5 max-w-md rounded-xl overflow-hidden border border-border">
                                    <audio controls src={q.media_url} className="w-full" />
                                  </div>
                                ) : null
                              ) : (
                                <div className="mt-2.5 max-w-md rounded-xl overflow-hidden border border-border">
                                  <img
                                    src={q.media_url}
                                    alt={`Question ${qIdx + 1}`}
                                    className="w-full object-cover max-h-56"
                                  />
                                </div>
                              ))}
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

                        {isSubmitted && (() => {
                          const isWrong = chosenIdx !== correctIdx
                          const matchingAiExp = aiExplanations?.explanations?.find(
                            (e) => e.question_number === qIdx + 1
                          )

                          if (isWrong) {
                            return (
                              <div className="mt-4 ml-0 sm:ml-9 p-4 rounded-2xl bg-purple-50/90 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 shadow-xs space-y-3 animate-in fade-in duration-200">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-200/60 dark:border-purple-800/40 pb-2.5">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-950 dark:text-purple-200">
                                    <Bot size={15} className="text-purple-600 dark:text-purple-400" />
                                    <span>Gia sư AI: Phân tích câu sai & Định hướng học tập</span>
                                  </div>
                                  {(matchingAiExp?.recommended_topic || chapter?.title) && (
                                    <span className="text-[10.5px] px-2.5 py-0.5 rounded-full bg-purple-200/80 dark:bg-purple-900/70 text-purple-900 dark:text-purple-200 font-semibold flex items-center gap-1">
                                      <Target size={11} className="text-purple-600 dark:text-purple-400" />
                                      <span>Chủ điểm: {matchingAiExp?.recommended_topic || chapter?.title}</span>
                                    </span>
                                  )}
                                </div>

                                {isLoadingAi && !matchingAiExp ? (
                                  <div className="flex items-center gap-2 py-2 text-xs text-purple-700 dark:text-purple-300 animate-pulse">
                                    <Loader2 size={14} className="animate-spin text-purple-600 dark:text-purple-400 shrink-0" />
                                    <span>Gia sư AI đang phân tích lý do sai và đề xuất nội dung bạn nên chú trọng học thêm...</span>
                                  </div>
                                ) : (
                                  <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                                      {/* TẠI SAO SAI */}
                                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/50 space-y-1">
                                        <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300">
                                          <XCircle size={13} className="shrink-0" />
                                          <span>❌ Tại sao bạn chọn sai:</span>
                                        </div>
                                        <p className="text-[11.5px] text-rose-950 dark:text-rose-200 leading-relaxed font-medium pl-4.5">
                                          {matchingAiExp?.why_wrong || `Bạn đã chọn "${chosenIdx !== undefined ? options[chosenIdx] : 'Chưa chọn'}". Lựa chọn này chưa đúng với quy tắc ngữ pháp hoặc ngữ cảnh của câu.`}
                                        </p>
                                      </div>

                                      {/* TẠI SAO ĐÚNG */}
                                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 space-y-1">
                                        <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                                          <CheckCircle size={13} className="shrink-0" />
                                          <span>✅ Tại sao đáp án đúng:</span>
                                        </div>
                                        <p className="text-[11.5px] text-emerald-950 dark:text-emerald-200 leading-relaxed font-medium pl-4.5">
                                          {matchingAiExp?.why_correct || (q.explanation ? q.explanation : `Đáp án đúng là "${options[correctIdx]}". Cần lưu ý các dấu hiệu nhận biết then chốt trong câu.`)}
                                        </p>
                                      </div>
                                    </div>

                                    {/* NÊN CHÚ TRỌNG HỌC THÊM CHỖ NÀO */}
                                    <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50/90 to-purple-50/90 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/70 dark:border-indigo-800/60 space-y-1">
                                      <div className="flex items-center gap-1.5 font-bold text-indigo-950 dark:text-indigo-200 text-xs">
                                        <Target size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                                        <span>🎯 Nên chú trọng học thêm chỗ nào:</span>
                                      </div>
                                      <p className="text-[11.5px] text-indigo-950 dark:text-indigo-200 leading-relaxed pl-5 font-semibold">
                                        {matchingAiExp?.study_focus || (
                                          matchingAiExp?.recommended_topic
                                            ? `Bạn nên chú trọng học thêm phần "${matchingAiExp.recommended_topic}". Hãy ôn lại các dạng bài tập tương tự để nắm chắc bản chất.`
                                            : `Bạn nên chú trọng học thêm các bài học trong chương "${chapter?.title || 'này'}", ôn lại từ vựng và cấu trúc tương ứng.`
                                        )}
                                      </p>
                                    </div>

                                    {matchingAiExp?.trap_identified && (
                                      <div className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                                        <span className="font-bold shrink-0">⚠️ Cạm bẫy cần tránh:</span>
                                        <span className="opacity-95">{matchingAiExp.trap_identified}</span>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )
                          }

                          if (q.explanation) {
                            return (
                              <div className="mt-3.5 ml-9 p-3 rounded-xl bg-surface-subtle/80 border border-border/80 text-xs text-text-secondary">
                                <span className="font-bold text-primary">💡 Giải thích: </span>
                                {q.explanation}
                              </div>
                            )
                          }

                          return null
                        })()}
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

              <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-surface-subtle/80 border border-border/80 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSpeakingInputMode('RECORD')
                    if (!recordedUrl) resetRecording()
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    speakingInputMode === 'RECORD'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Mic size={13} />
                  <span>Thu âm trực tiếp</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSpeakingInputMode('UPLOAD')
                    if (!recordedUrl) resetRecording()
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    speakingInputMode === 'UPLOAD'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <UploadCloud size={13} />
                  <span>Tải file có sẵn</span>
                </button>
              </div>

              <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-border bg-surface-subtle/40 space-y-4">
                <input
                  ref={audioFileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a,.webm"
                  onChange={handleAudioFileSelect}
                  className="hidden"
                />

                {!isRecording && !recordedUrl && speakingInputMode === 'RECORD' && (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex flex-col items-center gap-2 p-6 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 transition-all transform hover:scale-105 cursor-pointer"
                  >
                    <Mic className="h-8 w-8" />
                    <span className="text-xs font-black">Bấm để thu âm</span>
                  </button>
                )}

                {!isRecording && !recordedUrl && speakingInputMode === 'UPLOAD' && (
                  <button
                    type="button"
                    onClick={() => audioFileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2.5 p-6 rounded-3xl border-2 border-dashed border-amber-400 bg-amber-50/50 hover:bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700/60 dark:hover:bg-amber-950/40 text-amber-900 dark:text-amber-200 transition-all cursor-pointer"
                  >
                    <FileAudio className="h-9 w-9 text-amber-500" />
                    <div className="text-center">
                      <span className="text-xs font-bold block">Bấm để chọn file ghi âm từ thiết bị</span>
                      <span className="text-[11px] text-amber-700/80 dark:text-amber-300/80 block mt-0.5">Hỗ trợ .mp3, .wav, .m4a, .ogg, .webm (tối đa 50MB)</span>
                    </div>
                  </button>
                )}

                {isRecording && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-rose-500 font-black text-sm animate-pulse">
                      <div className="h-3 w-3 rounded-full bg-rose-500" />
                      <span>Đang thu âm: {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 w-full max-w-xs">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-75"
                          style={{ width: `${Math.max(6, micVolume)}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {micVolume > 6 ? `Tín hiệu âm thanh micro: ${micVolume}% (Tốt)` : 'Hãy nói vào micro...'}
                      </span>
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
                      <span>{uploadedAudioName ? `Tệp đã chọn: ${uploadedAudioName}` : `Bản thu của bạn (${recordingSeconds}s):`}</span>
                      <button
                        type="button"
                        onClick={resetRecording}
                        className="flex items-center gap-1 text-rose-500 hover:underline cursor-pointer"
                      >
                        <RotateCcw size={12} />
                        <span>{uploadedAudioName ? 'Đổi tệp khác' : 'Thu lại'}</span>
                      </button>
                    </div>

                    <audio
                      key={recordedUrl}
                      controls
                      src={recordedUrl}
                      className="w-full h-10 rounded-xl"
                      preload="auto"
                    />

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

      {showHistoryModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="flex flex-col w-full max-w-xl max-h-[85vh] rounded-3xl bg-surface border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border bg-surface-subtle/70 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-xs">
                  <History size={20} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-text-primary">Lịch sử làm bài kiểm tra</h4>
                  <p className="text-xs text-text-secondary">
                    {testTitle} • Tổng cộng {attemptsList.length} lượt nộp bài
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 p-4 sm:p-5 bg-surface-subtle/30 border-b border-border">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 mb-0.5">
                  <Crown size={13} className="text-amber-500 shrink-0" />
                  <span>Điểm cao nhất</span>
                </div>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                  {bestScore > 0 ? `${bestScore}%` : '--'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1 text-[11px] font-bold text-primary mb-0.5">
                  <RotateCcw size={13} className="shrink-0" />
                  <span>Số lần làm</span>
                </div>
                <span className="text-xl font-black text-primary">
                  {attemptsList.length}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mb-0.5">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  <span>Lượt đạt chuẩn</span>
                </div>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {attemptsList.filter((a) => a.is_passed || a.score >= passingScore).length}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {attemptsList.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-surface-subtle border border-border mx-auto flex items-center justify-center text-text-tertiary">
                    <FileQuestion size={28} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-text-primary">Chưa có lượt làm bài nào</h5>
                    <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto">
                      Hãy hoàn thành bài kiểm tra lần đầu tiên để hệ thống tự động ghi nhận điểm và xây dựng lịch sử của bạn nhé.
                    </p>
                  </div>
                </div>
              ) : (
                attemptsList
                  .slice()
                  .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
                  .map((att, idx) => {
                    const isPassedAttempt = att.is_passed || att.score >= passingScore
                    const isRecord = bestScore > 0 && att.score === bestScore
                    const attemptDate = new Date(att.submitted_at)
                    const formattedDate = !isNaN(attemptDate.getTime())
                      ? attemptDate.toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Vừa xong'

                    return (
                      <div
                        key={att.attempt_id || idx}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isRecord
                            ? 'bg-amber-500/5 border-amber-500/40 shadow-xs'
                            : 'bg-surface border-border hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black text-xs shadow-xs ${
                              isRecord
                                ? 'bg-amber-500 text-white shadow-amber-500/30'
                                : isPassedAttempt
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {isRecord ? <Crown size={18} /> : `#${attemptsList.length - idx}`}
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-text-primary">
                                Lần thi #{attemptsList.length - idx}
                              </span>
                              {isRecord && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                                  <Crown size={10} className="text-amber-500" />
                                  Kỷ lục cao nhất
                                </span>
                              )}
                              {isPassedAttempt ? (
                                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                                  Đạt chuẩn
                                </span>
                              ) : (
                                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400">
                                  Chưa đạt
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
                              <span className="flex items-center gap-1">
                                <Clock size={11} /> {formattedDate}
                              </span>
                              {typeof att.correct_count === 'number' && att.correct_count >= 0 && (
                                <span>
                                  • Đúng {att.correct_count}/{att.total_questions || rawQuestions.length} câu
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`text-lg font-black ${
                              isRecord
                                ? 'text-amber-600 dark:text-amber-400'
                                : isPassedAttempt
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-text-secondary'
                            }`}
                          >
                            {att.score}%
                          </span>
                        </div>
                      </div>
                    )
                  })
              )}
            </div>

            <div className="border-t border-border bg-surface-subtle/50 px-6 py-3.5 flex justify-end">
              <Button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="rounded-xl px-5 text-xs font-bold cursor-pointer"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
