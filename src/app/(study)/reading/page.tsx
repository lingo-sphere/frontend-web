/**
 * @file page.tsx
 * @description Màn hình chính Reading Practice với 4 Sub-Tabs & Chế độ luyện tập 2 bên (Split Screen)
 */

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/icon.map";
import { Button } from "@/components/button";
import { Card, CardContent } from "@/components/card";
import { ReadingContextNavigation } from "@/features/practice/components/reading.context.navigation";
import { ReadingWorkspace } from "@/features/practice/components/reading.workspace";
import { ReadingTimeModeSelector } from "@/features/practice/components/reading.time-mode-selector";
import { readingPracticeService } from "@/features/practice/services/reading-practice.service";
import type {
  ReadingPassage,
  ReadingType,
  TimerPresetMode,
} from "@/features/practice/types/reading";

const TABS: Array<{
  id: ReadingType;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    id: "PART_6",
    label: "TOEIC Part 6",
    icon: "file-text",
    description:
      "Điền từ, cụm từ hoặc cả câu hoàn chỉnh vào các vị trí đục lỗ [1], [2], [3] trong đoạn văn",
  },
  {
    id: "PART_7",
    label: "TOEIC Part 7",
    icon: "book-open",
    description:
      "Đọc hiểu tài liệu thực tế (Email, Notice, Article, Advertisement, Schedule...)",
  },
  {
    id: "REAL_WORLD_TASK",
    label: "Real-World Task",
    icon: "target",
    description:
      "Đọc và lọc thông tin từ bộ thẻ dữ liệu thực tế để hoàn thành kịch bản nhiệm vụ",
  },
  {
    id: "INFO_MATCHING",
    label: "Information Matching",
    icon: "puzzle",
    description:
      "Đọc 4-5 đoạn thông tin ngắn [A], [B], [C], [D] và ghép phát biểu tương ứng",
  },
];

export default function ReadingPracticePage() {
  const [activeTab, setActiveTab] = useState<ReadingType>("PART_7");
  const [selectedContextId, setSelectedContextId] = useState<string | null>(
    null
  );
  const [selectedPassageId, setSelectedPassageId] = useState<string | null>(
    null
  );
  const [pendingPassage, setPendingPassage] = useState<ReadingPassage | null>(
    null
  );
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number>(0);

  // Fetch list of passages for active tab
  const { data: passagesData, isLoading } = useQuery({
    queryKey: ["reading-passages", activeTab, selectedContextId],
    queryFn: () =>
      readingPracticeService.getPassages({
        reading_type: activeTab,
        context_id: selectedContextId || undefined,
        limit: 20,
      }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch detailed passage when selected
  const { data: detailedPassage, isLoading: isLoadingPassage } = useQuery({
    queryKey: ["reading-passage-detail", selectedPassageId],
    queryFn: () => readingPracticeService.getPassageById(selectedPassageId!),
    enabled: Boolean(selectedPassageId),
  });

  // If a passage is selected for practice with time limit, render ReadingWorkspace
  if (selectedPassageId && detailedPassage && timeLimitSeconds > 0) {
    return (
      <ReadingWorkspace
        passage={detailedPassage}
        timeLimitSeconds={timeLimitSeconds}
        onBack={() => {
          setSelectedPassageId(null);
          setTimeLimitSeconds(0);
        }}
        onComplete={() => {
          setSelectedPassageId(null);
          setTimeLimitSeconds(0);
        }}
      />
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-6 max-w-7xl">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-primary p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Icon name="book-open" size={14} />
            <span>Phân hệ Luyện Đọc Đa Dạng (Reading Practice)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Rèn Luyện Kỹ Năng Đọc Thực Tế & TOEIC
          </h1>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Thực hành đọc hiểu tài liệu thực tế, giải quyết nhiệm vụ, và canh
            thời gian chuẩn thi bài làm TOEIC Part 6 & Part 7 với giao diện 2
            bên chuyên nghiệp.
          </p>
        </div>

        {/* Decorative Background Icons */}
        <Icon
          name="book-open"
          size={180}
          className="absolute -right-8 -bottom-12 opacity-10 text-white pointer-events-none"
        />
      </div>

      {/* 4 Main Sub-Tabs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedContextId(null);
              }}
              className={`flex flex-col items-start gap-2 rounded-2xl p-4 text-left transition-all ${
                isActive
                  ? "bg-primary text-white shadow-lg ring-2 ring-primary/40"
                  : "bg-surface border border-border/50 text-text-secondary hover:border-primary/40 hover:bg-surface-hover"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-primary/10 text-primary"
                }`}
              >
                <Icon name={tab.icon} size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">{tab.label}</h3>
                <p
                  className={`mt-1 text-[11px] line-clamp-2 leading-relaxed ${
                    isActive ? "text-white/80" : "text-text-tertiary"
                  }`}
                >
                  {tab.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Context Filter for Task-Based and Information Matching */}
      {(activeTab === "REAL_WORLD_TASK" || activeTab === "INFO_MATCHING") && (
        <ReadingContextNavigation
          selectedContextId={selectedContextId}
          onSelectContext={(contextId) => setSelectedContextId(contextId)}
        />
      )}

      {/* Passages List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Icon name="layers" size={18} className="text-primary" />
            <span>
              Danh Sách Bài Đọc ({passagesData?.passages.length || 0})
            </span>
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Icon
              name="loader"
              className="animate-spin text-primary"
              size={24}
            />
            <span className="ml-3 text-xs text-text-tertiary">
              Đang tải danh sách bài đọc...
            </span>
          </div>
        ) : passagesData?.passages && passagesData.passages.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {passagesData.passages.map((passage: ReadingPassage) => (
              <Card
                key={passage._id || passage.id}
                className="group relative flex flex-col justify-between overflow-hidden border-border/60 bg-surface hover:border-primary/50 hover:shadow-md transition-all"
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      {passage.cefr_level || "B1"}
                    </span>
                    <span className="text-[11px] font-medium text-text-tertiary flex items-center gap-1">
                      <Icon name="clock" size={12} />
                      {passage.estimated_reading_time_minutes || 5} phút
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                      {passage.title_vi || passage.title}
                    </h3>
                    <p className="mt-1 text-xs text-text-tertiary line-clamp-2 leading-relaxed">
                      {passage.content_summary ||
                        passage.content.substring(0, 100) + "..."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs text-text-tertiary">
                    <span>{passage.word_count || 0} từ</span>
                    <span>{passage.questions?.length || 4} câu hỏi</span>
                  </div>

                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setPendingPassage(passage);
                    }}
                    className="w-full justify-center gap-1.5 text-xs font-semibold"
                  >
                    <span>Luyện tập ngay</span>
                    <Icon name="arrow-right" size={14} />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon name="book-open" size={24} />
            </div>
            <h3 className="text-sm font-bold text-text-primary">
              Chưa có bài đọc nào trong mục này
            </h3>
            <p className="text-xs text-text-tertiary max-w-sm mx-auto">
              Hệ thống sẽ cập nhật thêm các bài đọc mới theo chuẩn CEFR và chủ
              đề ngữ cảnh trong thời gian tới.
            </p>
          </div>
        )}
      </div>

      {/* Time Mode Selector Modal */}
      {pendingPassage && (
        <ReadingTimeModeSelector
          questionCount={pendingPassage.questions?.length || 4}
          onSelect={(mode, totalSeconds) => {
            setTimeLimitSeconds(totalSeconds);
            setSelectedPassageId(
              pendingPassage._id || pendingPassage.id || null
            );
            setPendingPassage(null);
          }}
          onCancel={() => setPendingPassage(null)}
        />
      )}
    </div>
  );
}
