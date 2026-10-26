/**
 * @file speaking.dialogue.workspace.tsx
 * @description Không gian luyện nói đối thoại tương tác (Structured Role-play) chuẩn hóa:
 * - Chọn 3 mức độ thích ứng: Dễ (Read-along), Trung bình (Guided), Khó (Independent)
 * - Tự động phát âm thanh của Bot trước (R2 audio / SpeechSynthesis)
 * - VAD ngắt mic thông minh có Grace Period + Nút hoàn thành thủ công
 * - Bộ đếm giờ thực hành tăng dần (Elapsed Timer)
 * - Tách bạch audio và metrics từng lượt (Response Latency, Speaking Duration)
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  ArrowLeft,
  Volume2,
  Mic,
  MicOff,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Play,
  Pause,
  AlertCircle,
  HelpCircle,
  Users,
  Clock,
  Send,
  Check,
  X,
} from 'lucide-react'
import type {
  SpeakingExercise,
  DifficultyLevel,
  DialogueTurn,
  DialogueTurnAttemptResult,
} from '@/features/practice/types/speaking'
import { resolveMediaUrlAsync } from '@/utils/media.utils'
import { PracticeExitConfirmModal } from '@/features/practice/components/practice.exit-confirm.modal'

interface SpeakingDialogueWorkspaceProps {
  exercise: SpeakingExercise
  isVietnamese: boolean
  onBack: () => void
  onSubmit: (
    transcription: string,
    duration: number,
    audioBlob?: Blob,
    difficultyChosen?: DifficultyLevel,
    dialogueTurnsResults?: DialogueTurnAttemptResult[]
  ) => void
  isSubmitting?: boolean
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

type VadState = 'WAITING_FOR_SPEECH' | 'SPEAKING' | 'GRACE_PERIOD' | 'IDLE'

export function SpeakingDialogueWorkspace({
  exercise,
  isVietnamese,
  onBack,
  onSubmit,
  isSubmitting = false,
}: SpeakingDialogueWorkspaceProps) {
  const scenario = exercise.dialogue_scenario
  const turns = useMemo(() => scenario?.turns || [], [scenario])

  // 1. Cấu hình mức độ luyện tập (Scaffolding level)
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('MEDIUM')
  const [isStarted, setIsStarted] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  // 2. State tiến trình hội thoại
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0)
  const [isBotSpeaking, setIsBotSpeaking] = useState(false)
  const [vadState, setVadState] = useState<VadState>('IDLE')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [turnAudioBlobs, setTurnAudioBlobs] = useState<Record<number, Blob>>({})
  const [turnAudioUrls, setTurnAudioUrls] = useState<Record<number, string>>({})
  const [turnTranscripts, setTurnTranscripts] = useState<Record<number, string>>({})
  const [turnsResults, setTurnsResults] = useState<DialogueTurnAttemptResult[]>([])

  // 3. Audio & Web Speech Refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)
  const speechRecognitionRef = useRef<any>(null)

  // 3.1 Audio Replay & Playback state & refs
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null)
  const replayAudioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlsRef = useRef<string[]>([])

  // 4. Timing measurement refs
  const turnBotFinishedTimeRef = useRef<number>(0)
  const turnSpeechStartedTimeRef = useRef<number>(0)
  const turnSpeechDurationRef = useRef<number>(0)
  const graceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [audioVolumeLevel, setAudioVolumeLevel] = useState(0)

  const activeTurn: DialogueTurn | undefined = turns[currentTurnIndex]

  // Đếm thời gian thực hành (Elapsed Timer)
  useEffect(() => {
    if (isStarted && !isFinished) {
      elapsedTimerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current)
    }
    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current)
    }
  }, [isStarted, isFinished])

  // Dọn dẹp âm thanh khi unmount
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause()
        audioPlayerRef.current = null
      }
      if (replayAudioRef.current) {
        replayAudioRef.current.pause()
        replayAudioRef.current = null
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current)
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop()
        } catch {}
      }
      // Thu hồi tất cả Object URLs đã sinh ra
      audioUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url)
        } catch {}
      })
    }
  }, [])

  // =========================================================================
  // AUDIO REPLAY HELPERS: Dừng và phát lại âm thanh của User và Bot
  // =========================================================================
  const stopAnyPlayback = useCallback(() => {
    if (replayAudioRef.current) {
      replayAudioRef.current.pause()
      replayAudioRef.current.currentTime = 0
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setPlayingAudioKey(null)
  }, [])

  const replayUserAudio = useCallback(
    (turnIndex: number) => {
      const audioKey = `user-${turnIndex}`
      if (playingAudioKey === audioKey) {
        stopAnyPlayback()
        return
      }

      stopAnyPlayback()
      let audioUrl = turnAudioUrls[turnIndex]
      if (!audioUrl && turnAudioBlobs[turnIndex]) {
        audioUrl = URL.createObjectURL(turnAudioBlobs[turnIndex])
        audioUrlsRef.current.push(audioUrl)
        setTurnAudioUrls((prev) => ({ ...prev, [turnIndex]: audioUrl }))
      }

      if (!audioUrl) return

      const audio = new Audio(audioUrl)
      replayAudioRef.current = audio
      setPlayingAudioKey(audioKey)

      audio.onended = () => {
        setPlayingAudioKey(null)
      }
      audio.onerror = () => {
        setPlayingAudioKey(null)
      }
      audio.play().catch(() => setPlayingAudioKey(null))
    },
    [playingAudioKey, turnAudioUrls, turnAudioBlobs, stopAnyPlayback]
  )

  const speakReplaySpeechSynthesis = useCallback((text: string, audioKey: string) => {
    if (!('speechSynthesis' in window)) {
      setPlayingAudioKey(null)
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.95

    const voices = window.speechSynthesis.getVoices()
    const englishVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Jenny'))
      ) || voices.find((v) => v.lang.startsWith('en'))
    if (englishVoice) {
      utterance.voice = englishVoice
    }

    utterance.onend = () => setPlayingAudioKey(null)
    utterance.onerror = () => setPlayingAudioKey(null)
    window.speechSynthesis.speak(utterance)
  }, [])

  const replayBotAudio = useCallback(
    async (turn: DialogueTurn, turnIndex: number) => {
      const audioKey = `bot-${turnIndex}`
      if (playingAudioKey === audioKey) {
        stopAnyPlayback()
        return
      }

      stopAnyPlayback()
      setPlayingAudioKey(audioKey)

      // Ưu tiên 1: Audio file từ R2 nếu có
      if (turn.prompt_audio_id) {
        try {
          const resolvedUrl = await resolveMediaUrlAsync(turn.prompt_audio_id)
          if (resolvedUrl) {
            const audio = new Audio(resolvedUrl)
            replayAudioRef.current = audio
            audio.onended = () => setPlayingAudioKey(null)
            audio.onerror = () => {
              speakReplaySpeechSynthesis(turn.text_en, audioKey)
            }
            await audio.play()
            return
          }
        } catch {
          // fallback
        }
      }

      // Ưu tiên 2: Fallback qua Web Speech API
      speakReplaySpeechSynthesis(turn.text_en, audioKey)
    },
    [playingAudioKey, stopAnyPlayback, speakReplaySpeechSynthesis]
  )

  // Cho phép thu âm lại lượt thoại (Retake turn)
  const handleRetakeTurn = useCallback(
    (turnIndex: number) => {
      stopAnyPlayback()

      // Thu hồi audio URL của turn này
      if (turnAudioUrls[turnIndex]) {
        try {
          URL.revokeObjectURL(turnAudioUrls[turnIndex])
        } catch {}
      }

      setTurnAudioUrls((prev) => {
        const next = { ...prev }
        delete next[turnIndex]
        return next
      })

      setTurnAudioBlobs((prev) => {
        const next = { ...prev }
        delete next[turnIndex]
        return next
      })

      setTurnTranscripts((prev) => {
        const next = { ...prev }
        delete next[turnIndex]
        return next
      })

      const targetTurnNumber = turns[turnIndex]?.turn_number || turnIndex + 1
      setTurnsResults((prev) => prev.filter((r) => r.turn_number !== targetTurnNumber))

      setCurrentTurnIndex(turnIndex)
      setVadState('IDLE')
      setIsFinished(false)
      setIsReviewModalOpen(false)
    },
    [stopAnyPlayback, turnAudioUrls, turns]
  )

  // =========================================================================
  // BOT VOICE ENGINE: Phát âm thanh của Bot
  // =========================================================================
  const playBotAudio = useCallback(async (turn: DialogueTurn) => {
    setIsBotSpeaking(true)
    setVadState('IDLE')

    // Ưu tiên 1: Audio file từ R2 nếu có prompt_audio_id
    if (turn.prompt_audio_id) {
      try {
        const resolvedUrl = await resolveMediaUrlAsync(turn.prompt_audio_id)
        if (resolvedUrl) {
          if (!audioPlayerRef.current) {
            audioPlayerRef.current = new Audio()
          }
          audioPlayerRef.current.src = resolvedUrl
          audioPlayerRef.current.onended = () => {
            setIsBotSpeaking(false)
            turnBotFinishedTimeRef.current = Date.now()
            handleBotFinished()
          }
          audioPlayerRef.current.onerror = () => {
            // Fallback sang SpeechSynthesis nếu phát audio lỗi
            speakWithSpeechSynthesis(turn.text_en)
          }
          await audioPlayerRef.current.play()
          return
        }
      } catch (err) {
        console.warn('[Dialogue] Failed to play prompt_audio_id, fallback to Web Speech:', err)
      }
    }

    // Ưu tiên 2: Fallback qua Web Speech API (speechSynthesis)
    speakWithSpeechSynthesis(turn.text_en)
  }, [])

  const speakWithSpeechSynthesis = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setIsBotSpeaking(false)
      turnBotFinishedTimeRef.current = Date.now()
      handleBotFinished()
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.95

    // Chọn voice tiếng Anh chuẩn nếu có
    const voices = window.speechSynthesis.getVoices()
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny'))
    ) || voices.find((v) => v.lang.startsWith('en'))
    if (englishVoice) {
      utterance.voice = englishVoice
    }

    utterance.onend = () => {
      setIsBotSpeaking(false)
      turnBotFinishedTimeRef.current = Date.now()
      handleBotFinished()
    }
    utterance.onerror = () => {
      setIsBotSpeaking(false)
      turnBotFinishedTimeRef.current = Date.now()
      handleBotFinished()
    }

    window.speechSynthesis.speak(utterance)
  }

  // Khi Bot nói xong -> Chuyển sang lượt của User hoặc turn tiếp (CHỜ USER TỰ BẤM NÚT THU ÂM)
  const handleBotFinished = useCallback(() => {
    if (!turns || currentTurnIndex >= turns.length) return
    const nextTurn = turns[currentTurnIndex + 1]

    if (nextTurn && nextTurn.speaker === 'USER') {
      setCurrentTurnIndex((prev) => prev + 1)
      setVadState('IDLE') // Chờ user tự bấm nút ghi âm, không tự động thu
    } else if (nextTurn && nextTurn.speaker === 'AI') {
      setCurrentTurnIndex((prev) => prev + 1)
      setTimeout(() => playBotAudio(nextTurn), 600)
    } else {
      // Đã hết các turns
      finishDialogue()
    }
  }, [turns, currentTurnIndex, playBotAudio])

  // =========================================================================
  // USER VAD & RECORDING: Thu âm & Phát hiện khoảng lặng thông minh
  // =========================================================================
  const startUserTurnRecording = useCallback(async () => {
    try {
      recordedChunksRef.current = []
      turnSpeechDurationRef.current = 0
      turnSpeechStartedTimeRef.current = 0

      // Khởi tạo Microphone Stream nếu chưa có
      if (!mediaStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
        mediaStreamRef.current = stream
      }

      // Khởi tạo AudioContext cho VAD nếu chưa có
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      const audioCtx = audioContextRef.current
      const source = audioCtx.createMediaStreamSource(mediaStreamRef.current)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)
      analyserRef.current = analyser

      // Khởi tạo MediaRecorder
      const recorder = new MediaRecorder(mediaStreamRef.current, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data)
        }
      }

      recorder.start(100)
      setVadState('WAITING_FOR_SPEECH')

      // Khởi động Web Speech Recognition (nếu browser hỗ trợ) để lấy text thô
      initSpeechRecognition()

      // Khởi động VAD Loop
      startVadLoop()
    } catch (err) {
      console.error('[Dialogue] Error accessing mic:', err)
      setVadState('IDLE')
    }
  }, [])

  // Web Speech Recognition
  const initSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition()
        rec.continuous = true
        rec.interimResults = true
        rec.lang = 'en-US'
        rec.onresult = (e: any) => {
          let text = ''
          for (let i = 0; i < e.results.length; i++) {
            text += e.results[i][0].transcript + ' '
          }
          setTurnTranscripts((prev) => ({
            ...prev,
            [currentTurnIndex]: text.trim(),
          }))
        }
        speechRecognitionRef.current = rec
        rec.start()
      } catch {}
    }
  }

  // VAD Loop: Giám sát âm lượng và Grace Period
  const startVadLoop = () => {
    const analyser = analyserRef.current
    if (!analyser) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const SILENCE_THRESHOLD = 18 // Ngưỡng âm lượng phát hiện tiếng nói
    const GRACE_PERIOD_MS = 2000 // 2.0s Grace Period sau khi đã cất tiếng nói

    const checkVolume = () => {
      analyser.getByteFrequencyData(dataArray)
      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i]
      }
      const average = sum / bufferLength
      setAudioVolumeLevel(Math.min(100, Math.round((average / 128) * 100)))

      const isSpeakingNow = average > SILENCE_THRESHOLD

      setVadState((currentVadState) => {
        if (currentVadState === 'WAITING_FOR_SPEECH') {
          if (isSpeakingNow) {
            // Người học bắt đầu cất tiếng nói!
            turnSpeechStartedTimeRef.current = Date.now()
            return 'SPEAKING'
          }
          return 'WAITING_FOR_SPEECH'
        }

        if (currentVadState === 'SPEAKING') {
          if (!isSpeakingNow) {
            // Bắt đầu khoảng lặng -> Chuyển sang GRACE_PERIOD và đếm ngược
            if (!graceTimerRef.current) {
              graceTimerRef.current = setTimeout(() => {
                // Hết grace period mà vẫn im lặng -> Tự động chốt lượt!
                handleCompleteUserTurn()
              }, GRACE_PERIOD_MS)
            }
            return 'GRACE_PERIOD'
          }
          return 'SPEAKING'
        }

        if (currentVadState === 'GRACE_PERIOD') {
          if (isSpeakingNow) {
            // Người học nói tiếp -> Huỷ grace timer!
            if (graceTimerRef.current) {
              clearTimeout(graceTimerRef.current)
              graceTimerRef.current = null
            }
            return 'SPEAKING'
          }
          return 'GRACE_PERIOD'
        }

        return currentVadState
      })

      animationFrameRef.current = requestAnimationFrame(checkVolume)
    }

    animationFrameRef.current = requestAnimationFrame(checkVolume)
  }

  // Kết thúc lượt nói của User (tự động qua VAD hoặc bấm nút thủ công)
  const handleCompleteUserTurn = useCallback(() => {
    if (graceTimerRef.current) {
      clearTimeout(graceTimerRef.current)
      graceTimerRef.current = null
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop()
      } catch {}
    }

    setVadState('IDLE')
    setAudioVolumeLevel(0)

    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = () => {
        const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' })
        const objectUrl = URL.createObjectURL(audioBlob)
        audioUrlsRef.current.push(objectUrl)

        setTurnAudioBlobs((prev) => ({
          ...prev,
          [currentTurnIndex]: audioBlob,
        }))
        setTurnAudioUrls((prev) => ({
          ...prev,
          [currentTurnIndex]: objectUrl,
        }))

        // Đo đạc các metrics thời gian cho turn này
        const botFinishedAt = turnBotFinishedTimeRef.current || Date.now() - 5000
        const speechStartedAt = turnSpeechStartedTimeRef.current || Date.now() - 3000
        const now = Date.now()

        const responseLatencySeconds = Math.max(0, Math.round((speechStartedAt - botFinishedAt) / 100) / 10)
        const speakingDurationSeconds = Math.max(1, Math.round((now - speechStartedAt) / 100) / 10)
        const silenceDurationSeconds = 0.5

        const turnTranscript = turnTranscripts[currentTurnIndex] || (turns[currentTurnIndex]?.text_en || '')

        // Lưu kết quả turn vào turnsResults (kèm audio_url để replay)
        const turnResult: DialogueTurnAttemptResult = {
          turn_number: turns[currentTurnIndex]?.turn_number || currentTurnIndex + 1,
          user_transcription: turnTranscript,
          audio_url: objectUrl,
          response_latency_seconds: responseLatencySeconds,
          speaking_duration_seconds: speakingDurationSeconds,
          silence_duration_seconds: silenceDurationSeconds,
          goal_accomplished: 'YES',
          turn_fluency_score: 85,
        }

        setTurnsResults((prev) => [...prev, turnResult])

        // Chuyển sang turn tiếp theo hoặc kết thúc
        const nextIndex = currentTurnIndex + 1
        if (nextIndex < turns.length) {
          setCurrentTurnIndex(nextIndex)
          const nextTurn = turns[nextIndex]
          if (nextTurn.speaker === 'AI') {
            setTimeout(() => playBotAudio(nextTurn), 800)
          } else {
            setVadState('IDLE') // Chờ user tự bấm nút ghi âm
          }
        } else {
          finishDialogue()
        }
      }
      recorder.stop()
    }
  }, [currentTurnIndex, turns, turnTranscripts, playBotAudio])

  // Hoàn thành toàn bài đối thoại
  const finishDialogue = () => {
    setIsFinished(true)
    setIsReviewModalOpen(true)
    setIsBotSpeaking(false)
    setVadState('IDLE')
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current)
  }

  // Bắt đầu phiên thực hành (User Gesture)
  const handleStartPractice = () => {
    setIsStarted(true)
    setIsFinished(false)
    setIsReviewModalOpen(false)
    setCurrentTurnIndex(0)
    setElapsedSeconds(0)
    setTurnsResults([])
    setVadState('IDLE')

    // Unlock AudioContext an toàn bằng User Gesture
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (AudioCtx) {
      audioContextRef.current = new AudioCtx()
      audioContextRef.current.resume()
    }

    // Bot bắt đầu lượt 1 nếu lượt 1 là AI
    if (turns.length > 0 && turns[0].speaker === 'AI') {
      setTimeout(() => {
        playBotAudio(turns[0])
      }, 500)
    } else {
      // Nếu lượt 1 là USER: chờ user tự bấm thu âm
      setVadState('IDLE')
    }
  }

  // Nộp bài lên hệ thống (Gửi kèm toàn bộ audio của các lượt đối thoại)
  const handleFinalSubmit = async () => {
    const fullTranscript = turns
      .filter((t) => t.speaker === 'USER')
      .map((t, idx) => turnTranscripts[turns.indexOf(t)] || t.text_en)
      .join('. ')

    // Tính tổng thời lượng user phát âm thực tế
    const totalSpeakingDuration = turnsResults.reduce(
      (sum, r) => sum + (r.speaking_duration_seconds || 3),
      0
    )

    // Đóng gói base64 audio cho từng lượt đối thoại để gửi sang AI chấm điểm trực tiếp
    const enrichedTurnsResults = await Promise.all(
      turnsResults.map(async (r) => {
        const turnIdx = turns.findIndex((t) => t.turn_number === r.turn_number)
        const blob = turnAudioBlobs[turnIdx] || Object.values(turnAudioBlobs)[0]
        let audioBase64: string | undefined = undefined
        if (blob) {
          try {
            audioBase64 = await blobToBase64(blob)
          } catch (e) {
            console.warn('Failed to convert turn blob to base64:', e)
          }
        }
        return {
          ...r,
          audio_data: audioBase64,
          mime_type: blob?.type || 'audio/webm',
        }
      })
    )

    // Lấy 1 blob đại diện để upload R2 chính
    const firstBlob = turnAudioBlobs[1] || Object.values(turnAudioBlobs)[0]

    onSubmit(
      fullTranscript,
      totalSpeakingDuration,
      firstBlob,
      selectedDifficulty,
      enrichedTurnsResults
    )
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleBackClick = () => {
    if (isStarted && !isFinished) {
      setShowExitConfirm(true)
    } else {
      onBack()
    }
  }

  const handleConfirmExit = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
    }
    if (replayAudioRef.current) {
      replayAudioRef.current.pause()
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setShowExitConfirm(false)
    onBack()
  }

  const handleResume = () => {
    setShowExitConfirm(false)
  }

  // =========================================================================
  // GIAO DIỆN 1: MÀN HÌNH CHỌN MỨC ĐỘ & PREVIEW BỐI CẢNH (TRƯỚC KHI BẮT ĐẦU)
  // =========================================================================
  if (!isStarted) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-[14px] text-text-secondary hover:text-primary cursor-pointer"
          >
            <ArrowLeft size={18} />
            {isVietnamese ? 'Quay lại danh sách' : 'Back to list'}
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          {/* Header & Badges */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-4">
            <div>
              <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-[12px] font-semibold text-indigo-700">
                {isVietnamese ? 'Hội thoại tương tác' : 'Interactive Dialogue'}
              </span>
              <h1 className="mt-2 text-[22px] font-bold text-text-primary">{exercise.title}</h1>
              {exercise.title_vi && (
                <p className="text-[14px] text-text-secondary">{exercise.title_vi}</p>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-surface-subtle px-3 py-2 text-[12px] text-text-secondary">
              <Users size={16} className="text-primary" />
              <span>{turns.length} {isVietnamese ? 'lượt thoại' : 'turns'}</span>
            </div>
          </div>

          {/* Bối cảnh tình huống cụ thể (Setting & Roles) */}
          <div className="mb-6 rounded-xl border border-primary/20 bg-primary/[0.03] p-4">
            <h3 className="mb-2 flex items-center gap-2 text-[14px] font-bold text-text-primary">
              <Sparkles size={16} className="text-primary" />
              {isVietnamese ? 'Tình huống giao tiếp' : 'Scenario Setting'}
            </h3>
            <p className="text-[13px] leading-relaxed text-text-secondary">
              {scenario?.setting_vi || scenario?.setting || exercise.description}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3 pt-2 text-[12px]">
              <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-blue-700 font-medium">
                <span>👤 {isVietnamese ? 'Bạn thủ vai:' : 'You play:'}</span>
                <span className="font-bold">{scenario?.user_role || 'Customer'}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700 font-medium">
                <span>🤖 {isVietnamese ? 'AI Bot:' : 'AI Bot:'}</span>
                <span className="font-bold">{scenario?.ai_role || 'Assistant'}</span>
              </div>
            </div>

            {scenario?.overall_goals_vi && scenario.overall_goals_vi.length > 0 && (
              <div className="mt-3 border-t border-primary/10 pt-2 text-[12px] text-text-secondary">
                <span className="font-semibold text-text-primary">
                  {isVietnamese ? 'Mục tiêu giao tiếp của bạn:' : 'Your Communication Goals:'}
                </span>
                <ul className="mt-1 list-inside list-disc space-y-0.5 text-text-secondary">
                  {scenario.overall_goals_vi.map((goal, idx) => (
                    <li key={idx}>{goal}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Bộ chọn 3 mức độ thích ứng (Scaffolding Levels) */}
          <div className="mb-6">
            <label className="mb-2.5 block text-[13px] font-bold text-text-primary">
              {isVietnamese ? 'Chọn mức độ hỗ trợ luyện tập:' : 'Choose Practice Scaffolding Level:'}
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Mức DỄ */}
              <button
                type="button"
                onClick={() => setSelectedDifficulty('EASY')}
                className={`relative flex flex-col rounded-xl border p-3.5 text-left transition cursor-pointer ${
                  selectedDifficulty === 'EASY'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-border bg-surface hover:bg-surface-subtle'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-[13px] text-emerald-700">
                  <span>🟢 {isVietnamese ? 'Dễ' : 'Easy'}</span>
                  {selectedDifficulty === 'EASY' && <Check size={16} />}
                </div>
                <p className="mt-1 text-[11px] font-medium text-emerald-900">
                  {isVietnamese ? 'Nhìn câu mẫu & Đọc theo' : 'Assisted Read-Along'}
                </p>
                <p className="mt-1 text-[11px] text-text-tertiary">
                  {isVietnamese
                    ? 'Hiện đầy đủ câu tiếng Anh + dịch nghĩa. Thích hợp luyện ngữ điệu.'
                    : 'Shows full English script + translation. Focus on delivery.'}
                </p>
              </button>

              {/* Mức TRUNG BÌNH */}
              <button
                type="button"
                onClick={() => setSelectedDifficulty('MEDIUM')}
                className={`relative flex flex-col rounded-xl border p-3.5 text-left transition cursor-pointer ${
                  selectedDifficulty === 'MEDIUM'
                    ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-2 ring-amber-500/20'
                    : 'border-border bg-surface hover:bg-surface-subtle'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-[13px] text-amber-700">
                  <span>🟡 {isVietnamese ? 'Trung bình' : 'Medium'}</span>
                  {selectedDifficulty === 'MEDIUM' && <Check size={16} />}
                </div>
                <p className="mt-1 text-[11px] font-medium text-amber-900">
                  {isVietnamese ? 'Gợi ý từ khóa & Mẫu câu' : 'Guided Speaking'}
                </p>
                <p className="mt-1 text-[11px] text-text-tertiary">
                  {isVietnamese
                    ? 'Ẩn câu mẫu, chỉ hiện nhiệm vụ và cụm từ gợi ý. Bạn tự dựng câu.'
                    : 'Hides full script. Shows goal + suggested phrase hints.'}
                </p>
              </button>

              {/* Mức KHÓ */}
              <button
                type="button"
                onClick={() => setSelectedDifficulty('HARD')}
                className={`relative flex flex-col rounded-xl border p-3.5 text-left transition cursor-pointer ${
                  selectedDifficulty === 'HARD'
                    ? 'border-red-500 bg-red-50/50 shadow-sm ring-2 ring-red-500/20'
                    : 'border-border bg-surface hover:bg-surface-subtle'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-[13px] text-red-700">
                  <span>🔴 {isVietnamese ? 'Khó' : 'Hard'}</span>
                  {selectedDifficulty === 'HARD' && <Check size={16} />}
                </div>
                <p className="mt-1 text-[11px] font-medium text-red-900">
                  {isVietnamese ? 'Tự thoại 100% (Phản xạ)' : 'Independent Role-play'}
                </p>
                <p className="mt-1 text-[11px] text-text-tertiary">
                  {isVietnamese
                    ? 'Ẩn toàn bộ câu mẫu & từ vựng. Tự nghe Bot và tự đối thoại.'
                    : 'Zero scaffolding. Listen to Bot and respond freely.'}
                </p>
              </button>
            </div>
          </div>

          {/* Nút Khởi động (User Gesture) */}
          <button
            type="button"
            onClick={handleStartPractice}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-[15px] font-bold text-white shadow-md hover:bg-primary/90 transition cursor-pointer"
          >
            <Play size={18} fill="currentColor" />
            <span>{isVietnamese ? 'Bắt đầu cuộc hội thoại' : 'Start Conversation'}</span>
          </button>
        </div>
      </main>
    )
  }

  // =========================================================================
  // GIAO DIỆN 2: MÀN HÌNH HỘI THOẠI TRỰC TIẾP (ACTIVE CHAT & TURN INTERACTION)
  // =========================================================================
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 lg:px-8">
      {/* Top Bar: Back, Title & Elapsed Stopwatch */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackClick}
            className="flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-primary cursor-pointer"
          >
            <ArrowLeft size={16} />
            {isVietnamese ? 'Thoát' : 'Exit'}
          </button>
          <div>
            <h2 className="text-[16px] font-bold text-text-primary">{exercise.title}</h2>
            <p className="text-[12px] text-text-secondary">
              {scenario?.setting_vi || scenario?.setting}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Level badge */}
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            {selectedDifficulty === 'EASY'
              ? isVietnamese ? '🟢 Dễ' : '🟢 Easy'
              : selectedDifficulty === 'MEDIUM'
              ? isVietnamese ? '🟡 Trung bình' : '🟡 Medium'
              : isVietnamese ? '🔴 Khó' : '🔴 Hard'}
          </span>

          {/* Elapsed Timer (Đếm tiến, không đếm ngược) */}
          <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-surface px-3 py-1 text-[13px] font-semibold text-text-primary shadow-xs">
            <Clock size={14} className="text-primary" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Main Chat Stream / Turns Timeline */}
      <div className="space-y-6 sm:space-y-7 rounded-2xl border border-border bg-surface-subtle/50 p-4 sm:p-6 mb-5 min-h-[380px] max-h-[540px] overflow-y-auto">
        {turns.map((turn, index) => {
          const isPassed = index < currentTurnIndex
          const isCurrent = index === currentTurnIndex
          const isUserTurn = turn.speaker === 'USER'

          // Chỉ render các turns đã qua hoặc turn đang diễn ra
          if (index > currentTurnIndex) return null

          return (
            <div
              key={turn.turn_number}
              className={`flex flex-col ${isUserTurn ? 'items-end' : 'items-start'} transition-all`}
            >
              {/* Speaker Label */}
              <div className="mb-2 flex items-center gap-2 text-[11.5px] font-semibold text-text-tertiary">
                <span>{turn.speaker_name}</span>
                <span>• Turn {turn.turn_number}</span>
                {isCurrent && isBotSpeaking && !isUserTurn && (
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <Volume2 size={12} className="animate-pulse" />
                    {isVietnamese ? 'Đang nói...' : 'Speaking...'}
                  </span>
                )}
                {isCurrent && isUserTurn && vadState !== 'IDLE' && (
                  <span className="flex items-center gap-1 text-red-600 font-bold">
                    <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                    {isVietnamese ? 'Đang thu âm...' : 'Recording...'}
                  </span>
                )}
                {isCurrent && isUserTurn && vadState === 'IDLE' && (
                  <span className="flex items-center gap-1 text-primary font-semibold">
                    <span>👉</span>
                    {isVietnamese ? 'Lượt của bạn — Bấm micro bên dưới' : 'Your turn — Click mic below'}
                  </span>
                )}
              </div>

              {/* Chat Bubble */}
              <div
                className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4.5 sm:p-5 text-[13.5px] leading-relaxed shadow-xs transition ${
                  isUserTurn
                    ? isCurrent
                      ? 'border-2 border-primary bg-primary text-white'
                      : 'border border-primary/30 bg-primary/10 text-text-primary'
                    : isCurrent && isBotSpeaking
                    ? 'border-2 border-emerald-500 bg-emerald-50/90 text-text-primary'
                    : 'border border-border/70 bg-surface text-text-primary'
                }`}
              >
                {/* Content logic: Tùy theo Speaker & Difficulty */}
                {!isUserTurn ? (
                  // Turn của BOT: Luôn hiện câu nói
                  <div>
                    <p className="font-medium">{turn.text_en}</p>
                    {turn.text_vi && (
                      <p className={`mt-1 text-[11px] italic ${isCurrent && isBotSpeaking ? 'text-emerald-800' : 'text-text-tertiary'}`}>
                        {turn.text_vi}
                      </p>
                    )}

                    {/* Nút nghe lại câu nói của Bot */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => replayBotAudio(turn, index)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-surface/90 hover:bg-surface px-2.5 py-1 text-[11px] font-medium text-text-secondary hover:text-primary transition cursor-pointer shadow-2xs"
                        title={isVietnamese ? 'Nghe lại phát âm của Bot' : 'Replay bot speech'}
                      >
                        {playingAudioKey === `bot-${index}` ? (
                          <>
                            <Pause size={12} className="text-primary animate-pulse" />
                            <span className="text-primary font-semibold">{isVietnamese ? 'Đang phát...' : 'Playing...'}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={12} />
                            <span>{isVietnamese ? 'Nghe Bot' : 'Play Audio'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Turn của USER: Phụ thuộc vào mức độ đã chọn
                  <div>
                    {selectedDifficulty === 'EASY' ? (
                      // DỄ: Hiện đầy đủ câu mẫu + dịch
                      <div>
                        <p className={isCurrent ? 'text-white font-medium' : 'text-text-primary'}>
                          {turn.text_en}
                        </p>
                        {turn.text_vi && (
                          <p className={`mt-1 text-[11px] italic ${isCurrent ? 'text-white/80' : 'text-text-tertiary'}`}>
                            {turn.text_vi}
                          </p>
                        )}
                      </div>
                    ) : selectedDifficulty === 'MEDIUM' ? (
                      // TRUNG BÌNH: Ẩn câu mẫu, chỉ hiện nhiệm vụ + gợi ý
                      <div>
                        <div className="flex items-center gap-1 font-semibold text-[12px] mb-1">
                          <HelpCircle size={13} />
                          <span>{isVietnamese ? 'Nhiệm vụ của bạn:' : 'Your goal:'}</span>
                        </div>
                        <p className={isCurrent ? 'text-white' : 'text-text-primary'}>
                          {turn.user_guidance?.turn_goal_vi || turn.user_guidance?.goal_vi || turn.text_vi}
                        </p>
                        {turn.user_guidance?.suggested_phrases && turn.user_guidance.suggested_phrases.length > 0 && (
                          <div className={`mt-2 rounded-lg p-2 text-[11px] ${isCurrent ? 'bg-black/20 text-white/90' : 'bg-surface text-text-secondary'}`}>
                            <span className="font-semibold">{isVietnamese ? 'Gợi ý: ' : 'Hints: '}</span>
                            {turn.user_guidance.suggested_phrases.join(' | ')}
                          </div>
                        )}
                      </div>
                    ) : (
                      // KHÓ: Tự thoại độc lập
                      <div>
                        <div className="flex items-center gap-1 font-semibold text-[12px]">
                          <Sparkles size={13} />
                          <span>{isVietnamese ? 'Lượt của bạn (Tự phản xạ tự do)' : 'Your turn (Free response)'}</span>
                        </div>
                        <p className={`mt-1 text-[12px] ${isCurrent ? 'text-white/90' : 'text-text-secondary'}`}>
                          {turn.user_guidance?.turn_goal_vi || turn.user_guidance?.goal_vi}
                        </p>
                      </div>
                    )}

                    {/* Hiển thị transcript người học đã nói (nếu turn đã qua) */}
                    {isPassed && turnTranscripts[index] && (
                      <div className="mt-2 border-t border-primary/20 pt-1.5 text-[11px] text-text-secondary">
                        <span className="font-semibold">{isVietnamese ? 'Bạn đã nói: ' : 'You said: '}</span>
                        <span>"{turnTranscripts[index]}"</span>
                      </div>
                    )}

                    {/* Thanh nghe lại giọng người học và nút thu âm lại */}
                    {(turnAudioUrls[index] || turnAudioBlobs[index]) && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-primary/20 pt-2">
                        <button
                          type="button"
                          onClick={() => replayUserAudio(index)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 text-primary hover:bg-white px-2.5 py-1 text-[11px] font-semibold shadow-xs transition cursor-pointer"
                        >
                          {playingAudioKey === `user-${index}` ? (
                            <>
                              <Pause size={12} className="text-primary animate-pulse" />
                              <span>{isVietnamese ? 'Tạm dừng' : 'Pause'}</span>
                            </>
                          ) : (
                            <>
                              <Play size={12} fill="currentColor" />
                              <span>{isVietnamese ? 'Nghe lại giọng bạn' : 'Replay your voice'}</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRetakeTurn(index)}
                          className="inline-flex items-center gap-1 rounded-lg bg-black/15 hover:bg-black/25 text-white px-2 py-1 text-[11px] font-medium transition cursor-pointer"
                          title={isVietnamese ? 'Thu âm lại câu này' : 'Retake this turn'}
                        >
                          <RotateCcw size={11} />
                          <span>{isVietnamese ? 'Thu lại' : 'Retake'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Controller Panel ở đáy màn hình */}
      {!isFinished ? (
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          {activeTurn?.speaker === 'AI' ? (
            // Trạng thái: BOT ĐANG NÓI
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Volume2 size={20} className="animate-bounce" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-text-primary">
                    {activeTurn.speaker_name} {isVietnamese ? 'đang nói...' : 'is speaking...'}
                  </p>
                  <p className="text-[12px] text-text-secondary">
                    {isVietnamese ? 'Hãy lắng nghe kỹ để chuẩn bị phản hồi' : 'Listen carefully to prepare your response'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleBotFinished()}
                className="rounded-lg bg-surface-subtle px-3 py-1.5 text-[12px] font-medium text-text-secondary hover:bg-border/60 transition cursor-pointer"
              >
                {isVietnamese ? 'Bỏ qua audio bot' : 'Skip bot audio'}
              </button>
            </div>
          ) : vadState === 'IDLE' ? (
            // Trạng thái 1: LƯỢT CỦA BẠN (CHƯA BẬT MICRO - CHỜ USER BẤM NÚT)
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
                  <Mic size={22} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-text-primary">
                    {isVietnamese ? 'Đến lượt bạn phản hồi!' : 'Your turn to speak!'}
                  </p>
                  <p className="text-[12px] text-text-secondary">
                    {isVietnamese
                      ? 'Đọc gợi ý hoặc câu thoại bên trên, sau đó bấm nút để bắt đầu nói'
                      : 'Review the prompt above, then click the button when ready to speak'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={startUserTurnRecording}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-red-600 hover:bg-red-700 px-6 py-3 text-[14px] font-bold text-white shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Mic size={18} />
                <span>{isVietnamese ? 'Bấm để nói (Bắt đầu thu âm)' : 'Click to Speak'}</span>
              </button>
            </div>
          ) : (
            // Trạng thái 2: ĐANG GHI ÂM (MIC ĐANG BẬT & VAD HOẠT ĐỘNG)
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white ring-4 ring-red-200 animate-pulse">
                  <Mic size={22} />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-bold text-red-600 flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-red-600 animate-ping" />
                      {vadState === 'SPEAKING'
                        ? isVietnamese ? 'Đang ghi âm giọng nói...' : 'Recording your voice...'
                        : isVietnamese ? 'Phát hiện ngắt câu (Chờ 2s)...' : 'Silence detected (Waiting)...'}
                    </p>

                    {/* Sóng âm Visualizer trực quan để user nhận biết mic đang bắt tiếng */}
                    <div className="flex items-end gap-0.5 h-4 px-1.5 py-0.5 rounded bg-red-50 border border-red-200">
                      <span className="w-1 rounded-full bg-red-500 transition-all duration-75" style={{ height: `${Math.max(4, Math.min(16, audioVolumeLevel * 0.3))}px` }} />
                      <span className="w-1 rounded-full bg-red-500 transition-all duration-75" style={{ height: `${Math.max(6, Math.min(16, audioVolumeLevel * 0.6))}px` }} />
                      <span className="w-1 rounded-full bg-red-500 transition-all duration-75" style={{ height: `${Math.max(8, Math.min(16, audioVolumeLevel * 0.9))}px` }} />
                      <span className="w-1 rounded-full bg-red-500 transition-all duration-75" style={{ height: `${Math.max(5, Math.min(16, audioVolumeLevel * 0.4))}px` }} />
                      <span className="text-[9px] font-bold text-red-600 ml-1">REC</span>
                    </div>
                  </div>

                  <p className="text-[12px] text-text-secondary mt-0.5">
                    {vadState === 'GRACE_PERIOD'
                      ? isVietnamese ? 'Bạn có thể nói tiếp hoặc bấm "Xong câu này"' : 'Keep speaking or click "Done"'
                      : isVietnamese ? 'Nói xong câu, bạn bấm nút "Xong câu này"' : 'Click "Done" when you finish speaking'}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Chốt câu */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                {/* NÚT CHỐT CÂU (DONE / NEXT TURN) */}
                <button
                  type="button"
                  onClick={handleCompleteUserTurn}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-[14px] font-bold text-white shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <CheckCircle2 size={18} />
                  <span>{isVietnamese ? 'Xong câu này (Next)' : 'Done (Next)'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Trạng thái: ĐÃ HOÀN THÀNH TẤT CẢ CÁC LƯỢT THOẠI -> THANH THÔNG BÁO TỔNG KẾT GỌN GÀNG DƯỚI ĐÁY
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50/70 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-text-primary">
                {isVietnamese ? 'Cuộc hội thoại đã hoàn thành!' : 'Conversation Completed!'}
              </p>
              <p className="text-[12px] text-text-secondary">
                {isVietnamese
                  ? `Đã hoàn tất tất cả ${turns.length} lượt thoại (${formatTimer(elapsedSeconds)}).`
                  : `Completed all ${turns.length} turns in ${formatTimer(elapsedSeconds)}.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartPractice}
              className="rounded-xl border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text-secondary hover:text-text-primary transition cursor-pointer"
            >
              <RotateCcw size={14} className="inline mr-1" />
              <span>{isVietnamese ? 'Luyện lại' : 'Practice Again'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-[13px] font-bold text-white shadow-md hover:bg-primary/90 transition cursor-pointer"
            >
              <Volume2 size={15} />
              <span>{isVietnamese ? 'Kiểm tra lượt thoại & Nộp bài' : 'Review & Submit'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: NGHE LẠI & KIỂM TRA CÁC LƯỢT THOẠI RỒI NỘP BÀI */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/80 px-5 py-4 bg-surface-subtle/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-text-primary">
                    {isVietnamese ? 'Nghe lại & Kiểm tra các lượt thoại' : 'Review & Replay Audio Turns'}
                  </h3>
                  <p className="text-[12px] text-text-secondary">
                    {isVietnamese
                      ? `Hoàn tất tất cả ${turns.length} lượt thoại • Thời gian: ${formatTimer(elapsedSeconds)}`
                      : `Completed all ${turns.length} turns • Time: ${formatTimer(elapsedSeconds)}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-border/60 hover:text-text-primary transition cursor-pointer"
                title={isVietnamese ? 'Đóng' : 'Close'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Danh sách cuộn các lượt thoại */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4.5">
              <div className="rounded-xl bg-primary/[0.04] border border-primary/20 p-3 text-[12px] text-text-secondary">
                💡 {isVietnamese
                  ? 'Hãy nghe lại từng câu để kiểm tra chất lượng thu âm hoặc đối chiếu với câu thoại của Bot trước khi nộp bài cho AI.'
                  : 'Listen to each turn to verify audio clarity or compare your voice with the bot before submitting.'}
              </div>

              {turns.map((turn, index) => {
                const isUser = turn.speaker === 'USER'
                const userTranscript = turnTranscripts[index] || turn.text_en
                const hasUserAudio = Boolean(turnAudioUrls[index] || turnAudioBlobs[index])
                const isThisPlaying = isUser
                  ? playingAudioKey === `user-${index}`
                  : playingAudioKey === `bot-${index}`

                return (
                  <div
                    key={turn.turn_number}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 rounded-2xl border p-4 sm:p-4.5 transition ${
                      isUser
                        ? 'border-primary/20 bg-primary/[0.02]'
                        : 'border-border/70 bg-surface-subtle/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isUser ? 'bg-primary/10 text-primary' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {turn.speaker_name}
                        </span>
                        <span className="text-[11px] text-text-tertiary">Turn {turn.turn_number}</span>
                      </div>

                      <p className="text-[13px] font-medium text-text-primary">
                        {isUser ? `"${userTranscript}"` : turn.text_en}
                      </p>
                      {turn.text_vi && (
                        <p className="text-[11px] text-text-tertiary italic mt-0.5">
                          {turn.text_vi}
                        </p>
                      )}
                    </div>

                    {/* Action Controls for Turn */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!isUser ? (
                        <button
                          type="button"
                          onClick={() => replayBotAudio(turn, index)}
                          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold text-text-secondary hover:text-primary hover:border-primary transition cursor-pointer shadow-2xs"
                        >
                          {isThisPlaying ? (
                            <>
                              <Pause size={13} className="text-primary animate-pulse" />
                              <span className="text-primary">{isVietnamese ? 'Tạm dừng' : 'Pause'}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 size={13} />
                              <span>{isVietnamese ? 'Nghe Bot' : 'Bot Voice'}</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled={!hasUserAudio}
                            onClick={() => replayUserAudio(index)}
                            className="flex items-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 text-[12px] font-semibold transition cursor-pointer disabled:opacity-40"
                          >
                            {isThisPlaying ? (
                              <>
                                <Pause size={13} className="animate-pulse" />
                                <span>{isVietnamese ? 'Tạm dừng' : 'Pause'}</span>
                              </>
                            ) : (
                              <>
                                <Play size={13} fill="currentColor" />
                                <span>{isVietnamese ? 'Nghe lại' : 'Play My Voice'}</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRetakeTurn(index)}
                            className="flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] font-medium text-text-secondary hover:text-red-600 hover:border-red-300 transition cursor-pointer"
                            title={isVietnamese ? 'Thu âm lại lượt này' : 'Retake this turn'}
                          >
                            <RotateCcw size={12} />
                            <span>{isVietnamese ? 'Thu lại' : 'Retake'}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 bg-surface-subtle/50 px-5 py-3.5">
              <button
                type="button"
                onClick={handleStartPractice}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>{isVietnamese ? 'Luyện tập lại từ đầu' : 'Practice Again'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="rounded-xl border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-text-secondary hover:text-text-primary transition cursor-pointer"
                >
                  {isVietnamese ? 'Đóng' : 'Close'}
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2 text-[14px] font-bold text-white shadow-md hover:bg-primary/90 transition cursor-pointer disabled:opacity-50"
                >
                  <Send size={15} />
                  <span>
                    {isSubmitting
                      ? (isVietnamese ? 'Đang chấm điểm...' : 'Scoring...')
                      : (isVietnamese ? 'Nộp bài & Nhận đánh giá AI' : 'Submit & Get AI Feedback')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận thoát phòng hội thoại */}
      <PracticeExitConfirmModal
        isOpen={showExitConfirm}
        onClose={handleResume}
        onConfirmExit={handleConfirmExit}
        title={isVietnamese ? 'Rời khỏi phòng hội thoại?' : 'Exit Dialogue Session?'}
        description={
          isVietnamese
            ? 'Phiên đối thoại với AI đang diễn ra. Nếu thoát bây giờ, các lượt thoại bạn đã thu âm sẽ bị hủy bỏ.'
            : 'Interactive dialogue is in progress. If you exit now, your dialogue turns will be discarded.'
        }
        savedNotice={
          isVietnamese
            ? 'Hãy hoàn thành toàn bộ các lượt thoại để AI chấm điểm phản xạ và lưu kết quả vào tiến trình.'
            : 'Complete all turns to get AI evaluation and update your practice history.'
        }
        confirmText={isVietnamese ? 'Thoát hội thoại' : 'Exit Session'}
        cancelText={isVietnamese ? 'Tiếp tục hội thoại' : 'Resume Dialogue'}
      />
    </main>
  )
}
