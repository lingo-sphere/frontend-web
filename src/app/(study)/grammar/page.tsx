// Trang Luyện tập Ngữ Pháp theo cấp độ CEFR (A1 - C1) & Tra cứu lý thuyết ngữ pháp
"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/card";
import { Button } from "@/components/button";
import { SectionHeading } from "@/features/dashboard/components/section.heading";
import { Icon } from "@/components/icon.map";
import { toast } from "@/store/toast.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { grammarPracticeService } from "@/features/practice/services/grammar-practice.service";
import { GrammarHistory } from "@/features/practice/components/grammar.history";
import { GrammarWorkspace } from "@/features/practice/components/grammar.workspace";
import { useSearchParams, useNavigate } from "@/lib/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { GrammarTopicItem } from "@/features/practice/types/grammar-practice";

import { GrammarHandbook } from "@/features/vocabulary/components/grammar.handbook";
import { handbookReturnUrl } from "@/features/vocabulary/lib/grammar-handbook";
import { SpeakingGrammarSourceBanner } from "@/features/practice/components/speaking.grammar.source";
import { speakingGrammarService } from "@/features/practice/services/speaking-grammar.service";

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function GrammarAppPage() {
  const { i18n } = useTranslation();
  const isVietnamese = i18n.language === "vi";

  const user = useAuthStore((s) => s.user);
  const userId = user?.user_id;

  const searchParams = useSearchParams();
  const navigate = useNavigate(),
    queryClient = useQueryClient();
  const sessionId = searchParams.get("session");
  const rawTheorySlug = searchParams.get("theory");
  const theorySlug = rawTheorySlug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rawTheorySlug) ? rawTheorySlug : null;
  const theoryTargets = useQuery({
    queryKey: ["grammar-theory-targets", theorySlug, userId],
    queryFn: () => grammarPracticeService.getTheoryTargets(theorySlug!),
    enabled: Boolean(theorySlug && sessionId && userId),
    staleTime: 30_000,
    retry: 1,
  });
  const urlSearch = searchParams.get("search");
  const urlLevel = searchParams.get("level") as
    | "A1"
    | "A2"
    | "B1"
    | "B2"
    | "C1"
    | "C2"
    | null;

  const view = searchParams.get("view");
  const activeTab = view === "history" ? "history"
    : view === "handbook" ? "handbook" : view === "practice" ? "practice"
    : urlSearch ? "handbook" : "practice";
  const navigateView = useCallback((patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) next.delete(key); else next.set(key, value);
    }
    navigate("/grammar?" + next.toString());
  }, [searchParams, navigate]);
  const selectedLevel = urlLevel && ["A1", "A2", "B1", "B2", "C1", "C2"].includes(urlLevel) ? urlLevel : "A1";
  const setSelectedLevel = (level: string) => navigateView({ level });
  const [startingSessionTopicId, setStartingSessionTopicId] = useState<
    string | null
  >(null);
  const [showAllPending, setShowAllPending] = useState(false);
  const startingRef = useRef(false);
  const startKey = useRef<{ topic: string; value: string } | null>(null);
  const levelsQuery = useQuery({
    queryKey: ["grammar-levels", userId, "authenticated-progress"],
    queryFn: () => grammarPracticeService.getLevels(userId),
    enabled: activeTab === "practice" && !sessionId,
  });
  const topicsQuery = useQuery({
    queryKey: ["grammar-topics", userId, selectedLevel, "authenticated-progress"],
    queryFn: () => grammarPracticeService.getTopics(selectedLevel, userId),
    enabled: activeTab === "practice" && !sessionId,
  });
  const sessionsQuery = useQuery({
    queryKey: ["grammar-sessions", userId, "pending", 50],
    queryFn: () => grammarPracticeService.getSessions(1, { limit: 50, status: "IN_PROGRESS" }),
    enabled: Boolean(userId) && !sessionId && activeTab === "practice",
    staleTime: 0,
  });
  const sessionQuery = useQuery({
    queryKey: ["grammar-session", userId, sessionId],
    queryFn: () => grammarPracticeService.getSession(sessionId!),
    enabled: Boolean(userId && sessionId),
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const levels = levelsQuery.data || [],
    topics = topicsQuery.data || [],
    isLoadingTopics = topicsQuery.isPending;
  const activeSession = sessionQuery.data;
  const matchingTheory = theorySlug && activeSession && theoryTargets.data?.links.some(link => link.topic?._id === activeSession.grammar_knowledge_id);
  const theoryReturnUrl = matchingTheory
    ? `/grammar/handbook/${encodeURIComponent(theorySlug!)}?${handbookReturnUrl(new URLSearchParams(searchParams)).split('?')[1]}`
    : null;
  const navigateSession = (id: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (id) next.set("session", id);
    else next.delete("session");
    navigate("/grammar?" + next.toString());
  };
  const login = () =>
    window.dispatchEvent(new CustomEvent("lingosphere:open-auth-modal"));
  const closeSession = () => {
    for (const key of ["grammar-levels", "grammar-topics", "grammar-sessions"])
      void queryClient.invalidateQueries({ queryKey: [key] });
    if (activeSession?.speaking_grammar_source) navigate(`/${activeSession.speaking_grammar_source.source_kind === 'WRITING' ? 'writing' : 'speaking'}/result/${encodeURIComponent(activeSession.speaking_grammar_source.attempt_id)}`);
    else if (theoryReturnUrl) navigate(theoryReturnUrl);
    else navigateSession(null);
  };

  const handleStartPractice = async (topic: GrammarTopicItem) => {
    if (!userId) {
      login();
      return;
    }
    if (startingRef.current) return;
    startingRef.current = true;
    setStartingSessionTopicId(topic._id);
    startKey.current ??= { topic: topic._id, value: crypto.randomUUID() };
    if (startKey.current.topic !== topic._id)
      startKey.current = { topic: topic._id, value: crypto.randomUUID() };
    try {
      const source = activeSession?.speaking_grammar_source;
      const session = source && topic._id === activeSession?.grammar_knowledge_id
        ? await speakingGrammarService.start(source.attempt_id, source.issue_id, startKey.current.value, source.source_kind)
        : await grammarPracticeService.createSession({
        grammar_knowledge_id: topic._id,
        cefr_level: topic.cefr_level,
        question_count: 10,
        session_key: startKey.current.value,
      });
      queryClient.setQueryData(
        ["grammar-session", userId, session.session_id],
        session
      );
      navigateSession(session.session_id);
      startKey.current = null;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không tạo được phiên luyện tập"
      );
    } finally {
      startingRef.current = false;
      setStartingSessionTopicId(null);
    }
  };

  // Current Level Meta
  const currentLevelSummary = levels.find((l) => l.level === selectedLevel);

  if (sessionId) {
    if (!userId)
      return (
        <main className="p-6">
          <Button onClick={login}>Đăng nhập để mở phiên Grammar</Button>
        </main>
      );
    if (sessionQuery.isPending || sessionQuery.isFetching)
      return (
        <p role="status" className="p-6">
          Đang mở phiên Grammar…
        </p>
      );
    if (sessionQuery.error || !activeSession)
      return (
        <div role="alert" className="p-6">
          Không mở được phiên: {sessionQuery.error?.message}
          <Button onClick={() => void sessionQuery.refetch()}>Thử lại</Button>
          <Button onClick={closeSession}>Quay lại</Button>
        </div>
      );
    return (
      <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {activeSession.speaking_grammar_source && <SpeakingGrammarSourceBanner source={activeSession.speaking_grammar_source} />}
        <GrammarWorkspace
          key={activeSession.session_id}
          session={activeSession}
          userId={userId}
          onClose={closeSession}
          backLabel={activeSession.speaking_grammar_source ? (isVietnamese ? `Về kết quả ${activeSession.speaking_grammar_source.source_kind === 'WRITING' ? 'Writing' : 'Speaking'}` : `Back to ${activeSession.speaking_grammar_source.source_kind === 'WRITING' ? 'Writing' : 'Speaking'} result`) : theoryReturnUrl ? (isVietnamese ? 'Quay lại lý thuyết' : 'Back to theory') : activeTab === 'history' ? (isVietnamese ? 'Về lịch sử làm bài' : 'Back to history') : undefined}
          onRetry={() => {
            void handleStartPractice({
              _id: activeSession.grammar_knowledge_id || "",
              cefr_level: activeSession.cefr_level,
            } as GrammarTopicItem);
          }}
        />
      </main>
    );
  }

  return (
    <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          eyebrow={isVietnamese ? "Luyện tập Ngữ Pháp" : "Grammar Practice"}
          title={isVietnamese ? "Ngữ pháp tiếng Anh" : "English Grammar"}
          description={
            isVietnamese
              ? "Luyện tập theo 6 cấp độ CEFR từ nền tảng đến nâng cao kèm giải thích chi tiết."
              : "Practice across 6 CEFR levels with interactive exercises and clear explanations."
          }
        />

      </div>
      <nav aria-label={isVietnamese ? "Điều hướng Ngữ pháp" : "Grammar navigation"} className="mt-6 flex flex-wrap gap-2">
        <Button variant={activeTab === "practice" ? "default" : "outline"} aria-current={activeTab === "practice" ? "page" : undefined} onClick={() => navigateView({ view: "practice" })}>{isVietnamese ? "Danh sách bài ngữ pháp" : "Grammar exercises"}</Button>
        <Button variant={activeTab === "history" ? "default" : "outline"} aria-current={activeTab === "history" ? "page" : undefined} onClick={() => navigateView({ view: "history" })}>{isVietnamese ? "Lịch sử làm bài" : "Submission history"}</Button>
        <Button variant={activeTab === "handbook" ? "default" : "outline"} aria-current={activeTab === "handbook" ? "page" : undefined} onClick={() => navigateView({ view: "handbook" })}>{isVietnamese ? "Tra cứu lý thuyết" : "Grammar handbook"}</Button>
      </nav>
      {activeTab === "history" && <GrammarHistory navigate={navigateView} onOpenSession={navigateSession} />}

      {/* ==================================================================== */}
      {/* TAB 1: LUYỆN TẬP THEO CẤP ĐỘ (A1 - C1) */}
      {/* ==================================================================== */}
      {activeTab === "practice" && (
        <div className="mt-8 space-y-6">
          {levelsQuery.error && <div role="alert">Không tải được tiến độ cấp độ. <Button onClick={() => void levelsQuery.refetch()}>Thử lại</Button></div>}
          {sessionsQuery.error && <div role="alert" className="rounded-xl border border-border p-4 text-sm">{isVietnamese ? "Không tải được phiên đang làm." : "Could not load unfinished sessions."} <Button variant="ghost" size="sm" onClick={() => void sessionsQuery.refetch()}>{isVietnamese ? "Thử lại phiên đang làm" : "Retry unfinished sessions"}</Button></div>}
          {!!sessionsQuery.data?.items.length && <section aria-label="Phiên Ngữ pháp đang làm" className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <h2 className="font-semibold text-text-primary">{isVietnamese ? "Tiếp tục phiên đang làm" : "Continue unfinished practice"}</h2>
            <div id="grammar-pending-sessions" className="flex flex-wrap gap-2">
              {sessionsQuery.data.items.slice(0, showAllPending ? undefined : 5).map(row => (
                <Button key={row.session_id} variant="outline" size="sm" className="h-auto min-h-8 max-w-full whitespace-normal py-1 text-left" onClick={() => navigateSession(row.session_id)}>
                  {isVietnamese ? row.topic_name_vi : row.topic_name_en || row.topic_name_vi} · {row.cefr_level} · {row.answered_questions}/{row.total_questions}
                  {row.started_at && ` · ${new Date(row.started_at).toLocaleDateString(isVietnamese ? "vi-VN" : "en-US")}`}
                </Button>
              ))}
            </div>
            {sessionsQuery.data.items.length > 5 && <Button size="sm" variant="ghost" aria-expanded={showAllPending} aria-controls="grammar-pending-sessions" onClick={() => setShowAllPending(value => !value)}>{showAllPending ? (isVietnamese ? "Thu gọn" : "Show fewer") : (isVietnamese ? `Xem thêm ${sessionsQuery.data.items.length - 5} phiên` : `Show ${sessionsQuery.data.items.length - 5} more sessions`)}</Button>}
            {showAllPending && sessionsQuery.data.total > sessionsQuery.data.items.length && <Button size="sm" variant="ghost" onClick={() => navigateView({ view: "history", history_status: "IN_PROGRESS", history_page: null })}>{isVietnamese ? `Xem tất cả ${sessionsQuery.data.total} phiên đang làm` : `View all ${sessionsQuery.data.total} unfinished sessions`}</Button>}
          </section>}
          {/* 5 CEFR LEVEL SELECTOR */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
            {[
              { level: "A1", name: "Beginner", desc: "Nền tảng" },
              { level: "A2", name: "Elementary", desc: "Giao tiếp cơ bản" },
              { level: "B1", name: "Intermediate", desc: "Độc lập" },
              { level: "B2", name: "Upper-Inter", desc: "Cấu trúc phức tạp" },
              { level: "C1", name: "Advanced", desc: "Nâng cao" },
              { level: "C2", name: "Proficiency", desc: "Thành thạo" },
            ].map((lvlItem) => {
              const isSelected = selectedLevel === lvlItem.level;
              const lvlData = levels.find((l) => l.level === lvlItem.level);
              const isUnlocked = lvlData
                ? lvlData.is_unlocked
                : lvlItem.level === "A1";

              return (
                <button
                  key={lvlItem.level}
                  type="button"
                  disabled={
                    !isUnlocked ||
                    levelsQuery.isPending ||
                    Boolean(levelsQuery.error)
                  }
                  onClick={() =>
                    setSelectedLevel(lvlItem.level as typeof selectedLevel)
                  }
                  className={`relative flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20"
                      : "border-border bg-surface-subtle hover:border-primary/40 hover:bg-surface-elevated"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span
                      className={`text-base font-black ${
                        isSelected ? "text-primary" : "text-text-primary"
                      }`}
                    >
                      {lvlItem.level}
                    </span>
                    {!isUnlocked ? (
                      <Icon
                        name="lock"
                        size={14}
                        className="text-text-tertiary"
                      />
                    ) : (
                      <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-bold text-success">
                        Mở
                      </span>
                    )}
                  </div>
                  <span className="mt-1 text-xs font-semibold text-text-primary">
                    {lvlItem.name}
                  </span>
                  <span className="text-[11px] text-text-tertiary">
                    {lvlItem.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Level Summary Header Banner */}
          {currentLevelSummary && (
            <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary px-2 py-0.5 text-xs font-bold text-white">
                    Level {currentLevelSummary.level}
                  </span>
                  <h3 className="text-base font-bold text-text-primary">
                    {currentLevelSummary.display_name} —{" "}
                    {currentLevelSummary.meaning}
                  </h3>
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  Hoàn thành 80% chủ điểm và đạt 80% độ chính xác để tự động mở
                  khóa level kế tiếp.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <Icon name="bookCheck" size={15} className="text-primary" />
                  <span>{topics.length} chủ đề</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="award" size={15} className="text-success" />
                  <span>
                    {currentLevelSummary.total_attempts === 0
                      ? (isVietnamese ? 'Chưa có dữ liệu độ chính xác' : 'No accuracy data yet')
                      : `${currentLevelSummary.accuracy_rate}% ${isVietnamese ? 'độ chính xác' : 'accuracy'}`}
                  </span>
                  {!!currentLevelSummary.total_attempts && (
                    <span className="text-text-tertiary">({currentLevelSummary.total_correct}/{currentLevelSummary.total_attempts} {isVietnamese ? 'câu đúng' : 'correct'})</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Topic Cards Grid */}
          {topicsQuery.error ? (
            <div role="alert">
              Không tải được chủ điểm.{" "}
              <Button onClick={() => void topicsQuery.refetch()}>
                Thử lại
              </Button>
            </div>
          ) : isLoadingTopics ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-text-secondary">
                Đang tải danh sách chủ đề ngữ pháp...
              </p>
            </div>
          ) : topics.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <Icon
                name="bookOpen"
                size={36}
                className="mx-auto mb-2 text-text-tertiary opacity-40"
              />
              <p className="text-sm text-text-secondary">
                Chưa có bài tập cho cấp độ này.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => {
                const isStarting = startingSessionTopicId === topic._id;

                return (
                  <Card
                    key={topic._id}
                    className="flex flex-col justify-between border border-border bg-surface-subtle transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <CardContent className="p-5 space-y-4">
                      {/* Meta badge */}
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                          {topic.category}
                        </span>
                        <span className="text-xs text-text-tertiary">
                          {topic.total_questions} bài tập
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="text-base font-bold text-text-primary line-clamp-1">
                          {topic.name_vi || topic.name_en}
                        </h4>
                        <p className="text-xs text-text-secondary line-clamp-1">
                          {topic.name_en}
                        </p>
                      </div>

                      {/* Formula pattern box */}
                      {topic.structure_pattern && (
                        <div className="rounded-lg bg-surface-elevated p-2.5 border border-border">
                          <span className="text-[10px] font-semibold uppercase text-text-tertiary block">
                            Cấu trúc:
                          </span>
                          <span className="font-mono text-xs font-bold text-primary block mt-0.5 line-clamp-1">
                            {topic.structure_pattern}
                          </span>
                        </div>
                      )}

                      {/* Primary Button */}
                      <Button
                        variant="default"
                        disabled={
                          Boolean(startingSessionTopicId) ||
                          !topic.is_unlocked ||
                          topic.total_questions < 6 ||
                          levelsQuery.isPending ||
                          Boolean(levelsQuery.error)
                        }
                        onClick={() => handleStartPractice(topic)}
                        className="w-full gap-2 mt-2 shadow-sm font-semibold"
                      >
                        <Icon name="play" size={14} />
                        <span>
                          {isStarting
                            ? "Đang tạo phiên..."
                            : !topic.is_unlocked
                            ? "Chưa mở khóa"
                            : topic.total_questions < 6
                            ? "Chưa đủ 6 câu"
                            : "Luyện tập ngay"}
                        </span>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: TRA CỨU LÝ THUYẾT (HANDBOOK) */}
      {/* ==================================================================== */}
      {activeTab === "handbook" && <GrammarHandbook vi={isVietnamese} />}
    </main>
  );
}
