import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/card";
import type { WritingSubmission } from "../types/writing";

const criteria = [
  [
    "task_achievement",
    "task_achievement_score",
    "Đáp ứng yêu cầu",
    "Task achievement",
  ],
  [
    "grammatical_accuracy",
    "grammatical_accuracy_score",
    "Ngữ pháp",
    "Grammatical accuracy",
  ],
  ["lexical_resource", "lexical_resource_score", "Từ vựng", "Lexical resource"],
  [
    "coherence",
    "coherence_score",
    "Mạch lạc và liên kết",
    "Coherence and cohesion",
  ],
  ["naturalness", "naturalness_score", "Diễn đạt tự nhiên", "Naturalness"],
  [
    "register",
    "register_score",
    "Văn phong phù hợp",
    "Register and appropriateness",
  ],
] as const;

export function WritingEvaluationCard({
  submission,
}: {
  submission: WritingSubmission;
}) {
  const { i18n } = useTranslation(),
    vi = i18n.language === "vi";
  return (
    <section
      aria-label={vi ? "Sáu tiêu chí Writing" : "Six writing criteria"}
      className="space-y-3"
    >
      <h2 className="text-lg font-semibold">
        {vi ? "Nhận xét theo 6 tiêu chí" : "Feedback on six criteria"}
      </h2>
      {submission.grading_standard === "TOEIC" && (
        <p className="text-sm text-text-secondary">
          {vi
            ? "Các chỉ số dưới đây dùng để giải thích bài viết, không phải điểm thành phần TOEIC và không được lấy trung bình để tính điểm nhiệm vụ."
            : "These diagnostics explain the response. They are not official TOEIC subscores and are not averaged into the task score."}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {criteria.map(([key, field, labelVi, labelEn]) => {
          const score = submission[field],
            detail = submission.ai_evaluation?.criteria_feedback?.[key];
          const numeric = typeof score === "number" && Number.isFinite(score);
          const value = numeric ? Math.min(100, Math.max(0, score)) : 0;
          return (
            <Card key={key}>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-medium">{vi ? labelVi : labelEn}</h3>
                  <span className="text-sm whitespace-nowrap">
                    {numeric
                      ? `${value}/100`
                      : score === null
                      ? vi
                        ? "Không áp dụng"
                        : "Not applicable"
                      : vi
                      ? "Chưa có dữ liệu"
                      : "Unavailable"}
                  </span>
                </div>
                {numeric && (
                  <div className="h-2 rounded bg-surface-subtle">
                    <div
                      className="h-full rounded bg-primary"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                )}
                {detail?.comment && (
                  <p className="text-sm text-text-secondary">
                    {detail.comment}
                  </p>
                )}
                {detail?.evidence.map((quote, index) => (
                  <blockquote
                    key={index}
                    className="border-l-2 border-primary/40 pl-3 text-sm italic"
                  >
                    “{quote}”
                  </blockquote>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
