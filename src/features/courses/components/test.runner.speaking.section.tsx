// Giao diện ghi âm và nộp bài thi nói trong khóa học.
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { CustomAudioPlayer } from "@/components/custom.audio.player";
import { Mic, Square, RotateCcw } from "lucide-react";
import { useSpeakingRecorder } from "@/features/practice/hooks/use.speaking.recorder";
import {
  courseService,
  type SpeakingSubmissionResponse,
} from "@/features/courses/services/course.service";
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
          {recorder.isRecording ? (
            <div className="relative p-5 rounded-xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white overflow-hidden space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span>ĐANG GHI ÂM</span>
                </div>
                <div className="font-mono text-base font-bold text-emerald-400">
                  {Math.floor(recorder.recordingSeconds / 60)}:{String(recorder.recordingSeconds % 60).padStart(2, "0")}s
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 h-12">
                {[18, 36, 60, 80, 100, 75, 90, 65, 85, 50, 70, 40, 25].map((base, idx) => {
                  const dynamicHeight = Math.max(
                    15,
                    Math.min(100, Math.round(base * 0.35 + (recorder.micVolume / 100) * base * 0.8))
                  );
                  return (
                    <span
                      key={idx}
                      style={{ height: `${dynamicHeight}%` }}
                      className="w-1.5 rounded-full bg-gradient-to-t from-emerald-600 via-emerald-400 to-teal-200 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-3 pt-1">
                <Button
                  type="button"
                  onClick={() => recorder.stopRecording()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 text-xs rounded-xl px-5 h-10 shadow-lg cursor-pointer"
                >
                  <Square size={13} className="fill-white" />
                  Dừng & Lưu bản thu âm
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => recorder.resetRecording()}
                  className="text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs rounded-xl h-10 px-3 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  Hủy
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                disabled={locked}
                onClick={() => recorder.startRecording()}
                className="bg-primary hover:bg-primary-hover text-white font-bold gap-2 text-xs rounded-xl px-5 h-10 shadow cursor-pointer"
              >
                <Mic size={14} />
                Bắt đầu ghi âm
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
          )}
          {recorder.recordedUrl && (
            <CustomAudioPlayer
              src={recorder.recordedUrl}
              title="Nghe lại bản thu âm của bạn"
            />
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
