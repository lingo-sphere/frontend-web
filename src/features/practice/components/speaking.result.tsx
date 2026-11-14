import { usePracticeReview } from '../hooks/use.practice.review'
import { PracticeReviewPanel } from './practice.review.panel'
import { WritingTaskAssessmentView } from './writing.task.assessment'
import { SkillEvaluationFeedback } from './skill.evaluation.feedback'
import { SpeakingLearningFeedback } from './speaking.learning.feedback'
import { SpeakingVocabularySaving } from './speaking.vocabulary.saving'
import { speakingIssueWordTarget } from '../lib/speaking-vocabulary'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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
  Clock,
  Mic,
  Layers,
  Award,
  Copy,
  Check,
} from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/tabs'
import type { SpeakingAttempt, SpeakingExercise, SpeakingLearningIssue } from '@/features/practice/types/speaking'
import { resolveMediaUrlAsync } from '@/utils/media.utils'

interface SpeakingResultProps {
  submission: SpeakingAttempt
  exercise: SpeakingExercise
  onBack: () => void
  onPracticeAgain: () => void
  onPracticeIssue?: (issue: SpeakingLearningIssue) => void
  onNextExercise: () => void
}

export function SpeakingResult({
  submission,
  exercise,
  onBack,
  onPracticeAgain,
  onPracticeIssue,
  onNextExercise,
}: SpeakingResultProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language.startsWith('vi')

  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackPosition, setPlaybackPosition] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingTurnKey, setPlayingTurnKey] = useState<string | null>(null)
  const turnAudioRef = useRef<HTMLAudioElement | null>(null)
  const reviewState = usePracticeReview('SPEAKING', submission.id, Number.isFinite(submission.overall_score))
  const evaluation = submission.ai_evaluation
  const [copiedTranscript, setCopiedTranscript] = useState(false)

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

  const handlePlayTurnAudio = async (
    turnKey: string,
    audioUrl?: string,
    mediaId?: string,
    offset?: number,
    duration?: number
  ) => {
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
    if (src) src = (await resolveMediaUrlAsync(src)) || undefined

    if (!src) return

    const audio = new Audio(src)
    if (offset != null) {
      audio.onloadedmetadata = () => {
        audio.currentTime = Math.max(0, offset - 0.25)
      }
    }
    if (offset != null && duration != null) {
      audio.ontimeupdate = () => {
        if (audio.currentTime >= offset + duration + 0.5) {
          audio.pause()
          setPlayingTurnKey(null)
        }
      }
    }
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

  const handlePlayTurnBotModel = async (
    turnKey: string,
    textEn: string,
    promptAudioId?: string
  ) => {
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
  const isDialogue = exType === 'SHORT_DIALOGUE'
  const isControlled = ['READ_ALOUD', 'REPEAT_AFTER_AUDIO', 'SHADOW_SPEAKING'].includes(exType)
  const isGuided = ['DESCRIBE_PICTURE', 'ANSWER_QUESTION'].includes(exType)

  const toScore100 = (val: number) => {
    const num = val || 0
    if (
      ['speaking-v2', 'azure-speaking-v1', 'speaking-v3'].includes(submission.grading_version || '') ||
      submission.grading_version?.startsWith('teacher:') ||
      ['speaking-v2', 'azure-speaking-v1', 'speaking-v3'].includes(evaluation?.grading_version || '')
    )
      return num
    return num <= 10 && num > 0 ? num * 10 : num
  }

  const allScores = [
    {
      label: isVietnamese ? 'Phát âm' : 'Pronunciation',
      value: toScore100(submission.pronunciation_score || 0),
      color: 'bg-blue-500',
      visible: true,
    },
    {
      label: isVietnamese ? 'Lưu loát' : 'Fluency',
      value: toScore100(submission.fluency_score || 0),
      color: 'bg-emerald-500',
      visible: true,
    },
    {
      label: isVietnamese ? 'Ngữ pháp' : 'Grammar',
      value: toScore100(submission.grammar_score || 0),
      color: 'bg-purple-500',
      visible: !isControlled,
    },
    {
      label: isVietnamese ? 'Từ vựng' : 'Vocabulary',
      value: toScore100(submission.vocabulary_score || 0),
      color: 'bg-amber-500',
      visible: !isControlled,
    },
    {
      label: isVietnamese ? 'Tự nhiên' : 'Naturalness',
      value: toScore100(submission.coherence_score || 0),
      color: 'bg-rose-500',
      visible: !isControlled && !isGuided,
    },
    {
      label: isVietnamese ? 'Nhiệm vụ' : 'Task',
      value: toScore100(submission.content_score || 0),
      color: 'bg-cyan-500',
      visible: !isControlled,
    },
  ]
  const scores = submission.grading_version?.startsWith('teacher:')
    ? []
    : allScores.filter((s) => s.visible)

  const handlePlayAudio = async () => {
    let audioSrc = submission.audio_url || submission.recording_media_id
    if (!audioSrc) return

    if (!audioRef.current) {
      audioSrc = (await resolveMediaUrlAsync(audioSrc)) || ''
      if (!audioSrc) return
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
    if (val >= 80) return 'text-emerald-600 dark:text-emerald-400'
    if (val >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-rose-600 dark:text-rose-400'
  }

  const getScoreBg = (value: number) => {
    const val = toScore100(value)
    if (val >= 80)
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60'
    if (val >= 60)
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60'
    return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
  }

  const overallScore100 =
    reviewState.query.data?.overall_score ?? toScore100(submission.overall_score ?? 0)

  const learningIssuesCount = evaluation?.learning_issues?.length || 0

  const handleCopyTranscript = async () => {
    if (!submission.transcription) return
    try {
      await navigator.clipboard.writeText(submission.transcription)
      setCopiedTranscript(true)
      setTimeout(() => setCopiedTranscript(false), 2000)
    } catch {}
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-5 px-4 py-6 sm:px-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary transition"
        >
          <ArrowLeft size={16} />
          {isVietnamese ? 'Quay lại danh sách' : 'Back to exercises'}
        </button>

        <div className="flex items-center gap-2">
          {submission.is_best_attempt && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <Sparkles size={12} className="text-amber-500" />
              {isVietnamese ? 'Điểm cao nhất' : 'Best score'}
            </span>
          )}
          <Badge variant="secondary" className="text-xs">
            {isVietnamese ? 'Lần' : 'Attempt'} {submission.attempt_number || 1}
          </Badge>
        </div>
      </div>

      {/* Teacher Review Panel */}
      <PracticeReviewPanel state={reviewState} />
      <WritingTaskAssessmentView skill="SPEAKING" assessment={reviewState.query.data?.review?.teacher_grading?.task_assessment || evaluation?.task_assessment} policy={reviewState.query.data?.review?.teacher_grading?.score_policy || evaluation?.score_policy} source={reviewState.query.data?.review?.teacher_grading ? (isVietnamese ? 'Đánh giá giáo viên hiện tại' : 'Current teacher assessment') : (isVietnamese ? 'Đánh giá AI' : 'AI assessment')} />

      {/* Hero Score & Overview Card (Promax, đồng bộ với Writing) */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Left: Score Badge & Title */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative flex h-22 w-22 sm:h-24 sm:w-24 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-surface-subtle p-2 border border-primary/20 shadow-xs">
              <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${getScoreColor(overallScore100)}`}>
                {Math.round(overallScore100)}
              </span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                / 100
              </span>
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {exercise.exercise_type ? exercise.exercise_type.replace(/_/g, ' ') : 'Speaking'}
                </span>
                {exercise.cefr_level && (
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    CEFR {exercise.cefr_level}
                  </Badge>
                )}
                {evaluation?.raw_score !== undefined && evaluation.max_score !== undefined && (
                  <span className="text-xs text-text-secondary">
                    · {evaluation.raw_score}/{evaluation.max_score} pts
                  </span>
                )}
              </div>

              <h1 className="text-lg sm:text-xl font-bold text-text-primary truncate">
                {isVietnamese && exercise.title_vi ? exercise.title_vi : exercise.title}
              </h1>

              {isVietnamese && exercise.title_vi && (
                <p className="text-xs text-text-secondary truncate">{exercise.title}</p>
              )}

              {/* Quick Metrics Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-text-secondary">
                {submission.recording_duration_seconds !== undefined && submission.recording_duration_seconds > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-surface-subtle px-2 py-0.5">
                    <Clock size={12} className="text-primary" />
                    <strong className="text-text-primary">
                      {formatTime(submission.recording_duration_seconds)}
                    </strong>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-md bg-surface-subtle px-2 py-0.5">
                  <Mic size={12} className="text-primary" />
                  <strong className="text-text-primary">{scores.length}</strong> {isVietnamese ? 'kỹ năng' : 'subskills'}
                </span>
                {learningIssuesCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-surface-subtle px-2 py-0.5">
                    <Sparkles size={12} className="text-primary" />
                    <strong className="text-text-primary">{learningIssuesCount}</strong> {isVietnamese ? 'góp ý cải thiện' : 'targets'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2.5 sm:self-center">
            <Button
              variant="outline"
              onClick={onPracticeAgain}
              className="flex-1 sm:flex-initial flex items-center gap-1.5"
            >
              <RotateCcw size={15} />
              {isVietnamese ? 'Luyện lại' : 'Try again'}
            </Button>
            <Button
              onClick={onNextExercise}
              className="flex-1 sm:flex-initial flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white shadow-sm"
            >
              {isVietnamese ? 'Bài tiếp theo' : 'Next exercise'}
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {/* Compact Sub-score Metrics Strip */}
        {scores.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/80">
            <div className={`grid gap-2 ${scores.length <= 2 ? 'grid-cols-2 max-w-sm' : scores.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3 sm:grid-cols-6'}`}>
              {scores.map((score) => (
                <div
                  key={score.label}
                  className="rounded-xl border border-border/70 bg-surface-subtle/50 px-2.5 py-2 text-center transition hover:border-border"
                >
                  <p className="text-[11px] font-medium text-text-secondary truncate">{score.label}</p>
                  <p className={`text-base sm:text-lg font-bold ${getScoreColor(score.value)}`}>
                    {Math.round(score.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Overall Feedback Quote */}
        {evaluation && (evaluation.overall_feedback || evaluation.detailed_feedback) && (
          <div className="mt-4 rounded-xl border border-border/80 bg-surface-subtle/40 p-3.5 text-xs sm:text-sm text-text-secondary">
            <p className="whitespace-pre-wrap leading-relaxed">
              <span className="font-semibold text-text-primary mr-1">
                💬 {isVietnamese ? 'Nhận xét tổng thể:' : 'Overall feedback:'}
              </span>
              {evaluation.overall_feedback || evaluation.detailed_feedback}
            </p>
          </div>
        )}
      </section>

      {/* Main Tabbed Interactive Experience */}
      <Tabs defaultValue="recording" className="w-full space-y-4">
        {/* Custom Tab Triggers */}
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex h-11 w-full sm:w-auto p-1 bg-surface border border-border rounded-xl">
            <TabsTrigger
              value="recording"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition"
            >
              <Mic size={15} />
              <span>
                {isDialogue
                  ? isVietnamese
                    ? 'Hội thoại & Ghi âm'
                    : 'Dialogue & Audio'
                  : isVietnamese
                  ? 'Bản ghi & Phát lại'
                  : 'Recording & Audio'}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="corrections"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition"
            >
              <Sparkles size={15} />
              <span>{isVietnamese ? 'Sửa lỗi & Luyện tập' : 'Corrections & Practice'}</span>
              {learningIssuesCount > 0 && (
                <span className="ml-1 rounded-full bg-primary-foreground/20 px-1.5 py-0.2 text-[11px] font-bold">
                  {learningIssuesCount}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="criteria"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition"
            >
              <Layers size={15} />
              <span>{isVietnamese ? 'Tiêu chí & Lời khuyên' : 'Rubric & Insights'}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Audio Playback & Dialogue/Transcript */}
        <TabsContent value="recording" className="space-y-4 outline-none">
          {/* Main Audio Player (For Non-dialogue or Overall Audio) */}
          {!isDialogue && (
            <Card className="rounded-2xl border-border bg-surface overflow-hidden shadow-xs">
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 size={18} className="text-primary" />
                    <h3 className="text-sm font-bold text-text-primary">
                      {isVietnamese ? 'Nghe lại bài nói của bạn' : 'Replay Your Recording'}
                    </h3>
                  </div>
                  <span className="text-xs text-text-secondary">
                    {formatTime(playbackPosition)} / {formatTime(submission.recording_duration_seconds || 0)}
                  </span>
                </div>

                {/* Modern Audio Player Bar */}
                <div className="flex items-center gap-3 rounded-xl bg-surface-subtle/70 p-3 sm:p-4 border border-border/60">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 shrink-0 rounded-full bg-surface shadow-xs hover:bg-primary hover:text-white transition cursor-pointer"
                    onClick={handlePlayAudio}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                  </Button>
                  <div className="flex-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-border/80">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-200"
                        style={{
                          width: `${(playbackPosition / (submission.recording_duration_seconds || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Transcript Card */}
                {submission.transcription && (
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        {isVietnamese ? 'Bản gỡ băng giọng nói (AI Transcript):' : 'Speech Transcript:'}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyTranscript}
                        className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs text-text-secondary hover:bg-surface-subtle transition"
                      >
                        {copiedTranscript ? (
                          <>
                            <Check size={12} className="text-emerald-500" />
                            <span className="text-emerald-600 font-medium">
                              {isVietnamese ? 'Đã sao chép' : 'Copied'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>{isVietnamese ? 'Sao chép' : 'Copy'}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="rounded-xl bg-surface-subtle/40 p-4 text-sm leading-relaxed text-text-primary border border-border/50">
                      {submission.transcription}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Dialogue Turn-by-Turn Breakdown */}
          {isDialogue && submission.dialogue_turns_results && submission.dialogue_turns_results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-primary" />
                  <h3 className="text-sm font-bold text-text-primary">
                    {isVietnamese ? 'Đánh giá chi tiết từng lượt đối thoại' : 'Turn-by-turn Dialogue Evaluation'}
                  </h3>
                </div>
                <Badge variant="outline" className="text-xs">
                  {submission.difficulty_chosen || 'MEDIUM'}
                </Badge>
              </div>

              <div className="space-y-3">
                {submission.dialogue_turns_results.map((storedTurn) => {
                  const aiTurn = evaluation?.turn_evaluations?.find(
                    (row: { turn_number: number }) => row.turn_number === storedTurn.turn_number
                  )
                  const savedAudio = storedTurn.audio_data?.startsWith('data:audio/') ? storedTurn.audio_data : undefined
                  const audioUrl = storedTurn.audio_url?.startsWith('blob:') ? savedAudio : storedTurn.audio_url || savedAudio
                  const turnRes = {
                    ...storedTurn,
                    audio_url: audioUrl,
                    goal_accomplished: aiTurn?.goal_accomplished,
                    user_transcription: aiTurn?.user_transcript,
                    better_alternative: aiTurn?.better_alternative,
                    feedback: aiTurn?.feedback,
                  }
                  const turnScenario = exercise.dialogue_scenario?.turns.find(
                    (t) => t.turn_number === turnRes.turn_number
                  )

                  return (
                    <div
                      key={turnRes.turn_number}
                      className="rounded-xl border border-border bg-surface p-4 text-xs sm:text-sm space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-primary text-sm font-bold">
                          {isVietnamese ? 'Lượt' : 'Turn'} {turnRes.turn_number}:{' '}
                          {turnScenario?.speaker_name || (isVietnamese ? 'Bạn nói' : 'Your turn')}
                        </span>
                        <div className="flex items-center gap-2 text-xs">
                          {turnRes.response_latency_seconds !== undefined && (
                            <span className="text-text-secondary">
                              ⏱️ {turnRes.response_latency_seconds}s
                            </span>
                          )}
                          <span
                            className={`rounded-full px-2 py-0.5 font-bold ${
                              turnRes.goal_accomplished === 'YES'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            }`}
                          >
                            {turnRes.goal_accomplished === 'YES'
                              ? isVietnamese
                                ? '✓ Đạt mục tiêu'
                                : '✓ Goal met'
                              : isVietnamese
                              ? '⚠️ Cần cải thiện'
                              : '⚠️ Needs work'}
                          </span>
                        </div>
                      </div>

                      {turnScenario?.user_guidance && (
                        <p className="text-xs text-text-secondary">
                          🎯 <strong className="text-text-primary">{isVietnamese ? 'Mục tiêu: ' : 'Goal: '}</strong>
                          {turnScenario.user_guidance.turn_goal_vi || turnScenario.user_guidance.goal_vi}
                        </p>
                      )}

                      {/* Your statement */}
                      <div className="rounded-lg bg-surface-subtle/60 p-3 border border-border/50 text-xs sm:text-sm text-text-primary">
                        <p className="font-medium">
                          &quot;{turnRes.user_transcription || '[Không ghi nhận câu thoại]'}&quot;
                        </p>
                      </div>

                      {/* Better alternative */}
                      {turnRes.better_alternative && (
                        <div className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-lg p-2.5 border border-emerald-200 dark:border-emerald-900/50">
                          <span className="font-bold mr-1">
                            💡 {isVietnamese ? 'Diễn đạt tự nhiên hơn:' : 'Better phrasing:'}
                          </span>
                          {turnRes.better_alternative}
                        </div>
                      )}

                      {turnRes.feedback && (
                        <p className="text-xs sm:text-sm text-text-secondary">{turnRes.feedback}</p>
                      )}

                      {/* Audio Controls */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
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
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 text-xs font-semibold transition cursor-pointer"
                          >
                            {playingTurnKey === `user-${turnRes.turn_number}` ? (
                              <>
                                <Pause size={13} className="animate-pulse" />
                                <span>{isVietnamese ? 'Tạm dừng giọng bạn' : 'Pause'}</span>
                              </>
                            ) : (
                              <>
                                <Play size={13} fill="currentColor" />
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
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-surface hover:bg-surface-subtle text-text-secondary hover:text-text-primary px-3 py-1.5 text-xs font-medium transition cursor-pointer"
                          >
                            {playingTurnKey === `bot-${turnRes.turn_number}` ? (
                              <>
                                <Pause size={13} className="text-primary animate-pulse" />
                                <span className="text-primary font-semibold">
                                  {isVietnamese ? 'Đang phát mẫu...' : 'Playing Model...'}
                                </span>
                              </>
                            ) : (
                              <>
                                <Volume2 size={13} />
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
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Corrections, Vocabulary & Pronunciation Learning Issues */}
        <TabsContent value="corrections" className="space-y-4 outline-none">
          {evaluation?.acoustic_provider_version ? (
            <SpeakingVocabularySaving
              targets={(evaluation.learning_issues || [])
                .filter((issue) => issue.kind === 'PRONUNCIATION')
                .map((issue) => speakingIssueWordTarget(issue, submission.id))}
            >
              {(actions) => (
                <SpeakingLearningFeedback
                  attemptId={submission.id}
                  issues={evaluation.learning_issues || []}
                  assessments={evaluation.azure_assessments}
                  renderSaveAction={(issue) =>
                    actions.renderSaveButton(speakingIssueWordTarget(issue, submission.id))
                  }
                  onPractice={onPracticeIssue || onPracticeAgain}
                  onPlay={(issue) => {
                    const turn = submission.dialogue_turns_results?.find(
                      (t) => t.turn_number === issue.turn_number
                    )
                    void handlePlayTurnAudio(
                      `issue-${issue.turn_number}-${issue.offset_seconds}`,
                      turn?.audio_url || submission.audio_url,
                      turn?.recording_media_id || submission.recording_media_id,
                      issue.offset_seconds,
                      issue.duration_seconds
                    )
                  }}
                />
              )}
            </SpeakingVocabularySaving>
          ) : !evaluation?.grading_version ? (
            <div className="space-y-3">
              {evaluation?.pronunciation_analysis && (
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
              {evaluation?.fluency_analysis && (
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
              {evaluation?.grammar_analysis && (
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
              {evaluation?.vocabulary_analysis && (
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
              {evaluation?.coherence_analysis && (
                <AnalysisItem
                  icon={Sparkles}
                  title={isVietnamese ? 'Tính tự nhiên & Collocation' : 'Naturalness & Expressions'}
                  score={evaluation.coherence_analysis.score}
                  issues={evaluation.coherence_analysis.issues}
                  suggestions={evaluation.coherence_analysis.suggestions}
                  scoreColor={getScoreColor}
                  scoreBg={getScoreBg}
                  isVietnamese={isVietnamese}
                />
              )}
              {evaluation?.content_analysis && (
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
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20 p-8 text-center">
              <CheckCircle2 size={42} className="text-emerald-500 mb-3" />
              <h3 className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                {isVietnamese ? 'Phát âm và diễn đạt bài nói rất tốt!' : 'Great pronunciation and fluency!'}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-text-secondary max-w-md">
                {isVietnamese
                  ? 'Hệ thống không phát hiện lỗi sai phát âm hay cấu trúc câu nghiêm trọng.'
                  : 'No major pronunciation or grammatical errors detected.'}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Detailed Rubric & Actionable Tips */}
        <TabsContent value="criteria" className="space-y-5 outline-none">
          {evaluation?.grading_version ? (
            <SkillEvaluationFeedback evaluation={evaluation} />
          ) : (
            <div className="space-y-4">
              {/* Criteria Progress Cards */}
              <div className="grid gap-3 sm:grid-cols-2">
                {scores.map((sc) => (
                  <div key={sc.label} className="rounded-xl border border-border bg-surface p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-text-primary">{sc.label}</span>
                      <span className={`text-xs font-bold rounded-md px-2 py-0.5 ${getScoreBg(sc.value)}`}>
                        {Math.round(sc.value)}/100
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${sc.color}`}
                        style={{ width: `${Math.min(100, Math.max(0, sc.value))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Improvement Tips */}
              {evaluation?.improvement_tips && evaluation.improvement_tips.length > 0 && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-4">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-300">
                    <Lightbulb size={16} className="text-amber-600 shrink-0" />
                    {isVietnamese ? 'Lời khuyên nâng điểm tiếp theo' : 'Improvement Tips'}
                  </h3>
                  <ul className="space-y-1.5 pl-5 list-disc text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                    {evaluation.improvement_tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Bottom Sticky-like Action Footer */}
      <section className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          {isVietnamese ? 'Về danh sách bài' : 'Exercise list'}
        </Button>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={onPracticeAgain} className="flex items-center gap-1.5">
            <RotateCcw size={14} />
            {isVietnamese ? 'Luyện lại bài này' : 'Practice again'}
          </Button>
          <Button
            size="sm"
            onClick={onNextExercise}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white shadow-sm"
          >
            {isVietnamese ? 'Làm bài tiếp theo' : 'Next exercise'}
            <ChevronRight size={15} />
          </Button>
        </div>
      </section>
    </main>
  )
}

function AnalysisItem({
  icon: IconComponent,
  title,
  score,
  issues,
  suggestions,
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
    <div className="rounded-xl border border-border bg-surface overflow-hidden transition">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-3.5 text-left hover:bg-surface-subtle/50 transition cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <IconComponent size={18} className="text-primary" />
          <span className="text-sm font-semibold text-text-primary">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${scoreBg(score)}`}>
            {score.toFixed(1)}
          </span>
          {expanded ? <ChevronUp size={15} className="text-text-secondary" /> : <ChevronDown size={15} className="text-text-secondary" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border/70 bg-surface-subtle/30 p-3.5 space-y-3 text-xs sm:text-sm">
          {issues.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                {isVietnamese ? 'Vấn đề cần lưu ý:' : 'Issues:'}
              </p>
              <ul className="space-y-1.5">
                {issues.map((issue, i) => {
                  const match = issue.match(/\/[^\/]+\//)
                  return (
                    <li key={i} className="flex items-center justify-between gap-2 text-text-secondary">
                      <div className="flex items-start gap-1.5">
                        <XCircle size={13} className="mt-0.5 shrink-0 text-rose-500" />
                        <span>{issue}</span>
                      </div>
                      {match && (
                        <a
                          href="/ipa"
                          className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary hover:bg-primary/20 transition"
                        >
                          {isVietnamese ? `Luyện âm ${match[0]}` : `Practice ${match[0]}`}
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
              <p className="mb-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {isVietnamese ? 'Gợi ý cải thiện:' : 'Suggestions:'}
              </p>
              <ul className="space-y-1">
                {suggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-text-secondary">
                    <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-500" />
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
