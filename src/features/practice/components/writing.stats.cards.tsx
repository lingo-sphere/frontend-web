/**
 * @file writing.stats.cards.tsx
 * @description Thành phần hiển thị các thẻ thống kê bài viết, kỹ năng theo dõi và đề xuất cho học viên
 */

"use client";

import {
  Trophy,
  BookOpen,
  TrendingUp,
  Target,
  Clock,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/card";
import type {
  WritingStats,
  WritingProgress,
  WritingRecommendation,
  WritingSkillType,
} from "@/features/practice/types/writing";

interface WritingStatsCardsProps {
  stats: WritingStats;
  progress: WritingProgress;
  isVietnamese: boolean;
  onSelectExercise?: (exerciseId: string) => void;
}

// Percent values must be in [0, 100] for the UI; clamp to defend against bad data.
const clampPercent = (n: number) =>
  Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;

// Skill display names
const SKILL_DISPLAY: Record<string, { vi: string; en: string }> = {
  task_achievement: { vi: "Hoàn thành nhiệm vụ", en: "Task Achievement" },
  coherence: { vi: "Mạch lạc & Liên kết", en: "Coherence" },
  lexical_resource: { vi: "Từ vựng", en: "Vocabulary" },
  grammatical_accuracy: { vi: "Ngữ pháp", en: "Grammar" },
  naturalness: { vi: "Tự nhiên", en: "Naturalness" },
  register: { vi: "Phong cách", en: "Register" },
};

// Reason display names
const REASON_DISPLAY: Record<
  string,
  { vi: string; en: string; color: string }
> = {
  weakest_skill: {
    vi: "Luyện điểm yếu",
    en: "Weak Skill",
    color: "bg-red-100 text-red-700",
  },
  weakest_context: {
    vi: "Cải thiện ngữ cảnh",
    en: "Weak Context",
    color: "bg-orange-100 text-orange-700",
  },
  same_skill_context: {
    vi: "Rèn luyện chuyên sâu",
    en: "Deep Practice",
    color: "bg-red-100 text-red-700",
  },
  diversify_skill: {
    vi: "Đa dạng kỹ năng",
    en: "Skill Diversity",
    color: "bg-blue-100 text-blue-700",
  },
  diversify_context: {
    vi: "Mở rộng ngữ cảnh",
    en: "New Context",
    color: "bg-green-100 text-green-700",
  },
  skill_improvement: {
    vi: "Nâng cao kỹ năng",
    en: "Improve",
    color: "bg-purple-100 text-purple-700",
  },
  new_user: {
    vi: "Bắt đầu luyện tập",
    en: "Get Started",
    color: "bg-primary/10 text-primary",
  },
};

// Exercise type display names
const EXERCISE_TYPE_DISPLAY: Record<string, { vi: string; en: string }> = {
  DESCRIBE_PICTURE: { vi: "Mô tả tranh", en: "Describe Picture" },
  WRITE_EMAIL: { vi: "Viết email", en: "Write Email" },
  EXPRESS_OPINION: { vi: "Trình bày ý kiến", en: "Express Opinion" },
  SENTENCE_ARRANGEMENT: { vi: "Sắp xếp câu", en: "Arrange Sentences" },
  SENTENCE_COMPLETION: { vi: "Hoàn thành câu", en: "Complete Sentence" },
  PARAPHRASING: { vi: "Viết lại câu", en: "Paraphrasing" },
  KEYWORD_WRITING: { vi: "Viết từ khóa", en: "Keyword Writing" },
  TOPIC_WRITING: { vi: "Viết theo chủ đề", en: "Topic Writing" },
  DIARY: { vi: "Nhật ký", en: "Diary" },
  WORD_REORDERING: { vi: "Sắp xếp từ", en: "Word Reordering" },
  SENTENCE_REWRITING: { vi: "Viết lại câu", en: "Rewrite Sentence" },
  PARAGRAPH_WRITING: { vi: "Viết đoạn văn", en: "Paragraph Writing" },
  GUIDED_WRITING: { vi: "Viết có hướng dẫn", en: "Guided Writing" },
};

export function WritingStatsCards({
  stats,
  progress,
  isVietnamese,
  onSelectExercise,
}: WritingStatsCardsProps) {
  return (
    <section className="mb-6">
      <h2 className="mb-4 text-[16px] font-semibold text-text-primary">
        {isVietnamese ? "Tiến độ viết" : "Writing Progress"}
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
                  {clampPercent(stats.average_score).toFixed(1)}
                  <span className="ml-0.5 text-[14px] font-medium text-text-tertiary">
                    /100
                  </span>
                </p>
                <p className="text-[12px] text-text-secondary">
                  {isVietnamese ? "Điểm trung bình" : "Average Score"}
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
                  {isVietnamese ? "Bài đã nộp" : "Submissions"}
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
                  {isVietnamese ? "Từ đã viết" : "Words Written"}
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
                  {clampPercent(stats.average_grammar_accuracy)}%
                </p>
                <p className="text-[12px] text-text-secondary">
                  {isVietnamese ? "Độ chính xác" : "Accuracy"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 dashboard-card">
        <CardContent className="p-4">
          <h3 className="mb-4 text-[14px] font-medium text-text-primary">
            {isVietnamese ? "Kỹ năng theo dõi" : "Skills Tracking"}
          </h3>
          <div className="space-y-3">
            {/* Skill bars */}
            {(
              [
                "task_achievement",
                "grammatical_accuracy",
                "lexical_resource",
                "coherence",
                "naturalness",
                "register",
              ] as WritingSkillType[]
            ).map((skill) => {
              const score =
                skill === "task_achievement"
                  ? stats.score_breakdown.task_achievement
                  : skill === "grammatical_accuracy"
                  ? stats.score_breakdown.grammar
                  : skill === "lexical_resource"
                  ? stats.score_breakdown.vocabulary
                  : skill === "coherence"
                  ? stats.score_breakdown.coherence
                  : skill === "naturalness"
                  ? stats.score_breakdown.naturalness
                  : stats.score_breakdown.register;

              const isWeakest = progress.weakest_area === skill;
              const colorClass = isWeakest ? "bg-red-500" : "bg-emerald-500";

              return (
                <div key={skill}>
                  <div className="mb-1 flex justify-between text-[13px]">
                    <span
                      className={`${
                        isWeakest
                          ? "text-red-600 font-medium"
                          : "text-text-secondary"
                      }`}
                    >
                      {isVietnamese
                        ? SKILL_DISPLAY[skill].vi
                        : SKILL_DISPLAY[skill].en}
                      {isWeakest && (
                        <span className="ml-1 text-[10px]">👎</span>
                      )}
                    </span>
                    <span
                      className={`font-medium ${
                        isWeakest ? "text-red-600" : "text-text-primary"
                      }`}
                    >
                      {clampPercent(score)}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
                    <div
                      className={`h-full rounded-full ${colorClass} transition-all`}
                      style={{ width: `${clampPercent(score)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {progress.weakest_area && (
            <div className="mt-4 rounded-lg bg-amber-50 p-3">
              <p className="text-[13px] text-amber-800">
                <span className="font-medium">
                  {isVietnamese ? "Điểm yếu nhất" : "Weakest Area"}:
                </span>{" "}
                {isVietnamese
                  ? SKILL_DISPLAY[progress.weakest_area]?.vi
                  : SKILL_DISPLAY[progress.weakest_area]?.en}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations Section */}
      {progress.recommendations && progress.recommendations.length > 0 && (
        <Card className="mt-4 dashboard-card border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <h3 className="mb-3 text-[14px] font-semibold text-text-primary flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {isVietnamese ? "Đề xuất cho bạn" : "Recommended for You"}
            </h3>
            <p className="mb-3 text-[13px] text-text-secondary">
              {isVietnamese
                ? `Luyện tập thêm để cải thiện kỹ năng "${
                    isVietnamese
                      ? SKILL_DISPLAY[progress.weakest_area]?.vi
                      : SKILL_DISPLAY[progress.weakest_area]?.en
                  }"`
                : `Practice more to improve "${
                    SKILL_DISPLAY[progress.weakest_area]?.en
                  }"`}
            </p>
            <div className="space-y-2">
              {progress.recommendations.map((rec, index) => (
                <RecommendationCard
                  key={rec.exercise_id}
                  recommendation={rec}
                  isVietnamese={isVietnamese}
                  onClick={() => onSelectExercise?.(rec.exercise_id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state for no recommendations */}
      {(!progress.recommendations || progress.recommendations.length === 0) && (
        <Card className="mt-4 dashboard-card border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <Target className="h-10 w-10 text-primary/40 mb-2" />
              <h3 className="text-[14px] font-medium text-text-primary">
                {isVietnamese ? "Bắt đầu luyện tập ngay!" : "Start Practicing!"}
              </h3>
              <p className="mt-1 text-[13px] text-text-secondary">
                {isVietnamese
                  ? "Hoàn thành bài viết đầu tiên để nhận gợi ý phù hợp"
                  : "Complete your first writing to get personalized suggestions"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

// Recommendation Card Component
interface RecommendationCardProps {
  recommendation: WritingRecommendation;
  isVietnamese: boolean;
  onClick?: () => void;
}

function RecommendationCard({
  recommendation,
  isVietnamese,
  onClick,
}: RecommendationCardProps) {
  const reason =
    REASON_DISPLAY[recommendation.reason] ||
    REASON_DISPLAY["skill_improvement"];
  const typeLabel = EXERCISE_TYPE_DISPLAY[recommendation.exercise_type] || {
    vi: recommendation.exercise_type,
    en: recommendation.exercise_type,
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border border-border bg-surface p-3 transition-all hover:border-primary hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-[14px] font-medium text-text-primary truncate">
            {isVietnamese && recommendation.title_vi
              ? recommendation.title_vi
              : recommendation.title}
          </h4>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] text-text-secondary">
              <Clock className="h-3 w-3" />
              {isVietnamese ? typeLabel.vi : typeLabel.en}
            </span>
            {recommendation.cefr_level && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] text-text-secondary">
                {recommendation.cefr_level}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${reason.color}`}
          >
            {isVietnamese ? reason.vi : reason.en}
          </span>
          {recommendation.target_skill && (
            <span className="text-[10px] text-text-tertiary">
              {isVietnamese
                ? `Target: ${SKILL_DISPLAY[recommendation.target_skill]?.vi}`
                : `Target: ${SKILL_DISPLAY[recommendation.target_skill]?.en}`}
            </span>
          )}
        </div>
      </div>
      {recommendation.prompt_text && (
        <p className="mt-2 text-[12px] text-text-secondary line-clamp-2">
          {recommendation.prompt_text}
        </p>
      )}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-text-tertiary">
          {isVietnamese ? "Độ tin cậy" : "Confidence"}:{" "}
          {recommendation.confidence_score}%
        </span>
        <ArrowRight className="h-4 w-4 text-primary" />
      </div>
    </button>
  );
}
