"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { SpeakingGrammarSource } from "../types/speaking-grammar";

export function SpeakingGrammarSourceBanner({
  source,
}: {
  source: SpeakingGrammarSource;
}) {
  const { i18n } = useTranslation(),
    vi = i18n.language.startsWith("vi");
  const date = new Date(source.recorded_at),
    writing = source.source_kind === "WRITING",
    skill = writing ? "Writing" : "Speaking";
  return (
    <aside className="mb-5 space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
      <p className="font-semibold text-text-primary">
        {vi
          ? `Luyện từ lỗi ${skill} của bạn`
          : `Practice from your ${skill} feedback`}
      </p>
      <p className="break-words text-text-primary">
        “{source.original}” → “{source.corrected}”
      </p>
      <p className="text-text-secondary">
        {source.exercise_title}
        {source.turn_number && !writing
          ? ` · ${vi ? "Lượt" : "Turn"} ${source.turn_number}`
          : ""}
        {Number.isFinite(date.getTime())
          ? ` · ${new Intl.DateTimeFormat(vi ? "vi-VN" : "en-US", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "medium", timeStyle: "medium" }).format(date)} (UTC+7)`
          : ""}
      </p>
      <p className="text-text-secondary">
        {writing
          ? vi
            ? "Bài Grammar giúp củng cố kiến thức. Hãy viết lại để kiểm tra khả năng vận dụng."
            : "Grammar practice reinforces knowledge. Rewrite to check your written use."
          : vi
            ? "Làm đúng bài Grammar giúp củng cố kiến thức. Hãy nói lại để kiểm tra khả năng vận dụng."
            : "Correct Grammar answers reinforce knowledge. Record again to check your spoken use."}
      </p>
      <Link
        href={`/${writing ? "writing" : "speaking"}/result/${encodeURIComponent(source.attempt_id)}`}
        className="inline-flex min-h-11 items-center text-primary underline underline-offset-4"
      >
        {vi ? `Quay lại kết quả ${skill}` : `Back to ${skill} result`}
      </Link>
    </aside>
  );
}
