"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { useSpeakingRecorder } from "@/features/practice/hooks/use.speaking.recorder";
import {
  courseService,
  type SpeakingSubmissionResponse,
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
  prompt?: string;
  fileUrl?: string;
  initialResult?: SpeakingSubmissionResponse;
  inputLocked?: boolean;
  onResult?: (result: SpeakingSubmissionResponse) => void;
}

export function TestRunnerSpeakingSection({
  courseId,
  sessionId,
  prompt,
  fileUrl,
  initialResult,
  inputLocked,
  onResult,
}: Props) {
  const recorder = useSpeakingRecorder();
  const [localResult, setResult] = useState<SpeakingSubmissionResponse>();
  const result = localResult || initialResult;
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [ready, setReady] = useState(false);
  const [frozenAudio, setFrozenAudio] = useState<string | null>(null);
  const key = `course-speaking:${sessionId}`;
  const graded =
    result?.status === "AI_GRADED" || result?.status === "TEACHER_REVIEWED";
  const locked =
    busy || sent || !!result || inputLocked || !sessionId || !ready;

  useEffect(() => {
    let active = true;
    if (!sessionId) return;
    readSkillDraft<{ blob?: Blob; audio?: string; sent?: boolean }>(key)
      .then((draft) => {
        if (!active) return;
        if (draft?.blob)
          recorder.setAudioFile(
            new File([draft.blob], "speaking.webm", { type: draft.blob.type }),
          );
        setFrozenAudio(draft?.audio || null);
        setSent(!!draft?.sent);
      })
      .catch(() =>
        toast.warning(
          "Trình duyệt chưa lưu được bản nháp âm thanh. Hãy giữ trang này mở.",
        ),
      )
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
    // The recorder setter only updates local state; restoration runs once for each session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, sessionId]);

  useEffect(() => {
    if (ready && recorder.recordedBlob && !sent)
      writeSkillDraft(key, { blob: recorder.recordedBlob }).catch(() =>
        toast.warning("Chưa lưu được bản nháp âm thanh trên thiết bị."),
      );
  }, [ready, recorder.recordedBlob, sent, key]);

  const submit = async () => {
    if (!sessionId || busy) return;
    setBusy(true);
    try {
      let audio = frozenAudio || result?.audio_url;
      if (!audio && recorder.recordedBlob)
        audio = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("Không đọc được bản ghi âm"));
          reader.readAsDataURL(recorder.recordedBlob!);
        });
      if (!audio)
        throw new Error(
          "Vui lòng ghi âm hoặc chọn tệp âm thanh trước khi nộp.",
        );
      setFrozenAudio(audio);
      setSent(true);
      await writeSkillDraft(key, {
        blob: recorder.recordedBlob,
        audio,
        sent: true,
      }).catch(() => {});
      const response = await courseService.submitSpeakingSubmission(courseId, {
        session_id: sessionId,
        audio_url: audio,
        audio_mime_type: recorder.recordedBlob?.type || undefined,
      });
      setResult(response);
      onResult?.(response);
      if (
        response.status === "AI_GRADED" ||
        response.status === "TEACHER_REVIEWED"
      ) {
        await writeSkillDraft(key, undefined).catch(() => {});
        toast.success("Đã chấm bài nói thành công.");
      } else
        toast.info(
          response.grading_error ||
            "Chưa chấm được bài nói. Bài chưa được ghi nhận điểm; bạn có thể thử chấm lại.",
        );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Chưa chấm được bài nói. Hãy thử lại với bản ghi âm hiện tại.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-border p-4">
        <p className="font-semibold">Đề bài Speaking</p>
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
      <p className="text-sm text-text-secondary">
        AI đánh giá trực tiếp bản ghi âm theo dạng bài. Nội dung được khóa khi
        nộp; nếu chấm lỗi, bạn có thể chấm lại cùng bản ghi.
      </p>
      {!graded && (
        <div className="space-y-3 rounded-2xl border border-border p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              disabled={locked && !recorder.isRecording}
              onClick={() =>
                recorder.isRecording
                  ? recorder.stopRecording()
                  : recorder.startRecording()
              }
            >
              {recorder.isRecording
                ? `Dừng ghi âm (${recorder.recordingSeconds}s)`
                : "Bắt đầu ghi âm"}
            </Button>
            <label className="text-sm">
              Chọn audio (tối đa 8MB)
              <input
                disabled={locked}
                type="file"
                accept="audio/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (
                    !file.type.startsWith("audio/") ||
                    file.size > 8 * 1024 * 1024
                  ) {
                    toast.error("Hãy chọn tệp âm thanh tối đa 8MB.");
                    return;
                  }
                  recorder.setAudioFile(file);
                }}
              />
            </label>
          </div>
          {recorder.recordedUrl && (
            <audio controls src={recorder.recordedUrl} className="w-full" />
          )}
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
              recorder.isRecording ||
              (!recorder.recordedBlob && !result?.audio_url && !frozenAudio) ||
              (!!inputLocked && !sent && !result)
            }
            onClick={submit}
          >
            {busy
              ? "AI đang chấm bài nói…"
              : sent || result
              ? "Thử chấm lại bài đã nộp"
              : "Nộp bài nói để AI chấm"}
          </Button>
        </div>
      )}
      {graded && (
        <div className="space-y-4 rounded-2xl border border-emerald-500 p-5">
          <p className="font-semibold">
            Kết quả Speaking: {result?.final_score ?? result?.ai_score}/100
          </p>
          {result?.whisper_transcript && (
            <blockquote className="border-l-2 pl-3 text-sm italic">
              {result.whisper_transcript}
            </blockquote>
          )}
          <SkillEvaluationFeedback evaluation={result?.ai_evaluation} />
        </div>
      )}
    </section>
  );
}
