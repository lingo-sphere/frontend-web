"use client";

import { useWritingSrsQuery } from '@/features/practice/hooks/use.writing.srs';
// Trang giao diện Sổ tay câu sai (Mistake Vault) và ôn tập lặp lại ngắt quãng (Spaced Repetition SRS).


import { useState, useMemo, useEffect } from "react";
import {
  BookmarkCheck,
  RotateCcw,
  Sparkles,
  Flame,
  Award,
  Calendar,
  Filter,
  Loader2,
  CheckCircle2,
  BookOpen,
  Mic,
  PenTool,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/button";
import {
  useMyMistakesQuery,
  useDueMistakesQuery,
  useDeleteMistakeMutation,
  useSpeakingMistakesQuery,
} from "@/features/practice/hooks/use.mistake.query";
import { toast } from "@/store/toast.store";
import { MistakeVaultCard } from "@/features/practice/components/mistake.vault.card";
import { MistakeReviewModal } from "@/features/practice/components/mistake.review.modal";
import { TopicDrillModal } from "@/features/practice/components/topic.drill.modal";
import { SpeakingMistakesView } from "@/features/practice/components/speaking.mistakes.view";
import { WritingMistakesView } from "@/features/practice/components/writing.mistakes.view";
import { useNavigate, useSearchParams } from "@/lib/navigation";
import type { UserMistakeItem } from "@/features/practice/types/mistake";
import { MistakeStatus } from "@/features/practice/types/mistake";

type MainMistakeSection = "OBJECTIVE" | "SPEAKING" | "WRITING";

export default function MistakeVaultPage() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const urlTopic = searchParams.get("topic");
  const urlDomain = searchParams.get("domain");
  const urlSection = searchParams.get("section")?.toUpperCase();

  const [activeSection, setActiveSection] = useState<MainMistakeSection>(
    urlSection === "SPEAKING" || urlSection === "WRITING"
      ? (urlSection as MainMistakeSection)
      : "OBJECTIVE"
  );

  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedTopic, setSelectedTopic] = useState<string>(urlTopic || "ALL");
  const [selectedDomain, setSelectedDomain] = useState<string>(
    urlDomain || "ALL"
  );
  const [activeReviewMistake, setActiveReviewMistake] =
    useState<UserMistakeItem | null>(null);
  const [activeDrillTopic, setActiveDrillTopic] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteMutation = useDeleteMistakeMutation();

  // Đồng bộ bộ lọc khi URL query thay đổi
  useEffect(() => {
    if (urlTopic) setSelectedTopic(urlTopic);
    if (urlDomain) setSelectedDomain(urlDomain);
    if (urlSection === "SPEAKING" || urlSection === "WRITING" || urlSection === "OBJECTIVE") {
      setActiveSection(urlSection as MainMistakeSection);
    }
  }, [urlTopic, urlDomain, urlSection]);

  const queryParams = useMemo(() => {
    return {
      status:
        selectedStatus !== "ALL" && selectedStatus !== "DUE"
          ? (selectedStatus as MistakeStatus)
          : undefined,
      due_only: selectedStatus === "DUE" ? true : undefined,
      topic: selectedTopic !== "ALL" ? selectedTopic : undefined,
      domain: selectedDomain !== "ALL" ? selectedDomain : undefined,
      limit: 50,
    };
  }, [selectedStatus, selectedTopic, selectedDomain]);

  const { data, isLoading, refetch } = useMyMistakesQuery(queryParams, activeSection === "OBJECTIVE");
  const { data: dueData, refetch: refetchDue } = useDueMistakesQuery(activeSection === "OBJECTIVE");
  const { data: speakingData } = useSpeakingMistakesQuery();
  const { data: writingData } = useWritingSrsQuery({ status:'DUE',kind:'',context_id:'',search:'',page:1 }, activeSection === 'WRITING');
  const changeSection = (section: MainMistakeSection) => { setActiveSection(section); const next = new URLSearchParams(searchParams.toString()); next.set('section',section); navigate(`/practice/mistakes?${next}`); };

  const mistakes = data?.items || [];
  const summary = data?.summary || {
    total_all: 0,
    total_due_today: 0,
    total_need_practice: 0,
    total_practicing: 0,
    total_mastered: 0,
  };
  const topicGroups = data?.topic_groups || [];

  const handleStartDueReview = () => {
    const dueItems = dueData?.items || [];
    if (dueItems.length > 0) {
      setActiveReviewMistake(dueItems[0]);
    }
  };

  const handleReviewSuccess = () => {
    refetch();
    refetchDue();
  };

  const handleDeleteMistake = (mistake: UserMistakeItem) => {
    setDeletingId(mistake._id);
    deleteMutation.mutate(mistake._id, {
      onSuccess: () => {
        toast.success("Đã xóa câu hỏi khỏi sổ tay thành công!");
        setDeletingId(null);
      },
      onError: () => {
        toast.error("Không thể xóa câu hỏi. Vui lòng thử lại sau!");
        setDeletingId(null);
      },
    });
  };

  return (
    <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 space-y-6">
      {/* 3 PHÂN KHU SỔ TAY (OBJECTIVE - SPEAKING - WRITING) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface border border-border shadow-xs max-w-fit">
        <button
          type="button"
          onClick={() => changeSection("OBJECTIVE")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSection === "OBJECTIVE"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
          }`}
        >
          <CheckSquare size={16} />
          <span>Câu hỏi & Trắc nghiệm</span>
          {summary.total_due_today > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
              {summary.total_due_today}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => changeSection("SPEAKING")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSection === "SPEAKING"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
          }`}
        >
          <Mic size={16} />
          <span>Luyện nói (Speaking)</span>
          {speakingData?.summary?.total_due_today ? (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
              {speakingData.summary.total_due_today}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => changeSection("WRITING")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSection === "WRITING"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/25"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
          }`}
        >
          <PenTool size={16} />
          <span>Luyện viết (Writing)</span>
          {!!writingData?.summary.due && <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs">{writingData.summary.due}</span>}
        </button>
      </div>

      {/* KHU VỰC 1: TRẮC NGHIỆM / CÂU HỎI ĐÚNG SAI (GRAMMAR, READING, VOCABULARY, LISTENING) */}
      {activeSection === "OBJECTIVE" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900 text-white shadow-xl">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-white/10 text-purple-200">
                  <BookmarkCheck size={20} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Spaced Repetition System (SRS SM-2)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Sổ tay lỗi sai & Khắc phục kiến thức trắc nghiệm
              </h1>
              <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
                Mỗi câu bạn từng làm sai trong bài thi hoặc bài tập trắc nghiệm được lên lịch nhắc lại ngắt quãng vào ngày
                1, ngày 3, ngày 7. Khi trả lời đúng 3 lần liên tiếp, câu hỏi sẽ được
                đánh dấu đã làm chủ vĩnh viễn.
              </p>
            </div>

            {summary.total_due_today > 0 && (
              <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                <div className="px-3.5 py-1.5 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-bold flex items-center gap-1.5">
                  <Calendar size={14} className="text-rose-400" />
                  <span>
                    Hôm nay có {summary.total_due_today} câu đến hạn ôn tập!
                  </span>
                </div>
                <Button
                  onClick={handleStartDueReview}
                  size="lg"
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/30 gap-2 cursor-pointer"
                >
                  <RotateCcw size={16} />
                  <span>Bắt đầu ôn tập ngay ({summary.total_due_today})</span>
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                <BookOpen size={14} className="text-purple-600" />
                <span>Tổng câu đã ghi nhận</span>
              </div>
              <div className="text-2xl font-black text-text-primary">
                {summary.total_all}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                <Calendar size={14} />
                <span>Cần ôn hôm nay</span>
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {summary.total_due_today}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <Flame size={14} />
                <span>Đang rèn luyện</span>
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {summary.total_practicing + summary.total_need_practice}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <Award size={14} />
                <span>Đã làm chủ hoàn toàn</span>
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {summary.total_mastered}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface border border-border">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedStatus("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === "ALL"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-surface-secondary text-text-secondary hover:bg-surface-hover"
                }`}
              >
                Tất cả ({summary.total_all})
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus("DUE")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === "DUE"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-surface-secondary text-text-secondary hover:bg-surface-hover"
                }`}
              >
                Đến hạn ôn ({summary.total_due_today})
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus(MistakeStatus.PRACTICING)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === MistakeStatus.PRACTICING
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-surface-secondary text-text-secondary hover:bg-surface-hover"
                }`}
              >
                Đang rèn luyện
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus(MistakeStatus.MASTERED)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === MistakeStatus.MASTERED
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-surface-secondary text-text-secondary hover:bg-surface-hover"
                }`}
              >
                Đã làm chủ ({summary.total_mastered})
              </button>
            </div>

            {/* Domain filter buttons */}
            <div className="flex items-center gap-1.5 border-l border-border pl-3 ml-1">
              <span className="text-[10px] text-text-tertiary font-medium">
                Kỹ năng:
              </span>
              <button
                type="button"
                onClick={() => setSelectedDomain("ALL")}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedDomain === "ALL"
                    ? "bg-purple-600 text-white"
                    : "bg-surface-secondary text-text-secondary hover:bg-surface-hover"
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setSelectedDomain("LISTENING")}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedDomain === "LISTENING"
                    ? "bg-blue-600 text-white"
                    : "bg-surface-secondary text-text-secondary hover:bg-surface-hover"
                }`}
              >
                Nghe
              </button>
              <button
                type="button"
                onClick={() => setSelectedDomain("READING")}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedDomain === "READING"
                    ? "bg-green-600 text-white"
                    : "bg-surface-secondary text-text-secondary hover:bg-surface-hover"
                }`}
              >
                Đọc
              </button>
              <button
                type="button"
                onClick={() => setSelectedDomain("GRAMMAR")}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedDomain === "GRAMMAR"
                    ? "bg-orange-600 text-white"
                    : "bg-surface-secondary text-text-secondary hover:bg-surface-hover"
                }`}
              >
                Ngữ pháp
              </button>
            </div>

            {topicGroups.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-text-tertiary shrink-0" />
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="bg-surface-secondary border border-border text-xs rounded-xl px-2.5 py-1.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-purple-600 cursor-pointer"
                >
                  <option value="ALL">
                    Tất cả chủ điểm ({topicGroups.length})
                  </option>
                  {topicGroups.map((g) => (
                    <option key={g.topic} value={g.topic}>
                      {g.topic} ({g.count})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <Loader2 size={32} className="animate-spin text-purple-600" />
                <p className="text-xs text-text-secondary">
                  Đang tải danh sách câu hỏi trong sổ tay...
                </p>
              </div>
            ) : mistakes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 p-8 rounded-3xl bg-surface border border-border">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  {selectedStatus === "DUE"
                    ? "Tuyệt vời! Bạn đã hoàn thành toàn bộ câu ôn tập của hôm nay!"
                    : "Sổ tay lỗi sai trắc nghiệm hiện đang trống"}
                </h3>
                <p className="text-xs text-text-secondary max-w-md">
                  {selectedStatus === "DUE"
                    ? "Hãy quay lại vào ngày mai để tiếp tục chu kỳ ghi nhớ ngắt quãng nhé."
                    : "Khi bạn làm bài kiểm tra hoặc bài tập trắc nghiệm trong khóa học, bất kỳ câu nào bạn làm chưa đúng sẽ tự động được thu thập tại đây kèm theo giải thích AI."}
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {mistakes.map((item) => (
                  <MistakeVaultCard
                    key={item._id}
                    mistake={item}
                    onReview={(m) => setActiveReviewMistake(m)}
                    onDrillTopic={(topic) => setActiveDrillTopic(topic)}
                    onPracticeTopic={(m) => {
                      const snapshot = m.classification_snapshot;
                      const domain = (
                        snapshot?.domain || "LISTENING"
                      ).toUpperCase();
                      const contextId = snapshot?.context_id || "";
                      const exerciseType = snapshot?.exercise_type || "";
                      const rawTopic = m.topic_name_vi || m.topic_tags?.[0] || "";
                      const topicName =
                        rawTopic &&
                        !rawTopic.startsWith("Chương") &&
                        !rawTopic.startsWith("Chapter")
                          ? rawTopic
                          : "";

                      if (!contextId) {
                        toast.warning(
                          "Câu hỏi này chưa được gắn chủ đề luyện tập cụ thể."
                        );
                        return;
                      }

                      let targetUrl = "/listening";
                      if (domain === "SPEAKING") {
                        targetUrl = "/speaking";
                      } else if (domain === "WRITING") {
                        targetUrl = "/writing";
                      } else if (domain === "GRAMMAR") {
                        targetUrl = "/grammar";
                      } else if (domain === "VOCABULARY") {
                        targetUrl = "/vocabulary";
                      }

                      const params = new URLSearchParams();
                      if (contextId) params.set("context_id", contextId);
                      if (exerciseType) params.set("exercise_type", exerciseType);
                      if (topicName) params.set("topic_name", topicName);

                      const queryString = params.toString();
                      navigate(
                        queryString ? `${targetUrl}?${queryString}` : targetUrl
                      );
                    }}
                    onDelete={handleDeleteMistake}
                    isDeleting={deletingId === item._id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* KHU VỰC 2: SỔ TAY LUYỆN NÓI (SPEAKING REMEDIAL & SRS) */}
      {activeSection === "SPEAKING" && <SpeakingMistakesView />}

      {/* KHU VỰC 3: SỔ TAY LUYỆN VIẾT (WRITING REMEDIAL & SRS) */}
      {activeSection === "WRITING" && (
        <WritingMistakesView />
      )}

      {/* MODALS CHO PHÂN HỆ TRẮC NGHIỆM */}
      {activeReviewMistake && (
        <MistakeReviewModal
          open={Boolean(activeReviewMistake)}
          onClose={() => setActiveReviewMistake(null)}
          mistake={activeReviewMistake}
          onSuccess={handleReviewSuccess}
        />
      )}

      {activeDrillTopic && (
        <TopicDrillModal
          open={Boolean(activeDrillTopic)}
          onClose={() => setActiveDrillTopic(null)}
          topicTag={activeDrillTopic}
        />
      )}
    </main>
  );
}
