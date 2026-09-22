/**
 * @file listening.session.workspace.tsx
 * @description Workspace chính cho Listening Practice Session với countdown timer
 */

'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, Volume2, CheckCircle2, XCircle, Send, Target } from 'lucide-react'
import { Button } from '@/components/button'
import { useListeningSession } from '../hooks/use.listening.session'
import { useContextById } from '../hooks/use.context'
import { TimePresetSelector } from './listening.session.time-preset-selector'
import { TimePreset } from '../types/listening-session'
import { resolveMediaUrlAsync } from '@/utils/media.utils'
import type { CreateSessionParams } from '../types/listening-session'

interface ListeningSessionWorkspaceProps {
  contextId?: string
  topicName?: string
  onBack: () => void
  onComplete?: (result: any) => void
}

export function ListeningSessionWorkspace({
  contextId,
  topicName,
  onBack,
  onComplete,
}: ListeningSessionWorkspaceProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const { data: contextDetail, isLoading: isContextLoading } = useContextById(contextId)

  // Clean topicName if it's a course chapter title rather than a context topic
  const cleanTopicName = topicName && !topicName.startsWith('Chương') && !topicName.startsWith('Chapter')
    ? topicName
    : undefined

  const isTopicPractice = Boolean(contextId || cleanTopicName)

  const resolvedTopicName = contextDetail
    ? (isVietnamese ? (contextDetail.name_vi || contextDetail.name_en) : contextDetail.name_en)
    : contextId
    ? (isContextLoading
        ? (isVietnamese ? 'Đang tải chủ đề...' : 'Loading topic...')
        : (cleanTopicName || (isVietnamese ? 'Luyện tập theo chủ đề' : 'Topic Practice')))
    : (cleanTopicName || (isVietnamese ? 'Tất cả chủ đề (Ngẫu nhiên)' : 'All Topics (Random)'))

  const {
    session,
    currentIndex,
    currentExercise,
    answers,
    selectedAnswer,
    setSelectedAnswer,
    isLoading,
    isSubmitting,
    isCompleted,
    result,
    showResult,
    timeLeft,
    totalQuestions,
    createSession,
    submitAnswer,
    goNext,
    goPrev,
    goToQuestion,
    setShowResult,
  } = useListeningSession({
    onComplete,
  })

  const [showSetup, setShowSetup] = useState(true)
  const [selectedPreset, setSelectedPreset] = useState<TimePreset>(TimePreset.STANDARD)
  const [startError, setStartError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [isPlaying, setIsPlaying] = useState(false)

  // Audio ref to manage active playback
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Stop currently playing audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current.onplay = null
        audioRef.current.onended = null
        audioRef.current.onerror = null
      } catch (err) {
        console.error('[stopAudio] Error:', err)
      }
      audioRef.current = null
    }
    setIsPlaying(false)
  }, [])

  // Resolve media URLs & stop old audio when question changes
  useEffect(() => {
    let isMounted = true
    stopAudio()

    if (currentExercise) {
      const loadMedia = async () => {
        try {
          const [img, aud] = await Promise.all([
            currentExercise.image_url ? resolveMediaUrlAsync(currentExercise.image_url) : Promise.resolve(''),
            currentExercise.audio_url ? resolveMediaUrlAsync(currentExercise.audio_url) : Promise.resolve(''),
          ])
          if (isMounted) {
            setImageUrl(img)
            setAudioUrl(aud)
          }
        } catch (err) {
          console.error('[ListeningSessionWorkspace] Error resolving media:', err)
          if (isMounted) {
            setImageUrl('')
            setAudioUrl('')
          }
        }
      }
      loadMedia()
    } else {
      setImageUrl('')
      setAudioUrl('')
    }

    return () => {
      isMounted = false
      stopAudio()
    }
  }, [currentExercise, stopAudio])

  // Handle audio play
  const handlePlayAudio = () => {
    if (!audioUrl) return
    stopAudio()

    try {
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onplay = () => setIsPlaying(true)
      audio.onended = () => {
        setIsPlaying(false)
        audioRef.current = null
      }
      audio.onerror = (e) => {
        console.error('[handlePlayAudio] Audio playback error:', e)
        setIsPlaying(false)
        audioRef.current = null
      }

      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error('[handlePlayAudio] play catch error:', err)
          setIsPlaying(false)
          audioRef.current = null
        })
      }
    } catch (err) {
      console.error('[handlePlayAudio] Exception:', err)
      setIsPlaying(false)
      audioRef.current = null
    }
  }

  // Start session
  const handleStart = async () => {
    setStartError(null)
    try {
      const params: CreateSessionParams = {
        context_id: contextId,
        limit: 6,
        random: true,
        time_preset: selectedPreset,
      }
      await createSession(params)
      setShowSetup(false)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || (isVietnamese ? 'Không đủ bài luyện tập để tạo phiên.' : 'Not enough questions to start session.')
      setStartError(msg)
      console.warn('[ListeningSessionWorkspace] Could not start session:', err)
    }
  }

  // Get option style
  const getOptionStyle = (key: string) => {
    if (!showResult) {
      return selectedAnswer === key
        ? 'border-primary bg-primary-soft'
        : 'border-border hover:border-primary hover:bg-surface-subtle'
    }

    // Show result - check against result details if available
    const detail = result?.details?.[currentIndex]
    const correctKey = detail?.correct_answer
      ? (detail.correct_answer.split('.')[0]?.trim() || detail.correct_answer.trim()).toUpperCase()
      : currentExercise?.options?.find((o: any) => o.is_correct)?.key

    if (key === correctKey) {
      return 'border-emerald-500 bg-emerald-500/10 font-black text-emerald-600'
    }
    if (key === selectedAnswer && key !== correctKey) {
      return 'border-red-500 bg-red-500/10 text-red-600 font-bold'
    }
    return 'border-border opacity-50'
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // ============================================================================
  // SETUP VIEW
  // ============================================================================
  if (showSetup) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-text-primary">
                  {isVietnamese ? 'Luyện nghe Part 1' : 'Listening Part 1 Practice'}
                </h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700 flex items-center gap-1.5 shadow-xs">
                  <Target size={13} className="text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>
                    {isVietnamese ? 'Chủ đề: ' : 'Topic: '}
                    {resolvedTopicName}
                  </span>
                </span>
              </div>
              <p className="text-sm text-text-secondary mt-1">
                {isVietnamese ? 'Chế độ' : 'Mode'}:{' '}
                <strong className="text-purple-700 dark:text-purple-300">
                  {isTopicPractice
                    ? `${isVietnamese ? 'Luyện tập theo chủ đề' : 'Topic Practice'}${
                        resolvedTopicName &&
                        resolvedTopicName !== (isVietnamese ? 'Luyện tập theo chủ đề' : 'Topic Practice') &&
                        resolvedTopicName !== (isVietnamese ? 'Đang tải chủ đề...' : 'Loading topic...')
                          ? `: ${resolvedTopicName}`
                          : ''
                      }`
                    : (isVietnamese ? 'Luyện tập ngẫu nhiên (Tất cả chủ đề)' : 'Random Practice (All Topics)')}
                </strong>{' '}
                • 6 {isVietnamese ? 'câu hỏi Picture Description' : 'Picture Description questions'}
              </p>
            </div>
          </div>

          {/* Setup Card */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            <TimePresetSelector
              onSelect={setSelectedPreset}
              defaultPreset={selectedPreset}
            />

            <div className="mt-6 pt-6 border-t border-border">
              {startError && (
                <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <XCircle size={16} className="shrink-0 text-amber-600 dark:text-amber-400" />
                    <span className="font-medium leading-relaxed">{startError}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={onBack} className="h-7 text-xs shrink-0 cursor-pointer">
                    {isVietnamese ? 'Chọn chủ đề khác' : 'Choose another topic'}
                  </Button>
                </div>
              )}

              <Button
                variant="default"
                onClick={handleStart}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isVietnamese ? 'Đang tạo...' : 'Creating...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full" />
                    {isVietnamese ? 'Bắt đầu luyện tập' : 'Start Practice'}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ============================================================================
  // RESULT VIEW
  // ============================================================================
  if (showResult && result) {
    const { correct_count, total_questions, score_percent, details } = result

    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold text-text-primary">
              {isVietnamese ? 'Kết quả luyện tập' : 'Practice Result'}
            </h1>
          </div>

          {/* Score Card */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-6 mb-6">
            <div className="text-center">
              <div className="text-5xl font-black text-primary mb-2">
                {score_percent}%
              </div>
              <p className="text-text-secondary">
                {correct_count} / {total_questions}{' '}
                {isVietnamese ? 'câu đúng' : 'correct'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-500">{correct_count}</div>
                <div className="text-xs text-text-secondary">
                  {isVietnamese ? 'Đúng' : 'Correct'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {total_questions - correct_count}
                </div>
                <div className="text-xs text-text-secondary">
                  {isVietnamese ? 'Sai' : 'Wrong'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-400">
                  {formatTime(result.total_time_seconds)}
                </div>
                <div className="text-xs text-text-secondary">
                  {isVietnamese ? 'Thời gian' : 'Time'}
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            {details.map((detail, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border ${
                  detail.is_correct
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-red-500/5 border-red-500/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {detail.is_correct ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-bold text-sm">
                    {isVietnamese ? 'Câu' : 'Question'} {idx + 1}
                  </span>
                </div>

                {!detail.is_correct && (() => {
                  const ex = session?.exercises?.[idx]
                  const keyOnly = detail.correct_answer?.split('.')[0]?.trim() || detail.correct_answer
                  const opt = ex?.options?.find((o: any) => o.key === keyOnly)
                  const textToShow = opt?.text && !detail.correct_answer.includes(opt.text)
                    ? `${detail.correct_answer}. ${opt.text}`
                    : detail.correct_answer

                  return (
                    <div className="text-sm text-text-secondary mt-2">
                      <span className="font-medium">{isVietnamese ? 'Đáp án đúng:' : 'Correct answer:'}</span>{' '}
                      <span className="font-bold text-emerald-500">{textToShow}</span>
                    </div>
                  )
                })()}

                {detail.explanation && (
                  <div className="mt-3 text-sm text-text-secondary bg-surface p-3 rounded-lg">
                    {detail.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1">
              {isVietnamese ? 'Quay về' : 'Back'}
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setShowResult(false)
                setShowSetup(true)
              }}
              className="flex-1"
            >
              {isVietnamese ? 'Luyện tiếp' : 'Practice Again'}
            </Button>
          </div>
        </div>
      </main>
    )
  }

  // ============================================================================
  // PRACTICE VIEW
  // ============================================================================
  if (!session || !currentExercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="font-bold text-text-primary">
                {isVietnamese ? 'Luyện nghe Part 1' : 'Listening Part 1'}
              </h1>
              <p className="text-xs text-text-secondary">
                {session.time_preset_label} •{' '}
                {session.total_time_seconds / 60}{' '}
                {isVietnamese ? 'phút' : 'min'}
              </p>
            </div>
          </div>

          {/* Timer */}
          <div
            className={`px-4 py-2 rounded-xl font-bold text-lg ${
              timeLeft <= 5
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-surface border border-border text-text-primary'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-1" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {Array.from({ length: totalQuestions }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToQuestion(idx)}
              className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                idx === currentIndex
                  ? 'bg-primary text-white'
                  : answers[idx.toString()]
                  ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                  : 'bg-surface border border-border text-text-secondary hover:border-primary'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Question Card */}
        <div className="bg-surface rounded-2xl border border-border p-6 mb-6">
          {/* Question Number */}
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-bold text-sm">
              {isVietnamese ? 'Câu' : 'Question'} {currentIndex + 1} / {totalQuestions}
            </span>
            {selectedAnswer && (
              <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-medium">
                {isVietnamese ? 'Đã trả lời' : 'Answered'}
              </span>
            )}
          </div>

          {/* Image */}
          {imageUrl && (
            <div className="mb-6 flex justify-center">
              <img
                src={imageUrl}
                alt="Question"
                className="max-h-64 rounded-xl object-contain"
              />
            </div>
          )}

          {/* Audio Player */}
          <div className="mb-6 flex items-center justify-center gap-4">
            <Button
              variant="default"
              onClick={handlePlayAudio}
              className="px-6 py-4"
              disabled={!audioUrl}
            >
              <Volume2 className={`w-5 h-5 mr-2 ${isPlaying ? 'animate-pulse' : ''}`} />
              {isPlaying
                ? isVietnamese
                  ? 'Đang nghe...'
                  : 'Playing...'
                : isVietnamese
                ? 'Nghe câu hỏi'
                : 'Listen'}
            </Button>
          </div>

          {/* Options - Chỉ hiển thị A, B, C, D */}
          <div className="grid grid-cols-2 gap-3">
            {['A', 'B', 'C', 'D'].map((key) => (
              <button
                key={key}
                onClick={() => setSelectedAnswer(key)}
                disabled={isSubmitting}
                className={`h-16 rounded-xl border-2 text-xl font-bold transition-all ${getOptionStyle(
                  key
                )}`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {isVietnamese ? 'Câu trước' : 'Previous'}
          </Button>

          {currentIndex === totalQuestions - 1 ? (
            <Button
              variant="default"
              onClick={() => submitAnswer()}
              disabled={isSubmitting || !selectedAnswer}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isVietnamese ? 'Đang nộp...' : 'Submitting...'}
                </span>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  {isVietnamese ? 'Nộp bài' : 'Submit'}
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={() => {
                if (selectedAnswer) {
                  submitAnswer()
                } else {
                  goNext()
                }
              }}
              disabled={isSubmitting}
            >
              {isVietnamese ? 'Câu tiếp' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}
