"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { BookOpen, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useNavigate } from "@/lib/navigation";
import { speakingGrammarService } from "../services/speaking-grammar.service";
import type { SpeakingLearningIssue } from "../types/speaking";

const normalized = (text: string) =>
  text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .match(/[a-z0-9]+(?:'[a-z]+)?/g)
    ?.join(" ") || "";

/** Query caching shares one request between all errors belonging to an attempt. */
export function SpeakingGrammarActions({
  attemptId,
  issue,
  kind = "SPEAKING",
}: {
  kind?: "SPEAKING" | "WRITING";
  attemptId?: string;
  issue: Pick<
    SpeakingLearningIssue,
    "turn_number" | "category" | "original" | "corrected"
  >;
}) {
  const { i18n } = useTranslation(),
    vi = i18n.language.startsWith("vi");
  const userId = useAuthStore((s) => s.user?.user_id),
    navigate = useNavigate(),
    client = useQueryClient();
  const [starting, setStarting] = useState(false),
    [error, setError] = useState("");
  const guard = useRef(false),
    key = useRef<{ source: string; value: string } | null>(null);
  const valid = Boolean(attemptId && /^[a-f\d]{24}$/i.test(attemptId));
  const query = useQuery({
    queryKey: [
      kind === "WRITING" ? "writing-grammar" : "speaking-grammar",
      userId,
      attemptId,
    ],
    queryFn: () => speakingGrammarService.source(attemptId!, kind),
    enabled: Boolean(userId && valid),
    staleTime: 30_000,
    retry: 1,
  });
  const match = query.data?.issues.find(
    (i) =>
      i.turn_number === issue.turn_number &&
      i.category === issue.category &&
      normalized(i.original) === normalized(issue.original) &&
      normalized(i.corrected) === normalized(issue.corrected),
  );
  const unavailable = !valid
    ? vi
      ? "Bản đánh giá này chưa có đủ nguồn để nối bài luyện."
      : "This assessment has insufficient source evidence to link practice."
    : query.isError
      ? vi
        ? "Chưa tải được liên kết bài luyện."
        : "Could not load practice links."
      : !match || match.availability === "UNVERIFIED"
        ? kind === "WRITING"
          ? vi
            ? "Chưa đủ minh chứng từ bài viết để nối bài luyện."
            : "The saved writing correction has insufficient evidence to link practice."
          : vi
            ? "Chưa đủ minh chứng nhận dạng để tự chọn bài luyện; hãy nghe và nói lại."
            : "Speech evidence is insufficient to select practice automatically; replay and record again."
        : match.availability === "UNMAPPED"
          ? kind === "WRITING"
            ? vi
              ? "Chưa xác định chắc quy tắc; hãy xem nhận xét và viết lại."
              : "The rule cannot be identified reliably; review the feedback and rewrite."
            : vi
              ? "Chưa xác định chắc quy tắc cho câu này; hãy xem nhận xét và luyện nói lại."
              : "The rule cannot yet be identified reliably; review the feedback and record again."
          : match.availability === "LOCKED"
            ? vi
              ? "Bài luyện ở cấp độ chưa mở khóa. Bạn vẫn có thể đọc lý thuyết."
              : "This practice level is locked. You can still read the theory."
            : match.availability === "INSUFFICIENT_QUESTIONS"
              ? vi
                ? "Chủ điểm hiện chưa đủ 10 câu đã xuất bản."
                : "This topic currently has fewer than 10 published questions."
              : match.availability !== "READY"
                ? vi
                  ? "Nội dung hoặc liên kết đang được cập nhật."
                  : "The content or its link is being updated."
                : null;
  async function start() {
    if (!attemptId || match?.availability !== "READY" || guard.current) return;
    guard.current = true;
    setStarting(true);
    setError("");
    const sourceKey = `${kind}:${userId}:${attemptId}:${match.issue_id}`;
    if (key.current?.source !== sourceKey)
      key.current = { source: sourceKey, value: crypto.randomUUID() };
    let navigating = false;
    try {
      const session = await speakingGrammarService.start(
        attemptId,
        match.issue_id,
        key.current.value,
        kind,
      );
      client.setQueryData(
        ["grammar-session", userId, session.session_id],
        session,
      );
      const next = new URLSearchParams({
        view: "practice",
        session: session.session_id,
        level: session.cefr_level,
      });
      navigate(`/grammar?${next}`);
      navigating = true;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : vi
            ? "Chưa mở được bài luyện."
            : "Could not open practice.",
      );
      void query.refetch();
    } finally {
      if (!navigating) {
        guard.current = false;
        setStarting(false);
      }
    }
  }
  if (!userId)
    return (
      <p className="mt-3 text-sm text-text-secondary">
        {vi
          ? "Đăng nhập để xem bài luyện cá nhân."
          : "Sign in to view personalized practice."}
      </p>
    );
  if (valid && query.isPending)
    return (
      <p role="status" className="mt-3 text-sm text-text-secondary">
        {vi ? "Đang đối chiếu chủ điểm ngữ pháp…" : "Matching grammar topics…"}
      </p>
    );
  const theoryUrl =
    match?.theory_available && match.target?.theory_slug
      ? `/grammar/handbook/${encodeURIComponent(match.target.theory_slug)}?${new URLSearchParams(kind === "WRITING" ? { writing_submission: attemptId!, writing_issue: match.issue_id } : { speaking_attempt: attemptId!, speaking_issue: match.issue_id })}`
      : null;
  return (
    <div className="mt-3 space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
      {match?.topic && (
        <p className="text-sm font-medium text-text-primary">
          {vi
            ? match.topic.name_vi || match.topic.name_en
            : match.topic.name_en}{" "}
          · {match.topic.cefr_level}
        </p>
      )}
      {match?.target && (
        <p className="text-xs text-text-secondary">
          {vi
            ? "Bài luyện theo chủ điểm, 10 câu; mỗi câu có thể luyện một phần khác nhau của chủ điểm."
            : "Topic practice, 10 questions; individual questions may cover different parts of this topic."}
        </p>
      )}
      {unavailable && (
        <p className="text-sm text-text-secondary">{unavailable}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {theoryUrl && (
          <Link
            href={theoryUrl}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-primary"
          >
            <BookOpen size={16} aria-hidden="true" />
            {vi ? "Xem lý thuyết" : "Read theory"}
          </Link>
        )}
        {match?.topic && (
          <button
            type="button"
            disabled={match.availability !== "READY" || starting}
            onClick={() => void start()}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {starting
              ? vi
                ? "Đang mở…"
                : "Opening…"
              : vi
                ? "Luyện chủ điểm · 10 câu"
                : "Practice topic · 10 questions"}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        )}
        {query.isError && (
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="min-h-11 rounded-lg border border-border px-3 text-sm text-primary"
          >
            {vi ? "Thử lại" : "Retry"}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
