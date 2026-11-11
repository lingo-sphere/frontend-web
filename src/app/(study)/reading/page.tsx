// Màn hình chính phân hệ Reading Practice với 4 danh mục phụ và danh sách bài đọc.
"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  return (
    <Suspense fallback={<p>Đang tải Reading…</p>}>
      <ReadingPractice />
    </Suspense>
  );
}

function ReadingPractice() {
  const params = useSearchParams(),
    router = useRouter(),
    queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.user_id);
  const activeTab = TABS.some((tab) => tab.id === params.get("tab"))
    ? (params.get("tab") as ReadingType)
    : "PART_7";
  const selectedContextId = params.get("context_id") || null;
  const currentPage = Math.max(1, Number(params.get("page")) || 1);
  const sessionId = params.get("session"),
    attemptId = params.get("attempt"),
    historyView = params.get("view") === "history";
  const [pendingPassage, setPendingPassage] = useState<ReadingPassage | null>(
    null
  );
  const [error, setError] = useState(""),
    [starting, setStarting] = useState(false);
  const startRef = useRef<{ key: string; id: string } | null>(null);
  const startingRef = useRef(false);
  const navigate = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [name, value] of Object.entries(patch)) {
      if (value === null) next.delete(name);
      else next.set(name, value);
    }
    router.push("/reading?" + next.toString());
  };
  const login = () =>
    window.dispatchEvent(new CustomEvent("lingosphere:open-auth-modal"));
  const catalog = useQuery({
    queryKey: ["reading-passages", activeTab, selectedContextId, currentPage],
    queryFn: () =>
      readingPracticeService.getPassages({
        reading_type: activeTab,
        context_id: selectedContextId || undefined,
        page: currentPage,
        limit: 20,
      }),
    enabled: !sessionId && !attemptId && !historyView,
  });
  const active = useQuery({
    queryKey: ["reading-active", userId],
    queryFn: () => readingPracticeService.activeSessions(),
    enabled: Boolean(userId) && !sessionId && !attemptId,
    staleTime: 0,
  });
  const session = useQuery({
    queryKey: ["reading-session", userId, sessionId],
    queryFn: () => readingPracticeService.getSession(sessionId!),
    enabled: Boolean(userId && sessionId),
    retry: false,
    refetchOnWindowFocus: false,
  });
  const review = useQuery({
    queryKey: ["reading-review", userId, attemptId],
    queryFn: () => readingPracticeService.reviewAttempt(attemptId!),
    enabled: Boolean(userId && attemptId),
    retry: false,
  });
  const history = useQuery({
    queryKey: ["reading-history", userId, currentPage],
    queryFn: () =>
      readingPracticeService.getAttemptHistory(undefined, {
        limit: 20,
        page: currentPage,
      }),
    enabled: Boolean(userId && historyView),
    staleTime: 0,
  });
  const home = () => {
    void queryClient.invalidateQueries({ queryKey: ["reading-active"] });
    void queryClient.invalidateQueries({ queryKey: ["reading-history"] });
    navigate({ session: null, attempt: null });
  };
  const begin = async (mode: TimerPresetMode) => {
    if (!pendingPassage || startingRef.current) return;
    if (!userId) {
      login();
      return;
    }
    startingRef.current = true;
    setStarting(true);
    setError("");
    const key = pendingPassage._id + ":" + mode;
    if (startRef.current?.key !== key)
      startRef.current = { key, id: crypto.randomUUID() };
    try {
      const result = await readingPracticeService.startSession({
        passage_id: pendingPassage._id,
        time_mode: mode,
        session_key: startRef.current.id,
      });
      queryClient.setQueryData(
        ["reading-session", userId, result.session_id],
        result
      );
      navigate({ session: result.session_id, attempt: null, view: null });
      setPendingPassage(null);
      startRef.current = null;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Chưa mở được phiên luyện. Hãy thử lại."
      );
    } finally {
      startingRef.current = false;
      setStarting(false);
    }
  };
  if (sessionId || attemptId) {
    if (!userId)
      return (
        <main className="p-6">
          <p>Đăng nhập để mở bài Reading của bạn.</p>
          <Button onClick={login}>Đăng nhập</Button>
        </main>
      );
    const query = sessionId ? session : review;
    if (query.isPending)
      return (
        <p role="status" className="p-6">
          Đang tải bài Reading…
        </p>
      );
    if (query.error)
      return (
        <main role="alert" className="p-6">
          <p>{query.error.message}</p>
          <Button onClick={() => void query.refetch()}>Thử lại</Button>
          <Button onClick={home}>Về danh sách</Button>
        </main>
      );
    if (sessionId && session.data)
      return (
        <ReadingWorkspace
          key={userId + sessionId}
          passage={session.data.passage}
          session={session.data}
          timeLimitSeconds={session.data.time_limit_seconds}
          onBack={home}
          onComplete={home}
        />
      );
    if (attemptId && review.data)
      return (
        <ReadingWorkspace
          key={userId + attemptId}
          passage={review.data.passage}
          initialResult={review.data.result}
          timeLimitSeconds={0}
          onBack={home}
          onComplete={home}
        />
      );
  }
  return (
    <main className="w-full space-y-6 px-4 py-5 sm:px-6 sm:py-7">
      <header className="rounded-3xl bg-primary p-6 text-white">
        <h1 className="text-2xl font-bold">Luyện đọc Reading</h1>
        <p className="mt-2 text-sm">
          Part 6, Part 7, nhiệm vụ thực tế và nối thông tin.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={historyView ? "outline" : "default"}
          onClick={() => navigate({ view: null, page: null })}
        >
          Danh sách bài đọc
        </Button>
        <Button
          variant={historyView ? "default" : "outline"}
          onClick={() => {
            if (!userId) login();
            else navigate({ view: "history", page: null });
          }}
        >
          Lịch sử làm bài
        </Button>
      </div>
      {historyView ? (
        <section className="space-y-3">
          <h2 className="font-bold">Lịch sử Reading</h2>
          {history.isPending ? (
            <p>Đang tải lịch sử…</p>
          ) : history.error ? (
            <div role="alert">
              {history.error.message}
              <Button onClick={() => void history.refetch()}>Thử lại</Button>
            </div>
          ) : history.data?.length ? (
            history.data.map((attempt) => (
              <button
                type="button"
                key={attempt._id}
                onClick={() =>
                  navigate({ attempt: attempt._id, session: null })
                }
                className="flex w-full items-center justify-between rounded-xl border border-border p-4 text-left"
              >
                <span>
                  {new Date(attempt.completed_at).toLocaleString("vi-VN")} ·{" "}
                  {attempt.correct_count}/{attempt.total_questions} câu đúng
                </span>
                <strong>{attempt.score_percent}% · Xem lại</strong>
              </button>
            ))
          ) : (
            <p>Chưa có bài Reading đã hoàn tất.</p>
          )}
          <div className="flex gap-3">
            <Button
              disabled={currentPage === 1}
              onClick={() => navigate({ page: String(currentPage - 1) })}
            >
              Trang trước
            </Button>
            <span>Trang {currentPage}</span>
            <Button
              disabled={(history.data?.length || 0) < 20}
              onClick={() => navigate({ page: String(currentPage + 1) })}
            >
              Trang sau
            </Button>
          </div>
        </section>
      ) : (
        <>
          {active.data && active.data.length > 0 && (
            <section className="space-y-2 rounded-xl border border-primary/30 p-4">
              <h2 className="font-bold">Bài đang làm</h2>
              {active.data.map((row) => (
                <div
                  key={row.session_id}
                  className="flex items-center justify-between gap-3"
                >
                  <span>{row.passage_title}</span>
                  <Button
                    onClick={() =>
                      navigate({ session: row.session_id, attempt: null })
                    }
                  >
                    Tiếp tục
                  </Button>
                </div>
              ))}
            </section>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  navigate({ tab: tab.id, context_id: null, page: null })
                }
                className={
                  "rounded-xl border p-4 text-left " +
                  (activeTab === tab.id
                    ? "bg-primary text-white"
                    : "border-border")
                }
              >
                <Icon name={tab.icon} size={20} />
                <h2 className="mt-2 text-sm font-bold">{tab.label}</h2>
                <p className="mt-1 text-xs">{tab.description}</p>
              </button>
            ))}
          </div>
          <ReadingContextNavigation
            selectedContextId={selectedContextId}
            onSelectContext={(id) => navigate({ context_id: id, page: null })}
          />
          <h2 className="font-bold">
            Danh sách bài đọc ({catalog.data?.pagination.total ?? 0})
          </h2>
          {catalog.isPending ? (
            <p role="status">Đang tải danh sách…</p>
          ) : catalog.error ? (
            <div role="alert" className="rounded-xl border border-red-300 p-4">
              Không tải được danh sách: {catalog.error.message}
              <Button onClick={() => void catalog.refetch()}>Thử lại</Button>
            </div>
          ) : !catalog.data?.passages.length ? (
            <p>Chưa có bài đọc nào phù hợp bộ lọc.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {catalog.data.passages.map((passage) => (
                <Card key={passage._id}>
                  <CardContent className="space-y-3 p-5">
                    <h3 className="font-bold">
                      {passage.title_vi || passage.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-text-secondary">
                      {passage.content_summary || passage.content}
                    </p>
                    <p className="text-xs">
                      {passage.cefr_level} · {passage.word_count || 0} từ ·{" "}
                      {passage.question_count || 0} câu hỏi
                    </p>
                    <Button
                      disabled={!passage.question_count}
                      onClick={() => {
                        if (!userId) login();
                        else {
                          setPendingPassage(passage);
                          setError("");
                        }
                      }}
                    >
                      Luyện tập ngay
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3">
            <Button
              disabled={currentPage === 1 || catalog.isFetching}
              onClick={() => navigate({ page: String(currentPage - 1) })}
            >
              Trang trước
            </Button>
            <span>
              Trang {currentPage}/
              {Math.max(1, catalog.data?.pagination.total_pages || 1)}
            </span>
            <Button
              disabled={
                catalog.isFetching ||
                currentPage >= (catalog.data?.pagination.total_pages || 1)
              }
              onClick={() => navigate({ page: String(currentPage + 1) })}
            >
              Trang sau
            </Button>
          </div>
        </>
      )}
      {pendingPassage && (
        <ReadingTimeModeSelector
          questionCount={pendingPassage.question_count || 0}
          onSelect={(mode) => {
            void begin(mode);
          }}
          onCancel={() => {
            if (!starting) {
              setPendingPassage(null);
              startRef.current = null;
            }
          }}
          isStarting={starting}
          error={error}
        />
      )}
    </main>
  );
}
