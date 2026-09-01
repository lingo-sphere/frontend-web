/**
 * @file WritingHome.tsx
 * @description Component giao diện React WritingHome cho học viên
 */

import { useTranslation } from 'react-i18next'
import {
  Pencil,
  Clock,
  Target,
  Trophy,
  BookOpen,
  TrendingUp,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type {
  WritingStats,
  WritingProgress,
  ContinueWriting,
  WritingSubmission,
  WritingExercise,
} from "@/types/writing";

interface WritingHomeProps {
  stats: WritingStats;
  progress: WritingProgress;
  continueWriting: ContinueWriting | null;
  recentSubmissions: WritingSubmission[];
  exercises: WritingExercise[];
  onStartNew: () => void;
  onContinue: (submissionId: string) => void;
  onViewSubmission: (submission: WritingSubmission) => void;
  onViewHistory: () => void;
}

export function WritingHome({
  stats,
  progress,
  continueWriting,
  recentSubmissions,
  exercises,
  onStartNew,
  onContinue,
  onViewSubmission,
  onViewHistory,
}: WritingHomeProps) {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const getExercise = (exerciseId: string) => {
    return exercises.find((ex) => ex.id === exerciseId);
  };

  return (
    <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Pencil className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-[24px] font-bold text-text-primary">
                {isVietnamese ? 'Luyện viết' : 'Writing Practice'}
              </h1>
              <p className="text-[14px] text-text-secondary">
                {isVietnamese ? 'Cải thiện kỹ năng viết tiếng Anh qua các bài tập và phản hồi AI.' : 'Improve your English writing through guided exercises and AI feedback.'}
              </p>
            </div>
          </div>

          <Button
            size="lg"
            className="gap-2 bg-primary hover:bg-primary-hover"
            onClick={onStartNew}
          >
            <Pencil size={20} />
            {isVietnamese ? 'Bắt đầu bài mới' : 'Start New'}
          </Button>
        </div>
      </div>

      {continueWriting && (
        <section className="mb-6">
          <Card className="dashboard-card border-amber-200 bg-amber-50/50">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                      📝 {isVietnamese ? 'Đang làm dở' : 'In Progress'}
                    </span>
                    <span className="text-[12px] text-text-tertiary">
                      {continueWriting.exercise_type.replace("_", " ")} • {continueWriting.writing_level}
                    </span>
                  </div>
                  <h3 className="text-[16px] font-semibold text-text-primary">
                    {continueWriting.exercise_title}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-[13px] text-text-secondary">
                    <span className="flex items-center gap-1">
                      <TrendingUp size={14} />
                      {isVietnamese ? 'Tiến độ' : 'Progress'}: {continueWriting.progress_percent}%
                    </span>
                    <span>{continueWriting.word_count} {isVietnamese ? 'từ' : 'words'}</span>
                    <span className="text-text-tertiary">
                      {isVietnamese ? 'Lưu' : 'Saved'}: {formatTimeAgo(continueWriting.last_saved_at, isVietnamese)}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-[13px] italic text-text-secondary">
                    "{continueWriting.content}"
                  </p>
                </div>
                <Button
                  size="lg"
                  className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => onContinue(continueWriting.submission_id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  {isVietnamese ? 'Tiếp tục làm bài' : 'Continue'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

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
                  <p className="text-[12px] text-text-secondary">{isVietnamese ? 'Bài đã nộp' : 'Submissions'}</p>
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
                  <p className="text-[12px] text-text-secondary">{isVietnamese ? 'Từ đã viết' : 'Words Written'}</p>
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
                  <span className="font-medium">{isVietnamese ? 'Điểm yếu nhất' : 'Weakest Area'}:</span>{" "}
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
                {isVietnamese ? 'Luyện tập thêm các chủ đề để cải thiện điểm yếu của bạn:' : 'Practice more topics to improve your weaknesses:'}
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

      {recentSubmissions.length > 0 && (
        <section className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-text-primary">
              {isVietnamese ? 'Bài đã nộp gần đây' : 'Recent Submissions'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={onViewHistory}
            >
              {isVietnamese ? 'Xem tất cả' : 'View All'}
              <ChevronRight size={16} />
            </Button>
          </div>
          <div className="space-y-3">
            {recentSubmissions.slice(0, 3).map((submission) => {
              const exercise = getExercise(submission.exercise_id);
              return (
                <Card
                  key={submission.id}
                  className="dashboard-card cursor-pointer transition-all hover:shadow-md"
                  onClick={() => onViewSubmission(submission)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-medium text-text-primary">
                          {exercise?.title || submission.exercise_id}
                        </p>
                        {exercise?.cefr_level && (
                          <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                            {exercise.cefr_level}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[12px] text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {submission.submitted_at &&
                            formatTimeAgo(submission.submitted_at, isVietnamese)}
                        </span>
                        <span>{submission.word_count} {isVietnamese ? 'từ' : 'words'}</span>
                      </div>
                    </div>
                    {submission.overall_score !== undefined ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[16px] font-bold text-primary">
                          {submission.overall_score.toFixed(1)}
                        </span>
                        <span className="text-[12px] text-text-tertiary">
                          /10
                        </span>
                      </div>
                    ) : submission.is_correct !== undefined ? (
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          submission.is_correct
                            ? "bg-emerald-100"
                            : "bg-red-100"
                        }`}
                      >
                        <span
                          className={`text-[14px] font-bold ${
                            submission.is_correct
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {submission.is_correct ? "✓" : "✗"}
                        </span>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

function formatTimeAgo(dateString: string, isVietnamese: boolean): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return isVietnamese ? "Vừa xong" : "Just now";
  if (diffMins < 60) return isVietnamese ? `${diffMins} phút trước` : `${diffMins} min ago`;
  if (diffHours < 24) return isVietnamese ? `${diffHours} giờ trước` : `${diffHours} hours ago`;
  if (diffDays < 7) return isVietnamese ? `${diffDays} ngày trước` : `${diffDays} days ago`;
  return date.toLocaleDateString(isVietnamese ? "vi-VN" : "en-US");
}
