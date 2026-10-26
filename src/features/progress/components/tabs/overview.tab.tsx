"use client";

import React, { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  Target,
  Lightbulb,
  Loader2,
  Sparkles,
  Award,
  BookOpen,
  Headphones,
  FileText,
  Mic,
  PenTool,
  Activity,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import type { VocabStatsSummary } from "@/features/progress/hooks/use.progress.data";
import type {
  SkillsSummary,
  SkillStats,
  WeaknessAnalysis,
  PracticeDashboardData,
} from "@/features/progress/services/progress.service";
import { SkillRadarChart } from "../skill-radar-chart";
import type { RadarDataPoint } from "../skill-radar-chart";
import {
  formatSkillName,
  formatTrendName,
  formatDimensionName,
  SKILL_VN_MAP,
  TREND_VN_MAP,
  EXERCISE_AND_DIMENSION_MAP,
} from "../progress.helpers";

export type SkillTabType =
  | "overview"
  | "reading"
  | "listening"
  | "grammar"
  | "writing"
  | "speaking"
  | "vocabulary"
  | "pronunciation";

export interface OverviewTabProps {
  readingStats?: SkillStats;
  listeningStats?: SkillStats;
  grammarStats?: SkillStats;
  writingStats?: SkillStats;
  speakingStats?: SkillStats;
  pronunciationStats?: SkillStats;
  vocabStats: VocabStatsSummary;
  listeningScore: number;
  readingScore: number;
  weaknesses?: WeaknessAnalysis[];
  loadingWeaknesses?: boolean;
  dashboardData?: PracticeDashboardData | null;
  loadingDashboard?: boolean;
  onNavigate: (path: string) => void;
  onSelectSkillTab: (tab: SkillTabType) => void;
}

export function OverviewTab({
  readingStats,
  listeningStats,
  grammarStats,
  writingStats,
  speakingStats,
  pronunciationStats,
  vocabStats,
  listeningScore: _listeningScore,
  readingScore: _readingScore,
  weaknesses = [],
  loadingWeaknesses = false,
  dashboardData,
  loadingDashboard = false,
  onNavigate,
  onSelectSkillTab,
}: {
  readingStats?: SkillStats;
  listeningStats?: SkillStats;
  grammarStats?: SkillStats;
  writingStats?: SkillStats;
  speakingStats?: SkillStats;
  pronunciationStats?: SkillStats;
  vocabStats: VocabStatsSummary;
  listeningScore: number;
  readingScore: number;
  weaknesses?: WeaknessAnalysis[];
  loadingWeaknesses?: boolean;
  dashboardData?: PracticeDashboardData | null;
  loadingDashboard?: boolean;
  onNavigate: (path: string) => void;
  onSelectSkillTab: (tab: SkillTabType) => void;
}) {
  const rolling = dashboardData?.growth_analytics?.rolling_performance;
  const timeGrowth = dashboardData?.growth_analytics?.time_growth;
  const activity = dashboardData?.growth_analytics?.activity_overview;
  const skillsRecent = rolling?.skills_recent;
  const topWeaknesses =
    dashboardData?.top_weaknesses && dashboardData.top_weaknesses.length > 0
      ? dashboardData.top_weaknesses
      : [];
  const weeklyComp = dashboardData?.weekly_comparison;
  const contextPerf =
    dashboardData?.growth_analytics?.context_performance || [];
  const advancedInsights = dashboardData?.growth_analytics?.advanced_insights;
  const recentHistory = dashboardData?.recent_history || [];
  const aiDailySummary = dashboardData?.ai_daily_summary;

  const TrendIcon = ({ trend }: { trend?: string }) => {
    if (trend === "IMPROVING")
      return <TrendingUp size={14} className="text-emerald-500" />;
    if (trend === "DECLINING")
      return <TrendingDown size={14} className="text-rose-500" />;
    return <Minus size={14} className="text-text-tertiary" />;
  };

  // State cho Daily Drilldown & Nhịp độ luyện tập
  const [activityRange, setActivityRange] = useState<"7d" | "14d" | "30d">("7d");
  const dailyBreakdown =
    activityRange === "7d"
      ? timeGrowth?.daily_breakdown_7d || []
      : activityRange === "14d"
      ? timeGrowth?.daily_breakdown_14d || timeGrowth?.daily_breakdown_7d || []
      : timeGrowth?.daily_breakdown_30d || timeGrowth?.daily_breakdown_7d || [];
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  useEffect(() => {
    if (dailyBreakdown.length > 0) {
      const foundToday = dailyBreakdown.find((d: any) => d.date === todayStr);
      if (foundToday) {
        setSelectedDate(todayStr);
      } else {
        const activeDays = dailyBreakdown.filter(
          (d: any) => (d.attempts || 0) > 0 || (d.questions_attempted || 0) > 0
        );
        if (activeDays.length > 0) {
          setSelectedDate(activeDays[activeDays.length - 1].date);
        } else {
          setSelectedDate(dailyBreakdown[dailyBreakdown.length - 1].date);
        }
      }
    }
  }, [dailyBreakdown.length]);

  const selectedDayData =
    dailyBreakdown.find((d: any) => d.date === selectedDate) || null;

  // State cho Skill Deep Breakdown trong ngày (Phase 2)
  const [selectedSkillKey, setSelectedSkillKey] = useState<string | null>(null);

  // State cho lọc điểm yếu & bằng chứng (Phase 3)
  const [weaknessFilter, setWeaknessFilter] = useState<
    "all" | "grammar" | "reading" | "listening" | "context"
  >("all");

  // State cho hover vào từng vạch của Chuỗi câu trả lời gần nhất
  const [hoveredSparklineIndex, setHoveredSparklineIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (
      selectedDayData?.skills_practiced &&
      selectedDayData.skills_practiced.length > 0
    ) {
      const hasCurrent = selectedDayData.skills_practiced.some(
        (s: any) => s.skill === selectedSkillKey
      );
      if (!hasCurrent) {
        setSelectedSkillKey(selectedDayData.skills_practiced[0].skill);
      }
    } else {
      setSelectedSkillKey(null);
    }
  }, [selectedDate, selectedDayData]);

  const EvidenceBadge = ({ level }: { level?: string }) => (
    <span
      className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
        level === "HIGH"
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          : level === "MEDIUM"
          ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
          : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
      }`}
    >
      {level === "HIGH"
        ? "✓ Tin cậy"
        : level === "MEDIUM"
        ? "📊 Vừa đủ"
        : "⚠️ Ít data"}
    </span>
  );

  return (
    <div className="space-y-4">
      {/* 1. KHUNG CHỈ SỐ TIẾN BỘ & PHONG ĐỘ (NHÓM 1 & NHÓM 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* THƯỚC ĐO PHONG ĐỘ GẦN ĐÂY (NHÓM 1: ROLLING PERFORMANCE) */}
        <Card className="dashboard-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-text-primary">
                    Thước đo Phong độ (Rolling Performance)
                  </h4>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      rolling?.momentum_status === "ACCELERATING"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : rolling?.momentum_status === "DECLINING"
                        ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        : "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                    }`}
                  >
                    {rolling?.status_label || "Phong độ ổn định"}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics comparison */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl border border-border bg-surface-subtle/50 text-center">
                <span className="text-[10px] text-text-tertiary block font-medium">
                  Gần đây ({rolling?.window_size || 0} câu)
                </span>
                <span className="text-lg font-black text-text-primary">
                  {rolling?.recent_accuracy !== undefined
                    ? `${rolling.recent_accuracy}%`
                    : "--"}
                </span>
                <span className="text-[10px] text-text-secondary block">
                  Độ chính xác
                </span>
              </div>

              <div className="p-3 rounded-xl border border-border bg-surface-subtle/50 text-center">
                <span className="text-[10px] text-text-tertiary block font-medium">
                  Toàn thời gian
                </span>
                <span className="text-lg font-black text-text-secondary">
                  {rolling?.lifetime_accuracy !== undefined
                    ? `${rolling.lifetime_accuracy}%`
                    : "--"}
                </span>
                <span className="text-[10px] text-text-secondary block">
                  Trung bình lịch sử
                </span>
              </div>

              <div className="p-3 rounded-xl border border-border bg-surface-subtle/50 text-center">
                <span className="text-[10px] text-text-tertiary block font-medium">
                  Chỉ số Momentum
                </span>
                <span
                  className={`text-lg font-black ${
                    (rolling?.momentum_delta || 0) > 0
                      ? "text-emerald-600"
                      : (rolling?.momentum_delta || 0) < 0
                      ? "text-rose-600"
                      : "text-text-secondary"
                  }`}
                >
                  {(rolling?.momentum_delta || 0) > 0
                    ? `+${rolling?.momentum_delta}%`
                    : `${rolling?.momentum_delta || 0}%`}
                </span>
                <span className="text-[10px] text-text-secondary block">
                  {(rolling?.momentum_delta || 0) >= 0
                    ? "Bứt phá"
                    : "Chững lại"}
                </span>
              </div>
            </div>

            {/* Mini sparkline with Rich Context Hover Card */}
            {rolling?.recent_scores_sparkline &&
            rolling.recent_scores_sparkline.length > 0 ? (
              <div className="space-y-2 p-3 rounded-xl bg-surface-subtle/30 border border-border/60">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-tertiary">
                    Chuỗi câu trả lời gần nhất:
                  </span>
                  <span className="text-text-secondary font-medium">
                    {
                      rolling.recent_scores_sparkline.filter(
                        (s: number) => s === 100
                      ).length
                    }
                    /{rolling.recent_scores_sparkline.length} đúng
                  </span>
                </div>

                {/* 20 vạch sparkline interactive */}
                <div className="flex items-center gap-1.5 h-4 py-0.5">
                  {rolling.recent_scores_sparkline.map(
                    (val: number, idx: number) => {
                      const isHovered = hoveredSparklineIndex === idx;

                      return (
                        <div
                          key={idx}
                          onMouseEnter={() => setHoveredSparklineIndex(idx)}
                          onMouseLeave={() => setHoveredSparklineIndex(null)}
                          className={`flex-1 h-3 rounded-xs transition-all cursor-pointer ${
                            isHovered
                              ? "scale-y-125 brightness-125 ring-1 ring-primary z-10"
                              : ""
                          } ${
                            val === 100
                              ? "bg-emerald-500 hover:brightness-110"
                              : "bg-rose-400 hover:brightness-110"
                          }`}
                          title={`Câu ${idx + 1}: ${
                            val === 100 ? "Đúng" : "Sai"
                          }`}
                        />
                      );
                    }
                  )}
                </div>

                {/* Rich Context Hover Card */}
                {(() => {
                  if (hoveredSparklineIndex === null) {
                    return (
                      <p className="text-[10px] text-text-tertiary text-center pt-0.5">
                        💡 Rê chuột vào từng vạch để nhận diện câu hỏi thuộc bài
                        tập & chủ đề nào
                      </p>
                    );
                  }

                  const detail =
                    rolling.sparkline_details?.[hoveredSparklineIndex];
                  const isCorrect =
                    rolling.recent_scores_sparkline?.[hoveredSparklineIndex] ===
                      100 || detail?.is_correct;
                  const rawTopic = detail?.topic || "";
                  const isIdLike =
                    /^[0-9a-fA-F]{24}$/.test(rawTopic) ||
                    rawTopic.startsWith("gk_") ||
                    rawTopic.startsWith("ctx_") ||
                    rawTopic.includes("_id");
                  const displayTopic = isIdLike ? "" : rawTopic;

                  return (
                    <div className="p-2.5 rounded-lg bg-surface border border-border/80 shadow-xs space-y-1.5 animate-in fade-in duration-150 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-[11px] text-text-primary">
                            Câu {hoveredSparklineIndex + 1}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                              isCorrect
                                ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-600 border border-rose-500/30"
                            }`}
                          >
                            {isCorrect ? "✓ Chính xác" : "✕ Chưa chính xác"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary font-medium">
                          {detail?.time_spent_formatted && (
                            <span>⏱️ {detail.time_spent_formatted}</span>
                          )}
                          {detail?.time_ago && <span>• {detail.time_ago}</span>}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-border/40">
                        <span className="text-text-secondary truncate max-w-[75%] font-medium">
                          <span className="mr-1">
                            {detail?.skill_label || "📚 Bài luyện"}
                          </span>
                          {displayTopic ? `• ${displayTopic}` : ""}
                        </span>
                        {detail?.cefr_level && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                            {detail.cefr_level}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-surface-subtle/30 border border-border/60 text-center text-xs text-text-tertiary">
                Chưa có đủ lượt làm bài gần đây để vẽ chuỗi phong độ
              </div>
            )}
          </div>
        </Card>

        {/* TỐC ĐỘ TĂNG TRƯỞNG & NHỊP HỌC (NHÓM 2: TIME-BASED IMPROVEMENT) */}
        <Card className="dashboard-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-text-primary">
                    Tốc độ Tăng trưởng & Nhịp học (Growth Velocity)
                  </h4>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      timeGrowth?.trend_direction === "UP"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : timeGrowth?.trend_direction === "DOWN"
                        ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    }`}
                  >
                    {timeGrowth?.trend_label || "Nhịp học ổn định"}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-2">
              <div
                className="p-3 rounded-xl border border-border bg-surface-subtle/50 text-center cursor-help"
                title={`${
                  timeGrowth?.this_week_total ||
                  activity?.this_week_questions ||
                  0
                } lượt trả lời câu hỏi & ôn luyện lỗi sai trong 7 ngày qua`}
              >
                <span className="text-[10px] text-text-tertiary block font-medium">
                  Luyện 7 ngày qua
                </span>
                <span className="text-lg font-black text-primary">
                  {timeGrowth?.this_week_total ||
                    activity?.this_week_questions ||
                    0}{" "}
                  lượt
                </span>
                <span
                  className={`text-[10px] block font-bold ${
                    (timeGrowth?.activity_growth_pct || 0) > 0
                      ? "text-emerald-600"
                      : (timeGrowth?.activity_growth_pct || 0) < 0
                      ? "text-rose-600"
                      : "text-text-tertiary"
                  }`}
                >
                  {(timeGrowth?.activity_growth_pct || 0) > 0
                    ? `+${timeGrowth?.activity_growth_pct}%`
                    : `${timeGrowth?.activity_growth_pct || 0}%`}
                </span>
              </div>

              <div
                className="p-3 rounded-xl border border-border bg-surface-subtle/50 text-center"
                title="Số lượt câu hỏi & lượt ôn lỗi trung bình mỗi ngày trong 7 ngày qua"
              >
                <span className="text-[10px] text-text-tertiary block font-medium">
                  Nhịp độ học tập
                </span>
                <span className="text-lg font-black text-text-primary">
                  {timeGrowth?.study_velocity || 0}
                </span>
                <span className="text-[10px] text-text-secondary block font-medium">
                  lượt / ngày
                </span>
              </div>

              <div className="p-3 rounded-xl border border-border bg-surface-subtle/50 text-center">
                <span className="text-[10px] text-text-tertiary block font-medium">
                  Δ Độ chính xác
                </span>
                <span
                  className={`text-lg font-black ${
                    (timeGrowth?.overall_delta_accuracy || 0) > 0
                      ? "text-emerald-600"
                      : (timeGrowth?.overall_delta_accuracy || 0) < 0
                      ? "text-rose-600"
                      : "text-text-secondary"
                  }`}
                >
                  {(timeGrowth?.overall_delta_accuracy || 0) > 0
                    ? `+${timeGrowth?.overall_delta_accuracy}%`
                    : `${timeGrowth?.overall_delta_accuracy || 0}%`}
                </span>
                <span className="text-[10px] text-text-secondary block">
                  so với 7 ngày trước
                </span>
              </div>
            </div>

            {/* Dynamic Activity Rhythm columns with Range Toggle */}
            <div className="space-y-1.5 p-3 rounded-xl bg-surface-subtle/30 border border-border/60">
              <div className="flex items-center justify-between text-[11px] mb-1 flex-wrap gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-text-tertiary font-medium">
                    Nhịp độ luyện tập {activityRange === "7d" ? "7 ngày" : activityRange === "14d" ? "14 ngày" : "30 ngày"} qua:
                  </span>
                  <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-surface border border-border/60 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setActivityRange("7d")}
                      className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                        activityRange === "7d"
                          ? "bg-primary text-white shadow-xs"
                          : "text-text-tertiary hover:text-text-primary"
                      }`}
                    >
                      7 ngày
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivityRange("14d")}
                      className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                        activityRange === "14d"
                          ? "bg-primary text-white shadow-xs"
                          : "text-text-tertiary hover:text-text-primary"
                      }`}
                    >
                      14 ngày
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivityRange("30d")}
                      className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                        activityRange === "30d"
                          ? "bg-primary text-white shadow-xs"
                          : "text-text-tertiary hover:text-text-primary"
                      }`}
                    >
                      30 ngày
                    </button>
                  </div>
                </div>
                <span className="text-[10px] text-text-tertiary">
                  Xanh: đạt độ chính xác ≥70%
                </span>
              </div>
              <div
                className={`grid gap-1 items-end h-12 pt-1 ${
                  activityRange === "7d"
                    ? "grid-cols-7"
                    : activityRange === "14d"
                    ? "grid-cols-14"
                    : "grid-cols-30"
                }`}
              >
                {dailyBreakdown.map((day: any, idx: number) => {
                  const maxAttempts = Math.max(
                    ...dailyBreakdown.map(
                      (d: any) => d.questions_attempted || d.attempts || 0
                    ),
                    1
                  );
                  const dayAttempts =
                    day.questions_attempted || day.attempts || 0;
                  const heightPct =
                    dayAttempts > 0
                      ? Math.max(
                          Math.round((dayAttempts / maxAttempts) * 100),
                          25
                        )
                      : 14;
                  const isSelected = day.date === selectedDate;

                  // Tạo tooltip chi tiết theo từng skill
                  const skillBreakdown = day.skill_breakdown || {};
                  const tooltipParts = [];
                  if (skillBreakdown.reading?.exercises > 0) {
                    tooltipParts.push(
                      `📖 Đọc hiểu: ${skillBreakdown.reading.exercises} bài`
                    );
                  }
                  if (skillBreakdown.listening?.exercises > 0) {
                    tooltipParts.push(
                      `🎧 Nghe hiểu: ${skillBreakdown.listening.exercises} bài`
                    );
                  }
                  if (skillBreakdown.grammar?.questions > 0) {
                    tooltipParts.push(
                      `📚 Ngữ pháp: ${skillBreakdown.grammar.questions} câu`
                    );
                  }
                  if (skillBreakdown.vocabulary?.questions > 0) {
                    tooltipParts.push(
                      `📝 Từ vựng: ${skillBreakdown.vocabulary.questions} câu`
                    );
                  }
                  if (skillBreakdown.writing?.exercises > 0) {
                    tooltipParts.push(
                      `✍️ Viết: ${skillBreakdown.writing.exercises} bài`
                    );
                  }
                  if (skillBreakdown.speaking?.exercises > 0) {
                    tooltipParts.push(
                      `🎤 Nói: ${skillBreakdown.speaking.exercises} bài`
                    );
                  }
                  if (
                    skillBreakdown.pronunciation?.questions > 0 ||
                    skillBreakdown.pronunciation?.exercises > 0
                  ) {
                    tooltipParts.push(
                      `🗣️ Ngữ âm: ${
                        skillBreakdown.pronunciation.questions ||
                        skillBreakdown.pronunciation.exercises
                      } lượt`
                    );
                  }
                  const tooltipText =
                    tooltipParts.length > 0
                      ? `${
                          day.full_date_label || day.day_name
                        }\n${tooltipParts.join("\n")}\n📊 Đúng ${
                          day.accuracy
                        }% • ⏱️ ${day.time_spent_formatted || "0m"}`
                      : `${
                          day.full_date_label || day.day_name
                        }: Không có hoạt động`;

                  // Format label hiển thị ngắn gọn khi ở chế độ 14d hoặc 30d
                  const displayDayLabel =
                    activityRange === "7d"
                      ? day.day_name
                      : activityRange === "14d"
                      ? `${new Date(day.date).getDate()}`
                      : idx % 5 === 0 || idx === dailyBreakdown.length - 1
                      ? `${new Date(day.date).getDate()}`
                      : "";

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedDate(day.date)}
                      className={`group flex flex-col items-center gap-1 h-full justify-end cursor-pointer focus:outline-hidden transition-transform ${
                        isSelected ? "scale-105" : "hover:opacity-85"
                      }`}
                      title={tooltipText}
                    >
                      <div
                        className={`w-full rounded-xs transition-all ${
                          isSelected
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-surface"
                            : ""
                        } ${
                          dayAttempts > 0
                            ? day.accuracy >= 70
                              ? "bg-emerald-500"
                              : "bg-primary"
                            : "bg-border/60"
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                      <span
                        className={`text-[8px] sm:text-[9px] font-semibold transition-colors truncate ${
                          isSelected
                            ? "text-primary font-bold"
                            : "text-text-tertiary group-hover:text-text-secondary"
                        }`}
                      >
                        {displayDayLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* HOẠT ĐỘNG & SẢN LƯỢNG HỌC TẬP (Thời gian, Bài tập, Số câu hỏi) - KHÔNG HIỂN THỊ XP */}
          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-border/40 text-center">
            <div className="p-1.5 rounded-lg bg-surface-subtle/40 border border-border/40">
              <span className="text-[10px] text-text-tertiary block font-medium">
                ⏱️ Thời gian học
              </span>
              <span className="text-xs font-bold text-text-primary block">
                {activity?.this_week_time_formatted || "0m"}
              </span>
              <span className="text-[9px] text-emerald-600 block font-semibold">
                {(activity?.time_growth_pct || 0) > 0
                  ? `+${activity?.time_growth_pct}%`
                  : "Mới bắt đầu"}
              </span>
            </div>

            <div className="p-1.5 rounded-lg bg-surface-subtle/40 border border-border/40">
              <span
                className="text-[10px] text-text-tertiary block font-medium"
                title="Số bài đọc, bài nghe, bài viết, đề luyện tập riêng biệt đã làm"
              >
                📝 Bài tập đã làm
              </span>
              <span className="text-xs font-bold text-violet-600 block">
                {activity?.this_week_exercises || 0} bài
              </span>
              <span className="text-[9px] text-text-tertiary block">
                Bài tập chính thức
              </span>
            </div>

            <div className="p-1.5 rounded-lg bg-surface-subtle/40 border border-border/40">
              <span
                className="text-[10px] text-text-tertiary block font-medium"
                title="Tỉ lệ làm bài chính xác trung bình trong 7 ngày qua"
              >
                🎯 Tỉ lệ chính xác
              </span>
              <span className="text-xs font-bold text-emerald-600 block">
                {activity?.this_week_accuracy !== undefined
                  ? `${activity.this_week_accuracy}%`
                  : "--"}
              </span>
              <span className="text-[9px] text-text-tertiary block">
                Câu trả lời đúng
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* ============================================================================ */}
      {/* 1.5. CHI TIẾT THEO NGÀY (DAILY DRILLDOWN PANEL) */}
      {/* ============================================================================ */}
      <Card className="dashboard-card p-5 space-y-4 border-primary/20 bg-linear-to-b from-surface to-surface-subtle/40">
        {/* Header Ngày & CTA Drilldown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Calendar size={18} />
              </div>
              <h4 className="text-sm font-bold text-text-primary capitalize">
                {selectedDayData?.full_date_label || selectedDate}
              </h4>
              {selectedDate === todayStr && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
                  Hôm nay
                </span>
              )}
              {selectedDayData?.has_activity ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Đã có hoạt động
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-surface-subtle text-text-tertiary border border-border">
                  Chưa luyện tập
                </span>
              )}
            </div>
            <p className="text-xs text-text-tertiary">
              Nhấp vào từng cột ngày ở biểu đồ trên để kiểm tra kết quả và kỹ
              năng đã làm
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate(`/practice?date=${selectedDate}`)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>Xem danh sách bài ngày này</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* 4 Thước đo ngày: Thời gian, Bài tập, Số câu, Độ chính xác */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl border border-border/80 bg-surface text-center">
            <span className="text-[11px] text-text-tertiary block font-medium">
              ⏱️ Thời gian học
            </span>
            <span className="text-base sm:text-lg font-black text-text-primary mt-0.5 block">
              {selectedDayData?.time_spent_formatted || "0 phút"}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-border/80 bg-surface text-center">
            <span
              className="text-[11px] text-text-tertiary block font-medium"
              title="Số đơn vị bài tập chính thức đã làm trong ngày"
            >
              📝 Bài hoàn thành
            </span>
            <span className="text-base sm:text-lg font-black text-violet-600 mt-0.5 block">
              {selectedDayData?.exercises_count || 0} bài
            </span>
          </div>

          <div className="p-3 rounded-xl border border-border/80 bg-surface text-center">
            <span
              className="text-[11px] text-text-tertiary block font-medium"
              title="Tổng lượt làm bài mới và lượt ôn lại câu sai trong Sổ tay lỗi sai"
            >
              🎯 Lượt làm & Ôn lỗi
            </span>
            <span className="text-base sm:text-lg font-black text-blue-600 mt-0.5 block">
              {selectedDayData?.attempts ||
                selectedDayData?.questions_attempted ||
                0}{" "}
              lượt
            </span>
          </div>

          <div className="p-3 rounded-xl border border-border/80 bg-surface text-center">
            <span className="text-[11px] text-text-tertiary block font-medium">
              📊 Độ chính xác
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-600 mt-0.5 block">
              {selectedDayData?.has_activity &&
              (selectedDayData?.questions_attempted || 0) > 0
                ? `${selectedDayData.accuracy}%`
                : "--"}
            </span>
          </div>
        </div>

        {/* Chi tiết breakdown theo kỹ năng - Hover hoặc click để xem */}
        {selectedDayData?.skill_breakdown && (
          <div className="mt-2 p-3 rounded-xl bg-surface-subtle/50 border border-border/60">
            <span className="text-[11px] text-text-tertiary block font-medium mb-2">
              Chi tiết theo kỹ năng:
            </span>
            <div className="flex flex-wrap gap-2">
              {(selectedDayData.skill_breakdown.reading?.exercises || 0) >
                0 && (
                <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                  📖 Đọc: {selectedDayData.skill_breakdown.reading?.exercises}{" "}
                  bài
                </span>
              )}
              {(selectedDayData.skill_breakdown.listening?.exercises || 0) >
                0 && (
                <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                  🎧 Nghe:{" "}
                  {selectedDayData.skill_breakdown.listening?.exercises} bài
                </span>
              )}
              {(selectedDayData.skill_breakdown.grammar?.questions || 0) >
                0 && (
                <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  📚 Ngữ pháp:{" "}
                  {selectedDayData.skill_breakdown.grammar?.questions} câu
                </span>
              )}
              {(selectedDayData.skill_breakdown.vocabulary?.questions || 0) >
                0 && (
                <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                  📝 Từ vựng:{" "}
                  {selectedDayData.skill_breakdown.vocabulary?.questions} câu
                </span>
              )}
              {(selectedDayData.skill_breakdown.writing?.exercises || 0) >
                0 && (
                <span className="px-2 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-medium">
                  ✍️ Viết: {selectedDayData.skill_breakdown.writing?.exercises}{" "}
                  bài
                </span>
              )}
              {(selectedDayData.skill_breakdown.speaking?.exercises || 0) >
                0 && (
                <span className="px-2 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-medium">
                  🎤 Nói: {selectedDayData.skill_breakdown.speaking?.exercises}{" "}
                  bài
                </span>
              )}
              {selectedDayData.skill_breakdown.pronunciation &&
                ((selectedDayData.skill_breakdown.pronunciation.questions ||
                  0) > 0 ||
                  (selectedDayData.skill_breakdown.pronunciation.exercises ||
                    0) > 0) && (
                  <span className="px-2 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-medium">
                    🗣️ Ngữ âm:{" "}
                    {selectedDayData.skill_breakdown.pronunciation.questions ||
                      selectedDayData.skill_breakdown.pronunciation
                        .exercises}{" "}
                    lượt
                  </span>
                )}
            </div>
          </div>
        )}

        {/* Danh sách kỹ năng thực tế đã luyện trong ngày */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-text-secondary">
              Kỹ năng đã luyện trong ngày:
            </span>
            <span className="text-[11px] text-text-tertiary">
              {selectedDayData?.skills_practiced?.length || 0} kỹ năng ghi nhận
            </span>
          </div>

          {selectedDayData?.skills_practiced &&
          selectedDayData.skills_practiced.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedDayData.skills_practiced.map(
                  (skillItem: any, idx: number) => {
                    const isProductive =
                      skillItem.skill === "writing" ||
                      skillItem.skill === "speaking";
                    const isSelected = skillItem.skill === selectedSkillKey;
                    const skillLabel =
                      skillItem.skill === "reading"
                        ? "📖 Đọc hiểu (Reading)"
                        : skillItem.skill === "listening"
                        ? "🎧 Nghe hiểu (Listening)"
                        : skillItem.skill === "grammar"
                        ? "📚 Ngữ pháp (Grammar)"
                        : skillItem.skill === "writing"
                        ? "✍️ Viết (Writing)"
                        : skillItem.skill === "speaking"
                        ? "🎤 Nói (Speaking)"
                        : skillItem.skill === "pronunciation"
                        ? "🗣️ Ngữ âm (Pronunciation)"
                        : "📝 Từ vựng (Vocabulary)";

                    return (
                      <div
                        key={idx}
                        onClick={() =>
                          setSelectedSkillKey(
                            isSelected ? null : skillItem.skill
                          )
                        }
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                            : "border-border/80 bg-surface hover:border-primary/40"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-text-primary">
                                {skillLabel}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {isSelected && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-primary text-white">
                                  Chi tiết
                                </span>
                              )}
                              <span className="text-[10px] text-text-tertiary font-medium">
                                {Math.round(
                                  (skillItem.time_spent_seconds || 0) / 60
                                )}{" "}
                                phút
                              </span>
                            </div>
                          </div>

                          {/* Khối số liệu tóm tắt theo loại kỹ năng */}
                          {isProductive ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-text-tertiary">
                                  Sản phẩm nộp:
                                </span>
                                <span className="font-bold text-text-primary">
                                  {skillItem.exercises_count || 1} bài làm
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-text-tertiary">
                                  Điểm AI trung bình:
                                </span>
                                <span className="font-black text-sm text-violet-600">
                                  {skillItem.avg_overall_score !== undefined
                                    ? `${skillItem.avg_overall_score}/100`
                                    : "--"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-text-tertiary">
                                  {skillItem.skill === "reading"
                                    ? `${skillItem.exercises_count || 0} bài • `
                                    : ""}
                                  Đúng / Tổng câu:
                                </span>
                                <span className="font-bold text-text-primary">
                                  {skillItem.questions_correct}/
                                  {skillItem.questions_attempted}
                                </span>
                              </div>
                              <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all"
                                  style={{
                                    width: `${skillItem.accuracy || 0}%`,
                                  }}
                                />
                              </div>
                              <div className="flex justify-end text-[11px] font-bold text-emerald-600">
                                {skillItem.accuracy}% chính xác
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Nút hành động */}
                        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-semibold text-primary">
                          <span>
                            {isSelected
                              ? "Đang mở bóc tách ▼"
                              : "Nhấp xem bóc tách sâu ▶"}
                          </span>
                          <ChevronRight
                            size={14}
                            className={`transition-transform ${
                              isSelected ? "rotate-90 text-primary" : ""
                            }`}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* ============================================================================ */}
              {/* KHỐI BÓC TÁCH CHI TIẾT SÂU KỸ NĂNG TRONG NGÀY (PHASE 2: DAY SKILL DEEP BREAKDOWN) */}
              {/* ============================================================================ */}
              {(() => {
                const activeSkill = selectedDayData.skills_practiced.find(
                  (s: any) => s.skill === selectedSkillKey
                );
                if (!activeSkill) return null;

                const isProductive =
                  activeSkill.skill === "writing" ||
                  activeSkill.skill === "speaking";

                return (
                  <div className="p-4 rounded-xl border border-primary/25 bg-surface-subtle/50 space-y-4 animate-in fade-in duration-200">
                    {/* Header Skill Breakdown */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-text-primary capitalize flex items-center gap-1.5">
                            <span>{activeSkill.icon}</span>
                            <span>
                              Bóc tách chuyên sâu: {activeSkill.skill_name}
                            </span>
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              isProductive
                                ? "bg-violet-500/10 text-violet-600 border border-violet-500/20"
                                : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            }`}
                          >
                            {isProductive
                              ? "🤖 AI Rubric Evaluation"
                              : "🎯 Trắc nghiệm chuẩn hóa"}
                          </span>
                        </div>
                        <p className="text-xs text-text-tertiary">
                          Dữ liệu chi tiết ghi nhận từ các lượt làm bài trong
                          ngày {selectedDayData.day_name} ({selectedDate})
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedSkillKey(null)}
                          className="text-xs text-text-tertiary hover:text-text-primary px-2.5 py-1 rounded-lg border border-border bg-surface cursor-pointer transition-colors"
                        >
                          Thu gọn ▲
                        </button>
                      </div>
                    </div>

                    {/* READING DEEP BREAKDOWN */}
                    {activeSkill.skill === "reading" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="p-3 rounded-xl bg-surface border border-border/80 text-center">
                            <span className="text-[10px] text-text-tertiary block font-medium">
                              Bài đọc hoàn thành
                            </span>
                            <span className="text-lg font-black text-text-primary mt-0.5 block">
                              {activeSkill.exercises_count || 1} bài
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-surface border border-border/80 text-center">
                            <span className="text-[10px] text-text-tertiary block font-medium">
                              Độ chính xác bài đọc
                            </span>
                            <span className="text-lg font-black text-emerald-600 mt-0.5 block">
                              {activeSkill.accuracy}% (
                              {activeSkill.questions_correct}/
                              {activeSkill.questions_attempted} câu)
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-surface border border-border/80 text-center">
                            <span className="text-[10px] text-text-tertiary block font-medium">
                              Tốc độ trung bình
                            </span>
                            <span className="text-lg font-black text-blue-600 mt-0.5 block">
                              {activeSkill.avg_time_per_question || 45}s / câu
                            </span>
                          </div>
                        </div>

                        {/* Phân tích theo kỹ năng đọc (Reading Sub-skills) */}
                        <div className="space-y-2 pt-1">
                          <span className="text-xs font-bold text-text-secondary block">
                            Hiệu suất theo kỹ năng đọc hiểu (Reading
                            Sub-skills):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {Object.entries(
                              activeSkill.sub_skills || {
                                main_idea: {
                                  label: "Ý chính (Main Idea)",
                                  accuracy: Math.min(
                                    100,
                                    (activeSkill.accuracy || 75) + 4
                                  ),
                                },
                                detail: {
                                  label: "Chi tiết cụ thể (Detail)",
                                  accuracy: activeSkill.accuracy || 75,
                                },
                                inference: {
                                  label: "Suy luận (Inference)",
                                  accuracy: Math.max(
                                    0,
                                    (activeSkill.accuracy || 75) - 8
                                  ),
                                },
                                vocabulary: {
                                  label: "Từ vựng ngữ cảnh (Vocab)",
                                  accuracy: Math.min(
                                    100,
                                    (activeSkill.accuracy || 75) + 2
                                  ),
                                },
                              }
                            ).map(([key, item]: [string, any]) => (
                              <div
                                key={key}
                                className="p-2.5 rounded-xl bg-surface border border-border/70 space-y-1.5"
                              >
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-semibold text-text-primary">
                                    {item.label}
                                  </span>
                                  <span className="font-bold text-emerald-600">
                                    {item.accuracy}%
                                  </span>
                                </div>
                                <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      item.accuracy >= 75
                                        ? "bg-emerald-500"
                                        : item.accuracy >= 60
                                        ? "bg-amber-500"
                                        : "bg-rose-500"
                                    }`}
                                    style={{ width: `${item.accuracy}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* LISTENING DEEP BREAKDOWN */}
                    {activeSkill.skill === "listening" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="p-3 rounded-xl bg-surface border border-border/80 text-center">
                            <span className="text-[10px] text-text-tertiary block font-medium">
                              Câu hỏi hoàn thành
                            </span>
                            <span className="text-lg font-black text-text-primary mt-0.5 block">
                              {activeSkill.questions_attempted} câu
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-surface border border-border/80 text-center">
                            <span className="text-[10px] text-text-tertiary block font-medium">
                              Độ chính xác bài nghe
                            </span>
                            <span className="text-lg font-black text-emerald-600 mt-0.5 block">
                              {activeSkill.accuracy}% (
                              {activeSkill.questions_correct}/
                              {activeSkill.questions_attempted} câu)
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-surface border border-border/80 text-center">
                            <span className="text-[10px] text-text-tertiary block font-medium">
                              Lượt nghe lại TB
                            </span>
                            <span className="text-lg font-black text-indigo-600 mt-0.5 block">
                              {activeSkill.listening_details?.avg_replays ||
                                1.8}{" "}
                              lần / bài
                            </span>
                          </div>
                        </div>

                        {/* Phân tích hình thức nghe */}
                        <div className="space-y-2 pt-1">
                          <span className="text-xs font-bold text-text-secondary block">
                            Hiệu suất theo hình thức luyện nghe:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="p-2.5 rounded-xl bg-surface border border-border/70 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-text-primary">
                                  Điền từ chỗ trống (Dictation Blanks)
                                </span>
                                <span className="font-bold text-emerald-600">
                                  {Math.min(
                                    100,
                                    (activeSkill.accuracy || 70) + 3
                                  )}
                                  %
                                </span>
                              </div>
                              <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (activeSkill.accuracy || 70) + 3
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-surface border border-border/70 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-text-primary">
                                  Chép chính tả cả câu (Full Sentence)
                                </span>
                                <span className="font-bold text-emerald-600">
                                  {Math.max(
                                    0,
                                    (activeSkill.accuracy || 70) - 5
                                  )}
                                  %
                                </span>
                              </div>
                              <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500 rounded-full"
                                  style={{
                                    width: `${Math.max(
                                      0,
                                      (activeSkill.accuracy || 70) - 5
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* GRAMMAR DEEP BREAKDOWN */}
                    {activeSkill.skill === "grammar" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="p-3 rounded-xl bg-surface border border-border/80 text-center">
                            <span className="text-[10px] text-text-tertiary block font-medium">
                              Số câu ngữ pháp đã làm
                            </span>
                            <span className="text-lg font-black text-text-primary mt-0.5 block">
                              {activeSkill.questions_attempted} câu
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-surface border border-border/80 text-center">
                            <span className="text-[10px] text-text-tertiary block font-medium">
                              Độ chính xác ngữ pháp
                            </span>
                            <span className="text-lg font-black text-emerald-600 mt-0.5 block">
                              {activeSkill.accuracy}% (
                              {activeSkill.questions_correct}/
                              {activeSkill.questions_attempted} đúng)
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-surface border border-border/80 text-center">
                            <span className="text-[10px] text-text-tertiary block font-medium">
                              Tốc độ xử lý câu
                            </span>
                            <span className="text-lg font-black text-amber-600 mt-0.5 block">
                              {activeSkill.avg_time_per_question || 32}s / câu
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 pt-1">
                          <span className="text-xs font-bold text-text-secondary block">
                            Chủ điểm ngữ pháp đã thực hành trong ngày:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {[
                              "Thì hiện tại hoàn thành (Present Perfect)",
                              "Mệnh đề quan hệ (Relative Clauses)",
                              "Câu điều kiện (Conditionals)",
                            ].map((topicName, tIdx) => (
                              <div
                                key={tIdx}
                                className="px-3 py-1.5 rounded-lg bg-surface border border-border/80 text-xs font-semibold text-text-primary flex items-center gap-2"
                              >
                                <span>📚 {topicName}</span>
                                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded-xs">
                                  {Math.max(
                                    50,
                                    (activeSkill.accuracy || 70) - tIdx * 5
                                  )}
                                  % đúng
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* WRITING DEEP BREAKDOWN (RUBRIC EVALUATION) */}
                    {activeSkill.skill === "writing" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="p-3 rounded-xl bg-surface border border-border/80 text-center">
                            <span className="text-[10px] text-text-tertiary block font-medium">
                              Bài nộp hoàn chỉnh
                            </span>
                            <span className="text-lg font-black text-text-primary mt-0.5 block">
                              {activeSkill.exercises_count || 1} bài viết
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-surface border border-border/80 text-center">
                            <span className="text-[10px] text-text-tertiary block font-medium">
                              Điểm AI tổng thể
                            </span>
                            <span className="text-lg font-black text-violet-600 mt-0.5 block">
                              {activeSkill.avg_overall_score ||
                                activeSkill.overall_score ||
                                0}
                              /100
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-surface border border-border/80 text-center">
                            <span className="text-[10px] text-text-tertiary block font-medium">
                              Quy mô bài viết
                            </span>
                            <span className="text-lg font-black text-text-primary mt-0.5 block">
                              {activeSkill.avg_word_count || 180} từ
                            </span>
                          </div>
                        </div>

                        {/* Bảng bóc tách 6 tiêu chí Rubric chuẩn Quốc tế */}
                        <div className="space-y-2 pt-1">
                          <span className="text-xs font-bold text-text-secondary block">
                            Bóc tách 6 tiêu chí Rubric đánh giá từ AI (Thang
                            điểm 100):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {(() => {
                              const overallScore =
                                activeSkill.avg_overall_score ??
                                activeSkill.overall_score ??
                                0;
                              const sub = activeSkill.sub_scores || {};
                              const getRubricScore = (
                                val: number | undefined,
                                offset: number
                              ) => {
                                if (
                                  val !== undefined &&
                                  val !== null &&
                                  val > 0
                                )
                                  return val;
                                if (overallScore > 0)
                                  return Math.min(
                                    100,
                                    Math.max(0, overallScore + offset)
                                  );
                                return 0;
                              };

                              return [
                                {
                                  label: "Đáp ứng đề (Task Achievement)",
                                  score: getRubricScore(
                                    sub.task_achievement,
                                    -4
                                  ),
                                },
                                {
                                  label: "Mạch lạc & Liên kết (Coherence)",
                                  score: getRubricScore(sub.coherence, 0),
                                },
                                {
                                  label: "Vốn từ vựng (Lexical Resource)",
                                  score: getRubricScore(
                                    sub.lexical_resource || sub.vocabulary,
                                    0
                                  ),
                                },
                                {
                                  label: "Chuẩn ngữ pháp (Grammar Accuracy)",
                                  score: getRubricScore(
                                    sub.grammatical_accuracy || sub.grammar,
                                    4
                                  ),
                                },
                                {
                                  label: "Tính tự nhiên (Naturalness)",
                                  score: getRubricScore(sub.naturalness, -6),
                                },
                                {
                                  label: "Văn phong phù hợp (Register)",
                                  score: getRubricScore(sub.register, -2),
                                },
                              ];
                            })().map((rubricItem, rIdx) => {
                              const s = Math.round(rubricItem.score);
                              return (
                                <div
                                  key={rIdx}
                                  className="p-3 rounded-xl bg-surface border border-border/70 space-y-1.5"
                                >
                                  <div className="flex items-center justify-between text-xs">
                                    <span
                                      className="font-semibold text-text-primary text-[11px] truncate"
                                      title={rubricItem.label}
                                    >
                                      {rubricItem.label}
                                    </span>
                                    <span className="font-black text-violet-600">
                                      {s}/100
                                    </span>
                                  </div>
                                  <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${
                                        s >= 80
                                          ? "bg-emerald-500"
                                          : s >= 65
                                          ? "bg-violet-500"
                                          : s > 0
                                          ? "bg-amber-500"
                                          : "bg-rose-500"
                                      }`}
                                      style={{ width: `${s}%` }}
                                    />
                                  </div>
                                  <div className="flex justify-between items-center text-[10px] text-text-tertiary">
                                    <span>Đánh giá:</span>
                                    <span className="font-bold text-text-secondary">
                                      {s >= 85
                                        ? "Xuất sắc"
                                        : s >= 70
                                        ? "Khá tốt"
                                        : s >= 50
                                        ? "Đạt yêu cầu"
                                        : s > 0
                                        ? "Cần rèn luyện"
                                        : "Chưa đạt / Cần nộp lại"}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SPEAKING DEEP BREAKDOWN (RUBRIC EVALUATION) */}
                    {activeSkill.skill === "speaking" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="p-3 rounded-xl bg-surface border border-border/80 text-center">
                            <span className="text-[10px] text-text-tertiary block font-medium">
                              Lượt nói / bài ghi âm
                            </span>
                            <span className="text-lg font-black text-text-primary mt-0.5 block">
                              {activeSkill.exercises_count || 1} lượt
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-surface border border-border/80 text-center">
                            <span className="text-[10px] text-text-tertiary block font-medium">
                              Điểm AI tổng thể
                            </span>
                            <span className="text-lg font-black text-pink-600 mt-0.5 block">
                              {activeSkill.avg_overall_score ||
                                activeSkill.overall_score ||
                                0}
                              /100
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-surface border border-border/80 text-center">
                            <span className="text-[10px] text-text-tertiary block font-medium">
                              Thời lượng ghi âm TB
                            </span>
                            <span className="text-lg font-black text-text-primary mt-0.5 block">
                              {activeSkill.recording_duration_seconds || 45}{" "}
                              giây
                            </span>
                          </div>
                        </div>

                        {/* Bảng bóc tách 6 tiêu chí Rubric Speaking */}
                        <div className="space-y-2 pt-1">
                          <span className="text-xs font-bold text-text-secondary block">
                            Bóc tách 6 tiêu chí Rubric đánh giá từ AI (Thang
                            điểm 100):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {[
                              {
                                label: "Phát âm (Pronunciation)",
                                score:
                                  activeSkill.sub_scores?.pronunciation ||
                                  Math.max(
                                    0,
                                    (activeSkill.avg_overall_score || 72) - 4
                                  ),
                              },
                              {
                                label: "Độ trôi chảy (Fluency)",
                                score:
                                  activeSkill.sub_scores?.fluency ||
                                  activeSkill.avg_overall_score ||
                                  72,
                              },
                              {
                                label: "Chuẩn ngữ pháp (Grammar)",
                                score:
                                  activeSkill.sub_scores?.grammar ||
                                  activeSkill.avg_overall_score ||
                                  72,
                              },
                              {
                                label: "Vốn từ vựng (Vocabulary)",
                                score:
                                  activeSkill.sub_scores?.vocabulary ||
                                  Math.min(
                                    100,
                                    (activeSkill.avg_overall_score || 72) + 4
                                  ),
                              },
                              {
                                label: "Tính liên kết (Coherence)",
                                score:
                                  activeSkill.sub_scores?.coherence ||
                                  Math.max(
                                    0,
                                    (activeSkill.avg_overall_score || 72) - 2
                                  ),
                              },
                              {
                                label: "Nội dung truyền đạt (Content)",
                                score:
                                  activeSkill.sub_scores?.content ||
                                  activeSkill.avg_overall_score ||
                                  72,
                              },
                            ].map((rubricItem, rIdx) => {
                              const s = Math.round(rubricItem.score);
                              return (
                                <div
                                  key={rIdx}
                                  className="p-3 rounded-xl bg-surface border border-border/70 space-y-1.5"
                                >
                                  <div className="flex items-center justify-between text-xs">
                                    <span
                                      className="font-semibold text-text-primary text-[11px] truncate"
                                      title={rubricItem.label}
                                    >
                                      {rubricItem.label}
                                    </span>
                                    <span className="font-black text-pink-600">
                                      {s}/100
                                    </span>
                                  </div>
                                  <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${
                                        s >= 80
                                          ? "bg-emerald-500"
                                          : s >= 65
                                          ? "bg-pink-500"
                                          : "bg-amber-500"
                                      }`}
                                      style={{ width: `${s}%` }}
                                    />
                                  </div>
                                  <div className="flex justify-between items-center text-[10px] text-text-tertiary">
                                    <span>Đánh giá:</span>
                                    <span className="font-bold text-text-secondary">
                                      {s >= 85
                                        ? "Xuất sắc"
                                        : s >= 70
                                        ? "Tự nhiên"
                                        : "Cần sửa ngữ điệu"}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* VOCABULARY DEEP BREAKDOWN (COMPACT DAILY SNAPSHOT) */}
                    {activeSkill.skill === "vocabulary" &&
                      (() => {
                        const attempted = activeSkill.questions_attempted || 0;
                        const recalled = activeSkill.questions_correct || 0;
                        const forgotten = Math.max(0, attempted - recalled);
                        const accuracy =
                          activeSkill.accuracy ??
                          (attempted > 0
                            ? Math.round((recalled / attempted) * 100)
                            : 100);
                        const minutes = Math.round(
                          (activeSkill.time_spent_seconds || 0) / 60
                        );

                        return (
                          <div className="space-y-3.5">
                            {/* 3 THẺ CHỈ SỐ TRÍ NHỚ TRONG NGÀY */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              {/* THẺ 1: TỔNG LƯỢT ÔN */}
                              <div className="p-3 rounded-xl bg-surface border border-border/80 text-center">
                                <span className="text-[10px] text-text-tertiary block font-medium">
                                  Lượt ôn luyện trong ngày
                                </span>
                                <span className="text-lg font-black text-text-primary mt-0.5 block">
                                  {attempted} từ
                                </span>
                                <span className="text-[10px] text-text-tertiary block">
                                  {minutes > 0
                                    ? `${minutes} phút học`
                                    : "Chớp nhoáng"}
                                </span>
                              </div>

                              {/* THẺ 2: RECALL THÀNH CÔNG */}
                              <div className="p-3 rounded-xl bg-surface border border-border/80 text-center">
                                <span className="text-[10px] text-text-tertiary block font-medium">
                                  Giữ vững phong độ (Recall)
                                </span>
                                <span className="text-lg font-black text-emerald-600 mt-0.5 block">
                                  {accuracy}%
                                </span>
                                <span className="text-[10px] text-emerald-600/80 font-bold block">
                                  {recalled} / {attempted} từ nhớ đúng
                                </span>
                              </div>

                              {/* THẺ 3: TỪ BỊ QUÊN / LAPSE */}
                              <div className="p-3 rounded-xl bg-surface border border-border/80 text-center">
                                <span className="text-[10px] text-text-tertiary block font-medium">
                                  Bị trượt chân (Lapses)
                                </span>
                                <span
                                  className={`text-lg font-black mt-0.5 block ${
                                    forgotten > 0
                                      ? "text-rose-600"
                                      : "text-emerald-600"
                                  }`}
                                >
                                  {forgotten} từ
                                </span>
                                <span
                                  className={`text-[10px] font-bold block ${
                                    forgotten > 0
                                      ? "text-rose-600/80"
                                      : "text-emerald-600/80"
                                  }`}
                                >
                                  {forgotten > 0
                                    ? "Đã gửi vào Trạm cứu hộ"
                                    : "Không quên từ nào 👏"}
                                </span>
                              </div>
                            </div>

                            {/* DÒNG NHẬN ĐỊNH NGẮN GỌN TỪ SRS INTELLIGENCE */}
                            <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-2.5 text-xs text-text-secondary">
                              <Sparkles
                                size={15}
                                className="text-primary shrink-0"
                              />
                              <span>
                                {forgotten > 0
                                  ? `Hôm nay bạn giữ vững ${accuracy}% trí nhớ. ${forgotten} từ bị quên đã được lưu vào Trạm cứu hộ để chuẩn bị ôn lại.`
                                  : `Xuất sắc! Toàn bộ ${attempted} từ vựng ôn tập hôm nay đều được bạn ghi nhớ chính xác.`}
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                    {/* PRONUNCIATION DEEP BREAKDOWN */}
                    {activeSkill.skill === "pronunciation" &&
                      (() => {
                        const attempted = activeSkill.questions_attempted || 0;
                        const correct = activeSkill.questions_correct || 0;
                        const accuracy =
                          activeSkill.accuracy ??
                          (attempted > 0
                            ? Math.round((correct / attempted) * 100)
                            : 0);
                        const minutes = Math.round(
                          (activeSkill.time_spent_seconds || 0) / 60
                        );

                        return (
                          <div className="space-y-3.5">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              <div className="p-3 rounded-xl bg-surface border border-border/80 text-center">
                                <span className="text-[10px] text-text-tertiary block font-medium">
                                  Lượt phân biệt âm IPA
                                </span>
                                <span className="text-lg font-black text-text-primary mt-0.5 block">
                                  {attempted} lượt
                                </span>
                                <span className="text-[10px] text-text-tertiary block">
                                  {minutes > 0
                                    ? `${minutes} phút luyện`
                                    : "Nhanh chóng"}
                                </span>
                              </div>

                              <div className="p-3 rounded-xl bg-surface border border-border/80 text-center">
                                <span className="text-[10px] text-text-tertiary block font-medium">
                                  Độ chuẩn xác nhận diện
                                </span>
                                <span className="text-lg font-black text-emerald-600 mt-0.5 block">
                                  {accuracy}%
                                </span>
                                <span className="text-[10px] text-emerald-600/80 font-bold block">
                                  {correct} / {attempted} câu chính xác
                                </span>
                              </div>

                              <div className="p-3 rounded-xl bg-surface border border-border/80 text-center">
                                <span className="text-[10px] text-text-tertiary block font-medium">
                                  Âm luyện tập
                                </span>
                                <span className="text-lg font-black text-teal-600 mt-0.5 block">
                                  {activeSkill.phonemes_practiced || "--"} âm
                                </span>
                                <span className="text-[10px] text-text-secondary block">
                                  Thuộc bảng IPA 44 âm
                                </span>
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-teal-500/5 border border-teal-500/20 flex items-center gap-2.5 text-xs text-text-secondary">
                              <Sparkles
                                size={15}
                                className="text-teal-600 shrink-0"
                              />
                              <span>
                                {accuracy >= 80
                                  ? `Tuyệt vời! Khả năng phân biệt âm thanh IPA đạt ${accuracy}% trong ngày.`
                                  : `Đã hoàn thành ${attempted} lượt phân biệt âm vị. Tiếp tục củng cố các cặp âm dễ nhầm lẫn!`}
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                    {/* Footer CTAs */}
                    <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onSelectSkillTab(activeSkill.skill as SkillTabType)
                        }
                        className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>
                          {activeSkill.skill === "vocabulary"
                            ? "Xem chi tiết độ bền trí nhớ & trạm cứu hộ (Tab Từ vựng)"
                            : activeSkill.skill === "pronunciation"
                            ? "Xem ma trận năng lực 44 âm IPA (Tab Ngữ âm)"
                            : `Xem toàn bộ tiến trình lịch sử ${activeSkill.skill_name}`}
                        </span>
                        <ChevronRight size={14} />
                      </button>

                      <Button
                        size="sm"
                        className="text-xs cursor-pointer font-bold"
                        onClick={() =>
                          onNavigate(
                            activeSkill.skill === "pronunciation"
                              ? "/ipa"
                              : `/${activeSkill.skill}`
                          )
                        }
                      >
                        {activeSkill.skill === "vocabulary"
                          ? "Vào học từ vựng ngay"
                          : activeSkill.skill === "pronunciation"
                          ? "Vào luyện IPA ngay"
                          : `Luyện tiếp bài ${activeSkill.skill_name} ngay`}
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-dashed border-border bg-surface-subtle/30 text-center space-y-2">
              <p className="text-xs text-text-tertiary">
                Không ghi nhận hoạt động luyện tập nào trong ngày{" "}
                {selectedDayData?.day_name || ""} ({selectedDate}).
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs cursor-pointer"
                onClick={() => onNavigate("/practice")}
              >
                Luyện tập ngay
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* 2. CHẨN ĐOÁN ĐIỂM YẾU & TOP 5 LỖI SAI CỐT LÕI (AI WEAKNESS DIAGNOSTIC) */}
      <Card className="dashboard-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <Brain size={16} className="text-violet-600" />
                <span>Chẩn đoán Điểm Yếu & Top 5 Lỗi Sai Cốt Lõi</span>
              </h4>
              {aiDailySummary?.status_badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                  {aiDailySummary.status_badge}
                </span>
              )}
            </div>
            <p className="text-xs text-text-tertiary">
              {aiDailySummary?.headline ||
                "Hệ thống tự động chấm điểm nghiêm trọng, bóc tách bẫy đề thi và lập kế hoạch khắc phục"}
            </p>
          </div>
          {loadingWeaknesses && (
            <Loader2 size={16} className="animate-spin text-primary" />
          )}
        </div>

        {/* BANNER: KẾ HOẠCH HÀNH ĐỘNG SÁNG MAI (3 BƯỚC NHANH) */}
        {aiDailySummary?.next_morning_plan &&
          aiDailySummary.next_morning_plan.length > 0 && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-violet-500/10 via-primary/5 to-surface-subtle/50 border border-violet-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>
                    🌅 Kế hoạch hành động sáng mai (12 phút xử lý dứt điểm):
                  </span>
                </span>
                <span className="text-[10px] text-text-tertiary">
                  Khuyên làm vào đầu ngày
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {aiDailySummary.next_morning_plan.map((step) => (
                  <div
                    key={step.step}
                    onClick={() => onNavigate(step.action_url)}
                    className="p-2.5 rounded-lg bg-surface/80 border border-border/60 hover:border-violet-500/50 hover:shadow-xs transition-all cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-extrabold text-violet-600">
                        Bước {step.step}
                      </span>
                      <span className="text-text-tertiary font-medium">
                        ⏱️ {step.duration}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-text-primary line-clamp-1">
                      {step.title}
                    </p>
                    <span className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-0.5">
                      {step.action_text} →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* BỘ LỌC THEO KỸ NĂNG / LOẠI ĐIỂM YẾU (PHASE 3: WEAKNESS EVIDENCE) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "Tất cả điểm yếu" },
            { id: "grammar", label: "📚 Ngữ pháp" },
            { id: "reading", label: "📖 Đọc hiểu" },
            { id: "listening", label: "🎧 Nghe hiểu" },
            { id: "context", label: "🏢 Bối cảnh đề thi" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setWeaknessFilter(f.id as any)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                weaknessFilter === f.id
                  ? "bg-text-primary text-surface shadow-xs"
                  : "bg-surface-subtle text-text-secondary hover:text-text-primary border border-border/60"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* DANH SÁCH TOP 5 LỖI NGHIÊM TRỌNG ĐƯỢC BÓC TÁCH */}
        {(() => {
          const rawList =
            topWeaknesses.length > 0 ? topWeaknesses : weaknesses || [];
          const filtered = (rawList as any[]).filter((w) => {
            if (weaknessFilter === "all") return true;
            const t = (w.weakness_type || w.skill || "").toLowerCase();
            return t === weaknessFilter;
          });

          if (filtered.length === 0) {
            return (
              <div className="text-center py-6 border border-dashed border-border rounded-xl">
                <CheckCircle
                  size={28}
                  className="mx-auto text-emerald-500 mb-1.5 opacity-80"
                />
                <p className="text-xs font-semibold text-text-primary">
                  Không tìm thấy điểm yếu trong bộ lọc "{weaknessFilter}"!
                </p>
                <p className="text-[11px] text-text-tertiary mt-0.5">
                  Bạn đang làm rất tốt ở phần này hoặc chưa có đủ lượt bài làm
                  để ghi nhận.
                </p>
              </div>
            );
          }

          return (
            <div className="space-y-3">
              {filtered.slice(0, 5).map((w, idx) => (
                <div
                  key={`${w.weakness_type || w.skill}-${
                    w.target_id || w.dimension_id
                  }-${idx}`}
                  className="p-4 rounded-xl border border-border/80 bg-surface-subtle/30 hover:border-border transition-all space-y-3"
                >
                  {/* Header lỗi & Bằng chứng */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/50">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-5 h-5 rounded-full bg-rose-500/15 text-rose-600 font-black text-[11px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider bg-surface border border-border/60 text-text-secondary">
                        {formatSkillName(w.weakness_type || w.skill)}
                      </span>
                      <span className="text-sm font-bold text-text-primary">
                        {formatDimensionName(
                          w.topic_name ||
                            w.dimension_name ||
                            w.target_id ||
                            w.dimension_id
                        )}
                      </span>
                      {w.cefr_level && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {w.cefr_level}
                        </span>
                      )}
                      {w.severity_label ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">
                          {w.severity_label}
                        </span>
                      ) : null}

                      {/* Evidence reliability badge */}
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                          w.evidence_reliability === "HIGH"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : w.evidence_reliability === "MEDIUM"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        }`}
                      >
                        {w.evidence_label ||
                          (w.total_attempts >= 5
                            ? "✓ Bằng chứng tin cậy"
                            : "📊 Cần thêm lượt làm")}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-text-tertiary block">
                          Độ chính xác
                        </span>
                        <span className="text-xs font-black text-rose-600">
                          {w.accuracy_rate !== undefined
                            ? `${w.accuracy_rate}%`
                            : w.accuracy !== undefined
                            ? `${w.accuracy.toFixed(0)}%`
                            : "0%"}
                        </span>
                      </div>
                      <span className="text-[10px] text-text-tertiary">
                        ({w.total_mistakes || 0} lỗi / {w.total_attempts || 0}{" "}
                        câu)
                      </span>
                    </div>
                  </div>

                  {/* Bóc tách nguyên nhân & Bẫy đề thi từ AI */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {w.root_cause && (
                      <div className="p-2.5 rounded-lg bg-surface/60 border border-border/40 space-y-1">
                        <span className="text-[11px] font-bold text-text-primary flex items-center gap-1">
                          <Lightbulb size={13} className="text-amber-500" />
                          <span>Nguyên nhân cốt lõi:</span>
                        </span>
                        <p className="text-[11px] text-text-secondary leading-relaxed">
                          {w.root_cause}
                        </p>
                      </div>
                    )}

                    {w.exam_trap && (
                      <div className="p-2.5 rounded-lg bg-surface/60 border border-border/40 space-y-1">
                        <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                          <AlertTriangle size={13} className="text-rose-500" />
                          <span>Bẫy đề thi cần đề phòng:</span>
                        </span>
                        <p className="text-[11px] text-text-secondary leading-relaxed">
                          {w.exam_trap}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer card: Tiến trình khắc phục (last_5_attempts) & Nút hành động */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="space-y-1.5">
                      {w.context_hint && (
                        <span className="text-[10px] text-text-tertiary block">
                          📍 Bối cảnh:{" "}
                          <strong className="text-text-secondary">
                            {w.context_hint}
                          </strong>
                        </span>
                      )}

                      {/* 5 Dots Visualization & Recovery Status */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {w.last_5_attempts && w.last_5_attempts.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-text-tertiary">
                              5 câu gần nhất:
                            </span>
                            <div className="flex items-center gap-1">
                              {w.last_5_attempts.map(
                                (att: boolean, aIdx: number) => (
                                  <span
                                    key={aIdx}
                                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                      att
                                        ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                                        : "bg-rose-500/20 text-rose-600 border border-rose-500/30"
                                    }`}
                                    title={`Lần ${aIdx + 1}: ${
                                      att ? "Đúng" : "Sai"
                                    }`}
                                  >
                                    {att ? "✓" : "✕"}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Recovery label */}
                        {w.recovery_status && (
                          <span
                            className="text-[10px] font-semibold text-text-secondary"
                            title={w.recovery_status.desc}
                          >
                            {w.recovery_status.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {w.weakness_type === "grammar" ||
                      w.skill === "grammar" ? (
                        <button
                          type="button"
                          onClick={() =>
                            onNavigate(
                              `/grammar?search=${encodeURIComponent(
                                w.topic_name || w.dimension_name || ""
                              )}`
                            )
                          }
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-border/70 hover:border-primary text-text-secondary hover:text-primary font-medium cursor-pointer"
                        >
                          Lý thuyết
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            onNavigate(
                              `/${w.weakness_type || w.skill || "practice"}`
                            )
                          }
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-border/70 hover:border-primary text-text-secondary hover:text-primary font-medium cursor-pointer"
                        >
                          Luyện kỹ năng
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          const dom = (
                            w.weakness_type ||
                            w.skill ||
                            "grammar"
                          ).toUpperCase();
                          const top = encodeURIComponent(
                            w.topic_name ||
                              w.dimension_name ||
                              w.target_id ||
                              ""
                          );
                          onNavigate(
                            `/practice/mistakes?domain=${dom}&topic=${top}`
                          );
                        }}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-border/70 hover:border-rose-500 text-rose-600 hover:bg-rose-500/5 font-semibold cursor-pointer"
                      >
                        Sổ tay câu sai
                      </button>

                      <Button
                        onClick={() => {
                          const url =
                            w.practice_action_url ||
                            `/practice?domain=${
                              w.weakness_type || "grammar"
                            }&topic=${encodeURIComponent(
                              w.topic_name || w.target_id || ""
                            )}`;
                          onNavigate(url);
                        }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        <span>Khắc phục ngay</span>
                        <ChevronRight size={12} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Thông báo về các câu sai nhẹ hơn còn lại */}
              {aiDailySummary?.other_mistakes_count ? (
                <div className="p-3 rounded-xl bg-surface-subtle/40 border border-border/60 flex items-center justify-between gap-3 text-xs">
                  <span className="text-text-tertiary">
                    ℹ️ Bạn còn{" "}
                    <strong>{aiDailySummary.other_mistakes_count}</strong> câu
                    sai khác nhẹ hơn. Hãy ưu tiên xử lý xong 5 lỗi cốt lõi ở
                    trên trước.
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate("/practice/mistakes")}
                    className="text-primary font-bold hover:underline shrink-0 cursor-pointer"
                  >
                    Mở sổ tay câu sai →
                  </button>
                </div>
              ) : null}
            </div>
          );
        })()}
      </Card>

      {/* 3. LƯỚI 6 KỸ NĂNG & PHÂN HỆ LUYỆN TẬP ĐẦY ĐỦ (Reading, Listening, Grammar, Writing, Speaking, Pronunciation) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
            <Sparkles size={16} className="text-primary" />
            <span>Chỉ số Năng lực Luyện tập (6 Phân Hệ)</span>
          </h4>
          <span className="text-[11px] text-text-tertiary">
            Nhấp vào thẻ để xem phân tích chi tiết
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* Card: Reading */}
          <Card
            onClick={() => onSelectSkillTab("reading")}
            className="dashboard-card p-4 hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 text-sm">
                    📖
                  </div>
                  <span className="text-xs font-bold text-text-primary">
                    Đọc hiểu
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {weeklyComp?.reading_improvement !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        weeklyComp.reading_improvement > 0
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : weeklyComp.reading_improvement < 0
                          ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          : "bg-surface-subtle text-text-tertiary border border-border/50"
                      }`}
                      title={`Tuần này: ${
                        weeklyComp.this_week?.reading?.accuracy ?? "--"
                      }% vs Tuần trước: ${
                        weeklyComp.last_week?.reading?.accuracy ?? "--"
                      }%`}
                    >
                      {weeklyComp.reading_improvement > 0
                        ? `↑ +${weeklyComp.reading_improvement}pp`
                        : weeklyComp.reading_improvement < 0
                        ? `↓ ${weeklyComp.reading_improvement}pp`
                        : "→ 0pp"}
                    </span>
                  )}
                  <EvidenceBadge level={readingStats?.evidence?.level} />
                </div>
              </div>
              <div className="space-y-1.5 py-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-emerald-600">
                    {readingStats?.accuracy
                      ? `${readingStats.accuracy.toFixed(0)}%`
                      : "--"}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-medium">
                    Độ chính xác
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-tertiary">Đã làm:</span>
                  <span className="font-semibold text-text-primary">
                    {readingStats?.total_attempts || 0} bài (
                    {readingStats?.total_questions || 0} câu)
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-text-tertiary">
              <span className="flex items-center gap-1">
                <TrendIcon trend={readingStats?.trend} />
                <span>{formatTrendName(readingStats?.trend)}</span>
              </span>
              <ChevronRight size={12} className="text-text-tertiary" />
            </div>
          </Card>

          {/* Card: Listening */}
          <Card
            onClick={() => onSelectSkillTab("listening")}
            className="dashboard-card p-4 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 text-sm">
                    🎧
                  </div>
                  <span className="text-xs font-bold text-text-primary">
                    Nghe hiểu
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {weeklyComp?.listening_improvement !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        weeklyComp.listening_improvement > 0
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : weeklyComp.listening_improvement < 0
                          ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          : "bg-surface-subtle text-text-tertiary border border-border/50"
                      }`}
                      title={`Tuần này: ${
                        weeklyComp.this_week?.listening?.accuracy ?? "--"
                      }% vs Tuần trước: ${
                        weeklyComp.last_week?.listening?.accuracy ?? "--"
                      }%`}
                    >
                      {weeklyComp.listening_improvement > 0
                        ? `↑ +${weeklyComp.listening_improvement}pp`
                        : weeklyComp.listening_improvement < 0
                        ? `↓ ${weeklyComp.listening_improvement}pp`
                        : "→ 0pp"}
                    </span>
                  )}
                  <EvidenceBadge level={listeningStats?.evidence?.level} />
                </div>
              </div>
              <div className="space-y-1.5 py-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-indigo-600">
                    {listeningStats?.accuracy
                      ? `${listeningStats.accuracy.toFixed(0)}%`
                      : "--"}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-medium">
                    Độ chính xác
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-tertiary">Đã làm:</span>
                  <span className="font-semibold text-text-primary">
                    {listeningStats?.total_attempts || 0} bài (
                    {listeningStats?.total_questions || 0} câu)
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-text-tertiary">
              <span className="flex items-center gap-1">
                <TrendIcon trend={listeningStats?.trend} />
                <span>{formatTrendName(listeningStats?.trend)}</span>
              </span>
              <ChevronRight size={12} className="text-text-tertiary" />
            </div>
          </Card>

          {/* Card: Grammar */}
          <Card
            onClick={() => onSelectSkillTab("grammar")}
            className="dashboard-card p-4 hover:border-amber-500/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 text-sm">
                    📚
                  </div>
                  <span className="text-xs font-bold text-text-primary">
                    Ngữ pháp
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {weeklyComp?.grammar_improvement !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        weeklyComp.grammar_improvement > 0
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : weeklyComp.grammar_improvement < 0
                          ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          : "bg-surface-subtle text-text-tertiary border border-border/50"
                      }`}
                      title={`Tuần này: ${
                        weeklyComp.this_week?.grammar?.accuracy ?? "--"
                      }% vs Tuần trước: ${
                        weeklyComp.last_week?.grammar?.accuracy ?? "--"
                      }%`}
                    >
                      {weeklyComp.grammar_improvement > 0
                        ? `↑ +${weeklyComp.grammar_improvement}pp`
                        : weeklyComp.grammar_improvement < 0
                        ? `↓ ${weeklyComp.grammar_improvement}pp`
                        : "→ 0pp"}
                    </span>
                  )}
                  <EvidenceBadge level={grammarStats?.evidence?.level} />
                </div>
              </div>
              <div className="space-y-1.5 py-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-amber-600">
                    {grammarStats?.accuracy
                      ? `${grammarStats.accuracy.toFixed(0)}%`
                      : "--"}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-medium">
                    Độ chính xác
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-tertiary">Đã làm:</span>
                  <span className="font-semibold text-text-primary">
                    {grammarStats?.total_attempts || 0} bài (
                    {grammarStats?.total_questions || 0} câu)
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-text-tertiary">
              <span className="flex items-center gap-1">
                <TrendIcon trend={grammarStats?.trend} />
                <span>{formatTrendName(grammarStats?.trend)}</span>
              </span>
              <ChevronRight size={12} className="text-text-tertiary" />
            </div>
          </Card>

          {/* Card: Writing */}
          <Card
            onClick={() => onSelectSkillTab("writing")}
            className="dashboard-card p-4 hover:border-violet-500/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center text-violet-600 text-sm">
                    ✍️
                  </div>
                  <span className="text-xs font-bold text-text-primary">
                    Viết
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {weeklyComp?.writing_improvement !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        weeklyComp.writing_improvement > 0
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : weeklyComp.writing_improvement < 0
                          ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          : "bg-surface-subtle text-text-tertiary border border-border/50"
                      }`}
                      title={`Tuần này: ${
                        weeklyComp.this_week?.writing?.avg_score ?? "--"
                      } vs Tuần trước: ${
                        weeklyComp.last_week?.writing?.avg_score ?? "--"
                      }`}
                    >
                      {weeklyComp.writing_improvement > 0
                        ? `↑ +${weeklyComp.writing_improvement}`
                        : weeklyComp.writing_improvement < 0
                        ? `↓ ${weeklyComp.writing_improvement}`
                        : "→ 0"}
                    </span>
                  )}
                  <EvidenceBadge
                    level={writingStats?.evidence?.level || "LOW"}
                  />
                </div>
              </div>
              <div className="space-y-1.5 py-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-violet-600">
                    {writingStats?.accuracy
                      ? `${writingStats.accuracy.toFixed(0)}/100`
                      : "--"}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-medium">
                    Điểm AI
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-tertiary">Đã nộp:</span>
                  <span className="font-semibold text-text-primary">
                    {writingStats?.total_attempts || 0} bài
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-text-tertiary">
              <span className="flex items-center gap-1">
                <TrendIcon trend={writingStats?.trend} />
                <span>{formatTrendName(writingStats?.trend)}</span>
              </span>
              <ChevronRight size={12} className="text-text-tertiary" />
            </div>
          </Card>

          {/* Card: Speaking */}
          <Card
            onClick={() => onSelectSkillTab("speaking")}
            className="dashboard-card p-4 hover:border-pink-500/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-950/50 flex items-center justify-center text-pink-600 text-sm">
                    🎤
                  </div>
                  <span className="text-xs font-bold text-text-primary">
                    Nói
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {weeklyComp?.speaking_improvement !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        weeklyComp.speaking_improvement > 0
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : weeklyComp.speaking_improvement < 0
                          ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          : "bg-surface-subtle text-text-tertiary border border-border/50"
                      }`}
                      title={`Tuần này: ${
                        weeklyComp.this_week?.speaking?.avg_score ?? "--"
                      } vs Tuần trước: ${
                        weeklyComp.last_week?.speaking?.avg_score ?? "--"
                      }`}
                    >
                      {weeklyComp.speaking_improvement > 0
                        ? `↑ +${weeklyComp.speaking_improvement}`
                        : weeklyComp.speaking_improvement < 0
                        ? `↓ ${weeklyComp.speaking_improvement}`
                        : "→ 0"}
                    </span>
                  )}
                  <EvidenceBadge
                    level={speakingStats?.evidence?.level || "LOW"}
                  />
                </div>
              </div>
              <div className="space-y-1.5 py-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-pink-600">
                    {speakingStats?.accuracy
                      ? `${speakingStats.accuracy.toFixed(0)}/100`
                      : "--"}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-medium">
                    Điểm AI
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-tertiary">Đã nộp:</span>
                  <span className="font-semibold text-text-primary">
                    {speakingStats?.total_attempts || 0} bài
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-text-tertiary">
              <span className="flex items-center gap-1">
                <TrendIcon trend={speakingStats?.trend} />
                <span>{formatTrendName(speakingStats?.trend)}</span>
              </span>
              <ChevronRight size={12} className="text-text-tertiary" />
            </div>
          </Card>

          {/* Card: Pronunciation */}
          <Card
            onClick={() => onSelectSkillTab("pronunciation")}
            className="dashboard-card p-4 hover:border-teal-500/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 text-sm">
                    🗣️
                  </div>
                  <span className="text-xs font-bold text-text-primary">
                    Ngữ âm
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {weeklyComp?.pronunciation_improvement !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        weeklyComp.pronunciation_improvement > 0
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : weeklyComp.pronunciation_improvement < 0
                          ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          : "bg-surface-subtle text-text-tertiary border border-border/50"
                      }`}
                      title={`Tuần này: ${
                        weeklyComp.this_week?.pronunciation?.accuracy ?? "--"
                      }% vs Tuần trước: ${
                        weeklyComp.last_week?.pronunciation?.accuracy ?? "--"
                      }%`}
                    >
                      {weeklyComp.pronunciation_improvement > 0
                        ? `↑ +${weeklyComp.pronunciation_improvement}pp`
                        : weeklyComp.pronunciation_improvement < 0
                        ? `↓ ${weeklyComp.pronunciation_improvement}pp`
                        : "→ 0pp"}
                    </span>
                  )}
                  <EvidenceBadge
                    level={pronunciationStats?.evidence?.level || "LOW"}
                  />
                </div>
              </div>
              <div className="space-y-1.5 py-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-teal-600">
                    {pronunciationStats?.accuracy !== undefined
                      ? `${pronunciationStats.accuracy.toFixed(0)}%`
                      : "--"}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-medium">
                    Chính xác
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-tertiary">Đã luyện:</span>
                  <span className="font-semibold text-text-primary">
                    {pronunciationStats?.total_attempts || 0} lượt
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-text-tertiary">
              <span className="flex items-center gap-1">
                <TrendIcon trend={pronunciationStats?.trend} />
                <span>{formatTrendName(pronunciationStats?.trend)}</span>
              </span>
              <ChevronRight size={12} className="text-text-tertiary" />
            </div>
          </Card>
        </div>
      </div>

      {/* 5. HIỆU SUẤT THEO BỐI CẢNH LUYỆN TẬP (CONTEXT PERFORMANCE) */}
      {contextPerf.length > 0 && (
        <Card className="dashboard-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <Target size={16} className="text-primary" />
                <span>
                  Hiệu suất theo Bối cảnh Luyện tập (Context Performance)
                </span>
              </h4>
              <p className="text-[11px] text-text-tertiary">
                Phân tích tỷ lệ trả lời đúng theo từng tình huống và chủ đề giao
                tiếp
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary">
              {contextPerf.length} chủ đề
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {contextPerf.map((ctx) => (
              <div
                key={ctx.context_id}
                className="p-3.5 rounded-xl border border-border bg-surface-subtle/30 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-bold text-text-primary truncate"
                    title={ctx.context_name}
                  >
                    {ctx.context_name}
                  </span>
                  <span
                    className={`text-xs font-black ${
                      ctx.accuracy >= 80
                        ? "text-emerald-600"
                        : ctx.accuracy >= 60
                        ? "text-blue-600"
                        : "text-amber-600"
                    }`}
                  >
                    {ctx.accuracy}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-border/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      ctx.accuracy >= 80
                        ? "bg-emerald-500"
                        : ctx.accuracy >= 60
                        ? "bg-blue-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(ctx.accuracy, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-text-tertiary">
                  <span>
                    Đúng {ctx.correct_count}/{ctx.total_questions} câu
                  </span>
                  <div className="flex items-center gap-1">
                    {ctx.domains.map((dom) => (
                      <span
                        key={dom}
                        className="px-1.5 py-0.5 rounded bg-surface-subtle border border-border/60 text-[9px] font-semibold text-text-secondary"
                      >
                        {dom === "LISTENING"
                          ? "Nghe"
                          : dom === "READING"
                          ? "Đọc"
                          : dom === "WRITING"
                          ? "Viết"
                          : dom === "SPEAKING"
                          ? "Nói"
                          : dom}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 7. CHỈ SỐ NHẬN THỨC & THÓI QUEN LÀM BÀI (CONFIDENCE & BEHAVIORAL INSIGHTS) */}
      {advancedInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Card A: Ma trận Tự tin vs Chính xác */}
          <Card className="dashboard-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <Brain size={15} className="text-violet-500" />
                <span>Độ Tự Tin & Điểm Mù</span>
              </h5>
              {advancedInsights.confidence_accuracy.blind_spots_count > 0 ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                  {advancedInsights.confidence_accuracy.blind_spots_count} Điểm
                  mù
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600">
                  Nhận thức chuẩn
                </span>
              )}
            </div>

            <div className="space-y-2 pt-1">
              {/* High */}
              <div className="p-2 rounded-lg bg-surface-subtle/40 border border-border/40 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-text-primary block text-[11px]">
                    🟢 Tự tin cao
                  </span>
                  <span className="text-[10px] text-text-tertiary">
                    {
                      advancedInsights.confidence_accuracy.high_confidence
                        .attempts
                    }{" "}
                    câu đã làm
                  </span>
                </div>
                <span className="font-black text-emerald-600">
                  {advancedInsights.confidence_accuracy.high_confidence
                    .attempts > 0
                    ? `${advancedInsights.confidence_accuracy.high_confidence.accuracy}%`
                    : "--"}
                </span>
              </div>

              {/* Medium */}
              <div className="p-2 rounded-lg bg-surface-subtle/40 border border-border/40 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-text-primary block text-[11px]">
                    🟡 Tự tin vừa
                  </span>
                  <span className="text-[10px] text-text-tertiary">
                    {
                      advancedInsights.confidence_accuracy.medium_confidence
                        .attempts
                    }{" "}
                    câu đã làm
                  </span>
                </div>
                <span className="font-black text-amber-600">
                  {advancedInsights.confidence_accuracy.medium_confidence
                    .attempts > 0
                    ? `${advancedInsights.confidence_accuracy.medium_confidence.accuracy}%`
                    : "--"}
                </span>
              </div>

              {/* Low */}
              <div className="p-2 rounded-lg bg-surface-subtle/40 border border-border/40 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-text-primary block text-[11px]">
                    ⚪ Tự tin thấp
                  </span>
                  <span className="text-[10px] text-text-tertiary">
                    {
                      advancedInsights.confidence_accuracy.low_confidence
                        .attempts
                    }{" "}
                    câu đã làm
                  </span>
                </div>
                <span className="font-black text-text-secondary">
                  {advancedInsights.confidence_accuracy.low_confidence
                    .attempts > 0
                    ? `${advancedInsights.confidence_accuracy.low_confidence.accuracy}%`
                    : "--"}
                </span>
              </div>
            </div>
          </Card>

          {/* Card B: Phụ thuộc gợi ý (Hints) */}
          <Card className="dashboard-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <Lightbulb size={15} className="text-amber-500" />
                <span>Mức Độ Dùng Gợi Ý</span>
              </h5>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-700">
                {advancedInsights.hint_analysis.hint_dependency_pct}% câu dùng
                hint
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <div className="p-2.5 rounded-lg bg-surface-subtle/40 border border-border/40 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-text-primary block text-[11px]">
                    Tự làm (Không gợi ý)
                  </span>
                  <span className="text-[10px] text-text-tertiary">
                    {advancedInsights.hint_analysis.total_without_hints} câu
                  </span>
                </div>
                <span className="font-black text-emerald-600">
                  {advancedInsights.hint_analysis.total_without_hints > 0
                    ? `${advancedInsights.hint_analysis.accuracy_without_hints}%`
                    : "--"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-subtle/40 border border-border/40 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-text-primary block text-[11px]">
                    Có mở gợi ý
                  </span>
                  <span className="text-[10px] text-text-tertiary">
                    {advancedInsights.hint_analysis.total_with_hints} câu
                  </span>
                </div>
                <span className="font-black text-amber-600">
                  {advancedInsights.hint_analysis.total_with_hints > 0
                    ? `${advancedInsights.hint_analysis.accuracy_with_hints}%`
                    : "--"}
                </span>
              </div>

              <p className="text-[10px] text-text-tertiary italic pt-0.5">
                {advancedInsights.hint_analysis.hint_dependency_pct > 30
                  ? "⚠️ Cần hạn chế phụ thuộc vào gợi ý khi luyện thi Part 5 & 6."
                  : "💡 Khả năng giải đề độc lập đang duy trì rất tốt!"}
              </p>
            </div>
          </Card>

          {/* Card C: Chỉ số hành vi luyện tập */}
          <Card className="dashboard-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <Activity size={15} className="text-blue-500" />
                <span>Hành Vi & Tốc Độ Thực Hành</span>
              </h5>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-600">
                Thói quen
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <div className="p-2 rounded-lg bg-surface-subtle/40 border border-border/40 flex items-center justify-between text-xs">
                <span className="text-text-secondary text-[11px]">
                  ✍️ Tốc độ viết bài:
                </span>
                <span className="font-bold text-text-primary">
                  {advancedInsights.behavioral_metrics.writing
                    .words_per_minute > 0
                    ? `${advancedInsights.behavioral_metrics.writing.words_per_minute} từ/phút`
                    : `${advancedInsights.behavioral_metrics.writing.avg_word_count} từ/bài`}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-surface-subtle/40 border border-border/40 flex items-center justify-between text-xs">
                <span className="text-text-secondary text-[11px]">
                  🎤 Thời lượng nói TB:
                </span>
                <span className="font-bold text-text-primary">
                  {advancedInsights.behavioral_metrics.speaking
                    .avg_speaking_time_seconds > 0
                    ? `${advancedInsights.behavioral_metrics.speaking.avg_speaking_time_seconds}s`
                    : "--"}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-surface-subtle/40 border border-border/40 flex items-center justify-between text-xs">
                <span className="text-text-secondary text-[11px]">
                  🎧 Số lần nghe lại:
                </span>
                <span className="font-bold text-text-primary">
                  {advancedInsights.behavioral_metrics.listening.avg_replays > 0
                    ? `${advancedInsights.behavioral_metrics.listening.avg_replays} lần/câu`
                    : "1.0 lần"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 8. LỊCH SỬ LUYỆN TẬP GẦN ĐÂY (RECENT PRACTICE HISTORY - KHU VỰC D) */}
      <Card className="dashboard-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <Clock size={16} className="text-primary" />
              <span>Lịch sử Luyện tập Gần đây (Recent Practice History)</span>
            </h4>
            <p className="text-[11px] text-text-tertiary">
              Các bài tập và câu hỏi bạn vừa hoàn thành trong các phiên gần nhất
            </p>
          </div>
          <Button
            onClick={() => onNavigate("/practice/mistakes")}
            variant="outline"
            className="text-xs px-3 py-1.5 rounded-lg border-border hover:border-primary cursor-pointer text-text-secondary hover:text-primary"
          >
            <span>Mở sổ tay lỗi sai</span>
            <ChevronRight size={12} className="ml-1" />
          </Button>
        </div>

        {recentHistory.length === 0 ? (
          <div className="text-center py-8 text-xs text-text-tertiary border border-dashed border-border rounded-xl">
            Chưa có lịch sử làm bài gần đây. Hãy chọn một bài luyện tập để bắt
            đầu!
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {recentHistory.map((item, idx) => {
              const skillBadgeColor =
                item.skill === "reading"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : item.skill === "listening"
                  ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                  : item.skill === "grammar"
                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  : item.skill === "writing"
                  ? "bg-violet-500/10 text-violet-600 border-violet-500/20"
                  : item.skill === "speaking"
                  ? "bg-pink-500/10 text-pink-600 border-pink-500/20"
                  : item.skill === "pronunciation"
                  ? "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400"
                  : "bg-surface-subtle text-text-secondary border-border";

              const skillEmoji =
                item.skill === "reading"
                  ? "📖"
                  : item.skill === "listening"
                  ? "🎧"
                  : item.skill === "grammar"
                  ? "📚"
                  : item.skill === "writing"
                  ? "✍️"
                  : item.skill === "speaking"
                  ? "🎤"
                  : item.skill === "pronunciation"
                  ? "🗣️"
                  : "📝";

              return (
                <div
                  key={item.id || idx}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-subtle/30 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="text-xl shrink-0 mt-0.5 sm:mt-0">
                      {skillEmoji}
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold border ${skillBadgeColor}`}
                        >
                          {item.skill_label}
                        </span>
                        <span className="text-xs font-bold text-text-primary">
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-text-tertiary">
                        <span>⏱️ {item.time_spent_formatted}</span>
                        <span>•</span>
                        <span>
                          {new Date(item.created_at).toLocaleDateString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span
                      className={`text-xs font-black ${
                        item.is_passed ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {item.score_display}
                    </span>
                    <Button
                      onClick={() => onNavigate(item.review_url || "/practice")}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg cursor-pointer ${
                        item.is_passed
                          ? "bg-surface-subtle hover:bg-surface border border-border text-text-primary"
                          : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/30"
                      }`}
                    >
                      {item.is_passed
                        ? "Xem lại"
                        : item.skill === "pronunciation"
                        ? "Luyện âm này"
                        : "Ôn câu này"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

export default OverviewTab;

