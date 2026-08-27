
import { useState, useCallback } from 'react'
import { Layout } from '@/components/layout/Layout'
import { SpeakingHome } from '@/components/speaking/SpeakingHome'
import { SpeakingExerciseList } from '@/components/speaking/SpeakingExerciseList'
import { SpeakingWorkspace } from '@/components/speaking/SpeakingWorkspace'
import { SpeakingResult } from '@/components/speaking/SpeakingResult'
import { SpeakingHistory } from '@/components/speaking/SpeakingHistory'
import {
  speakingExercises,
  speakingAttempts,
  speakingStats,
  speakingProgress,
} from '@/data/speaking-data'
import { practiceService } from '@/services/practice.service'
import type { SpeakingExercise, SpeakingAttempt, RecordingState } from '@/types/speaking'
import type { SpeechAssessmentResult } from '@/types/api.types'

type ViewState = 'home' | 'list' | 'workspace' | 'result' | 'history'

export function SpeakingRoute() {
  const [view, setView] = useState<ViewState>('home')
  const [selectedExercise, setSelectedExercise] = useState<SpeakingExercise | null>(null)
  const [currentSubmission, setCurrentSubmission] = useState<SpeakingAttempt | null>(null)
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
  const [userTranscript, setUserTranscript] = useState('')

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

  const handleStartPractice = useCallback((exercise: SpeakingExercise) => {
    handleSelectExercise(exercise)
  }, [handleSelectExercise])

  const handleSubmitRecording = useCallback(async (transcription: string, duration: number, audioBlob?: Blob) => {
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
          selectedExercise.topic,
        )
        if (assessment) {
          finalTranscript = assessment.transcribed_text ? assessment.transcribed_text : finalTranscript
          pronunciationScore = assessment.pronunciation_score !== undefined ? assessment.pronunciation_score : 0
          fluencyScore = assessment.fluency_score !== undefined ? assessment.fluency_score : 0
          overallScore = assessment.overall_score !== undefined ? assessment.overall_score : 0
          feedback = assessment.feedback_vi ? assessment.feedback_vi : ''
        }
      } catch (err) {
        console.error('API Speech Evaluation error:', err)
      }
    }

    const newSubmission: SpeakingAttempt = {
      id: `sa-${Date.now()}`,
      user_id: 'user-001',
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
          issues: ['Chú ý các âm đuôi và nguyên âm đôi'],
          suggestions: ['Luyện phát âm rõ ràng hơn theo mốc thời gian Whisper STT'],
        },
        fluency_analysis: {
          score: fluencyScore,
          issues: ['Có một vài khoảng ngắt tự nhiên'],
          suggestions: ['Sử dụng thêm từ nối để tăng độ mượt mà'],
        },
        grammar_analysis: {
          score: overallScore,
          issues: [],
          suggestions: ['Cấu trúc câu phong phú và tự nhiên'],
        },
        vocabulary_analysis: {
          score: overallScore,
          issues: [],
          suggestions: ['Sử dụng từ vựng đa dạng, phù hợp ngữ cảnh'],
        },
        coherence_analysis: {
          score: 7.5,
          issues: [],
          suggestions: ['Mạch lạc, liên kết ý tốt'],
        },
        content_analysis: {
          score: 7.5,
          issues: [],
          suggestions: ['Đáp ứng đúng trọng tâm câu hỏi'],
        },
        improvement_tips: [
          'Thực hành ghi âm thường xuyên để làm quen phản xạ',
          'Nghe lại bản ghi âm để tự nhận diện lỗi phát âm',
        ],
      },
      domain: 'SPEAKING',
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }

    setIsSubmitting(false)
    setCurrentSubmission(newSubmission)
    setUserTranscript(finalTranscript)
    setRecordingState((prev) => ({ ...prev, phase: 'reviewing' }))
    setView('result')
  }, [selectedExercise])

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
    setUserTranscript('')
    setView('workspace')
  }, [selectedExercise])

  const handleNextExercise = useCallback(() => {
    if (!selectedExercise) return

    const currentIndex = speakingExercises.findIndex(e => e.id === selectedExercise.id)
    const nextExercise = speakingExercises[(currentIndex + 1) % speakingExercises.length]
    handleSelectExercise(nextExercise)
  }, [selectedExercise, handleSelectExercise])

  const renderContent = () => {
    switch (view) {
      case 'list':
        return (
          <SpeakingExerciseList
            exercises={speakingExercises}
            onSelectExercise={handleSelectExercise}
            onBack={handleGoHome}
          />
        )

      case 'workspace':
        if (!selectedExercise) return null
        return (
          <SpeakingWorkspace
            exercise={selectedExercise}
            recordingState={recordingState}
            onUpdateRecording={setRecordingState}
            onSubmit={handleSubmitRecording}
            onBack={handleGoList}
          />
        )

      case 'result':
        if (!currentSubmission || !selectedExercise) return null
        return (
          <SpeakingResult
            submission={currentSubmission}
            exercise={selectedExercise}
            onBack={handleGoList}
            onPracticeAgain={handlePracticeAgain}
            onNextExercise={handleNextExercise}
          />
        )

      case 'history':
        return (
          <SpeakingHistory
            attempts={speakingAttempts}
            exercises={speakingExercises}
            onBack={handleGoHome}
            onViewAttempt={handleViewSubmission}
          />
        )

      case 'home':
      default:
        return (
          <SpeakingHome
            stats={speakingStats}
            progress={speakingProgress}
            recentAttempts={speakingAttempts.slice(0, 5)}
            exercises={speakingExercises}
            onStartPractice={handleStartPractice}
            onViewAll={() => setView('list')}
            onViewHistory={handleGoHistory}
          />
        )
    }
  }

  return <Layout>{renderContent()}</Layout>
}
