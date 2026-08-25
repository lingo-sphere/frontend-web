// Updated: 2026-08-20
// Speaking Practice Route - LingoSphere

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
import type { SpeakingExercise, SpeakingAttempt, RecordingState } from '@/types/speaking'

type ViewState = 'home' | 'list' | 'workspace' | 'result' | 'history'

export function SpeakingRoute() {
  const [view, setView] = useState<ViewState>('home')
  const [selectedExercise, setSelectedExercise] = useState<SpeakingExercise | null>(null)
  const [currentSubmission, setCurrentSubmission] = useState<SpeakingAttempt | null>(null)
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

  // Navigation handlers
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

  const handleSubmitRecording = useCallback((transcription: string, duration: number) => {
    if (!selectedExercise) return

    // Create mock submission
    const newSubmission: SpeakingAttempt = {
      id: `sa-${Date.now()}`,
      user_id: 'user-001',
      exercise_id: selectedExercise.id,
      attempt_number: 1,
      is_best_attempt: true,
      recording_duration_seconds: duration,
      speaking_time_seconds: duration,
      transcription: transcription,
      overall_score: 7.5,
      pronunciation_score: 7.5,
      fluency_score: 7.0,
      grammar_score: 7.5,
      vocabulary_score: 8.0,
      coherence_score: 7.5,
      content_score: 7.5,
      ai_evaluation: {
        overall_feedback: 'Good job! Your response demonstrates solid speaking skills. Continue practicing to improve fluency and reduce pauses.',
        pronunciation_analysis: {
          score: 7.5,
          issues: ['Some sounds could be clearer'],
          suggestions: ['Practice word endings and vowel sounds'],
        },
        fluency_analysis: {
          score: 7.0,
          issues: ['Occasional pauses between ideas'],
          suggestions: ['Use transition words to connect thoughts'],
        },
        grammar_analysis: {
          score: 7.5,
          issues: ['Minor grammar issues'],
          suggestions: ['Review sentence structures'],
        },
        vocabulary_analysis: {
          score: 8.0,
          issues: [],
          suggestions: ['Good vocabulary range for this level'],
        },
        coherence_analysis: {
          score: 7.5,
          issues: ['Could use more linking phrases'],
          suggestions: ['Add transitional phrases'],
        },
        content_analysis: {
          score: 7.5,
          issues: [],
          suggestions: ['Good coverage of the topic'],
        },
        improvement_tips: [
          'Practice speaking about familiar topics regularly',
          'Record yourself and listen back to identify areas for improvement',
        ],
      },
      domain: 'SPEAKING',
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }

    setCurrentSubmission(newSubmission)
    setUserTranscript(transcription)
    setRecordingState(prev => ({ ...prev, phase: 'reviewing' }))
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
    // Find next exercise of same type
    const currentIndex = speakingExercises.findIndex(e => e.id === selectedExercise.id)
    const nextExercise = speakingExercises[(currentIndex + 1) % speakingExercises.length]
    handleSelectExercise(nextExercise)
  }, [selectedExercise, handleSelectExercise])

  // Render content based on view
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
