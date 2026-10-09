/**
 * @file speaking.home.tsx
 * @description Component giao diện React SpeakingHome cho học viên
 */

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Mic,
  TrendingUp,
  Clock,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  Sparkles,
  Target,
  Compass,
  Award,
  Layers,
  ArrowUpRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import type {
  SpeakingStats,
  SpeakingProgress,
  SpeakingAttempt,
  SpeakingExercise,
  UserSpeakingProfile,
} from '@/features/practice/types/speaking'
import { resolveMediaUrlAsync } from '@/utils/media.utils'

interface SpeakingHomeProps {
  stats: SpeakingStats
  progress: SpeakingProgress
  userSpeakingProfile?: UserSpeakingProfile
  recentAttempts: SpeakingAttempt[]
  exercises: SpeakingExercise[]
  onStartPractice: (exercise: SpeakingExercise) => void
  onViewAll: () => void
  onViewHistory: () => void
}

export function SpeakingHome({
  stats,
  progress,
  userSpeakingProfile,
  recentAttempts,
  exercises,
  onStartPractice,
  onViewAll,
  onViewHistory,
}: SpeakingHomeProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [isPlayingShowcase, setIsPlayingShowcase] = useState(false)
  const showcaseAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (showcaseAudioRef.current) {
        showcaseAudioRef.current.pause()
        showcaseAudioRef.current = null
      }
    }
  }, [])

  const handleToggleShowcaseAudio = async (url?: string) => {
    if (!url) return
    if (isPlayingShowcase && showcaseAudioRef.current) {
      showcaseAudioRef.current.pause()
      setIsPlayingShowcase(false)
      return
    }

    try {
      const resolved = await resolveMediaUrlAsync(url)
      if (!resolved) return

      if (!showcaseAudioRef.current || showcaseAudioRef.current.src !== resolved) {
        showcaseAudioRef.current = new Audio(resolved)
        showcaseAudioRef.current.onended = () => setIsPlayingShowcase(false)
        showcaseAudioRef.current.onerror = () => setIsPlayingShowcase(false)
      }
      await showcaseAudioRef.current.play()
      setIsPlayingShowcase(true)
    } catch {
      setIsPlayingShowcase(false)
    }
  }

  const recommendedExercise = exercises.find(e =>
    stats.total_attempts === 0 ? e.difficulty_level === 'EASY' :
    progress.weakest_area === 'Grammar' ? e.exercise_type === 'TOPIC' :
    e.difficulty_level === 'EASY'
  ) || exercises[0]

  const typeLabels: Record<string, string> = {
    TOPIC: isVietnamese ? 'Chủ đề' : 'Topic',
    RESPOND_SITUATION: isVietnamese ? 'Phản hồi' : 'Respond',
    PRONUNCIATION: isVietnamese ? 'Phát âm' : 'Pronunciation',
    READ_ALOUD: isVietnamese ? 'Đọc to' : 'Read Aloud',
    SHADOWING: isVietnamese ? 'Bắt chước' : 'Shadowing',
    SHORT_DIALOGUE: isVietnamese ? 'Hội thoại' : 'Dialogue',
    ANSWER_QUESTION: isVietnamese ? 'Trả lời câu hỏi' : 'Q&A',
    OPINION_RESPONSE: isVietnamese ? 'Quan điểm' : 'Opinion',
  }

  const practiceEff = userSpeakingProfile?.practice_efficiency
  const modesLens = userSpeakingProfile?.speaking_modes_lens
  const remedialRecs = userSpeakingProfile?.remedial_recommendations || []

  return (
    <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Mic className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-[24px] font-bold text-text-primary">
                {isVietnamese ? 'Luyện nói' : 'Speaking Practice'}
              </h1>
              <p className="text-[14px] text-text-secondary">
                {isVietnamese ? 'Luyện nói với AI và nhận phản hồi chi tiết' : 'Practice speaking with AI and get detailed feedback'}
              </p>
            </div>
          </div>
          <Button
            size="lg"
            className="gap-2 bg-primary hover:bg-primary-hover"
            onClick={onViewAll}
          >
            <Play size={20} />
            {isVietnamese ? 'Bắt đầu' : 'Start'}
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={<Mic className="h-5 w-5 text-primary" />}
          label={isVietnamese ? 'Tổng lần luyện' : 'Total practices'}
          value={stats.total_attempts.toString()}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
          label={isVietnamese ? 'Điểm trung bình' : 'Average score'}
          value={stats.average_score.toFixed(1)}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          label={isVietnamese ? 'Tổng phút luyện' : 'Total minutes'}
          value={stats.total_practice_minutes.toString()}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-red-500" />}
          label={isVietnamese ? 'Cần cải thiện nhất' : 'Weakest area'}
          value={
            !progress.weakest_area || progress.weakest_area === 'None' || stats.total_attempts === 0
              ? (isVietnamese ? 'Chưa có' : 'None')
              : isVietnamese
                ? ({ Pronunciation: 'Phát âm', Fluency: 'Lưu loát', Grammar: 'Ngữ pháp', Vocabulary: 'Từ vựng' } as Record<string, string>)[progress.weakest_area] || progress.weakest_area
                : progress.weakest_area
          }
          small
        />
      </div>

      <Card className="mb-6 dashboard-card">
        <CardContent className="p-4">
          <h2 className="mb-4 text-[16px] font-semibold text-text-primary">
            {isVietnamese ? 'Tiến trình học tập' : 'Learning progress'}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <ProgressItem label={isVietnamese ? 'Phát âm' : 'Pronunciation'} value={progress.pronunciation} />
            <ProgressItem label={isVietnamese ? 'Fluency' : 'Fluency'} value={progress.fluency} />
            <ProgressItem label={isVietnamese ? 'Ngữ pháp' : 'Grammar'} value={progress.grammar} />
            <ProgressItem label={isVietnamese ? 'Từ vựng' : 'Vocabulary'} value={progress.vocabulary} />
          </div>
        </CardContent>
      </Card>

      {/* 4 Cải tiến Dashboard: Controlled vs Spontaneous Lens & Practice Efficiency Showcase */}
      {(modesLens || practiceEff) && (
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Lens Card */}
          {modesLens && (modesLens.controlled_attempts > 0 || modesLens.spontaneous_attempts > 0) && (
            <Card className="dashboard-card border border-border">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-indigo-500" />
                    <h2 className="text-[16px] font-semibold text-text-primary">
                      {isVietnamese ? 'Lăng kính Năng lực Nói' : 'Speaking Performance Lens'}
                    </h2>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                    {isVietnamese ? 'Phân tích Sư phạm' : 'Pedagogical Lens'}
                  </span>
                </div>

                <p className="mb-4 text-[12px] text-text-secondary">
                  {isVietnamese
                    ? 'So sánh giữa khả năng nói có cấu trúc sẵn (Controlled) và tự phản xạ diễn đạt ý tưởng (Spontaneous).'
                    : 'Comparison between guided speaking (Controlled) and spontaneous expression.'}
                </p>

                <div className="space-y-4">
                  {/* Controlled Mode */}
                  <div>
                    <div className="mb-1 flex items-center justify-between text-[13px]">
                      <span className="font-medium text-text-primary">
                        {isVietnamese ? 'Nói có định hướng (Controlled)' : 'Controlled Speaking'}
                      </span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {modesLens.controlled_avg_score.toFixed(1)} / 100
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, modesLens.controlled_avg_score))}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-text-tertiary">
                      {isVietnamese
                        ? `Đọc to, Shadowing, Hội thoại mẫu (${modesLens.controlled_attempts} lượt)`
                        : `Read Aloud, Shadowing (${modesLens.controlled_attempts} takes)`}
                    </p>
                  </div>

                  {/* Spontaneous Mode */}
                  <div>
                    <div className="mb-1 flex items-center justify-between text-[13px]">
                      <span className="font-medium text-text-primary">
                        {isVietnamese ? 'Nói phản xạ tự do (Spontaneous)' : 'Spontaneous Speaking'}
                      </span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {modesLens.spontaneous_avg_score.toFixed(1)} / 100
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, modesLens.spontaneous_avg_score))}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-text-tertiary">
                      {isVietnamese
                        ? `Miêu tả tranh, Trả lời câu hỏi, Tranh luận (${modesLens.spontaneous_attempts} lượt)`
                        : `Picture Description, Q&A, Opinion (${modesLens.spontaneous_attempts} takes)`}
                    </p>
                  </div>

                  {/* Pedagogical AI Interpretation */}
                  {modesLens.pedagogical_interpretation_vi && (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-[12px] text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:text-indigo-200">
                      <div className="mb-1 flex items-center gap-1.5 font-medium text-indigo-700 dark:text-indigo-300">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{isVietnamese ? 'Nhận định tổng quan' : 'Pedagogical Insight'}</span>
                      </div>
                      <p className="leading-relaxed">
                        {modesLens.pedagogical_interpretation_vi}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Practice Efficiency & Best Audio Showcase Card */}
          <Card className="dashboard-card border border-border">
            <CardContent className="flex flex-col justify-between p-4">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                    <h2 className="text-[16px] font-semibold text-text-primary">
                      {isVietnamese ? 'Hiệu quả Rút kinh nghiệm & Tiêu biểu' : 'Practice Gain & Showcase'}
                    </h2>
                  </div>
                  {practiceEff && practiceEff.score_gain_avg > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      <ArrowUpRight className="h-3 w-3" />
                      +{practiceEff.score_gain_avg.toFixed(1)} {isVietnamese ? 'điểm TB' : 'gain'}
                    </span>
                  )}
                </div>

                <p className="mb-4 text-[12px] text-text-secondary">
                  {isVietnamese
                    ? 'Mức tiến bộ giữa lần thu đầu tiên (First-take) so với lần thu tốt nhất (Best-take).'
                    : 'Improvement delta from first baseline take to best attempt.'}
                </p>

                {practiceEff && practiceEff.total_exercises_attempted > 0 ? (
                  <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-surface-subtle p-3 text-center">
                    <div>
                      <p className="text-[11px] text-text-tertiary">
                        {isVietnamese ? 'Lần đầu (First)' : 'First take'}
                      </p>
                      <p className="text-[15px] font-bold text-text-primary">
                        {practiceEff.first_take_avg_score.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-text-tertiary">
                        {isVietnamese ? 'Tốt nhất (Best)' : 'Best take'}
                      </p>
                      <p className="text-[15px] font-bold text-emerald-600 dark:text-emerald-400">
                        {practiceEff.best_take_avg_score.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-text-tertiary">
                        {isVietnamese ? 'Số lần thử lại' : 'Retries'}
                      </p>
                      <p className="text-[15px] font-bold text-primary">
                        {practiceEff.total_retries_count}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 rounded-xl bg-surface-subtle p-3 text-center text-[12px] text-text-tertiary">
                    {isVietnamese ? 'Chưa có đủ dữ liệu thử lại.' : 'Not enough retry data yet.'}
                  </div>
                )}
              </div>

              {/* Showcase Voice Audio Player */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-[12px] font-semibold text-text-primary">
                      {isVietnamese ? 'Bản ghi Xuất sắc nhất (Showcase)' : 'Best Voice Showcase'}
                    </span>
                  </div>
                  {userSpeakingProfile?.best_sample_score !== undefined && (
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[11px] font-bold text-primary">
                      {userSpeakingProfile.best_sample_score.toFixed(1)} pts
                    </span>
                  )}
                </div>

                {userSpeakingProfile?.best_sample_audio_url ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium text-text-primary">
                        {userSpeakingProfile.best_sample_exercise_title || (isVietnamese ? 'Mẫu bài tập tiêu biểu' : 'Showcase sample')}
                      </p>
                      <p className="text-[10px] text-text-tertiary">
                        {isVietnamese ? 'Được lưu trữ vĩnh viễn phục vụ nghiên cứu & đối chiếu' : 'Preserved permanently for research corpus'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => handleToggleShowcaseAudio(userSpeakingProfile.best_sample_audio_url!)}
                    >
                      {isPlayingShowcase ? <Pause size={14} /> : <Volume2 size={14} />}
                      <span className="text-[12px]">
                        {isPlayingShowcase ? (isVietnamese ? 'Dừng' : 'Pause') : (isVietnamese ? 'Nghe giọng mẫu' : 'Listen')}
                      </span>
                    </Button>
                  </div>
                ) : (
                  <p className="text-[11px] text-text-secondary">
                    {isVietnamese
                      ? 'Hoàn thành thêm các bài tập để lưu giữ bản ghi âm giọng nói tốt nhất của bạn.'
                      : 'Complete exercises to establish your best speaking sample.'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Remedial Recommendations Card */}
      {remedialRecs.length > 0 && (
        <Card className="mb-6 dashboard-card border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-[16px] font-semibold text-text-primary">
                  {isVietnamese ? 'Hành động Khắc phục Ưu tiên' : 'Priority Remedial Practice'}
                </h2>
              </div>
              <span className="text-[12px] text-amber-700 dark:text-amber-300">
                {isVietnamese ? `${remedialRecs.length} đề xuất trọng tâm` : `${remedialRecs.length} recommendations`}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {remedialRecs.map((rec, index) => {
                const targetEx = exercises.find((e) => e.exercise_type === rec.exercise_type)
                return (
                  <div
                    key={index}
                    className="flex flex-col justify-between rounded-xl border border-amber-200/50 bg-surface p-3 shadow-xs dark:border-amber-900/30"
                  >
                    <div>
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                          {rec.target_domain}
                        </span>
                        <h3 className="text-[13px] font-semibold text-text-primary">
                          {rec.title}
                        </h3>
                      </div>
                      <p className="mb-3 text-[12px] text-text-secondary">
                        {rec.reason_vi}
                      </p>
                    </div>

                    <div className="flex items-center justify-end">
                      <Button
                        size="sm"
                        className="gap-1.5 bg-amber-600 text-white hover:bg-amber-700"
                        onClick={() => {
                          if (targetEx) {
                            onStartPractice(targetEx)
                          } else {
                            onViewAll()
                          }
                        }}
                      >
                        <Play size={13} />
                        <span className="text-[11px]">
                          {isVietnamese ? 'Khắc phục ngay' : 'Practice now'}
                        </span>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {recommendedExercise && (
        <Card className="mb-6 dashboard-card border-primary/20">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                {isVietnamese ? 'Gợi ý' : 'Recommended'}
              </span>
            </div>
            <h3 className="mb-1 text-[16px] font-semibold text-text-primary">
              {recommendedExercise.title}
            </h3>
            <p className="mb-3 text-[13px] text-text-secondary">
              {recommendedExercise.title_vi} - {typeLabels[recommendedExercise.exercise_type]}
            </p>
            <Button
              className="w-full gap-2 bg-primary hover:bg-primary-hover"
              onClick={() => onStartPractice(recommendedExercise)}
            >
              <Play size={16} />
              {isVietnamese ? 'Luyện ngay' : 'Practice now'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="dashboard-card">
        <CardContent className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-text-primary">
              {isVietnamese ? 'Lần luyện gần nhất' : 'Recent attempts'}
            </h2>
            <button
              onClick={onViewHistory}
              className="flex items-center gap-1 text-[13px] text-primary hover:underline"
            >
              {isVietnamese ? 'Xem tất cả' : 'View all'}
              <ChevronRight size={16} />
            </button>
          </div>

          {recentAttempts.length === 0 ? (
            <div className="py-8 text-center">
              <Mic className="mx-auto mb-3 h-10 w-10 text-text-tertiary" />
              <p className="text-[14px] text-text-secondary">
                {isVietnamese ? 'Chưa có lần luyện nào. Bắt đầu ngay!' : 'No attempts yet. Start now!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAttempts.slice(0, 3).map((attempt) => {
                const exercise = exercises.find(e => e.id === attempt.exercise_id)
                return (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-text-primary">
                        {exercise?.title}
                      </p>
                      <p className="text-[12px] text-text-secondary">
                        {exercise?.title_vi}
                      </p>
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[12px] font-semibold text-emerald-700">
                        {attempt.overall_score?.toFixed(1)}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => onStartPractice(exercise!)}
                      >
                        <Play size={14} />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

function StatCard({ icon, label, value, small }: {
  icon: React.ReactNode
  label: string
  value: string
  small?: boolean
}) {
  return (
    <Card className="dashboard-card">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-subtle">
          {icon}
        </div>
        <div>
          <p className={`${small ? 'text-[11px]' : 'text-[12px]'} text-text-secondary`}>
            {label}
          </p>
          <p className="text-[18px] font-bold text-text-primary">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ProgressItem({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[12px] text-text-secondary">{label}</span>
        <span className="text-[12px] font-medium text-text-primary">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
