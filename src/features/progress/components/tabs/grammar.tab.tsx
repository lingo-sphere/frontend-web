"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Loader2,
  Sparkles,
  BookOpen,
  Calendar,
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

export interface GrammarDetailTabProps {
  stats?: SkillStats;
  userId?: string;
  dashboardData?: PracticeDashboardData | null;
  onNavigate: (path: string) => void;
}

export function GrammarDetailTab({
  stats,
  userId,
  dashboardData,
  onNavigate,
}: GrammarDetailTabProps) {
  const [cefrData, setCefrData] = useState<{
    estimated_level: string;
    confidence: string;
    recommendation?: string;
  } | null>(null);
  const [weaknesses, setWeaknesses] = useState<WeaknessAnalysis[]>([]);
  const [contextBreakdown, setContextBreakdown] = useState<
    Awaited<ReturnType<typeof progressService.getGrammarContextBreakdown>>
  >(null);
  const [sessions, setSessions] = useState<
    NonNullable<Awaited<ReturnType<typeof progressService.getGrammarSessions>>>["items"]
  >([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    Promise.all([
      progressService
        .getSkillCEFR(userId, "grammar")
        .then((cefr) => {
          if (isMounted) setCefrData(cefr);
        })
        .catch(() => {}),
      progressService
        .getSkillWeaknesses(userId, "grammar", "30d")
        .then((weakList) => {
          if (isMounted) setWeaknesses(weakList || []);
        })
        .catch(() => {}),
      progressService
        .getGrammarContextBreakdown(userId, "30d")
        .then((ctxBreakdown) => {
          if (isMounted) setContextBreakdown(ctxBreakdown);
        })
        .catch(() => {}),
      progressService
        .getGrammarSessions(userId, 5)
        .then((sessionsRes) => {
          if (isMounted) setSessions(sessionsRes?.items || []);
        })
        .catch(() => {}),
    ]).finally(() => {
      if (isMounted) setLoadingExtras(false);
    });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const overallGrammar = stats?.accuracy
    ? Math.round(stats.accuracy)
    : dashboardData?.skills?.grammar?.accuracy_rate || 0;

  const weeklyGrammar = dashboardData?.weekly_comparison?.this_week?.grammar;
  const lastWeekGrammar = dashboardData?.weekly_comparison?.last_week?.grammar;
  const grammarImprovement = dashboardData?.weekly_comparison?.grammar_improvement ?? 0;

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

  const defaultGrammarRadar: RadarDataPoint[] = [
    {
      axis: "Các thì & Động từ",
      key: "tenses",
      value: getScoreForKeys(["tenses", "present", "past", "future", "verb"], overallGrammar),
      fullMark: 100,
    },
    {
      axis: "Cấu trúc & Mệnh đề",
      key: "sentence_structure",
      value: getScoreForKeys(
        ["sentence_structure", "clauses", "relative", "order"],
        overallGrammar ? Math.max(overallGrammar - 3, 0) : 0
      ),
      fullMark: 100,
    },
    {
      axis: "Mạo từ & Danh từ",
      key: "articles",
      value: getScoreForKeys(
        ["articles", "nouns", "pronouns"],
        overallGrammar ? Math.min(overallGrammar + 4, 100) : 0
      ),
      fullMark: 100,
    },
    {
      axis: "Giới từ & Liên từ",
      key: "prepositions",
      value: getScoreForKeys(
        ["prepositions", "conjunctions"],
        overallGrammar ? Math.max(overallGrammar - 5, 0) : 0
      ),
      fullMark: 100,
    },
    {
      axis: "Điều kiện & Bị động",
      key: "conditionals",
      value: getScoreForKeys(
        ["conditionals", "passive"],
        overallGrammar ? Math.max(overallGrammar - 4, 0) : 0
      ),
      fullMark: 100,
    },
    {
      axis: "Từ loại & Bổ ngữ",
      key: "word_classes",
      value: getScoreForKeys(
        ["word_classes", "adjectives", "adverbs", "modal", "comparisons"],
        overallGrammar ? Math.min(overallGrammar + 2, 100) : 0
      ),
      fullMark: 100,
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. HEADER STATS CARD */}
      <Card className="dashboard-card p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 text-xl font-bold">
              📚
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-text-primary">
                  Kỹ năng Ngữ pháp (Grammar Proficiency)
                </h3>
                <EvidenceBadge level={stats?.evidence?.level} />
              </div>
              <p className="text-xs text-text-tertiary">
                Đánh giá mức độ làm chủ các chuyên đề ngữ pháp theo khung CEFR
              </p>
            </div>
          </div>
          <Button
            onClick={() => onNavigate("/grammar")}
            className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold"
          >
            Vào Luyện Ngữ Pháp
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border text-center">
            <span className="text-[10px] text-text-tertiary block font-medium">
              Độ chính xác trung bình
            </span>
            <span className="text-lg font-black text-amber-600">
              {overallGrammar > 0 ? `${overallGrammar}%` : "--"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border text-center">
            <span className="text-[10px] text-text-tertiary block font-medium">
              Số câu đã luyện
            </span>
            <span className="text-lg font-black text-text-primary">
              {stats?.total_questions || 0} câu
            </span>
            <span className="text-[10px] text-text-tertiary block">
              ({stats?.total_attempts || 0} phiên làm)
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
              {cefrData?.estimated_level || "A2 - B1"}
            </span>
            {cefrData?.confidence && (
              <span className="text-[9px] text-text-tertiary block">
                Độ tin cậy: {cefrData.confidence}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* 2. BIỂU ĐỒ MẠNG NHỆN: 6 TRỤ CỘT NĂNG LỰC NGỮ PHÁP (GRAMMAR RADAR) */}
      <Card className="dashboard-card p-5 space-y-4">
        <SkillRadarChart
          data={defaultGrammarRadar}
          title="Đánh giá 6 Trụ cột Năng lực Ngữ pháp (Grammar Rubric)"
          subtitle="Biểu đồ mạng nhện đa giác thể hiện toàn diện hình thái kiến thức ngữ pháp"
          themeColor="amber"
          overallScore={overallGrammar}
        />
      </Card>

      {/* 3. SO SÁNH TUẦN NÀY VS TUẦN TRƯỚC (WEEKLY COMPARISON) */}
      {weeklyGrammar && (
        <Card className="dashboard-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-amber-500" />
              <h4 className="text-xs font-bold text-text-primary">
                So sánh Tiến độ Theo Tuần (Weekly Velocity)
              </h4>
            </div>
            {grammarImprovement !== 0 && (
              <span
                className={`text-xs font-black px-2 py-0.5 rounded-lg border ${
                  grammarImprovement > 0
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                }`}
              >
                {grammarImprovement > 0
                  ? `↑ +${grammarImprovement}pp`
                  : `↓ ${grammarImprovement}pp`}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-surface-subtle/40 border border-border/50">
              <span className="text-[11px] text-text-tertiary block font-medium">
                Tuần này
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-base font-black text-amber-600">
                  {weeklyGrammar.accuracy ?? 0}%
                </span>
                <span className="text-[11px] text-text-secondary">
                  ({weeklyGrammar.correct ?? 0}/{weeklyGrammar.attempts ?? 0} câu đúng)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle/40 border border-border/50">
              <span className="text-[11px] text-text-tertiary block font-medium">
                Tuần trước
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-base font-black text-text-primary">
                  {lastWeekGrammar?.accuracy ?? 0}%
                </span>
                <span className="text-[11px] text-text-secondary">
                  ({lastWeekGrammar?.correct ?? 0}/{lastWeekGrammar?.attempts ?? 0} câu đúng)
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 4. PHÂN TÍCH ĐIỂM YẾU CỐT LÕI (WEAKNESS DEEP ANALYSIS) */}
      <Card className="dashboard-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-500" />
            <h4 className="text-xs font-bold text-text-primary">
              Điểm Yếu Ngữ Pháp Cốt Lõi (Core Weaknesses)
            </h4>
          </div>
          <span className="text-[11px] text-text-tertiary">
            Xếp hạng theo mức độ ảnh hưởng
          </span>
        </div>

        {loadingExtras ? (
          <div className="py-6 flex items-center justify-center gap-2 text-text-tertiary text-xs">
            <Loader2 size={16} className="animate-spin text-primary" />
            Đang phân tích điểm yếu ngữ pháp...
          </div>
        ) : weaknesses.length > 0 ? (
          <div className="space-y-2.5">
            {weaknesses.slice(0, 5).map((w, idx) => {
              const displayName =
                w.grammar_knowledge?.name_vi ||
                w.dimension_name ||
                formatDimensionName(w.dimension_id);
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
                      {w.grammar_knowledge?.cefr_level && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700">
                          {w.grammar_knowledge.cefr_level}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-rose-600">
                        {w.accuracy.toFixed(0)}% đúng
                      </span>
                      <Button
                        size="sm"
                        onClick={() =>
                          onNavigate(
                            `/practice?domain=grammar&topic=${encodeURIComponent(
                              w.grammar_knowledge?.code || displayName
                            )}`
                          )
                        }
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
            Tuyệt vời! Không phát hiện lỗ hổng ngữ pháp nghiêm trọng trong 30 ngày qua.
          </div>
        )}
      </Card>

      {/* 5. PHÂN TÍCH ỨNG DỤNG THEO NGỮ CẢNH (GRAMMAR IN CONTEXT) */}
      {(contextBreakdown?.by_context || stats?.by_context) && (
        <Card className="dashboard-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            <h4 className="text-xs font-bold text-text-primary">
              Ứng Dụng Ngữ Pháp Theo Ngữ Cảnh Thực Tế (Grammar in Context)
            </h4>
          </div>
          <p className="text-[11px] text-text-tertiary">
            Tỉ lệ áp dụng cấu trúc ngữ pháp chính xác trong từng bối cảnh giao tiếp cụ thể
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {Object.entries(
              (contextBreakdown?.by_context || stats?.by_context || {}) as Record<
                string,
                {
                  context_name?: string;
                  accuracy?: number;
                  total?: number;
                  correct?: number;
                  grammar_topics?: string[];
                }
              >
            ).map(([ctxKey, ctxVal]) => (
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
                      (ctxVal.accuracy ?? 0) >= 70
                        ? "text-emerald-600"
                        : (ctxVal.accuracy ?? 0) >= 50
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
                      (ctxVal.accuracy ?? 0) >= 70
                        ? "bg-emerald-500"
                        : (ctxVal.accuracy ?? 0) >= 50
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(ctxVal.accuracy ?? 0, 100)}%` }}
                  />
                </div>
                {ctxVal.grammar_topics && ctxVal.grammar_topics.length > 0 && (
                  <div className="text-[10px] text-text-tertiary truncate">
                    Chủ điểm: {ctxVal.grammar_topics.slice(0, 3).join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 6. CHUYÊN ĐỀ NGỮ PHÁP (TOPICS BREAKDOWN) */}
      {stats?.by_dimension && Object.keys(stats.by_dimension).length > 0 && (
        <Card className="dashboard-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-amber-500" />
              <h4 className="text-xs font-bold text-text-primary">
                Chi Tiết Từng Chuyên Đề Ngữ Pháp (Topic Progress)
              </h4>
            </div>
            <span className="text-[11px] text-text-tertiary">
              {Object.keys(stats.by_dimension).length} chủ đề
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {Object.entries(stats.by_dimension).map(([key, value]) => {
              const displayName = value.name || formatDimensionName(key);
              return (
                <div
                  key={key}
                  className="p-3 rounded-xl border border-border bg-surface-subtle/30 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-text-primary">
                      {displayName}
                    </span>
                    <span className="font-bold text-amber-600">
                      {value.accuracy.toFixed(0)}% ({value.correct}/{value.total} câu)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-subtle rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${Math.min(value.accuracy, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 7. LỊCH SỬ PHIÊN LUYỆN TẬP GẦN ĐÂY (RECENT PRACTICE SESSIONS) */}
      {sessions && sessions.length > 0 && (
        <Card className="dashboard-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              <h4 className="text-xs font-bold text-text-primary">
                Phiên Luyện Tập Ngữ Pháp Gần Đây (Recent Sessions)
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
                      {s.topic_name_vi || "Luyện tập Ngữ pháp"}
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

export default GrammarDetailTab;

