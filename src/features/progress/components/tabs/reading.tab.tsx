"use client";

import {
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import type {
  SkillStats,
  PracticeDashboardData,
} from "@/features/progress/services/progress.service";
import { formatTrendName, formatDimensionName } from "@/features/progress/components/progress.helpers";

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
  const readingBehavior = dashboardData?.growth_analytics?.advanced_insights?.behavioral_metrics?.reading;
  const overallReading = Math.round(stats?.accuracy ?? 0);
  const totalPassages = stats?.total_attempts ?? 0;
  const totalQuestions = stats?.total_questions ?? 0;
  const readingWpm = readingBehavior?.avg_reading_speed_wpm ?? 0;
  const avgTimePerQuestion = readingBehavior?.avg_time_per_question_seconds ?? 0;
  const totalReadingSeconds = readingBehavior?.total_reading_time_seconds ?? 0;
  const totalReadingMinutes = Math.round(totalReadingSeconds / 60);
  const estimatedCefr = "Chưa đủ dữ liệu";
  const loading = false;

  // Sub-skills breakdown
  const dimensionsMap: Record<
    string,
    { accuracy: number; correct: number; total: number }
  > = {};
  if (stats?.by_dimension) Object.assign(dimensionsMap, stats.by_dimension);

  // Filter valid dimensions (exclude generic 'general')
  const validDimensions = Object.entries(dimensionsMap).filter(
    ([key]) => key !== "general"
  );

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
              {totalQuestions > 0 ? `${overallReading}%` : "--"}
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
                : "Chưa có dữ liệu"}
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
              {formatTrendName(stats?.trend)}
            </span>
          </div>
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
                : readingWpm > 0 ? "Đang đọc cẩn trọng" : "Chưa có dữ liệu"}
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


    </div>
  );
}

export default ReadingDetailTab;

