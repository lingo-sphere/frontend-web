/**
 * @file use.speaking.recorder.ts
 * @description Custom hook managing microphone capture, Web Audio API analyser, recording timers, and audio blob creation
 */

import { useState, useRef, useEffect } from 'react'
import { toast } from '@/store/toast.store'

export function useSpeakingRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [micVolume, setMicVolume] = useState<number>(0)
  const [uploadedAudioName, setUploadedAudioName] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {})
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
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

      audioChunksRef.current = []

      const mimeType =
        [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/mp4',
          'audio/aac',
        ].find((type) => MediaRecorder.isTypeSupported(type)) || ''

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const finalMime = recorder.mimeType || mimeType || 'audio/webm'
        const blob = new Blob(audioChunksRef.current, { type: finalMime })
        if (blob.size > 0) {
          setRecordedBlob(blob)
          setRecordedUrl(URL.createObjectURL(blob))
        } else {
          toast.warning('Bản thu âm bị rỗng hoặc chưa nhận tín hiệu âm thanh từ micro.')
        }
        stream.getTracks().forEach((t) => t.stop())
      }

      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (AudioCtx) {
          const audioCtx = new AudioCtx()
          audioContextRef.current = audioCtx
          const source = audioCtx.createMediaStreamSource(stream)
          const analyser = audioCtx.createAnalyser()
          analyser.fftSize = 256
          source.connect(analyser)
          analyserRef.current = analyser

          const dataArray = new Uint8Array(analyser.frequencyBinCount)
          const checkVolume = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray)
              let sum = 0
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i]
              }
              const avg = sum / dataArray.length
              setMicVolume(Math.min(100, Math.round((avg / 128) * 100)))
              animFrameRef.current = requestAnimationFrame(checkVolume)
            }
          }
          checkVolume()
        }
      } catch {}

      recorder.start(250)
      setIsRecording(true)
      setRecordingSeconds(0)
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1)
      }, 1000)
    } catch {
      toast.error('Không thể mở micro. Vui lòng cho phép quyền truy cập micro trong trình duyệt.')
    }
  }

  const stopRecording = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    setMicVolume(0)

    if (mediaRecorderRef.current && isRecording) {
      try {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.requestData()
        }
      } catch {}
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }

  const resetRecording = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    setMicVolume(0)
    if (isRecording) stopRecording()
    setRecordedBlob(null)
    setRecordedUrl(null)
    setUploadedAudioName(null)
    setRecordingSeconds(0)
  }

  const setAudioFile = (file: File) => {
    if (isRecording) stopRecording()
    setRecordedBlob(file)
    setRecordedUrl(URL.createObjectURL(file))
    setUploadedAudioName(file.name)
    setRecordingSeconds(0)
  }

  return {
    isRecording,
    recordingSeconds,
    recordedBlob,
    recordedUrl,
    micVolume,
    uploadedAudioName,
    startRecording,
    stopRecording,
    resetRecording,
    setAudioFile,
  }
}
