import { useNavigate } from "@/lib/navigation";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/button";
import { Card, CardContent } from "@/components/card";
import type { WritingSubmission, WritingExercise } from "../types/writing";
import { writingScoreLabel } from "../lib/writing-score";
import { WritingEvaluationCard } from "./writing.evaluation.card";

interface WritingResultProps {
  submission: WritingSubmission;
  exercise: WritingExercise;
  onBack: () => void;
  onTryAgain: () => void;
  onNextExercise: () => void;
  onViewHistory: () => void;
}
export function WritingResult({
  submission,
  exercise,
  onBack,
  onTryAgain,
  onNextExercise,
  onViewHistory,
}: WritingResultProps) {
  const navigate = useNavigate();
  const { i18n } = useTranslation(),
    vi = i18n.language === "vi";
  const evaluation = submission.ai_evaluation,
    toeic = submission.grading_standard === "TOEIC";
  const groups = [
    [vi ? "Điểm mạnh" : "Strengths", evaluation?.strengths || []],
    [vi ? "Cần cải thiện" : "Areas to improve", evaluation?.weaknesses || []],
    [
      vi ? "Việc nên làm tiếp" : "Next steps",
      evaluation?.improvement_tips || [],
    ],
  ] as const;
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-text-secondary"
      >
        <ArrowLeft size={18} />
        {vi ? "Quay lại" : "Back"}
      </button>
      <section className="space-y-2 rounded-2xl border border-border bg-surface p-6 text-center">
        <h1 className="text-xl font-semibold">
          {vi ? "Kết quả Writing" : "Writing result"}
        </h1>
        <p className="text-text-secondary">{exercise.title}</p>
        <p
          className="text-4xl font-bold text-primary"
          aria-label={vi ? "Điểm bài viết" : "Writing score"}
        >
          {writingScoreLabel(submission)}
        </p>
        <p className="text-sm">
          {toeic
            ? vi
              ? "Điểm nhiệm vụ mô phỏng theo rubric TOEIC"
              : "Simulated TOEIC task rubric score"
            : vi
            ? "Điểm luyện giao tiếp thực tế"
            : "Practical communication score"}
        </p>
        {toeic && (
          <p className="text-xs text-text-secondary">
            {vi
              ? "Không phải điểm TOEIC Writing toàn bài thi 0–200."
              : "This is not a full-test TOEIC Writing score out of 200."}
          </p>
        )}
        {!submission.grading_version && (
          <p className="text-xs text-text-secondary">
            {vi
              ? "Kết quả từ bộ chấm trước; chưa có nhận xét rubric mới."
              : "Legacy assessment; the new rubric feedback is unavailable."}
          </p>
        )}
        <p className="whitespace-pre-wrap text-sm">
          {evaluation?.score_reason ||
            evaluation?.overall_feedback ||
            (vi ? "Chưa có nhận xét." : "Feedback unavailable.")}
        </p>
        <p className="text-xs text-text-secondary">
          {submission.word_count} {vi ? "từ" : "words"} ·{" "}
          {Math.round((submission.writing_time_seconds || 0) / 60)}{" "}
          {vi ? "phút" : "minutes"}
        </p>
      </section>
      {toeic && !!evaluation?.rubric_snapshot?.bands.length && (
        <details className="rounded-xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold">
            {vi ? "Rubric nhiệm vụ TOEIC" : "TOEIC task rubric"}
          </summary>
          <p className="my-2 text-xs text-text-secondary">
            {vi
              ? "Mô tả mức điểm dùng trong lần chấm này (tiếng Anh)."
              : "Band descriptions used for this assessment."}
          </p>
          <ul className="space-y-2 text-sm">
            {evaluation.rubric_snapshot.bands.map((band, index) => (
              <li
                key={index}
                className={
                  index === submission.raw_score
                    ? "rounded-lg bg-primary/10 p-2 font-medium"
                    : "p-2"
                }
              >
                {band}
              </li>
            ))}
          </ul>
        </details>
      )}
      {submission.grading_version === "writing-v2" && (
        <section
          className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm"
          aria-label={vi ? "Theo dõi ôn Writing" : "Writing review tracking"}
        >
          <h2 className="font-semibold">
            {vi ? "Theo dõi lỗi và vận dụng" : "Error and application tracking"}
          </h2>
          <p>
            {submission.writing_srs_version !== 1
              ? vi
                ? "Điểm bài đã lưu. Bằng chứng và lịch ôn đang chờ đồng bộ; bạn có thể mở sổ tay để thử lại."
                : "Your grade is saved. Learning evidence is awaiting sync; open your notebook to retry."
              : submission.writing_srs_summary?.some((row) => row.credited)
              ? vi
                ? "Đã ghi nhận vận dụng đúng trong bài khác với khoảng cách ôn đủ điều kiện. Lịch ôn đã cập nhật."
                : "Eligible independent application in another spaced task was recorded. Your schedule is updated."
              : submission.writing_srs_summary?.some(
                  (row) => row.outcome === "ERROR",
                )
              ? vi
                ? "Đã ghi nhận các mục tiêu cần theo dõi từ lỗi trong bài này."
                : "Targets to monitor were recorded from errors in this response."
              : vi
              ? "Lượt này chưa có thêm bằng chứng đủ điều kiện để xác nhận vận dụng độc lập. Không suy mức thành thạo từ điểm tổng."
              : "This response provides no additional eligible independent evidence. Mastery is not inferred from the overall score."}
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/practice/mistakes?section=WRITING")}
          >
            {vi ? "Mở sổ tay Writing" : "Open Writing notebook"}
          </Button>
        </section>
      )}
      <WritingEvaluationCard submission={submission} />
      <div className="grid gap-3 md:grid-cols-3">
        {groups.map(([label, items]) => (
          <Card key={label}>
            <CardContent className="space-y-2 p-4">
              <h2 className="font-semibold">{label}</h2>
              {items.length ? (
                <ul className="list-disc space-y-2 pl-4 text-sm">
                  {items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-secondary">
                  {vi
                    ? "Không có nhận xét bổ sung."
                    : "No additional comments."}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {!!evaluation?.errors.length && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            {vi
              ? "Lỗi cần sửa và gợi ý diễn đạt"
              : "Corrections and expression suggestions"}
          </h2>
          {evaluation.errors.map((error, index) => (
            <Card key={index}>
              <CardContent className="space-y-2 p-4">
                <p className="text-sm font-medium">
                  {error.type === "STYLE"
                    ? vi
                      ? "Gợi ý tùy chọn"
                      : "Optional style suggestion"
                    : error.type}
                </p>
                <p className="whitespace-pre-wrap text-sm">
                  <span className="text-red-600">{error.original}</span> →{" "}
                  <span className="text-emerald-600">{error.correction}</span>
                </p>
                <p className="text-sm text-text-secondary">
                  {error.explanation}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
      <section>
        <h2 className="mb-3 text-lg font-semibold">
          {vi ? "Bài viết của bạn" : "Your writing"}
        </h2>
        <Card>
          <CardContent className="whitespace-pre-wrap p-4">
            {submission.content}
          </CardContent>
        </Card>
      </section>
      {evaluation?.suggested_version && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">
            {vi ? "Bản chỉnh sửa tham khảo" : "Suggested revision"}
          </h2>
          <Card>
            <CardContent className="whitespace-pre-wrap p-4">
              {evaluation.suggested_version}
            </CardContent>
          </Card>
        </section>
      )}
      <section className="flex flex-wrap justify-end gap-3">
        <Button variant="outline" onClick={onViewHistory}>
          {vi ? "Lịch sử" : "History"}
        </Button>
        <Button variant="outline" onClick={onTryAgain}>
          <RotateCcw size={16} />
          {vi ? "Luyện lại" : "Practice again"}
        </Button>
        <Button onClick={onNextExercise}>
          {vi ? "Bài tiếp theo" : "Next exercise"}
          <ChevronRight size={16} />
        </Button>
      </section>
    </main>
  );
}
