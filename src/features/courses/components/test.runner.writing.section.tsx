"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import {
  courseService,
  type WritingSubmissionResponse,
} from "../services/course.service";
import {
  readSkillDraft,
  writeSkillDraft,
} from "@/features/practice/lib/skill-draft";
import { SkillEvaluationFeedback } from "@/features/practice/components/skill.evaluation.feedback";
import { toast } from "@/store/toast.store";

interface Props {
  courseId: string;
  sessionId: string | null;
  moduleId?: string;
  testType: string;
  prompt: string;
  fileUrl?: string;
  initialResult?: WritingSubmissionResponse;
  inputLocked?: boolean;
  onResult?: (result: WritingSubmissionResponse) => void;
}

export function TestRunnerWritingSection({
  courseId,
  sessionId,
  prompt,
  fileUrl,
  initialResult,
  inputLocked,
  onResult,
}: Props) {
  const [text, setText] = useState(initialResult?.essay_text || "");
  const [localResult, setResult] = useState<WritingSubmissionResponse>();
  const result = localResult || initialResult;
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [ready, setReady] = useState(false);
  const key = `course-writing:${sessionId}`;
  const graded =
    result?.status === "AI_GRADED" || result?.status === "TEACHER_REVIEWED";
  const locked =
    busy || sent || !!result || inputLocked || !sessionId || !ready;

  useEffect(() => {
    let active = true;
    if (!sessionId) return;
    readSkillDraft<{ text: string; sent?: boolean }>(key)
      .then((draft) => {
        if (active && draft) {
          setText(draft.text);
          setSent(!!draft.sent);
        }
      })
      .catch(() => toast.warning("Chưa khôi phục được bản nháp trên thiết bị."))
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [key, sessionId]);

  const changeText = (value: string) => {
    setText(value);
    writeSkillDraft(key, { text: value }).catch(() =>
      toast.warning("Chưa lưu được bản nháp. Hãy giữ trang này mở."),
    );
  };

  const submit = async () => {
    if (!sessionId || busy) return;
    setBusy(true);
    try {
      setSent(true);
      await writeSkillDraft(key, { text, sent: true }).catch(() => {});
      const response = await courseService.submitWritingSubmission(courseId, {
        session_id: sessionId,
        essay_text: text || result?.essay_text || "",
      });
      setResult(response);
      onResult?.(response);
      if (
        response.status === "AI_GRADED" ||
        response.status === "TEACHER_REVIEWED"
      ) {
        await writeSkillDraft(key, undefined).catch(() => {});
        toast.success("Đã chấm bài viết thành công.");
      } else
        toast.info(
          response.grading_error ||
            "Chưa chấm được bài viết. Nội dung đã được giữ để thử lại.",
        );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Chưa chấm được bài viết. Bạn có thể thử lại.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-border p-4">
        <p className="font-semibold">Đề bài Writing</p>
        <p className="whitespace-pre-wrap text-sm">{prompt}</p>
        {fileUrl && (
          <a
            className="text-primary underline"
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
          >
            Xem tài liệu đính kèm
          </a>
        )}
      </div>
      {!graded && (
        <div className="space-y-3">
          <label className="block text-sm">
            Nạp nội dung từ TXT hoặc Markdown
            <input
              disabled={locked}
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (!/\.(txt|md)$/i.test(file.name) || file.size > 100000) {
                  toast.error(
                    "Chỉ nhận TXT/MD tối đa 100KB. Với PDF/DOCX, hãy sao chép nội dung vào khung viết.",
                  );
                  return;
                }
                try {
                  changeText(await file.text());
                } catch {
                  toast.error("Không đọc được nội dung tệp.");
                }
              }}
            />
          </label>
          <p className="text-sm text-text-secondary">
            Độ dài và cách đánh giá theo yêu cầu của từng đề. Nội dung được khóa
            khi nộp.
          </p>
          <textarea
            disabled={locked}
            value={text}
            maxLength={20000}
            onChange={(event) => changeText(event.target.value)}
            rows={12}
            className="w-full rounded-2xl border border-border bg-surface p-4 text-sm"
            placeholder="Nhập bài viết tiếng Anh…"
          />
          <p className="text-sm">
            {text.trim().split(/\s+/).filter(Boolean).length} từ
          </p>
          {result?.grading_error && (
            <p role="status" className="text-sm text-amber-700">
              {result.grading_error}
            </p>
          )}
          <Button
            disabled={
              busy ||
              !sessionId ||
              !ready ||
              !text.trim() ||
              (!!inputLocked && !sent && !result)
            }
            onClick={submit}
          >
            {busy
              ? "AI đang chấm bài viết…"
              : sent || result
              ? "Thử chấm lại bài đã nộp"
              : "Nộp bài viết để AI chấm"}
          </Button>
        </div>
      )}
      {graded && (
        <div className="space-y-4 rounded-2xl border border-emerald-500 p-5">
          <p className="font-semibold">
            Kết quả Writing: {result?.final_score ?? result?.ai_score}/100
          </p>
          <SkillEvaluationFeedback evaluation={result?.ai_evaluation} />
        </div>
      )}
    </section>
  );
}
