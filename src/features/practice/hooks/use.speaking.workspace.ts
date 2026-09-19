// Hook quản lý trạng thái bài tập luyện nói, quy trình thu âm và chấm điểm phát âm AI.

import { useState, useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { practiceService, type BackendSpeakingExercise } from '@/features/practice/services/practice.service'
import { useSpeakingExercisesQuery } from '@/features/practice/hooks/use.practice.query'
import { practiceKeys } from '@/features/practice/keys/practice.keys'
import type {
  SpeakingExercise,
  SpeakingAttempt,
  RecordingState,
  SpeakingStats,
  SpeakingProgress,
  SpeakingExerciseType,
  DifficultyLevel,
} from '@/features/practice/types/speaking'
import type { SpeechAssessmentResult } from '@/types/api.types'

export type SpeakingView = 'home' | 'list' | 'workspace' | 'result' | 'history'

function toSpeakingExerciseType(val?: string): SpeakingExerciseType {
  const valid: SpeakingExerciseType[] = ['TOPIC', 'RESPOND_SITUATION', 'PRONUNCIATION', 'READ_ALOUD', 'SHADOWING']
  if (val && (valid as string[]).includes(val)) {
    return val as SpeakingExerciseType
  }
  return 'READ_ALOUD'
}

function toDifficultyLevel(val?: string): DifficultyLevel {
  const valid: DifficultyLevel[] = ['EASY', 'MEDIUM', 'HARD']
  if (val && (valid as string[]).includes(val)) {
    return val as DifficultyLevel
  }
  return 'MEDIUM'
}

export function useSpeakingWorkspace() {
  const queryClient = useQueryClient()
  const [view, setView] = useState<SpeakingView>('home')
  const [selectedExercise, setSelectedExercise] = useState<SpeakingExercise | null>(null)
  const [currentSubmission, setCurrentSubmission] = useState<SpeakingAttempt | null>(null)
  const [historyAttempts, setHistoryAttempts] = useState<SpeakingAttempt[]>([])
  const [, setIsSubmitting] = useState(false)
  const [recordingState, setRecordingState] = useState<RecordingState>({
    phase: 'idle',
    preparationTimeLeft: 0,
    speakingTimeLeft: 0,
    duration: 0,
    audioUrl: null,
    isPlaying: false,
    playbackPosition: 0,
  })

  const { data: rawSpeakingExercises = [] } = useSpeakingExercisesQuery()

  const exerciseList: SpeakingExercise[] = useMemo(() => {
    return rawSpeakingExercises.map((item: BackendSpeakingExercise) => ({
      id: item._id,
      title: item.title,
      title_vi: item.title_vi || item.title,
      description: item.description || '',
      description_vi: item.description_vi || item.description || '',
      domain: 'SPEAKING',
      exercise_type: toSpeakingExerciseType(item.exercise_type),
      toeic_part: item.toeic_part || 1,
      preparation_time_seconds: item.preparation_time_seconds || 45,
      response_time_seconds: item.response_time_seconds || 45,
      prompt_text_en: item.prompt_text_en || item.title,
      prompt_text_vi: item.prompt_text_vi || item.title_vi,
      difficulty_level: toDifficultyLevel(item.difficulty_level),
      cefr_level: item.cefr_level || 'B1',
      total_attempts: typeof item.total_attempts === 'number' ? item.total_attempts : 0,
      avg_score: typeof item.avg_score === 'number' ? item.avg_score : undefined,
      status: 'PUBLISHED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
  }, [rawSpeakingExercises])

  const stats: SpeakingStats = useMemo(() => {
    const total = historyAttempts.length
    const avgScore =
      total > 0
        ? Math.round(
            (historyAttempts.reduce((sum, a) => sum + (a.overall_score || 0), 0) / total) * 10
          ) / 10
        : 0
    const avgPron =
      total > 0
        ? Math.round(
            (historyAttempts.reduce((sum, a) => sum + (a.pronunciation_score || 0), 0) / total) *
              10
          ) / 10
        : 0
    const avgFluency =
      total > 0
        ? Math.round(
            (historyAttempts.reduce((sum, a) => sum + (a.fluency_score || 0), 0) / total) * 10
          ) / 10
        : 0

    return {
      total_attempts: total,
      average_score: avgScore,
      average_pronunciation: avgPron,
      average_fluency: avgFluency,
      average_grammar: avgScore,
      average_vocabulary: avgScore,
      average_coherence: avgScore,
      average_content: avgScore,
      total_practice_minutes: Math.round(
        historyAttempts.reduce((sum, a) => sum + (a.speaking_time_seconds || 0), 0) / 60
      ),
      best_streak: total > 0 ? 1 : 0,
    }
  }, [historyAttempts])

  const progress: SpeakingProgress = useMemo(() => {
    return {
      pronunciation: stats.average_pronunciation ? Math.round(stats.average_pronunciation * 10) : 0,
      fluency: stats.average_fluency ? Math.round(stats.average_fluency * 10) : 0,
      grammar: stats.average_grammar ? Math.round(stats.average_grammar * 10) : 0,
      vocabulary: stats.average_vocabulary ? Math.round(stats.average_vocabulary * 10) : 0,
      weakest_area: stats.average_pronunciation < stats.average_fluency ? 'Pronunciation' : 'Fluency',
      recommended_exercises: exerciseList.slice(0, 3).map((e) => e.id),
    }
  }, [stats, exerciseList])

  const handleGoHome = useCallback(() => {
    setView('home')
    setSelectedExercise(null)
    setCurrentSubmission(null)
    setRecordingState({
      phase: 'idle',
      preparationTimeLeft: 0,
      speakingTimeLeft: 0,
      duration: 0,
      audioUrl: null,
      isPlaying: false,
      playbackPosition: 0,
    })
  }, [])

  const handleGoList = useCallback(() => setView('list'), [])
  const handleGoHistory = useCallback(() => setView('history'), [])

  const handleSelectExercise = useCallback((exercise: SpeakingExercise) => {
    setSelectedExercise(exercise)
    setView('workspace')
    setRecordingState({
      phase: 'idle',
      preparationTimeLeft: exercise.preparation_time_seconds || 30,
      speakingTimeLeft: exercise.response_time_seconds || 60,
      duration: 0,
      audioUrl: null,
      isPlaying: false,
      playbackPosition: 0,
    })
  }, [])

  const handleViewSubmission = useCallback((submission: SpeakingAttempt) => {
    setCurrentSubmission(submission)
    setView('result')
  }, [])

  const handleStartPractice = useCallback(
    (exercise: SpeakingExercise) => {
      handleSelectExercise(exercise)
    },
    [handleSelectExercise]
  )

  const handleSubmitRecording = useCallback(
    async (transcription: string, duration: number, audioBlob?: Blob) => {
      if (!selectedExercise) return
      setIsSubmitting(true)

      let finalTranscript = transcription
      let pronunciationScore = 0
      let fluencyScore = 0
      let overallScore = 0
      let feedback = ''

      if (audioBlob) {
        try {
          const assessment: SpeechAssessmentResult = await practiceService.evaluateSpeakingAudio(
            audioBlob,
            selectedExercise.id,
            selectedExercise.topic
          )
          if (assessment) {
            finalTranscript = assessment.transcribed_text || finalTranscript
            pronunciationScore = assessment.pronunciation_score ?? 0
            fluencyScore = assessment.fluency_score ?? 0
            overallScore = assessment.overall_score ?? 0
            feedback = assessment.feedback_vi || ''
          }
        } catch (err) {
          console.error('API Speech Evaluation error:', err)
        }
      }

      let backendAttempt: Record<string, unknown> | null = null
      try {
        backendAttempt = await practiceService.submitSpeakingAttempt({
          exercise_id: selectedExercise.id,
          recording_media_id: `rec_${selectedExercise.id}_${Date.now()}`,
          recording_duration_seconds: duration,
          transcription: finalTranscript,
          pronunciation_score: pronunciationScore,
          fluency_score: fluencyScore,
          overall_score: overallScore,
        })
        queryClient.invalidateQueries({ queryKey: practiceKeys.speaking() })
      } catch (submitErr) {
        console.error('Submit speaking attempt error:', submitErr)
      }

      const attemptId = String(backendAttempt?._id || '')
      const newSubmission: SpeakingAttempt = {
        id: attemptId,
        user_id: String(backendAttempt?.user_id || ''),
        exercise_id: selectedExercise.id,
        attempt_number: 1,
        is_best_attempt: true,
        recording_duration_seconds: duration,
        speaking_time_seconds: duration,
        transcription: finalTranscript,
        overall_score: overallScore,
        pronunciation_score: pronunciationScore,
        fluency_score: fluencyScore,
        grammar_score: overallScore,
        vocabulary_score: overallScore,
        coherence_score: overallScore,
        content_score: overallScore,
        ai_evaluation: {
          overall_feedback: feedback,
          pronunciation_analysis: {
            score: pronunciationScore,
            issues: [],
            suggestions: [],
          },
          fluency_analysis: {
            score: fluencyScore,
            issues: [],
            suggestions: [],
          },
          grammar_analysis: {
            score: overallScore,
            issues: [],
            suggestions: [],
          },
          vocabulary_analysis: {
            score: overallScore,
            issues: [],
            suggestions: [],
          },
          coherence_analysis: {
            score: overallScore,
            issues: [],
            suggestions: [],
          },
          content_analysis: {
            score: overallScore,
            issues: [],
            suggestions: [],
          },
          improvement_tips: [],
        },
        domain: 'SPEAKING',
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }

      setIsSubmitting(false)
      setCurrentSubmission(newSubmission)
      setHistoryAttempts((prev) => [newSubmission, ...prev])
      setRecordingState((prev) => ({ ...prev, phase: 'reviewing' }))
      setView('result')
    },
    [selectedExercise]
  )

  const handlePracticeAgain = useCallback(() => {
    if (!selectedExercise) return
    setRecordingState({
      phase: 'idle',
      preparationTimeLeft: selectedExercise.preparation_time_seconds || 30,
      speakingTimeLeft: selectedExercise.response_time_seconds || 60,
      duration: 0,
      audioUrl: null,
      isPlaying: false,
      playbackPosition: 0,
    })
    setView('workspace')
  }, [selectedExercise])

  const handleNextExercise = useCallback(() => {
    if (!selectedExercise || exerciseList.length === 0) return

    const currentIndex = exerciseList.findIndex((e) => e.id === selectedExercise.id)
    const nextExercise = exerciseList[(currentIndex + 1) % exerciseList.length]
    handleSelectExercise(nextExercise)
  }, [selectedExercise, exerciseList, handleSelectExercise])

  return {
    view,
    setView,
    exerciseList,
    selectedExercise,
    currentSubmission,
    historyAttempts,
    recordingState,
    setRecordingState,
    stats,
    progress,
    handleGoHome,
    handleGoList,
    handleGoHistory,
    handleSelectExercise,
    handleViewSubmission,
    handleStartPractice,
    handleSubmitRecording,
    handlePracticeAgain,
    handleNextExercise,
  }
}
