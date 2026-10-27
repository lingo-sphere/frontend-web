import { usePracticeReview } from '../hooks/use.practice.review'
import { PracticeReviewPanel } from './practice.review.panel'
import { SkillEvaluationFeedback } from './skill.evaluation.feedback'
// Component giao diện React SpeakingResult cho học viên.

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Volume2,
  Sparkles,
  Bot,
  Target,
  Activity,
  FileText,
  BookOpen,
  Lightbulb,
  Users,
} from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import type { SpeakingAttempt, SpeakingExercise } from '@/features/practice/types/speaking'
import { resolveMediaUrlAsync } from '@/utils/media.utils'

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
  const [playbackPosition, setPlaybackPosition] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingTurnKey, setPlayingTurnKey] = useState<string | null>(null)
  const turnAudioRef = useRef<HTMLAudioElement | null>(null)
  const reviewState = usePracticeReview('SPEAKING', submission.id, Number.isFinite(submission.overall_score))
  const evaluation = submission.ai_evaluation

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (turnAudioRef.current) {
        turnAudioRef.current.pause()
        turnAudioRef.current = null
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const handlePlayTurnAudio = async (turnKey: string, audioUrl?: string, mediaId?: string) => {
    if (playingTurnKey === turnKey) {
      if (turnAudioRef.current) turnAudioRef.current.pause()
      if (window.speechSynthesis) window.speechSynthesis.cancel()
      setPlayingTurnKey(null)
      return
    }

    if (turnAudioRef.current) turnAudioRef.current.pause()
    if (window.speechSynthesis) window.speechSynthesis.cancel()

    let src = audioUrl
    if (!src && mediaId) {
      src = (await resolveMediaUrlAsync(mediaId)) || undefined
    }

    if (!src) return

    const audio = new Audio(src)
    turnAudioRef.current = audio
    setPlayingTurnKey(turnKey)

    audio.onended = () => setPlayingTurnKey(null)
    audio.onerror = () => setPlayingTurnKey(null)
    audio.play().catch(() => setPlayingTurnKey(null))
  }

  const speakBotModelSpeechSynthesis = (text: string, turnKey: string) => {
    if (!('speechSynthesis' in window)) {
      setPlayingTurnKey(null)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.95
    utterance.onend = () => setPlayingTurnKey(null)
    utterance.onerror = () => setPlayingTurnKey(null)
    window.speechSynthesis.speak(utterance)
  }

  const handlePlayTurnBotModel = async (turnKey: string, textEn: string, promptAudioId?: string) => {
    if (playingTurnKey === turnKey) {
      if (turnAudioRef.current) turnAudioRef.current.pause()
      if (window.speechSynthesis) window.speechSynthesis.cancel()
      setPlayingTurnKey(null)
      return
    }

    if (turnAudioRef.current) turnAudioRef.current.pause()
    if (window.speechSynthesis) window.speechSynthesis.cancel()

    setPlayingTurnKey(turnKey)

    if (promptAudioId) {
      try {
        const resolved = await resolveMediaUrlAsync(promptAudioId)
        if (resolved) {
          const audio = new Audio(resolved)
          turnAudioRef.current = audio
          audio.onended = () => setPlayingTurnKey(null)
          audio.onerror = () => speakBotModelSpeechSynthesis(textEn, turnKey)
          await audio.play()
          return
        }
      } catch {}
    }

    speakBotModelSpeechSynthesis(textEn, turnKey)
  }

  const exType = (exercise.exercise_type || 'READ_ALOUD').toUpperCase()
  const isControlled = ['READ_ALOUD', 'REPEAT_AFTER_AUDIO', 'SHADOW_SPEAKING'].includes(exType)
  const isGuided = ['DESCRIBE_PICTURE', 'ANSWER_QUESTION'].includes(exType)

  const toScore100 = (val: number) => {
    const num = val || 0
    if (submission.grading_version === 'speaking-v2' || evaluation?.grading_version === 'speaking-v2') return num
    return num <= 10 && num > 0 ? num * 10 : num
  }

  const allScores = [
    { label: isVietnamese ? 'Phát âm' : 'Pronunciation', value: toScore100(submission.pronunciation_score || 0), color: 'bg-blue-500', visible: true },
    { label: 'Fluency', value: toScore100(submission.fluency_score || 0), color: 'bg-emerald-500', visible: true },
    { label: isVietnamese ? 'Ngữ pháp' : 'Grammar', value: toScore100(submission.grammar_score || 0), color: 'bg-amber-500', visible: !isControlled },
    { label: isVietnamese ? 'Từ vựng' : 'Vocabulary', value: toScore100(submission.vocabulary_score || 0), color: 'bg-purple-500', visible: !isControlled },
    { label: isVietnamese ? 'Tự nhiên' : 'Naturalness', value: toScore100(submission.coherence_score || 0), color: 'bg-rose-500', visible: !isControlled && !isGuided },
    { label: isVietnamese ? 'Nhiệm vụ' : 'Task', value: toScore100(submission.content_score || 0), color: 'bg-cyan-500', visible: !isControlled },
  ]
  const scores = allScores.filter((s) => s.visible)

  const handlePlayAudio = async () => {
    let audioSrc = submission.audio_url || submission.recording_media_id
    if (!audioSrc) return

    if (!audioRef.current) {
      if (submission.recording_media_id && !submission.audio_url) {
        audioSrc = (await resolveMediaUrlAsync(submission.recording_media_id)) || audioSrc
      }
      const audio = new Audio(audioSrc)
      audioRef.current = audio
      audio.ontimeupdate = () => {
        setPlaybackPosition(Math.floor(audio.currentTime))
      }
      audio.onended = () => {
        setIsPlaying(false)
        setPlaybackPosition(0)
      }
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }
  }

  const getScoreColor = (value: number) => {
    const val = toScore100(value)
    if (val >= 80) return 'text-emerald-600'
    if (val >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreBg = (value: number) => {
    const val = toScore100(value)
    if (val >= 80) return 'bg-emerald-100 text-emerald-700'
    if (val >= 60) return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  }

  const overallScore100 = toScore100(reviewState.query.data?.overall_score ?? submission.overall_score ?? 0)

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

      <PracticeReviewPanel state={reviewState} />

      <Card className="mb-6 dashboard-card border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            <p className="mb-2 text-[14px] font-medium text-text-secondary">
              {isVietnamese ? 'Điểm tổng thể' : 'Overall Score'}
            </p>
            <div className="mb-4 text-center">
              <span className={`text-6xl font-bold ${getScoreColor(overallScore100)}`}>
                {Math.round(overallScore100)}
              </span>
              <span className="text-[24px] text-text-tertiary">/100</span>
            </div>
            <div className="flex items-center gap-2">
              {submission.is_best_attempt && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[12px] font-medium text-amber-700">
                  <Sparkles size={13} className="text-amber-600" />
                  {isVietnamese ? 'Điểm cao nhất' : 'Best Score'}
                </span>
              )}
              <span className="rounded-full bg-surface-subtle px-3 py-1 text-[12px] text-text-secondary">
                {isVietnamese ? 'Lần' : 'Attempt'} {submission.attempt_number || 1}
              </span>
            </div>
          </div>

          <div className={`mt-6 grid gap-3 ${scores.length === 2 ? 'grid-cols-2 max-w-md mx-auto' : scores.length === 5 ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-3 sm:grid-cols-6'}`}>
            {scores.map((score) => (
              <div key={score.label} className="text-center rounded-xl bg-surface-subtle/50 p-3">
                <p className="text-[11px] font-medium text-text-secondary">{score.label}</p>
                <p className={`text-[20px] font-bold ${getScoreColor(score.value)}`}>
                  {Math.round(score.value)}
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

      {/* DIALOGUE TURN-BY-TURN BREAKDOWN */}
      {exercise.exercise_type === 'SHORT_DIALOGUE' && submission.dialogue_turns_results && submission.dialogue_turns_results.length > 0 && (
        <Card className="mb-6 dashboard-card">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-primary" />
                <h2 className="text-[16px] font-bold text-text-primary">
                  {isVietnamese ? 'Đánh giá chi tiết từng lượt hội thoại' : 'Turn-by-turn Dialogue Evaluation'}
                </h2>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                {submission.difficulty_chosen || 'MEDIUM'}
              </span>
            </div>

            <div className="space-y-3">
              {submission.dialogue_turns_results.map((turnRes) => {
                const turnScenario = exercise.dialogue_scenario?.turns.find(
                  (t) => t.turn_number === turnRes.turn_number
                )
                return (
                  <div
                    key={turnRes.turn_number}
                    className="rounded-xl border border-border bg-surface-subtle/60 p-3.5 text-[13px]"
                  >
                    <div className="flex items-center justify-between mb-1.5 font-semibold">
                      <span className="text-primary">
                        Turn {turnRes.turn_number}: {turnScenario?.speaker_name || (isVietnamese ? 'Lượt của bạn' : 'Your turn')}
                      </span>
                      <div className="flex items-center gap-2 text-[11px]">
                        {turnRes.response_latency_seconds !== undefined && (
                          <span className="text-text-tertiary">
                            ⏱️ {isVietnamese ? 'Độ trễ' : 'Latency'}: {turnRes.response_latency_seconds}s
                          </span>
                        )}
                        <span className={`rounded-full px-2 py-0.5 font-bold ${
                          turnRes.goal_accomplished === 'YES'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {turnRes.goal_accomplished === 'YES'
                            ? isVietnamese ? '✓ Đạt mục tiêu' : '✓ Goal met'
                            : isVietnamese ? '⚠️ Cần cải thiện' : '⚠️ Partial'}
                        </span>
                      </div>
                    </div>

                    {turnScenario?.user_guidance && (
                      <p className="text-[12px] text-text-tertiary mb-1">
                        🎯 <span className="font-medium">{isVietnamese ? 'Mục tiêu: ' : 'Goal: '}</span>
                        {turnScenario.user_guidance.turn_goal_vi || turnScenario.user_guidance.goal_vi}
                      </p>
                    )}

                    <div className="rounded-lg bg-surface p-2.5 border border-border/50 text-[13px] text-text-primary">
                      <p className="font-medium">"{turnRes.user_transcription || '[Không ghi nhận câu thoại]'}"</p>
                    </div>

                    {turnRes.better_alternative && (
                      <div className="mt-2 text-[12px] text-emerald-700 bg-emerald-50 rounded-lg p-2 border border-emerald-200">
                        <span className="font-semibold">{isVietnamese ? '💡 Diễn đạt tự nhiên hơn: ' : '💡 Better Phrasing: '}</span>
                        {turnRes.better_alternative}
                      </div>
                    )}

                    {/* Nút phát lại audio của user và phát mẫu chuẩn */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
                      {(turnRes.audio_url || turnRes.recording_media_id) && (
                        <button
                          type="button"
                          onClick={() =>
                            handlePlayTurnAudio(
                              `user-${turnRes.turn_number}`,
                              turnRes.audio_url,
                              turnRes.recording_media_id
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer"
                        >
                          {playingTurnKey === `user-${turnRes.turn_number}` ? (
                            <>
                              <Pause size={12} className="animate-pulse" />
                              <span>{isVietnamese ? 'Tạm dừng giọng bạn' : 'Pause'}</span>
                            </>
                          ) : (
                            <>
                              <Play size={12} fill="currentColor" />
                              <span>{isVietnamese ? 'Nghe lại giọng bạn' : 'Play My Voice'}</span>
                            </>
                          )}
                        </button>
                      )}

                      {turnScenario?.text_en && (
                        <button
                          type="button"
                          onClick={() =>
                            handlePlayTurnBotModel(
                              `bot-${turnRes.turn_number}`,
                              turnScenario.text_en,
                              turnScenario.prompt_audio_id
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-surface hover:bg-surface-subtle text-text-secondary hover:text-text-primary px-2.5 py-1 text-[11px] font-medium transition cursor-pointer"
                        >
                          {playingTurnKey === `bot-${turnRes.turn_number}` ? (
                            <>
                              <Pause size={12} className="text-primary animate-pulse" />
                              <span className="text-primary font-semibold">{isVietnamese ? 'Đang phát mẫu...' : 'Playing Model...'}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 size={12} />
                              <span>{isVietnamese ? 'Nghe phát âm chuẩn' : 'Native Model'}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {evaluation && (
        <Card className="mb-6 dashboard-card">
          <CardContent className="p-4">
            <div className="mb-4 flex items-center gap-2">
              <Bot size={20} className="text-primary" />
              <h2 className="text-[16px] font-semibold text-text-primary">
                {isVietnamese ? 'Phản hồi từ AI' : 'AI Feedback'}
              </h2>
            </div>

            <div className="mb-4 rounded-xl bg-surface-subtle p-4">
              <p className="text-[14px] leading-relaxed text-text-primary">
                {evaluation.overall_feedback || evaluation.detailed_feedback}
              </p>
            </div>

            {evaluation.grading_version && <SkillEvaluationFeedback evaluation={evaluation} />}
            {!evaluation.grading_version && <div className="space-y-3">
              {evaluation.pronunciation_analysis && (
                <AnalysisItem
                  icon={Target}
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
                  icon={Activity}
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
                  icon={FileText}
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
                  icon={BookOpen}
                  title={isVietnamese ? 'Phân tích từ vựng' : 'Vocabulary Analysis'}
                  score={evaluation.vocabulary_analysis.score}
                  issues={evaluation.vocabulary_analysis.issues}
                  suggestions={evaluation.vocabulary_analysis.suggestions}
                  scoreColor={getScoreColor}
                  scoreBg={getScoreBg}
                  isVietnamese={isVietnamese}
                />
              )}
              {evaluation.coherence_analysis && (
                <AnalysisItem
                  icon={Sparkles}
                  title={isVietnamese ? 'Tính tự nhiên & Collocation bản xứ' : 'Naturalness & Expressions'}
                  score={evaluation.coherence_analysis.score}
                  issues={evaluation.coherence_analysis.issues}
                  suggestions={evaluation.coherence_analysis.suggestions}
                  scoreColor={getScoreColor}
                  scoreBg={getScoreBg}
                  isVietnamese={isVietnamese}
                />
              )}
              {evaluation.content_analysis && (
                <AnalysisItem
                  icon={CheckCircle2}
                  title={isVietnamese ? 'Hoàn thành nhiệm vụ bài nói' : 'Task Achievement'}
                  score={evaluation.content_analysis.score}
                  issues={evaluation.content_analysis.issues}
                  suggestions={evaluation.content_analysis.suggestions}
                  scoreColor={getScoreColor}
                  scoreBg={getScoreBg}
                  isVietnamese={isVietnamese}
                />
              )}
            </div>}

            {!evaluation.grading_version && evaluation.improvement_tips && evaluation.improvement_tips.length > 0 && (
              <div className="mt-4 rounded-xl bg-amber-50 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-amber-700">
                  <Lightbulb size={16} className="text-amber-600" />
                  {isVietnamese ? 'Lời khuyên cải thiện' : 'Improvement Tips'}
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
  icon: IconComponent,
  title,
  score,
  issues,
  suggestions,
  scoreColor,
  scoreBg,
  isVietnamese,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
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
          <IconComponent size={18} className="text-primary" />
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
                {issues.map((issue, i) => {
                  const match = issue.match(/\/[^\/]+\//)
                  return (
                    <li key={i} className="flex items-center justify-between gap-2 text-[12px] text-text-secondary">
                      <div className="flex items-start gap-1.5">
                        <XCircle size={12} className="mt-0.5 shrink-0 text-red-500" />
                        <span>{issue}</span>
                      </div>
                      {match && (
                        <a
                          href="/ipa"
                          className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary hover:bg-primary/20 transition"
                        >
                          {isVietnamese ? `Luyện ${match[0]}` : `Practice ${match[0]}`}
                        </a>
                      )}
                    </li>
                  )
                })}
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
