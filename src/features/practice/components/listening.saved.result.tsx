'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  Volume2,
  AlertTriangle,
  BookOpen,
  Award,
  Clock,
  Check,
  X,
  Sparkles,
  HelpCircle,
  Headphones,
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { resolveImageUrl } from '@/utils/media.utils'
import { DictationWordDiff } from './dictation.word.diff'
import type { ListeningResult } from '../types/listening-lifecycle'

export interface ListeningSavedResultProps {
  result: ListeningResult
  vi: boolean
  onBack: () => void
  onRetry?: () => void
  backLabel?: string
  kind?: string
  title?: string
}

export function ListeningSavedResult({
  result,
  vi,
  onBack,
  onRetry,
  backLabel,
  kind,
  title,
}: ListeningSavedResultProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'wrong' | 'transcript'>('all')
  const [playingKey, setPlayingKey] = useState<string | null>(null)

  const score = result.score_percent ?? 0
  const total = result.total_questions ?? result.total_blanks ?? (result.details?.length || 0)
  const correctCount = result.correct_count ?? 0
  const wrongCount = Math.max(0, total - correctCount)

  // Determine status color and motivational message
  const isExcellent = score >= 80
  const isGood = score >= 50 && score < 80
  const scoreColor = isExcellent
    ? 'text-emerald-600 dark:text-emerald-400'
    : isGood
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-rose-600 dark:text-rose-400'

  const scoreBgGradient = isExcellent
    ? 'from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20'
    : isGood
    ? 'from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20'
    : 'from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/20'

  const motivationMessage = isExcellent
    ? vi
      ? '🎉 Xuất sắc! Bạn đã làm chủ bài nghe rất tốt.'
      : '🎉 Outstanding! Excellent listening mastery.'
    : isGood
    ? vi
      ? '👍 Khá tốt! Hãy xem lại một số bẫy câu hỏi để đạt điểm tối đa.'
      : '👍 Good job! Review the distractors below to maximize your score.'
    : vi
    ? '💪 Cần cố gắng thêm! Hãy nghe lại các câu chưa đúng bên dưới.'
    : '💪 Keep practicing! Listen carefully to the missed questions below.'

  // Format time
  const timeSeconds = (result as any).total_time_seconds || 0
  const formattedTime = `${Math.floor(timeSeconds / 60)}:${String(
    Math.floor(timeSeconds % 60),
  ).padStart(2, '0')}`

  // Speech synthesis helper
  const speakText = (text?: string, key?: string) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.95
    if (key) setPlayingKey(key)
    utterance.onend = () => setPlayingKey(null)
    utterance.onerror = () => setPlayingKey(null)
    window.speechSynthesis.speak(utterance)
  }

  // Filter items
  const details = result.details || []
  const filteredDetails = activeTab === 'wrong'
    ? details.filter((d) => !d.is_correct)
    : details

  const segments = result.segment_results || []
  const filteredSegments = activeTab === 'wrong'
    ? segments.filter((s) => s.answers?.some((a) => !a.is_correct))
    : segments

  // Calculate SVG circular score
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference
  const strokeColor = isExcellent ? '#10b981' : isGood ? '#f59e0b' : '#f43f5e'

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* =========================================================================
          HERO SCORE BANNER
         ========================================================================= */}
      <section
        className={`relative overflow-hidden rounded-3xl border bg-gradient-to-b ${scoreBgGradient} bg-surface p-6 sm:p-8 shadow-xs`}
        aria-label={vi ? 'Tổng kết kết quả luyện nghe' : 'Listening Result Summary'}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Circular score & Headline */}
          <div className="flex items-center gap-5">
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-border/40"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke={strokeColor}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-2xl sm:text-3xl font-black ${scoreColor}`}>
                  {score}%
                </span>
                <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">
                  {vi ? 'Điểm số' : 'Score'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <Badge variant={isExcellent ? 'success' : isGood ? 'warning' : 'danger'}>
                  {isExcellent
                    ? vi ? 'Đạt chuẩn' : 'Proficient'
                    : isGood
                    ? vi ? 'Khá' : 'Intermediate'
                    : vi ? 'Cần cải thiện' : 'Needs Practice'}
                </Badge>
                {kind && (
                  <Badge variant="outline" className="uppercase text-[10px] font-bold">
                    {kind === 'dictation' ? (vi ? 'Chép chính tả' : 'Dictation') : kind.toUpperCase()}
                  </Badge>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-text-primary">
                {title || (vi ? 'Kết Quả Bài Luyện Nghe' : 'Listening Practice Result')}
              </h2>
              <p className="text-sm font-medium text-text-secondary">{motivationMessage}</p>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 w-full md:w-auto">
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="default"
                className="gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover shadow-sm font-bold text-xs sm:text-sm cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>{vi ? 'Luyện lại bài này' : 'Retry Session'}</span>
              </Button>
            )}
            <Button
              onClick={onBack}
              variant="outline"
              className="gap-2 px-4 py-2.5 border-border hover:bg-surface-subtle font-semibold text-xs sm:text-sm cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>{backLabel || (vi ? 'Về danh sách' : 'Back to exercises')}</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-border/60">
          <div className="rounded-2xl bg-surface border border-border/80 p-3.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-text-secondary font-semibold">
              <CheckCircle2 size={15} className="text-emerald-500" />
              <span>{vi ? 'Số câu đúng' : 'Correct'}</span>
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {correctCount}
              <span className="text-xs font-normal text-text-tertiary"> / {total}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-surface border border-border/80 p-3.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-text-secondary font-semibold">
              <XCircle size={15} className="text-rose-500" />
              <span>{vi ? 'Chưa đúng' : 'Incorrect'}</span>
            </div>
            <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {wrongCount}
              <span className="text-xs font-normal text-text-tertiary"> {vi ? 'câu' : 'items'}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-surface border border-border/80 p-3.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-text-secondary font-semibold">
              <Clock size={15} className="text-indigo-500" />
              <span>{vi ? 'Thời gian' : 'Time'}</span>
            </div>
            <div className="text-xl font-bold text-text-primary mt-1">
              {formattedTime}
            </div>
          </div>

          <div className="rounded-2xl bg-surface border border-border/80 p-3.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-text-secondary font-semibold">
              <Award size={15} className="text-amber-500" />
              <span>{vi ? 'Độ chính xác' : 'Accuracy'}</span>
            </div>
            <div className="text-xl font-bold text-text-primary mt-1">
              {score}%
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FILTER TABS
         ========================================================================= */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex p-1 bg-surface-subtle border border-border rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <BookOpen size={15} />
            <span>{vi ? 'Tất cả câu hỏi' : 'All items'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'all' ? 'bg-white/20' : 'bg-surface border'}`}>
              {total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wrong')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'wrong'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <AlertTriangle size={15} />
            <span>{vi ? 'Câu làm sai' : 'Mistakes'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'wrong'
                ? 'bg-white/20'
                : wrongCount > 0
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300'
                : 'bg-surface border'
            }`}>
              {wrongCount}
            </span>
          </button>
        </div>

        {wrongCount > 0 && activeTab !== 'wrong' && (
          <button
            type="button"
            onClick={() => setActiveTab('wrong')}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{vi ? `Xem nhanh ${wrongCount} câu làm sai` : `View ${wrongCount} mistakes`}</span>
            <span>→</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          QUESTION DETAILS LIST (PART 1, 2, 3, 4)
         ========================================================================= */}
      {details.length > 0 && (
        <div className="space-y-4">
          {filteredDetails.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-surface">
              <CheckCircle2 size={40} className="text-emerald-500 mb-2" />
              <p className="font-bold text-text-primary">
                {vi ? 'Tuyệt vời! Bạn không làm sai câu nào.' : 'Great job! You made zero mistakes.'}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {vi ? 'Chuyển sang tab "Tất cả câu hỏi" để xem lại toàn bộ bài làm.' : 'Switch to "All items" to review the full questions.'}
              </p>
            </div>
          ) : (
            filteredDetails.map((detail, index) => {
              const qNum = detail.question_index != null ? detail.question_index + 1 : index + 1
              const isCorrect = detail.is_correct
              const imageUrl = (detail as any).image_url ? resolveImageUrl((detail as any).image_url) : ''
              const transcript = (detail as any).transcript || ''
              const questionType = (detail as any).question_type || ''

              return (
                <article
                  key={`${detail.question_id || index}-${qNum}`}
                  className={`rounded-2xl border transition-all overflow-hidden shadow-2xs ${
                    isCorrect
                      ? 'border-emerald-200/80 dark:border-emerald-900/40 bg-surface'
                      : 'border-rose-200/80 dark:border-rose-900/40 bg-surface'
                  }`}
                >
                  {/* Card Header Bar */}
                  <div
                    className={`flex items-center justify-between px-5 py-3.5 border-b ${
                      isCorrect
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30'
                        : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-text-primary">
                        {vi ? 'Câu' : 'Question'} {qNum}
                      </span>
                      {questionType && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-surface border border-border text-text-secondary">
                          {questionType}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                          <Check size={13} strokeWidth={3} />
                          <span>{vi ? 'Đúng' : 'Correct'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200">
                          <X size={13} strokeWidth={3} />
                          <span>{vi ? 'Chưa đúng' : 'Incorrect'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    {/* Part 1 Photograph Display */}
                    {imageUrl && (
                      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/5 dark:bg-slate-900/40 border border-border">
                        <img
                          src={imageUrl}
                          alt={`TOEIC Part 1 Photograph Question ${qNum}`}
                          className="max-h-72 w-auto rounded-lg object-contain shadow-xs"
                          loading="lazy"
                        />
                        <span className="text-[11px] text-text-tertiary mt-2 flex items-center gap-1">
                          <ImageIcon size={12} />
                          <span>{vi ? 'Ảnh bài thi TOEIC Part 1' : 'TOEIC Part 1 Image'}</span>
                        </span>
                      </div>
                    )}

                    {/* Question Text */}
                    {detail.question_text && (
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-sm sm:text-base font-bold text-text-primary leading-snug">
                          {detail.question_text}
                        </h4>
                        <button
                          type="button"
                          onClick={() => speakText(detail.question_text, `q_${qNum}`)}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-primary hover:bg-surface-subtle transition-colors shrink-0"
                          title={vi ? 'Nghe phát âm câu hỏi' : 'Listen to question'}
                        >
                          <Volume2 size={16} className={playingKey === `q_${qNum}` ? 'text-primary animate-pulse' : ''} />
                        </button>
                      </div>
                    )}

                    {/* Transcript for Part 1 or Audio text */}
                    {transcript && (
                      <div className="rounded-xl bg-surface-subtle border border-border/80 p-3.5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
                          <span className="flex items-center gap-1.5">
                            <Headphones size={13} className="text-primary" />
                            <span>{vi ? 'Lời thoại (Transcript):' : 'Transcript:'}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => speakText(transcript, `tr_${qNum}`)}
                            className="p-1 rounded text-text-tertiary hover:text-primary transition-colors flex items-center gap-1"
                          >
                            <Volume2 size={13} className={playingKey === `tr_${qNum}` ? 'text-primary animate-pulse' : ''} />
                            <span className="text-[11px]">{vi ? 'Đọc toàn bộ' : 'Read all'}</span>
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-text-primary leading-relaxed whitespace-pre-line font-serif">
                          {transcript}
                        </p>
                      </div>
                    )}

                    {/* Answers Comparison - Old compact inline UI as requested */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs sm:text-sm">
                      <span className="text-text-secondary font-medium">{vi ? 'Đáp án của bạn:' : 'Your answer:'}</span>
                      <span
                        className={`px-2 py-0.5 rounded font-medium ${
                          isCorrect
                            ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                            : 'line-through decoration-rose-400 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
                        }`}
                      >
                        {detail.user_answer || (vi ? '(Chưa chọn)' : '(No answer)')}
                      </span>
                      {!isCorrect && (
                        <>
                          <span className="text-text-secondary">➔</span>
                          <span className="text-text-secondary font-medium">{vi ? 'Đáp án đúng:' : 'Correct answer:'}</span>
                          <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-bold inline-flex items-center gap-1.5">
                            <span>{detail.correct_answer}</span>
                            <button
                              type="button"
                              onClick={() => speakText(detail.correct_answer, `ans_${qNum}`)}
                              className="p-0.5 rounded text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
                              title={vi ? 'Nghe phát âm đáp án' : 'Listen to answer'}
                            >
                              <Volume2 size={13} className={playingKey === `ans_${qNum}` ? 'animate-pulse' : ''} />
                            </button>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Explanations (Giải thích chi tiết) */}
                    {(detail.explanation_vi || detail.explanation) && (
                      <div className="rounded-xl border border-blue-200/70 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 p-3.5 space-y-1">
                        <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
                          <span>{vi ? 'Giải thích đáp án:' : 'Explanation:'}</span>
                        </span>
                        <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
                          {vi
                            ? detail.explanation_vi || detail.explanation
                            : detail.explanation}
                        </p>
                      </div>
                    )}

                    {/* Distractor Reason (Bẫy đề thi) */}
                    {(detail.distractor_reason || detail.distractor_reason_vi) && (
                      <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 space-y-1">
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400" />
                          <span>{vi ? 'Bẫy đề thi cần lưu ý:' : 'Common Trap / Distractor:'}</span>
                        </span>
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                          {vi
                            ? detail.distractor_reason_vi || detail.distractor_reason
                            : detail.distractor_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              )
            })
          )}
        </div>
      )}

      {/* =========================================================================
          DICTATION SEGMENT DETAILS
         ========================================================================= */}
      {segments.length > 0 && (
        <div className="space-y-4">
          {filteredSegments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-surface">
              <CheckCircle2 size={40} className="text-emerald-500 mb-2" />
              <p className="font-bold text-text-primary">
                {vi ? 'Tuyệt vời! Bạn không chép sai ô trống nào.' : 'Great! All blanks filled accurately.'}
              </p>
            </div>
          ) : (
            filteredSegments.map((segment) => {
              const segNum = segment.segment_index + 1
              const segCorrect = segment.answers.filter((a) => a.is_correct).length
              const segTotal = segment.answers.length

              return (
                <article
                  key={`seg-${segment.segment_index}`}
                  className="rounded-2xl border border-border bg-surface overflow-hidden shadow-2xs space-y-4 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-text-primary">
                        {vi ? 'Đoạn' : 'Segment'} {segNum}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-subtle border text-text-secondary">
                        {segCorrect} / {segTotal} {vi ? 'từ đúng' : 'correct'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => speakText(segment.text, `seg_${segNum}`)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-text-secondary hover:text-primary hover:bg-surface-subtle transition-colors flex items-center gap-1.5"
                    >
                      <Volume2 size={14} className={playingKey === `seg_${segNum}` ? 'text-primary animate-pulse' : ''} />
                      <span>{vi ? 'Nghe toàn đoạn' : 'Listen to segment'}</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-text-primary font-serif leading-relaxed bg-surface-subtle/60 p-3.5 rounded-xl border border-border/50">
                    &ldquo;{segment.text}&rdquo;
                  </p>

                  {/* Blanks List */}
                  <div className="space-y-3 pt-1">
                    {segment.answers.map((blank) => {
                      const isCorrect = blank.is_correct
                      const bNum = blank.blank_index + 1

                      return (
                        <div
                          key={`b-${blank.blank_index}`}
                          className={`rounded-xl border p-3 text-xs sm:text-sm space-y-2 ${
                            isCorrect
                              ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30'
                              : 'bg-rose-50/30 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-text-secondary">
                                #{bNum}
                              </span>
                              <span className="text-text-secondary">{vi ? 'Bạn điền:' : 'You wrote:'}</span>
                              <span
                                className={`font-semibold ${
                                  isCorrect
                                    ? 'text-emerald-700 dark:text-emerald-300'
                                    : 'text-rose-600 dark:text-rose-400 line-through'
                                }`}
                              >
                                {blank.user_answer || (vi ? '(Chưa điền)' : '(Blank)')}
                              </span>
                              <span className="text-text-secondary">➔</span>
                              <span className="font-bold text-emerald-800 dark:text-emerald-200">
                                {blank.correct_answer}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {isCorrect ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                  <Check size={14} />
                                  <span>{vi ? 'Đúng' : 'Correct'}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                                  <X size={14} />
                                  <span>{vi ? 'Chưa đúng' : 'Incorrect'}</span>
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => speakText(blank.correct_answer, `b_${segNum}_${bNum}`)}
                                className="p-1 rounded text-text-tertiary hover:text-primary transition-colors"
                              >
                                <Volume2 size={13} className={playingKey === `b_${segNum}_${bNum}` ? 'text-primary animate-pulse' : ''} />
                              </button>
                            </div>
                          </div>

                          {!isCorrect && (
                            <DictationWordDiff
                              answer={blank.user_answer || ''}
                              expected={blank.correct_answer}
                              vi={vi}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </article>
              )
            })
          )}
        </div>
      )}

      {/* Bottom Back Button */}
      <div className="flex items-center justify-center pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="gap-2 px-6 py-2.5 border-border hover:bg-surface-subtle font-semibold cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>{backLabel || (vi ? 'Về danh sách bài nghe' : 'Back to exercises')}</span>
        </Button>
      </div>
    </div>
  )
}
