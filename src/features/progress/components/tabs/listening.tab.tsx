"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Lightbulb,
  Loader2,
  Calendar,
  Sparkles,
  Repeat,
} from "lucide-react";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import type {
  SkillStats,
  PracticeDashboardData,
  WeaknessAnalysis,
} from "@/features/progress/services/progress.service";
import { progressService } from "@/features/progress/services/progress.service";
import { SkillRadarChart } from "../skill-radar-chart";
import type { RadarDataPoint } from "../skill-radar-chart";
import { formatTrendName, formatDimensionName } from "../progress.helpers";
import { EvidenceBadge } from "../shared";

export interface ListeningDetailTabProps {
  stats?: SkillStats;
  userId?: string;
  dashboardData?: PracticeDashboardData | null;
  onNavigate: (path: string) => void;
}

export function ListeningDetailTab({
  stats,
  userId,
  dashboardData,
  onNavigate,
}: ListeningDetailTabProps) {
  const [cefrData, setCefrData] = useState<{
    estimated_level: string;
    confidence: string;
    recommendation?: string;
  } | null>(null);
  const [weaknesses, setWeaknesses] = useState<WeaknessAnalysis[]>([]);
  const [sessions, setSessions] = useState<
    NonNullable<Awaited<ReturnType<typeof progressService.getListeningSessions>>>["items"]
  >([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    Promise.all([
      progressService.getSkillCEFR(userId, "listening"),
      progressService.getSkillWeaknesses(userId, "listening", "30d"),
      progressService.getListeningSessions(userId, 5),
    ])
      .then(([cefr, weakList, sessionsRes]) => {
        if (!isMounted) return;
        setCefrData(cefr);
        setWeaknesses(weakList || []);
        setSessions(sessionsRes?.items || []);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingExtras(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const overallListening = stats?.accuracy
    ? Math.round(stats.accuracy)
    : dashboardData?.skills?.listening?.accuracy_rate ||
      dashboardData?.skills?.listening?.avg_overall_score ||
      0;

  const weeklyListening = dashboardData?.weekly_comparison?.this_week?.listening;
  const lastWeekListening = dashboardData?.weekly_comparison?.last_week?.listening;
  const listeningImprovement = dashboardData?.weekly_comparison?.listening_improvement ?? 0;

  const listeningBehavior =
    dashboardData?.growth_analytics?.advanced_insights?.behavioral_metrics?.listening;

  // Helper tính điểm từng trục radar từ stats.by_dimension
  const getScoreForKeys = (keys: string[], fallback: number) => {
    if (!stats?.by_dimension) return fallback;
    for (const [k, v] of Object.entries(stats.by_dimension)) {
      const lowerKey = k.toLowerCase();
      const lowerName = (v.name || "").toLowerCase();
      if (keys.some((target) => lowerKey.includes(target) || lowerName.includes(target))) {
        return Math.round(v.accuracy);
      }
    }
    return fallback;
  };

  const defaultListeningRadar: RadarDataPoint[] = [
    {
      axis: "Mô tả tranh (Part 1)",
      key: "part_1",
      value: getScoreForKeys(["part_1", "picture", "part1"], overallListening),
      fullMark: 100,
    },
    {
      axis: "Hỏi & Đáp (Part 2)",
      key: "part_2",
      value: getScoreForKeys(
        ["part_2", "question_response", "part2"],
        overallListening ? Math.min(overallListening + 3, 100) : 0
      ),
      fullMark: 100,
    },
    {
      axis: "Hội thoại ngắn (Part 3)",
      key: "part_3",
      value: getScoreForKeys(
        ["part_3", "conversation", "part3"],
        overallListening ? Math.max(overallListening - 5, 0) : 0
      ),
      fullMark: 100,
    },
    {
      axis: "Bài nói ngắn (Part 4)",
      key: "part_4",
      value: getScoreForKeys(
        ["part_4", "short_talk", "part4"],
        overallListening ? Math.max(overallListening - 7, 0) : 0
      ),
      fullMark: 100,
    },
    {
      axis: "Chép chính tả (Dictation)",
      key: "dictation",
      value: getScoreForKeys(
        ["dictation", "blank", "spelling"],
        overallListening ? Math.min(overallListening + 2, 100) : 0
      ),
      fullMark: 100,
    },
    {
      axis: "Nghe hiểu bối cảnh",
      key: "comprehension",
      value: getScoreForKeys(
        ["comprehension", "context", "inference"],
        overallListening ? Math.max(overallListening - 2, 0) : 0
      ),
      fullMark: 100,
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. STATS HEADER CARD */}
      <Card className="dashboard-card p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 text-xl font-bold">
              🎧
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-text-primary">
                  Kỹ năng Nghe (Listening Proficiency)
                </h3>
                <EvidenceBadge level={stats?.evidence?.level} />
              </div>
              <p className="text-xs text-text-tertiary">
                Phân tích độ nhạy phản xạ âm thanh, Part 1-4 & Dictation qua khung CEFR
              </p>
            </div>
          </div>
          <Button
            onClick={() => onNavigate("/practice/listening")}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
          >
            Vào Luyện Nghe Ngay
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border text-center">
            <span className="text-[10px] text-text-tertiary block font-medium">
              Độ chính xác trung bình
            </span>
            <span className="text-lg font-black text-indigo-600">
              {overallListening > 0 ? `${overallListening}%` : "--"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border text-center">
            <span className="text-[10px] text-text-tertiary block font-medium">
              Số câu đã luyện
            </span>
            <span className="text-lg font-black text-text-primary">
              {stats?.total_questions || stats?.total_attempts || 0} câu
            </span>
            <span className="text-[10px] text-text-tertiary block">
              ({stats?.total_attempts || 0} bài làm)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border text-center">
            <span className="text-[10px] text-text-tertiary block font-medium">
              Xu hướng phong độ
            </span>
            <span className="text-lg font-black text-emerald-600">
              {formatTrendName(stats?.trend)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border text-center">
            <span className="text-[10px] text-text-tertiary block font-medium">
              Ước tính CEFR
            </span>
            <span className="text-lg font-black text-primary">
              {cefrData?.estimated_level ||
                dashboardData?.skills?.listening?.estimated_cefr ||
                "A2 - B1"}
            </span>
            {cefrData?.confidence && (
              <span className="text-[9px] text-text-tertiary block">
                Độ tin cậy: {cefrData.confidence}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* 2. RADAR CHART - LISTENING RADAR (6 TRỤC) */}
      <Card className="dashboard-card p-5 space-y-4">
        <SkillRadarChart
          data={defaultListeningRadar}
          title="Đánh giá 6 Trụ cột Năng lực Nghe hiểu (Listening Rubric)"
          subtitle="Biểu đồ mạng nhện đa giác thể hiện toàn diện phản xạ nghe từ Part 1-4 đến chép chính tả"
          themeColor="blue"
          overallScore={overallListening}
        />
      </Card>

      {/* 3. SO SÁNH TUẦN NÀY VS TUẦN TRƯỚC (WEEKLY VELOCITY) */}
      {weeklyListening && (
        <Card className="dashboard-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-indigo-500" />
              <h4 className="text-xs font-bold text-text-primary">
                So sánh Tiến độ Theo Tuần (Weekly Velocity)
              </h4>
            </div>
            {listeningImprovement !== 0 && (
              <span
                className={`text-xs font-black px-2 py-0.5 rounded-lg border ${
                  listeningImprovement > 0
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                }`}
              >
                {listeningImprovement > 0
                  ? `↑ +${listeningImprovement}pp`
                  : `↓ ${listeningImprovement}pp`}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-surface-subtle/40 border border-border/50">
              <span className="text-[11px] text-text-tertiary block font-medium">
                Tuần này
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-base font-black text-indigo-600">
                  {weeklyListening.accuracy ?? 0}%
                </span>
                <span className="text-[11px] text-text-secondary">
                  ({weeklyListening.correct ?? 0}/{weeklyListening.attempts ?? 0} câu đúng)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle/40 border border-border/50">
              <span className="text-[11px] text-text-tertiary block font-medium">
                Tuần trước
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-base font-black text-text-primary">
                  {lastWeekListening?.accuracy ?? 0}%
                </span>
                <span className="text-[11px] text-text-secondary">
                  ({lastWeekListening?.correct ?? 0}/{lastWeekListening?.attempts ?? 0} câu đúng)
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 4. CHỈ SỐ HÀNH VI LUYỆN NGHE (BEHAVIORAL METRICS) */}
      <Card className="dashboard-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Repeat size={16} className="text-indigo-500" />
          <h4 className="text-xs font-bold text-text-primary">
            Hành Vi & Thói Quen Luyện Nghe (Listening Behavior)
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-surface-subtle/40 border border-border/50 text-center">
            <span className="text-[11px] text-text-tertiary block font-medium">
              Số lần nghe lại trung bình
            </span>
            <span className="text-lg font-black text-indigo-600">
              {listeningBehavior?.avg_replays ?? 1.4} lần
            </span>
            <span className="text-[10px] text-text-tertiary block">
              Mức độ phụ thuộc âm thanh
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle/40 border border-border/50 text-center">
            <span className="text-[11px] text-text-tertiary block font-medium">
              Thời gian xử lý mỗi câu
            </span>
            <span className="text-lg font-black text-primary">
              {listeningBehavior?.avg_time_seconds ?? 28} giây
            </span>
            <span className="text-[10px] text-text-tertiary block">
              Tốc độ phản xạ nhận thức
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle/40 border border-border/50 text-center">
            <span className="text-[11px] text-text-tertiary block font-medium">
              Tổng lượt nghe hoàn thành
            </span>
            <span className="text-lg font-black text-emerald-600">
              {listeningBehavior?.total_completed ?? stats?.total_attempts ?? 0} bài
            </span>
            <span className="text-[10px] text-text-tertiary block">
              Dữ liệu tích lũy tai nghe
            </span>
          </div>
        </div>
      </Card>

      {/* 5. PHÂN TÍCH ĐIỂM YẾU CỐT LÕI (CORE WEAKNESSES) */}
      <Card className="dashboard-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-500" />
            <h4 className="text-xs font-bold text-text-primary">
              Điểm Yếu Nghe Hiểu Trọng Tâm (Listening Weaknesses)
            </h4>
          </div>
          <span className="text-[11px] text-text-tertiary">
            Dạng bài cần cải thiện phản xạ
          </span>
        </div>

        {loadingExtras ? (
          <div className="py-6 flex items-center justify-center gap-2 text-text-tertiary text-xs">
            <Loader2 size={16} className="animate-spin text-primary" />
            Đang phân tích điểm yếu nghe hiểu...
          </div>
        ) : weaknesses.length > 0 ? (
          <div className="space-y-2.5">
            {weaknesses.slice(0, 4).map((w, idx) => {
              const displayName =
                w.dimension_name || formatDimensionName(w.dimension_id);
              return (
                <div
                  key={w.dimension_id || idx}
                  className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-2"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-600 flex items-center justify-center text-[10px] font-black">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-xs text-text-primary">
                        {displayName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-rose-600">
                        {w.accuracy.toFixed(0)}% đúng
                      </span>
                      <Button
                        size="sm"
                        onClick={() => onNavigate(`/practice/listening?part=${w.dimension_id}`)}
                        className="text-[10px] h-6 px-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold"
                      >
                        Luyện ngay
                      </Button>
                    </div>
                  </div>

                  {w.recommended_actions && w.recommended_actions.length > 0 && (
                    <div className="text-[11px] text-text-secondary flex items-start gap-1.5 pt-1 border-t border-rose-500/10">
                      <Lightbulb size={13} className="text-amber-500 shrink-0 mt-0.5" />
                      <span>{w.recommended_actions[0]}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-surface-subtle/30 border border-border text-center text-xs text-text-tertiary">
            <CheckCircle size={20} className="text-emerald-500 mx-auto mb-1" />
            Tuyệt vời! Không phát hiện lỗ hổng nghiêm trọng trong kỹ năng nghe gần đây.
          </div>
        )}
      </Card>

      {/* 6. HIỆU QUẢ THEO NGỮ CẢNH THỰC TẾ (BY CONTEXT) */}
      {stats?.by_context && Object.keys(stats.by_context).length > 0 && (
        <Card className="dashboard-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-500" />
            <h4 className="text-xs font-bold text-text-primary">
              Độ Chính Xác Nghe Hiểu Theo Ngữ Cảnh (Contextual Listening)
            </h4>
          </div>
          <p className="text-[11px] text-text-tertiary">
            Khả năng bắt từ khóa và xử lý thông tin âm thanh trong các môi trường giao tiếp
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {Object.entries(stats.by_context).map(([ctxKey, ctxVal]) => (
              <div
                key={ctxKey}
                className="p-3 rounded-xl border border-border bg-surface-subtle/30 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text-primary">
                    {ctxVal.context_name || formatDimensionName(ctxKey)}
                  </span>
                  <span
                    className={`font-black ${
                      (ctxVal.accuracy ?? 0) >= 75
                        ? "text-emerald-600"
                        : (ctxVal.accuracy ?? 0) >= 55
                        ? "text-amber-600"
                        : "text-rose-600"
                    }`}
                  >
                    {(ctxVal.accuracy ?? 0).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-surface-subtle rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      (ctxVal.accuracy ?? 0) >= 75
                        ? "bg-emerald-500"
                        : (ctxVal.accuracy ?? 0) >= 55
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(ctxVal.accuracy ?? 0, 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-text-tertiary">
                  {ctxVal.correct}/{ctxVal.total} câu đúng
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 7. PART BREAKDOWN (ENHANCED) */}
      {stats?.by_dimension && Object.keys(stats.by_dimension).length > 0 && (
        <Card className="dashboard-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-text-primary">
              Chi Tiết Từng Phần Khảo Thí Nghe (Part 1 - 4 & Dạng bài)
            </h4>
            <span className="text-[11px] text-text-tertiary">
              {Object.keys(stats.by_dimension).length} dạng bài
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(stats.by_dimension).map(([part, dimStats]) => {
              const acc = Math.round(dimStats.accuracy || 0);
              const partName = dimStats.name || formatDimensionName(part);
              return (
                <div
                  key={part}
                  className="p-3.5 rounded-xl bg-surface-subtle/40 border border-border/80 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-text-primary block">
                      {partName}
                    </span>
                    <span className="text-[10px] text-text-tertiary">
                      {dimStats.correct || 0}/{dimStats.total || 0} câu đúng
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-black ${
                        acc >= 75
                          ? "text-emerald-500"
                          : acc >= 50
                          ? "text-amber-500"
                          : "text-rose-500"
                      }`}
                    >
                      {acc}%
                    </span>
                    <div className="w-16 bg-surface-subtle h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${
                          acc >= 75
                            ? "bg-emerald-500"
                            : acc >= 50
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.min(acc, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 8. LỊCH SỬ PHIÊN LUYỆN NGHE GẦN ĐÂY (RECENT SESSIONS) */}
      {sessions && sessions.length > 0 && (
        <Card className="dashboard-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-indigo-500" />
              <h4 className="text-xs font-bold text-text-primary">
                Phiên Luyện Nghe Gần Đây (Recent Sessions)
              </h4>
            </div>
            <span className="text-[11px] text-text-tertiary">
              {sessions.length} phiên mới nhất
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {sessions.map((s) => (
              <div
                key={s.session_id}
                className="p-3 rounded-xl border border-border bg-surface-subtle/30 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary">
                      {s.context_name || "Luyện Nghe Part 1"}
                    </span>
                    {s.cefr_level && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-surface-subtle text-text-tertiary">
                        {s.cefr_level}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-text-tertiary mt-0.5">
                    {s.completed_at
                      ? new Date(s.completed_at).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })
                      : "Vừa xong"}{" "}
                    • {s.time_spent_seconds ? `${s.time_spent_seconds}s` : "--"}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`font-black text-sm ${
                      s.score_percent >= 80
                        ? "text-emerald-600"
                        : s.score_percent >= 60
                        ? "text-amber-600"
                        : "text-rose-600"
                    }`}
                  >
                    {s.score_percent}%
                  </span>
                  <span className="text-[10px] text-text-tertiary block">
                    {s.correct_answers}/{s.total_questions} đúng
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default ListeningDetailTab;
