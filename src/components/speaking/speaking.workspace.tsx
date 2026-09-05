/**
 * @file speaking.workspace.tsx
 * @description Component điều phối toàn diện phiên làm bài thi Speaking và chấm điểm trực tiếp
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import type { SpeakingExercise, RecordingState, SpeakingExerciseType } from '@/types/speaking'
import { toast } from '@/store/toast-store'
import { SpeakingPromptCard } from './speaking.prompt.card'
import { SpeakingRecorderPanel } from './speaking.recorder.panel'

interface SpeakingWorkspaceProps {
  exercise: SpeakingExercise
  recordingState: RecordingState
  onUpdateRecording: (
    state: RecordingState | ((prev: RecordingState) => RecordingState)
  ) => void
  onSubmit: (transcription: string, duration: number, audioBlob?: Blob) => void
  onBack: () => void
}

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

  const [, setTranscription] = useState('')
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

  const startRecording = useCallback(async () => {
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

      const mimeType =
        [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/mp4',
          'audio/aac',
        ].find((type) => MediaRecorder.isTypeSupported(type)) || ''

      const mediaRecorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      )
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const finalMime = mediaRecorder.mimeType || mimeType || 'audio/webm'
        const audioBlob = new Blob(audioChunksRef.current, { type: finalMime })
        audioBlobRef.current = audioBlob
        const url = URL.createObjectURL(audioBlob)
        onUpdateRecording((prev: RecordingState) => ({
          ...prev,
          audioUrl: url,
          phase: 'reviewing',
        }))

        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(250)
      onUpdateRecording((prev: RecordingState) => ({
        ...prev,
        phase: 'recording',
        duration: 0,
        preparationTimeLeft: 0,
      }))
    } catch {
      toast.error(
        isVietnamese
          ? 'Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.'
          : 'Cannot access microphone. Please check permissions.',
        isVietnamese ? 'Microphone' : 'Microphone error'
      )
    }
  }, [onUpdateRecording, isVietnamese])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.requestData()
        }
      } catch {}
      mediaRecorderRef.current.stop()
    }
  }, [])

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
  }, [phase, preparationTimeLeft, speakingTimeLeft, onUpdateRecording, startRecording])

  useEffect(() => {
    if (phase === 'recording' && speakingTimeLeft === 0) {
      stopRecording()
    }
  }, [speakingTimeLeft, phase, stopRecording])

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
    const mockTranscription =
      exercise.exercise_type === 'PRONUNCIATION'
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
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-[14px] text-text-secondary hover:text-primary cursor-pointer"
        >
          <ArrowLeft size={18} />
          {isVietnamese ? 'Quay lại' : 'Back'}
        </button>
        <div className="flex-1">
          <h1 className="text-[20px] font-bold text-text-primary">{exercise.title}</h1>
          <p className="text-[13px] text-text-secondary">{exercise.title_vi}</p>
        </div>
      </div>

      <SpeakingPromptCard
        exercise={exercise}
        isVietnamese={isVietnamese}
        typeLabels={typeLabels}
      />

      <SpeakingRecorderPanel
        phase={phase}
        exercise={exercise}
        preparationTimeLeft={preparationTimeLeft}
        speakingTimeLeft={speakingTimeLeft}
        duration={duration}
        audioUrl={audioUrl}
        isPlaying={isPlaying}
        isVietnamese={isVietnamese}
        needsPreparation={needsPreparation(exercise.exercise_type)}
        audioRef={audioRef}
        formatTime={formatTime}
        onStartPractice={handleStartPractice}
        onStopRecording={stopRecording}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        onSubmit={handleSubmit}
      />
    </main>
  )
}
