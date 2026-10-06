/**
 * @file speaking.home.tsx
 * @description Component giao diện React SpeakingHome cho học viên
 */

import { useTranslation } from 'react-i18next'
import { Mic, TrendingUp, Clock, ChevronRight, Play } from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import type { SpeakingStats, SpeakingProgress, SpeakingAttempt, SpeakingExercise } from '@/features/practice/types/speaking'

interface SpeakingHomeProps {
  stats: SpeakingStats
  progress: SpeakingProgress
  recentAttempts: SpeakingAttempt[]
  exercises: SpeakingExercise[]
  onStartPractice: (exercise: SpeakingExercise) => void
  onViewAll: () => void
  onViewHistory: () => void
}

export function SpeakingHome({
  stats,
  progress,
  recentAttempts,
  exercises,
  onStartPractice,
  onViewAll,
  onViewHistory,
}: SpeakingHomeProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

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
  }

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
          label={isVietnamese ? 'Điểm yếu nhất' : 'Weakest area'}
          value={progress.weakest_area}
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
