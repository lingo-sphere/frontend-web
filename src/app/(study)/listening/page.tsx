/**
 * @file page.tsx
 * @description Trung tâm luyện nghe: Part 1–4 và Dictation, lọc Context dùng chung
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { SectionHeading } from "@/features/dashboard/components/section.heading";
import { Button } from "@/components/button";
import { Card, CardContent } from "@/components/card";
import { Icon } from "@/components/icon.map";
import { Pagination } from "@/components/pagination";
import { ListeningContextFilter } from "@/features/practice/components/listening.context.filter";
import { LISTENING_SUBTYPES, readListeningCatalog, listeningCatalogParams, type ListeningCatalogState } from "@/features/practice/utils/listening.catalog";
import { ListeningPracticeWorkspace } from "@/features/practice/components/listening.practice.workspace";
import { listeningLifecycleService } from "@/features/practice/services/listening-lifecycle.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { ListeningKind } from "@/features/practice/types/listening-lifecycle";
import { listeningPracticeService } from "@/features/practice/services/listening-practice.service";
import { resolveImageUrl } from "@/utils/media.utils";
import type {
  Part1Item,
  Part2Item,
  Part3Item,
  Part4Item,
  DictationItem,
  ListeningTabType,
} from "@/features/practice/types/listening-practice";

type TabId = ListeningTabType;

interface TabItem {
  id: TabId;
  labelEn: string;
  labelVi: string;
  badge: string;
  icon: string;
  descEn: string;
  descVi: string;
}

const TABS: TabItem[] = [
  {
    id: "PART_1",
    labelEn: "Part 1: Photographs",
    labelVi: "Part 1: Mô tả hình ảnh",
    badge: "TOEIC",
    icon: "camera",
    descEn: "Listen to 4 statements about a photograph and choose the best description.",
    descVi: "Nghe 4 câu mô tả bức tranh và chọn câu miêu tả chân thực, chính xác nhất.",
  },
  {
    id: "PART_2",
    labelEn: "Part 2: Question & Response",
    labelVi: "Part 2: Hỏi & Đáp",
    badge: "TOEIC",
    icon: "messageSquare",
    descEn: "Listen to a question or statement and pick the most appropriate of 3 responses.",
    descVi: "Nghe 1 câu hỏi hoặc phát biểu và chọn câu phản hồi hợp lý nhất trong 3 đáp án (A, B, C).",
  },
  {
    id: "PART_3",
    labelEn: "Part 3: Conversations",
    labelVi: "Part 3: Hội thoại ngắn",
    badge: "TOEIC",
    icon: "users",
    descEn: "Listen to short dialogue between 2-3 speakers and answer 3 comprehension questions.",
    descVi: "Nghe đoạn đối thoại giữa 2 hoặc 3 người và trả lời chùm 3 câu hỏi trắc nghiệm.",
  },
  {
    id: "PART_4",
    labelEn: "Part 4: Short Talks",
    labelVi: "Part 4: Bài nói ngắn",
    badge: "TOEIC",
    icon: "mic",
    descEn: "Listen to a short monologue (announcement, news, speech) and answer 3 questions.",
    descVi: "Nghe một bài nói đơn (thông báo, bản tin, bài diễn văn...) và trả lời 3 câu hỏi trắc nghiệm.",
  },
  {
    id: "DICTATION",
    labelEn: "Dictation Practice",
    labelVi: "Nghe chép chính tả",
    badge: "Skill",
    icon: "pencil",
    descEn: "Listen segment by segment, fill in blanks and train intensive listening precision.",
    descVi: "Luyện nghe chép chính tả phân đoạn, điền từ vào chỗ trống và tăng độ nhạy âm thanh.",
  },

];

const ITEMS_PER_PAGE = 9;

type ActiveWorkspace =
  | { type: "PART_1"; item?: Part1Item }
  | { type: "PART_2"; item?: Part2Item }
  | { type: "PART_3"; item?: Part3Item }
  | { type: "PART_4"; item?: Part4Item }
  | { type: "DICTATION"; item: DictationItem }
  | null;

export default function ListeningAppPage() {
  const { i18n } = useTranslation();
  const searchParams = useSearchParams();
  const isVietnamese = i18n.language === "vi";

  const catalog = readListeningCatalog(new URLSearchParams(searchParams.toString()));
  const { tab: activeTab, context: selectedContextId, page, difficulty: difficultyFilter, cefr: cefrFilter, subtype: subTypeFilter } = catalog;
  const [activeWorkspace, setActiveWorkspace] = useState<ActiveWorkspace>(null);
  const userId = useAuthStore(state => state.user?.user_id);
  const pending = useQuery({ queryKey: ['listening-pending', userId], queryFn: listeningLifecycleService.pending, enabled: Boolean(userId) });
  const resumeId = searchParams.get('session_id') || undefined;
  const [showAllPending, setShowAllPending] = useState(false);
  const isSetup = searchParams.get('practice') === '1';
  const setupExerciseId = searchParams.get('exercise_id') || undefined;
  const refetchPending = pending.refetch;
  useEffect(() => { if (userId && !resumeId && !isSetup) void refetchPending(); }, [userId, resumeId, isSetup, refetchPending]);
  const openWorkspace = (workspace: NonNullable<ActiveWorkspace>) => {
    setActiveWorkspace(workspace);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', workspace.type); params.set('practice', '1'); params.delete('session_id');
    if (workspace.item?._id) params.set('exercise_id', workspace.item._id); else params.delete('exercise_id');
    window.history.pushState(null, '', `${window.location.pathname}?${params}`);
  };



  const updateCatalog = (patch: Partial<ListeningCatalogState>) => {
    const next = listeningCatalogParams(new URLSearchParams(window.location.search), patch);
    window.history.pushState(null, "", `${window.location.pathname}?${next}${window.location.hash}`);
  };
  const setPage = (next: number) => updateCatalog({ page: next });
  const setDifficultyFilter = (difficulty: string) => updateCatalog({ difficulty, page: 1 });
  const setCefrFilter = (cefr: string) => updateCatalog({ cefr, page: 1 });
  const setSubTypeFilter = (subtype: string) => updateCatalog({ subtype, page: 1 });

  // Old topic/mistake links enter the same catalog; they no longer start a duplicate session.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (["part", "exercise_type", "topic_name"].some(key => params.has(key)) || params.get("tab")?.toUpperCase() === "TOPIC") {
      const canonical = listeningCatalogParams(params, {});
      window.history.replaceState(null, "", `${window.location.pathname}?${canonical}${window.location.hash}`);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabId) => updateCatalog({ tab, subtype: "ALL", page: 1 });

  // Build query filter params
  const queryParams = {
    page,
    limit: ITEMS_PER_PAGE,
    ...(selectedContextId ? { context_id: selectedContextId } : {}),
    ...(difficultyFilter !== "ALL" ? { difficulty: difficultyFilter } : {}),
    ...(cefrFilter !== "ALL" ? { cefr_level: cefrFilter } : {}),
    ...(subTypeFilter !== "ALL"
      ? activeTab === "PART_1"
        ? { picture_type: subTypeFilter }
        : activeTab === "PART_2"
        ? { question_type: subTypeFilter }
        : activeTab === "PART_3"
        ? { conversation_type: subTypeFilter }
        : activeTab === "PART_4"
        ? { talk_type: subTypeFilter }
        : {}
      : {}),
  };

  // Data fetching based on activeTab
  const {
    data: part1Data,
    isLoading: isPart1Loading,
    isError: isPart1Error,
    refetch: refetchPart1,
  } = useQuery({
    queryKey: ["listening-part1", queryParams],
    queryFn: () => listeningPracticeService.getPart1Questions(queryParams),
    enabled: activeTab === "PART_1",
    staleTime: 60 * 1000,
  });

  const {
    data: part2Data,
    isLoading: isPart2Loading,
    isError: isPart2Error,
    refetch: refetchPart2,
  } = useQuery({
    queryKey: ["listening-part2", queryParams],
    queryFn: () => listeningPracticeService.getPart2Questions(queryParams),
    enabled: activeTab === "PART_2",
    staleTime: 60 * 1000,
  });

  const {
    data: part3Data,
    isLoading: isPart3Loading,
    isError: isPart3Error,
    refetch: refetchPart3,
  } = useQuery({
    queryKey: ["listening-part3", queryParams],
    queryFn: () => listeningPracticeService.getPart3Conversations(queryParams),
    enabled: activeTab === "PART_3",
    staleTime: 60 * 1000,
  });

  const {
    data: part4Data,
    isLoading: isPart4Loading,
    isError: isPart4Error,
    refetch: refetchPart4,
  } = useQuery({
    queryKey: ["listening-part4", queryParams],
    queryFn: () => listeningPracticeService.getPart4Talks(queryParams),
    enabled: activeTab === "PART_4",
    staleTime: 60 * 1000,
  });

  const {
    data: dictationData,
    isLoading: isDictationLoading,
    isError: isDictationError,
    refetch: refetchDictation,
  } = useQuery({
    queryKey: ["listening-dictation", queryParams],
    queryFn: () => listeningPracticeService.getDictationExercises(queryParams),
    enabled: activeTab === "DICTATION",
    staleTime: 60 * 1000,
  });

  // Current active data and pagination
  const currentLoading =
    activeTab === "PART_1"
      ? isPart1Loading
      : activeTab === "PART_2"
      ? isPart2Loading
      : activeTab === "PART_3"
      ? isPart3Loading
      : activeTab === "PART_4"
      ? isPart4Loading
      : activeTab === "DICTATION"
      ? isDictationLoading
      : false;

  const currentPagination =
    activeTab === "PART_1"
      ? part1Data?.pagination
      : activeTab === "PART_2"
      ? part2Data?.pagination
      : activeTab === "PART_3"
      ? part3Data?.pagination
      : activeTab === "PART_4"
      ? part4Data?.pagination
      : activeTab === "DICTATION"
      ? dictationData?.pagination
      : null;

  const currentError = activeTab === "PART_1" ? isPart1Error
    : activeTab === "PART_2" ? isPart2Error : activeTab === "PART_3" ? isPart3Error
    : activeTab === "PART_4" ? isPart4Error : isDictationError;
  const retryCurrent = () => {
    const retry = { PART_1: refetchPart1, PART_2: refetchPart2, PART_3: refetchPart3, PART_4: refetchPart4, DICTATION: refetchDictation };
    void retry[activeTab]();
  };
  const handleClearFilters = () => updateCatalog({ context: "", difficulty: "ALL", cefr: "ALL", subtype: "ALL", page: 1 });
  const hasActiveFilters = difficultyFilter !== "ALL" || cefrFilter !== "ALL" || subTypeFilter !== "ALL" || Boolean(selectedContextId);

  // ---------------------------------------------------------------------------
  // RENDER WORKSPACE VIEWS IF SELECTED
  // ---------------------------------------------------------------------------
  if (isSetup || resumeId) {
    const tab = activeTab;
    const kind = tab === "DICTATION" ? "dictation" : tab.toLowerCase().replace('_', '') as ListeningKind;
    const item = !resumeId && activeWorkspace?.type === activeTab && activeWorkspace.item?._id === setupExerciseId ? activeWorkspace.item : undefined;
    const close = () => {
      setActiveWorkspace(null);
      const params = new URLSearchParams(window.location.search); params.delete('session_id'); params.delete('practice'); params.delete('exercise_id');
      window.history.replaceState(null, '', `${window.location.pathname}?${params}`);
      void pending.refetch();
    };
    return <ListeningPracticeWorkspace
      key={`${userId || "guest"}:${kind}`}
      kind={kind}
      exerciseId={setupExerciseId}
      resumeId={resumeId}
      title={item ? (isVietnamese ? item.title_vi || item.title : item.title) : undefined}
      filters={{ context_id: selectedContextId || undefined, difficulty: difficultyFilter === "ALL" ? undefined : difficultyFilter, cefr_level: cefrFilter === "ALL" ? undefined : cefrFilter, subtype: subTypeFilter === "ALL" ? undefined : subTypeFilter }}
      onStarted={id => { const params = new URLSearchParams(window.location.search); params.set('session_id', id); params.set('tab', tab); params.delete('practice'); params.delete('exercise_id'); window.history.replaceState(null, '', `${window.location.pathname}?${params}`); }}
      onBack={close}
    />;
  }

  const categoryName = (tab: TabId, value?: string) => {
    const item = LISTENING_SUBTYPES[tab].find(option => option.value === value);
    return item ? (isVietnamese ? item.vi : item.en) : (isVietnamese ? "Chưa phân loại" : "Uncategorized");
  };

  // Active Tab Info
  const currentTabInfo = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header Heading */}
      <SectionHeading
        eyebrow={isVietnamese ? "Luyện nghe" : "Listening practice"}
        title={
          isVietnamese
            ? "Trung tâm luyện nghe tiếng Anh"
            : "Listening Practice Hub"
        }
        description={
          isVietnamese
            ? "Luyện TOEIC Part 1–4 và nghe chép chính tả. Chọn chủ đề để luyện theo ngữ cảnh trong từng dạng bài."
            : "Practice TOEIC Parts 1–4 and dictation. Filter by topic to practice real-life contexts in each section."
        }
      />

      {userId && pending.isError && <div role="alert" className="rounded-xl border border-border p-4 text-sm">{isVietnamese ? "Không tải được phiên đang làm." : "Could not load unfinished sessions."} <Button variant="ghost" size="sm" onClick={() => void pending.refetch()}>{isVietnamese ? "Thử lại phiên đang làm" : "Retry unfinished sessions"}</Button></div>}
      {Array.isArray(pending.data) && pending.data.length > 0 && <section aria-label={isVietnamese ? "Phiên đang làm" : "Unfinished sessions"} className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <h2 className="font-semibold text-text-primary">{isVietnamese ? "Tiếp tục phiên đang làm" : "Continue unfinished practice"}</h2>
        <div className="flex flex-wrap gap-2">{pending.data.slice(0, showAllPending ? undefined : 5).map(row => <Button key={`${row.kind}:${row.session_id}`} variant="outline" size="sm" onClick={() => {
          const params = new URLSearchParams(window.location.search);
          params.set('tab', row.kind === 'dictation' ? 'DICTATION' : row.kind.replace('part', 'PART_'));
          params.set('session_id', row.session_id); params.delete('subtype'); params.delete('page'); params.delete('practice'); params.delete('exercise_id');
          window.history.pushState(null, '', `${window.location.pathname}?${params}`);
        }}>{row.title} · {row.answered}/{row.total} · {new Date(row.updated_at).toLocaleDateString(isVietnamese ? "vi-VN" : "en-US")}</Button>)}</div>
        {pending.data.length > 5 && <Button size="sm" variant="ghost" onClick={() => setShowAllPending(!showAllPending)}>{showAllPending ? (isVietnamese ? "Thu gọn" : "Show fewer") : (isVietnamese ? `Xem thêm ${pending.data.length - 5} phiên` : `Show ${pending.data.length - 5} more sessions`)}</Button>}
      </section>}

      {/* Modern Tabs Navigation Bar */}
      <div className="border-b border-border">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                aria-pressed={isActive}
                onClick={() => handleTabChange(tab.id)}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-subtle text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span>{isVietnamese ? tab.labelVi : tab.labelEn}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-border text-text-tertiary"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Context Description Banner */}
      <div className="flex items-center gap-3 rounded-2xl bg-surface-subtle border border-border px-4 py-3 text-sm text-text-secondary">
        <Icon name="lightbulb" size={18} className="text-primary shrink-0" />
        <span className="leading-relaxed">
          {isVietnamese ? currentTabInfo.descVi : currentTabInfo.descEn}
        </span>
      </div>

        <div className="space-y-6">
          {/* Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <ListeningContextFilter
                value={selectedContextId}
                onChange={context => updateCatalog({ context, page: 1 })}
                isVietnamese={isVietnamese}
              />

              {/* Difficulty Filter */}
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <span className="font-medium">
                  {isVietnamese ? "Độ khó:" : "Difficulty:"}
                </span>
                <select
                  aria-label={isVietnamese ? "Độ khó" : "Difficulty"}
                  value={difficultyFilter}
                  onChange={(e) => {
                    setDifficultyFilter(e.target.value);
                  }}
                  className="rounded-lg border border-border bg-surface-subtle px-2.5 py-1.5 text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL">
                    {isVietnamese ? "Tất cả độ khó" : "All Difficulties"}
                  </option>
                  <option value="EASY">
                    {isVietnamese ? "Dễ" : "Easy"}
                  </option>
                  <option value="MEDIUM">
                    {isVietnamese ? "Trung bình" : "Medium"}
                  </option>
                  <option value="HARD">
                    {isVietnamese ? "Khó" : "Hard"}
                  </option>
                </select>
              </div>

              {/* CEFR Level Filter */}
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <span className="font-medium">CEFR:</span>
                <select
                  aria-label="CEFR"
                  value={cefrFilter}
                  onChange={(e) => {
                    setCefrFilter(e.target.value);
                  }}
                  className="rounded-lg border border-border bg-surface-subtle px-2.5 py-1.5 text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL">
                    {isVietnamese ? "Tất cả cấp độ" : "All Levels"}
                  </option>
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                </select>
              </div>

              {LISTENING_SUBTYPES[activeTab].length > 0 && (
                <label className="flex items-center gap-2 text-xs text-text-secondary">
                  <span className="font-medium">{isVietnamese ? "Phân loại:" : "Category:"}</span>
                  <select
                    aria-label={isVietnamese ? "Phân loại" : "Category"}
                    value={subTypeFilter}
                    onChange={event => setSubTypeFilter(event.target.value)}
                    className="rounded-lg border border-border bg-surface-subtle px-2.5 py-1.5 text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="ALL">{isVietnamese ? "Tất cả phân loại" : "All categories"}</option>
                    {LISTENING_SUBTYPES[activeTab].map(item => (
                      <option key={item.value} value={item.value}>{isVietnamese ? item.vi : item.en}</option>
                    ))}
                  </select>
                </label>
              )}

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs text-rose-500 hover:text-rose-600 gap-1 h-8 px-2"
                >
                  <Icon name="x" size={14} />
                  {isVietnamese ? "Xóa bộ lọc" : "Clear filters"}
                </Button>
              )}
            </div>

            {activeTab !== "DICTATION" && (
              <Button size="sm" disabled={currentLoading || currentError || !currentPagination?.total} onClick={() => openWorkspace({ type: activeTab as "PART_1" | "PART_2" | "PART_3" | "PART_4" })}>
                {isVietnamese ? `Luyện ngẫu nhiên ${activeTab.replace("PART_", "Part ")}` : `Random ${activeTab.replace("PART_", "Part ")} practice`}
              </Button>
            )}
            {/* Total items indicator */}
            {currentPagination && (
              <div className="text-xs font-medium text-text-tertiary">
                {isVietnamese
                  ? `Tổng cộng: ${currentPagination.total} bài tập`
                  : `Total: ${currentPagination.total} exercises`}
              </div>
            )}
          </div>

          {/* Loading Skeleton */}
          {currentError ? (
            <div role="alert" className="rounded-2xl border border-border bg-card p-8 text-center space-y-3">
              <p className="text-text-secondary">{isVietnamese ? "Không tải được bài tập. Bộ lọc của bạn vẫn được giữ." : "Could not load exercises. Your filters have been kept."}</p>
              <Button variant="outline" onClick={retryCurrent}>{isVietnamese ? "Thử lại" : "Retry"}</Button>
            </div>
          ) : currentLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Card key={idx} className="dashboard-card animate-pulse">
                  <div className="h-44 bg-surface-subtle rounded-t-xl" />
                  <CardContent className="p-5 space-y-3">
                    <div className="h-4 bg-surface-subtle rounded w-3/4" />
                    <div className="h-3 bg-surface-subtle rounded w-1/2" />
                    <div className="h-8 bg-surface-subtle rounded w-full mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Render Exercise Grid based on Active Tab */
            <>
              {/* ==================== PART 1: PHOTOGRAPHS ==================== */}
              {activeTab === "PART_1" && (
                <>
                  {!part1Data?.items?.length ? (
                    <EmptyState
                      isVietnamese={isVietnamese}
                      onReset={handleClearFilters}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {part1Data.items.map((item) => (
                        <Card
                          key={item._id}
                          className="dashboard-card group overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
                        >
                          <div>
                            {/* Image Preview */}
                            <div className="relative h-48 w-full bg-surface-subtle overflow-hidden">
                              <ListeningPicture imageKey={item.image_url} title={item.title || "Part 1"} isVietnamese={isVietnamese} />
                              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                                <span className="rounded-full bg-primary/90 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                                  Part 1
                                </span>
                                <span className="rounded-full bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium text-white">
                                  {categoryName("PART_1", item.picture_type)}
                                </span>
                              </div>
                              <div className="absolute bottom-2.5 right-2.5">
                                <span className="rounded-full bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-white">
                                  {item.cefr_level || "A2"} • {item.difficulty_level || "EASY"}
                                </span>
                              </div>
                            </div>

                            <CardContent className="p-4 space-y-2">
                              <h3 className="font-bold text-sm text-text-primary line-clamp-1">
                                {isVietnamese && item.title_vi
                                  ? item.title_vi
                                  : item.title || "Bài mô tả tranh Part 1"}
                              </h3>
                              <p className="text-xs text-text-tertiary">
                                {isVietnamese
                                  ? "Nghe 4 lựa chọn A, B, C, D để chọn đáp án đúng"
                                  : "Listen to 4 options (A, B, C, D) to find the answer"}
                              </p>
                            </CardContent>
                          </div>

                          <div className="p-4 pt-0">
                            <Button
                              onClick={() =>
                                openWorkspace({ type: "PART_1", item })
                              }
                              className="w-full gap-2"
                              size="sm"
                            >
                              <Icon name="play" size={14} />
                              {isVietnamese ? "Luyện tập ngay" : "Practice Now"}
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ==================== PART 2: QUESTION & RESPONSE ==================== */}
              {activeTab === "PART_2" && (
                <>
                  {!part2Data?.items?.length ? (
                    <EmptyState
                      isVietnamese={isVietnamese}
                      onReset={handleClearFilters}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {part2Data.items.map((item) => (
                        <Card
                          key={item._id}
                          className="dashboard-card group flex flex-col justify-between hover:shadow-md transition-all"
                        >
                          <CardContent className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                Part 2 • {categoryName("PART_2", item.question_type)}
                              </span>
                              <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                                {item.cefr_level || "A2"} • {item.difficulty_level || "EASY"}
                              </span>
                            </div>

                            <div className="rounded-xl bg-surface-subtle p-3.5 border border-border space-y-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
                                <Icon name="headphones" size={16} className="text-primary" />
                                <span>{isVietnamese ? "Hỏi & Đáp nhanh" : "Quick Q & A"}</span>
                              </div>
                              <p className="text-xs text-text-secondary leading-relaxed">
                                {isVietnamese && item.title_vi
                                  ? item.title_vi
                                  : item.title || (isVietnamese ? "Nghe 1 câu hỏi và chọn 1 trong 3 phản hồi phù hợp." : "Listen to the question and select the best response.")}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-text-tertiary">
                              <span className="rounded-md bg-surface-subtle px-1.5 py-0.5 font-semibold text-text-secondary">
                                3 Options (A, B, C)
                              </span>
                              <span>•</span>
                              <span>
                                {isVietnamese ? "Bẫy distractor phân tích" : "Distractor analysis"}
                              </span>
                            </div>
                          </CardContent>

                          <div className="p-5 pt-0">
                            <Button
                              onClick={() =>
                                openWorkspace({ type: "PART_2", item })
                              }
                              className="w-full gap-2"
                              size="sm"
                            >
                              <Icon name="play" size={14} />
                              {isVietnamese ? "Luyện tập ngay" : "Practice Now"}
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ==================== PART 3: CONVERSATIONS ==================== */}
              {activeTab === "PART_3" && (
                <>
                  {!part3Data?.items?.length ? (
                    <EmptyState
                      isVietnamese={isVietnamese}
                      onReset={handleClearFilters}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {part3Data.items.map((item) => (
                        <Card
                          key={item._id}
                          className="dashboard-card group flex flex-col justify-between hover:shadow-md transition-all"
                        >
                          <CardContent className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                Part 3 • {categoryName("PART_3", item.conversation_type)}
                              </span>
                              <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                                {item.cefr_level || "B1"} • {item.difficulty_level || "MEDIUM"}
                              </span>
                            </div>

                            <div>
                              <h3 className="font-bold text-sm text-text-primary line-clamp-1">
                                {isVietnamese && item.title_vi
                                  ? item.title_vi
                                  : item.title}
                              </h3>
                              <div className="mt-2 flex items-center gap-2 text-xs text-text-tertiary">
                                <span>🗣️ {item.speaker_1_name || "Speaker 1"} &amp; {item.speaker_2_name || "Speaker 2"}</span>
                                <span>•</span>
                                <span>⏱️ {item.duration_seconds || 45}s</span>
                              </div>
                            </div>

                            <div className="rounded-xl bg-surface-subtle p-3 border border-border">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-text-primary">
                                  {isVietnamese ? "Chùm 3 câu hỏi" : "3 Questions Set"}
                                </span>
                                <span className="text-primary font-bold">
                                  {item.questions?.length || 3} Qs
                                </span>
                              </div>
                            </div>
                          </CardContent>

                          <div className="p-5 pt-0">
                            <Button
                              onClick={() =>
                                openWorkspace({ type: "PART_3", item })
                              }
                              className="w-full gap-2"
                              size="sm"
                            >
                              <Icon name="play" size={14} />
                              {isVietnamese ? "Luyện tập ngay" : "Practice Now"}
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ==================== PART 4: SHORT TALKS ==================== */}
              {activeTab === "PART_4" && (
                <>
                  {!part4Data?.items?.length ? (
                    <EmptyState
                      isVietnamese={isVietnamese}
                      onReset={handleClearFilters}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {part4Data.items.map((item) => (
                        <Card
                          key={item._id}
                          className="dashboard-card group flex flex-col justify-between hover:shadow-md transition-all"
                        >
                          <CardContent className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                Part 4 • {categoryName("PART_4", item.talk_type)}
                              </span>
                              <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                                {item.cefr_level || "B1"} • {item.difficulty_level || "MEDIUM"}
                              </span>
                            </div>

                            <div>
                              <h3 className="font-bold text-sm text-text-primary line-clamp-1">
                                {isVietnamese && item.title_vi
                                  ? item.title_vi
                                  : item.title}
                              </h3>
                              <div className="mt-2 flex items-center gap-2 text-xs text-text-tertiary">
                                <span>
                                  🎙️ {item.speaker_name || "Speaker"} {item.speaker_role ? `(${item.speaker_role})` : ""}
                                </span>
                                <span>•</span>
                                <span>⏱️ {item.duration_seconds || 50}s</span>
                              </div>
                            </div>

                            <div className="rounded-xl bg-surface-subtle p-3 border border-border">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-text-primary">
                                  {isVietnamese ? "Chùm 3 câu hỏi" : "3 Questions Set"}
                                </span>
                                <span className="text-primary font-bold">
                                  {item.questions?.length || 3} Qs
                                </span>
                              </div>
                            </div>
                          </CardContent>

                          <div className="p-5 pt-0">
                            <Button
                              onClick={() =>
                                openWorkspace({ type: "PART_4", item })
                              }
                              className="w-full gap-2"
                              size="sm"
                            >
                              <Icon name="play" size={14} />
                              {isVietnamese ? "Luyện tập ngay" : "Practice Now"}
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ==================== DICTATION ==================== */}
              {activeTab === "DICTATION" && (
                <>
                  {!dictationData?.items?.length ? (
                    <EmptyState
                      isVietnamese={isVietnamese}
                      onReset={handleClearFilters}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dictationData.items.map((item) => (
                        <Card
                          key={item._id}
                          className="dashboard-card group flex flex-col justify-between hover:shadow-md transition-all"
                        >
                          <CardContent className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                Dictation
                              </span>
                              <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                                {item.cefr_level || "B1"} • {item.difficulty_level || "MEDIUM"}
                              </span>
                            </div>

                            <div>
                              <h3 className="font-bold text-sm text-text-primary line-clamp-1">
                                {isVietnamese && item.title_vi
                                  ? item.title_vi
                                  : item.title}
                              </h3>
                              <p className="mt-1 text-xs text-text-tertiary line-clamp-2">
                                {isVietnamese && item.description_vi
                                  ? item.description_vi
                                  : item.description || "Luyện nghe chép chính tả từng câu tương tác."}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="rounded-lg bg-surface-subtle p-2.5 text-center border border-border">
                                <span className="block text-text-tertiary text-[10px]">
                                  {isVietnamese ? "Phân đoạn" : "Segments"}
                                </span>
                                <span className="font-bold text-text-primary">
                                  {item.total_segments || (item.segments?.length || 0)} câu
                                </span>
                              </div>
                              <div className="rounded-lg bg-surface-subtle p-2.5 text-center border border-border">
                                <span className="block text-text-tertiary text-[10px]">
                                  {isVietnamese ? "Thời lượng" : "Duration"}
                                </span>
                                <span className="font-bold text-text-primary">
                                  {item.duration_seconds || 60}s
                                </span>
                              </div>
                            </div>
                          </CardContent>

                          <div className="p-5 pt-0">
                            <Button
                              onClick={() =>
                                openWorkspace({ type: "DICTATION", item })
                              }
                              className="w-full gap-2"
                              size="sm"
                            >
                              <Icon name="play" size={14} />
                              {isVietnamese ? "Luyện tập ngay" : "Practice Now"}
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* PAGINATION COMPONENT */}
              {currentPagination && currentPagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={page}
                    totalPages={currentPagination.totalPages}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={currentPagination.total}
                    onPageChange={(newPage) => {
                      setPage(newPage);
                      window.scrollTo({ top: 120, behavior: "smooth" });
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// EMPTY STATE COMPONENT
// ---------------------------------------------------------------------------
function EmptyState({
  isVietnamese,
  onReset,
}: {
  isVietnamese: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center bg-card">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-subtle text-text-tertiary mb-4">
        <Icon name="search" size={26} />
      </div>
      <h3 className="text-base font-bold text-text-primary">
        {isVietnamese ? "Chưa tìm thấy bài tập nào" : "No exercises found"}
      </h3>
      <p className="mt-1 text-xs text-text-secondary max-w-sm">
        {isVietnamese
          ? "Hiện chưa có bài tập nào phù hợp với bộ lọc đã chọn. Hãy thử điều chỉnh hoặc xóa bộ lọc."
          : "There are no exercises matching your selected filter criteria. Try resetting your filters."}
      </p>
      <Button variant="outline" size="sm" onClick={onReset} className="mt-4 gap-2">
        <Icon name="refreshCw" size={14} />
        {isVietnamese ? "Xóa bộ lọc tìm kiếm" : "Reset Filters"}
      </Button>
    </div>
  );
}

function ListeningPicture({ imageKey, title, isVietnamese }: { imageKey?: string; title: string; isVietnamese: boolean }) {
  const [failedKey, setFailedKey] = useState<string | null>(null);
  if (!imageKey || failedKey === imageKey) return (
    <div className="flex h-full items-center justify-center gap-2 text-sm text-text-tertiary">
      <Icon name="camera" size={20} />
      <span>{isVietnamese ? "Ảnh chưa khả dụng" : "Image unavailable"}</span>
    </div>
  );
  return <Image unoptimized fill src={resolveImageUrl(imageKey)} alt={title} className="object-cover transition-transform duration-300 group-hover:scale-105" onError={() => setFailedKey(imageKey)} />;
}
