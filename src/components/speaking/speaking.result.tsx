// Component giao diện React SpeakingResult cho học viên.

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Play, Pause, RotateCcw, ChevronRight, CheckCircle2, XCircle, Volume2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { SpeakingAttempt, SpeakingExercise } from '@/types/speaking'

interface SpeakingResultProps {
  submission: SpeakingAttempt
  exercise: SpeakingExercise
  onBack: () => void
  onPracticeAgain: () => void
  onNextExercise: () => void
}

export function SpeakingResult({
  submission,
  exercise,
  onBack,
  onPracticeAgain,
  onNextExercise,
}: SpeakingResultProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackPosition] = useState(0)
  const evaluation = submission.ai_evaluation

  const scores = [
    { label: isVietnamese ? 'Phát âm' : 'Pronunciation', value: submission.pronunciation_score || 0, color: 'bg-blue-500' },
    { label: 'Fluency', value: submission.fluency_score || 0, color: 'bg-emerald-500' },
    { label: isVietnamese ? 'Ngữ pháp' : 'Grammar', value: submission.grammar_score || 0, color: 'bg-amber-500' },
    { label: isVietnamese ? 'Từ vựng' : 'Vocabulary', value: submission.vocabulary_score || 0, color: 'bg-purple-500' },
    { label: isVietnamese ? 'Liên kết' : 'Coherence', value: submission.coherence_score || 0, color: 'bg-rose-500' },
    { label: isVietnamese ? 'Nội dung' : 'Content', value: submission.content_score || 0, color: 'bg-cyan-500' },
  ]

  const handlePlayAudio = () => {
    setIsPlaying(!isPlaying)
  }

  const getScoreColor = (value: number) => {
    if (value >= 8) return 'text-emerald-600'
    if (value >= 6) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreBg = (value: number) => {
    if (value >= 8) return 'bg-emerald-100 text-emerald-700'
    if (value >= 6) return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[14px] text-text-secondary hover:text-primary"
        >
          <ArrowLeft size={18} />
          {isVietnamese ? 'Quay lại' : 'Back'}
        </button>
        <div className="flex-1">
          <h1 className="text-[20px] font-bold text-text-primary">
            {isVietnamese ? 'Kết quả đánh giá' : 'Evaluation Results'}
          </h1>
          <p className="text-[13px] text-text-secondary">{exercise.title} - {exercise.title_vi}</p>
        </div>
      </div>

      <Card className="mb-6 dashboard-card border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            <p className="mb-2 text-[14px] font-medium text-text-secondary">
              {isVietnamese ? 'Điểm tổng thể' : 'Overall Score'}
            </p>
            <div className="mb-4 text-center">
              <span className={`text-6xl font-bold ${getScoreColor(submission.overall_score || 0)}`}>
                {(submission.overall_score || 0).toFixed(1)}
              </span>
              <span className="text-[24px] text-text-tertiary">/10</span>
            </div>
            <div className="flex items-center gap-2">
              {submission.is_best_attempt && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[12px] font-medium text-amber-700">
                  ✨ {isVietnamese ? 'Điểm cao nhất' : 'Best Score'}
                </span>
              )}
              <span className="rounded-full bg-surface-subtle px-3 py-1 text-[12px] text-text-secondary">
                {isVietnamese ? 'Lần' : 'Attempt'} {submission.attempt_number}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {scores.map((score) => (
              <div key={score.label} className="text-center">
                <p className="text-[10px] text-text-tertiary">{score.label}</p>
                <p className={`text-[18px] font-bold ${getScoreColor(score.value)}`}>
                  {score.value.toFixed(1)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 dashboard-card">
        <CardContent className="p-4">
          <h2 className="mb-4 text-[16px] font-semibold text-text-primary">
            {isVietnamese ? 'Bản ghi & Phát lại' : 'Recording & Playback'}
          </h2>

          <div className="mb-4 flex items-center gap-3 rounded-xl bg-surface-subtle p-4">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0 rounded-full"
              onClick={handlePlayAudio}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </Button>
            <div className="flex-1">
              <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(playbackPosition / (submission.recording_duration_seconds || 1)) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-text-tertiary">
                <span>{formatTime(playbackPosition)}</span>
                <span>{formatTime(submission.recording_duration_seconds || 0)}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Volume2 size={18} />
            </Button>
          </div>

          {submission.transcription && (
            <div>
              <h3 className="mb-2 text-[13px] font-medium text-text-secondary">
                {isVietnamese ? 'Bản ghi' : 'Transcript'}
              </h3>
              <p className="rounded-xl bg-surface-subtle p-4 text-[14px] leading-relaxed text-text-primary">
                {submission.transcription}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {evaluation && (
        <Card className="mb-6 dashboard-card">
          <CardContent className="p-4">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <h2 className="text-[16px] font-semibold text-text-primary">
                {isVietnamese ? 'Phản hồi từ AI' : 'AI Feedback'}
              </h2>
            </div>

            <div className="mb-4 rounded-xl bg-surface-subtle p-4">
              <p className="text-[14px] leading-relaxed text-text-primary">
                {evaluation.overall_feedback}
              </p>
            </div>

            <div className="space-y-3">
              {evaluation.pronunciation_analysis && (
                <AnalysisItem
                  icon="🎯"
                  title={isVietnamese ? 'Phân tích phát âm' : 'Pronunciation Analysis'}
                  score={evaluation.pronunciation_analysis.score}
                  issues={evaluation.pronunciation_analysis.issues}
                  suggestions={evaluation.pronunciation_analysis.suggestions}
                  scoreColor={getScoreColor}
                  scoreBg={getScoreBg}
                  isVietnamese={isVietnamese}
                />
              )}
              {evaluation.fluency_analysis && (
                <AnalysisItem
                  icon="⚡"
                  title="Fluency Analysis"
                  score={evaluation.fluency_analysis.score}
                  issues={evaluation.fluency_analysis.issues}
                  suggestions={evaluation.fluency_analysis.suggestions}
                  scoreColor={getScoreColor}
                  scoreBg={getScoreBg}
                  isVietnamese={isVietnamese}
                />
              )}
              {evaluation.grammar_analysis && (
                <AnalysisItem
                  icon="📝"
                  title={isVietnamese ? 'Phân tích ngữ pháp' : 'Grammar Analysis'}
                  score={evaluation.grammar_analysis.score}
                  issues={evaluation.grammar_analysis.issues}
                  suggestions={evaluation.grammar_analysis.suggestions}
                  scoreColor={getScoreColor}
                  scoreBg={getScoreBg}
                  isVietnamese={isVietnamese}
                />
              )}
              {evaluation.vocabulary_analysis && (
                <AnalysisItem
                  icon="📚"
                  title={isVietnamese ? 'Phân tích từ vựng' : 'Vocabulary Analysis'}
                  score={evaluation.vocabulary_analysis.score}
                  issues={evaluation.vocabulary_analysis.issues}
                  suggestions={evaluation.vocabulary_analysis.suggestions}
                  scoreColor={getScoreColor}
                  scoreBg={getScoreBg}
                  isVietnamese={isVietnamese}
                />
              )}
            </div>

            {evaluation.improvement_tips && evaluation.improvement_tips.length > 0 && (
              <div className="mt-4 rounded-xl bg-amber-50 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-amber-700">
                  💡 {isVietnamese ? 'Lời khuyên cải thiện' : 'Improvement Tips'}
                </h3>
                <ul className="space-y-1">
                  {evaluation.improvement_tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-amber-900">
                      <span>•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={onPracticeAgain}
        >
          <RotateCcw size={18} />
          {isVietnamese ? 'Luyện lại' : 'Practice Again'}
        </Button>
        <Button
          className="flex-1 gap-2 bg-primary hover:bg-primary-hover"
          onClick={onNextExercise}
        >
          {isVietnamese ? 'Bài tiếp theo' : 'Next Exercise'}
          <ChevronRight size={18} />
        </Button>
      </div>
    </main>
  )
}

function AnalysisItem({
  icon,
  title,
  score,
  issues,
  suggestions,
  scoreColor,
  scoreBg,
  isVietnamese,
}: {
  icon: string
  title: string
  score: number
  issues: string[]
  suggestions: string[]
  scoreColor: (v: number) => string
  scoreBg: (v: number) => string
  isVietnamese: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-[14px] font-medium text-text-primary">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${scoreBg(score)}`}>
            {score.toFixed(1)}
          </span>
          <ChevronRight
            size={16}
            className={`text-text-tertiary transition-transform ${expanded ? 'rotate-90' : ''}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border p-3">
          {issues.length > 0 && (
            <div className="mb-2">
              <p className="mb-1 text-[11px] font-medium text-red-600">
                {isVietnamese ? 'Vấn đề:' : 'Issues:'}
              </p>
              <ul className="space-y-1">
                {issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-1 text-[12px] text-text-secondary">
                    <XCircle size={12} className="mt-0.5 shrink-0 text-red-500" />
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {suggestions.length > 0 && (
            <div>
              <p className="mb-1 text-[11px] font-medium text-emerald-600">
                {isVietnamese ? 'Gợi ý:' : 'Suggestions:'}
              </p>
              <ul className="space-y-1">
                {suggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-1 text-[12px] text-text-secondary">
                    <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
