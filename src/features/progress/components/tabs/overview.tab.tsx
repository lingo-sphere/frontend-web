// Thành phần hiển thị tổng quan tiến độ phân tích năng lực và điểm yếu học viên hỗ trợ đa ngôn ngữ.
"use client";

import { useState, useEffect } from "react";
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
  Activity,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/hooks/use.language";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import type { VocabStatsSummary } from "@/features/progress/hooks/use.progress.data";
import type {
  SkillStats,
  WeaknessAnalysis,
  PracticeDashboardData,
} from "@/features/progress/services/progress.service";
import {
  formatSkillName,
  formatTrendName,
  formatDimensionName,
} from "@/features/progress/components/progress.helpers";

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
  period?: '7d' | '30d' | '90d' | 'all';
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
  period = '7d',
  readingStats,
  listeningStats,
  grammarStats,
  writingStats,
  speakingStats,
  pronunciationStats,
  listeningScore: _listeningScore,
  readingScore: _readingScore,
  weaknesses = [],
  loadingWeaknesses = false,
  dashboardData,
  onNavigate,
  onSelectSkillTab,
}: {
  period?: '7d' | '30d' | '90d' | 'all';
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
  const { isVietnamese, t } = useLanguage();
  const isVi = isVietnamese;

  const rolling = dashboardData?.growth_analytics?.rolling_performance;
  const timeGrowth = dashboardData?.growth_analytics?.time_growth;
  const activity = dashboardData?.growth_analytics?.activity_overview;
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

  const dailyBreakdown = timeGrowth?.daily_breakdown_30d || timeGrowth?.daily_breakdown_7d || [];
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

  const [selectedSkillKey, setSelectedSkillKey] = useState<string | null>(null);

  const [weaknessFilter, setWeaknessFilter] = useState<
    "all" | "grammar" | "reading" | "listening" | "context"
  >("all");

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
        ? (isVi ? "✓ Tin cậy" : "✓ Reliable")
        : level === "MEDIUM"
        ? (isVi ? "📊 Vừa đủ" : "📊 Adequate")
        : (isVi ? "⚠️ Ít data" : "⚠️ Low Data")}
    </span>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="dashboard-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-text-primary">${isVi ? "Thước đo Phong độ (Rolling Performance)" : "Rolling Performance Gauge"}</h4>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      rolling?.momentum_status === "ACCELERATING"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : rolling?.momentum_status === "DECLINING"
                        ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        : "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                    }`}
                  >
                    {rolling?.status_label ? (isVi ? rolling.status_label : (rolling.momentum_status === "ACCELERATING" ? "Accelerating" : rolling.momentum_status === "DECLINING" ? "Declining" : "Stable Performance")) : (isVi ? "Phong độ ổn định" : "Stable Performance")}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl border border-border bg-surface-subtle/50 text-center">
                <span className="text-[10px] text-text-tertiary block font-medium">${isVi ? `Gần đây (${rolling?.window_size || 0} câu)` : `Recent (${rolling?.window_size || 0} questions)`}</span>
                <span className="text-lg font-black text-text-primary">
                  {rolling?.recent_accuracy !== undefined
                    ? `${rolling.recent_accuracy}%`
                    : "--"}
                </span>
                <span className="text-[10px] text-text-secondary block">{isVi ? "Độ chính xác" : "Accuracy"}</span>
              </div>

              <div className="p-3 rounded-xl border border-border bg-surface-subtle/50 text-center">
                <span className="text-[10px] text-text-tertiary block font-medium">${isVi ? "Toàn thời gian" : "All-time"}</span>
                <span className="text-lg font-black text-text-secondary">
                  {rolling?.lifetime_accuracy !== undefined
                    ? `${rolling.lifetime_accuracy}%`
                    : "--"}
                </span>
                <span className="text-[10px] text-text-secondary block">{isVi ? "Trung bình lịch sử" : "Historical Average"}</span>
              </div>

              <div className="p-3 rounded-xl border border-border bg-surface-subtle/50 text-center">
                <span className="text-[10px] text-text-tertiary block font-medium">${isVi ? "Chỉ số Momentum" : "Momentum Index"}</span>
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
                  {(rolling?.momentum_delta || 0) >= 0 ? (isVi ? "Bứt phá" : "Surging") : (isVi ? "Chững lại" : "Slowing")}
                </span>
              </div>
            </div>

            {rolling?.recent_scores_sparkline &&
            rolling.recent_scores_sparkline.length > 0 ? (
              <div className="space-y-2 p-3 rounded-xl bg-surface-subtle/30 border border-border/60">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-tertiary">{isVi ? "Chuỗi câu trả lời gần nhất:" : "Recent answer streak:"}</span>
                  <span className="text-text-secondary font-medium">
                    {
                      rolling.recent_scores_sparkline.filter(
                        (s: number) => s === 100
                      ).length
                    }
                    /{rolling.recent_scores_sparkline.length} ${isVi ? "đúng" : "correct"}
                  </span>
                </div>

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
                          title={isVi ? `Câu ${idx + 1}: ${val === 100 ? "Đúng" : "Sai"}` : `Q${idx + 1}: ${val === 100 ? "Correct" : "Incorrect"}`}
                        />
                      );
                    }
                  )}
                </div>

                {(() => {
                  if (hoveredSparklineIndex === null) {
                    return (
                      <p className="text-[10px] text-text-tertiary text-center pt-0.5">
                        {isVi ? "💡 Rê chuột vào từng vạch để nhận diện câu hỏi thuộc bài tập & chủ đề nào" : "💡 Hover over bars to see question context & topic"}
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
                            ${isVi ? `Câu ${hoveredSparklineIndex + 1}` : `Q${hoveredSparklineIndex + 1}`}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                              isCorrect
                                ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-600 border border-rose-500/30"
                            }`}
                          >
                            {isCorrect ? (isVi ? "✓ Chính xác" : "✓ Correct") : (isVi ? "✕ Chưa chính xác" : "✕ Incorrect")}
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
                            {detail?.skill_label || (isVi ? "📚 Bài luyện" : "📚 Practice Exercise")}
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
                {isVi ? "Chưa có đủ lượt làm bài gần đây để vẽ chuỗi phong độ" : "Insufficient recent practice attempts to render sparkline"}
              </div>
            )}
          </div>
        </Card>

        <Card className="dashboard-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-text-primary">${isVi ? "Tốc độ Tăng trưởng & Nhịp học (Growth Velocity)" : "Growth Velocity & Study Rhythm"}</h4>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      timeGrowth?.trend_direction === "UP"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : timeGrowth?.trend_direction === "DOWN"
                        ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    }`}
                  >
                    {timeGrowth?.trend_label ? (isVi ? timeGrowth.trend_label : (timeGrowth.trend_direction === "UP" ? "Accelerating Pace" : "Steady Rhythm")) : (isVi ? "Nhịp học ổn định" : "Steady Rhythm")}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div
                className="p-3 rounded-xl border border-border bg-surface-subtle/50 text-center cursor-help"
                title={`${
                  timeGrowth?.this_week_total ||
                  activity?.this_week_questions ||
                  0
                } lượt trả lời câu hỏi & ôn luyện lỗi sai trong khoảng đã chọn`}
              >
                <span className="text-[10px] text-text-tertiary block font-medium">
                  {period === 'all' ? (isVi ? 'Toàn bộ thời gian' : 'All-time') : (isVi ? `Luyện ${period.replace('d', '')} ngày qua` : `Past ${period.replace('d', '')} days`)}
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
                title={isVi ? "Số lượt câu hỏi và lượt ôn lỗi trung bình mỗi ngày trong khoảng đã chọn" : "Average daily questions and mistake reviews in selected period"}
              >
                <span className="text-[10px] text-text-tertiary block font-medium">{isVi ? "Nhịp độ học tập" : "Learning Pace"}</span>
                <span className="text-lg font-black text-text-primary">
                  {timeGrowth?.study_velocity || 0}
                </span>
                <span className="text-[10px] text-text-secondary block font-medium">
                  lượt / ngày
                </span>
              </div>

              <div className="p-3 rounded-xl border border-border bg-surface-subtle/50 text-center">
                <span className="text-[10px] text-text-tertiary block font-medium">${isVi ? "Δ Độ chính xác" : "Δ Accuracy"}</span>
                <span
                  className={`text-lg font-black ${
                    (timeGrowth?.overall_delta_accuracy || 0) > 0
                      ? "text-emerald-600"
                      : (timeGrowth?.overall_delta_accuracy || 0) < 0
                      ? "text-rose-600"
                      : "text-text-secondary"
                  }`}
                >
                  {!timeGrowth?.has_accuracy_comparison || period === 'all' ? '--' : (timeGrowth?.overall_delta_accuracy || 0) > 0
                    ? `+${timeGrowth?.overall_delta_accuracy}%`
                    : `${timeGrowth?.overall_delta_accuracy || 0}%`}
                </span>
                <span className="text-[10px] text-text-secondary block">
                  {period === 'all' ? (isVi ? 'Không có kỳ trước' : 'No previous period') : (isVi ? `so với ${period.replace('d', '')} ngày trước` : `vs previous ${period.replace('d', '')} days`)}
                </span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-border/40 text-center">
            <div className="p-1.5 rounded-lg bg-surface-subtle/40 border border-border/40">
              <span className="text-[10px] text-text-tertiary block font-medium">
                ${isVi ? "⏱️ Thời gian học" : "⏱️ Study Time"}
              </span>
              <span className="text-xs font-bold text-text-primary block">
                {activity?.this_week_time_formatted || "0m"}
              </span>
              <span className="text-[9px] text-emerald-600 block font-semibold">
                {(activity?.time_growth_pct || 0) > 0
                  ? `+${activity?.time_growth_pct}%`
                  : (isVi ? "Mới bắt đầu" : "Getting started")}
              </span>
            </div>

            <div className="p-1.5 rounded-lg bg-surface-subtle/40 border border-border/40">
              <span
                className="text-[10px] text-text-tertiary block font-medium"
                title={isVi ? "Số bài đọc, bài nghe, bài viết, đề luyện tập riêng biệt đã làm" : "Number of distinct reading, listening, writing and test units completed"}
              >
                {isVi ? "📝 Bài tập đã làm" : "📝 Exercises Done"}
              </span>
              <span className="text-xs font-bold text-violet-600 block">
                {activity?.this_week_exercises || 0} {isVi ? "bài" : "units"}
              </span>
              <span className="text-[9px] text-text-tertiary block">
                {isVi ? "Bài tập chính thức" : "Official Practice"}
              </span>
            </div>

            <div className="p-1.5 rounded-lg bg-surface-subtle/40 border border-border/40">
              <span
                className="text-[10px] text-text-tertiary block font-medium"
                title={isVi ? "Tỉ lệ làm bài chính xác trung bình trong 7 ngày qua" : "Average accuracy rate over the past 7 days"}
              >
                ${isVi ? "🎯 Tỉ lệ chính xác" : "🎯 Accuracy Rate"}
              </span>
              <span className="text-xs font-bold text-emerald-600 block">
                {activity?.this_week_accuracy !== undefined
                  ? `${activity.this_week_accuracy}%`
                  : "--"}
              </span>
              <span className="text-[9px] text-text-tertiary block">
                {isVi ? "Câu trả lời đúng" : "Correct Answers"}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="dashboard-card p-5 space-y-4 border-primary/20 bg-linear-to-b from-surface to-surface-subtle/40">
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
              {isVi ? "Chọn ngày để kiểm tra kết quả và kỹ năng đã làm" : "Select date to inspect practice results and skills"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
          <select aria-label={isVi ? "Chọn ngày xem chi tiết" : "Select date for details"} value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-text-primary">
            {dailyBreakdown.map((day: any) => <option key={day.date} value={day.date}>{day.full_date_label || day.date}</option>)}
          </select>
          <button
            type="button"
            onClick={() => onNavigate(`/practice?date=${selectedDate}`)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>{isVi ? "Xem danh sách bài ngày này" : "View day's exercises"}</span>
            <ArrowRight size={14} />
          </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl border border-border/80 bg-surface text-center">
            <span className="text-[11px] text-text-tertiary block font-medium">
              {isVi ? "⏱️ Thời gian học" : "⏱️ Study Time"}
            </span>
            <span className="text-base sm:text-lg font-black text-text-primary mt-0.5 block">
              {selectedDayData?.time_spent_formatted || "0 phút"}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-border/80 bg-surface text-center">
            <span
              className="text-[11px] text-text-tertiary block font-medium"
              title={isVi ? "Số đơn vị bài tập chính thức đã làm trong ngày" : "Number of official exercises completed on this day"}
            >
              {isVi ? "📝 Bài hoàn thành" : "📝 Exercises Done"}
            </span>
            <span className="text-base sm:text-lg font-black text-violet-600 mt-0.5 block">
              {selectedDayData?.exercises_count || 0} {isVi ? "bài" : "units"}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-border/80 bg-surface text-center">
            <span
              className="text-[11px] text-text-tertiary block font-medium"
              title={isVi ? "Tổng lượt làm bài mới và lượt ôn lại câu sai trong Sổ tay lỗi sai" : "Total new attempts and mistake reviews"}
            >
              {isVi ? "🎯 Lượt làm & Ôn lỗi" : "🎯 Attempts & Reviews"}
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
              ${isVi ? "📊 Độ chính xác" : "📊 Accuracy"}
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-600 mt-0.5 block">
              {selectedDayData?.has_activity &&
              (selectedDayData?.questions_attempted || 0) > 0
                ? `${selectedDayData.accuracy}%`
                : "--"}
            </span>
          </div>
        </div>

        {selectedDayData?.skill_breakdown && (
          <div className="mt-2 p-3 rounded-xl bg-surface-subtle/50 border border-border/60">
            <span className="text-[11px] text-text-tertiary block font-medium mb-2">
              {isVi ? "Chi tiết theo kỹ năng:" : "Skill breakdown:"}
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

        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-text-secondary">
              {isVi ? "Kỹ năng đã luyện trong ngày:" : "Skills practiced today:"}
            </span>
            <span className="text-[11px] text-text-tertiary">
              {selectedDayData?.skills_practiced?.length || 0} ${isVi ? "kỹ năng ghi nhận" : "skills recorded"}
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

                          {isProductive ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-text-tertiary">
                                  {isVi ? "Sản phẩm nộp:" : "Submissions:"}
                                </span>
                                <span className="font-bold text-text-primary">
                                  {skillItem.exercises_count || 1} {isVi ? "bài làm" : "tasks"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-text-tertiary">
                                  ${isVi ? "Điểm AI trung bình:" : "Avg AI Score:"}
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
                                    ? `${skillItem.exercises_count || 0} $${isVi ? "bài" : "units"} • `
                                    : ""}
                                  {isVi ? "Đúng / Tổng câu:" : "Correct / Total:"}
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
                                {skillItem.accuracy}% ${isVi ? "chính xác" : "accuracy"}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-semibold text-primary">
                          <span>
                            {isSelected
                              ? (isVi ? "Đang mở bóc tách ▼" : "Viewing breakdown ▼") : (isVi ? "Nhấp xem bóc tách sâu ▶" : "Click for deep breakdown ▶")}
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

              {(() => {
                const skill = selectedDayData.skills_practiced.find((item: any) => item.skill === selectedSkillKey);
                if (!skill) return null;
                return <div className="rounded-xl border border-border bg-surface-subtle/40 p-4 space-y-2">
                  <h5 className="text-sm font-bold text-text-primary">{skill.icon} {skill.skill_name}</h5>
                  {skill.is_rubric ? <p className="text-xs text-text-secondary">{skill.submissions ?? 0} {isVi ? "bài nộp · Điểm trung bình:" : "submissions · Avg score:"} {skill.avg_overall_score ?? skill.overall_score ?? 0}/100</p> : <p className="text-xs text-text-secondary">{skill.questions_attempted ?? 0} {isVi ? "câu hoặc ô đã làm ·" : "items completed ·"} {skill.questions_correct ?? 0} {isVi ? "đúng" : "correct"}</p>}
                  {skill.is_rubric && skill.sub_scores && <div className="flex flex-wrap gap-2">{Object.entries(skill.sub_scores).filter(([, value]) => typeof value === 'number' && value > 0).map(([key, value]) => <span key={key} className="rounded-lg bg-surface px-2 py-1 text-xs text-text-secondary">{formatDimensionName(key, isVi)}: {String(value)}/100</span>)}</div>}
                  <button type="button" className="text-xs font-semibold text-primary" onClick={() => onSelectSkillTab(skill.skill as SkillTabType)}>{isVi ? "Xem chi tiết kỹ năng →" : "View skill details →"}</button>
                </div>;
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
                ${isVi ? "Luyện tập ngay" : "Practice Now"}
              </Button>
            </div>
          )}
        </div>
      </Card>

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
                  ${isVi ? `Không tìm thấy điểm yếu trong bộ lọc "${weaknessFilter}"!` : `No weaknesses found under "${weaknessFilter}" filter!`}
                </p>
                <p className="text-[11px] text-text-tertiary mt-0.5">
                  ${isVi ? "Bạn đang làm rất tốt ở phần này hoặc chưa có đủ lượt bài làm để ghi nhận." : "You are performing very well here or have not recorded enough attempts yet."}
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/50">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-5 h-5 rounded-full bg-rose-500/15 text-rose-600 font-black text-[11px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider bg-surface border border-border/60 text-text-secondary">
                        {formatSkillName(w.weakness_type || w.skill, isVi)}
                      </span>
                      <span className="text-sm font-bold text-text-primary">
                        {formatDimensionName(
                          w.topic_name ||
                            w.dimension_name ||
                            w.target_id ||
                            w.dimension_id
                        , isVi)}
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
                            ? (isVi ? "✓ Bằng chứng tin cậy" : "✓ Reliable evidence") : (isVi ? "📊 Cần thêm lượt làm" : "📊 Needs more attempts"))}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {w.root_cause && (
                      <div className="p-2.5 rounded-lg bg-surface/60 border border-border/40 space-y-1">
                        <span className="text-[11px] font-bold text-text-primary flex items-center gap-1">
                          <Lightbulb size={13} className="text-amber-500" />
                          <span>{isVi ? "Nguyên nhân cốt lõi:" : "Root cause:"}</span>
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
                          <span>{isVi ? "Bẫy đề thi cần đề phòng:" : "Exam trap warning:"}</span>
                        </span>
                        <p className="text-[11px] text-text-secondary leading-relaxed">
                          {w.exam_trap}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="space-y-1.5">
                      {w.context_hint && (
                        <span className="text-[10px] text-text-tertiary block">
                          {isVi ? "📍 Bối cảnh:" : "📍 Context:"}{" "}
                          <strong className="text-text-secondary">
                            {w.context_hint}
                          </strong>
                        </span>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        {w.last_5_attempts && w.last_5_attempts.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-text-tertiary">
                              ${isVi ? "5 câu gần nhất:" : "Last 5 attempts:"}
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
                                    title={isVi ? `Lần ${aIdx + 1}: ${att ? "Đúng" : "Sai"}` : `Attempt ${aIdx + 1}: ${att ? "Correct" : "Wrong"}`}
                                  >
                                    {att ? "✓" : "✕"}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

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
                        <span>{isVi ? "Khắc phục ngay" : "Fix Now"}</span>
                        <ChevronRight size={12} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

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
                    {isVi ? "Mở sổ tay câu sai →" : "Open Mistake Vault →"}
                  </button>
                </div>
              ) : null}
            </div>
          );
        })()}
      </Card>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
            <Sparkles size={16} className="text-primary" />
            <span>{isVi ? "Chỉ số Năng lực Luyện tập (6 Phân Hệ)" : "Practice Competency Index (6 Skill Modules)"}</span>
          </h4>
          <span className="text-[11px] text-text-tertiary">
            {isVi ? "Nhấp vào thẻ để xem phân tích chi tiết" : "Click card to view detailed breakdown"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
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
                  <span className="text-xs font-bold text-text-primary">${isVi ? "Đọc hiểu" : "Reading"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {weeklyComp?.reading_improvement !== undefined && weeklyComp?.this_week?.reading?.attempts > 0 && weeklyComp?.last_week?.reading?.attempts > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        weeklyComp.reading_improvement > 0
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : weeklyComp.reading_improvement < 0
                          ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          : "bg-surface-subtle text-text-tertiary border border-border/50"
                      }`}
                      title={isVi ? `Tuần này: ${
                        weeklyComp.this_week?.reading?.accuracy ?? "--"
                      }% vs Tuần trước: ${
                        weeklyComp.last_week?.reading?.accuracy ?? "--"
                      }%` : `This week: ${
                        weeklyComp.this_week?.reading?.accuracy ?? "--"
                      }% vs Last week: ${
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
                    {(readingStats?.total_questions ?? 0) > 0 || (readingStats?.dictation_words ?? 0) > 0
                      ? `${readingStats!.accuracy.toFixed(0)}%`
                      : "--"}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-medium">{isVi ? "Độ chính xác" : "Accuracy"}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-tertiary">{isVi ? "Đã làm:" : "Done:"}</span>
                  <span className="font-semibold text-text-primary">
                    {readingStats?.total_attempts || 0} {isVi ? "bài (" : "units ("}{readingStats?.total_questions || 0} {isVi ? "câu)" : "questions)"}
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-text-tertiary">
              <span className="flex items-center gap-1">
                <TrendIcon trend={readingStats?.trend} />
                <span>{formatTrendName(readingStats?.trend, isVi)}</span>
              </span>
              <ChevronRight size={12} className="text-text-tertiary" />
            </div>
          </Card>

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
                  <span className="text-xs font-bold text-text-primary">${isVi ? "Nghe hiểu" : "Listening"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {weeklyComp?.listening_improvement !== undefined && weeklyComp?.this_week?.listening?.attempts > 0 && weeklyComp?.last_week?.listening?.attempts > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        weeklyComp.listening_improvement > 0
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : weeklyComp.listening_improvement < 0
                          ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          : "bg-surface-subtle text-text-tertiary border border-border/50"
                      }`}
                      title={isVi ? `Tuần này: ${
                        weeklyComp.this_week?.listening?.accuracy ?? "--"
                      }% vs Tuần trước: ${
                        weeklyComp.last_week?.listening?.accuracy ?? "--"
                      }%` : `This week: ${
                        weeklyComp.this_week?.listening?.accuracy ?? "--"
                      }% vs Last week: ${
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
                    {(listeningStats?.total_questions ?? 0) > 0 || (listeningStats?.dictation_words ?? 0) > 0
                      ? `${listeningStats!.accuracy.toFixed(0)}%`
                      : "--"}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-medium">{isVi ? "Độ chính xác" : "Accuracy"}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-tertiary">{isVi ? "Đã làm:" : "Done:"}</span>
                  <span className="font-semibold text-text-primary">
                    {listeningStats?.total_attempts || 0} {isVi ? "bài (" : "units ("}{listeningStats?.total_questions || 0} {isVi ? "câu · " : "questions · "}{listeningStats?.dictation_words || 0} {isVi ? "ô)" : "blanks)"}
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-text-tertiary">
              <span className="flex items-center gap-1">
                <TrendIcon trend={listeningStats?.trend} />
                <span>{formatTrendName(listeningStats?.trend, isVi)}</span>
              </span>
              <ChevronRight size={12} className="text-text-tertiary" />
            </div>
          </Card>

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
                  <span className="text-xs font-bold text-text-primary">${isVi ? "Ngữ pháp" : "Grammar"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {weeklyComp?.grammar_improvement !== undefined && weeklyComp?.this_week?.grammar?.attempts > 0 && weeklyComp?.last_week?.grammar?.attempts > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        weeklyComp.grammar_improvement > 0
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : weeklyComp.grammar_improvement < 0
                          ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          : "bg-surface-subtle text-text-tertiary border border-border/50"
                      }`}
                      title={isVi ? `Tuần này: ${
                        weeklyComp.this_week?.grammar?.accuracy ?? "--"
                      }% vs Tuần trước: ${
                        weeklyComp.last_week?.grammar?.accuracy ?? "--"
                      }%` : `This week: ${
                        weeklyComp.this_week?.grammar?.accuracy ?? "--"
                      }% vs Last week: ${
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
                    {(grammarStats?.total_questions ?? 0) > 0 || (grammarStats?.dictation_words ?? 0) > 0
                      ? `${grammarStats!.accuracy.toFixed(0)}%`
                      : "--"}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-medium">{isVi ? "Độ chính xác" : "Accuracy"}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-tertiary">{isVi ? "Đã làm:" : "Done:"}</span>
                  <span className="font-semibold text-text-primary">
                    {grammarStats?.total_attempts || 0} {isVi ? "bài (" : "units ("}{grammarStats?.total_questions || 0} {isVi ? "câu)" : "questions)"}
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-text-tertiary">
              <span className="flex items-center gap-1">
                <TrendIcon trend={grammarStats?.trend} />
                <span>{formatTrendName(grammarStats?.trend, isVi)}</span>
              </span>
              <ChevronRight size={12} className="text-text-tertiary" />
            </div>
          </Card>

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
                  <span className="text-xs font-bold text-text-primary">${isVi ? "Viết" : "Writing"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {weeklyComp?.writing_improvement !== undefined && weeklyComp?.this_week?.writing?.graded_submissions > 0 && weeklyComp?.last_week?.writing?.graded_submissions > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        weeklyComp.writing_improvement > 0
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : weeklyComp.writing_improvement < 0
                          ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          : "bg-surface-subtle text-text-tertiary border border-border/50"
                      }`}
                      title={isVi ? `Tuần này: ${
                        weeklyComp.this_week?.writing?.avg_score ?? "--"
                      } vs Tuần trước: ${
                        weeklyComp.last_week?.writing?.avg_score ?? "--"
                      }` : `This week: ${
                        weeklyComp.this_week?.writing?.avg_score ?? "--"
                      } vs Last week: ${
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
                    {(writingStats?.graded_attempts ?? 0) > 0
                      ? `${writingStats!.accuracy.toFixed(0)}/100`
                      : "--"}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-medium">
                    Điểm AI
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-tertiary">{isVi ? "Đã nộp:" : "Submitted:"}</span>
                  <span className="font-semibold text-text-primary">
                    {writingStats?.total_attempts || 0} {isVi ? "bài" : "tasks"}
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-text-tertiary">
              <span className="flex items-center gap-1">
                <TrendIcon trend={writingStats?.trend} />
                <span>{formatTrendName(writingStats?.trend, isVi)}</span>
              </span>
              <ChevronRight size={12} className="text-text-tertiary" />
            </div>
          </Card>

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
                  <span className="text-xs font-bold text-text-primary">${isVi ? "Nói" : "Speaking"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {weeklyComp?.speaking_improvement !== undefined && weeklyComp?.this_week?.speaking?.graded_submissions > 0 && weeklyComp?.last_week?.speaking?.graded_submissions > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        weeklyComp.speaking_improvement > 0
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : weeklyComp.speaking_improvement < 0
                          ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          : "bg-surface-subtle text-text-tertiary border border-border/50"
                      }`}
                      title={isVi ? `Tuần này: ${
                        weeklyComp.this_week?.speaking?.avg_score ?? "--"
                      } vs Tuần trước: ${
                        weeklyComp.last_week?.speaking?.avg_score ?? "--"
                      }` : `This week: ${
                        weeklyComp.this_week?.speaking?.avg_score ?? "--"
                      } vs Last week: ${
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
                    {(speakingStats?.graded_attempts ?? 0) > 0
                      ? `${speakingStats!.accuracy.toFixed(0)}/100`
                      : "--"}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-medium">
                    Điểm AI
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-tertiary">{isVi ? "Đã nộp:" : "Submitted:"}</span>
                  <span className="font-semibold text-text-primary">
                    {speakingStats?.total_attempts || 0} {isVi ? "bài" : "tasks"}
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-text-tertiary">
              <span className="flex items-center gap-1">
                <TrendIcon trend={speakingStats?.trend} />
                <span>{formatTrendName(speakingStats?.trend, isVi)}</span>
              </span>
              <ChevronRight size={12} className="text-text-tertiary" />
            </div>
          </Card>

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
                  <span className="text-xs font-bold text-text-primary">${isVi ? "Ngữ âm" : "Pronunciation"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {weeklyComp?.pronunciation_improvement !== undefined && weeklyComp?.this_week?.pronunciation?.attempts > 0 && weeklyComp?.last_week?.pronunciation?.attempts > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        weeklyComp.pronunciation_improvement > 0
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : weeklyComp.pronunciation_improvement < 0
                          ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          : "bg-surface-subtle text-text-tertiary border border-border/50"
                      }`}
                      title={isVi ? `Tuần này: ${
                        weeklyComp.this_week?.pronunciation?.accuracy ?? "--"
                      }% vs Tuần trước: ${
                        weeklyComp.last_week?.pronunciation?.accuracy ?? "--"
                      }%` : `This week: ${
                        weeklyComp.this_week?.pronunciation?.accuracy ?? "--"
                      }% vs Last week: ${
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
                  <span className="text-text-tertiary">{isVi ? "Đã luyện:" : "Practiced:"}</span>
                  <span className="font-semibold text-text-primary">
                    {pronunciationStats?.total_attempts || 0} {isVi ? "lượt" : "times"}
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-text-tertiary">
              <span className="flex items-center gap-1">
                <TrendIcon trend={pronunciationStats?.trend} />
                <span>{formatTrendName(pronunciationStats?.trend, isVi)}</span>
              </span>
              <ChevronRight size={12} className="text-text-tertiary" />
            </div>
          </Card>
        </div>
      </div>

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
                {isVi ? "Phân tích tỷ lệ trả lời đúng theo từng tình huống và chủ đề giao tiếp" : "Accuracy rate analysis by communicative situations and topics"}
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary">
              {contextPerf.length} ${isVi ? "chủ đề" : "topics"}
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
                    {isVi ? "Đúng " : "Correct "}{ctx.correct_count}/{ctx.total_questions} {isVi ? "câu" : "questions"}
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

      {advancedInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="dashboard-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <Brain size={15} className="text-violet-500" />
                <span>{isVi ? "Độ Tự Tin & Điểm Mù" : "Confidence & Blind Spots"}</span>
              </h5>
              {advancedInsights.confidence_accuracy.blind_spots_count > 0 ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                  {advancedInsights.confidence_accuracy.blind_spots_count} {isVi ? "Điểm mù" : "Blind spots"}
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600">
                  {isVi ? "Nhận thức chuẩn" : "Calibrated"}
                </span>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <div className="p-2 rounded-lg bg-surface-subtle/40 border border-border/40 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-text-primary block text-[11px]">
                    {isVi ? "🟢 Tự tin cao" : "🟢 High Confidence"}
                  </span>
                  <span className="text-[10px] text-text-tertiary">
                    {
                      advancedInsights.confidence_accuracy.high_confidence
                        .attempts
                    }{" "}
                    ${isVi ? "câu đã làm" : "questions attempted"}
                  </span>
                </div>
                <span className="font-black text-emerald-600">
                  {advancedInsights.confidence_accuracy.high_confidence
                    .attempts > 0
                    ? `${advancedInsights.confidence_accuracy.high_confidence.accuracy}%`
                    : "--"}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-surface-subtle/40 border border-border/40 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-text-primary block text-[11px]">
                    {isVi ? "🟡 Tự tin vừa" : "🟡 Medium Confidence"}
                  </span>
                  <span className="text-[10px] text-text-tertiary">
                    {
                      advancedInsights.confidence_accuracy.medium_confidence
                        .attempts
                    }{" "}
                    ${isVi ? "câu đã làm" : "questions attempted"}
                  </span>
                </div>
                <span className="font-black text-amber-600">
                  {advancedInsights.confidence_accuracy.medium_confidence
                    .attempts > 0
                    ? `${advancedInsights.confidence_accuracy.medium_confidence.accuracy}%`
                    : "--"}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-surface-subtle/40 border border-border/40 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-text-primary block text-[11px]">
                    {isVi ? "⚪ Tự tin thấp" : "⚪ Low Confidence"}
                  </span>
                  <span className="text-[10px] text-text-tertiary">
                    {
                      advancedInsights.confidence_accuracy.low_confidence
                        .attempts
                    }{" "}
                    ${isVi ? "câu đã làm" : "questions attempted"}
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

          <Card className="dashboard-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <Lightbulb size={15} className="text-amber-500" />
                <span>{isVi ? "Mức Độ Dùng Gợi Ý" : "Hint Dependency"}</span>
              </h5>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-700">
                {advancedInsights.hint_analysis.hint_dependency_pct}% {isVi ? "câu dùng" : "questions with hints"}
                hint
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <div className="p-2.5 rounded-lg bg-surface-subtle/40 border border-border/40 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-text-primary block text-[11px]">
                    {isVi ? "Tự làm (Không gợi ý)" : "Independent (No hints)"}
                  </span>
                  <span className="text-[10px] text-text-tertiary">
                    {advancedInsights.hint_analysis.total_without_hints} ${isVi ? "câu" : "questions"}
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
                    {isVi ? "Có mở gợi ý" : "Hints Opened"}
                  </span>
                  <span className="text-[10px] text-text-tertiary">
                    {advancedInsights.hint_analysis.total_with_hints} ${isVi ? "câu" : "questions"}
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
                  ? (isVi ? "⚠️ Cần hạn chế phụ thuộc vào gợi ý khi luyện thi Part 5 & 6." : "⚠️ Minimize hint reliance when practicing Part 5 & 6.") : (isVi ? "💡 Khả năng giải đề độc lập đang duy trì rất tốt!" : "💡 Independent problem solving ability is strong!")}
              </p>
            </div>
          </Card>

          <Card className="dashboard-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <Activity size={15} className="text-blue-500" />
                <span>{isVi ? "Hành Vi & Tốc Độ Thực Hành" : "Behavior & Practice Pace"}</span>
              </h5>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-600">{isVi ? "Thói quen" : "Habits"}</span>
            </div>

            <div className="space-y-2 pt-1">
              <div className="p-2 rounded-lg bg-surface-subtle/40 border border-border/40 flex items-center justify-between text-xs">
                <span className="text-text-secondary text-[11px]">
                  ${isVi ? "✍️ Tốc độ viết bài:" : "✍️ Writing pace:"}
                </span>
                <span className="font-bold text-text-primary">
                  {advancedInsights.behavioral_metrics.writing
                    .words_per_minute > 0
                    ? `${advancedInsights.behavioral_metrics.writing.words_per_minute} {isVi ? "từ/phút" : "wpm"}`
                    : `${advancedInsights.behavioral_metrics.writing.avg_word_count} ${isVi ? "từ/bài" : "words/task"}`}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-surface-subtle/40 border border-border/40 flex items-center justify-between text-xs">
                <span className="text-text-secondary text-[11px]">
                  {isVi ? "🎤 Thời lượng nói TB:" : "🎤 Avg speaking time:"}
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
                  ${isVi ? "🎧 Số lần nghe lại:" : "🎧 Audio replay count:"}
                </span>
                <span className="font-bold text-text-primary">
                  {advancedInsights.behavioral_metrics.listening.avg_replays > 0
                    ? `${advancedInsights.behavioral_metrics.listening.avg_replays} {isVi ? "lần/câu" : "replays/item"}`
                    : (isVi ? "1.0 lần" : "1.0 time")}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card className="dashboard-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <Clock size={16} className="text-primary" />
              <span>{isVi ? "Lịch sử Luyện tập Gần đây (Recent Practice History)" : "Recent Practice History"}</span>
            </h4>
            <p className="text-[11px] text-text-tertiary">
              {isVi ? "Các bài tập và câu hỏi bạn vừa hoàn thành trong các phiên gần nhất" : "Exercises and questions you have completed in recent sessions"}
            </p>
          </div>
          <Button
            onClick={() => onNavigate("/practice/mistakes")}
            variant="outline"
            className="text-xs px-3 py-1.5 rounded-lg border-border hover:border-primary cursor-pointer text-text-secondary hover:text-primary"
          >
            <span>{isVi ? "Mở sổ tay lỗi sai" : "Open Mistake Vault"}</span>
            <ChevronRight size={12} className="ml-1" />
          </Button>
        </div>

        {recentHistory.length === 0 ? (
          <div className="text-center py-8 text-xs text-text-tertiary border border-dashed border-border rounded-xl">
            ${isVi ? "Chưa có lịch sử làm bài gần đây. Hãy chọn một bài luyện tập để bắt đầu!" : "No recent practice history. Pick an exercise to get started!"}
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
                        ? (isVi ? "Xem lại" : "Review")
                        : item.skill === "pronunciation"
                        ? (isVi ? "Luyện âm này" : "Practice Sound")
                        : (isVi ? "Ôn câu này" : "Review Question")}
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
