// Updated: 2026-08-22
// Writing History page - Lịch sử các bài đã nộp
// Data synced with practice-service.dbml

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Calendar, Trophy, Clock, Filter, ChevronRight, RotateCcw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { WritingSubmission, WritingLevel, WritingExercise } from '@/types/writing'

interface WritingHistoryProps {
  submissions: WritingSubmission[]
  exercises: WritingExercise[]
  onBack: () => void
  onViewSubmission: (submission: WritingSubmission) => void
}

type SortOption = 'recent' | 'highest_score' | 'lowest_score'
type LevelFilter = 'all' | WritingLevel

export function WritingHistory({ submissions, exercises, onBack, onViewSubmission }: WritingHistoryProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all')
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null)

  const getExercise = (exerciseId: string) => {
    return exercises.find((ex) => ex.id === exerciseId)
  }

  const filteredSubmissions = submissions
    .filter((sub) => {
      if (levelFilter === 'all') return true
      const exercise = getExercise(sub.exercise_id)
      if (exercise && exercise.writing_level === levelFilter) return true
      return false
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.submitted_at || b.created_at).getTime() -
                 new Date(a.submitted_at || a.created_at).getTime()
        case 'highest_score':
          return (b.overall_score || 0) - (a.overall_score || 0)
        case 'lowest_score':
          return (a.overall_score || 0) - (b.overall_score || 0)
        default:
          return 0
      }
    })

  const toggleExpand = (submissionId: string) => {
    setExpandedSubmission(expandedSubmission === submissionId ? null : submissionId)
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-text-secondary'
    if (score >= 8) return 'text-emerald-600'
    if (score >= 6) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreBg = (score?: number) => {
    if (!score) return 'bg-surface-subtle'
    if (score >= 8) return 'bg-emerald-100'
    if (score >= 6) return 'bg-amber-100'
    return 'bg-red-100'
  }

  const sortOptions = [
    { value: 'recent', label: isVietnamese ? 'Gần nhất' : 'Recent' },
    { value: 'highest_score', label: isVietnamese ? 'Điểm cao' : 'Highest' },
    { value: 'lowest_score', label: isVietnamese ? 'Điểm thấp' : 'Lowest' },
  ]

  const levelOptions = [
    { value: 'all', label: isVietnamese ? 'Tất cả' : 'All' },
    { value: 'BASIC', label: isVietnamese ? 'Cơ bản' : 'Basic' },
    { value: 'INTERMEDIATE', label: isVietnamese ? 'Trung bình' : 'Intermediate' },
    { value: 'ADVANCED', label: isVietnamese ? 'Nâng cao' : 'Advanced' },
  ]

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-[14px] text-text-secondary hover:text-primary">
            <ArrowLeft size={18} />
            {isVietnamese ? 'Quay lại' : 'Back'}
          </button>
          <div className="h-6 w-px bg-border" />
          <h1 className="text-[24px] font-bold text-text-primary">
            {isVietnamese ? 'Lịch sử Writing' : 'Writing History'}
          </h1>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-text-secondary">{isVietnamese ? 'Sắp xếp:' : 'Sort:'}</span>
          <div className="flex rounded-lg border border-border bg-surface p-1">
            {sortOptions.map((option) => (
              <button key={option.value} onClick={() => setSortBy(option.value as SortOption)}
                className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  sortBy === option.value ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
                }`}>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[13px] text-text-secondary">{isVietnamese ? 'Cấp độ:' : 'Level:'}</span>
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value as LevelFilter)}
            className="h-9 rounded-lg border border-border bg-surface px-3 text-[12px] text-text-primary focus:border-primary focus:outline-none">
            {levelOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      <p className="mb-4 text-[13px] text-text-secondary">
        {filteredSubmissions.length} {isVietnamese ? 'bài đã nộp' : 'submissions'}
      </p>

      {filteredSubmissions.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[14px] text-text-secondary">
            {isVietnamese ? 'Chưa có bài nộp nào.' : 'No submissions yet.'}
          </p>
          <Button className="mt-4 bg-primary hover:bg-primary-hover" onClick={onBack}>
            {isVietnamese ? 'Bắt đầu luyện tập' : 'Start practicing'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => {
            const exercise = getExercise(submission.exercise_id)
            const isExpanded = expandedSubmission === submission.id

            return (
              <Card key={submission.id} className={`dashboard-card transition-all ${isExpanded ? 'ring-2 ring-primary' : 'hover:shadow-md cursor-pointer'}`}>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-4" onClick={() => toggleExpand(submission.id)}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-semibold text-text-primary">
                          {exercise?.title || submission.exercise_id}
                        </h3>
                        {exercise?.cefr_level && (
                          <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                            {exercise.cefr_level}
                          </span>
                        )}
                        <span className="text-[12px] text-text-tertiary">v{submission.version_number}</span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-[13px] text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(submission.submitted_at || submission.created_at, isVietnamese)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy size={14} />
                          {submission.word_count} {isVietnamese ? 'từ' : 'words'}
                        </span>
                        {submission.writing_time_seconds && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatTimeShort(submission.writing_time_seconds)}
                          </span>
                        )}
                        {submission.drafts && submission.drafts.length > 0 && (
                          <span className="flex items-center gap-1 text-primary">
                            📝 {submission.drafts.length + 1} {isVietnamese ? 'phiên bản' : 'versions'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex items-center gap-4">
                      {submission.overall_score !== undefined ? (
                        <div className={`flex h-12 w-12 flex-col items-center justify-center rounded-full ${getScoreBg(submission.overall_score)}`}>
                          <span className={`text-[18px] font-bold ${getScoreColor(submission.overall_score)}`}>
                            {submission.overall_score.toFixed(1)}
                          </span>
                        </div>
                      ) : submission.is_correct !== undefined ? (
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          submission.is_correct ? 'bg-emerald-100' : 'bg-red-100'
                        }`}>
                          <span className={`text-[20px] font-bold ${
                            submission.is_correct ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {submission.is_correct ? '✓' : '✗'}
                          </span>
                        </div>
                      ) : null}

                      <ChevronRight size={20} className={`text-text-tertiary transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border bg-surface-subtle/30">
                      <div className="p-4">
                        <h4 className="mb-2 text-[13px] font-medium text-text-secondary">
                          {isVietnamese ? 'Bài viết của bạn:' : 'Your writing:'}
                        </h4>
                        <div className="rounded-lg bg-surface p-3">
                          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-text-primary">
                            {submission.content}
                          </p>
                        </div>
                      </div>

                      {submission.drafts && submission.drafts.length > 0 && (
                        <div className="border-t border-border p-4">
                          <h4 className="mb-2 text-[13px] font-medium text-text-secondary">
                            {isVietnamese ? 'Lịch sử các phiên bản:' : 'Version history:'}
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-white">
                                v{submission.version_number}
                              </span>
                              <p className="line-clamp-2 text-[13px] italic text-text-primary">"{submission.content}"</p>
                            </div>
                            {submission.drafts.map((draft, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <span className="mt-0.5 rounded-full bg-surface-subtle px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                                  v{draft.version_number}
                                </span>
                                <p className="line-clamp-2 text-[13px] italic text-text-tertiary">"{draft.content}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {submission.overall_score !== undefined && (
                        <div className="border-t border-border p-4">
                          <h4 className="mb-3 text-[13px] font-medium text-text-secondary">
                            {isVietnamese ? 'Chi tiết điểm:' : 'Score breakdown:'}
                          </h4>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <ScoreItem label={isVietnamese ? 'Task' : 'Task'} score={submission.task_achievement_score} />
                            <ScoreItem label={isVietnamese ? 'Liên kết' : 'Coherence'} score={submission.coherence_score} />
                            <ScoreItem label={isVietnamese ? 'Từ vựng' : 'Vocabulary'} score={submission.lexical_resource_score} />
                            <ScoreItem label={isVietnamese ? 'Ngữ pháp' : 'Grammar'} score={submission.grammatical_accuracy_score} />
                          </div>
                        </div>
                      )}

                      <div className="border-t border-border p-4">
                        <div className="flex justify-end gap-3">
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onViewSubmission(submission) }}>
                            {isVietnamese ? 'Xem chi tiết' : 'View details'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </main>
  )
}

function formatDate(dateString: string, isVietnamese: boolean): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return isVietnamese ? 'Hôm nay' : 'Today'
  if (diffDays === 1) return isVietnamese ? 'Hôm qua' : 'Yesterday'
  if (diffDays < 7) return `${diffDays} ${isVietnamese ? 'ngày trước' : 'days ago'}`

  return date.toLocaleDateString(isVietnamese ? 'vi-VN' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

function formatTimeShort(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

interface ScoreItemProps {
  label: string
  score?: number
}

function ScoreItem({ label, score }: ScoreItemProps) {
  const getScoreColor = (s?: number) => {
    if (s === undefined) return 'text-text-secondary'
    if (s >= 8) return 'text-emerald-600'
    if (s >= 6) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <div className="rounded-lg bg-surface p-2 text-center">
      <p className="text-[11px] text-text-tertiary">{label}</p>
      <p className={`text-[16px] font-bold ${getScoreColor(score)}`}>
        {score !== undefined ? score.toFixed(1) : '-'}
      </p>
    </div>
  )
}
