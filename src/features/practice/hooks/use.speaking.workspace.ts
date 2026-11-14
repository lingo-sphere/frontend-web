import { resolvePracticeDifficulty } from '../lib/practice-difficulty'
import type { RecordingSubmission } from '@/features/practice/hooks/use.speaking.session'
import { longestSpeakingStreak, resolveSpeakingPolicy, getSavedSpeakingTimeModePreference } from '@/features/practice/lib/speaking-policy'
import { api } from '@/services/api.client'
import { readSkillDraft, writeSkillDraft } from '@/features/practice/lib/skill-draft';
// Hook quản lý trạng thái bài tập luyện nói, quy trình thu âm và chấm điểm phát âm AI.

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { practiceService, type BackendSpeakingExercise } from '@/features/practice/services/practice.service'
import {
  useSpeakingExercisesQuery,
  useSpeakingProfileQuery,
  useSpeakingAttemptsQuery,
} from '@/features/practice/hooks/use.practice.query'
import { practiceKeys } from '@/features/practice/keys/practice.keys'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useNavigate, useParams } from '@/lib/navigation'
import { toast } from '@/store/toast.store'
import type {
  SpeakingExercise,
  SpeakingAttempt,
  RecordingState,
  SpeakingStats,
  SpeakingProgress,
  SpeakingExerciseType,
  DifficultyLevel,
  DialogueTurnAttemptResult,
} from '@/features/practice/types/speaking'

export type SpeakingView = 'home' | 'list' | 'workspace' | 'result' | 'history'

function toSpeakingExerciseType(val?: string): SpeakingExerciseType {
  const valid: SpeakingExerciseType[] = [
    'READ_ALOUD',
    'DESCRIBE_PICTURE',
    'SHORT_DIALOGUE',
    'ANSWER_QUESTION',
    'OPINION_RESPONSE',
    'TOPIC',
    'RESPOND_SITUATION',
    'PRONUNCIATION',
    'SHADOWING',
  ]
  if (val && (valid as string[]).includes(val)) {
    return val as SpeakingExerciseType
  }
  return 'READ_ALOUD'
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      const base64 = result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function useSpeakingWorkspace() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const params = useParams<{ slug?: string[] }>()
  const resultId = params.slug?.[0] === 'result' ? params.slug[1] : undefined
  const resultQuery = useQuery({
    queryKey: ['speaking-result', resultId], enabled: !!resultId && /^[a-f\d]{24}$/i.test(resultId),
    queryFn: () => api.get<Record<string, any>>(`/practice/review-results/SPEAKING/${resultId}/submission`),
  })
  const catalogRoute = params.slug?.[0]
  const [view, setView] = useState<SpeakingView>(catalogRoute === 'history' ? 'history' : 'list')
  const [previousRoute, setPreviousRoute] = useState(catalogRoute)
  if (previousRoute !== catalogRoute) {
    setPreviousRoute(catalogRoute)
    if (!catalogRoute || catalogRoute === 'history') setView(catalogRoute === 'history' ? 'history' : 'list')
  }
  const [selectedExercise, setSelectedExercise] = useState<SpeakingExercise | null>(null)
  const [selectedTier, setSelectedTier] = useState<DifficultyLevel>('MEDIUM')


  const [pendingSpeaking, setPendingSpeaking] = useState<{ payload: Record<string, any> } | null>(null)
  const submittingRef = useRef(false)
  const speakingRequestRef = useRef<{ hash: string; id: string } | null>(null)
  const [currentSubmission, setCurrentSubmission] = useState<SpeakingAttempt | null>(null)
  const [historyAttempts, setHistoryAttempts] = useState<SpeakingAttempt[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recordingState, setRecordingState] = useState<RecordingState>({
    phase: 'idle',
    preparationTimeLeft: 0,
    speakingTimeLeft: 0,
    duration: 0,
    audioUrl: null,
    isPlaying: false,
    playbackPosition: 0,
  })

  const { data: rawSpeakingExercises = [], isLoading: isLoadingExercises, error: exercisesError, refetch: refetchExercises } = useSpeakingExercisesQuery()
  const { data: userSpeakingProfile } = useSpeakingProfileQuery()
  const { data: remoteAttempts = [], isLoading: isLoadingHistory, error: historyError, refetch: refetchHistory } = useSpeakingAttemptsQuery(50)

  useEffect(() => {
    if (!isLoadingHistory && !historyError) {
      setHistoryAttempts(remoteAttempts)
    }
  }, [remoteAttempts, isLoadingHistory, historyError])

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
      preparation_time_seconds: item.preparation_time_seconds ?? 30,
      response_time_seconds: item.response_time_seconds ?? 45,
      prompt_text_en: item.prompt_text_en || item.title,
      prompt_text_vi: (item.prompt_text_vi || item.title_vi) ?? undefined,
      context_path: (item as any).context_path || [],
      prompt_media_id: (item as any).prompt_media_id,
      reference_media_id: (item as any).reference_media_id,
      source_text: (item as any).source_text,
      source_text_vi: (item as any).source_text_vi,
      dialogue_scenario: (item as any).dialogue_scenario || null,
      tiered_time_limits: (item as any).tiered_time_limits || null,
      expected_keywords: (item as any).expected_keywords || [],
      expected_structure: (item as any).expected_structure || [],
      target_lexical_item_ids: (item.target_lexical_item_ids as string[]) || [],
      target_grammar_knowledge_ids: (item.target_grammar_knowledge_ids as string[]) || [],
      target_phonetics_labels: (item.target_phonetics_labels as string[]) || [],
      target_phonetics_knowledge_ids: (item as any).target_phonetics_knowledge_ids || [],
      difficulty_level: resolvePracticeDifficulty(item.difficulty_level, undefined, item.cefr_level),
      cefr_level: item.cefr_level || 'B1',
      total_attempts: typeof item.total_attempts === 'number' ? item.total_attempts : 0,
      avg_score: typeof item.avg_score === 'number' ? item.avg_score : undefined,
      status: 'PUBLISHED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
  }, [rawSpeakingExercises])

  useEffect(() => {
    if (!resultQuery.data) return
    const row = resultQuery.data
    setCurrentSubmission({ ...row, id: String(row._id || row.id) } as SpeakingAttempt)
    const original = row.exercise || exerciseList.find(item => item.id === String(row.exercise_id))
    if (original) setSelectedExercise({ ...original, id: String(row.exercise_id), title: original.title || 'Bài luyện nói', title_vi: original.title_vi || '', exercise_type: original.exercise_type || row.exercise_type } as SpeakingExercise)
    setView('result')
  }, [resultQuery.data, exerciseList])

  const stats: SpeakingStats = useMemo(() => {
    const currentVersion = historyAttempts.find(item => !item.grading_version?.startsWith('teacher:'))?.grading_version || 'speaking-v2'
    const comparableAttempts = historyAttempts.filter(item => item.grading_version === currentVersion)
    const total = Math.max(userSpeakingProfile?.total_attempts || 0, comparableAttempts.length)

    // Average score: fallback to userSpeakingProfile.overall_proficiency_score if comparableAttempts is empty
    const avgScore = total > 0
      ? (comparableAttempts.length > 0
        ? Math.round(
          (comparableAttempts.reduce((sum, a) => sum + (a.overall_score || 0), 0) / comparableAttempts.length) * 10
        ) / 10
        : (userSpeakingProfile?.overall_proficiency_score || 0))
      : 0

    // Practice minutes
    const totalDurationSeconds = Math.max(
      userSpeakingProfile?.total_speaking_duration_seconds || 0,
      comparableAttempts.reduce((sum, a) => sum + (a.recording_duration_seconds || (a as any).speaking_time_seconds || 0), 0)
    )
    const practiceMinutes = Math.max(
      Math.round(totalDurationSeconds / 60),
      totalDurationSeconds > 0 ? 1 : 0
    )

    // Rubric scores
    const radar = userSpeakingProfile?.radar_scores
    const avgPron = radar?.pronunciation !== undefined
      ? radar.pronunciation
      : (comparableAttempts.length > 0
        ? Math.round((comparableAttempts.reduce((sum, a) => sum + (a.pronunciation_score || 0), 0) / comparableAttempts.length) * 10) / 10
        : 0)

    const avgFluency = radar?.fluency !== undefined
      ? radar.fluency
      : (comparableAttempts.length > 0
        ? Math.round((comparableAttempts.reduce((sum, a) => sum + (a.fluency_score || 0), 0) / comparableAttempts.length) * 10) / 10
        : 0)

    const avgGrammar = radar?.grammar !== undefined
      ? radar.grammar
      : (comparableAttempts.length > 0
        ? Math.round((comparableAttempts.reduce((sum, a) => sum + (a.grammar_score || 0), 0) / comparableAttempts.length) * 10) / 10
        : avgScore)

    const avgVocab = radar?.vocabulary !== undefined
      ? radar.vocabulary
      : (comparableAttempts.length > 0
        ? Math.round((comparableAttempts.reduce((sum, a) => sum + (a.vocabulary_score || 0), 0) / comparableAttempts.length) * 10) / 10
        : avgScore)

    const avgCoherence = radar?.naturalness !== undefined
      ? radar.naturalness
      : (comparableAttempts.length > 0
        ? Math.round((comparableAttempts.reduce((sum, a) => sum + (a.coherence_score || 0), 0) / comparableAttempts.length) * 10) / 10
        : avgScore)

    const avgContent = radar?.task_achievement !== undefined
      ? radar.task_achievement
      : (comparableAttempts.length > 0
        ? Math.round((comparableAttempts.reduce((sum, a) => sum + (a.content_score || 0), 0) / comparableAttempts.length) * 10) / 10
        : avgScore)

    return {
      total_attempts: total,
      average_score: avgScore,
      average_pronunciation: avgPron,
      average_fluency: avgFluency,
      average_grammar: avgGrammar,
      average_vocabulary: avgVocab,
      average_coherence: avgCoherence,
      average_content: avgContent,
      total_practice_minutes: practiceMinutes,
      best_streak: longestSpeakingStreak(comparableAttempts),
    }
  }, [userSpeakingProfile, historyAttempts])

  const progress: SpeakingProgress = useMemo(() => {
    const scores = [
      { name: 'Pronunciation', val: stats.average_pronunciation },
      { name: 'Fluency', val: stats.average_fluency },
      { name: 'Grammar', val: stats.average_grammar },
      { name: 'Vocabulary', val: stats.average_vocabulary },
    ].filter((s) => s.val > 0)

    let weakestArea = 'Pronunciation'
    if (scores.length > 0) {
      scores.sort((a, b) => a.val - b.val)
      weakestArea = scores[0].name
    }

    return {
      pronunciation: Math.round(Math.min(100, Math.max(0, stats.average_pronunciation))),
      fluency: Math.round(Math.min(100, Math.max(0, stats.average_fluency))),
      grammar: Math.round(Math.min(100, Math.max(0, stats.average_grammar))),
      vocabulary: Math.round(Math.min(100, Math.max(0, stats.average_vocabulary))),
      weakest_area: stats.total_attempts > 0 ? weakestArea : 'None',
      recommended_exercises: exerciseList.slice(0, 3).map((e) => e.id),
    }
  }, [stats, exerciseList])

  useEffect(() => {
    const user = useAuthStore.getState().user
    if (!selectedExercise || !user) { setPendingSpeaking(null); return }
    let active = true
    readSkillDraft<{ payload: Record<string, any> }>(`practice-speaking:${user.user_id}:${selectedExercise.id}`).then(draft => {
      if (active) setPendingSpeaking(draft || null)
    }).catch(() => { })
    return () => { active = false }
  }, [selectedExercise])

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

  const handleGoList = useCallback(() => {
    if (catalogRoute) navigate('/speaking')
    else setView('list')
  }, [catalogRoute, navigate])
  const handleGoHistory = useCallback(() => {
    if (catalogRoute === 'history') setView('history')
    else navigate('/speaking/history')
  }, [catalogRoute, navigate])

  const handleSelectExercise = useCallback((exercise: SpeakingExercise, chosenTier?: DifficultyLevel) => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để bắt đầu bài luyện nói!')
      window.dispatchEvent(new CustomEvent('lingosphere:open-auth-modal'))
      return
    }
    const tier = chosenTier || getSavedSpeakingTimeModePreference() || exercise.difficulty_level || 'MEDIUM'
    setSelectedTier(tier)
    setSelectedExercise(exercise)
    setView('workspace')
    const policy = resolveSpeakingPolicy(exercise, tier)
    setRecordingState({
      phase: 'idle',
      preparationTimeLeft: policy.preparation_time_seconds,
      speakingTimeLeft: policy.response_time_seconds,
      duration: 0,
      audioUrl: null,
      isPlaying: false,
      playbackPosition: 0,
    })
  }, [])

  const handleViewSubmission = useCallback((submission: SpeakingAttempt) => {
    setCurrentSubmission(submission)
    const original = exerciseList.find(item => item.id === String(submission.exercise_id))
    if (original) setSelectedExercise(original)
    setView('result')
    navigate(`/speaking/result/${submission.id}`)
  }, [exerciseList, navigate])

  const handleStartPractice = useCallback(
    (exercise: SpeakingExercise, tier?: DifficultyLevel) => {
      handleSelectExercise(exercise, tier)
    },
    [handleSelectExercise]
  )

  const handleSubmitRecording = useCallback(
    async (
      transcription: string,
      duration: number,
      audioBlob?: Blob,
      difficultyChosen?: DifficultyLevel,
      dialogueTurnsResults?: DialogueTurnAttemptResult[],
      recordingSubmission?: RecordingSubmission,
      frozenRequest?: { hash: string; id: string; payload: Record<string, any> }
    ) => {
      if (!selectedExercise) return
      const authUser = useAuthStore.getState().user
      if (!authUser) {
        toast.error('Vui lòng đăng nhập để gửi bài thu âm và nhận đánh giá AI!')
        return
      }
      if (submittingRef.current) return
      submittingRef.current = true
      setIsSubmitting(true)
      try {
      let audioBase64: string | undefined = undefined
      if (audioBlob) {
        try {
          audioBase64 = await blobToBase64(audioBlob)
        } catch (e) {
          throw new Error('Không đọc được bản ghi âm. Bản thu chưa được gửi.')
        }
      }

      let backendResponse: any = null
      try {
        const payload = frozenRequest?.payload ?? {
          ...recordingSubmission,
          exercise_id: selectedExercise.id, audio_data: audioBase64, mime_type: audioBlob?.type,
          transcription, recording_duration_seconds: duration,
          preparation_time_seconds: selectedExercise.preparation_time_seconds,
          difficulty_chosen: difficultyChosen || selectedExercise.difficulty_level || 'MEDIUM',
          dialogue_turns_results: dialogueTurnsResults || [],
        }
        if (payload.exercise_id !== selectedExercise.id) throw new Error('Bài chờ chấm không khớp bài đang mở')
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)))
        const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
        const draftKey = `practice-speaking:${authUser.user_id}:${selectedExercise.id}`
        const draft = await readSkillDraft<{ hash: string; id: string; payload: Record<string, unknown> }>(draftKey).catch(() => undefined)
        const request = frozenRequest ?? (draft?.hash === hash ? draft : speakingRequestRef.current?.hash === hash ? speakingRequestRef.current : { hash, id: crypto.randomUUID() })
        speakingRequestRef.current = request
        await writeSkillDraft(draftKey, { ...request, payload }).catch(() => { })
        setPendingSpeaking({ payload })
        backendResponse = await practiceService.submitSpeakingAttempt({ ...payload, request_id: request.id })
        const saved = backendResponse?.attempt || backendResponse
        if (!saved?._id || !Number.isFinite(saved.overall_score)) throw new Error('Chưa nhận được kết quả hợp lệ; bài đã lưu để thử lại.')
        await writeSkillDraft(draftKey, undefined).catch(() => { })
        setPendingSpeaking(null)

        queryClient.invalidateQueries({ queryKey: practiceKeys.speaking() })
        queryClient.invalidateQueries({ queryKey: ['speaking', 'profile', 'my'] })
        queryClient.invalidateQueries({ queryKey: ['speaking', 'attempts', 'my'] })
        queryClient.invalidateQueries({ queryKey: ['practice-dashboard'] })
        queryClient.invalidateQueries({ queryKey: ['practice-calendar'] })
        queryClient.invalidateQueries({ queryKey: ['practice-analytics'] })
      } catch (submitErr: any) {
        console.error('Submit speaking attempt error:', submitErr)
        toast.error(submitErr?.message || 'Nộp bài luyện nói thất bại, vui lòng thử lại!')
        setIsSubmitting(false)
        return
      }

      if (!backendResponse || (!backendResponse.attempt && !backendResponse._id)) {
        toast.error('Không nhận được kết quả chấm điểm từ AI, vui lòng thử lại!')
        setIsSubmitting(false)
        return
      }

      const attempt = backendResponse?.attempt || backendResponse || {}
      const analysis = backendResponse?.analysis || {}
      const attemptId = String(attempt._id || '')

      const pronunciationScore = attempt.pronunciation_score ?? 0
      const fluencyScore = attempt.fluency_score ?? 0
      const grammarScore = attempt.grammar_score ?? 0
      const vocabularyScore = attempt.vocabulary_score ?? 0
      const coherenceScore = attempt.coherence_score ?? 0
      const contentScore = attempt.content_score ?? 0
      const overallScore = attempt.overall_score ?? 0
      const finalTranscript = attempt.transcription || transcription

      const phonemeIssues = (analysis.pronunciation_analysis?.phoneme_errors || []).map(
        (p: any) => `Âm /${p.phoneme_expected}/ bị phát âm thành /${p.phoneme_actual}/ trong từ "${p.word}"`
      )
      const mispronouncedSuggestions = (analysis.pronunciation_analysis?.mispronounced_words || []).map(
        (w: any) => `Luyện tập từ: "${w.word}" (/ ${w.phoneme_expected || ''} /)`
      )

      const fluencyIssues = [
        analysis.fluency_analysis?.words_per_minute ? `Tốc độ nói: ${analysis.fluency_analysis.words_per_minute} WPM` : '',
        analysis.fluency_analysis?.total_pauses_count ? `Số lần ngắt nghỉ: ${analysis.fluency_analysis.total_pauses_count}` : '',
      ].filter(Boolean)

      const grammarIssues = (analysis.grammar_analysis?.error_breakdown || []).map(
        (g: any) => `[${g.error_category}] "${g.original_phrase}" ➔ "${g.corrected_phrase}" (${g.rule_violated_vi})`
      )

      const vocabIssues = analysis.vocabulary_analysis?.cefr_distribution
        ? [`Phân bổ từ vựng: ${analysis.vocabulary_analysis.cefr_distribution.A1_A2_percent || 0}% A1-A2, ${analysis.vocabulary_analysis.cefr_distribution.B1_B2_percent || 0}% B1-B2`]
        : []
      const vocabSuggestions = (analysis.vocabulary_analysis?.target_keywords_used || []).map(
        (k: string) => `Từ khóa đã vận dụng: "${k}"`
      )

      const coherenceIssues = (analysis.naturalness_analysis?.awkward_expressions || []).map(
        (a: any) => `Cụm diễn đạt: "${a.awkward_phrase}" ➔ Nên dùng: "${a.natural_alternative}"`
      )
      const coherenceSuggestions = analysis.naturalness_analysis?.vietnamese_transfer_tendencies || []

      const contentIssues = (analysis.task_achievement_analysis?.missing_ideas || []).map((m: string) => `Ý còn thiếu: ${m}`)
      const contentSuggestions = (analysis.task_achievement_analysis?.covered_ideas || []).map((c: string) => `Ý đã đạt: ${c}`)

      const feedback = analysis.pedagogical_feedback?.summary_vi || attempt.ai_evaluation?.detailed_feedback || 'Đã hoàn thành bài nói và phân tích AI'
      const improvementTips = analysis.pedagogical_feedback?.next_actionable_drills || []

      const newSubmission: SpeakingAttempt = {
        id: attemptId,
        user_id: String(attempt.user_id || ''),
        exercise_id: selectedExercise.id,
        attempt_number: attempt.attempt_number || 1,
        is_best_attempt: typeof attempt.is_best_attempt === 'boolean' ? attempt.is_best_attempt : true,
        recording_duration_seconds: attempt.recording_duration_seconds ?? duration,
        speaking_time_seconds: attempt.recording_duration_seconds ?? duration,
        audio_url: attempt.audio_url || recordingState.audioUrl || (audioBlob ? URL.createObjectURL(audioBlob) : undefined),
        transcription: finalTranscript,
        difficulty_chosen: difficultyChosen || selectedExercise.difficulty_level || 'MEDIUM',
        dialogue_turns_results: Array.isArray(attempt.dialogue_turns_results) ? attempt.dialogue_turns_results : [],
        grading_version: attempt.grading_version,
        overall_score: overallScore,
        pronunciation_score: pronunciationScore,
        fluency_score: fluencyScore,
        grammar_score: grammarScore,
        vocabulary_score: vocabularyScore,
        coherence_score: coherenceScore,
        content_score: contentScore,
        ai_evaluation: attempt.grading_origin === 'TEACHER' ? undefined : {
          ...attempt.ai_evaluation,
          overall_feedback: feedback,
          pronunciation_analysis: {
            score: pronunciationScore,
            issues: phonemeIssues,
            suggestions: mispronouncedSuggestions,
          },
          fluency_analysis: {
            score: fluencyScore,
            issues: fluencyIssues,
            suggestions: analysis.pedagogical_feedback?.priority_improvements_vi || [],
          },
          grammar_analysis: {
            score: grammarScore,
            issues: grammarIssues,
            suggestions: [],
          },
          vocabulary_analysis: {
            score: vocabularyScore,
            issues: vocabIssues,
            suggestions: vocabSuggestions,
          },
          coherence_analysis: {
            score: coherenceScore,
            issues: coherenceIssues,
            suggestions: coherenceSuggestions,
          },
          content_analysis: {
            score: contentScore,
            issues: contentIssues,
            suggestions: contentSuggestions,
          },
          improvement_tips: improvementTips,
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
      navigate(`/speaking/result/${attemptId}`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể gửi bản thu')
      } finally {
        submittingRef.current = false
        setIsSubmitting(false)
      }
    },
    [selectedExercise, queryClient, navigate]
  )

  const retryPendingSpeaking = useCallback(async () => {
    if (!pendingSpeaking || isSubmitting) return
    const user = useAuthStore.getState().user
    if (!user || !selectedExercise) return
    const draft = await readSkillDraft<{ hash: string; id: string; payload: Record<string, any> }>(`practice-speaking:${user.user_id}:${selectedExercise.id}`).catch(() => undefined)
    if (!draft?.id || !draft.payload) { toast.error('Chưa tải được bản nộp đã lưu. Vui lòng thử lại.'); return }
    const p = draft.payload
    await handleSubmitRecording(p.transcription || '', p.recording_duration_seconds ?? 0, undefined, p.difficulty_chosen, p.dialogue_turns_results, { recording_session_id: p.recording_session_id, recording_take_id: p.recording_take_id }, draft)
  }, [pendingSpeaking, isSubmitting, selectedExercise, handleSubmitRecording])

  const handlePracticeAgain = useCallback(() => {
    if (!selectedExercise) return
    setRecordingState({
      phase: 'idle',
      preparationTimeLeft: selectedExercise.preparation_time_seconds ?? 30,
      speakingTimeLeft: selectedExercise.response_time_seconds ?? 45,
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
    pendingSpeaking, retryPendingSpeaking,
    view,
    setView,
    exerciseList,
    selectedExercise,
    selectedTier,
    setSelectedTier,
    currentSubmission,
    historyAttempts,
    recordingState,
    setRecordingState,
    stats,
    progress,
    userSpeakingProfile,
    handleGoHome,
    handleGoList,
    handleGoHistory,
    handleSelectExercise,
    handleViewSubmission,
    handleStartPractice,
    handleSubmitRecording,
    handlePracticeAgain,
    handleNextExercise,
    isSubmitting,
    isLoadingExercises, exercisesError, refetchExercises,
    isLoadingHistory, historyError, refetchHistory,
  }
}
