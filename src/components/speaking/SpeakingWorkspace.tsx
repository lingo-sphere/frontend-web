// Updated: 2026-08-22
// Speaking Workspace - Common Recording UI for all exercise types
// LingoSphere

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Mic, MicOff, Play, Pause, Square, RotateCcw, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { SpeakingExercise, RecordingState, SpeakingExerciseType } from '@/types/speaking'

interface SpeakingWorkspaceProps {
  exercise: SpeakingExercise
  recordingState: RecordingState
  onUpdateRecording: (state: RecordingState | ((prev: RecordingState) => RecordingState)) => void
  onSubmit: (transcription: string, duration: number, audioBlob?: Blob) => void
  onBack: () => void
}

// Check if exercise needs preparation time
const needsPreparation = (type: SpeakingExerciseType): boolean => {
  return type === 'TOPIC' || type === 'RESPOND_SITUATION'
}

export function SpeakingWorkspace({
  exercise,
  recordingState,
  onUpdateRecording,
  onSubmit,
  onBack,
}: SpeakingWorkspaceProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [transcription, setTranscription] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioBlobRef = useRef<Blob | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const {
    phase,
    preparationTimeLeft,
    speakingTimeLeft,
    duration,
    audioUrl,
    isPlaying,
  } = recordingState

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (phase === 'preparing' && preparationTimeLeft > 0) {
      interval = setInterval(() => {
        onUpdateRecording((prev: RecordingState) => ({
          ...prev,
          preparationTimeLeft: prev.preparationTimeLeft - 1,
        }))
      }, 1000)
    } else if (phase === 'preparing' && preparationTimeLeft === 0) {
      // Start recording automatically after preparation
      startRecording()
    }

    if (phase === 'recording' && speakingTimeLeft > 0) {
      interval = setInterval(() => {
        onUpdateRecording((prev: RecordingState) => ({
          ...prev,
          speakingTimeLeft: prev.speakingTimeLeft - 1,
          duration: prev.duration + 1,
        }))
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [phase, preparationTimeLeft, speakingTimeLeft, onUpdateRecording])

  // Auto-stop when time runs out
  useEffect(() => {
    if (phase === 'recording' && speakingTimeLeft === 0) {
      stopRecording()
    }
  }, [speakingTimeLeft, phase])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        audioBlobRef.current = audioBlob
        const url = URL.createObjectURL(audioBlob)
        onUpdateRecording((prev: RecordingState) => ({
          ...prev,
          audioUrl: url,
          phase: 'reviewing',
        }))

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      onUpdateRecording((prev: RecordingState) => ({
        ...prev,
        phase: 'recording',
        duration: 0,
        preparationTimeLeft: 0,
      }))
    } catch (error) {
      console.error('Error starting recording:', error)
      alert(isVietnamese ? 'Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.' : 'Cannot access microphone. Please check permissions.')
    }
  }, [onUpdateRecording, isVietnamese])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const handleStartPractice = () => {
    if (needsPreparation(exercise.exercise_type)) {
      onUpdateRecording((prev: RecordingState) => ({
        ...prev,
        phase: 'preparing',
        preparationTimeLeft: exercise.preparation_time_seconds || 30,
      }))
    } else {
      startRecording()
    }
  }

  const handlePlayPause = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl!)
      audioRef.current.onended = () => {
        onUpdateRecording((prev: RecordingState) => ({ ...prev, isPlaying: false }))
      }
    }

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    onUpdateRecording((prev: RecordingState) => ({ ...prev, isPlaying: !prev.isPlaying }))
  }

  const handleSubmit = () => {
    const mockTranscription = exercise.exercise_type === 'PRONUNCIATION'
      ? exercise.source_text || 'ship sheep sheet walk talk'
      : 'This is a sample transcription of your speaking response.'

    setTranscription(mockTranscription)
    onSubmit(mockTranscription, duration, audioBlobRef.current || undefined)
  }

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    onUpdateRecording({
      phase: 'idle',
      preparationTimeLeft: exercise.preparation_time_seconds || 30,
      speakingTimeLeft: exercise.response_time_seconds || 60,
      duration: 0,
      audioUrl: null,
      isPlaying: false,
      playbackPosition: 0,
    })
    setTranscription('')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const typeLabels: Record<SpeakingExerciseType, string> = {
    TOPIC: isVietnamese ? 'Chủ đề' : 'Topic',
    RESPOND_SITUATION: isVietnamese ? 'Phản hồi' : 'Respond',
    PRONUNCIATION: isVietnamese ? 'Phát âm' : 'Pronunciation',
    READ_ALOUD: isVietnamese ? 'Đọc to' : 'Read Aloud',
    SHADOWING: isVietnamese ? 'Bắt chước' : 'Shadowing',
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[14px] text-text-secondary hover:text-primary"
        >
          <ArrowLeft size={18} />
          {isVietnamese ? 'Quay lại' : 'Back'}
        </button>
        <div className="flex-1">
          <h1 className="text-[20px] font-bold text-text-primary">{exercise.title}</h1>
          <p className="text-[13px] text-text-secondary">{exercise.title_vi}</p>
        </div>
      </div>

      {/* Exercise Info */}
      <Card className="mb-6 dashboard-card">
        <CardContent className="p-4">
          {/* Instructions */}
          <div className="mb-4">
            <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
              {isVietnamese ? 'Hướng dẫn' : 'Instructions'}
            </h2>
            <p className="text-[13px] text-text-secondary">
              {isVietnamese ? exercise.prompt_text_vi : exercise.prompt_text_en}
            </p>
          </div>

          {/* Prompt for TOPIC/RESPOND_SITUATION */}
          {(exercise.exercise_type === 'TOPIC' || exercise.exercise_type === 'RESPOND_SITUATION') && (
            <div className="mb-4 rounded-xl bg-surface-subtle p-4">
              <h3 className="mb-2 text-[13px] font-medium text-text-primary">
                {isVietnamese ? 'Nội dung' : 'Content'}
              </h3>
              <p className="text-[14px] leading-relaxed text-text-primary">
                {exercise.prompt_text_en}
              </p>
            </div>
          )}

          {/* Source text for PRONUNCIATION/READ_ALOUD/SHADOWING */}
          {(exercise.exercise_type === 'PRONUNCIATION' || exercise.exercise_type === 'READ_ALOUD') && exercise.source_text && (
            <div className="mb-4 rounded-xl bg-surface-subtle p-4">
              <h3 className="mb-2 flex items-center gap-2 text-[13px] font-medium text-text-primary">
                <Volume2 size={16} />
                {isVietnamese ? 'Văn bản để đọc' : 'Text to read'}
              </h3>
              <p className="text-[15px] leading-relaxed text-text-primary">
                {exercise.source_text}
              </p>
            </div>
          )}

          {/* Target info */}
          <div className="flex flex-wrap gap-3 text-[12px]">
            <span className="rounded-full bg-surface-subtle px-3 py-1 text-text-secondary">
              {isVietnamese ? 'Loại:' : 'Type:'} {typeLabels[exercise.exercise_type]}
            </span>
            <span className="rounded-full bg-surface-subtle px-3 py-1 text-text-secondary">
              {isVietnamese ? 'Chuẩn bị:' : 'Prep:'} {exercise.preparation_time_seconds || 0}s
            </span>
            <span className="rounded-full bg-surface-subtle px-3 py-1 text-text-secondary">
              {isVietnamese ? 'Thời gian:' : 'Time:'} {exercise.response_time_seconds || 60}s
            </span>
            {exercise.cefr_level && (
              <span className="rounded-full bg-surface-subtle px-3 py-1 text-text-secondary">
                CEFR: {exercise.cefr_level}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recording Area */}
      <Card className="dashboard-card">
        <CardContent className="p-6">
          {phase === 'idle' && (
            <div className="text-center">
              {/* Microphone icon */}
              <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
                <Mic className="h-16 w-16 text-primary" />
              </div>

              <h2 className="mb-2 text-[18px] font-semibold text-text-primary">
                {isVietnamese ? 'Sẵn sàng để luyện?' : 'Ready to practice?'}
              </h2>
              <p className="mb-6 text-[14px] text-text-secondary">
                {needsPreparation(exercise.exercise_type)
                  ? `${isVietnamese ? 'Bạn có' : 'You have'} ${exercise.preparation_time_seconds || 30} ${isVietnamese ? 'giây để chuẩn bị.' : 'seconds to prepare.'}`
                  : (isVietnamese ? 'Nhấn nút bên dưới để bắt đầu ghi âm.' : 'Press the button below to start recording.')}
              </p>

              <Button
                size="lg"
                className="h-14 gap-2 bg-primary px-8 text-base font-semibold hover:bg-primary-hover"
                onClick={handleStartPractice}
              >
                <Mic size={20} />
                {isVietnamese ? 'Bắt đầu luyện' : 'Start Practice'}
              </Button>
            </div>
          )}

          {phase === 'preparing' && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-amber-100">
                <span className="text-5xl font-bold text-amber-600">{preparationTimeLeft}</span>
              </div>

              <h2 className="mb-2 text-[18px] font-semibold text-text-primary">
                {isVietnamese ? 'Thời gian chuẩn bị' : 'Preparation Time'}
              </h2>
              <p className="text-[14px] text-text-secondary">
                {isVietnamese ? 'Hãy đọc kỹ nội dung và chuẩn bị câu trả lời.' : 'Read the content carefully and prepare your response.'}
              </p>
            </div>
          )}

          {phase === 'recording' && (
            <div className="text-center">
              {/* Recording indicator */}
              <div className="mb-6 flex items-center justify-center gap-3">
                <div className="relative">
                  <div className="h-32 w-32 animate-pulse rounded-full bg-red-500/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Mic className="h-16 w-16 text-red-500" />
                  </div>
                </div>
                <div className="h-32 w-32 animate-pulse rounded-full bg-red-500/10" />
              </div>

              {/* Timer */}
              <div className="mb-4">
                <span className="text-4xl font-bold text-red-500">{formatTime(speakingTimeLeft)}</span>
              </div>

              <h2 className="mb-2 text-[18px] font-semibold text-red-500">
                {isVietnamese ? 'Đang ghi âm...' : 'Recording...'}
              </h2>
              <p className="mb-6 text-[14px] text-text-secondary">
                {isVietnamese ? 'Nói câu trả lời của bạn. Nhấn Stop khi xong.' : 'Speak your response. Press Stop when done.'}
              </p>

              <Button
                size="lg"
                variant="outline"
                className="h-14 gap-2 border-red-500 text-red-500 hover:bg-red-50"
                onClick={stopRecording}
              >
                <Square size={20} />
                {isVietnamese ? 'Dừng ghi' : 'Stop Recording'}
              </Button>
            </div>
          )}

          {phase === 'reviewing' && audioUrl && (
            <div className="text-center">
              {/* Playback */}
              <div className="mb-6">
                <audio ref={audioRef} src={audioUrl} />
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
                  <Play className="h-12 w-12 text-emerald-600" />
                </div>

                <div className="mb-4 flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </Button>
                </div>

                <p className="text-[14px] text-text-secondary">
                  {isVietnamese ? 'Thời gian ghi âm:' : 'Recording time:'} {formatTime(duration)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleReset}
                >
                  <RotateCcw size={18} />
                  {isVietnamese ? 'Làm lại' : 'Try Again'}
                </Button>
                <Button
                  className="gap-2 bg-primary hover:bg-primary-hover"
                  onClick={handleSubmit}
                >
                  {isVietnamese ? 'Gửi kết quả' : 'Submit'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
