/**
 * @file writing.stats.cards.tsx
 * @description Thành phần hiển thị các thẻ thống kê bài viết, kỹ năng theo dõi và chủ đề đề xuất cho học viên
 */

'use client'

import { Trophy, BookOpen, TrendingUp, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { WritingStats, WritingProgress } from '@/types/writing'

interface WritingStatsCardsProps {
  stats: WritingStats
  progress: WritingProgress
  isVietnamese: boolean
}

export function WritingStatsCards({
  stats,
  progress,
  isVietnamese,
}: WritingStatsCardsProps) {
  return (
    <section className="mb-6">
      <h2 className="mb-4 text-[16px] font-semibold text-text-primary">
        {isVietnamese ? 'Tiến độ viết' : 'Writing Progress'}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <Trophy className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[24px] font-bold text-text-primary">
                  {stats.average_score.toFixed(1)}
                </p>
                <p className="text-[12px] text-text-secondary">
                  {isVietnamese ? 'Điểm trung bình' : 'Average Score'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[24px] font-bold text-text-primary">
                  {stats.total_submissions}
                </p>
                <p className="text-[12px] text-text-secondary">
                  {isVietnamese ? 'Bài đã nộp' : 'Submissions'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-[24px] font-bold text-text-primary">
                  {stats.total_words_written.toLocaleString()}
                </p>
                <p className="text-[12px] text-text-secondary">
                  {isVietnamese ? 'Từ đã viết' : 'Words Written'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <Target className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-[24px] font-bold text-text-primary">
                  {stats.average_grammar_accuracy}%
                </p>
                <p className="text-[12px] text-text-secondary">
                  {isVietnamese ? 'Độ chính xác' : 'Accuracy'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 dashboard-card">
        <CardContent className="p-4">
          <h3 className="mb-4 text-[14px] font-medium text-text-primary">
            {isVietnamese ? 'Kỹ năng theo dõi' : 'Skills Tracking'}
          </h3>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-[13px]">
                <span className="text-text-secondary">Grammar</span>
                <span className="font-medium text-text-primary">
                  {progress.grammar}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${progress.grammar}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-[13px]">
                <span className="text-text-secondary">Vocabulary</span>
                <span className="font-medium text-text-primary">
                  {progress.vocabulary}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${progress.vocabulary}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-[13px]">
                <span className="text-text-secondary">Coherence</span>
                <span className="font-medium text-text-primary">
                  {progress.coherence}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
                <div
                  className="h-full rounded-full bg-purple-500 transition-all"
                  style={{ width: `${progress.coherence}%` }}
                />
              </div>
            </div>
          </div>

          {progress.weakest_area && (
            <div className="mt-4 rounded-lg bg-amber-50 p-3">
              <p className="text-[13px] text-amber-800">
                <span className="font-medium">
                  {isVietnamese ? 'Điểm yếu nhất' : 'Weakest Area'}:
                </span>{' '}
                {progress.weakest_area}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {progress.recommended_topics.length > 0 && (
        <Card className="mt-4 dashboard-card border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <h3 className="mb-2 text-[14px] font-semibold text-text-primary flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {isVietnamese ? 'Đề xuất cho bạn' : 'Recommended for You'}
            </h3>
            <p className="mb-3 text-[13px] text-text-secondary">
              {isVietnamese
                ? 'Luyện tập thêm các chủ đề để cải thiện điểm yếu của bạn:'
                : 'Practice more topics to improve your weaknesses:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {progress.recommended_topics.map((topic, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-[13px] text-text-primary"
                >
                  {topic}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
