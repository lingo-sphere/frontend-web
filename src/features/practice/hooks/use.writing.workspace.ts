// Hook quản lý trạng thái bài tập luyện viết, lưu bản nháp và gửi chấm điểm bài luận AI.

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from '@/lib/navigation'
import { useApp } from '@/contexts/app.context'
import { practiceService, type BackendWritingExercise } from '@/features/practice/services/practice.service'
import type {
  WritingExercise,
  WritingSubmission,
  WritingStats,
  WritingProgress,
  WritingDraft,
  WritingLevel,
  DifficultyLevel,
  ExerciseType,
} from '@/features/practice/types/writing'

export type WritingView = 'home' | 'exercises' | 'detail' | 'workspace' | 'result' | 'history'

function toWritingLevel(val?: string): WritingLevel {
  const valid: WritingLevel[] = ['BASIC', 'INTERMEDIATE', 'ADVANCED']
  if (val && (valid as string[]).includes(val)) {
    return val as WritingLevel
  }
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
  return 'TOPIC_WRITING'
}

export function useWritingWorkspace() {
  const { showAction } = useApp()
  const navigate = useNavigate()
  const params = useParams()
  const rawPath = params?.slug || params?.['*']
  const path = Array.isArray(rawPath) ? rawPath.join('/') : rawPath || ''

  const [currentView, setCurrentView] = useState<WritingView>(() => {
    if (path.startsWith('exercises')) return 'exercises'
    if (path.startsWith('exercise/')) return 'detail'
    if (path.startsWith('workspace/')) return 'workspace'
    if (path.startsWith('result/')) return 'result'
    if (path.startsWith('history')) return 'history'
    return 'home'
  })

  const [exerciseList, setExerciseList] = useState<WritingExercise[]>([])
  const [selectedExercise, setSelectedExercise] = useState<WritingExercise | null>(null)
  const [currentSubmission, setCurrentSubmission] = useState<WritingSubmission | null>(null)
  const [historySubmissions, setHistorySubmissions] = useState<WritingSubmission[]>([])
  const [draftContent, setDraftContent] = useState<string>('')
  const [draftVersion, setDraftVersion] = useState<number>(1)

  useEffect(() => {
    let isMounted = true
    const fetchWriting = async () => {
      try {
        const data = await practiceService.getWritingExercises()
        if (isMounted && Array.isArray(data)) {
          const mapped: WritingExercise[] = data.map((item: BackendWritingExercise) => ({
            id: item._id,
            title: item.title,
            title_vi: item.title_vi || item.title,
            description: item.description || '',
            description_vi: item.description_vi || item.description || '',
            domain: 'WRITING',
            exercise_type: toExerciseType(item.exercise_type),
            writing_level: toWritingLevel(item.writing_level),
            toeic_part: item.toeic_part || 1,
            prompt_en: item.prompt_en || item.title,
            prompt_vi: item.prompt_vi || item.title_vi,
            min_words: item.min_words || 150,
            max_words: item.max_words || 300,
            difficulty_level: toDifficultyLevel(item.difficulty_level),
            cefr_level: item.cefr_level || 'B2',
            total_attempts: typeof item.total_attempts === 'number' ? item.total_attempts : 0,
            avg_score: typeof item.avg_score === 'number' ? item.avg_score : undefined,
            status: 'PUBLISHED',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))
          setExerciseList(mapped)
        }
      } catch (err) {
        console.error('Failed to load writing exercises:', err)
      }
    }
    fetchWriting()
    return () => {
      isMounted = false
    }
  }, [])

  const stats: WritingStats = useMemo(() => {
    const total = historySubmissions.length
    const avgScore =
      total > 0
        ? Math.round(
            (historySubmissions.reduce((sum, s) => sum + (s.overall_score || 0), 0) / total) * 10
          ) / 10
        : 0
    const avgGrammar =
      total > 0
        ? Math.round(
            (historySubmissions.reduce(
              (sum, s) => sum + (s.grammatical_accuracy_score || s.overall_score || 0),
              0
            ) /
              total) *
              10
          )
        : 0
    const avgVocab =
      total > 0
        ? Math.round(
            (historySubmissions.reduce(
              (sum, s) => sum + (s.lexical_resource_score || s.overall_score || 0),
              0
            ) /
              total) *
              10
          )
        : 0
    const avgTime =
      total > 0
        ? Math.round(
            historySubmissions.reduce((sum, s) => sum + (s.writing_time_seconds || 0), 0) /
              total /
              60
          )
        : 0

    return {
      total_submissions: total,
      average_score: avgScore,
      total_words_written: historySubmissions.reduce((sum, s) => sum + (s.word_count || 0), 0),
      average_grammar_accuracy: avgGrammar,
      average_vocabulary_usage: avgVocab,
      average_writing_time_minutes: avgTime,
      score_breakdown: {
        task_achievement:
          total > 0
            ? Math.round(
                (historySubmissions.reduce(
                  (sum, s) => sum + (s.task_achievement_score || s.overall_score || 0),
                  0
                ) /
                  total) *
                  10
              ) / 10
            : 0,
        coherence:
          total > 0
            ? Math.round(
                (historySubmissions.reduce((sum, s) => sum + (s.coherence_score || 0), 0) / total) *
                  10
              ) / 10
            : 0,
        vocabulary:
          total > 0
            ? Math.round(
                (historySubmissions.reduce(
                  (sum, s) => sum + (s.lexical_resource_score || s.overall_score || 0),
                  0
                ) /
                  total) *
                  10
              ) / 10
            : 0,
        grammar:
          total > 0
            ? Math.round(
                (historySubmissions.reduce(
                  (sum, s) => sum + (s.grammatical_accuracy_score || s.overall_score || 0),
                  0
                ) /
                  total) *
                  10
              ) / 10
            : 0,
      },
    }
  }, [historySubmissions])

  const progress: WritingProgress = useMemo(() => {
    return {
      grammar: stats.average_grammar_accuracy,
      vocabulary: stats.average_vocabulary_usage,
      coherence:
        historySubmissions.length > 0
          ? Math.round(
              (historySubmissions.reduce((sum, s) => sum + (s.coherence_score || 0), 0) /
                historySubmissions.length) *
                10
            )
          : 0,
      weakest_area: 'Coherence',
      recommended_topics: exerciseList.slice(0, 3).map((e) => e.title),
    }
  }, [stats, historySubmissions, exerciseList])

  const handleGoHome = useCallback(() => {
    setCurrentView('home')
    navigate('/writing')
  }, [navigate])

  const handleGoExercises = useCallback(() => {
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
      setCurrentView('detail')
      navigate(`/writing/exercise/${exercise.id}`)
    },
    [navigate]
  )

  const handleStartWriting = useCallback(
    (exercise: WritingExercise) => {
      setSelectedExercise(exercise)
      setDraftContent('')
      setDraftVersion(1)
      setCurrentView('workspace')
      navigate(`/writing/workspace/${exercise.id}`)
    },
    [navigate]
  )

  const handleSaveDraft = useCallback(
    (content: string, _wordCount: number) => {
      setDraftContent(content)
      showAction('Đã lưu bản nháp')
    },
    [showAction]
  )

  const handleSubmitWriting = useCallback(
    async (content: string, wordCount: number, writingTimeSeconds: number) => {
      if (!selectedExercise) return

      let evalResult = {
        grammar_score: 0,
        vocabulary_score: 0,
        coherence_score: 0,
        overall_score: 0,
        feedback_vi: '',
        improved_essay: content,
      }

      try {
        const liveEval = await practiceService.evaluateWritingEssay(content, selectedExercise.title)
        if (liveEval) {
          evalResult = {
            grammar_score: liveEval.grammar_score ?? 0,
            vocabulary_score: liveEval.vocabulary_score ?? 0,
            coherence_score: liveEval.coherence_score ?? 0,
            overall_score: liveEval.overall_score ?? 0,
            feedback_vi: liveEval.feedback_vi || '',
            improved_essay: liveEval.improved_essay || content,
          }
        }
      } catch (err) {
        console.error('AI Writing eval failed:', err)
      }

      const newDraft: WritingDraft = {
        content,
        word_count: wordCount,
        timestamp: new Date().toISOString(),
        version_number: draftVersion,
      }

      const newSubmission: WritingSubmission = {
        id: `ws-${Date.now()}`,
        user_id: 'current_user',
        exercise_id: selectedExercise.id,
        content,
        word_count: wordCount,
        version_number: draftVersion,
        drafts: [newDraft],
        is_draft: false,
        overall_score: evalResult.overall_score,
        task_achievement_score: evalResult.overall_score,
        coherence_score: evalResult.coherence_score,
        lexical_resource_score: evalResult.vocabulary_score,
        grammatical_accuracy_score: evalResult.grammar_score,
        writing_time_seconds: writingTimeSeconds,
        domain: 'WRITING',
        status: 'COMPLETED',
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        ai_evaluation: {
          overall_feedback: evalResult.feedback_vi,
          errors: [],
          suggested_version: evalResult.improved_essay,
          improvement_tips: [],
        },
      }

      setCurrentSubmission(newSubmission)
      setHistorySubmissions((prev) => [newSubmission, ...prev])
      setCurrentView('result')
      navigate(`/writing/result/${newSubmission.id}`)
    },
    [selectedExercise, draftVersion, navigate]
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
    currentView,
    exerciseList,
    selectedExercise,
    currentSubmission,
    historySubmissions,
    draftContent,
    draftVersion,
    stats,
    progress,
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
