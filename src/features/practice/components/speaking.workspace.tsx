import { resolveSpeakingPolicy } from '@/features/practice/lib/speaking-policy'
import { useSpeakingSession, type RecordingSubmission } from '@/features/practice/hooks/use.speaking.session'
/**
 * @file speaking.workspace.tsx
 * @description Component điều phối toàn diện phiên làm bài thi Speaking và chấm điểm trực tiếp
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import type { SpeakingExercise, RecordingState, SpeakingExerciseType, DialogueTurnAttemptResult } from '@/features/practice/types/speaking'
import { toast } from '@/store/toast.store'
import { SpeakingPromptCard } from '@/features/practice/components/speaking.prompt.card'
import { SpeakingRecorderPanel } from '@/features/practice/components/speaking.recorder.panel'
import { SpeakingDialogueWorkspace } from '@/features/practice/components/speaking.dialogue.workspace'
import { PracticeExitConfirmModal } from '@/features/practice/components/practice.exit-confirm.modal'

interface SpeakingWorkspaceProps {
  exercise: SpeakingExercise
  recordingState: RecordingState
  onUpdateRecording: (
    state: RecordingState | ((prev: RecordingState) => RecordingState)
  ) => void
  onSubmit: (
    transcription: string,
    duration: number,
    audioBlob?: Blob,
    difficultyChosen?: 'EASY' | 'MEDIUM' | 'HARD',
    dialogueTurnsResults?: DialogueTurnAttemptResult[],
    recordingSubmission?: RecordingSubmission
  ) => void
  onBack: () => void
  isSubmitting?: boolean
}

interface ISpeechRecognitionResult {
  [index: number]: { transcript: string }
  length: number
}

interface ISpeechRecognitionEvent {
  results: {
    [index: number]: ISpeechRecognitionResult
    length: number
  }
}

interface ISpeechRecognitionInstance {
  continuous?: boolean
  interimResults?: boolean
  lang: string
  onresult: ((event: ISpeechRecognitionEvent) => void) | null
  onerror?: (() => void) | null
  start: () => void
  stop?: () => void
}

interface SpeechRecognitionConstructor {
  new (): ISpeechRecognitionInstance
}

export function SpeakingWorkspace({
  exercise,
  recordingState,
  onUpdateRecording,
  onSubmit,
  onBack,
  isSubmitting = false,
}: SpeakingWorkspaceProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  if (exercise.exercise_type === 'SHORT_DIALOGUE' && exercise.dialogue_scenario) {
    return (
      <SpeakingDialogueWorkspace
        exercise={exercise}
        isVietnamese={isVietnamese}
        onBack={onBack}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
    )
  }

  return <SpeakingMonologueWorkspace key={exercise.id} {...{ exercise, recordingState, onUpdateRecording, onSubmit, onBack, isSubmitting }} />
}

function SpeakingMonologueWorkspace({ exercise, recordingState, onUpdateRecording, onSubmit, onBack, isSubmitting }: SpeakingWorkspaceProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [selectedTier, setSelectedTier] = useState<'EASY' | 'MEDIUM' | 'HARD'>(exercise.difficulty_level || 'MEDIUM')
  const session = useSpeakingSession(exercise, selectedTier)
  const reserveTake = session.reserve
  const policy = resolveSpeakingPolicy(exercise, selectedTier)
  const submissionRef = useRef<RecordingSubmission | undefined>(undefined)
  const startingRef = useRef(false)
  const mountedRef = useRef(true)
  const streamRef = useRef<MediaStream | null>(null)
  const localUrlRef = useRef<string | null>(null)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  const [transcription, setTranscription] = useState('')
  const speechRecognitionRef = useRef<ISpeechRecognitionInstance | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioBlobRef = useRef<Blob | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => { mountedRef.current = true; return () => {
    mountedRef.current = false
    speechRecognitionRef.current?.stop?.()
    const recorder = mediaRecorderRef.current
    if (recorder) { recorder.onstop = null; if (recorder.state !== 'inactive') recorder.stop() }
    streamRef.current?.getTracks().forEach(track => track.stop())
    audioRef.current?.pause()
    if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current)
  } }, [])

  const {
    phase,
    preparationTimeLeft,
    speakingTimeLeft,
    duration,
    audioUrl,
    isPlaying,
  } = recordingState

  const startRecording = useCallback(async () => {
    if (startingRef.current || mediaRecorderRef.current?.state === 'recording') return
    startingRef.current = true
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      streamRef.current = stream
      if (!mountedRef.current) { stream.getTracks().forEach(track => track.stop()); return }
      submissionRef.current = await reserveTake()
      if (!mountedRef.current) { stream.getTracks().forEach(track => track.stop()); return }
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
        if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current)
        const url = URL.createObjectURL(audioBlob)
        localUrlRef.current = url
        onUpdateRecording((prev: RecordingState) => ({
          ...prev,
          audioUrl: url,
          phase: 'reviewing',
        }))

        stream.getTracks().forEach((track) => track.stop())
      }

      const win = typeof window !== 'undefined' ? (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }) : {}
      const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition
      if (SpeechRec) {
        try {
          const recognition = new SpeechRec()
          recognition.continuous = true
          recognition.interimResults = true
          recognition.lang = 'en-US'
          recognition.onresult = (evt: ISpeechRecognitionEvent) => {
            let text = ''
            for (let i = 0; i < evt.results.length; i++) {
              text += evt.results[i][0].transcript + ' '
            }
            setTranscription(text.trim())
          }
          recognition.start()
          speechRecognitionRef.current = recognition
        } catch {}
      }

      mediaRecorder.start(250)
      onUpdateRecording((prev: RecordingState) => ({
        ...prev,
        phase: 'recording',
        duration: 0,
        preparationTimeLeft: 0,
        speakingTimeLeft: policy.response_time_seconds,
      }))
    } catch (error) {
      streamRef.current?.getTracks().forEach(track => track.stop())
      onUpdateRecording(prev => ({ ...prev, phase: 'idle' }))
      toast.error(
        isVietnamese
          ? (error instanceof Error ? error.message : 'Không thể truy cập microphone hoặc đã hết lượt thu âm.')
          : 'Cannot access microphone. Please check permissions.',
        isVietnamese ? 'Microphone' : 'Microphone error'
      )
    } finally { startingRef.current = false }
  }, [onUpdateRecording, isVietnamese, reserveTake, policy.response_time_seconds])

  const stopRecording = useCallback(() => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop?.()
      } catch {}
      speechRecognitionRef.current = null
    }
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

  const getTierTimes = (tier: 'EASY' | 'MEDIUM' | 'HARD') => {
    const config = resolveSpeakingPolicy(exercise, tier)
    return { prep: config.preparation_time_seconds, speak: config.response_time_seconds }
  }

  const handleSelectTier = (tier: 'EASY' | 'MEDIUM' | 'HARD') => {
    if ((session.counts.turn_0 || 0) > 0) return
    setSelectedTier(tier)
    const { prep, speak } = getTierTimes(tier)
    onUpdateRecording((prev: RecordingState) => ({
      ...prev,
      preparationTimeLeft: prep,
      speakingTimeLeft: speak,
    }))
  }

  const handleStartPractice = () => {
    if (policy.preparation_time_seconds > 0) {
      const { prep, speak } = getTierTimes(selectedTier)
      onUpdateRecording((prev: RecordingState) => ({
        ...prev,
        phase: 'preparing',
        preparationTimeLeft: prep,
        speakingTimeLeft: speak,
      }))
    } else {
      startRecording()
    }
  }

  const handleSkipPreparation = () => {
    if (phase === 'preparing') {
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
    const userTranscription = transcription.trim()
    onSubmit(userTranscription, duration, audioBlobRef.current || undefined, selectedTier, undefined, submissionRef.current)
  }

  const handleReset = () => {
    if ((session.counts.turn_0 || 0) >= policy.max_record_attempts) return
    audioBlobRef.current = null
    if (localUrlRef.current) { URL.revokeObjectURL(localUrlRef.current); localUrlRef.current = null }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    const { prep, speak } = getTierTimes(selectedTier)
    onUpdateRecording({
      phase: 'idle',
      preparationTimeLeft: prep,
      speakingTimeLeft: speak,
      duration: 0,
      audioUrl: null,
      isPlaying: false,
      playbackPosition: 0,
    })
    setTranscription('')
  }

  const handleBackClick = () => {
    // Nếu người dùng đang thu âm, đang chuẩn bị, hoặc đã có ghi âm/văn bản
    if (phase !== 'idle' || transcription.trim() || audioUrl) {
      setShowExitConfirm(true)
    } else {
      onBack()
    }
  }

  const handleConfirmExit = () => {
    if (phase === 'recording') {
      stopRecording()
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setShowExitConfirm(false)
    onBack()
  }

  const handleResume = () => {
    setShowExitConfirm(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const typeLabels: Record<SpeakingExerciseType, string> = {
    READ_ALOUD: isVietnamese ? 'Đọc to' : 'Read Aloud',
    DESCRIBE_PICTURE: isVietnamese ? 'Mô tả tranh' : 'Describe Picture',
    SHORT_DIALOGUE: isVietnamese ? 'Hội thoại ngắn' : 'Short Dialogue',
    ANSWER_QUESTION: isVietnamese ? 'Trả lời câu hỏi' : 'Answer Question',
    OPINION_RESPONSE: isVietnamese ? 'Trình bày quan điểm' : 'Express Opinion',
    TOPIC: isVietnamese ? 'Chủ đề' : 'Topic',
    RESPOND_SITUATION: isVietnamese ? 'Phản hồi' : 'Respond',
    PRONUNCIATION: isVietnamese ? 'Phát âm' : 'Pronunciation',
    SHADOWING: isVietnamese ? 'Bắt chước' : 'Shadowing',
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={handleBackClick}
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
        showHints={policy.show_hints}
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
        needsPreparation={Boolean(exercise.tiered_time_limits)}
        canRetake={(session.counts.turn_0 || 0) < policy.max_record_attempts}
        takesUsed={session.counts.turn_0 || 0}
        selectedTier={selectedTier}
        onSelectTier={handleSelectTier}
        onSkipPreparation={handleSkipPreparation}
        audioRef={audioRef}
        formatTime={formatTime}
        onStartPractice={handleStartPractice}
        onStopRecording={stopRecording}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Modal xác nhận thoát bài tập Speaking */}
      <PracticeExitConfirmModal
        isOpen={showExitConfirm}
        onClose={handleResume}
        onConfirmExit={handleConfirmExit}
        title={isVietnamese ? 'Dừng bài luyện nói?' : 'Exit Speaking Practice?'}
        description={
          isVietnamese
            ? 'Bạn đang trong quá trình thực hiện bài nói. Nếu thoát bây giờ, bản ghi âm và tiến trình của bài này sẽ không được lưu.'
            : 'You are currently practicing speaking. If you exit now, your recording and progress will not be saved.'
        }
        savedNotice={
          isVietnamese
            ? 'Hãy hoàn thành bài nói và nhấn Nộp bài để AI chấm điểm và cập nhật tiến trình của bạn.'
            : 'Complete your recording and submit to get AI feedback and update your profile.'
        }
        confirmText={isVietnamese ? 'Thoát bài tập' : 'Exit Practice'}
        cancelText={isVietnamese ? 'Tiếp tục luyện' : 'Resume Practice'}
      />
    </main>
  )
}
