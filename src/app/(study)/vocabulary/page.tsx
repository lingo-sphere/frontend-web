// Trang giao diện khám phá và quản lý các bộ thẻ từ vựng LingoSphere.
"use client";

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "@/lib/navigation";
import { useTranslation } from "react-i18next";
import {
  Layers3,
  Globe,
  Users,
  GraduationCap,
  Bookmark,
  Brain,
  Check,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Target,
  Sliders,
  Clock,
  Calendar,
  Trophy,
  Flame,
  Play,
  BookOpen,
  Lock,
  Share2,
  Trash2,
  AlertTriangle,
  Loader2,
  HelpCircle,
} from "lucide-react";

import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/card";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal";
import { Pagination } from "@/components/pagination";
import { SectionHeading } from "@/features/dashboard/components/section.heading";
import { useApp } from "@/contexts/app.context";
import { useVocabularyPage } from "@/features/vocabulary/hooks/use.vocabulary.page";
import { vocabularyService } from "@/features/vocabulary/services/vocabulary.service";
import { vocabularyKeys } from "@/features/vocabulary/keys/vocabulary.keys";
import type { Deck } from "@/features/vocabulary/schemas/vocabulary.schema";

export default function VocabularyAppPage() {
  const { t, i18n } = useTranslation();
  const isVietnamese = i18n.language === "vi";
  const navigate = useNavigate();
  const { showAction } = useApp();

  const {
    publicDecks,
    systemDecks,
    communityDecks,
    myDecks,
    isLoading,
    activeTag,
    setActiveTag,
    activeBand,
    setActiveBand,
    activeTopic,
    setActiveTopic,
    targetBands,
    availableTopics,
    topicMap,
    filteredPacks,
    handleDeckClick,
    handleToggleVisibility,
    handleCopyShareLink,
    currentUser,
    enrolledDeckIdSet,
    savingDeckId,
    handleEnrollCommunityDeck,
    pendingPrivacyDeck,
    confirmSwitchToPrivate,
    cancelSwitchToPrivate,
    savedCount,
    wrongWordsSummary,
    masteryStats,
    dailyGoal,
    setDailyGoal,
    dailyProgress,
  } = useVocabularyPage();

  const queryClient = useQueryClient();
  interface PendingDeleteState {
    deck: Deck;
    saversCount: number;
  }
  const [pendingDeleteDeck, setPendingDeleteDeck] = useState<PendingDeleteState | null>(null);
  const [checkingDeleteDeckId, setCheckingDeleteDeckId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRequestDeleteDeck = async (deck: Deck) => {
    const currentUserId = (currentUser as any)?.user_id || (currentUser as any)?.id;
    const isOwnDeck =
      deck.creator_type === "USER" &&
      Boolean(currentUserId) &&
      ((deck as any).creator_id === currentUserId || (deck as any).user_id === currentUserId);

    const deckId = String(
      deck._id || deck.id || (deck as any).deck_id?._id || (deck as any).deck_id
    );

    if (isOwnDeck) {
      setCheckingDeleteDeckId(deckId);
      try {
        const res = await vocabularyService.getDeckSaversCount(deckId);
        setPendingDeleteDeck({ deck, saversCount: res.savers_count || 0 });
      } catch {
        setPendingDeleteDeck({ deck, saversCount: 0 });
      } finally {
        setCheckingDeleteDeckId(null);
      }
    } else {
      setPendingDeleteDeck({ deck, saversCount: 0 });
    }
  };

  const handleDeleteDeckConfirm = async () => {
    if (!pendingDeleteDeck) return;
    const { deck, saversCount } = pendingDeleteDeck;
    const deckId = String(
      deck._id || deck.id || (deck as any).deck_id?._id || (deck as any).deck_id
    );
    const currentUserId = (currentUser as any)?.user_id || (currentUser as any)?.id;
    const isOwnDeck =
      deck.creator_type === "USER" &&
      Boolean(currentUserId) &&
      ((deck as any).creator_id === currentUserId || (deck as any).user_id === currentUserId);

    setIsDeleting(true);
    try {
      if (isOwnDeck) {
        await vocabularyService.deleteDeck(deckId);
        if (saversCount > 0) {
          showAction(
            isVietnamese
              ? `Đã xóa bộ thẻ khỏi tài khoản của bạn (bảo lưu dữ liệu cho ${saversCount} người đang học)`
              : `Removed deck from your account (retained for ${saversCount} active learners)`
          );
        } else {
          showAction(
            isVietnamese
              ? `Đã xóa vĩnh viễn bộ thẻ "${deck.name || (deck as any).title}"`
              : `Permanently deleted deck "${deck.name || (deck as any).title}"`
          );
        }
      } else {
        await vocabularyService.unenrollDeck(deckId);
        showAction(
          isVietnamese
            ? `Đã gỡ bộ thẻ "${deck.name || (deck as any).title}" khỏi Bộ thẻ của tôi`
            : `Removed deck "${deck.name || (deck as any).title}" from My Decks`
        );
      }
      await queryClient.invalidateQueries({ queryKey: vocabularyKeys.all });
      setPendingDeleteDeck(null);
    } catch (err: unknown) {
      console.error("Lỗi khi xóa bộ thẻ:", err);
      showAction(
        isVietnamese
          ? "Không thể xóa bộ thẻ. Vui lòng thử lại"
          : "Failed to delete deck"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTag, activeBand, activeTopic]);

  const totalPages = Math.ceil(filteredPacks.length / PAGE_SIZE);

  const paginatedPacks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPacks.slice(start, start + PAGE_SIZE);
  }, [filteredPacks, currentPage]);

  const scrollToCommunityDecks = () => {
    const el = document.getElementById("community-decks-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Số từ đã hoàn thành hôm nay: Lấy từ Redis counter thật (0 nếu chưa học từ nào)
  const completedToday = dailyProgress?.words_reviewed_today ?? 0;
  const isGoalReached = completedToday >= dailyGoal;
  const overflowWords = Math.max(0, completedToday - dailyGoal);
  const goalPercent = Math.min(
    Math.round((completedToday / dailyGoal) * 100),
    100
  );

  // Thời gian học Flashcard thực tế trong ngày hôm nay: 100% Active Time từ Redis Counter
  const activeStudySeconds = masteryStats.activeStudySeconds || 0;
  const activeStudyMinutes = Math.floor(activeStudySeconds / 60);
  const activeStudyDisplay =
    activeStudyMinutes > 0
      ? `${activeStudyMinutes} ${isVietnamese ? "phút" : "mins"}`
      : activeStudySeconds > 0
      ? `${activeStudySeconds}s`
      : isVietnamese
      ? "0 phút"
      : "0 min";

  // 3 cột phân bố trạng thái ghi nhớ theo thuật toán SRS: Mới học - Đang nhớ - Thành thạo
  // (Phần "Cần ôn" được hiển thị riêng thành banner Spaced Repetition SRS nhắc nhở)
  const srsStageColumns = [
    {
      key: "new",
      label: isVietnamese ? "Mới học" : "New",
      sub: isVietnamese ? "Vừa nạp" : "Initial",
      count: masteryStats.newLearnedCount,
      color: "bg-teal-500",
      textColor: "text-teal-600 dark:text-teal-400",
    },
    {
      key: "learning",
      label: isVietnamese ? "Đang nhớ" : "Learning",
      sub: isVietnamese ? "Củng cố" : "Interval 1-3",
      count: masteryStats.learningCount,
      color: "bg-blue-500",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      key: "mastered",
      label: isVietnamese ? "Thành thạo" : "Mastered",
      sub: isVietnamese ? "Dài hạn" : "Long-term",
      count: masteryStats.masteredCount,
      color: "bg-emerald-600",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  const maxStageVal = Math.max(...srsStageColumns.map((c) => c.count), 1);

  return (
    <>
      <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/assets/capybara-mascot.png"
                alt="LingoSphere Mascot"
                className="h-14 w-14 rounded-2xl object-contain"
              />
              <div>
                <SectionHeading
                  eyebrow={t("vocabulary.title")}
                  title={
                    isVietnamese
                      ? "Học từ vựng tiếng Anh"
                      : "Learn English Vocabulary"
                  }
                  description={
                    isVietnamese
                      ? "Làm chủ từ vựng với hệ thống Spaced Repetition SRS"
                      : "Master English vocabulary with LingoSphere's Spaced Repetition System"
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* NHẮC NHỞ SPACED REPETITION (SRS) TỪ VỰNG ĐẾN HẠN (RIÊNG BIỆT) */}
        {masteryStats.dueCount > 0 && (
          <div className="mt-5 relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-indigo-500/10 p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md shadow-rose-500/25">
                  <Calendar size={20} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <Calendar size={12} />
                      <span>
                        {isVietnamese
                          ? "Nhắc nhở Spaced Repetition (SRS)"
                          : "Spaced Repetition (SRS) Reminder"}
                      </span>
                    </span>
                    <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                      {masteryStats.dueCount}{" "}
                      {isVietnamese ? "từ đến hạn" : "words due"}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-text-primary">
                    {isVietnamese
                      ? `Hôm nay bạn có ${masteryStats.dueCount} từ vựng cần ôn tập trong Kho từ vựng!`
                      : `You have ${masteryStats.dueCount} vocabulary items due for review today!`}
                  </h4>
                  <p className="text-xs text-text-secondary">
                    {isVietnamese
                      ? "Ôn tập đúng lịch ngắt quãng giúp não bộ chuyển hóa kiến thức từ trí nhớ ngắn hạn sang dài hạn."
                      : "Reviewing on schedule reinforces retention and moves vocabulary into long-term memory."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Button
                  size="sm"
                  className="gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-500/20 cursor-pointer"
                  onClick={() => navigate("/vocabulary/learn/due-srs")}
                >
                  <RotateCcw size={14} />
                  <span>
                    {isVietnamese
                      ? `Ôn tập ngay (${masteryStats.dueCount})`
                      : `Review Now (${masteryStats.dueCount})`}
                  </span>
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 1: TODAY'S MISSION & SRS MEMORY VAULT */}
        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          {/* CARD 1: MỤC TIÊU HỌC HÔM NAY (ACTIVE STUDY TIME + PROGRESS + ACTION) */}
          <Card className="dashboard-card border-border/80 shadow-sm flex flex-col justify-between">
            <CardContent className="flex h-full flex-col justify-between p-5 sm:p-6">
              <div>
                {/* Header card với nút đổi mục tiêu động */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Target size={20} />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-text-primary">
                        {isVietnamese
                          ? "Mục tiêu học hôm nay"
                          : "Today's Learning Goal"}
                      </h3>
                      <p className="text-[11px] text-text-tertiary">
                        {isVietnamese
                          ? "Kế hoạch rèn luyện hàng ngày"
                          : "Daily spaced practice plan"}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setIsEditingGoal(!isEditingGoal)}
                      className="flex items-center gap-1.5 rounded-full border border-border bg-surface-subtle px-3 py-1 text-[11px] font-bold text-text-secondary transition hover:border-primary/50 hover:text-text-primary"
                    >
                      <Sliders size={12} className="text-primary" />
                      <span>
                        {isVietnamese
                          ? `Mục tiêu: ${dailyGoal} từ`
                          : `Goal: ${dailyGoal} words`}
                      </span>
                    </button>

                    {/* Popover setup mục tiêu động (5, 10, 15, tối đa 20 từ) */}
                    {isEditingGoal && (
                      <div className="absolute right-0 top-9 z-20 w-56 rounded-2xl border border-border bg-surface p-3 shadow-xl">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[12px] font-bold text-text-primary">
                            {isVietnamese
                              ? "Chọn mục tiêu/ngày"
                              : "Select Daily Goal"}
                          </span>
                          <span className="text-[10px] text-text-tertiary">
                            {isVietnamese ? "Tối đa 20 từ" : "Max 20 words"}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[5, 10, 15, 20].map((num) => (
                            <button
                              key={num}
                              onClick={() => {
                                setDailyGoal(num);
                                setIsEditingGoal(false);
                              }}
                              className={`rounded-xl py-1.5 text-[12px] font-bold transition ${
                                dailyGoal === num
                                  ? "bg-primary text-white shadow-sm ring-2 ring-primary/30"
                                  : "bg-surface-subtle text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                        <p className="mt-2 text-[10px] text-text-tertiary">
                          {isVietnamese
                            ? "💡 Bạn có thể học vượt chỉ tiêu bất kỳ lúc nào!"
                            : "💡 You can exceed your goal anytime!"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Trạng thái hoàn thành */}
                <div className="mt-4 rounded-2xl bg-surface-subtle p-3.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-semibold text-text-secondary">
                      {isVietnamese
                        ? "Tiến độ hoàn thành:"
                        : "Completion Progress:"}
                    </span>
                    <span className="font-bold text-text-primary">
                      {completedToday} / {dailyGoal}{" "}
                      {isVietnamese ? "từ" : "words"}{" "}
                      {overflowWords > 0 && (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          (+{overflowWords}{" "}
                          {isVietnamese ? "vượt mức" : "extra"})
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-border/60">
                    <div
                      className={`h-full transition-all duration-700 ${
                        isGoalReached ? "bg-emerald-500" : "bg-primary"
                      }`}
                      style={{ width: `${goalPercent}%` }}
                    />
                  </div>

                  {isGoalReached && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <Trophy size={14} />
                      <span>
                        {isVietnamese
                          ? "Xuất sắc! Bạn đã đạt mục tiêu hôm nay và có thể học tiếp không giới hạn."
                          : "Awesome! You achieved today’s goal and can keep going!"}
                      </span>
                    </div>
                  )}
                </div>

                {/* 3 SUB-METRICS: Đã học hôm nay, Độ chính xác, Thời gian học thực tế */}
                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  <div className="flex flex-col justify-between rounded-xl border border-border/70 bg-surface p-2.5 text-center">
                    <span className="text-[10px] font-medium text-text-tertiary flex items-center justify-center gap-1">
                      <BookOpen size={11} className="text-primary" />
                      {isVietnamese ? "Đã học hôm nay" : "Learned Today"}
                    </span>
                    <span className="my-1 text-[18px] font-extrabold text-primary">
                      {completedToday}
                    </span>
                    <span className="text-[9.5px] text-text-tertiary">
                      {masteryStats.newLearnedCount}{" "}
                      {isVietnamese ? "mới" : "new"} ·{" "}
                      {Math.max(
                        0,
                        completedToday - masteryStats.newLearnedCount
                      )}{" "}
                      {isVietnamese ? "ôn" : "rev"}
                    </span>
                  </div>

                  <div className="flex flex-col justify-between rounded-xl border border-border/70 bg-surface p-2.5 text-center">
                    <span className="text-[10px] font-medium text-text-tertiary flex items-center justify-center gap-1">
                      <Check size={11} className="text-emerald-500" />
                      {isVietnamese ? "Độ chính xác" : "Accuracy"}
                    </span>
                    <span className="my-1 text-[18px] font-extrabold text-emerald-600 dark:text-emerald-400">
                      {masteryStats.totalReviews > 0
                        ? `${masteryStats.reviewAccuracy}%`
                        : "--%"}
                    </span>
                    <span className="text-[9.5px] text-text-tertiary">
                      {isVietnamese ? "Chất lượng nhớ" : "Retention rate"}
                    </span>
                  </div>

                  <div className="flex flex-col justify-between rounded-xl border border-border/70 bg-surface p-2.5 text-center relative group">
                    <span className="text-[10px] font-medium text-text-tertiary flex items-center justify-center gap-1">
                      <Clock size={11} className="text-amber-500" />
                      {isVietnamese ? "Thời gian học" : "Study Time"}
                      <span
                        title={
                          isVietnamese
                            ? "Tổng thời gian bạn thực sự tương tác và ôn luyện trong các phiên Flashcard hôm nay"
                            : "Actual active study time spent reviewing flashcards today"
                        }
                        className="cursor-help text-text-tertiary hover:text-text-primary"
                      >
                        <HelpCircle size={10} />
                      </span>
                    </span>
                    <span className="my-1 text-[18px] font-extrabold text-text-primary">
                      {activeStudyDisplay}
                    </span>
                    <span className="text-[9.5px] text-text-tertiary">
                      {isVietnamese ? "Thời gian thực tế" : "Active time"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
                <Button
                  className="gap-2 bg-primary hover:bg-primary-hover shadow-sm font-semibold"
                  onClick={scrollToCommunityDecks}
                >
                  <Play size={15} fill="currentColor" />
                  <span>
                    {completedToday > 0 && !isGoalReached
                      ? isVietnamese
                        ? `Tiếp tục học (còn ${dailyGoal - completedToday} từ)`
                        : `Continue (${dailyGoal - completedToday} left)`
                      : isGoalReached
                      ? isVietnamese
                        ? "Học thêm từ mới"
                        : "Learn More Words"
                      : isVietnamese
                      ? "Bắt đầu học ngay"
                      : "Start Learning"}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 border-border bg-surface hover:bg-surface-hover text-text-primary font-medium"
                  onClick={() => navigate("/vocabulary/notebook")}
                >
                  <Bookmark size={15} className="text-primary" />
                  <span>
                    {isVietnamese
                      ? `Sổ tay đã lưu (${savedCount})`
                      : `Notebook (${savedCount})`}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* CARD 2: KHO TỪ VỰNG & SRS (FIXED-HEIGHT BAR CHART + DYNAMIC ACTION BOX) */}
          <Card className="dashboard-card border-border/80 shadow-sm flex flex-col justify-between">
            <CardContent className="flex h-full flex-col justify-between p-5 sm:p-6">
              <div>
                {/* Header card: Tổng từ vựng tách biệt khỏi các trạng thái */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-info/10 text-info">
                      <Brain size={20} />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-text-primary">
                        {isVietnamese
                          ? "Kho từ vựng & Trạng thái SRS"
                          : "Vocabulary Vault & Retention"}
                      </h3>
                      <p className="text-[11px] text-text-tertiary">
                        {isVietnamese
                          ? "Chu kỳ Spaced Repetition System"
                          : "Spaced Repetition System (SRS)"}
                      </p>
                    </div>
                  </div>

                  {/* TỔNG TỪ VỰNG: ĐƯA LÊN BADGE RIÊNG BIỆT TRÊN CÙNG */}
                  <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                    <Layers3 size={12} />
                    <span>
                      {masteryStats.totalWords}{" "}
                      {isVietnamese ? "từ trong kho" : "total words"}
                    </span>
                  </div>
                </div>

                {/* BIỂU ĐỒ CỘT 3 TRẠNG THÁI SRS VỚI CHIỀU CAO CỐ ĐỊNH (MỚI HỌC - ĐANG NHỚ - THÀNH THẠO) */}
                <div className="mt-4 pt-1">
                  <div className="mb-2 flex items-center justify-between text-[11px] text-text-tertiary">
                    <span className="font-semibold text-text-secondary">
                      {isVietnamese
                        ? "Phân bố độ bền trí nhớ:"
                        : "Retention distribution:"}
                    </span>
                    <span>
                      {isVietnamese ? "3 giai đoạn ghi nhớ" : "3 Memory Stages"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {srsStageColumns.map((col) => {
                      const fillPercent =
                        col.count > 0
                          ? Math.min(
                              Math.max((col.count / maxStageVal) * 100, 10),
                              100
                            )
                          : 0;

                      return (
                        <div
                          key={col.key}
                          className="flex flex-col items-center justify-between rounded-2xl border border-border/70 bg-surface p-2 sm:p-2.5 transition hover:border-primary/40"
                        >
                          {/* Số lượng cố định h-6 */}
                          <div className="flex h-6 items-center justify-center">
                            <span
                              className={`text-[15px] font-extrabold ${col.textColor}`}
                            >
                              {col.count}
                            </span>
                          </div>

                          {/* Khung track cố định h-20 (80px), thanh fill tô phẳng bám sát từ chân đáy lên */}
                          <div className="my-2 flex h-20 w-8 items-end justify-center rounded-xl bg-surface-subtle border border-border/50 overflow-hidden">
                            {col.count > 0 ? (
                              <div
                                className={`w-full rounded-t-lg transition-all duration-700 ease-out ${col.color}`}
                                style={{ height: `${fillPercent}%` }}
                              />
                            ) : null}
                          </div>

                          {/* Nhãn cố định */}
                          <div className="text-center">
                            <span className="block text-[11px] font-bold text-text-primary">
                              {col.label}
                            </span>
                            <span className="block text-[9.5px] text-text-tertiary">
                              {col.sub}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dải thông tin bổ trợ: Tổng lượt ôn tập tích lũy */}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-surface-subtle px-3.5 py-2 text-[11px] text-text-secondary border border-border/50">
                <span className="flex items-center gap-1.5">
                  <RotateCcw size={13} className="text-info" />
                  {isVietnamese
                    ? "Tổng lượt ôn tập tích lũy:"
                    : "Total successful reviews:"}
                  <strong className="text-text-primary">
                    {masteryStats.totalReviews}
                  </strong>
                </span>
                <span className="text-[10px] text-text-tertiary">
                  {isVietnamese ? "SRS chu kỳ tự động" : "Auto-spaced cycle"}
                </span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* BANNER BỰ: BỘ ÔN LẠI TỪ SAI (WRONG WORDS VAULT BANNER) */}
        <div className="mt-6 relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/25">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Sparkles size={12} />
                    <span>
                      {isVietnamese
                        ? "Củng cố kiến thức & Phục hồi lỗi sai"
                        : "Retention Recovery Vault"}
                    </span>
                  </span>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-800 dark:text-amber-300">
                    {wrongWordsSummary.total} / {wrongWordsSummary.maxQuota}{" "}
                    {isVietnamese ? "từ đang lưu" : "words"}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-text-primary">
                  {isVietnamese
                    ? `Sổ ôn lại từ sai (${wrongWordsSummary.total} từ cần củng cố)`
                    : `Wrong Words Collection (${wrongWordsSummary.total} words to review)`}
                </h4>
                <p className="text-xs sm:text-[13px] text-text-secondary max-w-2xl leading-relaxed">
                  {wrongWordsSummary.total > 0
                    ? isVietnamese
                      ? "Hệ thống tự động gom các từ bạn từng trả lời sai hoặc gặp lỗi chính tả. Luyện tập đúng liên tiếp 2 lần để phục hồi hoàn toàn từ vựng!"
                      : "Words you missed or misspelled are stored here. Get 2 consecutive correct answers in review sessions to fully graduate them!"
                    : isVietnamese
                    ? "Bạn đang làm rất tốt! Chưa có từ sai nào cần củng cố. Khi bạn gặp từ khó trong quá trình học, hệ thống sẽ tự động lưu vào đây."
                    : "Great job! You have no wrong words needing review. New mistakes will automatically be collected here."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
              <Button
                variant="outline"
                className="gap-2 rounded-xl border-border bg-surface hover:bg-surface-hover text-text-primary font-semibold text-[13px] px-4 py-2"
                onClick={() => navigate("/vocabulary/wrong-words")}
              >
                <BookOpen
                  size={15}
                  className="text-amber-600 dark:text-amber-400"
                />
                <span>
                  {isVietnamese ? "Xem danh sách từ sai" : "View Collection"}
                </span>
              </Button>

              {wrongWordsSummary.total > 0 && (
                <Button
                  className="gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-md shadow-amber-500/20 px-5 py-2 text-[13px]"
                  onClick={() => navigate("/vocabulary/learn/wrong-words")}
                >
                  <Play size={15} fill="currentColor" />
                  <span>
                    {isVietnamese ? "Bắt đầu ôn từ sai" : "Start Review"}
                  </span>
                  <ArrowRight size={14} />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: BỘ THẺ CỦA TÔI (MY DECKS) */}
        <section className="mt-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Layers3 size={22} />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-text-primary">
                  {isVietnamese ? "Bộ thẻ của tôi" : "My Vocabulary Decks"}
                </h3>
                <p className="text-[12px] text-text-secondary">
                  {isVietnamese
                    ? "Các bộ thẻ bạn đang tham gia học hoặc đã lưu vào danh sách cá nhân"
                    : "Decks you are actively studying or have enrolled in"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-surface-subtle px-3 py-1 text-[12px] font-semibold text-text-secondary">
                {myDecks.length} {isVietnamese ? "bộ thẻ" : "decks"}
              </span>
            </div>
          </div>

          {myDecks.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myDecks.map((deck: Deck, idx) => {
                const targetBand = deck.settings?.target_band;
                const examPart = deck.settings?.exam_part;
                const isPublic = deck.visibility?.toUpperCase() === "PUBLIC";
                const isUserDeck = deck.creator_type === "USER";
                const currentUserId = (currentUser as any)?.user_id || (currentUser as any)?.id;
                const isOwnDeck = isUserDeck && Boolean(currentUserId) && ((deck as any).creator_id === currentUserId || (deck as any).user_id === currentUserId);
                const isSystemDeck = deck.creator_type === "SYSTEM" || !deck.creator_type;
                const progressPercent = typeof (deck as any).progress_percent === 'number' ? (deck as any).progress_percent : 0;

                return (
                  <Card
                    key={deck._id || idx}
                    className="dashboard-card cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    onClick={() => handleDeckClick(deck)}
                  >
                    <div
                      className="relative flex h-20 w-full items-center justify-center"
                      style={{
                        backgroundColor: [
                          "#00b894",
                          "#6c5ce7",
                          "#0984e3",
                          "#fdcb6e",
                        ][idx % 4],
                      }}
                    >
                      <Layers3 className="text-white/60" size={30} />
                      <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1">
                        {targetBand && (
                          <span className="rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                            Band {targetBand}
                          </span>
                        )}
                        {examPart && (
                          <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                            {examPart.replace("_", " ")}
                          </span>
                        )}
                      </div>

                      {/* PHÂN LOẠI: NÚT CHỌN CÔNG KHAI (NẾU CỦA MÌNH) HOẶC BADGE HỆ THỐNG / CỘNG ĐỒNG */}
                      <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
                        {isOwnDeck ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleVisibility(deck);
                            }}
                            title={
                              isVietnamese
                                ? isPublic
                                  ? "Đang Công khai - Bấm để chuyển sang Riêng tư"
                                  : "Đang Riêng tư - Bấm để chuyển sang Công khai"
                                : "Toggle Public / Private"
                            }
                            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold backdrop-blur-md transition shadow-sm ${
                              isPublic
                                ? "bg-emerald-600/90 text-white hover:bg-emerald-600 ring-1 ring-white/30"
                                : "bg-black/60 text-white hover:bg-black/80 ring-1 ring-white/20"
                            }`}
                          >
                            {isPublic ? (
                              <Globe size={11} />
                            ) : (
                              <Lock size={11} />
                            )}
                            <span>
                              {isPublic
                                ? isVietnamese
                                  ? "Công khai"
                                  : "Public"
                                : isVietnamese
                                ? "Riêng tư"
                                : "Private"}
                            </span>
                          </button>
                        ) : isSystemDeck ? (
                          <span className="flex items-center gap-1 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm ring-1 ring-white/20">
                            <GraduationCap size={11} className="text-amber-400" />
                            <span>{isVietnamese ? "Hệ thống" : "Official"}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded-md bg-info/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm ring-1 ring-white/20">
                            <Users size={11} />
                            <span>{isVietnamese ? "Cộng đồng" : "Community"}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[14px] font-semibold text-text-primary line-clamp-1">
                          {isVietnamese && deck.name_vi
                            ? deck.name_vi
                            : deck.name || deck.title}
                        </h4>
                      </div>

                      {/* NGUỒN GỐC & TÁC GIẢ BỘ THẺ */}
                      <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                        {isSystemDeck ? (
                          <span className="flex items-center gap-1 text-text-tertiary">
                            <Sparkles size={11} className="text-amber-500" />
                            <span>{isVietnamese ? "Bộ thẻ TOEIC chuẩn hóa" : "Standard TOEIC Pack"}</span>
                          </span>
                        ) : isOwnDeck ? (
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {isVietnamese ? "• Bộ thẻ do bạn tạo" : "• Created by you"}
                          </span>
                        ) : (
                          <span className="text-text-secondary line-clamp-1">
                            {isVietnamese ? "• Tác giả: " : "• By: "}
                            {(deck as any).creator_name || (deck as any).author || (isVietnamese ? "Học viên chia sẻ" : "Community Learner")}
                          </span>
                        )}
                      </div>

                      <p className="mt-1.5 text-[12px] text-text-secondary line-clamp-2">
                        {isVietnamese && deck.description_vi
                          ? deck.description_vi
                          : deck.description ||
                            deck.description_vi ||
                            (isVietnamese
                              ? "Bộ thẻ đang học"
                              : "Enrolled deck")}
                      </p>

                      {/* THANH TIẾN ĐỘ HỌC TẬP (NẾU ĐÃ BẮT ĐẦU HỌC) */}
                      {progressPercent > 0 && (
                        <div className="mt-2.5 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-text-tertiary">{isVietnamese ? "Tiến độ học" : "Progress"}</span>
                            <span className="font-semibold text-primary">{progressPercent}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${Math.max(5, progressPercent)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 text-[12px] text-text-secondary">
                        <span className="font-medium text-text-primary">
                          {deck.card_count ?? 0} {isVietnamese ? "từ" : "words"}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            title={
                              isVietnamese
                                ? "Sao chép liên kết bộ thẻ"
                                : "Copy share link"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyShareLink(deck);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition hover:bg-surface-hover hover:text-primary hover:border-primary/50"
                          >
                            <Share2 size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={checkingDeleteDeckId === (deck._id || deck.id)}
                            title={
                              isOwnDeck
                                ? isVietnamese
                                  ? "Xóa bộ thẻ"
                                  : "Delete Deck"
                                : isVietnamese
                                ? "Xóa khỏi Bộ thẻ của tôi"
                                : "Remove from My Decks"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRequestDeleteDeck(deck);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 disabled:opacity-50"
                          >
                            <Trash2 size={13} />
                          </button>
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary-hover"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeckClick(deck);
                            }}
                          >
                            {progressPercent > 0
                              ? isVietnamese
                                ? "Học tiếp"
                                : "Continue"
                              : isVietnamese
                              ? "Luyện tập"
                              : "Practice"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-border/80 bg-surface p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BookOpen size={24} />
              </div>
              <h4 className="mt-3 text-[15px] font-bold text-text-primary">
                {isVietnamese
                  ? "Bạn chưa tham gia bộ thẻ nào"
                  : "You have not enrolled in any deck yet"}
              </h4>
              <p className="mx-auto mt-1 max-w-md text-[13px] text-text-secondary">
                {isVietnamese
                  ? "Hãy chọn một bộ từ vựng từ danh sách bên dưới hoặc kho cộng đồng để thêm vào kế hoạch học tập hàng ngày của bạn."
                  : "Choose a deck from below or community repository to add to your daily study plan."}
              </p>
            </div>
          )}
        </section>

        {/* SECTION 3: BỘ THẺ CỘNG ĐỒNG (USER PUBLIC DECKS) */}
        <section id="community-decks-section" className="mt-10 scroll-mt-6">
          <Card className="overflow-hidden border-border/80 bg-gradient-to-br from-info/5 via-surface to-primary/5 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-info/10 text-info">
                    <Globe size={26} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[17px] font-bold text-text-primary">
                        {isVietnamese
                          ? "Bộ thẻ chia sẻ từ cộng đồng"
                          : "Community Shared Decks"}
                      </h3>
                      <span className="flex items-center gap-1 rounded-full bg-info/10 px-2.5 py-0.5 text-[11px] font-bold text-info">
                        <Sparkles size={12} />
                        {isVietnamese
                          ? "Cộng đồng LingoSphere"
                          : "Public Decks"}
                      </span>
                    </div>
                    <p className="mt-1 max-w-2xl text-[13px] text-text-secondary">
                      {isVietnamese
                        ? "Nơi tập hợp các bộ flashcard được học viên tự biên soạn và chia sẻ công khai. Bạn có thể tự do tham khảo, lưu về sổ tay hoặc luyện tập trực tiếp."
                        : "Explore vocabulary flashcards created and published by community learners. Practice directly or save them to your notebook."}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <Button
                    variant="outline"
                    className="gap-2 rounded-xl border-info/30 bg-surface text-info hover:bg-info/10"
                    onClick={() => navigate("/public-decks")}
                  >
                    <span>
                      {isVietnamese
                        ? "Khám phá tất cả bộ thẻ"
                        : "Explore All Decks"}
                    </span>
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>

              {/* Danh sách xem nhanh 3 bộ thẻ cộng đồng mới nhất hoặc thông báo nếu chưa có */}
              {communityDecks.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {communityDecks.slice(0, 3).map((deck) => {
                    const deckId = (deck._id ||
                      (deck as any).deck_id) as string;
                    const isOwner =
                      Boolean(currentUser?.user_id) &&
                      deck.creator_id === currentUser?.user_id;
                    const isEnrolled = enrolledDeckIdSet.has(deckId);
                    const isSaving = savingDeckId === deckId;

                    return (
                      <div
                        key={deckId}
                        className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-4 transition-all hover:border-info/40 hover:shadow-md"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-[14px] font-semibold text-text-primary group-hover:text-info line-clamp-1">
                              {isVietnamese && deck.name_vi
                                ? deck.name_vi
                                : deck.name}
                            </h4>
                            <span className="shrink-0 rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-text-tertiary">
                              {deck.card_count || 0}{" "}
                              {isVietnamese ? "từ" : "cards"}
                            </span>
                          </div>
                          <p className="mt-1.5 text-[12px] text-text-secondary line-clamp-2">
                            {deck.description ||
                              (isVietnamese
                                ? "Bộ thẻ chia sẻ bởi học viên"
                                : "Community shared flashcard deck")}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                          <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
                            <Users size={12} />
                            {(deck.total_users || 0).toLocaleString()}{" "}
                            {isVietnamese ? "học viên" : "learners"}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {isOwner ? (
                              <span className="rounded-md bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                {isVietnamese ? "Bộ thẻ của bạn" : "Your Deck"}
                              </span>
                            ) : isEnrolled ? (
                              <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                <Check size={12} />
                                {isVietnamese ? "Đã lưu" : "Enrolled"}
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isSaving}
                                className="h-7 gap-1 border-info/40 px-2 text-[11px] font-semibold text-info hover:bg-info/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEnrollCommunityDeck(deck);
                                }}
                              >
                                {isSaving ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Bookmark size={12} />
                                )}
                                <span>{isVietnamese ? "Lưu" : "Save"}</span>
                              </Button>
                            )}

                            <Button
                              size="sm"
                              className="h-7 bg-info px-2.5 text-[11px] font-semibold text-white hover:bg-info/90"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeckClick(deck);
                              }}
                            >
                              {isVietnamese ? "Học ngay" : "Study"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5 flex items-center justify-between rounded-xl border border-dashed border-info/30 bg-info/5 px-4 py-3 text-[13px] text-text-secondary">
                  <span className="flex items-center gap-2">
                    <Sparkles size={16} className="text-info" />
                    {isVietnamese
                      ? "Chưa có bộ thẻ nào được chia sẻ từ học viên. Bạn muốn chia sẻ bộ thẻ cá nhân cho cộng đồng?"
                      : "No user public decks yet. Want to publish your personal deck for others?"}
                  </span>
                  <button
                    onClick={() => navigate("/public-decks")}
                    className="font-semibold text-info hover:underline"
                  >
                    {isVietnamese
                      ? "Xem kho cộng đồng →"
                      : "Visit community repository →"}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* SECTION 4: DANH SÁCH BỘ THẺ VỚI BỘ LỌC ĐA CHIỀU: TARGET BAND, CHỦ ĐỀ & DẠNG BÀI */}
        <section className="mt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-[16px] font-semibold text-text-primary">
                <GraduationCap className="text-primary" size={20} />
                {isVietnamese ? "DANH SÁCH BỘ THẺ" : "ALL VOCABULARY DECKS"}
              </h3>
              <p className="mt-0.5 text-[12px] text-text-secondary">
                {isVietnamese
                  ? "Phân loại theo Mục tiêu điểm số (Target Band), Chủ đề và Dạng bài thi"
                  : "Filtered by Target Band, Topic and Exam Parts"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-text-secondary">
                {filteredPacks.length}{" "}
                {isVietnamese ? "bộ thẻ phù hợp" : "matching decks"}
              </span>
              {(activeBand !== "all" ||
                activeTopic !== "all" ||
                activeTag !== "all") && (
                <button
                  onClick={() => {
                    setActiveBand("all");
                    setActiveTopic("all");
                    setActiveTag("all");
                  }}
                  className="flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 text-[11px] font-medium text-text-tertiary transition hover:text-text-primary"
                >
                  <RotateCcw size={12} />
                  {isVietnamese ? "Đặt lại" : "Reset"}
                </button>
              )}
            </div>
          </div>

          {/* KHUNG BỘ LỌC ĐA CHIỀU */}
          <div className="mt-4 space-y-3 rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm backdrop-blur-sm">
            {/* HÀNG 1: LỌC THEO TARGET BAND */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                  🎯{" "}
                  {isVietnamese
                    ? "Mục tiêu điểm (Target Band):"
                    : "Target Band:"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {targetBands.map((b) => {
                  const isSelected = activeBand === b.value;
                  return (
                    <button
                      key={b.value}
                      onClick={() => setActiveBand(b.value)}
                      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                        isSelected
                          ? "bg-primary text-white shadow-sm ring-2 ring-primary/30"
                          : "bg-surface-subtle text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                      }`}
                    >
                      {isSelected && <Check size={14} />}
                      {isVietnamese ? b.label : b.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* HÀNG 2: LỌC THEO CHỦ ĐỀ TỪ VỰNG (TOPIC) */}
            <div className="border-t border-border/60 pt-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                  🏷️{" "}
                  {isVietnamese
                    ? "Chủ đề từ vựng (Topic):"
                    : "Vocabulary Topic:"}
                </span>
                <span className="text-[11px] text-text-tertiary">
                  {availableTopics.length}{" "}
                  {isVietnamese ? "chủ đề có sẵn" : "topics available"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveTopic("all")}
                  className={`rounded-xl px-3 py-1.5 text-[12px] font-medium transition-all ${
                    activeTopic === "all"
                      ? "bg-text-primary text-surface shadow-sm"
                      : "bg-surface-subtle text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  }`}
                >
                  {isVietnamese ? "Tất cả chủ đề" : "All Topics"}
                </button>
                {availableTopics.slice(0, 10).map((top) => {
                  const isSelected = activeTopic === String(top._id);
                  return (
                    <button
                      key={top._id}
                      onClick={() =>
                        setActiveTopic(isSelected ? "all" : String(top._id))
                      }
                      className={`rounded-xl px-3 py-1.5 text-[12px] font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-white shadow-sm ring-2 ring-primary/30"
                          : "bg-surface-subtle text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                      }`}
                    >
                      {isVietnamese ? top.name_vi || top.name_en : top.name_en}
                    </button>
                  );
                })}
                {availableTopics.length > 10 && (
                  <select
                    value={
                      availableTopics
                        .slice(10)
                        .some((t) => String(t._id) === activeTopic)
                        ? activeTopic
                        : ""
                    }
                    onChange={(e) => setActiveTopic(e.target.value || "all")}
                    aria-label={
                      isVietnamese ? "Chọn chủ đề khác" : "Select more topics"
                    }
                    className="h-[34px] rounded-xl border border-border bg-surface-subtle px-3 text-[12px] font-medium text-text-secondary focus:border-primary focus:outline-none"
                  >
                    <option value="">
                      {isVietnamese ? "Chủ đề khác..." : "More topics..."}
                    </option>
                    {availableTopics.slice(10).map((top) => (
                      <option key={top._id} value={String(top._id)}>
                        {isVietnamese
                          ? top.name_vi || top.name_en
                          : top.name_en}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* HÀNG 3: LỌC NHANH THEO DẠNG BÀI THI (EXAM PART) */}
            <div className="border-t border-border/60 pt-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                  📖 {isVietnamese ? "Dạng bài thi (Exam Part):" : "Exam Part:"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    id: "all",
                    label: isVietnamese ? "Tất cả Part" : "All Parts",
                  },
                  { id: "PART_1", label: "Part 1 (Tranh ảnh)" },
                  { id: "PART_2", label: "Part 2 (Hỏi đáp)" },
                  { id: "PART_3_4", label: "Part 3-4 (Hội thoại & Độc thoại)" },
                  { id: "PART_5_6", label: "Part 5-6 (Ngữ pháp & Đoạn văn)" },
                  { id: "PART_7", label: "Part 7 (Đọc hiểu)" },
                ].map((p) => {
                  const isSelected = activeTag === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActiveTag(p.id)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                        isSelected
                          ? "bg-info text-white shadow-sm ring-2 ring-info/30"
                          : "bg-surface-subtle text-text-tertiary hover:bg-surface-hover hover:text-text-secondary"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-8 flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredPacks.length > 0 ? (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedPacks.map((pack: Deck, idx) => {
                  const packTopic = pack.topic_id
                    ? topicMap.get(String(pack.topic_id))
                    : null;
                  const targetBand = pack.settings?.target_band;
                  const examPart = pack.settings?.exam_part;

                  const isEnrolled = enrolledDeckIdSet.has(String(pack._id || pack.id));

                  return (
                    <Card
                      key={pack._id || idx}
                      className="dashboard-card cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
                      onClick={() => handleDeckClick(pack)}
                    >
                      <div
                        className="relative flex h-24 w-full items-center justify-center"
                        style={{
                          backgroundColor: [
                            "#6b5ce7",
                            "#00b894",
                            "#0984e3",
                            "#fdcb6e",
                          ][idx % 4],
                        }}
                      >
                        <Layers3 className="text-white/60" size={36} />
                        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1">
                          {targetBand && (
                            <span className="rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                              Band {targetBand}
                            </span>
                          )}
                          {examPart && (
                            <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                              {examPart.replace("_", " ")}
                            </span>
                          )}
                        </div>

                        {/* NHÃN ĐÃ LƯU / ĐANG TRONG BỘ THẺ CỦA TÔI */}
                        <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
                          {isEnrolled ? (
                            <span className="flex items-center gap-1 rounded-md bg-emerald-600/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm shadow-sm ring-1 ring-white/30">
                              <Check size={11} />
                              <span>{isVietnamese ? "Đang học" : "Enrolled"}</span>
                            </span>
                          ) : (
                            <span className="rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm flex items-center gap-1">
                              <GraduationCap size={11} className="text-amber-400" />
                              <span>Official</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <CardContent className="p-3.5">
                        {packTopic && (
                          <div className="mb-1.5">
                            <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                              {isVietnamese
                                ? packTopic.name_vi || packTopic.name_en
                                : packTopic.name_en}
                            </span>
                          </div>
                        )}
                        <h4 className="text-[14px] font-semibold text-text-primary line-clamp-1">
                          {isVietnamese && pack.name_vi
                            ? pack.name_vi
                            : pack.name || pack.title}
                        </h4>
                        <p className="mt-1 text-[12px] text-text-secondary line-clamp-2">
                          {isVietnamese && pack.description_vi
                            ? pack.description_vi
                            : pack.description || pack.description_vi}
                        </p>
                        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 text-[12px] text-text-secondary">
                          <span className="font-medium text-text-primary">
                            {pack.card_count ?? 0}{" "}
                            {isVietnamese ? "từ" : "words"}
                          </span>
                          <span className="flex items-center gap-1 text-[12px] text-text-secondary">
                            <Users size={12} />
                            {(pack.total_users || 0).toLocaleString()}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          className={`mt-3 w-full font-medium ${
                            isEnrolled
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-primary hover:bg-primary-hover"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeckClick(pack);
                          }}
                        >
                          {isEnrolled ? (
                            <span className="flex items-center justify-center gap-1.5">
                              <Check size={14} />
                              <span>
                                {isVietnamese
                                  ? "Học tiếp (Bộ thẻ của tôi)"
                                  : "Continue (In My Decks)"}
                              </span>
                            </span>
                          ) : isVietnamese ? (
                            "Bắt đầu học"
                          ) : (
                            "Start Learning"
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={PAGE_SIZE}
                    totalItems={filteredPacks.length}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="text-[14px] font-medium text-text-secondary">
                {isVietnamese
                  ? "Không tìm thấy bộ thẻ nào phù hợp với bộ lọc hiện tại"
                  : "No vocabulary decks match your selected filters"}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setActiveBand("all");
                  setActiveTopic("all");
                  setActiveTag("all");
                }}
              >
                {isVietnamese ? "Xóa toàn bộ bộ lọc" : "Clear all filters"}
              </Button>
            </div>
          )}
        </section>
      </main>

      {/* MODAL CẢNH BÁO XÁC NHẬN CHUYỂN SANG RIÊNG TƯ KHI CÓ NGƯỜI ĐANG LƯU */}
      <Modal
        open={Boolean(pendingPrivacyDeck)}
        onClose={cancelSwitchToPrivate}
        title={
          isVietnamese
            ? "Xác nhận chuyển sang Riêng tư"
            : "Confirm Switch to Private"
        }
      >
        <div className="p-1">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-[14px] text-text-primary">
                {isVietnamese ? (
                  <>
                    Có{" "}
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {pendingPrivacyDeck?.saversCount}
                    </span>{" "}
                    người đang lưu bộ thẻ{" "}
                    <span className="font-semibold">
                      "
                      {pendingPrivacyDeck?.deck.name_vi ||
                        pendingPrivacyDeck?.deck.name}
                      "
                    </span>{" "}
                    của bạn.
                  </>
                ) : (
                  <>
                    There are{" "}
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {pendingPrivacyDeck?.saversCount}
                    </span>{" "}
                    learners who have saved your deck{" "}
                    <span className="font-semibold">
                      "{pendingPrivacyDeck?.deck.name}"
                    </span>
                    .
                  </>
                )}
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-text-secondary">
                {isVietnamese
                  ? "Nếu chuyển sang Riêng tư, bộ thẻ này sẽ không còn xuất hiện trên kho cộng đồng cho những người mới. Tuy nhiên, những học viên đã lưu trước đó vẫn có thể tiếp tục ôn luyện bộ thẻ này trong danh sách của họ."
                  : "If switched to Private, this deck will no longer appear in the community repository for new learners. However, learners who already saved it will still keep it in their personal study list."}
              </p>
              <p className="mt-2 text-[13px] font-medium text-text-primary">
                {isVietnamese
                  ? "Bạn có chắc chắn muốn chuyển bộ thẻ này sang Riêng tư không?"
                  : "Are you sure you want to make this deck private?"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={cancelSwitchToPrivate}>
              {isVietnamese ? "Hủy bỏ" : "Cancel"}
            </Button>
            <Button
              size="sm"
              className="bg-amber-600 font-medium text-white hover:bg-amber-700"
              onClick={confirmSwitchToPrivate}
            >
              {isVietnamese ? "Đồng ý chuyển riêng tư" : "Make Private"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL XÁC NHẬN XÓA BỘ THẺ */}
      <Modal
        open={Boolean(pendingDeleteDeck)}
        onClose={() => {
          if (!isDeleting) setPendingDeleteDeck(null);
        }}
        title={
          pendingDeleteDeck &&
          pendingDeleteDeck.deck.creator_type === "USER" &&
          Boolean((currentUser as any)?.user_id || (currentUser as any)?.id) &&
          ((pendingDeleteDeck.deck as any).creator_id === ((currentUser as any)?.user_id || (currentUser as any)?.id) ||
            (pendingDeleteDeck.deck as any).user_id === ((currentUser as any)?.user_id || (currentUser as any)?.id))
            ? pendingDeleteDeck.saversCount > 0
              ? isVietnamese
                ? "Xác nhận xóa bộ thẻ đang có người theo học"
                : "Confirm Delete Shared Deck"
              : isVietnamese
              ? "Xác nhận xóa vĩnh viễn bộ thẻ"
              : "Confirm Permanent Deletion"
            : isVietnamese
            ? "Gỡ bộ thẻ khỏi danh sách"
            : "Remove from My Decks"
        }
      >
        {pendingDeleteDeck && (
          (() => {
            const { deck, saversCount } = pendingDeleteDeck;
            const currentUserId = (currentUser as any)?.user_id || (currentUser as any)?.id;
            const isOwn =
              deck.creator_type === "USER" &&
              Boolean(currentUserId) &&
              ((deck as any).creator_id === currentUserId ||
                (deck as any).user_id === currentUserId);
            const deckTitle =
              isVietnamese && deck.name_vi
                ? deck.name_vi
                : deck.name || (deck as any).title;

            // Ngữ cảnh 1: Bộ thẻ do mình tạo VÀ đang có học viên khác lưu học
            if (isOwn && saversCount > 0) {
              return (
                <div className="p-1">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
                      <AlertTriangle size={22} />
                    </div>
                    <div>
                      <p className="text-[14px] text-text-primary">
                        {isVietnamese ? (
                          <>
                            Có{" "}
                            <span className="font-bold text-amber-600 dark:text-amber-400">
                              {saversCount}
                            </span>{" "}
                            người đang lưu và học bộ thẻ{" "}
                            <span className="font-semibold text-text-primary">
                              "{deckTitle}"
                            </span>{" "}
                            của bạn.
                          </>
                        ) : (
                          <>
                            There are{" "}
                            <span className="font-bold text-amber-600 dark:text-amber-400">
                              {saversCount}
                            </span>{" "}
                            learners actively studying your deck{" "}
                            <span className="font-semibold">"{deckTitle}"</span>.
                          </>
                        )}
                      </p>
                      <p className="mt-2 text-[12.5px] leading-relaxed text-text-secondary">
                        {isVietnamese
                          ? "Nếu bạn xóa, bộ thẻ này sẽ biến mất vĩnh viễn khỏi danh sách của bạn và rút khỏi kho cộng đồng. Tuy nhiên, để không làm mất dữ liệu học tập và chuỗi ghi nhớ SRS của các học viên đã lưu trước đó, họ vẫn sẽ được giữ lại bản sao để tiếp tục ôn tập."
                          : "If deleted, this deck will be permanently removed from your personal account and withdrawn from the community repository. However, learners who already saved it will retain their copy to avoid losing their SRS learning progress."}
                      </p>
                      <p className="mt-2 text-[13px] font-medium text-text-primary">
                        {isVietnamese
                          ? "Bạn có chắc chắn muốn xóa bộ thẻ này khỏi tài khoản của mình không?"
                          : "Are you sure you want to remove this deck from your account?"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-2.5">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isDeleting}
                      onClick={() => setPendingDeleteDeck(null)}
                    >
                      {isVietnamese ? "Hủy bỏ" : "Cancel"}
                    </Button>
                    <Button
                      size="sm"
                      disabled={isDeleting}
                      className="bg-amber-600 font-medium text-white hover:bg-amber-700"
                      onClick={handleDeleteDeckConfirm}
                    >
                      {isDeleting
                        ? isVietnamese
                          ? "Đang xóa..."
                          : "Deleting..."
                        : isVietnamese
                        ? "Đồng ý xóa khỏi tài khoản"
                        : "Remove from My Account"}
                    </Button>
                  </div>
                </div>
              );
            }

            // Ngữ cảnh 2: Bộ thẻ do mình tạo NHƯNG chưa có ai khác lưu (xóa vĩnh viễn)
            if (isOwn) {
              return (
                <div className="p-1">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                      <Trash2 size={22} />
                    </div>
                    <div>
                      <p className="text-[14px] text-text-primary">
                        {isVietnamese ? (
                          <>
                            Bạn có chắc muốn xóa vĩnh viễn bộ thẻ{" "}
                            <span className="font-semibold text-text-primary">
                              "{deckTitle}"
                            </span>{" "}
                            không?
                          </>
                        ) : (
                          <>
                            Are you sure you want to permanently delete deck{" "}
                            <span className="font-semibold">"{deckTitle}"</span>?
                          </>
                        )}
                      </p>
                      <p className="mt-2 text-[12.5px] leading-relaxed text-text-secondary">
                        {isVietnamese
                          ? "Hành động này không thể hoàn tác. Chưa có học viên nào khác lưu bộ thẻ này, toàn bộ các thẻ từ vựng bên trong sẽ bị xóa vĩnh viễn khỏi hệ thống."
                          : "This action cannot be undone. No other learners have saved this deck, and all cards within will be permanently deleted."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-2.5">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isDeleting}
                      onClick={() => setPendingDeleteDeck(null)}
                    >
                      {isVietnamese ? "Hủy bỏ" : "Cancel"}
                    </Button>
                    <Button
                      size="sm"
                      disabled={isDeleting}
                      className="bg-destructive font-medium text-white hover:bg-destructive/90"
                      onClick={handleDeleteDeckConfirm}
                    >
                      {isDeleting
                        ? isVietnamese
                          ? "Đang xóa..."
                          : "Deleting..."
                        : isVietnamese
                        ? "Xóa vĩnh viễn"
                        : "Permanently Delete"}
                    </Button>
                  </div>
                </div>
              );
            }

            // Ngữ cảnh 3: Bộ thẻ hệ thống hoặc bộ thẻ người khác lưu về (Gỡ khỏi danh sách học)
            return (
              <div className="p-1">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                    <Trash2 size={22} />
                  </div>
                  <div>
                    <p className="text-[14px] text-text-primary">
                      {isVietnamese ? (
                        <>
                          Bạn có chắc muốn gỡ bộ thẻ{" "}
                          <span className="font-semibold text-text-primary">
                            "{deckTitle}"
                          </span>{" "}
                          khỏi danh sách học của bạn?
                        </>
                      ) : (
                        <>
                          Are you sure you want to remove{" "}
                          <span className="font-semibold">"{deckTitle}"</span> from your study list?
                        </>
                      )}
                    </p>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-text-secondary">
                      {isVietnamese
                        ? "Bộ thẻ sẽ được gỡ khỏi danh sách 'Bộ thẻ của tôi'. Bạn vẫn có thể tìm thấy và lưu lại bộ thẻ này bất cứ lúc nào từ kho thư viện."
                        : "This deck will be removed from your personal list. You can re-enroll or study it again from the library anytime."}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => setPendingDeleteDeck(null)}
                  >
                    {isVietnamese ? "Hủy bỏ" : "Cancel"}
                  </Button>
                  <Button
                    size="sm"
                    disabled={isDeleting}
                    className="bg-destructive font-medium text-white hover:bg-destructive/90"
                    onClick={handleDeleteDeckConfirm}
                  >
                    {isDeleting
                      ? isVietnamese
                        ? "Đang gỡ..."
                        : "Removing..."
                      : isVietnamese
                      ? "Gỡ khỏi danh sách"
                      : "Remove"}
                  </Button>
                </div>
              </div>
            );
          })()
        )}
      </Modal>
    </>
  );
}
