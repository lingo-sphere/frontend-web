// Hook quản lý trạng thái bài tập luyện viết, lưu bản nháp và gửi chấm điểm bài luận AI.

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams, useSearchParams } from '@/lib/navigation'
import { useApp } from '@/contexts/app.context'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { practiceService, type BackendWritingExercise } from '@/features/practice/services/practice.service'
import { useWritingExercisesQuery, useWritingExerciseByIdQuery, useWritingRecommendationsQuery } from '@/features/practice/hooks/use.practice.query'
import { practiceKeys } from '@/features/practice/keys/practice.keys'
import { toast } from '@/store/toast.store'
import type {
  WritingExercise,
  WritingSubmission,
  WritingStats,
  WritingProgress,
  WritingLevel,
  DifficultyLevel,
  ExerciseType,
  WritingSkillType,
  WritingRecommendation,
} from '@/features/practice/types/writing'

export type WritingView = 'home' | 'exercises' | 'detail' | 'workspace' | 'result' | 'history'

function toWritingLevel(val?: string, difficulty?: string, cefr?: string): WritingLevel {
  const valid: WritingLevel[] = ['BASIC', 'INTERMEDIATE', 'ADVANCED']
  if (val && (valid as string[]).includes(val)) {
    return val as WritingLevel
  }
  if (difficulty === 'EASY' || cefr === 'A2') return 'BASIC'
  if (difficulty === 'HARD' || cefr === 'B2' || cefr === 'C1') return 'ADVANCED'
  return 'INTERMEDIATE'
}

function toDifficultyLevel(val?: string): DifficultyLevel {
  const valid: DifficultyLevel[] = ['EASY', 'MEDIUM', 'HARD']
  if (val && (valid as string[]).includes(val)) {
    return val as DifficultyLevel
  }
  return 'MEDIUM'
}

function toExerciseType(val?: string): ExerciseType {
  const valid: ExerciseType[] = [
    'DESCRIBE_PICTURE',
    'WRITE_EMAIL',
    'EXPRESS_OPINION',
    'SENTENCE_ARRANGEMENT',
    'SENTENCE_COMPLETION',
    'PARAPHRASING',
    'KEYWORD_WRITING',
    'TOPIC_WRITING',
    'DIARY',
  ]
  if (val && (valid as string[]).includes(val)) {
    return val as ExerciseType
  }
  return 'DESCRIBE_PICTURE'
}

function mapBackendToWritingExercise(item: any): WritingExercise {
  return {
    id: item._id,
    code: item.code,
    grading_standard: item.grading_standard || 'PRACTICAL', task_requirements: item.task_requirements || [], image_description: item.image_description || '',
    title: item.title,
    title_vi: item.title_vi || item.title,
    description: item.description || '',
    description_vi: item.description_vi || item.description || '',
    domain: 'WRITING',
    exercise_type: toExerciseType(item.exercise_type),
    writing_level: toWritingLevel(item.writing_level, item.difficulty_level, item.cefr_level),
    toeic_part: item.toeic_part || 1,
    prompt_en: item.prompt_en || item.prompt_text || item.title,
    prompt_vi: item.prompt_vi || item.prompt_text_vi || item.title_vi,
    instructions: item.instruction_vi || item.instruction_en || item.instructions || item.description,
    prompt_image_id: item.prompt_image_id || item.image_media_id || item.media_id,
    media_id: item.media_id || item.prompt_image_id,
    reference_media_id: item.reference_media_id,
    directions: item.directions || [],
    directions_vi: item.directions_vi || [],
    source_text: item.source_text || item.incoming_email?.body || '',
    source_text_vi: item.source_text_vi || '',
    incoming_email: item.incoming_email || (item.source_text ? { body: item.source_text } : undefined),
    background_context: item.background_context,
    background_context_vi: item.background_context_vi,
    guiding_questions: item.guiding_questions || [],
    guiding_questions_vi: item.guiding_questions_vi || [],
    keywords: item.keywords || [],
    min_words: item.min_words ?? 45,
    max_words: item.max_words ?? 85,
    difficulty_level: toDifficultyLevel(item.difficulty_level),
    cefr_level: item.cefr_level || 'B1',
    total_attempts: typeof item.total_attempts === 'number' ? item.total_attempts : 0,
    avg_score: typeof item.avg_score === 'number' ? item.avg_score : undefined,
    status: 'PUBLISHED',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function mapBackendToSubmission(sub: any): WritingSubmission {
  const aiEval = sub.ai_evaluation || {}
  return {
    writing_srs_version: sub.writing_srs_version, writing_srs_summary: sub.writing_srs_summary,
    grading_standard: sub.grading_standard, grading_version: sub.grading_version, raw_score: sub.raw_score, max_score: sub.max_score, grading_model: sub.grading_model,
    id: sub._id || sub.id,
    user_id: sub.user_id,
    exercise_id: typeof sub.exercise_id === 'object' ? sub.exercise_id?._id : sub.exercise_id,
    content: sub.content || '',
    word_count: sub.word_count || 0,
    version_number: sub.version_number || 1,
    drafts: [],
    is_draft: sub.is_draft || false,
    overall_score: sub.overall_score ?? 0,
    task_achievement_score: sub.task_achievement_score,
    coherence_score: sub.coherence_score,
    lexical_resource_score: sub.lexical_resource_score,
    grammatical_accuracy_score: sub.grammatical_accuracy_score,
    naturalness_score: sub.naturalness_score,
    register_score: sub.register_score,
    parent_submission_id: sub.parent_submission_id,
    scaffold_blocks: sub.scaffold_blocks || [],
    writing_time_seconds: sub.writing_time_seconds || 0,
    domain: 'WRITING',
    status: sub.status || 'COMPLETED',
    submitted_at: sub.submitted_at || sub.created_at,
    created_at: sub.created_at,
    ai_evaluation: {
      ...aiEval,
      overall_feedback: aiEval.detailed_feedback || aiEval.overall_feedback || '',
      errors: (aiEval.grammar_errors || []).map((err: any) => ({
        type: ['GRAMMAR', 'SPELLING', 'PUNCTUATION', 'VOCABULARY', 'STYLE', 'FORMAT'].includes(err.category) ? err.category : err.type || 'GRAMMAR',
        original: err.original || '',
        correction: err.corrected || err.correction || '',
        explanation: err.explanation || '',
      })),
      suggested_version: aiEval.improved_version || aiEval.suggested_version || sub.content,
      overall_strengths: aiEval.strengths?.join(' ') || aiEval.overall_strengths,
      overall_weaknesses: aiEval.weaknesses?.join(' ') || aiEval.overall_weaknesses,
      improvement_tips: aiEval.actionable_tips || aiEval.improvement_tips || [],
    },
  }
}

export function useWritingWorkspace() {
  const queryClient = useQueryClient()
  const { showAction } = useApp()
  const navigate = useNavigate()
  const params = useParams()
  const searchParams = useSearchParams()
  const reviewSessionId = searchParams.get('review_session') || undefined
  const rawPath = params?.slug || params?.['*']
  const path = Array.isArray(rawPath) ? rawPath.join('/') : rawPath || ''

  // Parse view từ URL
  const initialView = useMemo((): WritingView => {
    if (path.startsWith('exercises')) return 'exercises'
    if (path.startsWith('exercise/')) return 'detail'
    if (path.startsWith('workspace/')) return 'workspace'
    if (path.startsWith('result/')) return 'result'
    if (path.startsWith('history')) return 'history'
    return 'home'
  }, [path])

  const [currentView, setCurrentView] = useState<WritingView>(initialView)
  const [selectedExercise, setSelectedExercise] = useState<WritingExercise | null>(null)
  const [currentSubmission, setCurrentSubmission] = useState<WritingSubmission | null>(null)
  const [scoreGroups, setScoreGroups] = useState<NonNullable<WritingStats['score_groups']>>([])
  const [historySubmissions, setHistorySubmissions] = useState<WritingSubmission[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  // Extract exercise ID từ URL (CHỈ cho exercise/ và workspace/, KHÔNG cho result/)
  const exerciseIdFromUrl = useMemo((): string | null => {
    if (!path) return null
    // Chỉ match exercise/ và workspace/, KHÔNG match result/
    const match = path.match(/^(?:exercise|workspace)\/([^\/]+)/)
    return match?.[1] || null
  }, [path])

  // Extract submission ID từ URL (cho result view)
  const submissionIdFromUrl = useMemo((): string | null => {
    if (!path) return null
    const match = path.match(/^result\/([^\/]+)/)
    return match?.[1] || null
  }, [path])

  // Fetch exercise list
  const { data: rawWritingExercises = [], isLoading: isLoadingExercises } = useWritingExercisesQuery()

  // Exercise list mapped
  const exerciseList: WritingExercise[] = useMemo(() => {
    return rawWritingExercises.map(mapBackendToWritingExercise)
  }, [rawWritingExercises])

  // Fetch single exercise by ID từ URL (khi direct access)
  const { data: fetchedExerciseById, isLoading: isLoadingExerciseById, error: exerciseError } = useWritingExerciseByIdQuery(exerciseIdFromUrl)

  // Initialize: load exercise/submission từ URL params
  useEffect(() => {
    if (!isInitialized) return

    // Case 1: Direct access với exercise ID
    if (exerciseIdFromUrl && !selectedExercise) {
      // Thử tìm trong exerciseList trước
      const found = exerciseList.find((ex) => ex.id === exerciseIdFromUrl)
      if (found) {
        setSelectedExercise(found)
        return
      }
      // Nếu không có trong list, sẽ dùng fetchedExerciseById từ query
    }

    // Case 2: Direct access với submission ID (result view)
    if (currentView === 'result' && submissionIdFromUrl && !currentSubmission) {
      // Fetch submission từ API
      practiceService.getWritingSubmissionById(submissionIdFromUrl)
        .then((res: any) => {
          const sub = mapBackendToSubmission(res)
          setCurrentSubmission(sub)
          // Tìm exercise tương ứng
          const ex = exerciseList.find((e) => e.id === sub.exercise_id)
          if (ex) setSelectedExercise(ex)
        })
        .catch((err) => {
          console.error('[useWritingWorkspace] Error fetching submission:', err)
          setInitError('Không thể tải kết quả bài làm')
        })
    }
  }, [isInitialized, exerciseIdFromUrl, submissionIdFromUrl, currentView, selectedExercise, currentSubmission, exerciseList])

  // Set selectedExercise khi fetchedExerciseById available
  useEffect(() => {
    if (fetchedExerciseById && !selectedExercise) {
      const mapped = mapBackendToWritingExercise(fetchedExerciseById)
      setSelectedExercise(mapped)
    }
  }, [fetchedExerciseById, selectedExercise])

  // Set error nếu fetch failed
  useEffect(() => {
    if (exerciseError && exerciseIdFromUrl) {
      setInitError('Không thể tải bài tập. Vui lòng thử lại.')
    }
  }, [exerciseError, exerciseIdFromUrl])

  // Load submissions history
  useEffect(() => {
    practiceService.getMyWritingSubmissions()
      .then((res: any) => {
        setScoreGroups(res?.score_groups || [])
        const items = res?.items || res?.data?.items || (Array.isArray(res) ? res : [])
        if (Array.isArray(items) && items.length > 0) {
          const mapped = items.map(mapBackendToSubmission)
          setHistorySubmissions(mapped)
        }
      })
      .catch((err: unknown) => {
        console.warn('[useWritingWorkspace] Could not load submissions history:', err)
      })
  }, [])

  // Mark as initialized sau khi exercise list loaded
  useEffect(() => {
    if (!isLoadingExercises && !isInitialized) {
      setIsInitialized(true)
    }
  }, [isLoadingExercises, isInitialized])

  // Draft state
  const [draftContent, setDraftContent] = useState<string>('')
  const [draftVersion, setDraftVersion] = useState<number>(1)
  const [timeSeconds, setTimeSeconds] = useState<number>(10 * 60) // Default 10 phút

  // Sync selectedExercise khi exerciseList load xong
  useEffect(() => {
    if (isInitialized && exerciseIdFromUrl && !selectedExercise && exerciseList.length > 0) {
      const found = exerciseList.find((ex) => ex.id === exerciseIdFromUrl)
      if (found) {
        setSelectedExercise(found)
      }
    }
  }, [isInitialized, exerciseIdFromUrl, selectedExercise, exerciseList])

  // TOEIC task bands and practical performance are not averaged together.
  const stats: WritingStats = useMemo(() => {
    const total = historySubmissions.length

    const practical = historySubmissions.filter(submission => submission.grading_standard === 'PRACTICAL' && submission.grading_version === 'writing-v2')
    const average = (selector: (s: WritingSubmission) => number | null | undefined) => {
      const values = practical.map(selector).filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
      if (!values.length) return null
      const raw = values.reduce((a, b) => a + b, 0) / values.length
      const clamped = Math.max(0, Math.min(100, raw))
      return Math.round(clamped * 10) / 10
    }

    const avgScore = average((s) => s.overall_score ?? 0)
    const avgGrammar = average((s) => s.grammatical_accuracy_score)
    const avgVocab = average((s) => s.lexical_resource_score)
    const avgTask = average((s) => s.task_achievement_score)
    const avgCoherence = average((s) => s.coherence_score)
    const avgNaturalness = average((s) => s.naturalness_score)
    const avgRegister = average((s) => s.register_score)

    const avgTime =
      total > 0
        ? Math.round(
          historySubmissions.reduce((sum, s) => sum + (s.writing_time_seconds || 0), 0) /
          total /
          60
        )
        : 0

    return {
      practical_submissions: practical.length, score_groups: scoreGroups,
      total_submissions: total,
      average_score: avgScore,
      total_words_written: historySubmissions.reduce((sum, s) => sum + (s.word_count || 0), 0),
      average_grammar_accuracy: avgGrammar,
      average_vocabulary_usage: avgVocab,
      average_writing_time_minutes: avgTime,
      score_breakdown: {
        task_achievement: avgTask,
        coherence: avgCoherence,
        vocabulary: avgVocab,
        grammar: avgGrammar,
        naturalness: avgNaturalness,
        register: avgRegister,
      },
    }
  }, [historySubmissions, scoreGroups])

  // Get user ID from auth store
  const userId = useAuthStore((state) => state.user?.user_id)

  // Fetch recommendations from API
  const { data: recommendationData } = useWritingRecommendationsQuery(userId || null, 4)

  // Derive recommendations from API response
  const recommendations: WritingRecommendation[] = useMemo(() => {
    return recommendationData?.recommendations || []
  }, [recommendationData])

  // Determine weakest skill from stats
  const weakestSkill: WritingSkillType = useMemo(() => {
    const skills: { skill: WritingSkillType; score: number | null }[] = [
      { skill: 'grammatical_accuracy', score: stats.score_breakdown.grammar },
      { skill: 'lexical_resource', score: stats.score_breakdown.vocabulary },
      { skill: 'coherence', score: stats.score_breakdown.coherence },
      { skill: 'task_achievement', score: stats.score_breakdown.task_achievement },
      { skill: 'naturalness', score: stats.score_breakdown.naturalness },
      { skill: 'register', score: stats.score_breakdown.register },
    ]
    // Sort by score ascending (lowest = weakest)
    const known = skills.filter((item): item is { skill: WritingSkillType; score: number } => typeof item.score === 'number')
    known.sort((a, b) => a.score - b.score)
    return known[0]?.skill || 'grammatical_accuracy'
  }, [stats])

  // Map skill type to display name
  const SKILL_DISPLAY: Record<WritingSkillType, string> = {
    task_achievement: 'Hoàn thành nhiệm vụ',
    coherence: 'Mạch lạc & Liên kết',
    lexical_resource: 'Từ vựng',
    grammatical_accuracy: 'Ngữ pháp',
    naturalness: 'Tự nhiên',
    register: 'Phong cách',
  }

  const progress: WritingProgress = useMemo(() => {
    // These values are displayed as CSS `width: N%` so they must be in [0, 100].
    // Backend already returns sub-scores on a 0-100 scale, so we only clamp.
    const clampPct = (n: number | null) => n === null ? 0 : Math.max(0, Math.min(100, n))
    return {
      grammar: clampPct(stats.score_breakdown.grammar),
      vocabulary: clampPct(stats.score_breakdown.vocabulary),
      coherence: clampPct(stats.score_breakdown.coherence),
      weakest_area: weakestSkill,
      weakest_context: recommendationData?.analysis?.context_performance?.[0]?.context_id,
      recommendations,
    }
  }, [stats, weakestSkill, recommendations, recommendationData])

  // Navigation handlers
  const handleGoHome = useCallback(() => {
    setSelectedExercise(null)
    setCurrentSubmission(null)
    setCurrentView('home')
    navigate('/writing')
  }, [navigate])

  const handleGoExercises = useCallback(() => {
    setSelectedExercise(null)
    setCurrentSubmission(null)
    setDraftContent('')
    setCurrentView('exercises')
    navigate('/writing/exercises')
  }, [navigate])

  const handleGoHistory = useCallback(() => {
    setCurrentView('history')
    navigate('/writing/history')
  }, [navigate])

  const handleSelectExercise = useCallback(
    (exercise: WritingExercise) => {
      setSelectedExercise(exercise)
      setCurrentSubmission(null)
      setCurrentView('detail')
      navigate(`/writing/exercise/${exercise.id}`)
    },
    [navigate]
  )

  const handleStartWriting = useCallback(
    (exercise: WritingExercise, timeSecondsParam?: number) => {
      // Đảm bảo exercise được set
      if (!selectedExercise || selectedExercise.id !== exercise.id) {
        setSelectedExercise(exercise)
      }
      setDraftContent('')
      setDraftVersion(1)
      if (timeSecondsParam) {
        setTimeSeconds(timeSecondsParam)
      }
      setCurrentView('workspace')
      navigate(`/writing/workspace/${exercise.id}`)
    },
    [navigate, selectedExercise]
  )

  const handleSaveDraft = useCallback(
    (content: string, _wordCount: number) => {
      setDraftContent(content)
      showAction('Đã lưu bản nháp')
    },
    [showAction]
  )

  const submissionRequest = useRef<{ exercise: string; content: string; id: string } | null>(null)
  const handleSubmitWriting = useCallback(
    async (content: string, _wordCount: number, writingTimeSeconds: number) => {
      if (!selectedExercise) return false
      const authUser = useAuthStore.getState().user
      if (!authUser) {
        toast.error('Vui lòng đăng nhập để nộp bài và nhận đánh giá AI!')
        return false
      }

      try {
        if (submissionRequest.current?.exercise !== selectedExercise.id || submissionRequest.current.content !== content) submissionRequest.current = { exercise: selectedExercise.id, content, id: crypto.randomUUID() }
        const payload = {
          request_id: submissionRequest.current.id,
          review_session_id: reviewSessionId,
          exercise_id: selectedExercise.id,
          user_content: content,
          time_spent_seconds: writingTimeSeconds,
        }

        const backendRes: any = await practiceService.submitWritingSubmission(payload)
        const subData = backendRes?.data || backendRes

        const newSubmission: WritingSubmission = mapBackendToSubmission(subData)

        submissionRequest.current = null
        void practiceService.getMyWritingSubmissions().then((history: any) => setScoreGroups(history?.score_groups || [])).catch(() => undefined)
        setCurrentSubmission(newSubmission)
        setHistorySubmissions((prev) => [newSubmission, ...prev.filter((p) => p.id !== newSubmission.id)])
        queryClient.invalidateQueries({ queryKey: practiceKeys.writing() })
        queryClient.invalidateQueries({ queryKey: ['writing-srs'] })
        setCurrentView('result')
        navigate(`/writing/result/${newSubmission.id}`)
        return true
      } catch (submitErr) {
        console.error('[useWritingWorkspace] Submit error:', submitErr)
        setDraftContent(content)
        showAction(submitErr instanceof Error ? submitErr.message : 'Chưa chấm được bài. Nội dung được giữ lại; vui lòng thử lại.')
        return false
      }
    },
    [selectedExercise, reviewSessionId, navigate, queryClient, showAction]
  )

  const handleViewSubmission = useCallback(
    (submission: WritingSubmission) => {
      const exercise = exerciseList.find((ex) => ex.id === submission.exercise_id)
      if (exercise) {
        setSelectedExercise(exercise)
      }
      setCurrentSubmission(submission)
      setCurrentView('result')
      navigate(`/writing/result/${submission.id}`)
    },
    [exerciseList, navigate]
  )

  const handlePracticeAgain = useCallback(() => {
    if (!selectedExercise) return
    setDraftContent('')
    setDraftVersion(1)
    setCurrentView('workspace')
    navigate(`/writing/workspace/${selectedExercise.id}`)
  }, [selectedExercise, navigate])

  const handleNextExercise = useCallback(() => {
    if (!selectedExercise || exerciseList.length === 0) return
    const currentIndex = exerciseList.findIndex((ex) => ex.id === selectedExercise.id)
    const nextExercise = exerciseList[(currentIndex + 1) % exerciseList.length]
    setSelectedExercise(nextExercise)
    setDraftContent('')
    setDraftVersion(1)
    setCurrentView('workspace')
    navigate(`/writing/workspace/${nextExercise.id}`)
  }, [selectedExercise, exerciseList, navigate])

  return {
    // State
    reviewSessionId,
    currentView,
    exerciseList,
    selectedExercise,
    currentSubmission,
    historySubmissions,
    draftContent,
    draftVersion,
    timeSeconds,
    stats,
    progress,
    // Loading states
    isLoading: !isInitialized || isLoadingExercises || (!!exerciseIdFromUrl && isLoadingExerciseById),
    isLoadingExercise: isLoadingExerciseById,
    error: initError || (exerciseError ? 'Không thể tải bài tập' : null),
    // Handlers
    handleGoHome,
    handleGoExercises,
    handleGoHistory,
    handleSelectExercise,
    handleStartWriting,
    handleSaveDraft,
    handleSubmitWriting,
    handleViewSubmission,
    handlePracticeAgain,
    handleNextExercise,
  }
}
