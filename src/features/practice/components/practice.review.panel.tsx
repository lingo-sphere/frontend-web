import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { usePracticeReview } from "../hooks/use.practice.review";

export function PracticeReviewPanel({
  state,
}: {
  state: ReturnType<typeof usePracticeReview>;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const { i18n } = useTranslation(),
    vi = i18n.language === "vi";
  if (!state.enabled) return null;
  const data = state.query.data;
  const review = data?.review;
  return (
    <section
      aria-label={vi ? "Phúc khảo điểm luyện tập" : "Practice score review"}
      className="mb-5 space-y-3 rounded-xl border border-primary/20 bg-surface p-4 text-sm"
    >
      {state.query.isPending && (
        <p>
          {vi ? "Đang tải trạng thái phúc khảo…" : "Loading review status…"}
        </p>
      )}
      {state.query.isError && (
        <div role="alert">
          <p>
            {vi
              ? "Chưa tải được trạng thái phúc khảo."
              : "Unable to load review status."}
          </p>
          <button
            onClick={() => void state.query.refetch()}
            className="text-primary underline"
          >
            {vi ? "Thử lại" : "Retry"}
          </button>
        </div>
      )}
      {review?.status === "REQUESTED" && (
        <>
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-900">
            {vi
              ? "Đã yêu cầu phúc khảo — Chờ giáo viên"
              : "Review requested — Awaiting teacher"}
          </span>
          <p className="whitespace-pre-wrap">{review.reason}</p>
          <p className="text-text-secondary">
            {vi
              ? "Bài được ưu tiên kiểm tra. Điểm hiện tại được giữ trong khi chờ."
              : "Your submission is prioritized. Your current score remains while waiting."}
          </p>
        </>
      )}
      {review?.status === "RESOLVED" && (
        <>
          <strong className="text-primary">
            {vi ? "Giáo viên đã kiểm tra bài" : "Teacher review completed"}
          </strong>
          <p>
            {vi ? "Điểm AI ban đầu" : "Original AI score"}:{" "}
            {data?.grading_standard === "TOEIC"
              ? `${data.original_ai_raw_score}/${data.max_score}`
              : `${data?.ai_score}/100`}
          </p>
          <p>
            {review.reviewer_name}
            {review.reviewed_at
              ? ` · ${new Date(review.reviewed_at).toLocaleString(
                  vi ? "vi-VN" : "en-US",
                )}`
              : ""}
          </p>
          <p className="whitespace-pre-wrap">{review.feedback}</p>
        </>
      )}
      {data?.can_request && !open && (
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg border border-primary px-4 py-2 font-semibold text-primary"
        >
          {vi ? "Yêu cầu phúc khảo điểm" : "Request a score review"}
        </button>
      )}
      {data?.can_request && open && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            state.request.mutate(reason, { onSuccess: () => setOpen(false) });
          }}
          className="space-y-3"
        >
          <label
            className="block font-medium"
            htmlFor={`review-reason-${data.id}`}
          >
            {vi
              ? "Bạn muốn giáo viên kiểm tra lại điều gì?"
              : "What would you like the teacher to review?"}
          </label>
          <textarea
            id={`review-reason-${data.id}`}
            minLength={10}
            maxLength={2000}
            required
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={
              vi
                ? "Nêu tiêu chí hoặc nhận xét AI bạn thấy chưa phù hợp…"
                : "Describe the score or AI feedback you would like reviewed…"
            }
            className="w-full rounded-lg border border-border bg-surface p-3"
          />
          {state.request.isError && (
            <p role="alert" className="text-red-600">
              {state.request.error.message}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={state.request.isPending || reason.trim().length < 10}
              className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50"
            >
              {state.request.isPending
                ? vi
                  ? "Đang gửi…"
                  : "Submitting…"
                : vi
                ? "Gửi yêu cầu phúc khảo"
                : "Submit review request"}
            </button>
            <button
              type="button"
              disabled={state.request.isPending}
              onClick={() => setOpen(false)}
            >
              {vi ? "Hủy" : "Cancel"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
