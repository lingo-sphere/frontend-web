"use client";
import { useMounted } from "@/hooks/use.mounted";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Loader2,
  RefreshCw,
  Search,
  PenTool,
  ArrowRight,
  Pause,
  Play,
} from "lucide-react";
import { Button } from "@/components/button";
import { Card, CardContent } from "@/components/card";
import {
  Sheet as Dialog,
  SheetContent as DialogContent,
  SheetHeader as DialogHeader,
  SheetTitle as DialogTitle,
  SheetDescription as DialogDescription,
} from "@/components/sheet";
import { useNavigate, useSearchParams } from "@/lib/navigation";
import {
  useWritingSrsQuery,
  useWritingSrsDetail,
  writingSrsKey,
} from "../hooks/use.writing.srs";
import { writingSrsService } from "../services/writing-srs.service";
import type { WritingSrsFilter, WritingSrsItem } from "../types/writing-srs";
const field =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary";
export function WritingMistakesView() {
  const mounted = useMounted();
  const { i18n } = useTranslation(),
    vi = i18n.language === "vi";
  const navigate = useNavigate(),
    params = useSearchParams(),
    queryClient = useQueryClient();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const statusValue = params.get("w_status") || "DUE";
  const filters: WritingSrsFilter = {
    status: ["DUE", "ALL", "STABLE", "PAUSED"].includes(statusValue)
      ? (statusValue as WritingSrsFilter["status"])
      : "DUE",
    kind: params.get("w_kind") || "",
    context_id: params.get("w_context") || "",
    search: params.get("w_search") || "",
    page: Math.max(1, Number(params.get("w_page")) || 1),
  };
  const query = useWritingSrsQuery(filters),
    detail = useWritingSrsDetail(detailId);
  const change = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    next.set("section", "WRITING");
    for (const [key, value] of Object.entries({ w_page: "1", ...patch })) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    navigate(`/practice/mistakes?${next}`);
  };
  const errorText = (error: unknown) =>
    error instanceof Error
      ? error.message
      : vi
      ? "Không thực hiện được thao tác. Hãy thử lại."
      : "The action failed. Please retry.";
  const sync = useMutation({
    mutationFn: writingSrsService.sync,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: writingSrsKey });
      setActionError(
        result.remaining > 0 && result.processed === 0
          ? vi
            ? "Chưa đồng bộ được lịch ôn. Điểm bài đã lưu; hãy thử lại sau."
            : "Review sync is unavailable. Your grades are saved; please retry later."
          : "",
      );
    },
    onError: (error) => setActionError(errorText(error)),
  });
  const autoSynced = useRef(false);
  const syncEvidence = sync.mutate;
  useEffect(() => {
    if (query.data?.pending_submissions && !autoSynced.current) {
      autoSynced.current = true;
      syncEvidence();
    }
  }, [query.data?.pending_submissions, syncEvidence]);
  const start = useMutation({
    mutationFn: ({
      id,
      mode,
      exercise,
    }: {
      id: string;
      mode: "REWRITE" | "TRANSFER";
      exercise?: string;
    }) => writingSrsService.start(id, mode, exercise),
    onSuccess: (result) =>
      navigate(
        `/writing/workspace/${result.exercise_id}?review_session=${result.review_session_id}`,
      ),
    onError: (error) => setActionError(errorText(error)),
  });
  const pause = useMutation({
    mutationFn: ({ id, paused }: { id: string; paused: boolean }) =>
      writingSrsService.pause(id, paused),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: writingSrsKey });
      setActionError("");
    },
    onError: (error) => setActionError(errorText(error)),
  });
  const kindName = (kind: string) =>
    ({
      GRAMMAR: vi ? "Ngữ pháp" : "Grammar",
      VOCABULARY: vi ? "Từ và cụm từ" : "Words and phrases",
      COMMUNICATION: vi
        ? "Giao tiếp theo ngữ cảnh"
        : "Communication in context",
    })[kind] || kind;
  const stateName = (state: string) =>
    ({
      MONITORING: vi ? "Mới ghi nhận" : "Monitoring",
      NEEDS_PRACTICE: vi ? "Cần luyện thêm" : "Needs practice",
      IMPROVING: vi ? "Đang cải thiện" : "Improving",
      STABLE: vi ? "Vận dụng ổn định" : "Stable application",
    })[state] || state;
  const date = (value: string) =>
    new Date(value).toLocaleString(vi ? "vi-VN" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  const label = (item: WritingSrsItem) =>
    vi ? item.writing.label : item.writing.label_en;
  const busy = start.isPending || pause.isPending;
  const totalPages = query.data
    ? Math.ceil(query.data.total / query.data.limit)
    : 0;
  const reason = (key: string) =>
    ({
      NEEDS_CLASSIFICATION: vi
        ? "Lỗi chưa được phân loại đủ cụ thể để xác nhận vận dụng độc lập"
        : "The error needs more precise classification before independent use can be credited",
      ERROR: vi ? "Lỗi còn xuất hiện" : "Error observed",
      INDEPENDENT_TRANSFER: vi
        ? "Tự vận dụng trong bài mới, sau khoảng cách ôn"
        : "Independent use in a new, spaced task",
      ASSISTED: vi ? "Có mở gợi ý trong lượt ôn" : "Used an in-session hint",
      REWRITE: vi ? "Sửa lại bài cũ" : "Revised the original task",
      NOT_OBSERVED: vi
        ? "Chưa có bằng chứng vận dụng"
        : "No observed opportunity",
      NEEDS_DELAY_OR_NEW_EXERCISE: vi
        ? "Đã dùng đúng; cần bài khác và khoảng cách ít nhất 24 giờ để xác nhận tiến bộ"
        : "Correct use; a different task and at least 24 hours are needed to confirm progress",
      OLDER_EVIDENCE: vi
        ? "Bằng chứng cũ, giữ nguyên lịch mới hơn"
        : "Older evidence; newer schedule retained",
    })[key] || key;
  return (
    <section
      className="space-y-5"
      aria-label={vi ? "Ôn tập Writing" : "Writing review"}
    >
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <PenTool size={22} />
            {vi
              ? "Ôn Writing theo lỗi và ngữ cảnh"
              : "Writing review by error and context"}
          </h2>
          <Button
            variant="outline"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
          >
            <RefreshCw size={16} />
            {vi ? "Làm mới" : "Refresh"}
          </Button>
        </div>
        <p className="mt-2 max-w-3xl text-sm text-text-secondary">
          {vi
            ? "Theo dõi cách bạn dùng ngữ pháp, từ vựng và hoàn thành mục đích giao tiếp. Sửa bài cũ giúp hiểu lỗi; vận dụng đúng trong các bài mới cách ngày giúp xác nhận tiến bộ. Điểm TOEIC được giữ riêng."
            : "Track grammar, vocabulary and communication goals. Revision helps you understand errors; correct use in new tasks on later days provides evidence of progress. TOEIC scores stay separate."}
        </p>
      </div>
      {query.data && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            [vi ? "Đến hạn ôn" : "Due", query.data.summary.due],
            [
              vi ? "Mục đang theo dõi" : "Tracked targets",
              query.data.summary.total,
            ],
            [
              vi ? "Vận dụng ổn định" : "Stable application",
              query.data.summary.stable,
            ],
            [vi ? "Tạm dừng" : "Paused", query.data.summary.paused],
          ].map(([name, value]) => (
            <Card key={name}>
              <CardContent className="p-4">
                <p className="text-2xl font-semibold">{value}</p>
                <p className="text-sm text-text-secondary">{name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {query.data?.pending_submissions || sync.isPending ? (
        <div
          role="status"
          className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
        >
          <p>
            {sync.isPending
              ? vi
                ? "Đang đồng bộ bằng chứng từ bài đã chấm…"
                : "Syncing evidence from graded submissions…"
              : vi
              ? `Còn ${query.data?.pending_submissions} bài chưa đồng bộ. Điểm bài đã được lưu; lịch ôn có thể chưa cập nhật đủ.`
              : `${query.data?.pending_submissions} submissions are awaiting sync. Grades are saved; review schedules may be incomplete.`}
          </p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => sync.mutate()}
            disabled={sync.isPending}
          >
            {vi ? "Đồng bộ tiếp" : "Continue sync"}
          </Button>
        </div>
      ) : null}
      {actionError && (
        <p
          role="alert"
          className="rounded-lg border border-red-300 p-3 text-sm text-red-700"
        >
          {actionError}
        </p>
      )}
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          change({
            w_search: String(
              new FormData(event.currentTarget).get("search") || "",
            ).trim(),
          });
        }}
      >
        <label className="grid gap-1 text-xs text-text-secondary">
          {vi ? "Trạng thái" : "Status"}
          <select
            aria-label={vi ? "Trạng thái" : "Status"}
            className={field}
            value={filters.status}
            onChange={(event) => change({ w_status: event.target.value })}
          >
            {[
              ["DUE", vi ? "Đến hạn" : "Due"],
              ["ALL", vi ? "Tất cả" : "All"],
              ["STABLE", vi ? "Ổn định" : "Stable"],
              ["PAUSED", vi ? "Tạm dừng" : "Paused"],
            ].map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs text-text-secondary">
          {vi ? "Nhóm mục tiêu" : "Target group"}
          <select
            aria-label={vi ? "Nhóm mục tiêu" : "Target group"}
            className={field}
            value={filters.kind}
            onChange={(event) => change({ w_kind: event.target.value })}
          >
            <option value="">{vi ? "Tất cả nhóm" : "All groups"}</option>
            {["GRAMMAR", "VOCABULARY", "COMMUNICATION"].map((kind) => (
              <option key={kind} value={kind}>
                {kindName(kind)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-40 gap-1 text-xs text-text-secondary">
          {vi ? "Ngữ cảnh" : "Context"}
          <select
            aria-label={vi ? "Ngữ cảnh" : "Context"}
            className={field}
            value={filters.context_id}
            onChange={(event) => change({ w_context: event.target.value })}
          >
            <option value="">{vi ? "Tất cả ngữ cảnh" : "All contexts"}</option>
            {query.data?.contexts
              .filter((ctx) => ctx._id !== "GENERAL")
              .map((ctx) => (
                <option key={ctx._id} value={ctx._id}>
                  {(vi ? ctx.name : ctx.name_en) ||
                    ctx.name ||
                    (vi ? "Ngữ cảnh đã lưu" : "Saved context")}
                </option>
              ))}
          </select>
        </label>
        <label className="grid min-w-48 flex-1 gap-1 text-xs text-text-secondary">
          {vi ? "Tìm mục tiêu hoặc câu sai" : "Find a target or error"}
          <input
            className={field}
            key={filters.search}
            name="search"
            defaultValue={filters.search}
            maxLength={120}
          />
        </label>
        <Button type="submit" variant="outline">
          <Search size={16} />
          {vi ? "Tìm" : "Search"}
        </Button>
        <Button
          type="reset"
          variant="ghost"
          onClick={() =>
            change({ w_status: "DUE", w_kind: "", w_context: "", w_search: "" })
          }
        >
          {vi ? "Đặt lại" : "Reset"}
        </Button>
      </form>
      {!mounted || query.isLoading ? (
        <p role="status" className="flex items-center gap-2 p-6">
          <Loader2 className="animate-spin" />
          {vi ? "Đang tải lịch ôn…" : "Loading reviews…"}
        </p>
      ) : query.isError ? (
        <div role="alert" className="rounded-xl border border-red-300 p-5">
          <p>{errorText(query.error)}</p>
          <Button variant="outline" onClick={() => query.refetch()}>
            {vi ? "Thử lại" : "Retry"}
          </Button>
        </div>
      ) : !query.data?.items.length ? (
        <div className="rounded-xl border border-border p-8 text-center">
          <h3 className="font-semibold">
            {query.data?.summary.total
              ? vi
                ? "Không có mục phù hợp bộ lọc"
                : "No targets match these filters"
              : vi
              ? "Chưa có lỗi Writing cần theo dõi"
              : "No writing targets yet"}
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            {vi
              ? "Mục tiêu được ghi nhận từ bài viết đã chấm. Không có lỗi được ghi nhận chưa đủ để kết luận đã thành thạo."
              : "Targets come from graded writing. No recorded errors alone does not establish mastery."}
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate("/writing/exercises")}
          >
            {vi ? "Luyện viết" : "Practice writing"}
            <ArrowRight size={16} />
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {query.data.items.map((item) => (
              <Card key={item._id}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="rounded-full bg-primary/10 px-2 py-1">
                      {kindName(item.writing.kind)}
                    </span>
                    <span>
                      {item.status === "PAUSED"
                        ? vi
                          ? "Tạm dừng"
                          : "Paused"
                        : stateName(item.writing.state)}
                    </span>
                  </div>
                  <h3 className="font-semibold">{label(item)}</h3>
                  {item.writing.original && (
                    <blockquote className="border-l-2 border-amber-400 pl-3 text-sm">
                      “{item.writing.original}”
                    </blockquote>
                  )}
                  <p className="text-sm text-text-secondary">
                    {vi ? "Lỗi ghi nhận" : "Recorded errors"}:{" "}
                    {item.writing.error_count} ·{" "}
                    {vi
                      ? "Lượt vận dụng độc lập đủ điều kiện"
                      : "Eligible independent applications"}
                    : {item.writing.independent_successes}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {vi ? "Lịch tiếp theo" : "Next review"}: {date(item.due_at)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActionError("");
                        setDetailId(item._id);
                      }}
                    >
                      {vi ? "Chi tiết & luyện lại" : "Details & practice"}
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={busy}
                      onClick={() =>
                        pause.mutate({
                          id: item._id,
                          paused: item.status !== "PAUSED",
                        })
                      }
                    >
                      {item.status === "PAUSED" ? (
                        <Play size={14} />
                      ) : (
                        <Pause size={14} />
                      )}{" "}
                      {item.status === "PAUSED"
                        ? vi
                          ? "Tiếp tục theo dõi"
                          : "Resume"
                        : vi
                        ? "Tạm dừng"
                        : "Pause"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 text-sm">
            <span>
              {query.data.total} {vi ? "mục" : "targets"} ·{" "}
              {vi ? "Trang" : "Page"} {filters.page}/{Math.max(1, totalPages)}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={filters.page <= 1}
                onClick={() => change({ w_page: String(filters.page - 1) })}
              >
                {vi ? "Trước" : "Previous"}
              </Button>
              <Button
                variant="outline"
                disabled={filters.page >= totalPages}
                onClick={() => change({ w_page: String(filters.page + 1) })}
              >
                {vi ? "Sau" : "Next"}
              </Button>
            </div>
          </div>
        </>
      )}
      {!!query.data?.contexts.length && (
        <details className="rounded-xl border border-border p-4">
          <summary className="cursor-pointer font-semibold">
            {vi ? "Bằng chứng theo ngữ cảnh" : "Evidence by context"}
          </summary>
          <p className="my-2 text-xs text-text-secondary">
            {vi
              ? "Đây là số lượt quan sát, không phải phần trăm thành thạo. Một bài có thể có nhiều mục tiêu."
              : "These are observation counts, not mastery percentages. One response may contain several targets."}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  {[
                    vi ? "Ngữ cảnh" : "Context",
                    vi ? "Lỗi" : "Errors",
                    vi ? "Dùng đúng được quan sát" : "Observed correct use",
                    vi ? "Độc lập đủ điều kiện" : "Eligible independent use",
                  ].map((text) => (
                    <th key={text} className="p-2">
                      {text}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {query.data.contexts.map((ctx) => (
                  <tr key={ctx._id} className="border-t border-border">
                    <td className="p-2">
                      {ctx._id === "GENERAL"
                        ? vi
                          ? "Chưa phân loại"
                          : "Unclassified"
                        : (vi ? ctx.name : ctx.name_en) ||
                          ctx.name ||
                          (vi ? "Ngữ cảnh đã lưu" : "Saved context")}
                    </td>
                    <td className="p-2">{ctx.errors}</td>
                    <td className="p-2">{ctx.applications}</td>
                    <td className="p-2">{ctx.independent_successes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
      <Dialog
        open={!!detailId}
        onOpenChange={(open) => {
          if (!open && !start.isPending) setDetailId(null);
        }}
      >
        <DialogContent className="h-full w-full overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {detail.data
                ? label(detail.data.item)
                : vi
                ? "Chi tiết mục ôn"
                : "Review target details"}
            </DialogTitle>
            <DialogDescription>
              {vi
                ? "Dẫn chứng thực tế và các cách luyện lại."
                : "Observed evidence and practice options."}
            </DialogDescription>
          </DialogHeader>
          {detail.isLoading ? (
            <Loader2 className="animate-spin" />
          ) : detail.isError ? (
            <div role="alert">
              <p>{errorText(detail.error)}</p>
              <Button onClick={() => detail.refetch()}>
                {vi ? "Thử lại" : "Retry"}
              </Button>
            </div>
          ) : (
            detail.data && (
              <div className="space-y-5">
                {actionError && (
                  <p role="alert" className="text-sm text-red-700">
                    {actionError}
                  </p>
                )}
                <section className="space-y-2 rounded-xl bg-surface-subtle p-4">
                  {detail.data.item.writing.original && (
                    <p className="whitespace-pre-wrap text-sm">
                      {detail.data.item.writing.original}
                    </p>
                  )}
                  {detail.data.item.writing.corrected && (
                    <p className="whitespace-pre-wrap text-sm font-medium text-emerald-700">
                      → {detail.data.item.writing.corrected}
                    </p>
                  )}
                  <p className="text-sm">
                    {detail.data.item.writing.explanation}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {vi ? "Nguồn" : "Source"}:{" "}
                    {detail.data.item.writing.last_error_exercise_title ||
                      detail.data.item.writing.last_exercise_title ||
                      (vi ? "Bài viết đã lưu" : "Saved writing")}
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      navigate(
                        `/writing/result/${
                          detail.data!.item.writing.last_error_submission_id ||
                          detail.data!.item.writing.last_submission_id
                        }`,
                      )
                    }
                  >
                    {vi ? "Xem bài nộp nguồn" : "View source submission"}
                  </Button>
                </section>
                <section className="space-y-3">
                  <h3 className="font-semibold">
                    {vi ? "Luyện lại có mục tiêu" : "Targeted practice"}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {vi
                      ? "Sửa bài cũ không tăng mức ổn định. Để xác nhận tiến bộ cần vận dụng đúng ở ít nhất hai bài khác, cách nhau tối thiểu 24 giờ và không mở gợi ý trong lượt ôn. Bài cùng ngữ cảnh chỉ được ghi nhận nếu có cơ hội dùng đúng mục tiêu."
                      : "Revising the original does not establish stability. Progress requires correct use in at least two different tasks, at least 24 hours apart, without in-session hints. Related tasks count only when they provide a genuine opportunity to use the target."}
                  </p>
                  <Button
                    variant="outline"
                    disabled={
                      busy ||
                      detail.data.item.status === "PAUSED" ||
                      !detail.data.can_rewrite
                    }
                    onClick={() =>
                      start.mutate({ id: detailId!, mode: "REWRITE" })
                    }
                  >
                    {vi ? "Sửa lại bài gốc" : "Revise original"}
                  </Button>
                  {!detail.data.can_rewrite && (
                    <p className="text-xs text-amber-700">
                      {vi
                        ? "Bài gốc không còn khả dụng hoặc thiếu dữ kiện để chấm."
                        : "The original task is unavailable or lacks grading context."}
                    </p>
                  )}
                  {detail.data.candidates.length ? (
                    <div className="space-y-2">
                      {detail.data.candidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {vi
                                ? candidate.title_vi || candidate.title
                                : candidate.title}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {candidate.cefr_level} ·{" "}
                              {candidate.match === "CONTEXT"
                                ? vi
                                  ? "Cùng ngữ cảnh"
                                  : "Related context"
                                : vi
                                ? "Có mục tiêu liên quan"
                                : "Related target"}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            disabled={
                              busy || detail.data!.item.status === "PAUSED"
                            }
                            onClick={() =>
                              start.mutate({
                                id: detailId!,
                                mode: "TRANSFER",
                                exercise: candidate.id,
                              })
                            }
                          >
                            {vi ? "Viết bài mới" : "Write a new response"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-border p-3 text-sm">
                      {vi
                        ? "Chưa có bài khác phù hợp trong ngân hàng hiện tại. Bạn vẫn có thể sửa bài gốc hoặc luyện Writing; hệ thống không giả định đã tiến bộ vì thiếu bài kiểm chứng."
                        : "No related alternative is available in the current bank. You can revise the original or practice writing; a lack of test opportunities is not counted as progress."}
                    </p>
                  )}
                </section>
                <section className="space-y-3">
                  <h3 className="font-semibold">
                    {vi ? "Lịch sử bằng chứng gần đây" : "Recent evidence"}
                  </h3>
                  {detail.data.history.map((entry) => (
                    <div
                      key={entry.submission_id}
                      className="rounded-lg border border-border p-3 text-sm"
                    >
                      <p className="mb-1 text-xs text-text-secondary">
                        {date(entry.created_at)}
                      </p>
                      {entry.observations.map((ob, index) => (
                        <div key={index} className="space-y-1">
                          <p className="font-medium">{reason(ob.reason)}</p>
                          <p>{ob.explanation}</p>
                          {ob.evidence.map((quote, i) => (
                            <blockquote
                              key={i}
                              className="border-l-2 border-primary/40 pl-3"
                            >
                              “{quote}”
                            </blockquote>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </section>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
