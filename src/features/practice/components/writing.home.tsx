/**
 * @file writing.home.tsx
 * @description Trang chủ Luyện viết tiếng Anh tổng hợp tiến độ, bài làm dở, thống kê và bài tập nộp gần đây
 */

"use client";

import { useTranslation } from "react-i18next";
import { Pencil } from "lucide-react";
import { Button } from "@/components/button";
import type {
  WritingStats,
  WritingProgress,
  ContinueWriting,
  WritingSubmission,
  WritingExercise,
} from "@/features/practice/types/writing";
import { WritingInProgressBanner } from "@/features/practice/components/writing.in.progress.banner";
import { WritingStatsCards } from "@/features/practice/components/writing.stats.cards";
import { WritingRecentSubmissions } from "@/features/practice/components/writing.recent.submissions";

interface WritingHomeProps {
  stats: WritingStats;
  progress: WritingProgress;
  continueWriting: ContinueWriting | null;
  recentSubmissions: WritingSubmission[];
  exercises: WritingExercise[];
  onStartNew: () => void;
  onContinue: (submissionId: string) => void;
  onSelectExercise: (exerciseId: string) => void;
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
  onSelectExercise,
  onViewSubmission,
  onViewHistory,
}: WritingHomeProps) {
  const { i18n } = useTranslation();
  const isVietnamese = i18n.language === "vi";

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
                {isVietnamese ? "Luyện viết" : "Writing Practice"}
              </h1>
              <p className="text-[14px] text-text-secondary">
                {isVietnamese
                  ? "Cải thiện kỹ năng viết tiếng Anh qua các bài tập và phản hồi AI."
                  : "Improve your English writing through guided exercises and AI feedback."}
              </p>
            </div>
          </div>

          <Button
            size="lg"
            className="gap-2 bg-primary hover:bg-primary-hover cursor-pointer"
            onClick={onStartNew}
          >
            <Pencil size={20} />
            {isVietnamese ? "Bắt đầu bài mới" : "Start New"}
          </Button>
        </div>
      </div>

      {continueWriting && (
        <WritingInProgressBanner
          continueWriting={continueWriting}
          isVietnamese={isVietnamese}
          onContinue={onContinue}
        />
      )}

      <WritingStatsCards
        stats={stats}
        progress={progress}
        isVietnamese={isVietnamese}
        onSelectExercise={onSelectExercise}
      />

      {!!stats.score_groups?.length && (
        <section className="my-6 overflow-x-auto rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 font-semibold">
            {isVietnamese
              ? "Điểm theo chuẩn chấm và dạng bài"
              : "Scores by standard and task"}
          </h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="p-2">
                  {isVietnamese ? "Chuẩn / Dạng" : "Standard / Task"}
                </th>
                <th className="p-2">{isVietnamese ? "Số bài" : "Responses"}</th>
                <th className="p-2">
                  {isVietnamese ? "Điểm trung bình" : "Average"}
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.score_groups.map((group) => (
                <tr
                  key={`${group._id.standard}-${group._id.type}-${group._id.version}`}
                  className="border-t border-border"
                >
                  <td className="p-2">
                    {group._id.standard === "TOEIC"
                      ? "TOEIC"
                      : isVietnamese
                      ? "Thực tế"
                      : "Practical"}{" "}
                    · {group._id.type}
                    {group._id.version === "legacy"
                      ? isVietnamese
                        ? " · Bộ chấm cũ"
                        : " · Legacy"
                      : ""}
                  </td>
                  <td className="p-2">{group.count}</td>
                  <td className="p-2">
                    {Number(group.average).toFixed(1)}/{group._id.max_score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {recentSubmissions.length > 0 && (
        <WritingRecentSubmissions
          recentSubmissions={recentSubmissions}
          exercises={exercises}
          isVietnamese={isVietnamese}
          onViewSubmission={onViewSubmission}
          onViewHistory={onViewHistory}
        />
      )}
    </main>
  );
}
