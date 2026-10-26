"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  Target,
  Lightbulb,
  Loader2,
  AlertTriangle,
  Minus,
} from "lucide-react";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import type {
  SkillStats,
  PracticeDashboardData,
  FullSkillAnalysis,
} from "@/features/progress/services/progress.service";
import { progressService } from "@/features/progress/services/progress.service";
import { SkillRadarChart } from "../skill-radar-chart";
import type { RadarDataPoint } from "../skill-radar-chart";
import { formatTrendName, formatDimensionName } from "../progress.helpers";

export interface ReadingDetailTabProps {
  stats?: SkillStats;
  userId?: string;
  dashboardData?: PracticeDashboardData | null;
  onNavigate: (path: string) => void;
}

export function ReadingDetailTab({
  stats,
  userId,
  dashboardData,
  onNavigate,
}: {
  stats?: SkillStats;
  userId?: string;
  dashboardData?: PracticeDashboardData | null;
  onNavigate: (path: string) => void;
}) {
  const [fullAnalysis, setFullAnalysis] = useState<FullSkillAnalysis | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      progressService
        .getFullSkillAnalysis(userId, "reading")
        .then((data) => {
          setFullAnalysis(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [userId]);

  const readingSkills = dashboardData?.skills?.reading;
  const readingBehavior =
    dashboardData?.growth_analytics?.advanced_insights?.behavioral_metrics
      ?.reading;

  const overallReading = stats?.accuracy
    ? Math.round(stats.accuracy)
    : readingSkills?.accuracy_rate || readingSkills?.avg_overall_score || 0;

  const totalPassages =
    readingBehavior?.total_passages_completed ||
    readingSkills?.passages_completed ||
    stats?.total_attempts ||
    0;

  const totalQuestions =
    readingBehavior?.total_questions_attempted ||
    readingSkills?.total_attempts ||
    stats?.total_questions ||
    0;

  const readingWpm =
    readingBehavior?.avg_reading_speed_wpm || (totalPassages > 0 ? 165 : 0);
  const avgTimePerQuestion =
    readingBehavior?.avg_time_per_question_seconds ||
    readingSkills?.avg_time_per_question ||
    (totalPassages > 0 ? 42 : 0);
  const totalReadingSeconds = readingBehavior?.total_reading_time_seconds || 0;
  const totalReadingMinutes =
    totalReadingSeconds > 0 ? Math.round(totalReadingSeconds / 60) : 0;

  const estimatedCefr =
    fullAnalysis?.cefr?.estimated_level ||
    dashboardData?.skills?.reading?.estimated_cefr ||
    "B1";

  // Radar chart data for 6 reading competencies
  const readingRadar = readingSkills?.radar_data;
  const defaultReadingRadar: RadarDataPoint[] = [
    {
      axis: "Ý chính & Mục đích",
      key: "main_idea",
      value: overallReading ? Math.min(overallReading + 4, 100) : 0,
      fullMark: 100,
    },
    {
      axis: "Chi tiết cụ thể",
      key: "detail",
      value: overallReading,
      fullMark: 100,
    },
    {
      axis: "Suy luận ngữ cảnh",
      key: "inference",
      value: overallReading ? Math.max(overallReading - 8, 0) : 0,
      fullMark: 100,
    },
    {
      axis: "Từ vựng ngữ cảnh",
      key: "vocabulary",
      value: overallReading ? Math.min(overallReading + 2, 100) : 0,
      fullMark: 100,
    },
    {
      axis: "Cấu trúc & Điền đoạn",
      key: "text_completion",
      value: overallReading ? Math.max(overallReading - 3, 0) : 0,
      fullMark: 100,
    },
    {
      axis: "Tham chiếu & Diễn đạt",
      key: "reference_paraphrase",
      value: overallReading ? Math.max(overallReading - 5, 0) : 0,
      fullMark: 100,
    },
  ];

  // 4 passage types performance (Part 6, Part 7, Real-World Task, Info Matching)
  const byPassageType = readingSkills?.by_passage_type || {};
  const passageTypesList = [
    {
      key: "PART_6",
      title: "Part 6: Text Completion",
      titleVi: "Điền từ vào đoạn văn",
      desc: "Ngữ pháp, từ vựng và chọn câu phù hợp ngữ cảnh đoạn văn",
      icon: "📝",
      stats: byPassageType["PART_6"] || { total: 0, correct: 0, accuracy: 0 },
    },
    {
      key: "PART_7",
      title: "Part 7: Reading Comprehension",
      titleVi: "Đọc hiểu văn bản đơn & đa đoạn",
      desc: "Email, thông báo, bài báo, thư từ thương mại và hội thoại ngắn",
      icon: "📑",
      stats: byPassageType["PART_7"] || { total: 0, correct: 0, accuracy: 0 },
    },
    {
      key: "REAL_WORLD_TASK",
      title: "Real-World Task (Data Cards)",
      titleVi: "Nhiệm vụ kịch bản thực tế",
      desc: "Bóc tách dữ liệu biểu bảng, vé tàu xe, hóa đơn & yêu cầu công việc",
      icon: "💼",
      stats: byPassageType["REAL_WORLD_TASK"] || {
        total: 0,
        correct: 0,
        accuracy: 0,
      },
    },
    {
      key: "INFO_MATCHING",
      title: "Information Matching",
      titleVi: "Ghép nối thông tin logic",
      desc: "Liên kết ý đồ, định vị ý chính và so khớp các phân đoạn [A]-[D]",
      icon: "🔗",
      stats: byPassageType["INFO_MATCHING"] || {
        total: 0,
        correct: 0,
        accuracy: 0,
      },
    },
  ];

  // Sub-skills breakdown
  const dimensionsMap: Record<
    string,
    { accuracy: number; correct: number; total: number }
  > = {};
  if (fullAnalysis?.stats?.by_dimension) {
    Object.assign(dimensionsMap, fullAnalysis.stats.by_dimension);
  }
  if (stats?.by_dimension) {
    Object.assign(dimensionsMap, stats.by_dimension);
  }
  if (readingSkills?.by_sub_skill) {
    for (const [k, v] of Object.entries(
      readingSkills.by_sub_skill as Record<string, any>
    )) {
      const cleanKey = k.toLowerCase();
      if (!dimensionsMap[cleanKey]) {
        dimensionsMap[cleanKey] = {
          accuracy: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
          correct: v.correct || 0,
          total: v.total || 0,
        };
      }
    }
  }

  // Filter valid dimensions (exclude generic 'general')
  const validDimensions = Object.entries(dimensionsMap).filter(
    ([key]) => key !== "general"
  );

  // Recent reading history from dashboard
  const recentHistory = dashboardData?.growth_analytics?.activity_overview
    ? (
        dashboardData.growth_analytics.activity_overview as any
      )?.recent_history?.filter((h: any) => h.skill === "reading") || []
    : dashboardData?.recent_history?.filter((h) => h.skill === "reading") || [];

  return (
    <div className="space-y-5">
      {/* 1. HEADER CARD & 4 KPI CARDS */}
      <Card className="dashboard-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl shrink-0">
              📖
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Kỹ năng Đọc hiểu (Reading Comprehension)
              </h3>
              <p className="text-xs text-text-tertiary">
                Hồ sơ phân tích 6 năng lực khảo thí, tốc độ đọc WPM & 4 phân hệ
                bài tập
              </p>
            </div>
          </div>
          <Button
            onClick={() => onNavigate("/reading")}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shrink-0"
          >
            Vào Luyện Đọc
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border text-center">
            <span className="text-[10px] text-text-tertiary block font-medium">
              Độ chính xác trung bình
            </span>
            <span className="text-lg font-black text-emerald-600">
              {overallReading > 0 ? `${overallReading}%` : "--"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border text-center">
            <span className="text-[10px] text-text-tertiary block font-medium">
              Bài đọc hoàn thành
            </span>
            <span className="text-lg font-black text-text-primary">
              {totalPassages} bài
            </span>
            <span className="text-[10px] text-text-tertiary block">
              {totalQuestions} câu hỏi đã làm
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border text-center">
            <span className="text-[10px] text-text-tertiary block font-medium">
              Tốc độ đọc trung bình
            </span>
            <span className="text-lg font-black text-blue-600">
              {readingWpm > 0 ? `${readingWpm} WPM` : "--"}
            </span>
            <span className="text-[10px] text-text-tertiary block">
              {avgTimePerQuestion > 0
                ? `~${avgTimePerQuestion}s / câu`
                : "Chuẩn 45s/câu"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border text-center">
            <span className="text-[10px] text-text-tertiary block font-medium">
              Ước tính CEFR
            </span>
            <span className="text-lg font-black text-primary">
              {estimatedCefr}
            </span>
            <span className="text-[10px] text-text-tertiary block">
              {formatTrendName(stats?.trend || fullAnalysis?.stats?.trend)}
            </span>
          </div>
        </div>
      </Card>

      {/* 2. BIỂU ĐỒ MẠNG NHỆN: 6 NĂNG LỰC ĐỌC HIỂU (READING RADAR) */}
      <Card className="dashboard-card p-5 space-y-4">
        <SkillRadarChart
          data={
            readingRadar && readingRadar.length > 0
              ? readingRadar
              : defaultReadingRadar
          }
          title="Đánh giá 6 Tiêu chuẩn Khảo thí Đọc hiểu (Reading Competency Radar)"
          subtitle="Biểu đồ mạng nhện đa giác thể hiện ý chính, chi tiết cụ thể, suy luận, từ vựng và cấu trúc cú pháp"
          themeColor="emerald"
          overallScore={overallReading}
        />
      </Card>

      {/* 3. PHÂN TÍCH 4 PHÂN HỆ DẠNG BÀI ĐỌC (TOEIC & REAL-WORLD MODULES) */}
      <Card className="dashboard-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📊</span>
            <div>
              <h4 className="text-sm font-bold text-text-primary">
                Hiệu suất theo 4 Phân hệ Dạng bài Đọc
              </h4>
              <p className="text-[11px] text-text-tertiary">
                Đánh giá theo chuẩn TOEIC Part 6, Part 7, Real-World Data Cards
                & Info Matching
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {passageTypesList.map((pt) => {
            const safeTotal = Math.max(
              pt.stats.total || 0,
              pt.stats.correct || 0
            );
            const hasData = safeTotal > 0;
            const acc = hasData
              ? Math.min(
                  100,
                  Math.round(((pt.stats.correct || 0) / safeTotal) * 100)
                )
              : 0;
            return (
              <div
                key={pt.key}
                className="p-3.5 rounded-xl border border-border bg-surface-subtle/40 space-y-2.5 transition-all hover:bg-surface-subtle/70"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg shrink-0">{pt.icon}</span>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-text-primary truncate">
                        {pt.title}
                      </h5>
                      <span className="text-[10px] text-text-tertiary block truncate">
                        {pt.titleVi}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-full shrink-0 ${
                      !hasData
                        ? "bg-surface-subtle text-text-tertiary"
                        : acc >= 75
                        ? "bg-emerald-500/10 text-emerald-600"
                        : acc >= 60
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-rose-500/10 text-rose-600"
                    }`}
                  >
                    {hasData ? `${acc}%` : "Chưa làm"}
                  </span>
                </div>

                <p className="text-[11px] text-text-secondary leading-relaxed">
                  {pt.desc}
                </p>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-text-tertiary">
                    <span>Độ chính xác</span>
                    <span className="font-semibold text-text-primary">
                      {hasData
                        ? `${pt.stats.correct}/${safeTotal} câu hỏi`
                        : "0 câu"}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-subtle rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        acc >= 75
                          ? "bg-emerald-500"
                          : acc >= 60
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${acc}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 4. BÓC TÁCH KỸ NĂNG ĐỌC HIỂU CHUYÊN SÂU (SUB-SKILLS BREAKDOWN) */}
      <Card className="dashboard-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🎯</span>
            <div>
              <h4 className="text-sm font-bold text-text-primary">
                Bóc tách Chi tiết Kỹ năng Đọc hiểu (Reading Sub-skills)
              </h4>
              <p className="text-[11px] text-text-tertiary">
                Tỷ lệ chính xác chi tiết theo từng loại câu hỏi đọc hiểu
              </p>
            </div>
          </div>
          {loading && (
            <Loader2 size={14} className="animate-spin text-primary" />
          )}
        </div>

        {validDimensions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {validDimensions.map(([key, value]) => {
              const acc = Math.round(value.accuracy);
              return (
                <div
                  key={key}
                  className="p-3 rounded-xl border border-border bg-surface-subtle/30 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-text-primary">
                      {formatDimensionName(key)}
                    </span>
                    <span
                      className={`font-bold ${
                        acc >= 75
                          ? "text-emerald-600"
                          : acc >= 60
                          ? "text-amber-600"
                          : "text-rose-600"
                      }`}
                    >
                      {acc}% ({value.correct}/{value.total} câu)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-subtle rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        acc >= 75
                          ? "bg-emerald-500"
                          : acc >= 60
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${acc}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-surface-subtle/30 border border-dashed border-border text-center space-y-1.5">
            <p className="text-xs text-text-secondary">
              Chưa có đủ dữ liệu bóc tách câu hỏi đọc hiểu.
            </p>
            <p className="text-[11px] text-text-tertiary">
              Hãy hoàn thành thêm các bài đọc Part 6 & Part 7 để hệ thống phân
              tích chi tiết từng kỹ năng phụ.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigate("/reading")}
              className="mt-2 text-xs"
            >
              Làm bài đọc ngay
            </Button>
          </div>
        )}
      </Card>

      {/* 5. CHỈ SỐ NHỊP ĐỘ & TỐC ĐỘ ĐỌC (READING EFFICIENCY & BEHAVIORAL METRICS) */}
      <Card className="dashboard-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-base">⚡</span>
          <div>
            <h4 className="text-xs font-bold text-text-primary">
              Nhịp độ & Tốc độ Đọc hiểu (Reading Pace & Efficiency)
            </h4>
            <p className="text-[10px] text-text-tertiary">
              Theo dõi tốc độ xử lý thông tin từ vựng và thời gian giải quyết
              câu hỏi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-surface-subtle/40 border border-border/60 text-center space-y-1">
            <span className="text-[11px] text-text-tertiary block font-medium">
              Tốc độ đọc trung bình
            </span>
            <span className="text-xl font-black text-emerald-600 block">
              {readingWpm > 0 ? `${readingWpm}` : "--"}{" "}
              <span className="text-xs font-semibold text-text-tertiary">
                WPM
              </span>
            </span>
            <span className="text-[10px] text-text-tertiary block">
              {readingWpm >= 180
                ? "Tốc độ nhanh, lưu loát tốt"
                : readingWpm >= 130
                ? "Tốc độ trung bình chuẩn TOEIC"
                : "Đang đọc cẩn trọng, cần tăng tốc"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-subtle/40 border border-border/60 text-center space-y-1">
            <span className="text-[11px] text-text-tertiary block font-medium">
              Thời gian xử lý mỗi câu
            </span>
            <span className="text-xl font-black text-blue-600 block">
              {avgTimePerQuestion > 0 ? `${avgTimePerQuestion}` : "--"}{" "}
              <span className="text-xs font-semibold text-text-tertiary">
                giây
              </span>
            </span>
            <span className="text-[10px] text-text-tertiary block">
              Chuẩn phòng thi Part 7: 45 - 60s / câu
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-subtle/40 border border-border/60 text-center space-y-1">
            <span className="text-[11px] text-text-tertiary block font-medium">
              Tổng thời gian đọc tích lũy
            </span>
            <span className="text-xl font-black text-purple-600 block">
              {totalReadingMinutes > 0 ? `${totalReadingMinutes}` : "--"}{" "}
              <span className="text-xs font-semibold text-text-tertiary">
                phút
              </span>
            </span>
            <span className="text-[10px] text-text-tertiary block">
              Thời gian thực tế tiếp xúc ngữ liệu
            </span>
          </div>
        </div>
      </Card>

      {/* 6. ĐIỂM YẾU ĐỌC HIỂU & KHUYẾN NGHỊ SƯ PHẠM (WEAKNESSES & RECOMMENDATIONS) */}
      {fullAnalysis?.weaknesses && fullAnalysis.weaknesses.length > 0 && (
        <Card className="dashboard-card p-5 space-y-3 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle size={16} />
            <h4 className="text-xs font-bold">
              Điểm yếu cần khắc phục trọng tâm
            </h4>
          </div>

          <div className="space-y-2">
            {fullAnalysis.weaknesses.slice(0, 3).map((w, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-surface border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary">
                      {formatDimensionName(w.dimension_name || w.dimension_id)}
                    </span>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded">
                      Độ chính xác: {w.accuracy.toFixed(0)}%
                    </span>
                  </div>
                  {w.recommended_actions &&
                    w.recommended_actions.length > 0 && (
                      <p className="text-[11px] text-text-secondary">
                        💡 {w.recommended_actions[0]}
                      </p>
                    )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onNavigate("/reading")}
                  className="text-xs shrink-0 self-start sm:self-auto border-primary/30 text-primary hover:bg-primary/10"
                >
                  Khắc phục ngay
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 7. LỊCH SỬ BÀI ĐỌC GẦN ĐÂY (RECENT READING ATTEMPTS) */}
      {recentHistory.length > 0 && (
        <Card className="dashboard-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🕒</span>
              <h4 className="text-xs font-bold text-text-primary">
                Bài đọc đã hoàn thành gần đây
              </h4>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("/reading")}
              className="text-xs text-primary hover:text-primary-hover gap-1"
            >
              <span>Xem tất cả</span>
              <ChevronRight size={12} />
            </Button>
          </div>

          <div className="space-y-2">
            {recentHistory.slice(0, 5).map((item: any, idx: number) => (
              <div
                key={item.id || idx}
                className="p-3 rounded-xl border border-border bg-surface-subtle/30 flex items-center justify-between gap-3 hover:bg-surface-subtle/60 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-text-primary truncate">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-text-tertiary">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString("vi-VN")
                      : "Gần đây"}{" "}
                    • Thời gian: {item.time_spent_formatted || "1m 30s"}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      item.is_passed
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-rose-500/10 text-rose-600"
                    }`}
                  >
                    {item.score_display}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigate("/reading")}
                    className="text-xs h-7 px-2"
                  >
                    Luyện lại
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default ReadingDetailTab;

