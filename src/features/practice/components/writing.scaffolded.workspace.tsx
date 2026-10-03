"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Sparkles,
  Send,
  HelpCircle,
  BookOpen,
  FileText,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/card";
import { Button } from "@/components/button";
import type {
  WritingExercise,
  WritingSubmission,
  ScaffoldTemplate,
  ScaffoldBlock,
} from "@/features/practice/types/writing";

export interface WritingScaffoldedWorkspaceProps {
  exercise: WritingExercise;
  parentSubmission: WritingSubmission;
  onBack: () => void;
  onSubmit: (
    blocks: Record<string, string>,
    assembledContent: string,
    wordCount: number,
    timeSpentSeconds: number
  ) => Promise<void>;
}

const DEFAULT_BLOCKS: ScaffoldBlock[] = [
  {
    key: "intro",
    title: "Introduction & Main Idea",
    title_vi: "Mở bài & Nêu quan điểm",
    prompt: "State your main position clearly and give a brief overview.",
    prompt_vi: "Nêu rõ quan điểm của bạn và giới thiệu ngắn gọn các ý chính.",
    guiding_questions: [
      "What is your direct answer to the question?",
      "Why do you take this stand?",
    ],
    sentence_starters: [
      "From my perspective,...",
      "It is believed that...",
      "I firmly agree that...",
    ],
    target_words: ["perspective", "crucial", "significant"],
    min_words: 25,
  },
  {
    key: "body_1",
    title: "Supporting Reason & Example",
    title_vi: "Thân bài: Luận điểm & Ví dụ",
    prompt:
      "Provide your primary explanation supported by a real-world example.",
    prompt_vi: "Đưa ra lý do chính đáng và kèm theo một ví dụ thực tế cụ thể.",
    guiding_questions: [
      "What is the most compelling reason?",
      "Can you give an example from daily life or news?",
    ],
    sentence_starters: [
      "First and foremost,...",
      "For example,...",
      "A typical instance is...",
    ],
    target_words: ["furthermore", "demonstrate", "consequence"],
    min_words: 45,
  },
  {
    key: "conclusion",
    title: "Conclusion & Summary",
    title_vi: "Kết luận & Tổng kết",
    prompt:
      "Restate your opinion in different words and give a concluding thought.",
    prompt_vi:
      "Khẳng định lại quan điểm bằng từ ngữ khác và đưa ra lời đúc kết.",
    guiding_questions: [
      "How can you summarize your position in one strong sentence?",
    ],
    sentence_starters: [
      "In conclusion,...",
      "To sum up,...",
      "All things considered,...",
    ],
    target_words: ["ultimately", "imperative"],
    min_words: 20,
  },
];

export function WritingScaffoldedWorkspace({
  exercise,
  parentSubmission,
  onBack,
  onSubmit,
}: WritingScaffoldedWorkspaceProps) {
  const { i18n } = useTranslation();
  const isVi = i18n.language === "vi";

  const template: ScaffoldTemplate = useMemo(() => {
    return (
      parentSubmission.ai_evaluation?.scaffold_template || {
        template_type: exercise.exercise_type,
        title: "Guided Rewrite Template",
        title_vi: "Khung hướng dẫn viết lại có định hướng",
        instruction:
          "Complete each guided block below to craft a superior V2 essay.",
        instruction_vi:
          "Hoàn thiện từng khối gợi ý dưới đây để tạo nên bài viết V2 hoàn chỉnh.",
        blocks: DEFAULT_BLOCKS,
      }
    );
  }, [parentSubmission, exercise]);

  const blocks: ScaffoldBlock[] =
    template.blocks && template.blocks.length > 0
      ? template.blocks
      : DEFAULT_BLOCKS;

  const [blockContents, setBlockContents] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      const rawBlocks = parentSubmission.scaffold_blocks;
      blocks.forEach((b: ScaffoldBlock) => {
        let content = "";
        if (Array.isArray(rawBlocks)) {
          const item = (rawBlocks as any[]).find(
            (sb: any) => sb.block_id === b.key || sb.title === b.title
          );
          content = item?.content || "";
        } else if (rawBlocks && typeof rawBlocks === "object") {
          content = (rawBlocks as Record<string, string>)[b.key] || "";
        }
        initial[b.key] = content;
      });
      return initial;
    }
  );

  const [activeBlockKey, setActiveBlockKey] = useState<string>(
    blocks[0]?.key || "intro"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [showV1Ref, setShowV1Ref] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleBlockChange = (key: string, value: string) => {
    setBlockContents((prev) => ({ ...prev, [key]: value }));
  };

  const handleInsertStarter = (key: string, starter: string) => {
    setBlockContents((prev) => {
      const current = prev[key] || "";
      const trimmed = current.trim();
      const newText = trimmed ? `${trimmed} ${starter} ` : `${starter} `;
      return { ...prev, [key]: newText };
    });
  };

  const assembledContent = useMemo(() => {
    return blocks
      .map((b: ScaffoldBlock) => (blockContents[b.key] || "").trim())
      .filter(Boolean)
      .join("\n\n");
  }, [blocks, blockContents]);

  const totalWords = useMemo(() => {
    if (!assembledContent.trim()) return 0;
    return assembledContent.trim().split(/\s+/).length;
  }, [assembledContent]);

  const handleSubmit = async () => {
    if (totalWords < 10) {
      alert(
        isVi
          ? "Vui lòng hoàn thành các khối để đạt ít nhất 10 từ trước khi nộp!"
          : "Please complete the blocks before submitting!"
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(
        blockContents,
        assembledContent,
        totalWords,
        timeSpentSeconds
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1.5 text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            {isVi ? "Quay lại" : "Back"}
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-300/40">
                <Sparkles className="h-3 w-3" />
                {isVi
                  ? "Viết lại có khung sườn (V2)"
                  : "Scaffolded Rewrite (V2)"}
              </span>
              <span className="text-xs text-text-tertiary">
                V1: {parentSubmission.overall_score || 0}đ
              </span>
            </div>
            <h1 className="text-lg font-bold text-text-primary mt-1">
              {exercise.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-surface-subtle px-3 py-1.5 rounded-lg border border-border">
            <Clock className="h-3.5 w-3.5 text-text-tertiary" />
            <span>{formatTimer(timeSpentSeconds)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-lg border border-indigo-200">
            <FileText className="h-3.5 w-3.5" />
            <span>
              {totalWords} {isVi ? "từ" : "words"}
            </span>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || totalWords < 10}
            className="gap-2 bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-700 hover:to-primary-hover text-white font-medium px-5 py-2 shadow-sm"
          >
            <Send className="h-4 w-4" />
            {isSubmitting
              ? isVi
                ? "Đang chấm điểm..."
                : "Submitting..."
              : isVi
              ? "Nộp bài V2"
              : "Submit V2"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 p-4">
            <h2 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
              {isVi ? template.title_vi || template.title : template.title}
            </h2>
            <p className="mt-1 text-xs text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
              {isVi
                ? template.instruction_vi || template.instruction
                : template.instruction}
            </p>
          </div>

          {blocks.map((block: ScaffoldBlock, idx: number) => {
            const isActive = activeBlockKey === block.key;
            const blockContent = blockContents[block.key] || "";
            const blockWords = blockContent.trim()
              ? blockContent.trim().split(/\s+/).length
              : 0;
            const isMet = block.min_words
              ? blockWords >= block.min_words
              : blockWords > 0;

            return (
              <Card
                key={block.key}
                className={`transition-all border-2 ${
                  isActive
                    ? "border-indigo-500 shadow-sm ring-2 ring-indigo-500/10"
                    : "border-border/80 hover:border-border"
                }`}
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer select-none bg-surface-subtle/40 rounded-t-xl"
                  onClick={() => setActiveBlockKey(isActive ? "" : block.key)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        isMet
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">
                        {isVi ? block.title_vi || block.title : block.title}
                      </h3>
                      <p className="text-xs text-text-tertiary">
                        {isVi ? block.prompt_vi || block.prompt : block.prompt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        isMet
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-surface text-text-tertiary border border-border"
                      }`}
                    >
                      {blockWords}/{block.min_words || 20}{" "}
                      {isVi ? "từ" : "words"}
                    </span>
                    {isActive ? (
                      <ChevronUp className="h-4 w-4 text-text-tertiary" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-text-tertiary" />
                    )}
                  </div>
                </div>

                {isActive && (
                  <CardContent className="p-4 pt-2 space-y-3">
                    {block.guiding_questions &&
                      block.guiding_questions.length > 0 && (
                        <div className="rounded-lg bg-surface-subtle p-3 border border-border/60">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary mb-1.5">
                            <HelpCircle className="h-3.5 w-3.5 text-indigo-600" />
                            <span>
                              {isVi
                                ? "Câu hỏi dẫn dắt ý:"
                                : "Guiding Questions:"}
                            </span>
                          </div>
                          <ul className="list-disc pl-4 space-y-1 text-xs text-text-secondary leading-relaxed">
                            {block.guiding_questions.map(
                              (q: string, qIdx: number) => (
                                <li key={qIdx}>{q}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    {block.sentence_starters &&
                      block.sentence_starters.length > 0 && (
                        <div>
                          <span className="text-[11px] font-semibold text-text-tertiary block mb-1.5 uppercase tracking-wider">
                            {isVi
                              ? "Mẫu câu gợi ý (bấm để chèn):"
                              : "Sentence Starters (click to insert):"}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {block.sentence_starters.map(
                              (starter: string, sIdx: number) => (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onClick={() =>
                                    handleInsertStarter(block.key, starter)
                                  }
                                  className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200 border border-indigo-200/80 px-2.5 py-1 rounded-md transition-colors text-left"
                                >
                                  + "{starter}"
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {block.target_words && block.target_words.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
                          {isVi ? "Từ vựng trọng tâm:" : "Target Words:"}
                        </span>
                        {block.target_words.map((w: string, wIdx: number) => {
                          const used = blockContent
                            .toLowerCase()
                            .includes(w.toLowerCase());
                          return (
                            <span
                              key={wIdx}
                              className={`text-xs px-2 py-0.5 rounded border font-medium ${
                                used
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-surface text-text-secondary border-border"
                              }`}
                            >
                              {w} {used && "✓"}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="relative pt-1">
                      <textarea
                        value={blockContent}
                        onChange={(e) =>
                          handleBlockChange(block.key, e.target.value)
                        }
                        placeholder={
                          isVi
                            ? `Viết nội dung cho phần "${
                                block.title_vi || block.title
                              }" tại đây...`
                            : `Write for "${block.title}" here...`
                        }
                        rows={5}
                        className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed transition-all"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-5 space-y-4">
          <Card className="border border-border/80 bg-surface">
            <div
              className="flex items-center justify-between p-4 cursor-pointer select-none"
              onClick={() => setShowV1Ref(!showV1Ref)}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-text-primary">
                  {isVi
                    ? "Bài viết ban đầu của bạn (V1)"
                    : "Your Original Submission (V1)"}
                </h3>
              </div>
              {showV1Ref ? (
                <ChevronUp className="h-4 w-4 text-text-tertiary" />
              ) : (
                <ChevronDown className="h-4 w-4 text-text-tertiary" />
              )}
            </div>

            {showV1Ref && (
              <CardContent className="p-4 pt-0">
                <div className="rounded-lg bg-surface-subtle p-3 border border-border/60 text-xs text-text-secondary leading-relaxed max-h-52 overflow-y-auto whitespace-pre-wrap">
                  {parentSubmission.content ||
                    (isVi ? "(Chưa có nội dung)" : "(No content)")}
                </div>

                {parentSubmission.ai_evaluation?.weaknesses &&
                  parentSubmission.ai_evaluation.weaknesses.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/60">
                      <span className="text-[11px] font-bold text-rose-600 block mb-1">
                        {isVi
                          ? "Điểm yếu AI đã chỉ ra ở V1:"
                          : "AI Weaknesses noted in V1:"}
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-text-secondary">
                        {parentSubmission.ai_evaluation.weaknesses.map(
                          (w: string, idx: number) => (
                            <li key={idx}>{w}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </CardContent>
            )}
          </Card>

          <Card className="border border-border/80 bg-surface sticky top-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-text-primary">
                    {isVi
                      ? "Xem trước toàn bộ bài viết V2"
                      : "Assembled V2 Preview"}
                  </h3>
                </div>
                <span className="text-xs text-text-tertiary">
                  {totalWords} {isVi ? "từ" : "words"}
                </span>
              </div>

              <div className="rounded-lg bg-surface-subtle/50 p-4 border border-border/60 text-xs text-text-primary leading-relaxed min-h-60 max-h-80 overflow-y-auto whitespace-pre-wrap font-sans">
                {assembledContent || (
                  <span className="text-text-tertiary italic">
                    {isVi
                      ? "Nội dung các khối sẽ tự động nối lại thành bài viết hoàn chỉnh tại đây khi bạn nhập..."
                      : "Content from all blocks will assemble here in real-time..."}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
