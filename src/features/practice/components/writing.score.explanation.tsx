"use client";

import { useTranslation } from "react-i18next";
import type { WritingSubmission } from "../types/writing";

const labels = {
  task_achievement: ["Đáp ứng yêu cầu", "Task achievement"],
  grammatical_accuracy: ["Ngữ pháp", "Grammar"],
  lexical_resource: ["Từ vựng", "Vocabulary"],
  coherence: ["Mạch lạc", "Coherence"],
  naturalness: ["Diễn đạt tự nhiên", "Naturalness"],
  register: ["Văn phong", "Register"],
};
export function WritingScoreExplanation({
  submission,
}: {
  submission: WritingSubmission;
}) {
  const { i18n } = useTranslation(),
    vi = i18n.language.startsWith("vi");
  const evaluation = submission.ai_evaluation,
    snapshot = evaluation?.rubric_snapshot;
  const weights = Object.entries(snapshot?.weights || {}).filter(
    ([, weight]) => typeof weight === "number" && weight > 0,
  );
  const sum = weights.reduce((total, [, weight]) => total + weight, 0);
  return (
    <div className="space-y-3">
      {submission.grading_standard !== "TOEIC" && sum > 0 && (
        <details className="rounded-xl border border-border bg-surface p-4 text-sm">
          <summary className="min-h-11 cursor-pointer font-medium text-text-primary">
            {vi
              ? "Cách tính điểm tổng"
              : "How your overall score is calculated"}
          </summary>
          <p className="mb-3 text-text-secondary">
            {vi
              ? "Điểm tổng là trung bình có trọng số, làm tròn ở bước cuối. Các tiêu chí không có trọng số vẫn giúp bạn hiểu bài viết nhưng không cộng vào điểm tổng."
              : "The overall score is a weighted average, rounded once at the end. Criteria without a weight provide feedback but do not contribute to the overall score."}
          </p>
          <ul className="space-y-1">
            {weights.map(([key, weight]) => (
              <li key={key} className="flex flex-wrap justify-between gap-2">
                <span>
                  {labels[key as keyof typeof labels]?.[vi ? 0 : 1] || key}
                </span>
                <span>{Number(((weight / sum) * 100).toFixed(2))}%</span>
              </li>
            ))}
          </ul>
          {snapshot?.version === "writing-v2" && (
            <p className="mt-3 text-text-secondary">
              {vi
                ? "Đây là trọng số đã lưu cùng lần chấm trước. Điểm lịch sử được giữ nguyên khi hệ thống cập nhật rubric."
                : "These weights were saved with the earlier assessment. Historical scores are preserved when rubrics are updated."}
            </p>
          )}
        </details>
      )}
      {evaluation?.feedback_metadata_status === "SANITIZED" && (
        <p className="rounded-xl border border-amber-300/50 bg-amber-50/50 p-3 text-sm text-text-secondary dark:bg-amber-950/20">
          {vi
            ? "Một số trích dẫn đã được chuẩn hóa hoặc lọc sau khi đối chiếu với bài gốc. Các trích dẫn hiển thị được đối chiếu với bài viết; việc lọc trích dẫn không tự thay đổi điểm."
            : "Some quotations were normalized or filtered after checking the original writing. Displayed quotations are checked against your writing; filtering does not automatically change the score."}
        </p>
      )}
    </div>
  );
}
