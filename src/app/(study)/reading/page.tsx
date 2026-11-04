// Màn hình chính phân hệ Reading Practice với 4 danh mục phụ và danh sách bài đọc.
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/icon.map";
import { ReadingContextNavigation } from "@/features/practice/components/reading.context.navigation";
import { ReadingWorkspace } from "@/features/practice/components/reading.workspace";
import { ReadingTimeModeSelector } from "@/features/practice/components/reading.time-mode-selector";
import { ReadingPassageCard } from "@/features/practice/components/reading.passage.card";
import { readingPracticeService } from "@/features/practice/services/reading-practice.service";
import type {
  ReadingPassage,
  ReadingType,
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

  const { data: detailedPassage } = useQuery({
    queryKey: ["reading-passage-detail", selectedPassageId],
    queryFn: () => readingPracticeService.getPassageById(selectedPassageId!),
    enabled: Boolean(selectedPassageId),
  });

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
    <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 space-y-6">
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

        <Icon
          name="book-open"
          size={180}
          className="absolute -right-8 -bottom-12 opacity-10 text-white pointer-events-none"
        />
      </div>

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

      {(activeTab === "REAL_WORLD_TASK" || activeTab === "INFO_MATCHING") && (
        <ReadingContextNavigation
          selectedContextId={selectedContextId}
          onSelectContext={(contextId) => setSelectedContextId(contextId)}
        />
      )}

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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {passagesData.passages.map((passage: ReadingPassage) => (
              <ReadingPassageCard
                key={passage._id || passage.id}
                passage={passage}
                onStartPractice={(selected) => setPendingPassage(selected)}
              />
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

      {pendingPassage && (
        <ReadingTimeModeSelector
          questionCount={pendingPassage.questions?.length || 4}
          onSelect={(_mode, totalSeconds) => {
            setTimeLimitSeconds(totalSeconds);
            setSelectedPassageId(
              pendingPassage._id || pendingPassage.id || null
            );
            setPendingPassage(null);
          }}
          onCancel={() => setPendingPassage(null)}
        />
      )}
    </main>
  );
}
