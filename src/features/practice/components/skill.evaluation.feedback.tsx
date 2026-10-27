"use client";

import type { SkillEvaluation } from "@/features/courses/services/course.service";

const labels: Record<string, string> = {
  pronunciation: "Phát âm",
  fluency: "Lưu loát",
  grammatical_accuracy: "Ngữ pháp",
  lexical_resource: "Từ vựng",
  task_achievement: "Đáp ứng yêu cầu",
  coherence: "Mạch lạc và liên kết",
  naturalness: "Diễn đạt tự nhiên",
  register: "Văn phong phù hợp",
};

export function SkillEvaluationFeedback({
  evaluation,
}: {
  evaluation?: SkillEvaluation;
}) {
  if (!evaluation) return null;
  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        {evaluation.detailed_feedback}
      </p>
      {evaluation.grading_standard === "TOEIC" && (
        <p className="text-sm">
          Điểm nhiệm vụ: {evaluation.raw_score}/{evaluation.max_score}. Các chỉ
          số dưới đây dùng để giải thích bài làm, không phải điểm TOEIC trên
          thang 200.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(evaluation.criteria_scores || {})
          .filter(([key]) => labels[key])
          .map(([key, score]) => (
            <div
              key={key}
              className="rounded-xl border border-border p-3 text-sm"
            >
              <div className="flex justify-between gap-2">
                <span>{labels[key]}</span>
                <strong>
                  {score === null ? "Không áp dụng" : `${score}/100`}
                </strong>
              </div>
              {evaluation.criteria_feedback?.[key]?.comment && (
                <p className="mt-2 text-text-secondary">
                  {evaluation.criteria_feedback[key].comment}
                </p>
              )}
              {evaluation.criteria_feedback?.[key]?.evidence?.map((item, i) => (
                <blockquote key={i} className="mt-1 border-l-2 pl-2 italic">
                  {item}
                </blockquote>
              ))}
            </div>
          ))}
      </div>
      {(
        [
          ["Điểm mạnh", evaluation.strengths],
          ["Cần cải thiện", evaluation.weaknesses],
          ["Gợi ý luyện tập", evaluation.actionable_tips],
        ] as const
      ).map(([title, items]) =>
        items?.length ? (
          <div key={title}>
            <p className="text-sm font-semibold">{title}</p>
            <ul className="list-disc pl-5 text-sm">
              {items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null,
      )}
      {!!evaluation.grammar_errors?.length && (
        <div className="space-y-2 text-sm">
          <p className="font-semibold">Sửa lỗi ngữ pháp</p>
          {evaluation.grammar_errors.map((error, i) => (
            <div key={i}>
              <p>
                <del>{error.original}</del> → {error.corrected}
              </p>
              <p className="text-text-secondary">{error.explanation}</p>
            </div>
          ))}
        </div>
      )}
      {evaluation.improved_version && (
        <div className="rounded-xl bg-surface-subtle p-3 text-sm">
          <p className="font-semibold">Gợi ý diễn đạt</p>
          <p className="whitespace-pre-wrap">{evaluation.improved_version}</p>
        </div>
      )}
    </div>
  );
}
