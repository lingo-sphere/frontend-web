// Component làm bài luyện nói Speaking với ghi âm trực tiếp và tải lên file âm thanh.
'use client'

import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Mic,
  UploadCloud,
  FileAudio,
  Square,
  RotateCcw,
  Send,
  Loader2,
  FileDown,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/button'
import { courseService, type SpeakingSubmissionResponse } from '@/features/courses/services/course.service'
import { api } from '@/services/api.client'
import { toast } from '@/store/toast.store'
import { useSpeakingRecorder } from '@/features/practice/hooks/use.speaking.recorder'
import { TestRunnerSpeakingResult } from '@/features/courses/components/test.runner.speaking.result'

interface TestRunnerSpeakingSectionProps {
  courseId: string
  moduleId?: string
  testType: string
  prompt?: string
  fileUrl?: string
  onScoreUpdated?: (score: number) => void
}

export function TestRunnerSpeakingSection({
  courseId,
  moduleId,
  testType,
  prompt,
  fileUrl,
  onScoreUpdated,
}: TestRunnerSpeakingSectionProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [speakingInputMode, setSpeakingInputMode] = useState<'RECORD' | 'UPLOAD'>('RECORD')
  const [isSubmittingSpeaking, setIsSubmittingSpeaking] = useState(false)
  const [speakingResult, setSpeakingResult] = useState<SpeakingSubmissionResponse | null>(null)
  const audioFileInputRef = useRef<HTMLInputElement>(null)

  const {
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
  } = useSpeakingRecorder()

  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!/\.(mp3|wav|m4a|ogg|webm)$/i.test(file.name)) {
      toast.error(
        isVietnamese
          ? 'Chỉ chấp nhận file âm thanh (.mp3, .wav, .m4a, .ogg, .webm)'
          : 'Only audio files (.mp3, .wav, .m4a, .ogg, .webm) are accepted'
      )
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error(
        isVietnamese
          ? 'Dung lượng file âm thanh không được vượt quá 50MB'
          : 'Audio file size cannot exceed 50MB'
      )
      return
    }

    setAudioFile(file)
    setSpeakingResult(null)
    toast.success(
      isVietnamese
        ? `Đã chọn file ghi âm: ${file.name}`
        : `Selected audio file: ${file.name}`
    )
  }

  const handleReset = () => {
    resetRecording()
    setSpeakingResult(null)
    if (audioFileInputRef.current) audioFileInputRef.current.value = ''
  }

  const handleSubmitSpeaking = async () => {
    if (!recordedBlob) return
    setIsSubmittingSpeaking(true)
    try {
      let uploadedAudioUrl = ''
      const uploadFile =
        recordedBlob instanceof File
          ? recordedBlob
          : new File([recordedBlob], `speaking_${Date.now()}.webm`, {
              type: recordedBlob.type || 'audio/webm',
            })
      try {
        const uploadRes = await api.upload<{
          file_url?: string
          url?: string
          public_url?: string
          file_path?: string
        }>('/media/upload', uploadFile, {
          folder: 'speaking-submissions',
        })
        const realUrl =
          uploadRes?.url || uploadRes?.file_url || uploadRes?.public_url || uploadRes?.file_path
        if (realUrl) {
          uploadedAudioUrl = realUrl
        }
      } catch (uploadErr) {
        console.warn('Lỗi tải file lên Media Service, chuyển sang Base64 Audio URI:', uploadErr)
      }

      if (!uploadedAudioUrl) {
        uploadedAudioUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve((reader.result as string) || '')
          reader.onerror = () => resolve('')
          reader.readAsDataURL(recordedBlob)
        })
      }

      const res = await courseService.submitSpeakingSubmission(courseId, {
        audio_url: uploadedAudioUrl,
        module_id: moduleId,
        test_type: testType.toUpperCase(),
        prompt: prompt,
      })
      setSpeakingResult(res)
      if (res?.ai_score !== undefined) {
        onScoreUpdated?.(res.ai_score)
      }
      toast.success(
        isVietnamese
          ? 'Đã nộp bài nói thành công! Whisper & AI đã hoàn tất chấm sơ bộ.'
          : 'Speaking submitted successfully! Whisper & AI preliminary scoring complete.'
      )
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } }; message?: string }
      const errorMsg =
        apiError?.response?.data?.message ||
        apiError?.message ||
        (isVietnamese
          ? 'Dịch vụ nhận diện giọng nói AI hiện chưa sẵn sàng. Vui lòng kiểm tra lại mic hoặc thử lại sau ít phút.'
          : 'AI voice recognition service is not ready. Please check your mic or try again in a few moments.')
      toast.error(errorMsg)
    } finally {
      setIsSubmittingSpeaking(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="p-4.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
            <Mic className="h-4 w-4 text-amber-600" />
            <span>{isVietnamese ? 'Đề bài luyện nói Speaking:' : 'Speaking prompt:'}</span>
          </div>
          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <FileDown size={13} />
              <span>{isVietnamese ? 'Xem file tài liệu đính kèm' : 'View attached document'}</span>
              <ExternalLink size={11} />
            </a>
          )}
        </div>

        <p className="text-xs text-amber-900 dark:text-amber-100 font-medium leading-relaxed whitespace-pre-line">
          &ldquo;{prompt}&rdquo;
        </p>

        <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
          {isVietnamese
            ? '⚡ Giọng nói của bạn sẽ được chuyển thành văn bản bằng Whisper STT và AI chấm điểm phát âm. Giáo viên có thể nghe lại để phúc khảo điểm.'
            : '⚡ Your voice will be converted to text by Whisper STT and evaluated by AI. Teachers can listen back for grade review.'}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-surface-subtle/80 border border-border/80 max-w-sm mx-auto">
        <button
          type="button"
          onClick={() => {
            setSpeakingInputMode('RECORD')
            if (!recordedUrl) handleReset()
          }}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            speakingInputMode === 'RECORD'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Mic size={13} />
          <span>{isVietnamese ? 'Thu âm trực tiếp' : 'Record directly'}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setSpeakingInputMode('UPLOAD')
            if (!recordedUrl) handleReset()
          }}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            speakingInputMode === 'UPLOAD'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <UploadCloud size={13} />
          <span>{isVietnamese ? 'Tải file có sẵn' : 'Upload file'}</span>
        </button>
      </div>

      <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-border bg-surface-subtle/40 space-y-4">
        <input
          ref={audioFileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.m4a,.webm"
          onChange={handleAudioFileSelect}
          className="hidden"
        />

        {!isRecording && !recordedUrl && speakingInputMode === 'RECORD' && (
          <button
            type="button"
            onClick={startRecording}
            className="flex flex-col items-center gap-2 p-6 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 transition-all transform hover:scale-105 cursor-pointer"
          >
            <Mic className="h-8 w-8" />
            <span className="text-xs font-black">{isVietnamese ? 'Bấm để thu âm' : 'Tap to record'}</span>
          </button>
        )}

        {!isRecording && !recordedUrl && speakingInputMode === 'UPLOAD' && (
          <button
            type="button"
            onClick={() => audioFileInputRef.current?.click()}
            className="flex flex-col items-center gap-2.5 p-6 rounded-3xl border-2 border-dashed border-amber-400 bg-amber-50/50 hover:bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700/60 dark:hover:bg-amber-950/40 text-amber-900 dark:text-amber-200 transition-all cursor-pointer"
          >
            <FileAudio className="h-9 w-9 text-amber-500" />
            <div className="text-center">
              <span className="text-xs font-bold block">
                {isVietnamese ? 'Bấm để chọn file ghi âm từ thiết bị' : 'Tap to select audio file from device'}
              </span>
              <span className="text-[11px] text-amber-700/80 dark:text-amber-300/80 block mt-0.5">
                {isVietnamese ? 'Hỗ trợ .mp3, .wav, .m4a, .ogg, .webm (tối đa 50MB)' : 'Supports .mp3, .wav, .m4a, .ogg, .webm (max 50MB)'}
              </span>
            </div>
          </button>
        )}

        {isRecording && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-rose-500 font-black text-sm animate-pulse">
              <div className="h-3 w-3 rounded-full bg-rose-500" />
              <span>
                {isVietnamese ? 'Đang thu âm: ' : 'Recording: '}
                {Math.floor(recordingSeconds / 60)}:
                {(recordingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1.5 w-full max-w-xs">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-75"
                  style={{ width: `${Math.max(6, micVolume)}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {micVolume > 6
                  ? (isVietnamese ? `Tín hiệu âm thanh micro: ${micVolume}% (Tốt)` : `Microphone signal: ${micVolume}% (Good)`)
                  : (isVietnamese ? 'Hãy nói vào micro...' : 'Speak into microphone...')}
              </span>
            </div>

            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              <Square className="h-4 w-4 fill-white" />
              <span>{isVietnamese ? 'Dừng ghi âm' : 'Stop recording'}</span>
            </button>
          </div>
        )}

        {recordedUrl && (
          <div className="w-full max-w-md space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
              <span>
                {uploadedAudioName
                  ? (isVietnamese ? `Tệp đã chọn: ${uploadedAudioName}` : `Selected file: ${uploadedAudioName}`)
                  : (isVietnamese ? `Bản thu của bạn (${recordingSeconds}s):` : `Your recording (${recordingSeconds}s):`)}
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-rose-500 hover:underline cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>
                  {uploadedAudioName
                    ? (isVietnamese ? 'Đổi tệp khác' : 'Change file')
                    : (isVietnamese ? 'Thu lại' : 'Record again')}
                </span>
              </button>
            </div>

            <audio
              key={recordedUrl}
              controls
              src={recordedUrl}
              className="w-full h-10 rounded-xl"
              preload="auto"
            />

            {!speakingResult && (
              <Button
                type="button"
                disabled={isSubmittingSpeaking}
                onClick={handleSubmitSpeaking}
                className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2.5 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmittingSpeaking ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>
                      {isVietnamese ? 'Whisper đang bóc tách & AI chấm điểm...' : 'Whisper transcribing & AI scoring...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>
                      {isVietnamese ? 'Nộp bài nói để Whisper & AI chấm' : 'Submit speaking for Whisper & AI scoring'}
                    </span>
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {speakingResult && <TestRunnerSpeakingResult speakingResult={speakingResult} />}
    </div>
  )
}
